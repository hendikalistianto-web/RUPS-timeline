// @ts-nocheck
import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Info,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Plus,
  Building,
  FileText,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  ArrowRight,
  Zap,
  Target,
} from "lucide-react";

// --- Fungsi Utilitas Tanggal & Replika Excel WORKDAY ---
const parseDateStr = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

const toDateStr = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addCalendarDays = (dateStr, days) => {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
};

const isOffDay = (dateObj, holidaysArray) => {
  const day = dateObj.getDay();
  if (day === 0 || day === 6) return true;
  return holidaysArray.includes(toDateStr(dateObj));
};

const excelWorkday = (startDateStr, days, holidaysArray) => {
  let dateObj = parseDateStr(startDateStr);
  let added = 0;
  const step = days > 0 ? 1 : -1;
  const target = Math.abs(days);

  if (target === 0) {
    while (isOffDay(dateObj, holidaysArray)) {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    return toDateStr(dateObj);
  }

  while (added < target) {
    dateObj.setDate(dateObj.getDate() + step);
    if (!isOffDay(dateObj, holidaysArray)) {
      added++;
    }
  }
  return toDateStr(dateObj);
};

const formatTanggal = (dateStr) => {
  if (!dateStr) return "-";
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return parseDateStr(dateStr).toLocaleDateString("id-ID", options);
};

const calculateClosestRUPS = (targetOjkStr, holidaysArr) => {
  if (!targetOjkStr) return null;
  let currentD18Str = excelWorkday(
    addCalendarDays(targetOjkStr, 35),
    1,
    holidaysArr
  );

  for (let i = 0; i < 40; i++) {
    const testD16 = excelWorkday(
      addCalendarDays(currentD18Str, -21),
      -1,
      holidaysArr
    );
    const testD12 = excelWorkday(
      addCalendarDays(testD16, -14),
      -1,
      holidaysArr
    );
    const testOJK = excelWorkday(testD12, -5, holidaysArr);

    if (
      parseDateStr(testOJK).getTime() >= parseDateStr(targetOjkStr).getTime()
    ) {
      return currentD18Str;
    }
    currentD18Str = excelWorkday(currentD18Str, 1, holidaysArr);
  }
  return null;
};

const monthMap = {
  januari: "01",
  jan: "01",
  februari: "02",
  feb: "02",
  maret: "03",
  mar: "03",
  april: "04",
  apr: "04",
  mei: "05",
  juni: "06",
  jun: "06",
  juli: "07",
  jul: "07",
  agustus: "08",
  agu: "08",
  aug: "08",
  september: "09",
  sep: "09",
  oktober: "10",
  okt: "10",
  oct: "10",
  november: "11",
  nov: "11",
  desember: "12",
  des: "12",
  dec: "12",
};

const defaultHolidays = [
  "2026-01-01",
  "2026-01-16",
  "2026-02-16",
  "2026-02-17",
  "2026-03-18",
  "2026-03-19",
  "2026-03-20",
  "2026-03-23",
  "2026-03-24",
  "2026-04-03",
  "2026-05-01",
  "2026-05-14",
  "2026-05-15",
  "2026-05-27",
  "2026-06-01",
  "2026-06-16",
  "2026-08-17",
  "2026-08-25",
  "2026-12-24",
  "2026-12-25",
];

export default function App() {
  const [rupsDate, setRupsDate] = useState("2026-05-11");
  const [ojkBaseDate, setOjkBaseDate] = useState("2026-03-11");
  const [holidays, setHolidays] = useState(defaultHolidays.sort());
  const [newHoliday, setNewHoliday] = useState("");
  const [showHolidays, setShowHolidays] = useState(false);
  const [showDividen, setShowDividen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!rupsDate) return;
    if (isOffDay(parseDateStr(rupsDate), holidays)) {
      const validWorkday = excelWorkday(rupsDate, 0, holidays);
      setRupsDate(validWorkday);
      showToast(
        "Tanggal Acara RUPS otomatis digeser karena jatuh pada Akhir Pekan / Hari Libur.",
        "alert"
      );
    }
  }, [rupsDate, holidays]);

  const closestRupsDate = useMemo(() => {
    return calculateClosestRUPS(ojkBaseDate, holidays);
  }, [ojkBaseDate, holidays]);

  const timeline = useMemo(() => {
    if (!rupsDate) return [];

    const D18 = rupsDate;
    const D16 = excelWorkday(addCalendarDays(D18, -21), -1, holidays);
    const D12 = excelWorkday(addCalendarDays(D16, -14), -1, holidays);
    const D19 = excelWorkday(D18, 2, holidays);
    const D27 = excelWorkday(D18, 8, holidays);
    const D22 = excelWorkday(D27, -2, holidays);
    const D23 = D27;

    const pemberitahuanOJK = excelWorkday(D12, -5, holidays);
    const perubahanMataAcara = excelWorkday(
      addCalendarDays(D16, -6),
      -1,
      holidays
    );
    const recDateRUPS = excelWorkday(D16, -1, holidays);
    const risalahLengkap = excelWorkday(addCalendarDays(D18, 29), 1, holidays);
    const exReguler = excelWorkday(D22, 1, holidays);
    const exTunai = excelWorkday(D23, 1, holidays);
    const pembayaranDividen = excelWorkday(D19, 30, holidays);

    const events = [
      {
        id: "pra-1",
        date: pemberitahuanOJK,
        title: "Surat Pemberitahuan Rencana RUPS kepada OJK dan BEI",
        desc: "5 bursa kerja sebelum iklan Pengumuman RUPS",
        category: "pra",
      },
      {
        id: "pra-2",
        date: D12,
        title:
          "Pengumuman RUPS, Website IDX, Website KSEI, dan Website Perseroan",
        desc: "14 hari sebelum iklan panggilan dengan tidak memperhitungkan tgl Iklan Pemanggilan dan tgl Pengumuman",
        category: "pra",
      },
      {
        id: "pra-3",
        date: perubahanMataAcara,
        title:
          "Akhir Penerimaan usulan tambahan agenda RUPS / Perubahan Mata Acara",
        desc: "7 hari sebelum iklan panggilan",
        category: "pra",
      },
      {
        id: "pra-4",
        date: recDateRUPS,
        title:
          "Tanggal Daftar Pemegang Saham yang Berhak RUPS (recording date)",
        desc: "1 hari sebelum tanggal iklan panggilan",
        category: "pra",
      },
      {
        id: "pra-5",
        date: D16,
        title:
          "Pemanggilan RUPS, Website IDX, Website KSEI, dan Website Perseroan",
        desc: "21 hari sebelum RUPS dengan tidak memperhitungkan tanggal Rapat dan Tanggal Iklan Pemanggilan",
        category: "pra",
      },
      {
        id: "hari-h",
        date: D18,
        title: "PELAKSANAAN RUPS",
        desc: "Pelaksanaan Rapat Umum Pemegang Saham",
        category: "hari-h",
        isMain: true,
      },
      {
        id: "pasca-1",
        date: D19,
        title: "Pengumuman Ringkasan Risalah",
        desc: "2 hari kerja setelah Tanggal RUPS",
        category: "pasca",
      },
      {
        id: "pasca-2",
        date: risalahLengkap,
        title: "Penyampaian Risalah Lengkap",
        desc: "30 hari setelah Tanggal RUPS",
        category: "pasca",
      },
      {
        id: "div-1",
        date: D22,
        title: "Cum Dividen (Reguler & Negosiasi)",
        desc: "2 hari bursa sebelum rec date",
        category: "dividen",
      },
      {
        id: "div-2",
        date: exReguler,
        title: "Ex Dividen (Reguler & Negosiasi)",
        desc: "1 hari bursa setelah cum Pasar Reguler dan Negosiasi",
        category: "dividen",
      },
      {
        id: "div-3",
        date: D23,
        title: "Cum Dividen (Pasar Tunai)",
        desc: "Sama dengan rec date",
        category: "dividen",
      },
      {
        id: "div-4",
        date: D27,
        title: "Recording Date Dividen",
        desc: "8 hari bursa setelah tanggal RUPS",
        category: "dividen-rec",
      },
      {
        id: "div-5",
        date: exTunai,
        title: "Ex Dividen (Pasar Tunai)",
        desc: "1 hari bursa setelah cum Pasar Tunai",
        category: "dividen",
      },
      {
        id: "div-6",
        date: pembayaranDividen,
        title: "Pembayaran Dividen ke Pemegang Saham",
        desc: "Paling lambat 30 hari kalender setelah pengumuman Ringkasan Risalah",
        category: "dividen",
      },
    ];

    const customSortOrder = {
      "Cum Dividen (Reguler & Negosiasi)": 1,
      "Ex Dividen (Reguler & Negosiasi)": 2,
      "Recording Date Dividen": 3,
      "Cum Dividen (Pasar Tunai)": 4,
      "Ex Dividen (Pasar Tunai)": 5,
    };

    return events.sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return (
        (customSortOrder[a.title] || 99) - (customSortOrder[b.title] || 99)
      );
    });
  }, [rupsDate, holidays]);

  const rupsEvents = timeline.filter(
    (item) => item.category !== "dividen" && item.category !== "dividen-rec"
  );
  const dividenEvents = timeline.filter(
    (item) => item.category === "dividen" || item.category === "dividen-rec"
  );

  const addHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      setHolidays([...holidays, newHoliday].sort());
      setNewHoliday("");
      showToast("Berhasil menambahkan 1 hari libur manual.", "success");
    }
  };

  const removeHoliday = (dateToRemove) => {
    setHolidays(holidays.filter((h) => h !== dateToRemove));
  };

  const showToast = (message, type = "success") => {
    setToastMessage({ text: message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/);
      if (lines.length === 0) return;

      const delimiter = lines[0].includes(";")
        ? ";"
        : lines[0].includes("\t")
        ? "\t"
        : ",";
      const headers = lines[0]
        .toLowerCase()
        .split(delimiter)
        .map((h) => h.trim());

      const tglIdx = headers.indexOf("tgl");
      const bulanIdx = headers.indexOf("bulan");
      const tahunIdx = headers.indexOf("tahun");

      let newHolidays = [...holidays];
      let addedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const cols = lines[i].split(delimiter).map((c) => c.trim());
        let dateStr = null;

        if (
          tglIdx > -1 &&
          bulanIdx > -1 &&
          tahunIdx > -1 &&
          cols[tglIdx] &&
          cols[bulanIdx] &&
          cols[tahunIdx]
        ) {
          const tgl = cols[tglIdx].padStart(2, "0");
          const bulanStr = cols[bulanIdx].toLowerCase();
          const bulan = monthMap[bulanStr] || "01";
          const tahun = cols[tahunIdx];
          dateStr = `${tahun}-${bulan}-${tgl}`;
        } else {
          const match = lines[i].match(/\d{4}-\d{2}-\d{2}/);
          if (match) {
            dateStr = match[0];
          }
        }

        if (
          dateStr &&
          !newHolidays.includes(dateStr) &&
          dateStr.match(/^\d{4}-\d{2}-\d{2}$/)
        ) {
          newHolidays.push(dateStr);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        setHolidays(newHolidays.sort());
        showToast(
          `Berhasil menambahkan ${addedCount} hari libur baru dari CSV.`,
          "success"
        );
      } else {
        showToast(
          "Tidak ada tanggal baru / Format CSV tidak dikenali.",
          "error"
        );
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "pra":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "hari-h":
        return "bg-emerald-500 text-white border-emerald-600 shadow-md";
      case "pasca":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "dividen":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "dividen-rec":
        return "bg-indigo-600 text-white border-indigo-700 shadow-md";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "pra":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "hari-h":
        return <Building className="w-6 h-6 text-white" />;
      case "pasca":
        return <CheckCircle className="w-5 h-5 text-amber-600" />;
      case "dividen-rec":
        return <CheckCircle className="w-5 h-5 text-white" />;
      case "dividen":
        return <AlertTriangle className="w-5 h-5 text-purple-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-[96%] mx-auto space-y-6">
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all ${
              toastMessage.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : toastMessage.type === "alert"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <CheckCircle
              className={`w-5 h-5 ${
                toastMessage.type === "error"
                  ? "text-rose-500"
                  : toastMessage.type === "alert"
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}
            />
            {toastMessage.text}
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Building className="w-8 h-8 text-blue-600" />
              Dashboard Timeline RUPS
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              Berdasarkan Peraturan OJK No. 14 Tahun 2025 dan aturan terkait.
            </p>
            <p className="text-sm mt-1 font-medium text-slate-400 flex items-center gap-1">
              Proudly Presented by
              <a
                href="https://www.linkedin.com/in/hendika-listianto-706b27352/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-rose-500 hover:text-rose-400 transition-all duration-300"
                style={{ textShadow: "0 0 10px rgba(244, 63, 94, 0.6)" }}
              >
                hendyka
              </a>
            </p>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 md:p-5 flex flex-col lg:flex-row items-center justify-between gap-5 shadow-inner">
            <div className="w-full lg:w-1/3">
              <label className="block text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Kalkulasi RUPS
                Terdekat
              </label>
              <p className="text-xs text-indigo-700/80 mb-3">
                Tgl Surat Pemberitahuan ke OJK/BEI:
              </p>
              <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 shadow-sm">
                <FileText className="text-indigo-400 w-5 h-5" />
                <input
                  type="date"
                  value={ojkBaseDate}
                  onChange={(e) => setOjkBaseDate(e.target.value)}
                  className="outline-none w-full text-sm font-bold text-indigo-900"
                />
              </div>
            </div>

            <div className="hidden lg:flex shrink-0">
              <ArrowRight className="w-6 h-6 text-indigo-300" />
            </div>

            <div className="w-full lg:flex-1 bg-white border border-indigo-200 rounded-lg p-3 md:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Prakiraan Tgl RUPS Tercepat:
                </span>
                <div className="flex items-center gap-2 text-indigo-900">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <span className="font-extrabold text-lg md:text-xl">
                    {closestRupsDate ? formatTanggal(closestRupsDate) : "-"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (closestRupsDate) {
                    setRupsDate(closestRupsDate);
                    showToast(
                      "Tanggal RUPS berhasil diperbarui sesuai kalkulasi!",
                      "success"
                    );
                  }
                }}
                disabled={!closestRupsDate}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap shrink-0 flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Jadikan Target Acara
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div
                className="p-5 flex justify-between items-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                onClick={() => setShowHolidays(!showHolidays)}
              >
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Daftar Libur Bursa
                </h3>
                {showHolidays ? (
                  <ChevronUp className="text-slate-500" />
                ) : (
                  <ChevronDown className="text-slate-500" />
                )}
              </div>

              {showHolidays && (
                <div className="p-5 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-4">
                    Sabtu dan Minggu otomatis diabaikan sistem.
                  </p>

                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={newHoliday}
                        onChange={(e) => setNewHoliday(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                      <button
                        onClick={addHoliday}
                        disabled={!newHoliday}
                        className="bg-rose-500 text-white p-2 rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors shrink-0"
                        title="Tambah Manual"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <label
                      className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-2 w-full mt-1"
                      title="Upload file CSV Libur"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Upload Excel (CSV) Libur
                      </span>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                    {holidays.length === 0 ? (
                      <p className="text-sm text-center text-slate-400 py-4">
                        Tidak ada hari libur khusus.
                      </p>
                    ) : (
                      holidays.map((date) => (
                        <div
                          key={date}
                          className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-2"
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {formatTanggal(date)}
                          </span>
                          <button
                            onClick={() => removeHoliday(date)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-500" />
                Keterangan Warna
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200"></div>{" "}
                  <span className="text-slate-600 font-medium">
                    Pra-RUPS (Persiapan)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-emerald-500 border border-emerald-600"></div>{" "}
                  <span className="text-slate-600 font-medium">
                    Hari Pelaksanaan RUPS
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200"></div>{" "}
                  <span className="text-slate-600 font-medium">
                    Pasca-RUPS (Pelaporan)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-purple-50 border border-purple-200"></div>{" "}
                  <span className="text-slate-600 font-medium">
                    Jadwal Dividen
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-indigo-600 border border-indigo-700"></div>{" "}
                  <span className="text-slate-600 font-medium">
                    Recording Date Dividen
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">
                  Hasil Kalkulasi Timeline RUPS
                </h2>

                <div className="relative bg-rose-50 border-2 border-rose-300 rounded-xl p-4 w-full md:w-auto shadow-md shrink-0 hover:border-rose-400 hover:shadow-lg transition-all group overflow-hidden">
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm z-10">
                    Klik Untuk Ubah
                  </div>
                  <div className="relative z-20">
                    <label className="block text-xs font-extrabold text-rose-800 uppercase tracking-widest mb-1 cursor-pointer">
                      Rencana Agenda RUPS
                    </label>
                    <div className="flex items-center gap-3 relative cursor-pointer mt-1">
                      <div className="bg-rose-200 p-2 rounded-lg text-rose-700 group-hover:bg-rose-500 group-hover:text-white transition-colors shadow-sm">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <input
                        type="date"
                        value={rupsDate}
                        onChange={(e) => setRupsDate(e.target.value)}
                        className="outline-none w-full font-black text-xl md:text-2xl text-rose-950 bg-transparent cursor-pointer"
                        title="Klik untuk mengubah tanggal RUPS"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wide">
                      <th className="px-5 py-4 font-semibold whitespace-nowrap text-center w-16">
                        No
                      </th>
                      <th className="px-5 py-4 font-semibold min-w-[250px] w-1/4">
                        Kegiatan
                      </th>
                      <th className="px-5 py-4 font-semibold min-w-[350px] w-2/4">
                        Keterangan
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        Tanggal
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rupsEvents.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b border-slate-200 transition-colors hover:opacity-95 ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        <td className="px-5 py-4 whitespace-nowrap font-bold text-center opacity-70">
                          {index + 1}
                        </td>
                        <td className="px-5 py-4 font-bold text-sm md:text-base leading-snug">
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 mt-0.5">
                              {getCategoryIcon(item.category)}
                            </span>
                            <span className={item.isMain ? "text-white" : ""}>
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-5 py-4 text-xs md:text-sm leading-relaxed ${
                            item.isMain
                              ? "font-medium text-slate-100"
                              : "text-slate-700 font-semibold"
                          }`}
                        >
                          {item.desc}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-top">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                              item.isMain
                                ? "bg-white/20 text-white"
                                : "bg-white/70 shadow-sm text-inherit"
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                            {formatTanggal(item.date)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tbody>
                    <tr
                      onClick={() => setShowDividen(!showDividen)}
                      className="bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group border-b border-slate-200"
                    >
                      <td colSpan="4" className="px-5 py-5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shadow-sm">
                              <AlertTriangle className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800">
                                Jadwal Pembagian Dividen
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Klik untuk{" "}
                                {showDividen ? "menyembunyikan" : "menampilkan"}{" "}
                                6 jadwal dividen.
                              </p>
                            </div>
                          </div>
                          <div className="text-slate-400 group-hover:text-purple-600 bg-white p-2 border rounded-lg shadow-sm">
                            {showDividen ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>

                  {showDividen && (
                    <tbody>
                      {dividenEvents.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-b last:border-0 transition-colors hover:opacity-95 ${getCategoryColor(
                            item.category
                          )}`}
                        >
                          <td className="px-5 py-4 whitespace-nowrap font-bold text-center opacity-70">
                            {rupsEvents.length + index + 1}
                          </td>
                          <td className="px-5 py-4 font-bold text-sm md:text-base leading-snug">
                            <div className="flex items-start gap-2.5">
                              <span className="shrink-0 mt-0.5">
                                {getCategoryIcon(item.category)}
                              </span>
                              <span
                                className={
                                  item.category === "dividen-rec"
                                    ? "text-white"
                                    : ""
                                }
                              >
                                {item.title}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`px-5 py-4 text-xs md:text-sm leading-relaxed ${
                              item.category === "dividen-rec"
                                ? "font-medium text-slate-100"
                                : "text-slate-700 font-semibold"
                            }`}
                          >
                            {item.desc}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap align-top">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                                item.category === "dividen-rec"
                                  ? "bg-white/20 text-white"
                                  : "bg-white/70 shadow-sm text-inherit"
                              }`}
                            >
                              <Calendar className="w-4 h-4" />
                              {formatTanggal(item.date)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

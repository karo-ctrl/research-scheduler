"use client";
import { useState, useMemo } from "react";

const COLORS = [
  { bg: "#E8F4FD", border: "#2196F3", text: "#1565C0", dot: "#2196F3" },
  { bg: "#FFF3E0", border: "#FF9800", text: "#E65100", dot: "#FF9800" },
  { bg: "#F3E5F5", border: "#9C27B0", text: "#6A1B9A", dot: "#9C27B0" },
  { bg: "#E8F5E9", border: "#4CAF50", text: "#2E7D32", dot: "#4CAF50" },
  { bg: "#FCE4EC", border: "#E91E63", text: "#AD1457", dot: "#E91E63" },
  { bg: "#FFF8E1", border: "#FFC107", text: "#F57F17", dot: "#FFC107" },
  { bg: "#E0F7FA", border: "#00BCD4", text: "#006064", dot: "#00BCD4" },
  { bg: "#EFEBE9", border: "#795548", text: "#4E342E", dot: "#795548" },
];

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, days) {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function dateKey(d) {
  return formatDate(d);
}

function getWorkDates(startDate, offsets) {
  return offsets.map((o) => addDays(startDate, o - 1));
}

function getStartFromEnd(endDate, offsets) {
  const maxOffset = Math.max(...offsets);
  return addDays(endDate, -(maxOffset - 1));
}

const defaultStudies = [
  {
    id: 1,
    name: "研究A（例）",
    offsets: [1, 2, 5, 6, 9, 10, 11, 12],
    mode: "start",
    dateInput: formatDate(new Date()),
  },
];

export default function ResearchScheduler() {
  const [studies, setStudies] = useState(defaultStudies);
  const [nextId, setNextId] = useState(2);
  const [calMonth, setCalMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOffsets, setNewOffsets] = useState("");
  const [newMode, setNewMode] = useState("start");
  const [newDate, setNewDate] = useState(formatDate(new Date()));

  const studySchedules = useMemo(() => {
    return studies.map((s, idx) => {
      const color = COLORS[idx % COLORS.length];
      let startDate;
      if (s.mode === "start") {
        startDate = parseDate(s.dateInput);
      } else {
        startDate = getStartFromEnd(parseDate(s.dateInput), s.offsets);
      }
      const workDates = getWorkDates(startDate, s.offsets);
      const endDate = workDates[workDates.length - 1];
      return { ...s, color, startDate, endDate, workDates };
    });
  }, [studies]);

  const calendarMap = useMemo(() => {
    const map = {};
    studySchedules.forEach((sched) => {
      sched.workDates.forEach((d, i) => {
        const k = dateKey(d);
        if (!map[k]) map[k] = [];
        map[k].push({
          studyId: sched.id,
          name: sched.name,
          color: sched.color,
          dayLabel: `Day${sched.offsets[i]}`,
        });
      });
    });
    return map;
  }, [studySchedules]);

  const calDays = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startPad; i++) {
      const d = addDays(firstDay, -(startPad - i));
      days.push({ date: d, inMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), inMonth: true });
    }
    while (days.length % 7 !== 0) {
      days.push({ date: addDays(lastDay, days.length - startPad - lastDay.getDate() + 1), inMonth: false });
    }
    return days;
  }, [calMonth]);

  const today = formatDate(new Date());

  function addStudy() {
    const parsed = newOffsets
      .split(/[,、\s]+/)
      .map((x) => parseInt(x.trim()))
      .filter((x) => !isNaN(x) && x > 0)
      .sort((a, b) => a - b);
    if (!newName.trim() || parsed.length === 0 || !newDate) return;
    setStudies([...studies, { id: nextId, name: newName.trim(), offsets: parsed, mode: newMode, dateInput: newDate }]);
    setNextId(nextId + 1);
    setNewName("");
    setNewOffsets("");
    setShowAddForm(false);
  }

  function removeStudy(id) {
    setStudies(studies.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function updateStudy(id, field, value) {
    setStudies(studies.map((s) => {
      if (s.id !== id) return s;
      if (field === "offsets") {
        const parsed = value
          .split(/[,、\s]+/)
          .map((x) => parseInt(x.trim()))
          .filter((x) => !isNaN(x) && x > 0)
          .sort((a, b) => a - b);
        return { ...s, offsets: parsed, _offsetsRaw: value };
      }
      return { ...s, [field]: value };
    }));
  }

  function prevMonth() {
    setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1));
  }
  function goToday() {
    setCalMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  }

  const styles = {
    container: {
      fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
      maxWidth: 800,
      margin: "0 auto",
      padding: "12px 16px 40px",
      background: "#FAFBFC",
      minHeight: "100vh",
      color: "#1a1a2e",
    },
    header: {
      textAlign: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: "#1a1a2e",
      margin: 0,
      letterSpacing: "-0.02em",
    },
    subtitle: {
      fontSize: 13,
      color: "#8890a4",
      marginTop: 4,
    },
    section: {
      background: "#fff",
      borderRadius: 14,
      padding: "16px",
      marginBottom: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      border: "1px solid #eef0f4",
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 12,
      color: "#3a3f5c",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    studyCard: (color) => ({
      borderLeft: `4px solid ${color.border}`,
      padding: "12px 14px",
      marginBottom: 10,
      borderRadius: 10,
      background: color.bg + "66",
      position: "relative",
    }),
    studyName: (color) => ({
      fontSize: 15,
      fontWeight: 700,
      color: color.text,
      marginBottom: 6,
    }),
    studyMeta: {
      fontSize: 12,
      color: "#6b7280",
      lineHeight: 1.7,
    },
    dateChips: {
      display: "flex",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 8,
    },
    chip: (color) => ({
      display: "inline-block",
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 8px",
      borderRadius: 6,
      background: color.bg,
      color: color.text,
      border: `1px solid ${color.border}40`,
    }),
    btn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 16px",
      borderRadius: 10,
      border: "none",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.15s",
    },
    btnPrimary: {
      background: "#2563EB",
      color: "#fff",
    },
    btnSecondary: {
      background: "#f1f3f9",
      color: "#4b5563",
    },
    btnDanger: {
      background: "#FEE2E2",
      color: "#DC2626",
    },
    input: {
      width: "100%",
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid #d4d8e1",
      fontSize: 14,
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      color: "#6b7280",
      marginBottom: 4,
      display: "block",
    },
    formRow: {
      marginBottom: 12,
    },
    calNav: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    calNavBtn: {
      background: "#f1f3f9",
      border: "none",
      borderRadius: 8,
      padding: "6px 14px",
      fontSize: 16,
      cursor: "pointer",
      fontWeight: 600,
      color: "#4b5563",
    },
    calMonthLabel: {
      fontSize: 16,
      fontWeight: 700,
      color: "#1a1a2e",
    },
    calGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: 2,
    },
    calHeader: {
      textAlign: "center",
      fontSize: 11,
      fontWeight: 700,
      padding: "6px 0",
      color: "#9ca3af",
    },
    calCell: (inMonth, isToday, isWeekend) => ({
      minHeight: 64,
      padding: "3px 4px",
      borderRadius: 8,
      background: isToday ? "#EFF6FF" : inMonth ? "#fff" : "#f9fafb",
      border: isToday ? "2px solid #2563EB" : "1px solid #f0f0f3",
      opacity: inMonth ? 1 : 0.4,
      position: "relative",
    }),
    calDate: (isToday, isSunday, isSaturday) => ({
      fontSize: 12,
      fontWeight: isToday ? 800 : 600,
      color: isToday ? "#2563EB" : isSunday ? "#DC2626" : isSaturday ? "#2563EB" : "#374151",
      marginBottom: 2,
    }),
    calDot: (color) => ({
      display: "block",
      fontSize: 9,
      fontWeight: 700,
      lineHeight: 1.3,
      padding: "1px 4px",
      borderRadius: 4,
      background: color.bg,
      color: color.text,
      marginBottom: 1,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),
    modeToggle: {
      display: "flex",
      gap: 0,
      borderRadius: 8,
      overflow: "hidden",
      border: "1px solid #d4d8e1",
    },
    modeBtn: (active) => ({
      flex: 1,
      padding: "7px 12px",
      fontSize: 12,
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      background: active ? "#2563EB" : "#fff",
      color: active ? "#fff" : "#6b7280",
      transition: "all 0.15s",
    }),
    editRow: {
      display: "flex",
      gap: 6,
      alignItems: "center",
      marginTop: 8,
    },
    removeBtn: {
      position: "absolute",
      top: 8,
      right: 8,
      background: "none",
      border: "none",
      fontSize: 16,
      cursor: "pointer",
      color: "#9ca3af",
      padding: "2px 6px",
      borderRadius: 4,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🔬 研究スケジュール管理</h1>
        <div style={styles.subtitle}>開始日 or 最終日から作業日を自動計算</div>
      </div>

      {/* Studies List */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          📋 登録中の研究
        </div>

        {studies.length === 0 && (
          <div style={{ textAlign: "center", padding: 20, color: "#9ca3af", fontSize: 13 }}>
            研究が未登録です。下の「＋ 研究を追加」から追加してください。
          </div>
        )}

        {studySchedules.map((sched, idx) => {
          const s = studies.find((st) => st.id === sched.id);
          const isEditing = editingId === sched.id;
          return (
            <div key={sched.id} style={styles.studyCard(sched.color)}>
              <button style={styles.removeBtn} onClick={() => removeStudy(sched.id)} title="削除">✕</button>
              <div style={styles.studyName(sched.color)}>{sched.name}</div>
              <div style={styles.studyMeta}>
                <div>📅 モード: {s.mode === "start" ? "開始日指定" : "最終日指定"} → {s.dateInput}</div>
                <div>🗓 開始日: {formatDate(sched.startDate)} → 最終日: {formatDate(sched.endDate)}</div>
                <div>🔢 作業日オフセット: Day {s.offsets.join(", ")}</div>
              </div>
              <div style={styles.dateChips}>
                {sched.workDates.map((d, i) => (
                  <span key={i} style={styles.chip(sched.color)}>
                    {d.getMonth() + 1}/{d.getDate()}({WEEKDAYS[d.getDay()]}) D{sched.offsets[i]}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 8 }}>
                <button
                  style={{ ...styles.btn, ...styles.btnSecondary, padding: "5px 12px", fontSize: 12 }}
                  onClick={() => setEditingId(isEditing ? null : sched.id)}
                >
                  {isEditing ? "閉じる" : "✏️ 編集"}
                </button>
              </div>

              {isEditing && (
                <div style={{ marginTop: 12, padding: "12px", background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                  <div style={styles.formRow}>
                    <label style={styles.label}>研究名</label>
                    <input
                      style={styles.input}
                      value={s.name}
                      onChange={(e) => updateStudy(s.id, "name", e.target.value)}
                    />
                  </div>
                  <div style={styles.formRow}>
                    <label style={styles.label}>作業日オフセット（カンマ区切り）</label>
                    <input
                      style={styles.input}
                      value={s._offsetsRaw !== undefined ? s._offsetsRaw : s.offsets.join(", ")}
                      onChange={(e) => updateStudy(s.id, "offsets", e.target.value)}
                    />
                  </div>
                  <div style={styles.formRow}>
                    <label style={styles.label}>計算モード</label>
                    <div style={styles.modeToggle}>
                      <button
                        style={styles.modeBtn(s.mode === "start")}
                        onClick={() => updateStudy(s.id, "mode", "start")}
                      >
                        開始日から
                      </button>
                      <button
                        style={styles.modeBtn(s.mode === "end")}
                        onClick={() => updateStudy(s.id, "mode", "end")}
                      >
                        最終日から
                      </button>
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <label style={styles.label}>{s.mode === "start" ? "開始日" : "最終日"}</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={s.dateInput}
                      onChange={(e) => updateStudy(s.id, "dateInput", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add form */}
        {!showAddForm ? (
          <button
            style={{ ...styles.btn, ...styles.btnPrimary, width: "100%", justifyContent: "center", marginTop: 6 }}
            onClick={() => setShowAddForm(true)}
          >
            ＋ 研究を追加
          </button>
        ) : (
          <div style={{ padding: 14, background: "#f8fafc", borderRadius: 12, border: "1px solid #e5e7eb", marginTop: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#3a3f5c" }}>新しい研究を追加</div>
            <div style={styles.formRow}>
              <label style={styles.label}>研究名</label>
              <input
                style={styles.input}
                placeholder="例: ラット骨再生実験"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>作業日オフセット（カンマ区切り, 開始日=1）</label>
              <input
                style={styles.input}
                placeholder="例: 1, 2, 5, 6, 9, 10, 11, 12"
                value={newOffsets}
                onChange={(e) => setNewOffsets(e.target.value)}
              />
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                ※ 開始日を1日目として、何日目に作業があるかを入力
              </div>
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>計算モード</label>
              <div style={styles.modeToggle}>
                <button style={styles.modeBtn(newMode === "start")} onClick={() => setNewMode("start")}>
                  開始日から計算
                </button>
                <button style={styles.modeBtn(newMode === "end")} onClick={() => setNewMode("end")}>
                  最終日から逆算
                </button>
              </div>
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>{newMode === "start" ? "開始日" : "最終日"}</label>
              <input
                type="date"
                style={styles.input}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{ ...styles.btn, ...styles.btnPrimary, flex: 1, justifyContent: "center" }}
                onClick={addStudy}
              >
                追加する
              </button>
              <button
                style={{ ...styles.btn, ...styles.btnSecondary }}
                onClick={() => { setShowAddForm(false); setNewName(""); setNewOffsets(""); }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>📆 カレンダー</div>
        <div style={styles.calNav}>
          <button style={styles.calNavBtn} onClick={prevMonth}>◀</button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={styles.calMonthLabel}>
              {calMonth.getFullYear()}年{calMonth.getMonth() + 1}月
            </span>
            <button
              style={{ ...styles.calNavBtn, fontSize: 11, padding: "4px 10px" }}
              onClick={goToday}
            >
              今日
            </button>
          </div>
          <button style={styles.calNavBtn} onClick={nextMonth}>▶</button>
        </div>

        <div style={styles.calGrid}>
          {WEEKDAYS.map((w, i) => (
            <div key={w} style={{ ...styles.calHeader, color: i === 0 ? "#DC2626" : i === 6 ? "#2563EB" : "#9ca3af" }}>
              {w}
            </div>
          ))}
          {calDays.map(({ date, inMonth }, i) => {
            const k = dateKey(date);
            const entries = calendarMap[k] || [];
            const isToday = k === today;
            const dow = date.getDay();
            return (
              <div key={i} style={styles.calCell(inMonth, isToday, dow === 0 || dow === 6)}>
                <div style={styles.calDate(isToday, dow === 0, dow === 6)}>
                  {date.getDate()}
                </div>
                {entries.slice(0, 3).map((e, j) => (
                  <div key={j} style={styles.calDot(e.color)}>
                    {e.name.slice(0, 4)} {e.dayLabel}
                  </div>
                ))}
                {entries.length > 3 && (
                  <div style={{ fontSize: 9, color: "#9ca3af" }}>+{entries.length - 3}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {studySchedules.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {studySchedules.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color.dot }} />
                <span style={{ color: "#4b5563" }}>{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

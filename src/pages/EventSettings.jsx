import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const defaultEvents = [
  { key: "sao", label: "竿", point: 3, active: true },
  { key: "sand_zero", label: "砂ゼロ", point: 8, active: true },
  { key: "sand_one", label: "砂一", point: 3, active: true },
  { key: "diamond", label: "ダイヤモンド", point: 5, active: true },
  { key: "birdie", label: "バーディ", point: 3, active: true },
  { key: "eagle", label: "イーグル", point: 30, active: true },
  { key: "albatross", label: "アルバトロス", point: 50, active: true },
  { key: "holeinone", label: "ホールインワン", point: 100, active: true }
];

export default function EventSettings() {
  const navigate = useNavigate();
  const [events, setEvents] = useState(defaultEvents);
  const [newLabel, setNewLabel] = useState("");
  const [newPoint, setNewPoint] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("olympicEvents");
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch {
        setEvents(defaultEvents);
      }
    }
  }, []);

  const saveEvents = () => {
    localStorage.setItem("olympicEvents", JSON.stringify(events));
    alert("保存しました");
    navigate("/");
  };

  const resetEvents = () => {
    localStorage.setItem("olympicEvents", JSON.stringify(defaultEvents));
    setEvents(defaultEvents);
    alert("初期値に戻しました");
  };

  const addEvent = () => {
    if (!newLabel.trim()) return;
    const item = {
      key: `custom_${Date.now()}`,
      label: newLabel.trim(),
      point: Number(newPoint) || 0,
      active: true
    };
    setEvents([...events, item]);
    setNewLabel("");
    setNewPoint("");
  };

  const updateEvent = (index, field, value) => {
    const copy = [...events];
    copy[index] = { ...copy[index], [field]: value };
    setEvents(copy);
  };

  const deleteEvent = (index) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const pageStyle = {
    maxWidth: 720,
    margin: "0 auto",
    padding: 20,
    fontFamily: "system-ui, sans-serif"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 15,
    cursor: "pointer"
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 15
  };

  return (
    <div style={pageStyle}>
      <h1>役設定</h1>

      <div style={{ display: "grid", gap: 10 }}>
        {events.map((event, index) => (
          <div
            key={event.key}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 70px 70px 60px",
              gap: 8,
              alignItems: "center",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 10
            }}
          >
            <input
              value={event.label}
              onChange={(e) => updateEvent(index, "label", e.target.value)}
              style={inputStyle}
            />

            <input
              type="number"
              value={event.point}
              onChange={(e) =>
                updateEvent(index, "point", Number(e.target.value))
              }
              style={inputStyle}
            />

            <button
              onClick={() => updateEvent(index, "active", !event.active)}
              style={{
                ...buttonStyle,
                padding: "10px 6px",
                background: event.active ? "#16a34a" : "#94a3b8",
                color: "#ffffff",
                border: "none"
              }}
            >
              {event.active ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => deleteEvent(index)}
              style={{
                ...buttonStyle,
                padding: "10px 6px",
                background: "#ef4444",
                color: "#ffffff",
                border: "none"
              }}
            >
              削除
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 24 }}>役を追加</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 90px",
          gap: 8,
          marginBottom: 10
        }}
      >
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="役名"
          style={inputStyle}
        />
        <input
          type="number"
          value={newPoint}
          onChange={(e) => setNewPoint(e.target.value)}
          placeholder="点"
          style={inputStyle}
        />
      </div>

      <button
        onClick={addEvent}
        style={{
          ...buttonStyle,
          background: "#2563eb",
          color: "#ffffff",
          border: "none",
          marginBottom: 12
        }}
      >
        役を追加
      </button>

      <button
        onClick={saveEvents}
        style={{
          ...buttonStyle,
          background: "#16a34a",
          color: "#ffffff",
          border: "none",
          marginBottom: 12
        }}
      >
        保存して戻る
      </button>

      <button
        onClick={resetEvents}
        style={{
          ...buttonStyle,
          background: "#ffffff",
          color: "#2563eb",
          border: "1px solid #93c5fd",
          marginBottom: 12
        }}
      >
        初期値に戻す
      </button>

      <button
        onClick={() => navigate("/")}
        style={{
          ...buttonStyle,
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #cbd5e1"
        }}
      >
        トップへ戻る
      </button>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const defaultEvents = [
  { key: "condor", label: "コンドル", point: 100, active: true, single: true },
  { key: "holeInOne", label: "ホールインワン", point: 100, active: true, single: true },
  { key: "albatross", label: "アルバトロス", point: 50, active: true, single: true },
  { key: "eagle", label: "イーグル", point: 30, active: true, single: true },
  { key: "birdie", label: "バーディ", point: 3, active: true, single: true },
  { key: "diamond", label: "ダイヤモンド", point: 5, active: true, single: false },
  { key: "suna0", label: "砂ゼロ", point: 8, active: true, single: false },
  { key: "suna1", label: "砂一", point: 3, active: true, single: false },
  { key: "sao", label: "竿", point: 3, active: true, single: false }
];

export default function EventSettings() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("events") || "null");
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setEvents(saved);
    } else {
      setEvents(defaultEvents);
      localStorage.setItem("events", JSON.stringify(defaultEvents));
    }
  }, []);

  const toggleActive = (index) => {
    setEvents((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], active: !next[index].active };
      return next;
    });
  };

  const updateLabel = (index, value) => {
    setEvents((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], label: value };
      return next;
    });
  };

  const updatePoint = (index, value) => {
    setEvents((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        point: value === "" ? "" : Number(value)
      };
      return next;
    });
  };

  const toggleSingle = (index) => {
    setEvents((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], single: !next[index].single };
      return next;
    });
  };

  const saveEvents = () => {
    const cleaned = events.map((e, index) => ({
      key: e.key || `custom_${index}`,
      label: e.label || `役${index + 1}`,
      point: Number(e.point) || 0,
      active: !!e.active,
      single: !!e.single
    }));
    localStorage.setItem("events", JSON.stringify(cleaned));
    navigate("/");
  };

  const resetEvents = () => {
    setEvents(defaultEvents);
    localStorage.setItem("events", JSON.stringify(defaultEvents));
  };

  const addEvent = () => {
    setEvents((prev) => [
      ...prev,
      {
        key: `custom_${Date.now()}`,
        label: "新しい役",
        point: 0,
        active: true,
        single: false
      }
    ]);
  };

  const deleteEvent = (index) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
        padding: 12,
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 28,
          padding: 16,
          boxShadow: "0 18px 40px rgba(15,23,42,0.10)"
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            borderRadius: 24,
            padding: 20,
            marginBottom: 16
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.9 }}>EVENT SETTINGS</div>
          <h1 style={{ margin: "6px 0 0 0", fontSize: 30 }}>役をカスタム</h1>
          <div style={{ marginTop: 8, fontSize: 15 }}>
            役名・点数・ON/OFF をここで変更できます
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {events.map((event, index) => (
            <div
              key={event.key}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: 14,
                background: "#f8fafc"
              }}
            >
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                    役名
                  </div>
                  <input
                    type="text"
                    value={event.label}
                    onChange={(e) => updateLabel(index, e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 110px",
                    gap: 10
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                      点数
                    </div>
                    <input
                      type="number"
                      value={event.point}
                      onChange={(e) => updatePoint(index, e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                      ON / OFF
                    </div>
                    <button
                      onClick={() => toggleActive(index)}
                      style={{
                        ...buttonStyle,
                        background: event.active ? "#16a34a" : "#94a3b8",
                        color: "#ffffff",
                        border: "none"
                      }}
                    >
                      {event.active ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10
                  }}
                >
                  <button
                    onClick={() => toggleSingle(index)}
                    style={{
                      ...buttonStyle,
                      background: "#ffffff",
                      color: "#0f172a",
                      border: "1px solid #cbd5e1"
                    }}
                  >
                    {event.single ? "単独系" : "重複可"}
                  </button>

                  <button
                    onClick={() => deleteEvent(index)}
                    style={{
                      ...buttonStyle,
                      background: "#fff5f5",
                      color: "#b91c1c",
                      border: "1px solid #ef4444"
                    }}
                  >
                    この役を削除
                  </button>
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    whiteSpace: "normal",
                    overflowWrap: "break-word"
                  }}
                >
                  {event.single
                    ? "単独系：同時に1つだけ選ぶ役"
                    : "重複可：他の役と同時に選べる役"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
            marginTop: 18
          }}
        >
          <button
            onClick={addEvent}
            style={{
              ...buttonStyle,
              background: "#ffffff",
              color: "#2563eb",
              border: "1px solid #93c5fd"
            }}
          >
            役を追加
          </button>

         <button
  onClick={() => {
    localStorage.setItem("olympicEvents", JSON.stringify(events));
    saveEvents();
  }}
  style={{
    ...buttonStyle,
    background: "#2563eb",
    color: "#ffffff",
    border: "none"
  }}
>
  保存して戻る
</button>
            onClick={resetEvents}
            style={{
              ...buttonStyle,
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #cbd5e1"
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
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 16,
  background: "#ffffff"
};

const buttonStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: "bold",
  fontSize: 15,
  cursor: "pointer"
};
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
    }
  }, []);

  const toggleActive = (index) => {
    setEvents((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], active: !next[index].active };
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

  const saveEvents = () => {
    const cleaned = events.map((e) => ({
      ...e,
      point: Number(e.point) || 0
    }));
    localStorage.setItem("events", JSON.stringify(cleaned));
    navigate("/");
  };

  const resetEvents = () => {
    setEvents(defaultEvents);
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
            表示されない役はここでONにしてください
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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 10
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#0f172a",
                    whiteSpace: "normal",
                    overflowWrap: "break-word"
                  }}
                >
                  {event.label}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px",
                    gap: 10,
                    alignItems: "center"
                  }}
                >
                  <button
                    onClick={() => toggleActive(index)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: event.active ? "#16a34a" : "#94a3b8",
                      color: "#ffffff",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    {event.active ? "ON" : "OFF"}
                  </button>

                  <input
                    type="number"
                    value={event.point}
                    onChange={(e) => updatePoint(index, e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      fontSize: 16,
                      background: "#ffffff"
                    }}
                  />
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
                    ? "この役は単独系です（同時に1つだけ）"
                    : "この役は他の役と同時に選べます"}
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
            onClick={saveEvents}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            保存して戻る
          </button>

          <button
            onClick={resetEvents}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#0f172a",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            初期値に戻す
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#0f172a",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            トップへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EventSettings() {
  const nav = useNavigate();

  const fixedKeys = ["gold", "silver", "bronze", "iron"];

  const defaultEvents = [
    { key: "gold", label: "金", point: 4, active: true, single: true },
    { key: "silver", label: "銀", point: 3, active: true, single: true },
    { key: "bronze", label: "銅", point: 2, active: true, single: true },
    { key: "iron", label: "鉄", point: 1, active: true, single: true },
    { key: "yarn", label: "竿", point: 3, active: true, single: false },
    { key: "sand0", label: "砂ゼロ", point: 8, active: true, single: false },
    { key: "sand1", label: "砂1", point: 3, active: true, single: false },
    { key: "diamond", label: "ダイヤ", point: 5, active: true, single: false },
    { key: "birdie", label: "バーディ", point: 3, active: true, single: false },
    { key: "eagle", label: "イーグル", point: 30, active: true, single: false },
    { key: "alba", label: "アルバトロス", point: 50, active: true, single: false },
    { key: "holeInOne", label: "ホールインワン", point: 100, active: true, single: false }
  ];

  const saved = JSON.parse(localStorage.getItem("events") || "null");

  const mergedEvents = saved
    ? [
        ...defaultEvents.filter((d) => !saved.some((s) => s.key === d.key)),
        ...saved
      ]
    : defaultEvents;

  const [events, setEvents] = useState(mergedEvents);

  const fixedEvents = fixedKeys
    .map((key) => events.find((e) => e.key === key))
    .filter(Boolean);

  const customEvents = events.filter((e) => !fixedKeys.includes(e.key));

  const sortedEvents = [...fixedEvents, ...customEvents];

  const updateByKey = (key, field, value) => {
    const next = events.map((e) =>
      e.key === key ? { ...e, [field]: value } : e
    );
    setEvents(next);
  };

  const addEvent = () => {
    setEvents([
      ...events,
      {
        key: `custom_${Date.now()}`,
        label: "新しい役",
        point: 1,
        active: true,
        single: false
      }
    ]);
  };

  const removeByKey = (key) => {
    if (fixedKeys.includes(key)) return;
    setEvents(events.filter((e) => e.key !== key));
  };

  const moveCustomUp = (key) => {
    const idx = customEvents.findIndex((e) => e.key === key);
    if (idx <= 0) return;

    const nextCustom = [...customEvents];
    [nextCustom[idx - 1], nextCustom[idx]] = [nextCustom[idx], nextCustom[idx - 1]];

    setEvents([...fixedEvents, ...nextCustom]);
  };

  const moveCustomDown = (key) => {
    const idx = customEvents.findIndex((e) => e.key === key);
    if (idx === -1 || idx >= customEvents.length - 1) return;

    const nextCustom = [...customEvents];
    [nextCustom[idx + 1], nextCustom[idx]] = [nextCustom[idx], nextCustom[idx + 1]];

    setEvents([...fixedEvents, ...nextCustom]);
  };

  const save = () => {
    localStorage.setItem("events", JSON.stringify(events));
    nav("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
        padding: 20,
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 28,
          padding: 24,
          boxShadow: "0 18px 40px rgba(15,23,42,0.10)"
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            borderRadius: 24,
            padding: 24,
            marginBottom: 22
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.9 }}>EVENT SETTINGS</div>
          <h1 style={{ margin: "6px 0 0 0", fontSize: 38 }}>役の設定</h1>
          <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
            金銀銅鉄も含めて役名・点数・ON/OFFを設定
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {sortedEvents.map((e) => {
            const isFixed = fixedKeys.includes(e.key);
            const customIndex = customEvents.findIndex((x) => x.key === e.key);
            const canMoveUp = !isFixed && customIndex > 0;
            const canMoveDown = !isFixed && customIndex < customEvents.length - 1;

            return (
              <div
                key={e.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 120px 110px 90px auto auto auto",
                  gap: 10,
                  alignItems: "center",
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  background: isFixed ? "#eff6ff" : "#f8fafc"
                }}
              >
                <input
                  value={e.label}
                  onChange={(ev) => updateByKey(e.key, "label", ev.target.value)}
                  style={inputStyle}
                />

                <input
                  type="number"
                  value={e.point}
                  onChange={(ev) =>
                    updateByKey(e.key, "point", Number(ev.target.value))
                  }
                  style={inputStyle}
                />

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 700,
                    color: "#334155",
                    justifyContent: "center"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={e.single}
                    onChange={(ev) =>
                      updateByKey(e.key, "single", ev.target.checked)
                    }
                  />
                  単一
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 700,
                    color: "#334155",
                    justifyContent: "center"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={e.active}
                    onChange={(ev) =>
                      updateByKey(e.key, "active", ev.target.checked)
                    }
                  />
                  ON
                </label>

                <button
                  onClick={() => moveCustomUp(e.key)}
                  disabled={!canMoveUp}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: canMoveUp ? "#64748b" : "#cbd5e1",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: canMoveUp ? "pointer" : "not-allowed"
                  }}
                >
                  ↑
                </button>

                <button
                  onClick={() => moveCustomDown(e.key)}
                  disabled={!canMoveDown}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: canMoveDown ? "#64748b" : "#cbd5e1",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: canMoveDown ? "pointer" : "not-allowed"
                  }}
                >
                  ↓
                </button>

                <button
                  onClick={() => removeByKey(e.key)}
                  disabled={isFixed}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: isFixed ? "#cbd5e1" : "#ef4444",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: isFixed ? "not-allowed" : "pointer"
                  }}
                >
                  削除
                </button>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            marginTop: 22,
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={addEvent}
            style={{
              padding: "14px 20px",
              borderRadius: 14,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            ＋追加
          </button>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => nav("/")}
              style={{
                padding: "14px 20px",
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#0f172a",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              戻る
            </button>

            <button
              onClick={save}
              style={{
                padding: "14px 20px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              保存
            </button>
          </div>
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
  background: "#ffffff",
  fontSize: 16
};
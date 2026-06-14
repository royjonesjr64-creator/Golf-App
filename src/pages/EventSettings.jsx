import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
const defaultEvents = [
  {
    key: "sao",
    label: "竿",
    point: 3,
    active: true,
    description: "ショートホールで一番近くに乗せた人が獲得"
  },
  {
    key: "sand_zero",
    label: "砂ゼロ",
    point: 8,
    active: true,
    description: "バンカーに入れて、そのホールをパット0で上がった場合"
  },
  {
    key: "sand_one",
    label: "砂一",
    point: 3,
    active: true,
    description: "バンカーに入れて、そのホールを1パットで上がった場合"
  },
  {
    key: "diamond",
    label: "ダイヤモンド",
    point: 5,
    active: true,
    description: "グリーン外から入れた場合"
  },
  {
    key: "birdie",
    label: "バーディ",
    point: 3,
    active: true,
    description: "バーディを取った場合"
  },
  {
    key: "eagle",
    label: "イーグル",
    point: 30,
    active: true,
    description: "イーグルを取った場合"
  },
  {
    key: "albatross",
    label: "アルバトロス",
    point: 50,
    active: true,
    description: "アルバトロスを取った場合"
  },
  {
  key: "holeinone",
  label: "ホールインワン",
  point: 100,
  active: true,
  description: "ホールインワンを取った場合"
},
{
  key: "gold",
  label: "金",
  point: 4,
  active: true,
  description: "オリンピックでカップから一番遠い位置から入れた人"
},
{
  key: "silver",
  label: "銀",
  point: 3,
  active: true,
  description: "オリンピックでカップから2番目に遠い位置から入れた人"
},
{
  key: "bronze",
  label: "銅",
  point: 2,
  active: true,
  description: "オリンピックでカップから3番目に遠い位置から入れた人"
},
{
  key: "iron",
  label: "鉄",
  point: 1,
  active: true,
  description: "オリンピックでカップから4番目に遠い位置から入れた人"
},
{
  key: "kan",
  label: "貫",
  point: 0,
  active: true,
  description: "同じ点数を4回獲得すると成立。獲得点はその点数×4"
},
{
  key: "ittsuu",
  label: "一通",
  point: 10,
  active: true,
  description: "同じ人が金・銀・銅・鉄をすべて獲得"
}
];
export default function EventSettings() {
  const navigate = useNavigate();
  const [events, setEvents] = useState(defaultEvents);
  const [newLabel, setNewLabel] = useState("");
  const [newPoint, setNewPoint] = useState("");
const [newDescription, setNewDescription] = useState("");
const [editingIndex, setEditingIndex] = useState(null);
  useEffect(() => {
  const loadEvents = async () => {
    try {
      const ref = doc(db, "settings", "olympicEvents");
      const snap = await getDoc(ref);

      if (snap.exists()) {
  const data = snap.data();
  const firestoreEvents = data.events || [];

  const mergedEvents = defaultEvents.map((def) => {
    const saved = firestoreEvents.find((e) => e.key === def.key);

    return {
      ...def,
      ...saved,
      description: saved?.description || def.description || "",
    };
  });

  const customEvents = firestoreEvents.filter(
    (e) => !defaultEvents.some((def) => def.key === e.key)
  );

  const nextEvents = [...mergedEvents, ...customEvents];

  setEvents(nextEvents);
  localStorage.setItem("olympicEvents", JSON.stringify(nextEvents));
} else {
  setEvents(defaultEvents);
  localStorage.setItem("olympicEvents", JSON.stringify(defaultEvents));
}
    } catch (error) {
      console.error("役設定読み込みエラー:", error);

      const saved = localStorage.getItem("olympicEvents");
      if (saved) {
        setEvents(JSON.parse(saved));
      }
    }
  };

  loadEvents();
}, []);

  const saveEvents = async () => {
  try {
    const ref = doc(db, "settings", "olympicEvents");

    await setDoc(ref, {
      events,
      updatedAt: new Date().toISOString(),
    });

    localStorage.setItem("olympicEvents", JSON.stringify(events));
    alert("保存しました");
    navigate("/");
  } catch (error) {
    console.error("役設定保存エラー:", error);
    alert("保存に失敗しました");
  }
};

  const resetEvents = async () => {
  try {
    const ref = doc(db, "settings", "olympicEvents");

    await setDoc(ref, {
      events: defaultEvents,
      updatedAt: new Date().toISOString(),
    });

    localStorage.setItem("olympicEvents", JSON.stringify(defaultEvents));
    setEvents(defaultEvents);
    alert("初期値に戻しました");
  } catch (error) {
    console.error("初期化エラー:", error);
    alert("初期化に失敗しました");
  }
};

  const addEvent = () => {
    if (!newLabel.trim()) return;
   const item = {
  key: `custom_${Date.now()}`,
  label: newLabel.trim(),
  point: Number(newPoint) || 0,
  description: newDescription.trim(),
  active: true
};
    setEvents([...events, item]);
    setNewLabel("");
setNewPoint("");
setNewDescription("");

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
  padding: "14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 18,
};
  return (
    <div style={pageStyle}>
      <h1>役設定</h1>

     
       <div style={{ display: "grid", gap: 10 }}>
  {events.map((event, index) => (
    <div
      key={event.key || index}
      style={{
        display: "grid",
        gap: 8,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 12,
      }}
    >
     <div style={{ fontWeight: 900, fontSize: 18 }}>
  🏌️ {event.label}
</div>

<div
  style={{
    color: "#64748b",
    fontSize: 15,
    lineHeight: 1.5,
    background: "#f8fafc",
    padding: 8,
    borderRadius: 8,
  }}
>
  {event.description || "説明なし"}
</div>

<div
  style={{
    fontWeight: 800,
    color: "#2563eb",
    fontSize: 18,
  }}
>
  {event.point > 0 ? `+${event.point}pt` : `${event.point}pt`}
</div>
{editingIndex === index && (
  <div
    style={{
      display: "grid",
      gap: 8,
      marginTop: 8,
      padding: 10,
      borderRadius: 12,
      background: "#f1f5f9",
    }}
  >
    <input
      value={event.label}
      onChange={(e) => updateEvent(index, "label", e.target.value)}
      placeholder="役名"
      style={inputStyle}
    />

    <input
      type="number"
      value={event.point}
      onChange={(e) =>
        updateEvent(index, "point", Number(e.target.value) || 0)
      }
      placeholder="点"
      style={inputStyle}
    />

    <input
      value={event.description || ""}
      onChange={(e) => updateEvent(index, "description", e.target.value)}
      placeholder="説明"
      style={inputStyle}
    />

    <button
      onClick={() => setEditingIndex(null)}
      style={{
        ...buttonStyle,
        background: "#16a34a",
        color: "#ffffff",
        border: "none",
      }}
    >
      編集完了
    </button>
  </div>
)}
      <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
  }}
>
        <button
          onClick={() => setEditingIndex(index)}
          style={{
            ...buttonStyle,
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
          }}
        >
          編集
        </button>

        <button
          onClick={() => updateEvent(index, "active", !event.active)}
          style={{
            ...buttonStyle,
            background: event.active ? "#16a34a" : "#94a3b8",
            color: "#ffffff",
            border: "none",
          }}
        >
          {event.active ? "ON" : "OFF"}
        </button>

        <button
          onClick={() => deleteEvent(index)}
          style={{
            ...buttonStyle,
            background: "#ef4444",
            color: "#ffffff",
            border: "none",
          }}
        >
          削除
        </button>
      </div>
    </div>
  ))}
</div>
      <h2 style={{ marginTop: 24 }}>役を追加</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
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
<input
  value={newDescription}
  onChange={(e) => setNewDescription(e.target.value)}
  placeholder="役の説明"
  style={{
    ...inputStyle,
    marginBottom: 10,
  }}
/>
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
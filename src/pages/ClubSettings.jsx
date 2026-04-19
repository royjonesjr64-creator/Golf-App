import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClubSettings() {
  const nav = useNavigate();

  const defaultClubs = [
    "Driver",
    "3W",
    "5W",
    "4U",
    "5I",
    "6I",
    "7I",
    "8I",
    "9I",
    "PW",
    "AW",
    "SW",
    "PT"
  ];

  const saved = JSON.parse(localStorage.getItem("clubs") || "null");
  const [clubs, setClubs] = useState(saved || defaultClubs);

  const updateClub = (index, value) => {
    const next = [...clubs];
    next[index] = value;
    setClubs(next);
  };

  const addClub = () => {
    setClubs([...clubs, "新しいクラブ"]);
  };

  const removeClub = (index) => {
    if (clubs.length <= 1) return;
    setClubs(clubs.filter((_, i) => i !== index));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...clubs];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setClubs(next);
  };

  const moveDown = (index) => {
    if (index === clubs.length - 1) return;
    const next = [...clubs];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setClubs(next);
  };

  const save = () => {
    const cleaned = clubs.map((c) => c.trim()).filter(Boolean);
    localStorage.setItem("clubs", JSON.stringify(cleaned));
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
          maxWidth: 920,
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
          <div style={{ fontSize: 14, opacity: 0.9 }}>CLUB SETTINGS</div>
          <h1 style={{ margin: "6px 0 0 0", fontSize: 38 }}>クラブ設定</h1>
          <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
            Game画面のクラブ選択ポップアップに表示する一覧
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {clubs.map((club, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 10,
                alignItems: "center",
                padding: 14,
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                background: "#f8fafc"
              }}
            >
              <input
                value={club}
                onChange={(e) => updateClub(index, e.target.value)}
                style={inputStyle}
              />

              <button onClick={() => moveUp(index)} style={arrowButtonStyle}>
                ↑
              </button>

              <button onClick={() => moveDown(index)} style={arrowButtonStyle}>
                ↓
              </button>

              <button onClick={() => removeClub(index)} style={deleteButtonStyle}>
                削除
              </button>
            </div>
          ))}
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
          <button onClick={addClub} style={addButtonStyle}>
            ＋追加
          </button>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => nav("/")} style={backButtonStyle}>
              戻る
            </button>

            <button onClick={save} style={saveButtonStyle}>
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

const arrowButtonStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#64748b",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const deleteButtonStyle = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "#ef4444",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const addButtonStyle = {
  padding: "14px 20px",
  borderRadius: 14,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const backButtonStyle = {
  padding: "14px 20px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  fontWeight: "bold",
  cursor: "pointer"
};

const saveButtonStyle = {
  padding: "14px 20px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};
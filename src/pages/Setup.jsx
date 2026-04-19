import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Setup() {
  const nav = useNavigate();

  const [players, setPlayers] = useState(
    JSON.parse(localStorage.getItem("players") || '[""]')
  );
  const [golfName, setGolfName] = useState(
    localStorage.getItem("golfName") || ""
  );
  const [courseName, setCourseName] = useState(
    localStorage.getItem("courseName") || ""
  );
  const [playDate, setPlayDate] = useState(
    localStorage.getItem("playDate") || ""
  );

  const updatePlayer = (index, value) => {
    const next = [...players];
    next[index] = value;
    setPlayers(next);
  };

  const addPlayer = () => {
    setPlayers([...players, ""]);
  };

  const removePlayer = (index) => {
    if (players.length <= 1) return;
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const cleanedPlayers = players.map((p) => p.trim()).filter(Boolean);

    localStorage.setItem("players", JSON.stringify(cleanedPlayers));
    localStorage.setItem("golfName", golfName);
    localStorage.setItem("courseName", courseName);
    localStorage.setItem("playDate", playDate);
    localStorage.removeItem("rounds");

    nav("/par-settings");
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
          maxWidth: 760,
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
          <div style={{ fontSize: 14, opacity: 0.9 }}>ROUND SETUP</div>
          <h1 style={{ margin: "6px 0 0 0", fontSize: 38 }}>ラウンド設定</h1>
          <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
            プレイヤーとコース情報を入力
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 800, color: "#334155", marginBottom: 8 }}>
              プレイヤー
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {players.map((player, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10
                  }}
                >
                  <input
                    value={player}
                    onChange={(e) => updatePlayer(index, e.target.value)}
                    placeholder={`プレイヤー${index + 1}`}
                    style={inputStyle}
                  />

                  <button
                    onClick={() => removePlayer(index)}
                    style={{
                      padding: "0 16px",
                      borderRadius: 14,
                      border: "none",
                      background: "#ef4444",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addPlayer}
              style={{
                marginTop: 10,
                padding: "12px 18px",
                borderRadius: 14,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              ＋プレイヤー追加
            </button>
          </div>

          <Field
            label="ゴルフ場名"
            value={golfName}
            onChange={setGolfName}
            placeholder="例：〇〇カントリークラブ"
          />
          <Field
            label="コース名"
            value={courseName}
            onChange={setCourseName}
            placeholder="例：OUT / IN"
          />

          <div>
            <div style={{ fontWeight: 800, color: "#334155", marginBottom: 8 }}>
              プレー日
            </div>
            <input
              type="date"
              value={playDate}
              onChange={(e) => setPlayDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => nav("/")}
            style={{
              flex: 1,
              padding: "16px 20px",
              borderRadius: 16,
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
            onClick={handleNext}
            style={{
              flex: 2,
              padding: "16px 20px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            パー設定へ進む
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div style={{ fontWeight: 800, color: "#334155", marginBottom: 8 }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px 18px",
  borderRadius: 16,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  fontSize: 17
};
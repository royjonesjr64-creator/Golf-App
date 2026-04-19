import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ParSettings() {
  const nav = useNavigate();
  const holeCount = 18;

  const getInitialPars = () => {
    const saved = JSON.parse(localStorage.getItem("pars") || "[]");
    if (saved.length === holeCount) {
      return saved.map((v) => String(v || ""));
    }
    return Array(holeCount).fill("");
  };

  const [pars, setPars] = useState(getInitialPars());

  const updatePar = (index, value) => {
    const next = [...pars];
    next[index] = value;
    setPars(next);
  };

  const fillExample = () => {
    setPars([
      "4", "4", "3", "5", "4", "4", "3", "5", "4",
      "4", "4", "3", "5", "4", "4", "3", "5", "4"
    ]);
  };

  const fillAllFour = () => {
    setPars(Array(holeCount).fill("4"));
  };

  const savePars = () => {
    const normalized = pars.map((v) => Number(v) || 4);
    localStorage.setItem("pars", JSON.stringify(normalized));
    localStorage.setItem("holeCount", JSON.stringify(holeCount));
    nav("/game");
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
          maxWidth: 900,
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
          <div style={{ fontSize: 14, opacity: 0.9 }}>PAR SETTINGS</div>
          <h1 style={{ margin: "6px 0 0 0", fontSize: 38 }}>パー設定</h1>
          <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
            18ホール分のパーを入力
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 22
          }}
        >
          <button
            onClick={fillExample}
            style={toolButtonStyle("#2563eb")}
          >
            例を入れる
          </button>

          <button
            onClick={fillAllFour}
            style={toolButtonStyle("#64748b")}
          >
            全部4にする
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14
          }}
        >
          {pars.map((par, index) => (
            <div
              key={index}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: 16
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontWeight: 900,
                  fontSize: 20,
                  color: "#0f172a",
                  marginBottom: 10
                }}
              >
                H {index + 1}
              </div>

              <input
                type="number"
                value={par}
                onChange={(e) => updatePar(index, e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  textAlign: "center",
                  fontSize: 26,
                  fontWeight: 900,
                  background: "#ffffff"
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={savePars}
            style={{
              padding: "16px 30px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            保存してゲームへ
          </button>
        </div>
      </div>
    </div>
  );
}

function toolButtonStyle(color) {
  return {
    padding: "16px 18px",
    borderRadius: 16,
    border: "none",
    background: color,
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer"
  };
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
   const saved = JSON.parse(localStorage.getItem("golf_history") || "[]");
    setHistory(saved);
  }, []);

  const openDetail = (item) => {
    localStorage.setItem("rounds", JSON.stringify(item.rounds || []));
    localStorage.setItem("pars", JSON.stringify(item.pars || []));
    localStorage.setItem("players", JSON.stringify(item.players || []));
    localStorage.setItem("events", JSON.stringify(item.events || []));
    localStorage.setItem("golfName", item.golfName || "");
    localStorage.setItem("courseName", item.courseName || "");
    localStorage.setItem("playDate", item.playDate || "");
    navigate("/result");
  };

  const deleteRound = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("golf_history", JSON.stringify(updated));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ marginBottom: 16 }}>ラウンド履歴</h1>

      {history.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 18,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          まだ履歴がありません
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {history.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 18,
                padding: 18,
                boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
              }}
            >
              <div style={{ color: "#64748b", fontSize: 13 }}>
                #{history.length - index}
              </div>

              <h2 style={{ margin: "8px 0 4px" }}>
                {item.golfName || "未設定"}
              </h2>

              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {item.courseName || "コース名なし"}
              </div>

              <div style={{ color: "#64748b", fontSize: 14 }}>
                {item.playDate || item.date || "-"}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 12,
                }}
              >
                <InfoChip label="人数" value={item.players?.length || 0} />
                <InfoChip label="ホール数" value={item.rounds?.length || 0} />
                <InfoChip
                  label="保存日時"
                  value={item.date ? String(item.date).slice(0, 16) : "-"}
                />
              </div>

              {item.ranking && item.ranking.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      marginBottom: 10,
                      color: "#0f172a",
                      fontSize: 18,
                    }}
                  >
                    スコア一覧
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {item.ranking.map((player, i) => (
                      <div
                        key={`${item.id}-${player.playerName}-${i}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 10,
                          padding: "14px 16px",
                          borderRadius: 14,
                          border: "1px solid #e5e7eb",
                          background: "#ffffff",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 16 }}>
                          {i + 1}. {player.playerName}
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <InfoChip label="スコア" value={`${player.totalScore || "-"}打`} />
                          <InfoChip label="差" value={player.diff ?? "-"} />
                          <InfoChip label="OP" value={player.totalOlympic ?? "-"} />
                          <InfoChip
                            label="方向"
                            value={item.rounds?.[0]?.firstPuttDirection || "-"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <button
                  onClick={() => openDetail(item)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid #2563eb",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  詳細
                </button>

                <button
                  onClick={() => deleteRound(item.id)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid #ef4444",
                    background: "#ef4444",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 13,
        fontWeight: 700,
        color: "#0f172a",
      }}
    >
      {label}：{value}
    </div>
  );
}
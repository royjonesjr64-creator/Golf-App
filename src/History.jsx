import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history") || "[]");
    setHistory(saved);
  }, []);

  const handleDelete = (id) => {
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem("history", JSON.stringify(updated));
    setHistory(updated);
  };

  const handleClear = () => {
    const ok = window.confirm("履歴を全部削除します。よろしいですか？");
    if (!ok) return;

    localStorage.removeItem("history");
    setHistory([]);
  };

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

  const editRound = (item) => {
    localStorage.setItem("rounds", JSON.stringify(item.rounds || []));
    localStorage.setItem("pars", JSON.stringify(item.pars || []));
    localStorage.setItem("players", JSON.stringify(item.players || []));
    localStorage.setItem("events", JSON.stringify(item.events || []));
    localStorage.setItem("golfName", item.golfName || "");
    localStorage.setItem("courseName", item.courseName || "");
    localStorage.setItem("playDate", item.playDate || "");

    navigate("/game?hole=1");
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20
          }}
        >
          <h1 style={{ margin: 0, fontSize: 36 }}>📊 ラウンド履歴</h1>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => navigate("/")} style={topButton}>
              トップへ戻る
            </button>

            <button onClick={handleClear} style={clearButton}>
              履歴を全削除
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 18,
              padding: 24,
              textAlign: "center",
              color: "#64748b"
            }}
          >
            まだ履歴がありません
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {history.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 18,
                  padding: 18,
                  boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap"
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        marginBottom: 8
                      }}
                    >
                      #{history.length - index}
                    </div>

                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: "#0f172a",
                        lineHeight: 1.2
                      }}
                    >
                      {item.golfName || "未設定"}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        color: "#475569",
                        fontSize: 15,
                        fontWeight: 600
                      }}
                    >
                      {item.courseName || "コース名なし"}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        color: "#64748b",
                        fontSize: 14
                      }}
                    >
                      {item.playDate || item.date || "-"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center"
                    }}
                  >
                    <InfoChip label="人数" value={item.players?.length || 0} />
                    <InfoChip label="ホール数" value={item.rounds?.length || 0} />
                    <InfoChip
                      label="保存日時"
                      value={item.date ? String(item.date).slice(0, 16) : "-"}
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editRound(item);
                      }}
                      style={editButton}
                    >
                      編集
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      style={deleteButton}
                    >
                      削除
                    </button>
                  </div>
                </div>

                {item.ranking && item.ranking.length > 0 ? (
                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        marginBottom: 10,
                        color: "#0f172a",
                        fontSize: 18
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
                            padding: "12px 14px",
                            borderRadius: 14,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0"
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 900,
                              fontSize: 18,
                              color: "#0f172a"
                            }}
                          >
                            {i + 1}. {player.playerName}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flexWrap: "wrap"
                            }}
                          >
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: 900,
                                color: player.diff <= 0 ? "#16a34a" : "#dc2626",
                                minWidth: 70,
                                textAlign: "right"
                              }}
                            >
                              {player.totalScore}打
                            </div>

                            <InfoChip
                              label="差"
                              value={
                                player.diff > 0 ? `+${player.diff}` : player.diff
                              }
                            />

                            <InfoChip label="OP" value={player.totalOlympic} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 13,
                        color: "#64748b"
                      }}
                    >
                      カードを押すと詳細、編集ボタンで修正できます
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "#f8fafc",
        border: "1px solid #dbe2ea",
        fontSize: 13,
        fontWeight: 700,
        color: "#334155"
      }}
    >
      {label}：{value}
    </div>
  );
}

const topButton = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: "bold",
  fontSize: 14,
  cursor: "pointer"
};

const clearButton = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  background: "#ef4444",
  color: "#ffffff",
  fontWeight: "bold",
  fontSize: 14,
  cursor: "pointer"
};

const editButton = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: "bold",
  fontSize: 14,
  cursor: "pointer",
  minWidth: 64
};

const deleteButton = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "#ef4444",
  color: "#ffffff",
  fontWeight: "bold",
  fontSize: 14,
  cursor: "pointer",
  minWidth: 64
};
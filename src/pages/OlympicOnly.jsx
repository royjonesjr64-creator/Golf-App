import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OlympicOnly() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState([
    { name: "", point: "" },
    { name: "", point: "" },
  ]);
  const [rate, setRate] = useState(100);
const [currency, setCurrency] = useState("円");
  const updatePlayer = (index, field, value) => {
    const copy = [...players];
    copy[index] = {
      ...copy[index],
      [field]: field === "point" ? value : value,
    };
    setPlayers(copy);
  };

  const addPlayer = () => {
    setPlayers([...players, { name: "", point: "" }]);
  };

  const deletePlayer = (index) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== index));
  };

  const activePlayers = players
    .map((player, index) => ({
      name: player.name.trim() || `プレイヤー${index + 1}`,
      point: Number(player.point || 0),
      index,
    }))
    .filter((p) => p.name);

  const totalAllPoints = activePlayers.reduce(
    (sum, player) => sum + player.point,
    0
  );

  const ranking = [...activePlayers].sort((a, b) => b.point - a.point);

  const getSettlement = (player) => {
    return player.point * activePlayers.length - totalAllPoints;
  };

  const resetAll = () => {
    if (!confirm("入力をリセットしますか？")) return;
    setPlayers([
      { name: "", point: "" },
      { name: "", point: "" },
    ]);
    setRate(100);
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
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1>🏆 オリンピック計算</h1>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: "0 0 12px" }}>1ptの金額</h2>
<div
  style={{
    display: "flex",
    gap: 10,
    marginTop: 10,
  }}
>
  <button
    onClick={() => setCurrency("円")}
    style={{
      padding: "8px 14px",
      borderRadius: 10,
      border: "none",
      background: currency === "円" ? "#2563eb" : "#e5e7eb",
      color: currency === "円" ? "#fff" : "#000",
      fontWeight: 700,
    }}
  >
    円
  </button>

  <button
    onClick={() => setCurrency("Rp")}
    style={{
      padding: "8px 14px",
      borderRadius: 10,
      border: "none",
      background: currency === "Rp" ? "#2563eb" : "#e5e7eb",
      color: currency === "Rp" ? "#fff" : "#000",
      fontWeight: 700,
    }}
  >
    Rp
  </button>

  <button
    onClick={() => setCurrency("$")}
    style={{
      padding: "8px 14px",
      borderRadius: 10,
      border: "none",
      background: currency === "$" ? "#2563eb" : "#e5e7eb",
      color: currency === "$" ? "#fff" : "#000",
      fontWeight: 700,
    }}
  >
    $
  </button>
</div>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              fontSize: 18,
              fontWeight: 800,
              boxSizing: "border-box",
            }}
          />

          <div style={{ marginTop: 8, color: "#64748b", fontSize: 13 }}>
            例：100なら 1pt = 100円
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: "0 0 12px" }}>合計点を入力</h2>

          <div style={{ display: "grid", gap: 10 }}>
            {players.map((player, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 90px 64px",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <input
                  value={player.name}
                  onChange={(e) =>
                    updatePlayer(index, "name", e.target.value)
                  }
                  placeholder={`プレイヤー${index + 1}`}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    fontSize: 16,
                  }}
                />

                <input
                  type="number"
                  value={player.point}
                  onChange={(e) =>
                    updatePlayer(index, "point", e.target.value)
                  }
                  placeholder="pt"
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    fontSize: 16,
                    fontWeight: 800,
                    textAlign: "center",
                  }}
                />

                <button
                  onClick={() => deletePlayer(index)}
                  disabled={players.length <= 2}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "none",
                    background:
                      players.length <= 2 ? "#cbd5e1" : "#ef4444",
                    color: "#fff",
                    fontWeight: 800,
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
              marginTop: 12,
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            ＋ プレイヤー追加
          </button>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: "0 0 12px", color: "#d97706" }}>
            結果・清算
          </h2>

          <div style={{ display: "grid", gap: 10 }}>
            {ranking.map((player, index) => {
              const settlementPoint = getSettlement(player);
              const settlementMoney = settlementPoint * rate;

              return (
                <div
                  key={player.index}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #e5e7eb",
                    background:
                      index === 0
                        ? "#fef3c7"
                        : index === 1
                        ? "#f1f5f9"
                        : index === 2
                        ? "#ffedd5"
                        : "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 70px",
                      gap: 8,
                      alignItems: "center",
                      fontWeight: 900,
                    }}
                  >
                    <div>
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `${index + 1}`}
                    </div>

                    <div>{player.name}</div>

                    <div>{player.point}pt</div>
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontWeight: 900,
                      color: settlementMoney >= 0 ? "#16a34a" : "#dc2626",
                      fontSize: 18,
                    }}
                  >
                    {settlementMoney >= 0 ? "+" : ""}
                    {currency}{settlementMoney.toLocaleString()}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginTop: 4,
                    }}
                  >
                    清算pt：
                    {settlementPoint >= 0 ? "+" : ""}
                    {settlementPoint}pt
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.5,
            }}
          >
            清算式：本人点数 × 人数 − 全員合計
          </div>
<button
  onClick={() => {
    const text = [
      "🏆 オリンピック結果",
      "",
      ...ranking.map((player, index) => {
        const rank =
          index === 0
            ? "🥇"
            : index === 1
            ? "🥈"
            : index === 2
            ? "🥉"
            : `${index + 1}位`;

        const settlementPoint = getSettlement(player);
        const settlementMoney = settlementPoint * rate;

        return `${rank} ${player.name} ${player.point}pt / ${
          settlementMoney >= 0 ? "+" : ""
        }${currency}${settlementMoney.toLocaleString()}`;
      }),
      "",
      `1pt = ${rate.toLocaleString()}${currency}`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    alert("結果をコピーしました。");
  }}
  style={{
    marginTop: 14,
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "#16a34a",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 16,
  }}
>
  📤 結果を共有
</button>
        </div>

        <div style={{ display: "grid", gap: 10, marginBottom: 30 }}>
          <button
            onClick={resetAll}
            style={{
              padding: 14,
              borderRadius: 12,
              border: "1px solid #ef4444",
              background: "#ffffff",
              color: "#ef4444",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            リセット
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            トップへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function StatChip({ label, value }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "#ffffff",
        border: "1px solid #dbe2ea",
        fontWeight: 800,
        fontSize: 12,
        whiteSpace: "nowrap"
      }}
    >
      {label}：{value}
    </div>
  );
}

function MiniBox({ label, value, valueColor = "#0f172a" }) {
  return (
    <div
      style={{
        padding: 8,
        borderRadius: 10,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        minWidth: 0
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          marginBottom: 2
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 800,
          fontSize: 14,
          color: valueColor,
          whiteSpace: "normal",
          overflowWrap: "break-word",
          lineHeight: 1.25
        }}
      >
        {value}
      </div>
    </div>
  );
}

function getDiffLabel(score, par) {
  const s = Number(score);
  const p = Number(par);
  const diff = s - p;

  if (p === 3 && s === 1) return "HOLE IN ONE";
  if (p === 5 && s === 2) return "ALBATROSS";
  if (diff === -2) return "EAGLE";
  if (diff === -1) return "BIRDIE";
  if (diff === 0) return "PAR";
  if (diff === 1) return "BOGEY";
  if (diff === 2) return "DOUBLE";
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}

function getDiffColor(score, par) {
  const diff = score - par;
  if (diff <= -1) return "#16a34a";
  if (diff === 0) return "#2563eb";
  return "#dc2626";
}

function isGir(score, putt, par) {
  if (!score || !par) return false;
  return score - putt <= par - 2;
}

export default function Result() {
  const nav = useNavigate();
  const [openPlayers, setOpenPlayers] = useState({});
  const [openHoles, setOpenHoles] = useState({});

  const rawRounds = JSON.parse(localStorage.getItem("rounds") || "[]");
  const rounds = rawRounds.filter((r) => r && r.players);
  const pars = JSON.parse(localStorage.getItem("pars") || "[]");
  const players = JSON.parse(localStorage.getItem("players") || "[]");
  const events = JSON.parse(localStorage.getItem("events") || "[]");

  const golfName =
    localStorage.getItem("golfName") ||
    localStorage.getItem("golfCourse") ||
    "未設定";
  const courseName = localStorage.getItem("courseName") || "";
  const playDate = localStorage.getItem("playDate") || "";

  const calcOlympicPoint = (playerRow) => {
    let p = 0;
    events.forEach((e) => {
      if (e.active && playerRow?.eventChecks?.[e.key]) {
        p += Number(e.point) || 0;
      }
    });
    return p;
  };

  const getRoleText = (playerRow) => {
    const labels = [];
    events.forEach((e) => {
      if (e.active && playerRow?.eventChecks?.[e.key]) {
        labels.push(e.label);
      }
    });
    return labels.length > 0 ? labels.join(" / ") : "-";
  };

  const playerSummaries = useMemo(() => {
    return players.map((playerName, playerIndex) => {
      const playerRounds = rounds.map((round, idx) => {
        const row = round.players?.[playerIndex] || {};
        const par = Number(pars[idx]) || 4;
        const score = Number(row.score) || 0;
        const putt = Number(row.putt) || 0;
        const driveDistance = Number(row.driveDistance) || 0;
        const fairwayKeep = row.fairwayKeep || "";

        return {
          hole: round.hole,
          par,
          score,
          inside100: Number(row.inside100) || 0,
          greenOnDistance: Number(row.greenOnDistance) || 0,
          driveDistance,
          fairwayKeep,
          club: row.club || "-",
          putt,
          roleText: getRoleText(row),
          olympicPoint: calcOlympicPoint(row),
          diffLabel: getDiffLabel(score, par),
          diffColor: getDiffColor(score, par),
          gir: isGir(score, putt, par)
        };
      });

      const totalScore = playerRounds.reduce((sum, r) => sum + r.score, 0);
      const totalPar = playerRounds.reduce((sum, r) => sum + r.par, 0);
      const totalOlympic = playerRounds.reduce((sum, r) => sum + r.olympicPoint, 0);
      const avg =
        playerRounds.length > 0
          ? (totalScore / playerRounds.length).toFixed(1)
          : "0.0";
      const diff = totalScore - totalPar;

      const validDriverDistances = playerRounds
        .filter((r) => r.club === "Driver" && r.driveDistance > 0)
        .map((r) => r.driveDistance);

      const avgDriverDistance =
        validDriverDistances.length > 0
          ? (
              validDriverDistances.reduce((sum, d) => sum + d, 0) /
              validDriverDistances.length
            ).toFixed(1)
          : "-";

      const fwTargets = playerRounds.filter(
        (r) => r.par !== 3 && r.club === "Driver"
      );
      const fwKeeps = fwTargets.filter((r) => r.fairwayKeep === "keep").length;
      const fwRate =
        fwTargets.length > 0
          ? `${Math.round((fwKeeps / fwTargets.length) * 100)}%`
          : "-";

      const oneOnTargets = playerRounds.filter((r) => r.par === 3);
      const oneOnCount = oneOnTargets.filter(
        (r) => r.fairwayKeep === "keep"
      ).length;
      const oneOnRate =
        oneOnTargets.length > 0
          ? `${Math.round((oneOnCount / oneOnTargets.length) * 100)}%`
          : "-";

      const girCount = playerRounds.filter((r) => r.gir).length;
      const girRate =
        playerRounds.length > 0
          ? `${Math.round((girCount / playerRounds.length) * 100)}%`
          : "-";

      return {
        playerName,
        rounds: playerRounds,
        totalScore,
        totalPar,
        totalOlympic,
        avg,
        diff,
        avgDriverDistance,
        fwRate,
        oneOnRate,
        girRate
      };
    });
  }, [players, rounds, pars, events]);

  const ranking = [...playerSummaries].sort((a, b) => a.totalScore - b.totalScore);

  const toggleOpen = (name) => {
    setOpenPlayers((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const toggleHoleOpen = (playerName, hole) => {
    const key = `${playerName}_${hole}`;
    setOpenHoles((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem("history") || "[]");

    const newData = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      golfName,
      courseName,
      playDate,
      players,
      rounds,
      pars,
      events,
      ranking: playerSummaries
    };

    const updated = [newData, ...saved];
    localStorage.setItem("history", JSON.stringify(updated));

    nav("/history");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
        padding: 10,
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 24,
          padding: 12,
          boxShadow: "0 18px 40px rgba(15,23,42,0.10)"
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            borderRadius: 20,
            padding: 16,
            marginBottom: 14,
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.9 }}>ROUND RESULT</div>
          <h1 style={{ margin: "4px 0 0 0", fontSize: 28 }}>結果</h1>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>
            {golfName}
          </div>
          {courseName ? (
            <div style={{ marginTop: 4, fontSize: 14 }}>{courseName}</div>
          ) : null}
          {playDate ? (
            <div style={{ marginTop: 4, fontSize: 12 }}>{playDate}</div>
          ) : null}
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            padding: 12,
            marginBottom: 14
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 20 }}>
            全員スコア一覧
          </h2>

          <div style={{ display: "grid", gap: 10 }}>
            {ranking.map((player, idx) => (
              <div
                key={player.playerName}
                style={{
                  background: "#ffffff",
                  border: idx === 0 ? "2px solid #f59e0b" : "1px solid #dbe2ea",
                  borderRadius: 16,
                  padding: 12,
                  boxShadow:
                    idx === 0
                      ? "0 8px 20px rgba(245,158,11,0.18)"
                      : "0 4px 12px rgba(15,23,42,0.06)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap"
                  }}
                >
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
                        minWidth: 42,
                        height: 42,
                        borderRadius: 999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: idx === 0 ? "#fef3c7" : "#eff6ff",
                        color: idx === 0 ? "#b45309" : "#1d4ed8",
                        fontWeight: 900,
                        fontSize: 18
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#0f172a"
                        }}
                      >
                        {player.playerName}
                      </div>
                      <div
                        style={{
                          marginTop: 2,
                          fontSize: 12,
                          color: "#64748b"
                        }}
                      >
                        平均 {player.avg} / OP {player.totalOlympic}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: "#f8fafc",
                        border: "1px solid #dbe2ea",
                        fontWeight: 900,
                        fontSize: 18,
                        color: "#0f172a"
                      }}
                    >
                      {player.totalScore}打
                    </div>

                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: player.diff <= 0 ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${
                          player.diff <= 0 ? "#bbf7d0" : "#fecaca"
                        }`,
                        fontWeight: 900,
                        color: player.diff <= 0 ? "#15803d" : "#dc2626"
                      }}
                    >
                      {player.diff > 0 ? `+${player.diff}` : player.diff}
                    </div>

                    <StatChip
                      label="平均Driver"
                      value={
                        player.avgDriverDistance === "-"
                          ? "-"
                          : `${player.avgDriverDistance}Y`
                      }
                    />
                    <StatChip label="FW率" value={player.fwRate} />
                    <StatChip label="ワンオン率" value={player.oneOnRate} />
                    <StatChip label="GIR率" value={player.girRate} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {playerSummaries.map((summary) => (
            <div
              key={summary.playerName}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                overflow: "hidden"
              }}
            >
              <button
                onClick={() => toggleOpen(summary.playerName)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  padding: 12,
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>
                      {summary.playerName}
                    </div>
                    <div
                      style={{
                        padding: "5px 10px",
                        borderRadius: 999,
                        background: "#ffffff",
                        border: "1px solid #dbe2ea",
                        fontWeight: 900,
                        color: summary.diff <= 0 ? "#16a34a" : "#dc2626"
                      }}
                    >
                      {summary.totalScore}打 / {summary.diff > 0 ? `+${summary.diff}` : summary.diff}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <StatChip
                      label="平均Driver"
                      value={
                        summary.avgDriverDistance === "-"
                          ? "-"
                          : `${summary.avgDriverDistance}Y`
                      }
                    />
                    <StatChip label="FW率" value={summary.fwRate} />
                    <StatChip label="ワンオン率" value={summary.oneOnRate} />
                    <StatChip label="GIR率" value={summary.girRate} />
                    <StatChip
                      label=""
                      value={openPlayers[summary.playerName] ? "▲ 閉じる" : "▼ 詳細"}
                    />
                  </div>
                </div>
              </button>

              {openPlayers[summary.playerName] && (
                <div style={{ padding: "0 10px 10px 10px" }}>
                  <div style={{ display: "grid", gap: 8 }}>
                    {summary.rounds.map((r, i) => {
                      const holeKey = `${summary.playerName}_${r.hole}`;
                      const holeOpen = !!openHoles[holeKey];

                      return (
  <div
    key={i}
    style={{
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      overflow: "hidden"
    }}
  >
    <div
      style={{
        display: "grid",gridTemplateColumns: "22px 26px 52px 56px 26px 32px 26px 22px",
        alignItems: "center",
        gap: 6,
        padding: "10px 8px",
        borderBottom: holeOpen ? "1px solid #e5e7eb" : "none",
        fontSize: 13
      }}
    >
      <div style={{ fontWeight: 800 }}>H{r.hole}</div>

    <div style={{ fontWeight: 900, textAlign: "center" }}>
  H{r.hole}
</div>

<div style={{ fontWeight: 900, textAlign: "center", color: r.diffColor }}>
  {r.score - r.par > 0 ? `+${r.score - r.par}` : r.score - r.par}
</div>
      <div style={{ fontWeight: 700 }}>
        {r.driveDistance ? `${r.driveDistance}Y` : "-"}
      </div>

      <div>{r.club}</div>

      <div>
        {r.par === 3
          ? r.fairwayKeep === "keep"
            ? "O○"
            : "-"
          : r.club === "Driver"
            ? r.fairwayKeep === "keep"
              ? "F○"
              : "-"
            : "-"}
      </div>

      <div style={{ textAlign: "center" }}>{r.inside100}</div>

      <div style={{ textAlign: "center" }}>{r.putt}</div>

      <div
        onClick={() => toggleHoleOpen(summary.playerName, r.hole)}
        style={{
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 800,
          textAlign: "center"
        }}
      >
        {holeOpen ? "▲" : "▼"}
      </div>
    </div>

    {holeOpen && (
      <div style={{ padding: 10 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px",
            gap: 8
          }}
        >
          <MiniBox label="役" value={r.roleText} />
          <MiniBox label="OP" value={r.olympicPoint} />
        </div>
      </div>
    )}
  </div>
);
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 18,
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={handleSave}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: "none",
              background: "#16a34a",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            保存する
          </button>

          <button
            onClick={() => nav("/")}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#0f172a",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            トップに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
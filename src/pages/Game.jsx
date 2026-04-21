import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Game() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const holeCount = 18;

  const rawPlayers = JSON.parse(localStorage.getItem("players") || "[]");
  const playerNames = Array.isArray(rawPlayers)
    ? rawPlayers.map((p, i) =>
        typeof p === "string" ? p : p?.playerName || `Player ${i + 1}`
      )
    : [];

  const savedEvents = JSON.parse(localStorage.getItem("events") || "[]");
  const activeEvents = Array.isArray(savedEvents)
    ? savedEvents.filter((e) => e && e.active)
    : [];

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

  const clubs =
    JSON.parse(localStorage.getItem("clubs") || "null") || defaultClubs;

  const pars = JSON.parse(localStorage.getItem("pars") || "[]");

  const getInitialHole = () => {
    const h = Number(searchParams.get("hole"));
    if (!Number.isFinite(h) || h < 1) return 1;
    if (h > holeCount) return holeCount;
    return h;
  };

  const [hole, setHole] = useState(getInitialHole());
  const [rows, setRows] = useState([]);

  const [clubModalPlayer, setClubModalPlayer] = useState(null);
  const [inside100ModalPlayer, setInside100ModalPlayer] = useState(null);
  const [puttModalPlayer, setPuttModalPlayer] = useState(null);
  const [eventModalPlayer, setEventModalPlayer] = useState(null);
  const [driveModalPlayer, setDriveModalPlayer] = useState(null);

  const currentPar = Number(pars[hole - 1]) || 4;

  const emptyRow = useMemo(
    () => ({
      score: "",
      inside100: "",
      greenOnDistance: "",
      driveDistance: "",
      fairwayKeep: "",
      club: "",
      putt: "",
      eventChecks: {}
    }),
    []
  );

  const getSavedRounds = () =>
    JSON.parse(localStorage.getItem("rounds") || "[]");

  useEffect(() => {
    const rounds = getSavedRounds();
    const holeData = rounds.find((r) => Number(r?.hole) === hole);

    if (holeData?.players?.length) {
      const nextRows = playerNames.map((_, idx) => ({
        score: String(holeData.players[idx]?.score ?? ""),
        inside100: String(holeData.players[idx]?.inside100 ?? ""),
        greenOnDistance: String(
          holeData.players[idx]?.greenOnDistance ?? ""
        ),
        driveDistance: String(holeData.players[idx]?.driveDistance ?? ""),
        fairwayKeep: holeData.players[idx]?.fairwayKeep || "",
        club: holeData.players[idx]?.club || "",
        putt: String(holeData.players[idx]?.putt ?? ""),
        eventChecks: holeData.players[idx]?.eventChecks || {}
      }));
      setRows(nextRows);
    } else {
      setRows(playerNames.map(() => ({ ...emptyRow })));
    }
  }, [hole, playerNames.length, emptyRow]);

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const scoreAdjust = (index, delta) => {
    const current = Number(rows[index]?.score) || 0;
    const nextValue = Math.max(0, current + delta);
    updateRow(index, "score", String(nextValue));
  };

  const setScoreFromPar = (index, delta) => {
    const nextValue = Math.max(0, currentPar + delta);
    updateRow(index, "score", String(nextValue));
  };

  const toggleEvent = (playerIndex, key) => {
    const target = activeEvents.find((e) => e.key === key);
    if (!target) return;

    setRows((prev) => {
      const next = [...prev];
      const checks = { ...(next[playerIndex]?.eventChecks || {}) };

      if (target.single) {
        activeEvents
          .filter((e) => e.single)
          .forEach((e) => {
            checks[e.key] = false;
          });
        checks[key] = !next[playerIndex]?.eventChecks?.[key];
      } else {
        checks[key] = !checks[key];
      }

      next[playerIndex] = {
        ...next[playerIndex],
        eventChecks: checks
      };
      return next;
    });
  };

  const saveRound = () => {
    const rounds = getSavedRounds();

    const newData = {
      hole,
      players: rows.map((row, index) => ({
        playerName: playerNames[index] || `Player ${index + 1}`,
        score: Number(row.score) || 0,
        inside100: Number(row.inside100) || 0,
        greenOnDistance: Number(row.greenOnDistance) || 0,
        driveDistance: Number(row.driveDistance) || 0,
        fairwayKeep: row.fairwayKeep || "",
        club: row.club || "",
        putt: Number(row.putt) || 0,
        eventChecks: row.eventChecks || {}
      }))
    };

    const filtered = rounds.filter((r) => Number(r?.hole) !== hole);
    const updated = [...filtered, newData].sort(
      (a, b) => Number(a.hole) - Number(b.hole)
    );

    localStorage.setItem("rounds", JSON.stringify(updated));
  };

  const nextHole = () => {
    saveRound();
    if (hole < holeCount) {
      const h = hole + 1;
      setHole(h);
      navigate(`/game?hole=${h}`);
    } else {
      navigate("/result");
    }
  };

  const prevHole = () => {
    saveRound();
    if (hole > 1) {
      const h = hole - 1;
      setHole(h);
      navigate(`/game?hole=${h}`);
    }
  };

  const getDiff = (score) => {
    if (score === "") return null;
    return Number(score) - currentPar;
  };

  const getDiffLabel = (score) => {
    const s = Number(score);
    const diff = s - currentPar;

    if (currentPar === 3 && s === 1) return "HOLE IN ONE";
    if (currentPar === 5 && s === 2) return "ALBATROSS";
    if (diff === -2) return "EAGLE";
    if (diff === -1) return "BIRDIE";
    if (diff === 0) return "PAR";
    if (diff === 1) return "BOGEY";
    if (diff === 2) return "DOUBLE";

    return `${diff > 0 ? "+" : ""}${diff}`;
  };

  const getDiffColor = (score) => {
    if (score === "") return "#64748b";
    const diff = getDiff(score);
    if (diff <= -1) return "#16a34a";
    if (diff === 0) return "#2563eb";
    return "#dc2626";
  };

  const getScoreBadgeStyle = (score) => ({
    padding: "8px 12px",
    borderRadius: 999,
    background: "#ffffff",
    border: `2px solid ${score === "" ? "#dbe2ea" : getDiffColor(score)}`,
    fontWeight: "bold",
    color: getDiffColor(score),
    width: "100%",
    textAlign: "center",
    boxSizing: "border-box"
  });

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    background: "#ffffff",
    minWidth: 0
  };

  const getCenterScoreStyle = (score) => ({
    ...inputStyle,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
    color: getDiffColor(score),
    border: `2px solid ${score === "" ? "#cbd5e1" : getDiffColor(score)}`,
    background:
      score === ""
        ? "#ffffff"
        : getDiff(score) <= -1
          ? "#f0fdf4"
          : getDiff(score) === 0
            ? "#eff6ff"
            : "#fef2f2"
  });

  const quickButtonStyle = (active) => ({
    padding: "10px 8px",
    borderRadius: 12,
    border: active ? "2px solid #2563eb" : "1px solid #dbe2ea",
    background: active ? "#2563eb" : "#ffffff",
    color: active ? "#ffffff" : "#0f172a",
    fontWeight: "bold",
    fontSize: 14,
    cursor: "pointer",
    minHeight: 48
  });

  const eventButtonStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "12px 14px",
    borderRadius: 14,
    border: active ? "2px solid #2563eb" : "1px solid #dbe2ea",
    background: active ? "#eff6ff" : "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    width: "100%",
    textAlign: "left"
  });

  const modalBackdropStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    boxSizing: "border-box",
    zIndex: 1000
  };

  const modalCardStyle = {
    width: "100%",
    maxWidth: 560,
    maxHeight: "80vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 18px 40px rgba(15,23,42,0.20)"
  };

  const closeButtonStyle = {
    border: "none",
    background: "#e2e8f0",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "bold"
  };

  const selectedEventLabels = (playerIndex) => {
    const checks = rows[playerIndex]?.eventChecks || {};
    return activeEvents.filter((e) => checks[e.key]).map((e) => e.label);
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
          maxWidth: 1040,
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
          <div style={{ fontSize: 14, opacity: 0.9 }}>ROUND INPUT</div>
          <h1 style={{ margin: "6px 0 0 0", fontSize: 32 }}>ゲーム画面</h1>
          <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>
            ホール {hole} / {holeCount}
          </div>
          <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>
            このホールのパー：{currentPar}
          </div>
        </div>

        {playerNames.length === 0 ? (
          <div
            style={{
              padding: 20,
              borderRadius: 16,
              background: "#fff7ed",
              border: "1px solid #fdba74",
              color: "#9a3412",
              fontWeight: 700
            }}
          >
            プレイヤー情報がありません。最初から設定してください。
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {playerNames.map((player, playerIndex) => {
              const row = rows[playerIndex] || emptyRow;
              const labels = selectedEventLabels(playerIndex);

              return (
                <div
                  key={playerIndex}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 22,
                    padding: 14
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 10,
                      marginBottom: 14
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: 22 }}>{player}</h2>
                    <div style={getScoreBadgeStyle(row.score)}>
                      {row.score === ""
                        ? "未入力"
                        : `${row.score}打 / ${getDiffLabel(row.score)}`}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                      marginBottom: 12
                    }}
                  >
                    <button
                      onClick={() => setScoreFromPar(playerIndex, -2)}
                      style={{
                        ...quickButtonStyle(
                          Number(row.score) === currentPar - 2
                        ),
                        whiteSpace: "nowrap"
                      }}
                    >
                      {currentPar === 3 ? "Hole in One" : "Eagle"}
                    </button>

                    <button
                      onClick={() => setScoreFromPar(playerIndex, -1)}
                      style={quickButtonStyle(
                        Number(row.score) === currentPar - 1
                      )}
                    >
                      Birdie
                    </button>

                    <button
                      onClick={() => setScoreFromPar(playerIndex, 0)}
                      style={quickButtonStyle(Number(row.score) === currentPar)}
                    >
                      Par
                    </button>

                    <button
                      onClick={() => setScoreFromPar(playerIndex, 1)}
                      style={quickButtonStyle(
                        Number(row.score) === currentPar + 1
                      )}
                    >
                      Bogey
                    </button>

                    <button
                      onClick={() => setScoreFromPar(playerIndex, 2)}
                      style={{
                        ...quickButtonStyle(
                          Number(row.score) === currentPar + 2
                        ),
                        gridColumn: "1 / -1"
                      }}
                    >
                      Double
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "64px 1fr 64px",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 14
                    }}
                  >
                    <button
                      onClick={() => scoreAdjust(playerIndex, -1)}
                      style={{ ...quickButtonStyle(false), fontSize: 24 }}
                    >
                      −
                    </button>

                    <input
                      placeholder="打数"
                      value={row.score}
                      onChange={(e) =>
                        updateRow(playerIndex, "score", e.target.value)
                      }
                      style={getCenterScoreStyle(row.score)}
                    />

                    <button
                      onClick={() => scoreAdjust(playerIndex, 1)}
                      style={{ ...quickButtonStyle(false), fontSize: 24 }}
                    >
                      ＋
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 10
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setInside100ModalPlayer(playerIndex)}
                      style={{
                        ...inputStyle,
                        textAlign: "left",
                        cursor: "pointer",
                        color:
                          row.inside100 !== "" || row.greenOnDistance !== ""
                            ? "#0f172a"
                            : "#64748b"
                      }}
                    >
                      {row.inside100 !== "" || row.greenOnDistance !== ""
                        ? `100Y:${row.inside100 || "-"} / ON:${row.greenOnDistance || "-"}Y`
                        : "100Y以内 / ON距離"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDriveModalPlayer(playerIndex)}
                      style={{
                        ...inputStyle,
                        textAlign: "left",
                        cursor: "pointer",
                        color: row.driveDistance !== "" ? "#0f172a" : "#64748b"
                      }}
                    >
                      {row.driveDistance !== ""
                        ? `1打目:${row.driveDistance}Y`
                        : "1打目飛距離"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateRow(
                          playerIndex,
                          "fairwayKeep",
                          row.fairwayKeep === "keep" ? "" : "keep"
                        )
                      }
                      style={{
                        ...inputStyle,
                        textAlign: "center",
                        cursor: "pointer",
                        background:
                          row.fairwayKeep === "keep" ? "#dcfce7" : "#ffffff",
                        border:
                          row.fairwayKeep === "keep"
                            ? "2px solid #16a34a"
                            : "1px solid #cbd5e1",
                        color:
                          row.fairwayKeep === "keep" ? "#166534" : "#64748b",
                        fontWeight: "bold"
                      }}
                    >
                      {currentPar === 3
                        ? row.fairwayKeep === "keep"
                          ? "ワンオン○"
                          : "ワンオン"
                        : row.fairwayKeep === "keep"
                          ? "FWキープ○"
                          : "FWキープ"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setClubModalPlayer(playerIndex)}
                      style={{
                        ...inputStyle,
                        textAlign: "left",
                        cursor: "pointer",
                        color: row.club ? "#0f172a" : "#64748b"
                      }}
                    >
                      {row.club || "クラブ"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPuttModalPlayer(playerIndex)}
                      style={{
                        ...inputStyle,
                        textAlign: "left",
                        cursor: "pointer",
                        color: row.putt !== "" ? "#0f172a" : "#64748b"
                      }}
                    >
                      {row.putt !== "" ? `パット:${row.putt}` : "パット"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEventModalPlayer(playerIndex)}
                      style={{
                        ...inputStyle,
                        textAlign: "left",
                        cursor: "pointer",
                        color: labels.length > 0 ? "#0f172a" : "#64748b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {labels.length > 0 ? labels.join(" / ") : "役"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
            marginTop: 18
          }}
        >
          <button
            onClick={prevHole}
            style={{
              padding: "16px 20px",
              borderRadius: 16,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#0f172a",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            前のホール
          </button>

          <button
            onClick={nextHole}
            style={{
              padding: "16px 20px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            {hole === 18 ? "保存して結果へ" : "保存して次へ"}
          </button>
        </div>
      </div>

      {inside100ModalPlayer !== null && (
        <div
          onClick={() => setInside100ModalPlayer(null)}
          style={modalBackdropStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 14
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>
                100Y以内 / グリーンON距離
              </h2>
              <button
                onClick={() => setInside100ModalPlayer(null)}
                style={closeButtonStyle}
              >
                閉じる
              </button>
            </div>

            <div style={{ marginBottom: 10, fontWeight: 800 }}>
              100Y以内の回数
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                marginBottom: 14
              }}
            >
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    updateRow(inside100ModalPlayer, "inside100", String(n))
                  }
                  style={quickButtonStyle(
                    Number(rows[inside100ModalPlayer]?.inside100) === n
                  )}
                >
                  {n}
                </button>
              ))}
            </div>

            <input
              placeholder="100Y以内 4以上は手入力"
              value={
                [0, 1, 2, 3].includes(
                  Number(rows[inside100ModalPlayer]?.inside100)
                )
                  ? ""
                  : rows[inside100ModalPlayer]?.inside100 || ""
              }
              onChange={(e) =>
                updateRow(
                  inside100ModalPlayer,
                  "inside100",
                  e.target.value
                )
              }
              style={{ ...inputStyle, marginBottom: 16 }}
            />

            <div style={{ marginBottom: 10, fontWeight: 800 }}>
              100Y以上からグリーンONした距離
            </div>

            <input
              placeholder="例: 135"
              value={rows[inside100ModalPlayer]?.greenOnDistance || ""}
              onChange={(e) =>
                updateRow(
                  inside100ModalPlayer,
                  "greenOnDistance",
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 10,
                marginTop: 14
              }}
            >
              <button
                onClick={() => setInside100ModalPlayer(null)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                OK
              </button>

              <button
                onClick={() => {
                  updateRow(inside100ModalPlayer, "inside100", "");
                  updateRow(inside100ModalPlayer, "greenOnDistance", "");
                  setInside100ModalPlayer(null);
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #ef4444",
                  background: "#fff5f5",
color: "#b91c1c",
fontWeight: "bold",
cursor: "pointer"
                }}
              >
                クリア
              </button>
            </div>
          </div>
        </div>
      )}

      {driveModalPlayer !== null && (
        <div
          onClick={() => setDriveModalPlayer(null)}
          style={modalBackdropStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 14
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>1打目飛距離</h2>
              <button
                onClick={() => setDriveModalPlayer(null)}
                style={closeButtonStyle}
              >
                閉じる
              </button>
            </div>

            <input
              placeholder="例: 230"
              value={rows[driveModalPlayer]?.driveDistance || ""}
              onChange={(e) =>
                updateRow(driveModalPlayer, "driveDistance", e.target.value)
              }
              style={inputStyle}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 10,
                marginTop: 14
              }}
            >
              <button
                onClick={() => setDriveModalPlayer(null)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                OK
              </button>

              <button
                onClick={() => {
                  updateRow(driveModalPlayer, "driveDistance", "");
                  setDriveModalPlayer(null);
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #ef4444",
                  background: "#fff5f5",
                  color: "#b91c1c",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                クリア
              </button>
            </div>
          </div>
        </div>
      )}

      {puttModalPlayer !== null && (
        <div
          onClick={() => setPuttModalPlayer(null)}
          style={modalBackdropStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 14
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>パット</h2>
              <button
                onClick={() => setPuttModalPlayer(null)}
                style={closeButtonStyle}
              >
                閉じる
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                marginBottom: 14
              }}
            >
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    updateRow(puttModalPlayer, "putt", String(n));
                    setPuttModalPlayer(null);
                  }}
                  style={quickButtonStyle(
                    Number(rows[puttModalPlayer]?.putt) === n
                  )}
                >
                  {n}
                </button>
              ))}
            </div>

            <input
              placeholder="4以上は手入力"
              value={
                [0, 1, 2, 3].includes(Number(rows[puttModalPlayer]?.putt))
                  ? ""
                  : rows[puttModalPlayer]?.putt || ""
              }
              onChange={(e) =>
                updateRow(puttModalPlayer, "putt", e.target.value)
              }
              style={inputStyle}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 10,
                marginTop: 14
              }}
            >
              <button
                onClick={() => setPuttModalPlayer(null)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                OK
              </button>

              <button
                onClick={() => {
                  updateRow(puttModalPlayer, "putt", "");
                  setPuttModalPlayer(null);
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #ef4444",
                  background: "#fff5f5",
                  color: "#b91c1c",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                クリア
              </button>
            </div>
          </div>
        </div>
      )}

      {clubModalPlayer !== null && (
        <div
          onClick={() => setClubModalPlayer(null)}
          style={modalBackdropStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 14
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>クラブ選択</h2>
              <button
                onClick={() => setClubModalPlayer(null)}
                style={closeButtonStyle}
              >
                閉じる
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {clubs.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    updateRow(clubModalPlayer, "club", item);
                    setClubModalPlayer(null);
                  }}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border:
                      rows[clubModalPlayer]?.club === item
                        ? "2px solid #2563eb"
                        : "1px solid #dbe2ea",
                    background:
                      rows[clubModalPlayer]?.club === item
                        ? "#eff6ff"
                        : "#ffffff",
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize: 16,
                    cursor: "pointer"
                  }}
                >
                  {item}
                </button>
              ))}

              <button
                onClick={() => {
                  updateRow(clubModalPlayer, "club", "");
                  setClubModalPlayer(null);
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #ef4444",
                  background: "#fff5f5",
                  color: "#b91c1c",
                  textAlign: "left",
                  fontWeight: "bold",
                  fontSize: 16,
                  cursor: "pointer"
                }}
              >
                クラブ選択をクリア
              </button>
            </div>
          </div>
        </div>
      )}

      {eventModalPlayer !== null && (
        <div
          onClick={() => setEventModalPlayer(null)}
          style={modalBackdropStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 14
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>役を選択</h2>
              <button
                onClick={() => setEventModalPlayer(null)}
                style={closeButtonStyle}
              >
                閉じる
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {activeEvents.length === 0 ? (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: "#f8fafc",
                    border: "1px solid #dbe2ea",
                    color: "#64748b"
                  }}
                >
                  有効な役がありません。役設定でONにしてください。
                </div>
              ) : (
                activeEvents.map((event) => (
                  <button
                    key={event.key}
                    type="button"
                    onClick={() => toggleEvent(eventModalPlayer, event.key)}
                    style={eventButtonStyle(
                      !!rows[eventModalPlayer]?.eventChecks?.[event.key]
                    )}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        whiteSpace: "normal",
                        overflowWrap: "break-word"
                      }}
                    >
                      {event.label}
                    </span>
                    <span style={{ color: "#64748b", flexShrink: 0 }}>
                      {event.point > 0 ? `+${event.point}` : event.point}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 10,
                marginTop: 14
              }}
            >
              <button
                onClick={() => setEventModalPlayer(null)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                OK
              </button>

              <button
                onClick={() => updateRow(eventModalPlayer, "eventChecks", {})}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #ef4444",
                  background: "#fff5f5",
                  color: "#b91c1c",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                全解除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
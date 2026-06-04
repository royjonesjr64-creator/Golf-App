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

  const getScore = (item) =>
    item.totalScore || item.ranking?.[0]?.totalScore || 0;

  const getInside100Total = (item) =>
    (item.rounds || []).reduce((sum, round) => {
      return (
        sum +
        (round.players || []).reduce((pSum, player) => {
          return pSum + Number(player.inside100 || 0);
        }, 0)
      );
    }, 0);

  const totalHoles = history.reduce(
    (total, h) => total + (h.rounds || []).length,
    0
  );

  const totalInside100 = history.reduce(
    (sum, h) => sum + getInside100Total(h),
    0
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: 16,
        boxSizing: "border-box",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 16 }}>ラウンド履歴</h1>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: "0 0 12px" }}>コース別成績</h2>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: "0 0 12px" }}>
            クラブ別平均飛距離
          </h2>

          {Object.entries(
            history.reduce((acc, item) => {
              (item.rounds || []).forEach((round) => {
                (round.players || []).forEach((player) => {
                  const club =
                    player.club ||
                    player.selectedClub ||
                    player.clubName ||
                    "";

                  const distance = Number(
                    player.driveDistance ||
                      player.greenOnDistance ||
                      player.distance ||
                      0
                  );

                  if (!club || !distance) return;

                  if (!acc[club]) {
                    acc[club] = { count: 0, total: 0 };
                  }

                  acc[club].count += 1;
                  acc[club].total += distance;
                });
              });

              return acc;
            }, {})
          )
            .sort(
              (a, b) =>
                b[1].total / b[1].count -
                a[1].total / a[1].count
            )
            .map(([club, data]) => {
              const average = Math.round(data.total / data.count);
              const maxDistance = Math.max(
                1,
                ...Object.entries(
                  history.reduce((acc, item) => {
                    (item.rounds || []).forEach((round) => {
                      (round.players || []).forEach((player) => {
                        const c =
                          player.club ||
                          player.selectedClub ||
                          player.clubName ||
                          "";

                        const d = Number(
                          player.driveDistance ||
                            player.greenOnDistance ||
                            player.distance ||
                            0
                        );

                        if (!c || !d) return;
                        if (!acc[c]) acc[c] = { total: 0, count: 0 };

                        acc[c].total += d;
                        acc[c].count += 1;
                      });
                    });

                    return acc;
                  }, {})
                ).map(([, v]) => v.total / v.count)
              );

              const barWidth = Math.max(
                8,
                Math.round((average / maxDistance) * 100)
              );

              return (
                <div
                  key={club}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                      {club}
                    </div>

                    <div
                      style={{
                        color: "#2563eb",
                        fontWeight: 900,
                        fontSize: 22,
                      }}
                    >
                      {average}y
                    </div>
                  </div>

                  <div
                    style={{
                      height: 12,
                      background: "#e5e7eb",
                      borderRadius: 999,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${barWidth}%`,
                        background: "#2563eb",
                        borderRadius: 999,
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    使用回数：{data.count}回
                  </div>
                </div>
              );
            })}
        </div>

        {Object.entries(
          history.reduce((acc, item) => {
            const course = item.courseName || "コース未設定";
            const score = getScore(item);

            if (!acc[course]) {
              acc[course] = { count: 0, total: 0, best: 999 };
            }

            acc[course].count += 1;
            acc[course].total += score;
            acc[course].best = Math.min(acc[course].best, score);

            return acc;
          }, {})
        ).map(([course, data]) => (
          <div
            key={course}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div style={{ fontWeight: 700 }}>{course}</div>

            <div style={{ fontSize: 14, color: "#64748b" }}>
              回数: {data.count}回　 平均:
              {Math.round(data.total / data.count)}打　 ベスト:
              {data.best}打
            </div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "stretch",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <InfoChip
            label="平均"
            value={Math.round(
              history.reduce((sum, h) => sum + getScore(h), 0) /
                history.length
            )}
          />

          <InfoChip
            label="Best"
            value={Math.min(...history.map((h) => getScore(h) || 999))}
          />

          <InfoChip label="回数" value={history.length} />

          <InfoChip
            label="100y平均"
            value={(totalInside100 / Math.max(totalHoles, 1)).toFixed(1)}
          />

          <InfoChip
            label="パット平均"
            value={Math.round(
              history.reduce((sum, h) => sum + (h.totalPutt || 0), 0) /
                history.length
            )}
          />

          <InfoChip
            label="FWキープ率"
            value={`${Math.round(
              ((history.reduce((keep, h) => {
                return (
                  keep +
                  (h.rounds || []).reduce((sum, round) => {
                    const player = round.players?.[0];
                    return (
                      sum +
                      (player?.fairwayKeep === "keep" ? 1 : 0)
                    );
                  }, 0)
                );
              }, 0) /
                Math.max(
                  history.reduce((total, h) => {
                    return (
                      total +
                      (h.rounds || []).reduce((sum, round) => {
                        const player = round.players?.[0];
                        return sum + (player?.fairwayKeep ? 1 : 0);
                      }, 0)
                    );
                  }, 0),
                  1
                )) *
                100) ||
                0
            )}%`}
          />

          <InfoChip label="100y合計" value={totalInside100} />

          <InfoChip
            label="100y以内1打率"
            value={`${Math.round(
              (history.reduce((count, h) => {
                return (
                  count +
                  (h.rounds || []).reduce((roundCount, round) => {
                    return (
                      roundCount +
                      (round.players || []).reduce(
                        (playerCount, player) => {
                          const inside100 = Number(
                            player.inside100 || 0
                          );
                          return (
                            playerCount + (inside100 === 1 ? 1 : 0)
                          );
                        },
                        0
                      )
                    );
                  }, 0)
                );
              }, 0) /
                Math.max(totalInside100, 1)) *
                100
            )}%`}
          />
        </div>
      )}

      <div
        style={{
          marginBottom: 18,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
        }}
      >
        <h2 style={{ margin: "0 0 14px", color: "#2563eb" }}>
          ティー別成績
        </h2>

        {Object.entries(
          history.reduce((acc, item) => {
            const tee = item.tee || "未設定";
            const score = getScore(item);

            if (!acc[tee]) {
              acc[tee] = { count: 0, total: 0, best: 999 };
            }

            acc[tee].count += 1;
            acc[tee].total += Number(score);
            acc[tee].best = Math.min(acc[tee].best, Number(score));

            return acc;
          }, {})
        ).map(([tee, data]) => (
          <div
            key={tee}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {tee}
            </div>

            <div style={{ color: "#64748b", marginTop: 4 }}>
              回数: {data.count}回　 平均:
              {Math.round(data.total / data.count)}打　 ベスト:
              {data.best}打
            </div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 18,
            marginBottom: 18,
            boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
          }}
        >
          <h2 style={{ margin: "0 0 14px" }}>スコア推移</h2>

          <div
            style={{
              display: "flex",
              alignItems: "end",
              gap: 10,
              height: 180,
            }}
          >
            {history
              .slice()
              .reverse()
              .map((item, index) => {
                const score =
                  getScore(item) ||
                  item.rounds?.reduce(
                    (sum, r) => sum + (Number(r.score) || 0),
                    0
                  ) ||
                  0;

                const barHeight = score
                  ? Math.min(120, Math.max(20, score))
                  : 20;

                return (
                  <div
                    key={item.id || index}
                    style={{
                      position: "relative",
                      width: 60,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>
                      {score || "-"}
                    </div>

                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: "#16a34a",
                        marginBottom: 4,
                        zIndex: 1,
                      }}
                    />

                    <div
                      style={{
                        width: "70%",
                        height: barHeight,
                        borderRadius: "10px 10px 0 0",
                        background: "#16a34a",
                      }}
                    />

                    {index < history.length - 1 && (
                      <div
                        style={{
                          position: "absolute",
                          width: 60,
                          height: 2,
                          background: "#94a3b8",
                          top: 40,
                          left: 35,
                          zIndex: 0,
                        }}
                      />
                    )}

                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        marginTop: 6,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(item.playDate || item.date || "").slice(5, 10)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

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
                {item.golfName || "ゴルフ場名なし"}
              </h2>

              <div
                style={{
                  fontWeight: 800,
                  marginBottom: 6,
                  color: "#2563eb",
                  fontSize: 15,
                }}
              >
                {item.courseName || "コース名なし"}
              </div>

              {item.tee ? (
                <div
                  style={{
                    color: "#64748b",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  ティー：{item.tee}
                </div>
              ) : null}

              <div style={{ color: "#64748b", fontSize: 14 }}>
                {item.playDate || item.date || "-"}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <InfoChip
                  label="スコア"
                  value={`${item.ranking?.[0]?.totalScore || "-"}打`}
                />

                <InfoChip
                  label="100y"
                  value={`${getInside100Total(item) || "-"}打`}
                />

                <InfoChip
                  label="パット"
                  value={`${
                    item.rounds?.reduce((sum, r) => {
                      return (
                        sum +
                        (r.players || []).reduce(
                          (pSum, p) => pSum + Number(p.putt || 0),
                          0
                        )
                      );
                    }, 0) || "-"
                  }打`}
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

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}
                        >
                          <InfoChip
                            label="スコア"
                            value={`${player.totalScore || "-"}打`}
                          />
                          <InfoChip label="差" value={player.diff ?? "-"} />
                          <InfoChip
                            label="OP"
                            value={player.totalOlympic ?? "-"}
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
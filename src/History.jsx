import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
const [selectedClub, setSelectedClub] = useState(null);
  
const [targetScore, setTargetScore] = useState(90);
useEffect(() => {

    const saved = JSON.parse(localStorage.getItem("golf_history") || "[]");
    setHistory(saved);
  }, []);

  const openDetail = (item) => {
    localStorage.setItem("rounds", JSON.stringify(item.rounds || []));
    localStorage.setItem("pars", JSON.stringify(item.pars || []));
    localStorage.setItem("players", JSON.stringify(item.players || []));
    localStorage.setItem( "olympicEvents", JSON.stringify(item.olympicEvents || []));
localStorage.setItem(
  "events",
  JSON.stringify(item.events || item.olympicEvents || [])
);

localStorage.setItem(
  "olympicEvents",
  JSON.stringify(item.olympicEvents || item.events || [])
);
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

  const getScore = (item) => {
  const score = Number(item.totalScore || item.ranking?.[0]?.totalScore || 0);

  if (!score || score < 50) return 0;

  return score;
};

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
const inside100Avg = totalInside100 / Math.max(totalHoles, 1);

const fwKeepRate =
  history.reduce((keep, h) => {
    const p = h.rounds?.[0]?.players?.[0];
    return keep + (p?.fairwayKeep ? 1 : 0);
  }, 0) / Math.max(history.length, 1);

const puttAverage =
  history.reduce((sum, h) => sum + (h.totalPutt || 0), 0) /
  Math.max(history.length, 1);

const weakList = [
  {
    name: "ティーショット",
    score: fwKeepRate < 0.5 ? 3 : fwKeepRate < 0.7 ? 2 : 1,
    advice: "FWキープ率改善が最優先です",
  },
  {
    name: "100y以内",
    score: inside100Avg > 2.5 ? 3 : inside100Avg > 2.0 ? 2 : 1,
    advice: "アプローチ改善で大幅なスコアアップが期待できます",
  },
  {
    name: "パット",
    score: puttAverage > 36 ? 3 : puttAverage > 32 ? 2 : 1,
    advice: "3パット削減が最優先です",
  },
].sort((a, b) => b.score - a.score);
<div
  style={{
    marginTop: 10,
    padding: 10,
    background: "#fff7ed",
    border: "1px solid #fdba74",
    borderRadius: 10,
    fontWeight: 700,
    color: "#9a3412",
  }}
>
  改善見込み：
  約{weakList[0].score * 2}打アップ
</div>
const weakPoint = weakList[0].name;
const predictedScore = Math.round(
  history.reduce((sum, h) => sum + getScore(h), 0) /
    Math.max(history.filter((h) => getScore(h) > 0).length, 1)
);

const suggestedTargetScore = Math.max(72, predictedScore - weakList[0].score * 2);

const targetAchievement = Math.min(
  100,
  Math.max(
    0,
    Math.round(
      ((predictedScore - targetScore) /
        Math.max(predictedScore - suggestedTargetScore, 1)) *
        100
    )
  )
);
const courseRanking = Object.entries(
  history.reduce((acc, item) => {
    const course =
      item.courseName ||
      item.golfName ||
      "コース未設定";

    const score = getScore(item);

    if (
      !acc[course] ||
      score < acc[course]
    ) {
      acc[course] = score;
    }

    return acc;
  }, {})
)
.sort((a, b) => a[1] - b[1])
.slice(0, 5);
const clubHistory = [];

history.forEach((item) => {
  (item.rounds || []).forEach((round) => {
    const players = round.players?.length ? round.players : [round];

    players.forEach((player) => {
      const club =
        player.club ||
        player.selectedClub ||
        player.clubName ||
        player.clubType ||
        "";

      const distance =
        parseInt(
          String(
            player.driveDistance ||
              player.greenOnDistance ||
              player.distance ||
              0
          )
            .normalize("NFKC")
            .replace(/[^\d]/g, ""),
          10
        ) || 0;

      if (!club || !distance) return;

      clubHistory.push({
        club,
        distance,
        date: item.playDate || item.date || "",
      });
    });
  });
});

const selectedClubHistory = selectedClub
  ? clubHistory.filter((item) => item.club === selectedClub)
  : [];
const bestRound = history.length
  ? history.reduce((best, item) => {
      const score = getScore(item);
      return score && score < getScore(best) ? item : best;
    }, history[0])
  : null;

const bestRoundScore = bestRound ? getScore(bestRound) : 0;

const bestRoundPutts = bestRound
  ? (bestRound.rounds || []).reduce((sum, r) => {
      return sum + (r.players || []).reduce((pSum, p) => {
        return pSum + Number(p.putt || 0);
      }, 0);
    }, 0)
  : 0;

const bestRoundFw = bestRound
  ? (bestRound.rounds || []).filter((r) => {
      const p = r.players?.[0] || r;
      return p.fairwayKeep === "keep";
    }).length
  : 0;

const bestRoundFwTotal = bestRound
  ? (bestRound.rounds || []).filter((r) => {
      const p = r.players?.[0] || r;
      return p.fairwayKeep;
    }).length
  : 0;

const bestRoundFwRate = Math.round(
  (bestRoundFw / Math.max(bestRoundFwTotal, 1)) * 100
);

const validHistory = history.filter((item) => getScore(item) > 0);
const under90Count = validHistory.filter(
  (h) => getScore(h) <= 90
).length;

const under90Rate = Math.round(
  (under90Count / Math.max(validHistory.length, 1)) * 100
);
const recent5 = validHistory.slice(0, 5);
const recent5Average = recent5.length
  ? Math.round(
      recent5.reduce((sum, item) => sum + getScore(item), 0) /
        recent5.length
    )

  : 0;

const courseAnalysis = Object.entries(
  validHistory.reduce((acc, item) => {
 const course = item.courseName || item.golfName || "コース未設定";
    const score = getScore(item);

    if (!acc[course]) {
      acc[course] = { count: 0, totalScore: 0, best: 999 };
    }

    acc[course].count += 1;
    acc[course].totalScore += score;
    acc[course].best = Math.min(acc[course].best, score);

    return acc;
  }, {})
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
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  }}
>
  <h2 style={{ margin: "0 0 12px", color: "#2563eb" }}>
    🎯 目標スコア
  </h2>

  <input
    type="number"
    value={targetScore}
    onChange={(e) => {
      setTargetScore(Number(e.target.value));
      localStorage.setItem("targetScore", e.target.value);
    }}
    style={{
      width: 100,
      padding: 10,
      borderRadius: 10,
      border: "1px solid #cbd5e1",
      fontSize: 20,
      fontWeight: 900,
      marginBottom: 10,
    }}
  />

  <div style={{ fontWeight: 800 }}>
    現在平均：{predictedScore || "-"}打
  </div>
<div style={{ fontWeight: 800, marginTop: 4, color: "#2563eb" }}>
  最近5R平均：{recent5Average || "-"}打
</div>
<div style={{ fontWeight: 800, marginTop: 4, color: "#16a34a" }}>
  ベスト：{Math.min(...validHistory.map((h) => getScore(h)))}打
</div>

<div style={{ fontWeight: 800, marginTop: 4, color: "#64748b" }}>
  ベストとの差：
  {predictedScore - Math.min(...validHistory.map((h) => getScore(h)))}打
</div>
  <div style={{ fontWeight: 800, color: "#dc2626", marginTop: 6 }}>
    目標まであと {Math.max(0, predictedScore - targetScore)}打
  </div>

  <div
  style={{
    marginTop: 10,
    padding: 16,
    background: "#ffffff",
    borderRadius: 12,
    textAlign: "center",
  }}
>
  <div style={{ fontSize: 12, color: "#64748b" }}>
    改善後予想
  </div>

  <div
    style={{
      fontSize: 32,
      fontWeight: 900,
      color: "#16a34a",
    }}
  >
    {suggestedTargetScore}打
  </div>
</div>
<div
  style={{
    marginTop: 10,
    padding: 10,
    background: "#ecfeff",
    borderRadius: 12,
  }}
>
  <div
    style={{
      fontSize: 12,
      fontWeight: 800,
      marginBottom: 6,
      color: "#0891b2",
    }}
  >
    目標達成率
  </div>

  <div
    style={{
      width: "100%",
      height: 14,
      background: "#e5e7eb",
      borderRadius: 999,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${Math.min(
          100,
          Math.round(
            ((predictedScore - targetScore) /
              Math.max(predictedScore - suggestedTargetScore, 1)) *
              100
          )
        )}%`,
        height: "100%",
        background: "#22c55e",
      }}
    />
  </div>

  <div
    style={{
      marginTop: 6,
      fontWeight: 800,
      textAlign: "center",
    }}
  >
    {Math.min(
      100,
      Math.round(
        Math.max(
  0,
  Math.min(
    100,
    Math.round(
      ((predictedScore - suggestedTargetScore) /
        Math.max(predictedScore - targetScore, 1)) *
        100
    )
  )
)
      )
    )}
    %
  </div>
</div>
</div>
<div
  style={{
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
  }}
>
  <h2 style={{ margin: "0 0 12px", color: "#2563eb" }}>
    コース分析
  </h2>

  {courseAnalysis.map(([course, data]) => (
    <div
      key={course}
      style={{
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16 }}>
        {course}
      </div>

      <div style={{ color: "#64748b", marginTop: 6 }}>
        回数：{data.count}回　
平均：{Math.round(data.totalScore / data.count)}打　
Best：{data.best}打　
改善余地：
{Math.round(data.totalScore / data.count) - data.best}打
<div
  style={{
    marginTop: 6,
    color:
      Math.round(data.totalScore / data.count) - data.best >= 10
        ? "#ef4444"
        : "#16a34a",
    fontWeight: 700,
  }}
>
  {Math.round(data.totalScore / data.count) - data.best >= 10
    ? "伸びしろ大"
    : "安定している"}
</div>
      </div>
    </div>
  ))}
</div>
<div
  style={{
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
  }}
>
  <h2
    style={{
      margin: "0 0 12px",
      color: "#dc2626",
    }}
  >
    弱点自動診断
  </h2>

 <div style={{ display: "grid", gap: 8 }}>
  {weakList.map((weak, index) => (
    <div
      key={weak.name}
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 10,
      }}
    >
      <div style={{ fontWeight: 900 }}>
        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} {weak.name}
      </div>

      <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
  {weak.advice}

 {index === 0 && (
  <div
    style={{
      marginTop: 8,
      padding: 10,
      background: "#fff7ed",
      border: "1px solid #fdba74",
      borderRadius: 12,
      fontWeight: 800,
      color: "#9a3412",
    }}
  >
    <div>改善見込み：約{weak.score * 2}打</div>

    <div
      style={{
        marginTop: 6,
        color: "#16a34a",
        fontWeight: 900,
      }}
    >
      改善後予想：{predictedScore - weak.score * 2}打
    </div>

    <div style={{ marginTop: 6 }}>
      改善後の目標スコア：{targetScore}打
    </div>
<div
  style={{
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px dashed #fdba74",
    fontWeight: 900,
    color: "#dc2626",
    textAlign: "center",
  }}
>
  あと {Math.max(0, (predictedScore - weak.score * 2) - targetScore)} 打で目標達成
</div>
  </div>
)}
</div>

    </div>

  ))}

</div>

</div>


{bestRound && (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 18,
      padding: 18,
      marginBottom: 16,
      boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
    }}
  >
    <h2 style={{ margin: "0 0 12px", color: "#16a34a" }}>
      ベストラウンド分析
    </h2>

    <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>
      {bestRoundScore}打
    </div>

    <div style={{ color: "#64748b", fontWeight: 700, marginBottom: 12 }}>
      {bestRound.golfName || "ゴルフ場名なし"} / {bestRound.courseName || "コース名なし"}
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
      }}
    >
      <InfoChip label="FW率" value={`${bestRoundFwRate}%`} />
      <InfoChip label="パット" value={`${bestRoundPutts}打`} />
      <InfoChip label="100y以内" value={`${getInside100Total(bestRound)}打`} />
      <InfoChip label="ティー" value={bestRound.tee || "-"} />
    </div>
  </div>
)}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 16,
          marginBottom: 16,
        }}
      >
<div
  style={{
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  }}
>
  <h2
    style={{
      margin: "0 0 12px",
      color: "#d97706",
    }}
  >
    🏆 コース別ベストランキング
  </h2>

  {courseRanking.map(
    ([course, score], index) => (
      <div
        key={course}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0",
          borderBottom:
            index !== courseRanking.length - 1
              ? "1px solid #f3f4f6"
              : "none",
        }}
      >
        <div>
          {index === 0
            ? "🥇"
            : index === 1
            ? "🥈"
            : index === 2
            ? "🥉"
            : "🏌️"}

          {" "}
          {course}
        </div>

        <div
          style={{
            fontWeight: 700,
            color: "#2563eb",
          }}
        >
          {score}打
        </div>
      </div>
    )
  )}
</div>
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
               const players = round.players?.length ? round.players : [round];

players.forEach((player) => {
                  const club =
                    player.club ||
                    player.selectedClub ||
                    player.clubName ||
                    "";

                  const distance =
  parseInt(
    String(
      player.driveDistance ||
      player.greenOnDistance ||
      player.distance ||
      0
    )
      .normalize("NFKC")
      .replace(/[^\d]/g, ""),
    10
  ) || 0;
                  if (!club || !distance) return;

                 if (!acc[club]) {
  acc[club] = { count: 0, total: 0, best: 0 };
}

acc[club].count += 1;
acc[club].total += distance;
acc[club].best = Math.max(acc[club].best, distance);
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
const best = data.best || data.max || data.bestDistance || average;
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
  player.clubType ||
  "";
                       const d =
  parseInt(
    String(
      player.driveDistance ||
        player.greenOnDistance ||
        player.distance ||
        0
    ).replace(/[^\d]/g, ""),
    10
  ) || 0;

                        if (!c || !d) return;
                      if (!acc[c]) {
  acc[c] = {
    total: 0,
    count: 0,
    best: 0,
  };
}
acc[c].total += d;
acc[c].count += 1;
acc[c].best = Math.max(acc[c].best, d);
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
                   <div
  onClick={() => setSelectedClub(club)}
  style={{
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
    color: selectedClub === club ? "#2563eb" : "#111827",
  }}
>
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
<div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
  Best：{best}Y
</div>
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
{selectedClub && (
  <div
    style={{
      marginTop: 16,
      padding: 14,
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: 14,
    }}
  >
    <h3 style={{ margin: "0 0 10px", color: "#2563eb" }}>
      {selectedClub} 飛距離推移
    </h3>
<div style={{ marginBottom: 10, fontWeight: 800, color: "#2563eb" }}>
  飛距離グラフ
</div>
<div
  style={{
   display: "flex",
alignItems: "flex-end",
justifyContent: "center",
gap: 16,
height: 160,
paddingTop: 20,
overflowX: "auto",
  }}
>
  {selectedClubHistory.map((item, index) => {
    const maxDistance = Math.max(
      ...selectedClubHistory.map((x) => x.distance),
      1
    );

    const barHeight = Math.max(
      20,
      (item.distance / maxDistance) * 120
    );

    return (
      <div
        key={index}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 40,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          {item.distance}
        </div>

        <div
          style={{
            width: 24,
            height: `${barHeight}px`,
            background:
  item.distance === maxDistance
    ? "#ef4444"
    : "#2563eb",
            borderRadius: "8px 8px 0 0",
          }}
        />

        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            color: "#64748b",
          }}
        >
          {index + 1}
        </div>
      </div>
    );
  })}
</div>   
  </div>
)}
      </div>
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
            <div style={{ fontWeight: 700, fontSize: 18 }}>{tee}</div>

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
  validHistory.reduce((sum, h) => sum + getScore(h), 0) /
    Math.max(validHistory.length, 1)
)}
          />
<InfoChip
  label="最近5R"
  value={recent5Average}
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
           {validHistory
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
  ? Math.max(20, 140 - (score - 70) * 2)
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
                       background:
  score <= 89
    ? "#16a34a"
    : score <= 99
    ? "#f59e0b"
    : "#ef4444",
                        marginBottom: 4,
                        zIndex: 1,
                      }}
                    />

                    <div
                      style={{
                        width: "70%",
                        height: barHeight,
                        borderRadius: "10px 10px 0 0",
                        background:
  score <= 89
    ? "#16a34a"
    : score <= 99
    ? "#f59e0b"
    : "#ef4444",

                      }}
                    />

                   {index < validHistory.length - 1 && (
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
  onClick={() => openDetail(item)}
  className="tap-card"
  style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 18,
                padding: 18,
                boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
cursor: "pointer",
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
{item.ranking?.length > 0 && (
  <div
    style={{
      marginTop: 8,
      padding: 8,
      background: "#fef3c7",
      borderRadius: 10,
      fontWeight: 800,
      color: "#92400e",
    }}
  >
    🏆 OP優勝：
    {item.ranking
      .slice()
      .sort(
        (a, b) =>
          Number(b.totalOlympic || 0) -
          Number(a.totalOlympic || 0)
      )[0]?.playerName}
    （
    {item.ranking
      .slice()
      .sort(
        (a, b) =>
          Number(b.totalOlympic || 0) -
          Number(a.totalOlympic || 0)
      )[0]?.totalOlympic || 0}
    pt）
  </div>
)}
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
                  value={`${getScore(item) || "-"}打`}
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
  label="オリンピック"
  value={player.totalOlympic ?? player.olympicPoint ?? player.olympicTotal ?? "-"}
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
  onClick={(e) => {
    e.stopPropagation();
    openDetail(item);
  }}
  className="primary-btn"
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
  onClick={(e) => {
    e.stopPropagation();
    deleteRound(item.id);
  }}
  className="danger-btn"                  style={{
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
import { useNavigate } from "react-router-dom";

export default function Top() {
  const navigate = useNavigate();

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
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  color: "#ffffff",
  borderRadius: 24,
  padding: "24px 16px",
  textAlign: "center",
  marginBottom: 22
}}
        >
          <div style={{ fontSize: 13, opacity: 0.9 }}>GOLF ROUND APP</div>
       <h1
  style={{
    margin: "10px 0",
    fontSize: "clamp(13px, 4vw, 15px)",
    fontWeight: 800,
    textAlign: "center",
    lineHeight: 1.6,
    wordBreak: "keep-all",
    overflowWrap: "normal"
  }}
>
  ゴルフアプリ
</h1>
          <div style={{ fontSize: 15 }}>
            スコア・パー・クラブ・パット・オリンピックを記録
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
            marginBottom: 24
          }}
        >
          <Card title="入力" text="ホールごとにスコアやクラブを記録" />
          <Card title="分析" text="結果画面でまとめて確認" />
          <Card title="編集" text="履歴からラウンドを再編集" />
          <Card title="カスタム" text="役やクラブを自分用に変更" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap"
          }}
        >
          <button style={primaryButton} onClick={() => navigate("/setup")}>
            ラウンド開始
          </button>

          <button style={secondaryButton} onClick={() => navigate("/history")}>
            履歴を見る
          </button>

          <button
            style={secondaryButton}
            onClick={() => navigate("/event-settings")}
          >
            役をカスタム
          </button>

          <button
            style={secondaryButton}
            onClick={() => navigate("/club-settings")}
          >
            クラブをカスタム
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 18,
        background: "#f8fafc"
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ color: "#64748b", fontSize: 14 }}>{text}</div>
    </div>
  );
}

const primaryButton = {
  padding: "14px 26px",
  borderRadius: 14,
  border: "none",
  background: "#16a34a",
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
  cursor: "pointer"
};

const secondaryButton = {
  padding: "14px 26px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  fontWeight: "bold",
  fontSize: 16,
  cursor: "pointer"
};
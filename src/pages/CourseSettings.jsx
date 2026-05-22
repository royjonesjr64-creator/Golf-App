import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CourseSettings() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [holes, setHoles] = useState(
    Array.from({ length: 18 }, (_, i) => ({
      hole: i + 1,
      par: "",
      distance: ""
    }))
  );

  const updateHole = (index, key, value) => {
    const next = [...holes];
    next[index] = { ...next[index], [key]: value };
    setHoles(next);
  };

  const saveCourse = () => {
    const saved = JSON.parse(localStorage.getItem("courses") || "[]");

    const newCourse = {
      id: Date.now(),
      name,
      courseName,
      holes: holes.map((h) => ({
        hole: h.hole,
        par: Number(h.par) || 4,
        distance: Number(h.distance) || 0
      }))
    };

    localStorage.setItem("courses", JSON.stringify([newCourse, ...saved]));
    nav("/setup");
  };

  return (
    <div style={{ padding: 16, background: "#f8fafc", minHeight: "100vh" }}>
      <h1>コース登録</h1>

      <input
        placeholder="ゴルフ場名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 10 }}
      />

      <input
        placeholder="コース名"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 16 }}
      />

      <div style={{ display: "grid", gap: 8 }}>
        {holes.map((h, idx) => (
          <div
            key={h.hole}
            style={{
              display: "grid",
              gridTemplateColumns: "50px 1fr 1fr",
              gap: 8,
              alignItems: "center"
            }}
          >
            <strong>H{h.hole}</strong>

            <input
              placeholder="Par"
              value={h.par}
              onChange={(e) => updateHole(idx, "par", e.target.value)}
              style={{ padding: 10 }}
            />

            <input
              placeholder="距離"
              value={h.distance}
              onChange={(e) => updateHole(idx, "distance", e.target.value)}
              style={{ padding: 10 }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={saveCourse}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "none",
          background: "#2563eb",
          color: "#fff",
          fontWeight: "bold"
        }}
      >
        保存する
      </button>
    </div>
  );
}
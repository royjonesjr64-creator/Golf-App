import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
export default function CourseSettings() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courses, setCourses] = useState([]);


const [searchText, setSearchText] = useState("");
  const [holes, setHoles] = useState(
  Array.from({ length: 18 }, (_, i) => ({
    hole: i + 1,
    par: 4,

    blueDistance: 0,
    whiteDistance: 0,
    redDistance: 0,
  }))
);

  useEffect(() => {
  const loadCourses = async () => {
    const snapshot = await getDocs(collection(db, "courses"));

    const allCourses = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    const currentUserId = auth.currentUser?.uid || "guest";

    const visibleCourses = allCourses.filter(
      (course) => course.isPublic === true || course.userId === currentUserId
    );

    setCourses(visibleCourses);
  };

  loadCourses();
}, []);


  const updateHole = (index, key, value) => {
    const next = [...holes];
    next[index] = { ...next[index], [key]: value };
    setHoles(next);
  };

  const deleteCourse = async (id) => {
  if (!window.confirm("削除する？")) return;

  await deleteDoc(doc(db, "courses", id));

  const snapshot = await getDocs(collection(db, "courses"));
  const list = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));

  setCourses(list);

  alert("削除しました");
};

  const saveCourse = async () => {
if (!name.trim()) {
  alert("ゴルフ場名を入力してください");
  return;
}

if (!courseName.trim()) {
  alert("コース名を入力してください");
  return;
}

const exists = courses.some(
  (c) => c.name === name && c.courseName === courseName
);

if (exists) {
  alert("このコースはすでに登録されています");
  return;
}
   const newCourse = {
  userId: auth.currentUser?.uid || "guest",
  isPublic: false,

  name,
  courseName,

 holes: holes.map((h) => ({
  hole: h.hole,
  par: Number(h.par) || 4,
  blueDistance: Number(h.blueDistance) || 0,
  whiteDistance: Number(h.whiteDistance) || 0,
  redDistance: Number(h.redDistance) || 0,
}))
};
    await addDoc(collection(db, "courses"), newCourse);
    nav("/setup");
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
      <button
        onClick={async () => {
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
          alert("ログイン成功");
        }}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          background: "#ffffff",
          fontWeight: 800,
          marginBottom: 14,
        }}
      >
        Googleログイン
      </button>

      <h1 style={{ margin: "0 0 16px" }}>コース登録</h1>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <input
          placeholder="ゴルフ場名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 14,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            marginBottom: 10,
            fontSize: 16,
          }}
        />

        <input
          placeholder="コース名"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 14,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            marginBottom: 14,
            fontSize: 16,
          }}
        />

        <div style={{ display: "grid", gap: 12 }}>
          {holes.map((h, idx) => (
            <div
              key={h.hole}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 18,
                  marginBottom: 10,
                  color: "#2563eb",
                }}
              >
                H{h.hole}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <input
                  placeholder="Par"
                  value={h.par}
                  onChange={(e) => updateHole(idx, "par", e.target.value)}
                  style={holeInputStyle}
                />

                <input
                  placeholder="Blue"
                  value={h.blueDistance}
                  onChange={(e) =>
                    updateHole(idx, "blueDistance", e.target.value)
                  }
                  style={holeInputStyle}
                />

                <input
                  placeholder="White"
                  value={h.whiteDistance}
                  onChange={(e) =>
                    updateHole(idx, "whiteDistance", e.target.value)
                  }
                  style={holeInputStyle}
                />

                <input
                  placeholder="Red"
                  value={h.redDistance}
                  onChange={(e) =>
                    updateHole(idx, "redDistance", e.target.value)
                  }
                  style={holeInputStyle}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={saveCourse}
          style={{
            marginTop: 18,
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          保存する
        </button>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 16,
        }}
      >
        <h2 style={{ margin: "0 0 12px" }}>登録済みコース</h2>

        <input
          placeholder="コース検索"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 14,
            marginBottom: 12,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            fontSize: 16,
          }}
        />

        {courses
          .filter((course) => {
            const text = (course.name || "").toLowerCase();
            const keyword = searchText.toLowerCase().trim();
            if (!keyword) return true;
            return text.includes(keyword);
          })
          .map((course) => (
            <div
              key={course.id}
              style={{
                padding: 14,
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                marginBottom: 10,
                background: "#f8fafc",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 17 }}>
                {course.name}
              </div>

              <div style={{ marginTop: 4, color: "#64748b" }}>
                {course.courseName || "コース名なし"}
              </div>

              <div style={{ marginTop: 6 }}>
                {course.isPublic ? "🌍共有" : "🔒自分用"}
              </div>

              <button
                onClick={() => deleteCourse(course.id)}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: 12,
                  border: "none",
                  borderRadius: 10,
                  background: "#dc2626",
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
        onClick={() => nav("/")}
        style={{
          marginTop: 16,
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          background: "#ffffff",
          fontWeight: 900,
        }}
      >
        トップへ戻る
      </button>
    </div>
  </div>
);
}

const holeInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: 15,
};
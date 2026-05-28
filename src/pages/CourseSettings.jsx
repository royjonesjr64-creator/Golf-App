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
      par: "",
      distance: ""
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
    distance: Number(h.distance) || 0
  }))
};
    await addDoc(collection(db, "courses"), newCourse);
    nav("/setup");
  };

 return (
  <>
    <button
      onClick={async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        alert("ログイン成功");
      }}
    >
      Googleログイン
    </button>

    <div style={{ padding: 16, background: "#f8fafc", minHeight: "100vh" }}>

      <h1>コース登録</h1>

      <input placeholder="ゴルフ場名" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 10 }} />

      <input placeholder="コース名" value={courseName} onChange={(e) => setCourseName(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 16 }} />

      <div style={{ display: "grid", gap: 8 }}>
        {holes.map((h, idx) => (
          <div key={h.hole} style={{ display: "grid", gridTemplateColumns: "50px 1fr 1fr", gap: 8, alignItems: "center" }}>
            <strong>H{h.hole}</strong>
            <input placeholder="Par" value={h.par} onChange={(e) => updateHole(idx, "par", e.target.value)} style={{ padding: 10 }} />
            <input placeholder="距離" value={h.distance} onChange={(e) => updateHole(idx, "distance", e.target.value)} style={{ padding: 10 }} />
          </div>
        ))}
      </div>

      <button onClick={saveCourse} style={{ marginTop: 20, width: "100%", padding: 14, borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", fontWeight: "bold" }}>
        保存する
      </button>

      <div style={{ marginTop: 24 }}>
        <h2>登録済みコース</h2>
<input
  placeholder="コース検索"
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
  style={{
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #ddd"
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
          <div key={course.id} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, marginBottom: 10, background: "#fff" }}>
 <div style={{ fontWeight: "bold" }}>
  {course.name}
</div>

<div style={{ marginTop: 4 }}>
  {course.isPublic ? "🌍共有" : "🔒自分用"}
</div>

            <button onClick={() => deleteCourse(course.id)} style={{ marginTop: 8, padding: "8px 12px", border: "none", borderRadius: 8, background: "#dc2626", color: "#fff", cursor: "pointer" }}>
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
</>
  );
}
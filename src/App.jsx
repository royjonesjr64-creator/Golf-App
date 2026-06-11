import { Routes, Route } from "react-router-dom";
import Top from "./pages/Top";
import Setup from "./pages/Setup";
import ParSettings from "./pages/ParSettings";
import Game from "./pages/Game";
import Result from "./pages/Result";
import EventSettings from "./pages/EventSettings";
import ClubSettings from "./pages/ClubSettings";
import History from "./History";
import CourseSettings from "./pages/CourseSettings";
import OlympicOnly from "./pages/OlympicOnly";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Top />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/par-settings" element={<ParSettings />} />
      <Route path="/game" element={<Game />} />
      <Route path="/result" element={<Result />} />
      <Route path="/history" element={<History />} />
      <Route path="/event-settings" element={<EventSettings />} />
      <Route path="/club-settings" element={<ClubSettings />} />
<Route path="/course-settings" element={<CourseSettings />} />
<Route path="/olympic-only" element={<OlympicOnly />} />
    </Routes>
  );
}
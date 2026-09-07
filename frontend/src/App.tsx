import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/login/index.tsx";
import { Register } from "./pages/register/index.tsx";
import { Notes } from "./pages/notes";
import { NoteDetail } from "./pages/note-detail";
import { RecoverPassword } from "./pages/recover-password";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:id" element={<NoteDetail />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

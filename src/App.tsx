import { Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MangaList from "./pages/MangaList";
import MangaNew from "./pages/MangaNew";
import MangaDetail from "./pages/MangaDetail";
import Publishers from "./pages/Publishers";
import Authors from "./pages/Authors";
import Genres from "./pages/Genres";
import Users from "./pages/Users";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="manga" element={<MangaList />} />
        <Route path="manga/new" element={<MangaNew />} />
        <Route path="manga/:id" element={<MangaDetail />} />
        <Route path="publishers" element={<Publishers />} />
        <Route path="authors" element={<Authors />} />
        <Route path="genres" element={<Genres />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}

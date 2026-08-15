import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../auth";

export default function Layout() {
  const navigate = useNavigate();
  const logout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <h2>Manga Tracker</h2>
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/manga">Manga</NavLink>
        <NavLink to="/publishers">Publishers</NavLink>
        <NavLink to="/authors">Authors</NavLink>
        <NavLink to="/genres">Genres</NavLink>
        <NavLink to="/users">Users</NavLink>
        <button className="logout" onClick={logout}>
          Log out
        </button>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

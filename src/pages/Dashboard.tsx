import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getManga, getUsers, getAuthors, getGenres, getPublishers } from "../api";

interface Stat {
  label: string;
  count: number;
  href: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    Promise.all([getManga(), getUsers(), getAuthors(), getGenres(), getPublishers()]).then(
      ([manga, users, authors, genres, publishers]) => {
        setStats([
          { label: "Manga", count: manga.length, href: "/manga" },
          { label: "Publishers", count: publishers.length, href: "/publishers" },
          { label: "Authors", count: authors.length, href: "/authors" },
          { label: "Genres", count: genres.length, href: "/genres" },
          { label: "Users", count: users.length, href: "/users" },
        ]);
      }
    );
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        {stats?.map((s) => (
          <Link key={s.label} to={s.href} className="stat-card">
            <span className="stat-label">{s.label}</span>
            <span className="stat-count">{s.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

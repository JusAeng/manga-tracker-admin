import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getManga } from "../api";
import type { Manga } from "../types";

export default function MangaList() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [manga, setManga] = useState<Manga[]>([]);

  useEffect(() => {
    getManga(q).then(setManga);
  }, [q]);

  return (
    <div>
      <div className="page-header">
        <h1>Manga</h1>
        <Link to="/manga/new" className="button">
          + New manga
        </Link>
      </div>
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          const value = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
          setParams(value ? { q: value } : {});
        }}
      >
        <input name="q" defaultValue={q} placeholder="search title" />
        <button type="submit">Search</button>
      </form>
      <div className="grid">
        {manga.map((m) => (
          <Link key={m.id} to={`/manga/${m.id}`} className="card">
            {m.imageUrl && <img src={m.imageUrl} alt="" />}
            <p>{m.titleEn || m.titleOriginal}</p>
          </Link>
        ))}
      </div>
      {manga.length === 0 && <p className="muted">No manga found.</p>}
    </div>
  );
}

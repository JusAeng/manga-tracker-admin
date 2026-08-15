import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createManga,
  searchExternalManga,
  getExternalMangaDraft,
  getAuthors,
  createAuthor,
  attachAuthor,
  getGenres,
  createGenre,
  attachGenre,
} from "../api";
import type { ExternalMangaSummary, ExternalMangaDraft, ExternalAuthorDraft } from "../types";
import { useToast } from "../toast";
import ImagePreview from "../components/ImagePreview";

const ROLES = ["author", "artist", "story", "illustrator"];

export default function MangaNew() {
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ExternalMangaSummary[]>([]);
  const [draft, setDraft] = useState<ExternalMangaDraft | null>(null);
  const [draftKey, setDraftKey] = useState(0);
  const [draftAuthors, setDraftAuthors] = useState<ExternalAuthorDraft[]>([]);
  const [draftGenres, setDraftGenres] = useState<string[]>([]);
  const [imageUrlPreview, setImageUrlPreview] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      setResults(await searchExternalManga(query));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Search failed", "error");
    } finally {
      setSearching(false);
    }
  };

  const handlePick = async (anilistId: number) => {
    try {
      const d = await getExternalMangaDraft(anilistId);
      setDraft(d);
      setDraftAuthors(d.authors);
      setDraftGenres(d.genres);
      setImageUrlPreview(d.imageUrl);
      setDraftKey((k) => k + 1);
      setResults([]);
      toast("Draft loaded — review before creating");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load draft", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const manga = await createManga({
        titleOriginal: fd.get("titleOriginal") as string,
        titleEn: fd.get("titleEn") as string,
        introduction: fd.get("introduction") as string,
        imageUrl: fd.get("imageUrl") as string,
        firstDateJp: (fd.get("firstDateJp") as string) || null,
        status: fd.get("status") as string,
      });

      if (draftAuthors.length > 0 || draftGenres.length > 0) {
        const [existingAuthors, existingGenres] = await Promise.all([getAuthors(), getGenres()]);
        for (const a of draftAuthors) {
          if (!a.name.trim()) continue;
          let author = existingAuthors.find((x) => x.name.toLowerCase() === a.name.toLowerCase());
          if (!author) author = await createAuthor(a.name.trim());
          await attachAuthor(manga.id, author.id, a.role);
        }
        for (const g of draftGenres) {
          if (!g.trim()) continue;
          let genre = existingGenres.find((x) => x.name.toLowerCase() === g.toLowerCase());
          if (!genre) genre = await createGenre(g.trim());
          await attachGenre(manga.id, genre.id);
        }
      }

      toast("Manga created");
      navigate(`/manga/${manga.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create manga");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>New manga</h1>
        <Link to="/manga" className="button-secondary">
          Cancel
        </Link>
      </div>
      {error && <p className="error">{error}</p>}

      <section className="panel">
        <h2>Import from AniList (optional)</h2>
        <div className="inline-form">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="Search AniList by title…"
          />
          <button type="button" onClick={handleSearch} disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
        {results.length > 0 && (
          <div className="external-results">
            {results.map((r) => (
              <button
                type="button"
                key={r.anilistId}
                className="external-result"
                onClick={() => handlePick(r.anilistId)}
              >
                {r.coverImageUrl && <img src={r.coverImageUrl} alt="" />}
                <div>
                  <div>{r.titleEnglish || r.titleRomaji}</div>
                  <div className="muted">
                    {r.titleNative}
                    {r.year ? ` (${r.year})` : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {draft && <p className="muted">Draft loaded from AniList — review every field below before creating.</p>}
      </section>

      <form key={draftKey} onSubmit={handleSubmit} className="form">
        <label>
          Title (original)
          <input name="titleOriginal" defaultValue={draft?.titleOriginal ?? ""} required />
        </label>
        <label>
          Title (EN)
          <input name="titleEn" defaultValue={draft?.titleEn ?? ""} />
        </label>
        <label>
          Image URL
          <input
            name="imageUrl"
            defaultValue={draft?.imageUrl ?? ""}
            onChange={(e) => setImageUrlPreview(e.target.value)}
          />
        </label>
        <ImagePreview url={imageUrlPreview} />
        <label>
          First release date (JP)
          <input type="date" name="firstDateJp" defaultValue={draft?.firstDateJp ?? ""} />
        </label>
        <label>
          Status
          <input
            name="status"
            defaultValue={draft?.status ?? ""}
            placeholder="ongoing / completed"
          />
        </label>
        <label>
          Introduction
          <textarea name="introduction" defaultValue={draft?.introduction ?? ""} />
        </label>

        {draft && (
          <>
            <h3>Authors (from AniList — edit or remove before creating)</h3>
            {draftAuthors.map((a, i) => (
              <div key={i} className="inline-form">
                <input
                  value={a.name}
                  onChange={(e) =>
                    setDraftAuthors((prev) =>
                      prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x))
                    )
                  }
                />
                <select
                  value={a.role}
                  onChange={(e) =>
                    setDraftAuthors((prev) =>
                      prev.map((x, idx) =>
                        idx === i ? { ...x, role: e.target.value as ExternalAuthorDraft["role"] } : x
                      )
                    )
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setDraftAuthors((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  remove
                </button>
              </div>
            ))}
            {draftAuthors.length === 0 && <p className="muted">No authors from AniList.</p>}

            <h3>Genres (from AniList — remove any that don't apply)</h3>
            <ul className="tag-list">
              {draftGenres.map((g, i) => (
                <li key={g}>
                  {g}
                  <button
                    type="button"
                    onClick={() => setDraftGenres((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    x
                  </button>
                </li>
              ))}
              {draftGenres.length === 0 && <li className="muted">No genres from AniList.</li>}
            </ul>
          </>
        )}

        <div className="form-actions">
          <button type="submit">Create</button>
          <Link to="/manga" className="button-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

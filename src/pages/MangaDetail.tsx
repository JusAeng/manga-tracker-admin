import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getMangaById,
  updateManga,
  deleteManga,
  getAuthors,
  attachAuthor,
  detachAuthor,
  getGenres,
  attachGenre,
  detachGenre,
  getThaiEditions,
  createThaiEdition,
  updateThaiEdition,
  deleteThaiEdition,
  getVolumes,
  createVolume,
  updateVolume,
  deleteVolume,
  getPublishers,
} from "../api";
import type {
  MangaDetail as MangaDetailType,
  Author,
  Genre,
  MangaAuthor,
  Publisher,
  ThaiEdition,
  Volume,
} from "../types";
import { useToast } from "../toast";
import ImagePreview from "../components/ImagePreview";

const ROLES = ["author", "artist", "story", "illustrator"];

export default function MangaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [manga, setManga] = useState<MangaDetailType | null>(null);
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [allPublishers, setAllPublishers] = useState<Publisher[]>([]);
  const [editions, setEditions] = useState<{ edition: ThaiEdition; volumes: Volume[] }[]>([]);
  const [error, setError] = useState("");
  const [editingEditionId, setEditingEditionId] = useState<string | null>(null);
  const [editingVolumeId, setEditingVolumeId] = useState<string | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState("");

  useEffect(() => {
    if (manga) setImageUrlPreview(manga.imageUrl);
  }, [manga?.id]);

  const load = useCallback(async () => {
    if (!id) return;
    const [m, authors, genres, publishers, eds] = await Promise.all([
      getMangaById(id),
      getAuthors(),
      getGenres(),
      getPublishers(),
      getThaiEditions(id),
    ]);
    setManga(m);
    setAllAuthors(authors);
    setAllGenres(genres);
    setAllPublishers(publishers);
    const withVols = await Promise.all(
      eds.map(async (edition) => ({ edition, volumes: await getVolumes(edition.id) }))
    );
    setEditions(withVols);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!manga || !id) return <p>Loading…</p>;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const updated = await updateManga(id, {
        titleOriginal: fd.get("titleOriginal") as string,
        titleEn: fd.get("titleEn") as string,
        introduction: fd.get("introduction") as string,
        imageUrl: fd.get("imageUrl") as string,
        firstDateJp: (fd.get("firstDateJp") as string) || null,
        status: fd.get("status") as string,
      });
      setManga((prev) => (prev ? { ...prev, ...updated } : prev));
      toast("Manga saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      setError(message);
      toast(message, "error");
    }
  };

  const handleDelete = async () => {
    await deleteManga(id);
    navigate("/manga");
  };

  const handleAttachAuthor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const authorId = fd.get("authorId") as string;
    const role = fd.get("role") as MangaAuthor["role"];
    if (!authorId || !role) return;
    try {
      await attachAuthor(id, authorId, role);
      const author = allAuthors.find((a) => a.id === authorId);
      if (author) {
        setManga((prev) =>
          prev
            ? { ...prev, authors: [...(prev.authors ?? []), { authorId, name: author.name, role }] }
            : prev
        );
      }
      form.reset();
      toast("Author added");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to attach author";
      setError(message);
      toast(message, "error");
    }
  };

  const handleAttachGenre = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const genreId = fd.get("genreId") as string;
    if (!genreId) return;
    try {
      await attachGenre(id, genreId);
      const genre = allGenres.find((g) => g.id === genreId);
      if (genre) {
        setManga((prev) =>
          prev ? { ...prev, genres: [...(prev.genres ?? []), genre] } : prev
        );
      }
      form.reset();
      toast("Genre added");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to attach genre";
      setError(message);
      toast(message, "error");
    }
  };

  const handleCreateEdition = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const created = await createThaiEdition(id, {
        publisherId: fd.get("publisherId") as string,
        titleTh: fd.get("titleTh") as string,
        firstDateTh: (fd.get("firstDateTh") as string) || null,
      });
      setEditions((prev) => [...prev, { edition: created, volumes: [] }]);
      form.reset();
      toast("Thai edition added");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create Thai edition";
      setError(message);
      toast(message, "error");
    }
  };

  const handleUpdateEdition = async (
    editionId: string,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const updated = await updateThaiEdition(editionId, {
        publisherId: fd.get("publisherId") as string,
        titleTh: fd.get("titleTh") as string,
        firstDateTh: (fd.get("firstDateTh") as string) || null,
      });
      setEditions((prev) =>
        prev.map((entry) => (entry.edition.id === editionId ? { ...entry, edition: updated } : entry))
      );
      setEditingEditionId(null);
      toast("Thai edition updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update Thai edition";
      setError(message);
      toast(message, "error");
    }
  };

  const handleUpdateVolume = async (
    editionId: string,
    volumeId: string,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const price = fd.get("price") as string;
    try {
      const updated = await updateVolume(volumeId, {
        volumeNumber: Number(fd.get("volumeNumber")),
        isbn: (fd.get("isbn") as string) || null,
        publishDate: (fd.get("publishDate") as string) || null,
        price: price ? Number(price) : null,
        imageUrl: fd.get("imageUrl") as string,
        status: fd.get("status") as string,
      });
      setEditions((prev) =>
        prev.map((entry) =>
          entry.edition.id === editionId
            ? {
                ...entry,
                volumes: entry.volumes
                  .map((v) => (v.id === volumeId ? updated : v))
                  .sort((a, b) => a.volumeNumber - b.volumeNumber),
              }
            : entry
        )
      );
      setEditingVolumeId(null);
      toast("Volume updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update volume";
      setError(message);
      toast(message, "error");
    }
  };

  const handleCreateVolume = async (
    thaiEditionId: string,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const price = fd.get("price") as string;
    try {
      const created = await createVolume(thaiEditionId, {
        volumeNumber: Number(fd.get("volumeNumber")),
        isbn: (fd.get("isbn") as string) || null,
        publishDate: (fd.get("publishDate") as string) || null,
        price: price ? Number(price) : null,
        imageUrl: (fd.get("imageUrl") as string) || "",
        status: fd.get("status") as string,
      });
      setEditions((prev) =>
        prev.map((entry) =>
          entry.edition.id === thaiEditionId
            ? {
                ...entry,
                volumes: [...entry.volumes, created].sort(
                  (a, b) => a.volumeNumber - b.volumeNumber
                ),
              }
            : entry
        )
      );
      form.reset();
      toast("Volume added");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add volume";
      setError(message);
      toast(message, "error");
    }
  };

  const publisherName = (pid: string) => allPublishers.find((p) => p.id === pid)?.name ?? pid;

  return (
    <div className="detail">
      {error && <p className="error">{error}</p>}

      <Link to="/manga" className="back-link">
        ← Back to manga list
      </Link>

      <section className="panel">
        <div className="muted">ID: {manga.id}</div>
        <form onSubmit={handleSave} className="form">
          <label>
            Title (original)
            <input name="titleOriginal" defaultValue={manga.titleOriginal} required />
          </label>
          <label>
            Title (EN)
            <input name="titleEn" defaultValue={manga.titleEn} />
          </label>
          <label>
            Image URL
            <input
              name="imageUrl"
              defaultValue={manga.imageUrl}
              onChange={(e) => setImageUrlPreview(e.target.value)}
            />
          </label>
          <ImagePreview url={imageUrlPreview} />
          <label>
            First release date (JP)
            <input type="date" name="firstDateJp" defaultValue={manga.firstDateJp?.slice(0, 10)} />
          </label>
          <label>
            Status
            <input name="status" defaultValue={manga.status} />
          </label>
          <label>
            Introduction
            <textarea name="introduction" defaultValue={manga.introduction} />
          </label>
          <button type="submit">Save</button>
        </form>
        <button className="danger" onClick={handleDelete}>
          Delete manga
        </button>
      </section>

      <section className="panel">
        <h2>Authors</h2>
        <ul className="tag-list">
          {(manga.authors ?? []).map((a) => (
            <li key={`${a.authorId}-${a.role}`}>
              {a.name} <span className="muted">({a.role})</span>
              <button
                onClick={async () => {
                  try {
                    await detachAuthor(id, a.authorId, a.role);
                    setManga((prev) =>
                      prev
                        ? {
                            ...prev,
                            authors: (prev.authors ?? []).filter(
                              (x) => !(x.authorId === a.authorId && x.role === a.role)
                            ),
                          }
                        : prev
                    );
                    toast("Author removed");
                  } catch (err) {
                    toast(err instanceof Error ? err.message : "Failed to remove author", "error");
                  }
                }}
              >
                x
              </button>
            </li>
          ))}
          {(manga.authors ?? []).length === 0 && <li className="muted">No authors credited yet.</li>}
        </ul>
        <form onSubmit={handleAttachAuthor} className="inline-form">
          <select name="authorId" defaultValue="" required>
            <option value="" disabled>
              choose author
            </option>
            {allAuthors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select name="role" defaultValue="" required>
            <option value="" disabled>
              role
            </option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="panel">
        <h2>Genres</h2>
        <ul className="tag-list">
          {(manga.genres ?? []).map((g) => (
            <li key={g.id}>
              {g.name}
              <button
                onClick={async () => {
                  try {
                    await detachGenre(id, g.id);
                    setManga((prev) =>
                      prev
                        ? { ...prev, genres: (prev.genres ?? []).filter((x) => x.id !== g.id) }
                        : prev
                    );
                    toast("Genre removed");
                  } catch (err) {
                    toast(err instanceof Error ? err.message : "Failed to remove genre", "error");
                  }
                }}
              >
                x
              </button>
            </li>
          ))}
          {(manga.genres ?? []).length === 0 && <li className="muted">No genres tagged yet.</li>}
        </ul>
        <form onSubmit={handleAttachGenre} className="inline-form">
          <select name="genreId" defaultValue="" required>
            <option value="" disabled>
              choose genre
            </option>
            {allGenres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="panel">
        <h2>Thai editions</h2>
        {editions.length === 0 && <p className="muted">No Thai edition yet.</p>}
        {editions.map(({ edition, volumes }) => (
          <div key={edition.id} className="edition">
            {editingEditionId === edition.id ? (
              <form
                onSubmit={(e) => handleUpdateEdition(edition.id, e)}
                className="inline-form"
                style={{ marginBottom: 10 }}
              >
                <select name="publisherId" defaultValue={edition.publisherId} required>
                  {allPublishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <label>
                  Title (TH)
                  <input name="titleTh" defaultValue={edition.titleTh} required />
                </label>
                <label>
                  First release date (TH)
                  <input name="firstDateTh" type="date" defaultValue={edition.firstDateTh?.slice(0, 10)} />
                </label>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingEditionId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <div className="page-header">
                <div>
                  <strong>{edition.titleTh}</strong>
                  <div className="muted">
                    {publisherName(edition.publisherId)}
                    {edition.firstDateTh ? ` — ${edition.firstDateTh.slice(0, 10)}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditingEditionId(edition.id)}>edit edition</button>
                  <button
                    className="danger"
                    onClick={async () => {
                      try {
                        await deleteThaiEdition(edition.id);
                        setEditions((prev) =>
                          prev.filter((entry) => entry.edition.id !== edition.id)
                        );
                        toast("Thai edition deleted");
                      } catch (err) {
                        toast(err instanceof Error ? err.message : "Failed to delete edition", "error");
                      }
                    }}
                  >
                    delete edition
                  </button>
                </div>
              </div>
            )}
            <table>
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Vol</th>
                  <th>ISBN</th>
                  <th>Publish date</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {volumes.map((v) =>
                  editingVolumeId === v.id ? (
                    <tr key={v.id}>
                      <td colSpan={7}>
                        <form
                          onSubmit={(e) => handleUpdateVolume(edition.id, v.id, e)}
                          className="inline-form"
                        >
                          <label>
                            Vol #
                            <input
                              name="volumeNumber"
                              type="number"
                              min={1}
                              defaultValue={v.volumeNumber}
                              required
                            />
                          </label>
                          <label>
                            ISBN
                            <input name="isbn" defaultValue={v.isbn ?? ""} />
                          </label>
                          <label>
                            Publish date
                            <input
                              name="publishDate"
                              type="date"
                              defaultValue={v.publishDate?.slice(0, 10)}
                            />
                          </label>
                          <label>
                            Price
                            <input
                              name="price"
                              type="number"
                              step="0.01"
                              defaultValue={v.price ?? ""}
                            />
                          </label>
                          <label>
                            Image URL
                            <input name="imageUrl" defaultValue={v.imageUrl} />
                          </label>
                          <label>
                            Status
                            <input name="status" defaultValue={v.status} />
                          </label>
                          <button type="submit">Save</button>
                          <button type="button" onClick={() => setEditingVolumeId(null)}>
                            Cancel
                          </button>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={v.id}>
                      <td>
                        {v.imageUrl ? (
                          <img src={v.imageUrl} alt="" className="vol-cover" />
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>{v.volumeNumber}</td>
                      <td>{v.isbn ?? "—"}</td>
                      <td>{v.publishDate?.slice(0, 10) ?? "—"}</td>
                      <td>{v.price ?? "—"}</td>
                      <td>{v.status ?? "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setEditingVolumeId(v.id)}>edit</button>
                          <button
                            onClick={async () => {
                              try {
                                await deleteVolume(v.id);
                                setEditions((prev) =>
                                  prev.map((entry) =>
                                    entry.edition.id === edition.id
                                      ? { ...entry, volumes: entry.volumes.filter((x) => x.id !== v.id) }
                                      : entry
                                  )
                                );
                                toast("Volume deleted");
                              } catch (err) {
                                toast(err instanceof Error ? err.message : "Failed to delete volume", "error");
                              }
                            }}
                          >
                            delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
                {volumes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="muted">
                      No volumes yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <form onSubmit={(e) => handleCreateVolume(edition.id, e)} className="inline-form">
              <label>
                Vol #<input name="volumeNumber" type="number" min={1} required />
              </label>
              <label>
                ISBN
                <input name="isbn" />
              </label>
              <label>
                Publish date
                <input name="publishDate" type="date" />
              </label>
              <label>
                Price
                <input name="price" type="number" step="0.01" />
              </label>
              <label>
                Image URL
                <input name="imageUrl" placeholder="https://…" />
              </label>
              <label>
                Status
                <input name="status" />
              </label>
              <button type="submit">Add volume</button>
            </form>
          </div>
        ))}

        <h3>New Thai edition</h3>
        <form onSubmit={handleCreateEdition} className="inline-form">
          <select name="publisherId" defaultValue="" required>
            <option value="" disabled>
              choose publisher
            </option>
            {allPublishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <label>
            Title (TH)
            <input name="titleTh" required />
          </label>
          <label>
            First release date (TH)
            <input name="firstDateTh" type="date" />
          </label>
          <button type="submit">Add edition</button>
        </form>
      </section>
    </div>
  );
}

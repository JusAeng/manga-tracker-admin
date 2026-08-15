import { useEffect, useState } from "react";
import { getGenres, createGenre, updateGenre, deleteGenre } from "../api";
import type { Genre } from "../types";

export default function Genres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const load = () => getGenres().then(setGenres);
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Genres</h1>
      <div className="list">
        {genres.length === 0 && <p className="muted">No genres yet.</p>}
        {genres.map((g) => (
          <div key={g.id} className="row">
            <form
              className="inline-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await updateGenre(g.id, fd.get("name") as string);
                load();
              }}
            >
              <input name="name" defaultValue={g.name} required />
              <button type="submit">Save</button>
            </form>
            <button
              className="danger"
              onClick={async () => {
                await deleteGenre(g.id);
                load();
              }}
            >
              delete
            </button>
          </div>
        ))}
      </div>
      <h2>New genre</h2>
      <form
        className="inline-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await createGenre(fd.get("name") as string);
          e.currentTarget.reset();
          load();
        }}
      >
        <input name="name" required placeholder="name" />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

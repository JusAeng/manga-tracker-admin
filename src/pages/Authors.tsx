import { useEffect, useState } from "react";
import { getAuthors, createAuthor, updateAuthor, deleteAuthor } from "../api";
import type { Author } from "../types";

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const load = () => getAuthors().then(setAuthors);
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Authors</h1>
      <div className="list">
        {authors.length === 0 && <p className="muted">No authors yet.</p>}
        {authors.map((a) => (
          <div key={a.id} className="row">
            <form
              className="inline-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await updateAuthor(a.id, fd.get("name") as string);
                load();
              }}
            >
              <input name="name" defaultValue={a.name} required />
              <button type="submit">Save</button>
            </form>
            <button
              className="danger"
              onClick={async () => {
                await deleteAuthor(a.id);
                load();
              }}
            >
              delete
            </button>
          </div>
        ))}
      </div>
      <h2>New author</h2>
      <form
        className="inline-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await createAuthor(fd.get("name") as string);
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

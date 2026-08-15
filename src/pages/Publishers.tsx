import { useEffect, useState } from "react";
import { getPublishers, createPublisher, updatePublisher, deletePublisher } from "../api";
import type { Publisher } from "../types";

export default function Publishers() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const load = () => getPublishers().then(setPublishers);
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createPublisher({
      name: fd.get("name") as string,
      websiteUrl: fd.get("websiteUrl") as string,
      logoUrl: fd.get("logoUrl") as string,
    });
    e.currentTarget.reset();
    load();
  };

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updatePublisher(id, {
      name: fd.get("name") as string,
      websiteUrl: fd.get("websiteUrl") as string,
      logoUrl: fd.get("logoUrl") as string,
    });
    load();
  };

  return (
    <div>
      <h1>Publishers</h1>
      <div className="list">
        {publishers.length === 0 && <p className="muted">No publishers yet.</p>}
        {publishers.map((p) => (
          <div key={p.id} className="row">
            <form className="inline-form" onSubmit={(e) => handleUpdate(p.id, e)}>
              <input name="name" defaultValue={p.name} required />
              <input name="websiteUrl" defaultValue={p.websiteUrl} placeholder="website" />
              <input name="logoUrl" defaultValue={p.logoUrl} placeholder="logo URL" />
              <button type="submit">Save</button>
            </form>
            <button
              className="danger"
              onClick={async () => {
                await deletePublisher(p.id);
                load();
              }}
            >
              delete
            </button>
          </div>
        ))}
      </div>
      <h2>New publisher</h2>
      <form className="inline-form" onSubmit={handleCreate}>
        <input name="name" required placeholder="name" />
        <input name="websiteUrl" placeholder="website" />
        <input name="logoUrl" placeholder="logo URL" />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

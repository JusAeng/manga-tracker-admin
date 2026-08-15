import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../api";
import type { User } from "../types";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const load = () => getUsers().then(setUsers);
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <div className="list">
        {users.length === 0 && <p className="muted">No users yet.</p>}
        {users.map((u) => (
          <div key={u.id} className="row">
            {u.pictureUrl && <img src={u.pictureUrl} alt="" className="avatar" />}
            <span>{u.displayName || "(no name)"}</span>
            <button
              className="danger"
              onClick={async () => {
                await deleteUser(u.id);
                load();
              }}
            >
              delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

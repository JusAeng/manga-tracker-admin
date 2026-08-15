# manga-tracker-admin

Minimal admin panel for `manga-tracker-api-go` — a client-only React SPA
(Vite, no server-side rendering). Manages manga, publishers, authors,
genres, Thai editions, volumes, and users.

Built as a lean alternative to `manga-tracker-backoffice` (Next.js): no
server actions, no middleware, no cookies. The JWT from `POST /auth/admin`
just lives in `localStorage` and gets attached as `Authorization: Bearer`
on every API call from the browser — the Go backend already verifies it
server-side, so there's nothing to duplicate client-side.

## Running locally

```bash
npm install
cp .env.example .env.local   # already done — edit VITE_API_BASE_URL if needed
npm run dev
```

Requires `manga-tracker-api-go` running (`make run` in that repo) and
`ADMIN_USERNAME`/`ADMIN_PASSWORD_HASH` set in its `.env`.

## Structure

- `src/api.ts` — every backend call, typed against `src/types.ts`
- `src/auth.ts` — localStorage token get/set/clear
- `src/App.tsx` — routes + `RequireAuth` guard
- `src/pages/` — one file per screen (Dashboard, MangaList, MangaNew,
  MangaDetail, Publishers, Authors, Genres, Users)

import { getToken, clearToken } from "./auth";
import type {
  Manga,
  MangaDetail,
  ThaiEdition,
  Volume,
  Publisher,
  Author,
  Genre,
  User,
  ExternalMangaSummary,
  ExternalMangaDraft,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";

// `<input type="date">` gives back a bare "YYYY-MM-DD" string, but the
// backend unmarshals these fields into Go's time.Time, which only accepts
// full RFC3339 timestamps — a bare date fails JSON parsing and the whole
// request 400s before it ever reaches the database.
function toRFC3339<T>(date: T): T | string {
  if (typeof date !== "string" || !date) return date;
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    clearToken();
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error((await res.text()) || `Request failed: ${res.status}`);
  }
  // Endpoints with nothing to return (delete/attach/detach) respond via
  // Fiber's c.SendStatus(), whose body is the literal reason phrase (e.g.
  // "Accepted") — not JSON. Only parse when the server actually says JSON.
  if (!res.headers.get("content-type")?.includes("application/json")) {
    return undefined as T;
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function login(apiKey: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  if (!res.ok) throw new Error((await res.text()) || "Login failed");
  return res.json();
}

// External lookup (AniList) — used by the "New manga" draft-import flow
export const searchExternalManga = (q: string) =>
  request<ExternalMangaSummary[]>(`/admin/external/manga/search?q=${encodeURIComponent(q)}`);
export const getExternalMangaDraft = (anilistId: number) =>
  request<ExternalMangaDraft>(`/admin/external/manga/${anilistId}`);

// Manga
export const getManga = (q?: string) =>
  request<Manga[]>(`/manga${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const getMangaById = (id: string) => request<MangaDetail>(`/manga/${id}`);
export const createManga = (data: Partial<Manga>) =>
  request<Manga>(`/admin/manga`, {
    method: "POST",
    body: JSON.stringify({ ...data, firstDateJp: toRFC3339(data.firstDateJp) }),
  });
export const updateManga = (id: string, data: Partial<Manga>) =>
  request<Manga>(`/admin/manga/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...data, firstDateJp: toRFC3339(data.firstDateJp) }),
  });
export const deleteManga = (id: string) => request<void>(`/admin/manga/${id}`, { method: "DELETE" });

export const attachAuthor = (mangaId: string, authorId: string, role: string) =>
  request<void>(`/admin/manga/${mangaId}/authors`, {
    method: "POST",
    body: JSON.stringify({ authorId, role }),
  });
export const detachAuthor = (mangaId: string, authorId: string, role: string) =>
  request<void>(`/admin/manga/${mangaId}/authors`, {
    method: "DELETE",
    body: JSON.stringify({ authorId, role }),
  });
export const attachGenre = (mangaId: string, genreId: string) =>
  request<void>(`/admin/manga/${mangaId}/genres`, { method: "POST", body: JSON.stringify({ genreId }) });
export const detachGenre = (mangaId: string, genreId: string) =>
  request<void>(`/admin/manga/${mangaId}/genres`, { method: "DELETE", body: JSON.stringify({ genreId }) });

// Thai editions
export const getThaiEditions = (mangaId: string) =>
  request<ThaiEdition[]>(`/manga/${mangaId}/thai-editions`);
export const createThaiEdition = (mangaId: string, data: Partial<ThaiEdition>) =>
  request<ThaiEdition>(`/admin/manga/${mangaId}/thai-editions`, {
    method: "POST",
    body: JSON.stringify({ ...data, firstDateTh: toRFC3339(data.firstDateTh) }),
  });
export const updateThaiEdition = (id: string, data: Partial<ThaiEdition>) =>
  request<ThaiEdition>(`/admin/thai-editions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...data, firstDateTh: toRFC3339(data.firstDateTh) }),
  });
export const deleteThaiEdition = (id: string) =>
  request<void>(`/admin/thai-editions/${id}`, { method: "DELETE" });

// Volumes
export const getVolumes = (thaiEditionId: string) =>
  request<Volume[]>(`/thai-editions/${thaiEditionId}/volumes`);
export const createVolume = (thaiEditionId: string, data: Partial<Volume>) =>
  request<Volume>(`/admin/thai-editions/${thaiEditionId}/volumes`, {
    method: "POST",
    body: JSON.stringify({ ...data, publishDate: toRFC3339(data.publishDate) }),
  });
export const updateVolume = (id: string, data: Partial<Volume>) =>
  request<Volume>(`/admin/volumes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...data, publishDate: toRFC3339(data.publishDate) }),
  });
export const deleteVolume = (id: string) => request<void>(`/admin/volumes/${id}`, { method: "DELETE" });

// Publishers
export const getPublishers = () => request<Publisher[]>(`/admin/publishers`);
export const createPublisher = (data: Partial<Publisher>) =>
  request<Publisher>(`/admin/publishers`, { method: "POST", body: JSON.stringify(data) });
export const updatePublisher = (id: string, data: Partial<Publisher>) =>
  request<Publisher>(`/admin/publishers/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deletePublisher = (id: string) =>
  request<void>(`/admin/publishers/${id}`, { method: "DELETE" });

// Authors
export const getAuthors = () => request<Author[]>(`/admin/authors`);
export const createAuthor = (name: string) =>
  request<Author>(`/admin/authors`, { method: "POST", body: JSON.stringify({ name }) });
export const updateAuthor = (id: string, name: string) =>
  request<Author>(`/admin/authors/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
export const deleteAuthor = (id: string) => request<void>(`/admin/authors/${id}`, { method: "DELETE" });

// Genres
export const getGenres = () => request<Genre[]>(`/admin/genres`);
export const createGenre = (name: string) =>
  request<Genre>(`/admin/genres`, { method: "POST", body: JSON.stringify({ name }) });
export const updateGenre = (id: string, name: string) =>
  request<Genre>(`/admin/genres/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
export const deleteGenre = (id: string) => request<void>(`/admin/genres/${id}`, { method: "DELETE" });

// Users
export const getUsers = () => request<User[]>(`/admin/users`);
export const deleteUser = (id: string) => request<void>(`/admin/users/${id}`, { method: "DELETE" });

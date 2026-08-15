// Mirrors the JSON shapes returned by manga-tracker-api-go — see that
// repo's models/*.go and README.md "## API endpoints".

export interface Manga {
  id: string;
  titleOriginal: string;
  titleEn: string;
  introduction: string;
  imageUrl: string;
  firstDateJp: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MangaAuthor {
  authorId: string;
  name: string;
  role: "author" | "artist" | "story" | "illustrator";
}

export interface Genre {
  id: string;
  name: string;
}

export interface MangaDetail extends Manga {
  authors: MangaAuthor[] | null;
  genres: Genre[] | null;
}

export interface Publisher {
  id: string;
  name: string;
  websiteUrl: string;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThaiEdition {
  id: string;
  mangaId: string;
  publisherId: string;
  titleTh: string;
  firstDateTh: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Volume {
  id: string;
  thaiEditionId: string;
  volumeNumber: number;
  isbn: string | null;
  publishDate: string | null;
  price: number | null;
  imageUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalMangaSummary {
  anilistId: number;
  titleRomaji: string;
  titleEnglish: string;
  titleNative: string;
  year: number | null;
  coverImageUrl: string;
  format: string;
}

export interface ExternalAuthorDraft {
  name: string;
  role: MangaAuthor["role"];
}

export interface ExternalMangaDraft {
  titleOriginal: string;
  titleEn: string;
  introduction: string;
  imageUrl: string;
  firstDateJp: string | null;
  status: string;
  authors: ExternalAuthorDraft[];
  genres: string[];
}

export interface User {
  id: string;
  displayName: string;
  pictureUrl: string;
  createdAt: string;
  updatedAt: string;
}

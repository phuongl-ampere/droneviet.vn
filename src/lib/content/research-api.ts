export type ResearchRating = {
  average: number;
  count: number;
  mine: number | null;
};

export type ResearchArticle = {
  author?: { displayName?: string | null } | null;
  commentCount: number;
  coverImageAlt: string | null;
  coverImageUrl: string | null;
  locale: "en" | "vi";
  publishedAt: string | null;
  rating: ResearchRating;
  readingTimeMinutes: number;
  renderedHtml: string;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  summary: string | null;
  tableOfContents: Array<{ depth: number; id: string; text: string }>;
  tags: string[];
  title: string;
  updatedAt: string;
};

export type ResearchComment = {
  author?: { displayName?: string | null } | null;
  body: string;
  createdAt: string;
  id: string;
  visible: boolean;
};

function apiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("COMMERCE_API_NOT_CONFIGURED");
  }

  return `${baseUrl}${path}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("RESEARCH_API_REQUEST_FAILED");
  }

  return payload as T;
}

export const researchApi = {
  createComment: (slug: string, body: string) =>
    request<ResearchComment>(
      `/content/research/articles/${encodeURIComponent(slug)}/comments`,
      { body: JSON.stringify({ body }), method: "POST" },
    ),
  getArticle: (slug: string, locale: "en" | "vi") =>
    request<ResearchArticle>(
      `/content/research/articles/${encodeURIComponent(slug)}?locale=${locale}`,
    ),
  listArticles: ({
    cursor,
    locale,
  }: {
    cursor?: string;
    locale: "en" | "vi";
  }) =>
    request<{ items: ResearchArticle[]; nextCursor: string | null }>(
      `/content/research/articles?locale=${locale}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
    ),
  listComments: (slug: string) =>
    request<ResearchComment[]>(
      `/content/research/articles/${encodeURIComponent(slug)}/comments`,
    ),
  rateArticle: (slug: string, score: number) =>
    request<ResearchRating>(
      `/content/research/articles/${encodeURIComponent(slug)}/rating`,
      { body: JSON.stringify({ score }), method: "PUT" },
    ),
  removeRating: (slug: string) =>
    request<ResearchRating>(
      `/content/research/articles/${encodeURIComponent(slug)}/rating`,
      { method: "DELETE" },
    ),
  reportComment: (commentId: string, reason: string) =>
    request<{ reported: true }>(
      `/content/research/comments/${encodeURIComponent(commentId)}/reports`,
      { body: JSON.stringify({ reason }), method: "POST" },
    ),
};

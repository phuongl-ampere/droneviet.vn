import type { ArticleEditorMode } from "./article-editor";

export type ArticleMediaItem = {
  alt: string;
  createdAt: string;
  height: number;
  id: string;
  url: string;
  width: number;
};

function apiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");
  if (!baseUrl) throw new Error("COMMERCE_API_NOT_CONFIGURED");
  return `${baseUrl}${path}`;
}

async function request<T>(
  accessToken: string,
  path: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });
  const payload = (await response.json()) as unknown;
  if (!response.ok) throw new Error("ADMIN_ARTICLE_API_REQUEST_FAILED");
  return payload as T;
}

export const adminArticleApi = {
  createDraft: (
    accessToken: string,
    input: { editorMode: ArticleEditorMode; locale: string; slug: string; title: string },
  ) => request<{ id: string }>(accessToken, "/admin/content/articles", {
    body: JSON.stringify({ ...input, section: "research" }),
    method: "POST",
  }),
  listMedia: (accessToken: string) =>
    request<ArticleMediaItem[]>(accessToken, "/admin/content/media", {
      method: "GET",
    }),
  publish: (
    accessToken: string,
    articleId: string,
    input: Record<string, unknown>,
  ) => request(accessToken, `/admin/content/articles/${articleId}/publish`, {
    body: JSON.stringify(input),
    method: "POST",
  }),
  updateDraft: (
    accessToken: string,
    articleId: string,
    input: Record<string, unknown>,
  ) => request(accessToken, `/admin/content/articles/${articleId}/draft`, {
    body: JSON.stringify(input),
    method: "PATCH",
  }),
  uploadMedia: (
    accessToken: string,
    file: File,
    alt: string,
    articleId?: string,
  ) => {
    const form = new FormData();
    form.set("image", file);
    form.set("alt", alt);
    if (articleId) form.set("articleId", articleId);
    return request<ArticleMediaItem>(accessToken, "/admin/content/media", {
      body: form,
      method: "POST",
    });
  },
};

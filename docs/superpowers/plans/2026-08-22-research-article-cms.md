# Research Article CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/kien-thuc-rd/nghien-cuu-phat-trien` into a database-backed research article publication with an admin authoring studio, two independently stored editor modes, local image uploads, public comments, 1-5 ratings, and complete article SEO.

**Architecture:** Extend the existing NestJS `Article` and `ContentRevision` model rather than introducing a separate CMS. Research articles are a `section` of the canonical content model and are delivered through dedicated public REST endpoints to dynamic Next.js research routes. The admin studio uses Tiptap for rich text and a Markdown source editor for Markdown; each article stores one immutable `editorMode`, canonical source, sanitized rendered HTML, and immutable published revisions.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, NestJS 10, TypeORM/MySQL, existing JWT/cookie auth, Tiptap 3.30.2, `@tiptap/html` 3.30.2, `sharp` 0.35.3, `reading-time` 1.5.0, `@nestjs/throttler` 6.5.0.

## Global Constraints

- Use the existing `Article`, `ContentRevision`, `AuditEvent`, JWT guard, admin roles, and current MySQL migration style.
- Keep the current `/tin-tuc` Markdown-backed public pages operating during this project; research articles use new routes under `/kien-thuc-rd/nghien-cuu-phat-trien`.
- Public reader layout is the approved reader-first direction: main article column, sticky table of contents on desktop, rating and comments below the body.
- `editorMode` is selected when the draft is created and cannot be changed after either `bodyMarkdown` has non-whitespace content or `bodyJson` has a non-empty document.
- Markdown and rich-text are independent source formats. Do not silently convert between them.
- Comments are visible immediately after an authenticated customer posts them. They are plain text only, rate-limited, reportable, and can be hidden by a content administrator.
- Each authenticated customer has at most one 1-5 rating per article; submitting another score replaces the existing rating.
- Store uploaded article images on local disk under `backend/storage/uploads/articles/`; add this directory to `.gitignore`. Never accept client-supplied paths as a file-system path.
- Use the backend’s existing renderer/sanitization path for persisted public HTML. Client previews are for author feedback, not a trust boundary.
- Do not use browser storage for auth tokens or author drafts. Server-side draft persistence is the source of truth.

## Target Data Model

| Entity | Core fields and constraints |
| --- | --- |
| `Article` | Existing content plus `section`, `editorMode`, nullable `bodyJson`, `tags`, `coverImageAlt`, `authorId`, `readingTimeMinutes`; status remains draft/published. |
| `ContentRevision` | Existing immutable revision plus `editorMode`, nullable `bodyJson`, reading time, cover metadata, tags, and section in metadata. |
| `ArticleMedia` | UUID, article nullable until attached, uploader, storage key, public URL, alt text, original MIME, width/height, bytes, variants JSON, timestamps. |
| `ArticleComment` | UUID, article, author, plain-text body, `visible` boolean, created/updated timestamps. |
| `ArticleCommentReport` | UUID, comment, reporter, reason, timestamp, unique `(commentId, reporterId)`. |
| `ArticleRating` | UUID, article, user, integer score 1-5, timestamps, unique `(articleId, userId)`. |

## Public Routes

| Method | Route | Auth | Behavior |
| --- | --- | --- |
| `GET` | `/content/research/articles?locale=vi&cursor=` | Optional | Cursor-paginated published research cards with aggregate rating. |
| `GET` | `/content/research/articles/:slug?locale=vi` | Optional | Published article, rendered HTML, TOC, media, rating aggregate, requesting user’s rating. |
| `GET` | `/content/research/articles/:slug/comments?cursor=` | Optional | Visible comments, newest first, cursor-paginated. |
| `POST` | `/content/research/articles/:slug/comments` | Customer | Create an immediately visible plain-text comment. |
| `PATCH` | `/content/research/comments/:id` | Owner | Update own visible comment. |
| `DELETE` | `/content/research/comments/:id` | Owner | Delete own comment. |
| `POST` | `/content/research/comments/:id/reports` | Customer | Report a visible comment once. |
| `PUT` | `/content/research/articles/:slug/rating` | Customer | Upsert the current user’s 1-5 score. |
| `DELETE` | `/content/research/articles/:slug/rating` | Customer | Remove the current user’s score. |

## Admin Routes

| Method | Route | Behavior |
| --- | --- | --- |
| `POST` | `/admin/content/articles` | Create a draft with immutable initial `editorMode`. |
| `GET` | `/admin/content/articles` | List drafts and published articles, filterable by section/status/locale. |
| `GET` | `/admin/content/articles/:id` | Return an editable article source, media, revision summary, and SEO diagnostics data. |
| `PATCH` | `/admin/content/articles/:id/draft` | Debounced autosave of metadata and the source for the existing editor mode. |
| `POST` | `/admin/content/articles/:id/publish` | Validate SEO/content, render and sanitize, create immutable revision, publish. |
| `POST` | `/admin/content/articles/:id/revisions/:revisionNumber/restore` | Restore revision source into draft state; a subsequent publish creates a new revision. |
| `POST` | `/admin/content/media` | Upload an image through memory storage; produce local optimized files and return a media URL. |
| `GET` | `/admin/content/comments/reports` | List report queue with article/comment/user context. |
| `POST` | `/admin/content/comments/:id/hide` | Hide comment and write audit event. |
| `POST` | `/admin/content/comments/:id/restore` | Restore hidden comment and write audit event. |

---

### Task 1: Add Editor Dependencies and Shared Content Contracts

**Files:**
- Modify: `package.json`
- Modify: `backend/package.json`
- Create: `src/lib/content/article-editor.ts`
- Create: `backend/src/content/rich-text-renderer.service.ts`
- Create: `backend/src/content/rich-text-renderer.service.spec.ts`
- Create: `src/lib/content/article-editor.test.ts`

**Interfaces:**
- Frontend exports `ARTICLE_EDITOR_MODES`, `ArticleEditorMode`, `createEmptyRichTextDocument()`, and `isRichTextDocumentEmpty(document)`.
- Backend exports `RichTextRendererService.render(document)` returning `{ html, tableOfContents, text }`.
- Both editors use the same node policy: StarterKit, Link with `https?` protocol validation, and Image with local `/media/articles/` URLs only.

- [ ] **Step 1: Add a failing rich-text renderer test**

```ts
it("renders allowed Tiptap JSON and produces headings for the table of contents", async () => {
  await expect(
    renderer.render({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Method" }] },
        { type: "paragraph", content: [{ type: "text", text: "Repeatable flight protocol." }] },
      ],
    }),
  ).resolves.toEqual(
    expect.objectContaining({
      html: expect.stringContaining("<h2"),
      tableOfContents: [{ depth: 2, id: "method", text: "Method" }],
      text: "Method Repeatable flight protocol.",
    }),
  );
});
```

- [ ] **Step 2: Verify the test fails**

Run: `cd backend && npm test -- src/content/rich-text-renderer.service.spec.ts`

Expected: FAIL because `RichTextRendererService` does not exist.

- [ ] **Step 3: Install compatible packages**

```bash
npm install @tiptap/core@3.30.2 @tiptap/react@3.30.2 \
  @tiptap/starter-kit@3.30.2 @tiptap/extension-image@3.30.2 \
  @tiptap/extension-link@3.30.2 @tiptap/extension-character-count@3.30.2 \
  @tiptap/markdown@3.30.2 reading-time@1.5.0

cd backend
npm install @tiptap/core@3.30.2 @tiptap/html@3.30.2 \
  @tiptap/starter-kit@3.30.2 @tiptap/extension-image@3.30.2 \
  @tiptap/extension-link@3.30.2 sharp@0.35.3 \
  reading-time@1.5.0 @nestjs/throttler@6.5.0 zod@4.4.3
```

- [ ] **Step 4: Implement the renderer and client helpers**

```ts
export const ARTICLE_EDITOR_MODES = ["markdown", "rich_text"] as const;
export type ArticleEditorMode = (typeof ARTICLE_EDITOR_MODES)[number];

export function createEmptyRichTextDocument() {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

export function isRichTextDocumentEmpty(document: JSONContent | null): boolean {
  return !document?.content?.some((node) =>
    node.type !== "paragraph" ||
    node.content?.some((child) => Boolean(child.text?.trim())),
  );
}
```

On the backend, call `generateHTML` from `@tiptap/html` with the shared extension policy, sanitize generated HTML through the existing rehype sanitization pipeline, derive heading text and IDs, and produce text for reading-time calculation.

- [ ] **Step 5: Verify renderer and helper tests**

Run:

```bash
cd backend && npm test -- src/content/rich-text-renderer.service.spec.ts
cd .. && npm test -- src/lib/content/article-editor.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json backend/package.json backend/package-lock.json \
  src/lib/content/article-editor.ts src/lib/content/article-editor.test.ts \
  backend/src/content/rich-text-renderer.service.ts \
  backend/src/content/rich-text-renderer.service.spec.ts
git commit -m "feat: add article editor rendering contracts"
```

### Task 2: Migrate the Article, Revision, Media, Comment, and Rating Schema

**Files:**
- Create: `backend/src/database/migrations/1766920300000-research-article-cms.ts`
- Create: `backend/src/database/migrations/1766920300000-research-article-cms.spec.ts`
- Modify: `backend/src/content/entities/article.entity.ts`
- Modify: `backend/src/content/entities/content-revision.entity.ts`
- Create: `backend/src/content/entities/article-media.entity.ts`
- Create: `backend/src/content/entities/article-comment.entity.ts`
- Create: `backend/src/content/entities/article-comment-report.entity.ts`
- Create: `backend/src/content/entities/article-rating.entity.ts`
- Modify: `backend/src/database/data-source.ts`
- Modify: `backend/src/database/data-source.spec.ts`

**Interfaces:**
- `ArticleSection = "news" | "research"`.
- `Article.editorMode: ArticleEditorMode`, `Article.bodyJson: JSONContent | null`, `Article.tags: string[]`, `Article.readingTimeMinutes: number`, `Article.authorId: string | null`.
- `ArticleRating` enforces a database unique key on `(articleId, userId)` and score range 1 through 5.

- [ ] **Step 1: Write migration tests**

```ts
it("backfills existing articles as Markdown news without changing publication state", async () => {
  await migration.up(queryRunner);

  expect(queryRunner.query).toHaveBeenCalledWith(
    expect.stringContaining("ADD COLUMN `editorMode`"),
  );
  expect(queryRunner.query).toHaveBeenCalledWith(
    expect.stringContaining("UPDATE `articles` SET `section` = 'news'"),
  );
});

it("creates unique per-user article rating and comment report constraints", async () => {
  await migration.up(queryRunner);

  expect(queryRunner.query).toHaveBeenCalledWith(
    expect.stringContaining("UNIQUE KEY `UQ_article_ratings_article_user`"),
  );
  expect(queryRunner.query).toHaveBeenCalledWith(
    expect.stringContaining("UQ_article_comment_reports_comment_reporter"),
  );
});
```

- [ ] **Step 2: Verify migration tests fail**

Run: `cd backend && npm test -- src/database/migrations/1766920300000-research-article-cms.spec.ts`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Implement schema**

Create the new migration in the project’s forward-only style. It must:

```sql
ALTER TABLE `articles`
  ADD COLUMN `section` ENUM('news','research') NOT NULL DEFAULT 'news',
  ADD COLUMN `editorMode` ENUM('markdown','rich_text') NOT NULL DEFAULT 'markdown',
  ADD COLUMN `bodyJson` JSON NULL,
  ADD COLUMN `tags` JSON NULL,
  ADD COLUMN `coverImageAlt` VARCHAR(255) NULL,
  ADD COLUMN `authorId` VARCHAR(36) NULL,
  ADD COLUMN `readingTimeMinutes` INT NOT NULL DEFAULT 1;
```

Add a nullable `authorId` foreign key with `ON DELETE SET NULL`. Extend `content_revisions` with `editorMode`, nullable `bodyJson`, and metadata fields for section/tags/cover/reading time. Create `article_media`, `article_comments`, `article_comment_reports`, and `article_ratings`; index published research retrieval by `(section, status, locale, publishedAt)` and comments by `(articleId, visible, createdAt)`.

- [ ] **Step 4: Verify migration and data-source tests**

Run:

```bash
cd backend
npm test -- src/database/migrations/1766920300000-research-article-cms.spec.ts \
  src/database/data-source.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/database backend/src/content/entities
git commit -m "feat: add research article content schema"
```

### Task 3: Implement Draft, Revision, and Publish Workflows

**Files:**
- Create: `backend/src/content/dto/create-article-draft.dto.ts`
- Create: `backend/src/content/dto/update-article-draft.dto.ts`
- Create: `backend/src/content/dto/publish-article.dto.ts`
- Modify: `backend/src/content/content.service.ts`
- Modify: `backend/src/content/content.service.spec.ts`
- Modify: `backend/src/content/admin-content.controller.ts`
- Modify: `backend/src/content/admin-content.controller.spec.ts`
- Modify: `backend/src/content/content.module.ts`

**Interfaces:**
- `createArticleDraft(input, actorId)` writes draft source in one immutable `editorMode`.
- `updateArticleDraft(articleId, input, actorId)` autosaves without publishing.
- `publishArticle(articleId, input, actorId)` writes rendered public HTML and an immutable revision.
- `restoreArticleRevision(articleId, revisionNumber, actorId)` replaces draft source only; it does not publish.

- [ ] **Step 1: Write failing workflow tests**

```ts
it("rejects changing editor mode after a Markdown draft contains content", async () => {
  await expect(
    service.updateArticleDraft("article-1", {
      editorMode: "rich_text",
      bodyJson: createEmptyRichTextDocument(),
    }, "admin-1"),
  ).rejects.toThrow("editor mode is locked");
});

it("publishes exactly one immutable revision from the active source mode", async () => {
  const published = await service.publishArticle("article-1", {
    editorMode: "rich_text",
    bodyJson: validDocument,
    title: "Flight protocol",
  }, "admin-1");

  expect(published.renderedHtml).toContain("<h2");
  expect(revisionRepository.save).toHaveBeenCalledWith(
    expect.objectContaining({ editorMode: "rich_text", bodyJson: validDocument }),
  );
});
```

- [ ] **Step 2: Verify workflow tests fail**

Run: `cd backend && npm test -- src/content/content.service.spec.ts src/content/admin-content.controller.spec.ts`

Expected: FAIL because draft update, mode locking, and revision restore do not exist.

- [ ] **Step 3: Implement canonical source handling**

Define source validation:

```ts
function assertSourceMatchesMode(input: ArticleSourceInput) {
  if (input.editorMode === "markdown" && !input.bodyMarkdown?.trim()) {
    throw new BadRequestException("Markdown content is required");
  }
  if (input.editorMode === "rich_text" && isRichTextDocumentEmpty(input.bodyJson)) {
    throw new BadRequestException("Rich-text content is required");
  }
}
```

Use `MarkdownRendererService` for Markdown and `RichTextRendererService` for JSON. Persist exactly one source mode, sanitized `renderedHtml`, table of contents, tags normalized to unique lowercase slugs, and `Math.max(1, Math.ceil(readingTime(text).minutes))`. Record `content.article.draft_saved`, `content.article.published`, and `content.article.revision_restored` audit events with actor ID.

- [ ] **Step 4: Add admin REST routes**

Add `GET/PATCH` draft routes, list/detail routes, publish, and revision restore under `AdminContentController`. Preserve the existing roles:

```ts
@Roles(UserRole.SUPER_ADMIN, UserRole.CATALOG_MANAGER, UserRole.INSTRUCTOR)
```

Return `409 Conflict` for locked mode updates and `422 Unprocessable Entity` for a publish that fails SEO/content gates.

- [ ] **Step 5: Verify workflow tests pass**

Run: `cd backend && npm test -- src/content/content.service.spec.ts src/content/admin-content.controller.spec.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/src/content
git commit -m "feat: add article drafts revisions and publishing"
```

### Task 4: Add Local Article Media Uploads

**Files:**
- Create: `backend/src/content/article-media.service.ts`
- Create: `backend/src/content/article-media.service.spec.ts`
- Create: `backend/src/content/admin-article-media.controller.ts`
- Create: `backend/src/content/article-media.controller.ts`
- Create: `backend/src/content/dto/upload-article-media.dto.ts`
- Modify: `backend/src/content/content.module.ts`
- Modify: `backend/src/main.ts`
- Modify: `.gitignore`
- Modify: `backend/.env.example`

**Interfaces:**
- `ArticleMediaService.store(file, { alt, articleId?, uploaderId })` returns `{ id, url, width, height, alt }`.
- `GET /media/articles/:year/:month/:filename` streams only files inside `CONTENT_MEDIA_ROOT`.
- `POST /admin/content/media` accepts one `image` multipart file, 10 MB maximum.

- [ ] **Step 1: Write failing image processing and path validation tests**

```ts
it("writes a normalized WebP image and returns a stable local media URL", async () => {
  const asset = await service.store(pngBufferFile, {
    alt: "Flight telemetry overview",
    uploaderId: "admin-1",
  });

  expect(asset.url).toMatch(/^\/media\/articles\/\d{4}\/\d{2}\/[a-f0-9-]+\.webp$/);
  expect(sharp).toHaveBeenCalled();
});

it("rejects traversal segments when reading local media", () => {
  expect(() => service.resolvePublicPath("..", "08", "secret")).toThrow(
    "invalid media path",
  );
});
```

- [ ] **Step 2: Verify tests fail**

Run: `cd backend && npm test -- src/content/article-media.service.spec.ts`

Expected: FAIL because the service does not exist.

- [ ] **Step 3: Implement local storage**

Use memory upload, verify image decoding with `sharp`, remove EXIF metadata, limit originals to 2400px without enlargement, output WebP quality 82, and create a 640px companion variant. Store beneath:

```text
${CONTENT_MEDIA_ROOT:-backend/storage/uploads}/articles/YYYY/MM/<generated-uuid>.webp
```

Persist `ArticleMedia` metadata. Add `/backend/storage/uploads/` to `.gitignore`. The `MediaController` must validate year/month/filename regular expressions before resolving a path, use `path.resolve`, verify the path starts with the configured root, and stream with `Cache-Control: public, max-age=31536000, immutable`.

- [ ] **Step 4: Verify media tests**

Run: `cd backend && npm test -- src/content/article-media.service.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/content backend/src/main.ts backend/.env.example .gitignore
git commit -m "feat: add local article media uploads"
```

### Task 5: Add Published Research, Comments, Ratings, and Moderation APIs

**Files:**
- Create: `backend/src/content/public-research-content.controller.ts`
- Create: `backend/src/content/research-engagement.service.ts`
- Create: `backend/src/content/research-engagement.service.spec.ts`
- Create: `backend/src/content/admin-comment-moderation.controller.ts`
- Create: `backend/src/content/dto/create-article-comment.dto.ts`
- Create: `backend/src/content/dto/upsert-article-rating.dto.ts`
- Create: `backend/src/content/dto/report-article-comment.dto.ts`
- Modify: `backend/src/content/content.module.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Public article detail returns `rating: { average, count, mine }`, `commentCount`, `readingTimeMinutes`, author profile, sanitized HTML, TOC, cover image, tags, and dates.
- Comment mutations require `UserRole.CUSTOMER`; admin moderation uses existing content roles.
- The comment endpoint allows five requests per ten minutes per authenticated user and IP pair.

- [ ] **Step 1: Write failing interaction tests**

```ts
it("upserts one rating per customer and returns the recalculated aggregate", async () => {
  await service.rate("research-slug", "customer-1", 5);
  await service.rate("research-slug", "customer-1", 3);

  expect(ratingRepository.upsert).toHaveBeenLastCalledWith(
    expect.objectContaining({ score: 3, userId: "customer-1" }),
    ["articleId", "userId"],
  );
});

it("creates a visible plain-text comment immediately and lets a moderator hide it", async () => {
  const comment = await service.createComment("research-slug", "customer-1", {
    body: "Useful protocol. I reproduced the timing.",
  });

  expect(comment.visible).toBe(true);
  await service.hideComment(comment.id, "admin-1");
  expect(commentRepository.save).toHaveBeenCalledWith(
    expect.objectContaining({ visible: false }),
  );
});
```

- [ ] **Step 2: Verify tests fail**

Run: `cd backend && npm test -- src/content/research-engagement.service.spec.ts`

Expected: FAIL because engagement service and routes do not exist.

- [ ] **Step 3: Implement safe public interactions**

Use `OptionalJwtAuthGuard` for public article reads to calculate `mine`; use `JwtAuthGuard` plus customer role for mutations. Store comments as plain text, trim whitespace, enforce 2-2,000 characters, return `422` for invalid input, and never render comment content as HTML. Use `@nestjs/throttler` only on public comment/report/rating mutators, not on admin routes. Use report uniqueness to make a repeated report idempotent.

- [ ] **Step 4: Implement moderation endpoints**

The moderation list includes only reported comments by default. Hide/restore must write audit records:

```ts
await auditService.record({
  action: "content.comment.hidden",
  actorId,
  aggregateId: comment.id,
  aggregateType: "article_comment",
  nextState: { visible: false },
});
```

- [ ] **Step 5: Verify interaction tests**

Run: `cd backend && npm test -- src/content/research-engagement.service.spec.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/src/content backend/src/app.module.ts
git commit -m "feat: add research article engagement APIs"
```

### Task 6: Build Typed Frontend Research API Clients

**Files:**
- Create: `src/lib/content/research-api.ts`
- Create: `src/lib/content/research-api.test.ts`
- Create: `src/lib/content/admin-article-api.ts`
- Create: `src/lib/content/admin-article-api.test.ts`
- Modify: `src/lib/commerce/admin-api.ts`

**Interfaces:**
- `researchApi.listArticles({ locale, cursor })`, `getArticle(slug, locale)`, `listComments(slug, cursor)`, `createComment`, `rateArticle`, `removeRating`, `reportComment`.
- `adminArticleApi.createDraft`, `updateDraft`, `publish`, `restoreRevision`, `uploadMedia`, and moderation methods all accept the admin bearer token.

- [ ] **Step 1: Write failing API client tests**

```ts
it("sends public rating cookies without a bearer token", async () => {
  await researchApi.rateArticle("flight-protocol", 5);
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("/content/research/articles/flight-protocol/rating"),
    expect.objectContaining({ credentials: "include", method: "PUT" }),
  );
});

it("uploads admin media as multipart without a JSON content type", async () => {
  await adminArticleApi.uploadMedia("admin-token", file, "Flight view");
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("/admin/content/media"),
    expect.objectContaining({
      body: expect.any(FormData),
      headers: { Authorization: "Bearer admin-token" },
    }),
  );
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- src/lib/content/research-api.test.ts src/lib/content/admin-article-api.test.ts`

Expected: FAIL because the API clients do not exist.

- [ ] **Step 3: Implement typed clients**

Keep public requests cookie-backed and map `401` into the existing customer-auth handling. For admin requests, use the existing bearer-token request pattern. Do not place tokens in query strings, local storage, or FormData. Pagination uses opaque cursors, never page-number offsets.

- [ ] **Step 4: Verify tests**

Run: `npm test -- src/lib/content/research-api.test.ts src/lib/content/admin-article-api.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content src/lib/commerce/admin-api.ts
git commit -m "feat: add research content API clients"
```

### Task 7: Build the Admin Article Studio with Independent Live Editors

**Files:**
- Create: `src/components/admin/article-studio/article-studio.tsx`
- Create: `src/components/admin/article-studio/article-studio.test.tsx`
- Create: `src/components/admin/article-studio/markdown-article-editor.tsx`
- Create: `src/components/admin/article-studio/rich-text-article-editor.tsx`
- Create: `src/components/admin/article-studio/article-live-preview.tsx`
- Create: `src/components/admin/article-studio/article-metadata-panel.tsx`
- Create: `src/components/admin/article-studio/article-media-upload.tsx`
- Create: `src/components/admin/article-studio/seo-inspector.tsx`
- Modify: `src/components/admin/admin-workbench.tsx`
- Modify: `src/lib/i18n.ts`
- Modify: `src/i18n/locales/vi.json`
- Modify: `src/i18n/locales/en.json`

**Interfaces:**
- `ArticleStudio` receives `{ accessToken, articleId? }` and owns draft loading/autosave/publish state.
- `MarkdownArticleEditor` emits `string`; `RichTextArticleEditor` emits `JSONContent`.
- `ArticleLivePreview` receives `{ editorMode, bodyMarkdown?, bodyJson? }`.

- [ ] **Step 1: Write failing studio tests**

```tsx
it("locks editor mode after the selected Markdown draft receives content", async () => {
  render(<ArticleStudio accessToken="admin-token" />);
  await user.selectOptions(screen.getByLabelText("Editor mode"), "markdown");
  await user.type(screen.getByLabelText("Markdown source"), "# Protocol");

  expect(screen.getByLabelText("Editor mode")).toBeDisabled();
});

it("inserts a local media URL into the active Markdown editor and updates preview", async () => {
  uploadMedia.mockResolvedValue({ alt: "Flight map", url: "/media/articles/2026/08/flight.webp" });
  render(<ArticleStudio accessToken="admin-token" />);
  await user.upload(screen.getByLabelText("Upload image"), imageFile);

  expect(screen.getByLabelText("Markdown source")).toHaveValue(
    expect.stringContaining("![Flight map](/media/articles/2026/08/flight.webp)"),
  );
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- src/components/admin/article-studio/article-studio.test.tsx`

Expected: FAIL because the studio does not exist.

- [ ] **Step 3: Implement the studio**

Create a three-region authoring surface:

```text
Metadata + SEO panel | editor source | live rendered preview
```

Use a 750ms debounced `PATCH /draft` autosave and show explicit `Saving`, `Saved`, `Offline/error` states. The initial draft creation dialog collects section, locale, title, slug, and mode. Disable mode selection after source becomes non-empty. Markdown mode uses a compact monospace textarea plus `MarkdownDocument` preview; rich mode uses Tiptap left and read-only `EditorContent` preview right. Upload inserts a Markdown image token or Tiptap Image node depending on active mode.

SEO inspector computes immediate client warnings: title 50-60 ideal characters, description 120-160 ideal characters, cover/alt present, valid slug, tags, visible H1, and at least 300 words. Publish stays disabled until backend validation succeeds.

- [ ] **Step 4: Integrate without expanding the current monolith**

Replace only the existing article create/publish portion of `AdminWorkbench` with a small launcher:

```tsx
{activePanel === "articles" ? (
  <ArticleStudio accessToken={accessToken} />
) : null}
```

Add a separate moderation subview in `ArticleStudio`; do not add comment state to `AdminWorkbench`.

- [ ] **Step 5: Verify studio tests**

Run: `npm test -- src/components/admin/article-studio/article-studio.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin src/lib/i18n.ts src/i18n
git commit -m "feat: add live admin article studio"
```

### Task 8: Publish the Reader-First Research Listing and Article Routes

**Files:**
- Create: `src/app/kien-thuc-rd/nghien-cuu-phat-trien/page.tsx`
- Create: `src/app/kien-thuc-rd/nghien-cuu-phat-trien/[slug]/page.tsx`
- Create: `src/app/kien-thuc-rd/nghien-cuu-phat-trien/[slug]/page.test.tsx`
- Create: `src/components/research/research-article-list.tsx`
- Create: `src/components/research/research-article-reader.tsx`
- Create: `src/components/research/article-table-of-contents.tsx`
- Create: `src/components/research/article-rating.tsx`
- Create: `src/components/research/article-comments.tsx`
- Create: `src/components/research/research-article-list.test.tsx`
- Modify: `src/components/localized-chrome.tsx`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Specific R&D routes take precedence over the existing generic `[pillar]/[topic]` route.
- Reader consumes only `status=published` public research API data.
- Rating/comment components rely on cookie session, never accept caller-supplied user IDs.

- [ ] **Step 1: Write failing public route and interaction tests**

```tsx
it("renders published research cards on the R&D landing page", async () => {
  listArticles.mockResolvedValue({ items: [researchCard], nextCursor: null });
  render(await ResearchLandingPage());

  expect(screen.getByRole("link", { name: researchCard.title })).toHaveAttribute(
    "href",
    `/kien-thuc-rd/nghien-cuu-phat-trien/${researchCard.slug}`,
  );
});

it("submits a visible comment and replaces a signed-in user rating", async () => {
  render(<ResearchArticleReader article={researchArticle} />);
  await user.type(screen.getByLabelText("Bình luận"), "Useful method.");
  await user.click(screen.getByRole("button", { name: "Gửi bình luận" }));
  await user.click(screen.getByRole("radio", { name: "5 sao" }));

  expect(createComment).toHaveBeenCalledWith(researchArticle.slug, "Useful method.");
  expect(rateArticle).toHaveBeenCalledWith(researchArticle.slug, 5);
});
```

- [ ] **Step 2: Verify tests fail**

Run:

```bash
npm test -- src/components/research/research-article-list.test.tsx \
  src/app/kien-thuc-rd/nghien-cuu-phat-trien/[slug]/page.test.tsx
```

Expected: FAIL because research routes and reader components do not exist.

- [ ] **Step 3: Implement reader-first public UI**

Create a research list with published date, reading time, tags, cover image, average rating, and cursor “load more”. The detail page uses a main readable article column and desktop sticky TOC. Render only backend-generated sanitized HTML, not untrusted client source. Place rating summary, rating control, comment count, and flat visible comments below the article; signed-out users see login links with a validated `next` return path.

Comments must post optimistically only after server success; rendered text stays escaped. The report action opens a compact reason field and sends one report per account. Hidden/deleted comments do not render.

- [ ] **Step 4: Verify public UI tests**

Run:

```bash
npm test -- src/components/research/research-article-list.test.tsx \
  src/app/kien-thuc-rd/nghien-cuu-phat-trien/[slug]/page.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/kien-thuc-rd src/components/research src/components/localized-chrome.tsx
git commit -m "feat: publish reader-first research articles"
```

### Task 9: Add Article SEO, Structured Data, Sitemap, and On-Demand Revalidation

**Files:**
- Modify: `src/lib/seo.ts`
- Create: `src/lib/seo.test.ts` additions for article data
- Create: `src/app/api/revalidate-content/route.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/kien-thuc-rd/nghien-cuu-phat-trien/[slug]/page.tsx`
- Modify: `backend/src/content/content.service.ts`
- Modify: `backend/.env.example`
- Modify: `.env.example`

**Interfaces:**
- `buildArticleJsonLd(article)` returns schema.org `Article`, adding `aggregateRating` only when `rating.count > 0`.
- Admin publish calls configured `NEXT_REVALIDATE_URL` with `NEXT_REVALIDATE_SECRET`; failure is logged but does not roll back a successful database publish.

- [ ] **Step 1: Write failing SEO tests**

```ts
it("emits Article JSON-LD with ratings only when the article has ratings", () => {
  expect(buildArticleJsonLd({ ...article, rating: { average: 0, count: 0 } }))
    .not.toHaveProperty("aggregateRating");

  expect(buildArticleJsonLd({ ...article, rating: { average: 4.5, count: 12 } }))
    .toMatchObject({
      "@type": "Article",
      aggregateRating: { ratingValue: 4.5, ratingCount: 12 },
    });
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- src/lib/seo.test.ts`

Expected: FAIL because article structured data does not exist.

- [ ] **Step 3: Implement SEO and cache invalidation**

Use `generateMetadata` on the research detail route:

```ts
return {
  alternates: { canonical: `/kien-thuc-rd/nghien-cuu-phat-trien/${article.slug}` },
  description: article.seoDescription ?? article.summary,
  openGraph: { images: article.coverImageUrl ? [article.coverImageUrl] : [] },
  title: article.seoTitle ?? article.title,
};
```

Embed `Article`, `BreadcrumbList`, and optional `AggregateRating` JSON-LD through the existing `JsonLd` component. Extend sitemap with all published research slugs from the public content API and `lastModified: updatedAt`. The signed revalidation route validates a header secret and calls `revalidatePath` for research list/detail and `revalidateTag("research-articles")`.

- [ ] **Step 4: Verify SEO tests**

Run: `npm test -- src/lib/seo.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts src/app/api/revalidate-content \
  src/app/sitemap.ts src/app/kien-thuc-rd backend/src/content \
  backend/.env.example .env.example
git commit -m "feat: add SEO and revalidation for research articles"
```

### Task 10: Verify Security, Migration, and Full Workflows

**Files:**
- Create: `docs/runbooks/local-research-content.md`
- Modify only when verification exposes a defect.

- [ ] **Step 1: Run migrations in a local database**

```bash
cd backend
DATABASE_HOST=127.0.0.1 DATABASE_PORT=3307 DATABASE_NAME=droneviet \
DATABASE_USER=droneviet DATABASE_PASSWORD=droneviet npm run migration:run
```

Expected: existing articles remain published/draft with `section="news"` and `editorMode="markdown"`; new research tables exist.

- [ ] **Step 2: Run complete automated suites**

```bash
cd backend && npm test && npm run build
cd .. && npm test && npm run build
```

Expected: all test suites and production builds pass.

- [ ] **Step 3: Browser workflow verification**

Use `http://127.0.0.1:3003` with the local API:

1. Log in as an admin and create a research Markdown draft; verify mode locks after typing.
2. Upload a PNG; verify image URL is inserted and public media URL loads.
3. Publish and confirm a new revision, rendered preview, SEO inspection, and R&D listing entry.
4. Create a second rich-text article; verify JSON source remains independent from Markdown.
5. Visit the public reader page; verify metadata, canonical URL, JSON-LD, TOC, image, and reading time.
6. Log in as a customer; post a comment, score 5 stars, edit score to 3, and verify aggregate updates.
7. Report the comment from a second customer; hide it through admin moderation; verify it disappears publicly.
8. Confirm unauthenticated visitors cannot post/comment/rate, image upload requires an admin bearer token, and no admin endpoint accepts a customer cookie alone.

- [ ] **Step 4: Write local operating notes**

Document `CONTENT_MEDIA_ROOT`, media cleanup rules, local backup location, static media route, upload limits, revalidation variables, and how to restore a hidden comment in `docs/runbooks/local-research-content.md`.

- [ ] **Step 5: Commit**

```bash
git add docs/runbooks/local-research-content.md
git commit -m "docs: add research content operations guide"
```

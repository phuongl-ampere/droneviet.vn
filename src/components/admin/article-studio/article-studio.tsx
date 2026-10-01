"use client";

import { CodeNode, $createCodeNode } from "@lexical/code";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  HorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import NextImage from "next/image";
import {
  Bold,
  Code2,
  Copy,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Smile,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MarkdownDocument } from "@/components/content/markdown-document";
import { useI18n } from "@/components/i18n-provider";
import {
  adminArticleApi,
  type ArticleMediaItem,
} from "@/lib/content/admin-article-api";
import {
  createEmptyRichTextDocument,
  isRichTextDocumentEmpty,
  type ArticleEditorMode,
  type LexicalArticleState,
} from "@/lib/content/article-editor";
import {
  $createArticleImageNode,
  ArticleImageNode,
} from "./article-image-node";

const lexicalNodes = [
  AutoLinkNode,
  ArticleImageNode,
  CodeNode,
  HeadingNode,
  HorizontalRuleNode,
  LinkNode,
  ListItemNode,
  ListNode,
  QuoteNode,
  TableCellNode,
  TableNode,
  TableRowNode,
];

const editorEmojis = [
  "\u{1F680}",
  "\u{1F4E1}",
  "\u{1F4A1}",
  "\u{1F6E0}",
  "\u{2705}",
  "\u{26A0}",
];

const lexicalTheme = {
  tableScrollableWrapper: "rich-text-table-scroll",
};

function mergeMedia(
  primary: ArticleMediaItem[],
  secondary: ArticleMediaItem[],
): ArticleMediaItem[] {
  const byUrl = new Map<string, ArticleMediaItem>();

  for (const media of [...primary, ...secondary]) {
    byUrl.set(media.url, media);
  }

  return [...byUrl.values()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

function slugifyTitle(title: string): string {
  return title
    .replaceAll("\u0110", "D")
    .replaceAll("\u0111", "d")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255)
    .replace(/-+$/g, "");
}

export function ArticleStudio({ accessToken }: { accessToken?: string }) {
  const { t } = useI18n();
  const [articleId, setArticleId] = useState<string>();
  const [editorMode, setEditorMode] = useState<ArticleEditorMode>("rich_text");
  const [markdown, setMarkdown] = useState("");
  const [richJson, setRichJson] = useState<LexicalArticleState>(
    createEmptyRichTextDocument,
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState<ArticleMediaItem[]>([]);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const lexicalEditorRef = useRef<LexicalEditor | null>(null);
  const locked =
    editorMode === "markdown"
      ? Boolean(markdown.trim())
      : !isRichTextDocumentEmpty(richJson);

  useEffect(() => {
    if (!articleId || !accessToken) {
      return;
    }

    const timer = window.setTimeout(() => {
      void adminArticleApi
        .updateDraft(accessToken, articleId, {
          bodyJson: editorMode === "rich_text" ? richJson : undefined,
          bodyMarkdown: editorMode === "markdown" ? markdown : undefined,
          editorMode,
          slug,
          title,
        })
        .then(() => setStatus(t("admin.articleSaved")))
        .catch(() => setStatus(t("admin.articleSaveError")));
    }, 750);

    return () => window.clearTimeout(timer);
  }, [
    accessToken,
    articleId,
    editorMode,
    markdown,
    richJson,
    slug,
    t,
    title,
  ]);

  useEffect(() => {
    let isActive = true;

    if (!accessToken) {
      return () => {
        isActive = false;
      };
    }

    void adminArticleApi
      .listMedia(accessToken)
      .then((media) => {
        if (isActive) {
          setUploadedMedia((current) => mergeMedia(media, current));
        }
      })
      .catch(() => {
        if (isActive) {
          setStatus(t("admin.articleSaveError"));
        }
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, t]);

  async function ensureDraft() {
    if (articleId) {
      return articleId;
    }
    if (!accessToken) {
      throw new Error("MISSING_ADMIN_SESSION");
    }

    const draft = await adminArticleApi.createDraft(accessToken, {
      editorMode,
      locale: "vi",
      slug: slug.trim(),
      title: title.trim(),
    });
    setArticleId(draft.id);

    return draft.id;
  }

  function uploadImage(file: File) {
    if (!accessToken) {
      return;
    }

    void adminArticleApi
      .uploadMedia(accessToken, file, file.name, articleId)
      .then((media) => {
        setUploadedMedia((current) => mergeMedia([media], current));
      })
      .catch(() => setStatus(t("admin.articleSaveError")));
  }

  function publish() {
    void ensureDraft()
      .then((id) =>
        adminArticleApi.publish(accessToken ?? "", id, {
          bodyJson: editorMode === "rich_text" ? richJson : undefined,
          bodyMarkdown: editorMode === "markdown" ? markdown : undefined,
          editorMode,
          title,
        }),
      )
      .then(() => setStatus(t("admin.articlePublished")))
      .catch(() => setStatus(t("admin.articlePublishError")));
  }

  function insertImage(media: ArticleMediaItem) {
    lexicalEditorRef.current?.update(() => {
      $insertNodes([
        $createArticleImageNode({
          altText: media.alt,
          height: media.height,
          src: media.url,
          width: media.width,
        }),
      ]);
    });
    setIsImagePickerOpen(false);
  }

  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="border border-black/10 bg-white p-5">
        <label className="grid gap-2 text-sm font-medium">
          {t("admin.articleTitle")}
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setSlug(slugifyTitle(event.target.value));
            }}
            className="min-h-10 border border-black/15 px-3"
          />
        </label>
        <label className="mt-4 grid gap-2 text-sm font-medium">
          {t("admin.slug")}
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="min-h-10 border border-black/15 px-3"
          />
        </label>
        <label className="mt-4 grid gap-2 text-sm font-medium">
          {t("admin.editorMode")}
          <select
            aria-label={t("admin.editorMode")}
            value={editorMode}
            disabled={locked}
            onChange={(event) =>
              setEditorMode(event.target.value as ArticleEditorMode)
            }
            className="min-h-10 border border-black/15 bg-white px-3"
          >
            <option value="markdown">{t("admin.markdownContent")}</option>
            <option value="rich_text">{t("admin.richText")}</option>
          </select>
        </label>
        <button
          type="button"
          onClick={publish}
          className="mt-6 min-h-10 w-full bg-[#10232A] px-3 text-sm font-semibold text-white transition hover:bg-[#006D66]"
        >
          {t("common.publish")}
        </button>
        {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
      </aside>

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <section className="min-w-0 border border-black/10 bg-white p-5">
          {editorMode === "markdown" ? (
            <textarea
              aria-label={t("admin.articleMarkdownSource")}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              className="min-h-96 w-full resize-y border border-black/15 p-3 font-mono text-sm"
            />
          ) : (
            <LexicalRichTextEditor
              value={richJson}
              onChange={setRichJson}
              editorLabel={t("admin.lexicalEditorSource")}
              editorRef={lexicalEditorRef}
              onOpenImagePicker={() => setIsImagePickerOpen(true)}
            />
          )}
        </section>

        <section
          aria-label={t("common.preview")}
          className="min-w-0 overflow-hidden border border-black/10 bg-white p-5"
        >
          <h2 className="text-sm font-semibold">{t("common.preview")}</h2>
          <div className="mt-5 border-t border-black/10 pt-5">
            {editorMode === "markdown" ? (
              <MarkdownDocument content={markdown} />
            ) : (
              <LexicalRichTextPreview value={richJson} />
            )}
          </div>
        </section>
      </div>

      <section className="border border-black/10 bg-white p-5 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">{t("admin.uploadedImages")}</h2>
          <label className="inline-flex min-h-10 cursor-pointer items-center border border-black/15 px-3 text-sm font-semibold transition hover:border-[#006D66] hover:text-[#006D66]">
            {t("admin.uploadImage")}
            <input
              aria-label={t("admin.uploadImage")}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  uploadImage(file);
                }
              }}
            />
          </label>
        </div>
        {uploadedMedia.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {uploadedMedia.map((media) => (
              <div
                key={media.url}
                className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 border border-black/10 p-3"
              >
                <NextImage
                  alt={media.alt}
                  src={media.url}
                  width={64}
                  height={64}
                  unoptimized
                  className="aspect-square size-16 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{media.alt}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {media.url}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={media.url}
                  title={media.url}
                  onClick={() => void navigator.clipboard?.writeText(media.url)}
                  className="grid size-9 place-items-center border border-black/15 text-slate-600 transition hover:border-[#006D66] hover:text-[#006D66]"
                >
                  <Copy aria-hidden="true" size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {isImagePickerOpen ? (
        <ImagePicker
          media={uploadedMedia}
          onClose={() => setIsImagePickerOpen(false)}
          onSelect={insertImage}
        />
      ) : null}
    </section>
  );
}

function LexicalRichTextEditor({
  editorRef,
  editorLabel,
  onChange,
  onOpenImagePicker,
  value,
}: {
  editorRef: React.MutableRefObject<LexicalEditor | null>;
  editorLabel: string;
  onChange: (value: LexicalArticleState) => void;
  onOpenImagePicker: () => void;
  value: LexicalArticleState;
}) {
  const { t } = useI18n();
  const initialConfig = useMemo(
    () => ({
      editorState: JSON.stringify(value),
      namespace: "droneviet-article-editor",
      nodes: lexicalNodes,
      onError: (error: Error) => console.error(error),
      theme: lexicalTheme,
    }),
    [value],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border border-black/15">
        <LexicalEditorReference editorRef={editorRef} />
        <LexicalToolbar onOpenImagePicker={onOpenImagePicker} />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              aria-label={editorLabel}
              className="rich-text-content min-h-96 p-3 text-[1.05rem] leading-8 outline-none"
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <HorizontalRulePlugin />
        <ListPlugin />
        <LinkPlugin validateUrl={(url) => /^https?:\/\//i.test(url)} />
        <TablePlugin
          hasCellBackgroundColor={false}
          hasCellMerge={false}
          hasHorizontalScroll
        />
        <OnChangePlugin
          onChange={(editorState) =>
            onChange(editorState.toJSON() as LexicalArticleState)
          }
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {t("admin.richText")}
      </p>
    </LexicalComposer>
  );
}

function LexicalRichTextPreview({ value }: { value: LexicalArticleState }) {
  const stateKey = JSON.stringify(value);
  const initialConfig = useMemo(
    () => ({
      editable: false,
      editorState: JSON.stringify(value),
      namespace: `droneviet-article-preview-${stateKey}`,
      nodes: lexicalNodes,
      onError: (error: Error) => console.error(error),
      theme: lexicalTheme,
    }),
    [stateKey, value],
  );

  return (
    <LexicalComposer key={stateKey} initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            aria-label="Rich text preview"
            className="rich-text-content min-h-96 text-[1.05rem] leading-8 outline-none"
          />
        }
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <ListPlugin />
      <HorizontalRulePlugin />
      <LinkPlugin validateUrl={(url) => /^https?:\/\//i.test(url)} />
      <TablePlugin
        hasCellBackgroundColor={false}
        hasCellMerge={false}
        hasHorizontalScroll
      />
    </LexicalComposer>
  );
}

function LexicalEditorReference({
  editorRef,
}: {
  editorRef: React.MutableRefObject<LexicalEditor | null>;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editorRef.current = editor;

    return () => {
      if (editorRef.current === editor) {
        editorRef.current = null;
      }
    };
  }, [editor, editorRef]);

  return null;
}

function LexicalToolbar({
  onOpenImagePicker,
}: {
  onOpenImagePicker: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const { t } = useI18n();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  function setBlock(
    factory: () => HeadingNode | QuoteNode | CodeNode,
  ) {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, factory);
      }
    });
  }

  return (
    <div
      role="toolbar"
      aria-label={t("admin.editorToolbar")}
      className="relative flex min-h-11 flex-wrap items-center gap-1 border-b border-black/10 bg-[#F7FAFC] px-2"
    >
      <LexicalToolButton
        label={t("admin.bold")}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <Bold aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.italic")}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <Italic aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.underline")}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <Underline aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.strikethrough")}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
      >
        <Strikethrough aria-hidden="true" size={16} />
      </LexicalToolButton>
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-black/10" />
      <LexicalToolButton
        label={t("admin.heading1")}
        onClick={() => setBlock(() => $createHeadingNode("h1"))}
      >
        <Heading1 aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.heading2")}
        onClick={() => setBlock(() => $createHeadingNode("h2"))}
      >
        <Heading2 aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.heading3")}
        onClick={() => setBlock(() => $createHeadingNode("h3"))}
      >
        <Heading3 aria-hidden="true" size={16} />
      </LexicalToolButton>
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-black/10" />
      <LexicalToolButton
        label={t("admin.bulletList")}
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        <List aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.orderedList")}
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        <ListOrdered aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.blockquote")}
        onClick={() => setBlock(() => $createQuoteNode())}
      >
        <Quote aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.codeBlock")}
        onClick={() => setBlock(() => $createCodeNode())}
      >
        <Code2 aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.insertDivider")}
        onClick={() =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
        }
      >
        <Minus aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.insertTable")}
        onClick={() =>
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns: "3",
            includeHeaders: { columns: false, rows: true },
            rows: "3",
          })
        }
      >
        <Table2 aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.insertImage")}
        onClick={onOpenImagePicker}
      >
        <ImagePlus aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.insertEmoji")}
        onClick={() => setIsEmojiPickerOpen((open) => !open)}
      >
        <Smile aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.link")}
        onClick={() => {
          const url = window.prompt(t("admin.linkPrompt"));
          if (url && /^https?:\/\//i.test(url)) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
          }
        }}
      >
        <Link2 aria-hidden="true" size={16} />
      </LexicalToolButton>
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-black/10" />
      <LexicalToolButton
        label={t("admin.undo")}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2 aria-hidden="true" size={16} />
      </LexicalToolButton>
      <LexicalToolButton
        label={t("admin.redo")}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2 aria-hidden="true" size={16} />
      </LexicalToolButton>
      {isEmojiPickerOpen ? (
        <div
          role="menu"
          aria-label={t("admin.insertEmoji")}
          className="absolute left-0 top-full z-10 flex gap-1 border border-black/15 bg-white p-2 shadow-lg"
        >
          {editorEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={emoji}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                editor.update(() => {
                  const selection = $getSelection();

                  if ($isRangeSelection(selection)) {
                    selection.insertText(emoji);
                  }
                });
                setIsEmojiPickerOpen(false);
              }}
              className="grid size-8 place-items-center text-base transition hover:bg-[#E8F8F6]"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ImagePicker({
  media,
  onClose,
  onSelect,
}: {
  media: ArticleMediaItem[];
  onClose: () => void;
  onSelect: (media: ArticleMediaItem) => void;
}) {
  const { t } = useI18n();

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label={t("admin.imagePicker")}
      className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5"
    >
      <div className="max-h-[min(42rem,calc(100vh-2.5rem))] w-full max-w-4xl overflow-y-auto border border-black/15 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
          <h2 className="text-base font-semibold">{t("admin.imagePicker")}</h2>
          <button
            type="button"
            aria-label={t("admin.closeImagePicker")}
            title={t("admin.closeImagePicker")}
          onClick={onClose}
          className="grid size-9 place-items-center border border-black/15 text-lg transition hover:border-[#006D66] hover:text-[#006D66]"
        >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
        {media.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={t("admin.selectImage", { name: item.alt })}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(item)}
                className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 border border-black/10 p-3 text-left transition hover:border-[#006D66]"
              >
                <NextImage
                  alt={item.alt}
                  src={item.url}
                  width={64}
                  height={64}
                  unoptimized
                  className="aspect-square size-16 object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {item.alt}
                  </span>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {item.url}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-600">
            {t("admin.noUploadedImages")}
          </p>
        )}
      </div>
    </section>
  );
}

function LexicalToolButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="grid size-8 place-items-center text-slate-600 transition hover:bg-white hover:text-[#006D66]"
    >
      {children}
    </button>
  );
}

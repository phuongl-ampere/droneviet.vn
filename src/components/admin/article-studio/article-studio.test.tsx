import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import { ArticleStudio } from "./article-studio";

const { createDraft, listMedia, updateDraft, uploadMedia } = vi.hoisted(() => ({
  createDraft: vi.fn(),
  listMedia: vi.fn(),
  updateDraft: vi.fn(),
  uploadMedia: vi.fn(),
}));

vi.mock("@/lib/content/admin-article-api", () => ({
  adminArticleApi: {
    createDraft,
    listMedia,
    publish: vi.fn(),
    updateDraft,
    uploadMedia,
  },
}));

describe("ArticleStudio", () => {
  beforeEach(() => {
    createDraft.mockReset();
    createDraft.mockResolvedValue({ id: "article-1" });
    listMedia.mockReset();
    listMedia.mockResolvedValue([]);
    updateDraft.mockReset();
    updateDraft.mockResolvedValue({});
    uploadMedia.mockReset();
    uploadMedia.mockResolvedValue({
      alt: "flight.png",
      createdAt: "2026-08-23T08:00:00.000Z",
      height: 640,
      id: "media-flight",
      url: "/media/articles/2026/08/flight.webp",
      width: 640,
    });
  });

  it("loads the shared image library when the studio opens", async () => {
    listMedia.mockResolvedValue([
      {
        alt: "shared-drone.png",
        createdAt: "2026-08-23T08:00:00.000Z",
        height: 640,
        id: "media-shared",
        url: "/media/articles/2026/08/shared-drone.webp",
        width: 640,
      },
    ]);

    render(
      <I18nProvider locale="vi">
        <ArticleStudio accessToken="admin-token" />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(listMedia).toHaveBeenCalledWith("admin-token");
    });
    expect(screen.getByText("shared-drone.png")).toBeInTheDocument();
    expect(
      screen.getByText("/media/articles/2026/08/shared-drone.webp"),
    ).toBeInTheDocument();
  });

  it("uploads media without creating an article draft", async () => {
    render(
      <I18nProvider locale="vi">
        <ArticleStudio accessToken="admin-token" />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByLabelText("Tải ảnh lên"), {
      target: {
        files: [new File(["image"], "flight.png", { type: "image/png" })],
      },
    });

    await waitFor(() => {
      expect(uploadMedia).toHaveBeenCalledWith(
        "admin-token",
        expect.any(File),
        "flight.png",
        undefined,
      );
    });
    expect(createDraft).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Ảnh đã tải lên" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("/media/articles/2026/08/flight.webp"),
    ).toBeInTheDocument();
  });

  it("starts with the Lexical visual editor and can switch to Markdown", () => {
    render(
      <I18nProvider locale="vi">
        <ArticleStudio accessToken="admin-token" />
      </I18nProvider>,
    );

    expect(
      screen.getByLabelText("Soạn thảo Lexical"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Chế độ soạn thảo"), {
      target: { value: "markdown" },
    });

    expect(
      screen.getByLabelText("Nguồn Markdown bài nghiên cứu"),
    ).toBeInTheDocument();
  });

  it("generates a normalized slug from a Vietnamese article title", () => {
    render(
      <I18nProvider locale="vi">
        <ArticleStudio />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByLabelText("Tiêu đề"), {
      target: { value: "Điều khiển Drone: Cấp 2 & 3!" },
    });

    expect(screen.getByLabelText("Slug")).toHaveValue(
      "dieu-khien-drone-cap-2-3",
    );
  });

  it("marks the Lexical editor and preview for rich-text list and code styles", () => {
    render(
      <I18nProvider locale="vi">
        <ArticleStudio />
      </I18nProvider>,
    );

    expect(screen.getByLabelText("Soạn thảo Lexical")).toHaveClass(
      "rich-text-content",
    );
    expect(screen.getByLabelText("Rich text preview")).toHaveClass(
      "rich-text-content",
    );
  });

  it("adds table, image, emoji, and extended formatting controls", () => {
    render(
      <I18nProvider locale="vi">
        <ArticleStudio />
      </I18nProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Tiêu đề 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tiêu đề 3" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gạch chân" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gạch ngang" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Chèn bảng" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Chèn ảnh" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Chèn emoji" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đường phân cách" }),
    ).toBeInTheDocument();
  });
});

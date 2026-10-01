import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { mkdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import type { OutputInfo } from "sharp";
import { DataSource } from "typeorm";
import { ArticleMedia } from "./entities/article-media.entity";

type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

function mediaRoot(root?: string): string {
  return resolve(root?.trim() || "storage/uploads");
}

@Injectable()
export class ArticleMediaService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async store(
    file: UploadedImage,
    input: { alt: string; articleId?: string; uploaderId: string },
  ) {
    if (!file?.buffer?.length || !file.mimetype.startsWith("image/")) {
      throw new BadRequestException("ARTICLE_MEDIA_IMAGE_REQUIRED");
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException("ARTICLE_MEDIA_TOO_LARGE");
    }

    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const fileName = `${randomUUID()}.webp`;
    const key = `${year}/${month}/${fileName}`;
    const root = this.root();
    const directory = resolve(root, "articles", year, month);
    const outputPath = resolve(directory, fileName);
    const smallFileName = fileName.replace(/\.webp$/, "-640.webp");
    const smallOutputPath = resolve(directory, smallFileName);

    await mkdir(directory, { recursive: true });
    let metadata: OutputInfo;

    try {
      metadata = await sharp(file.buffer)
        .rotate()
        .resize({ width: 2400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);
      await sharp(file.buffer)
        .rotate()
        .resize({ width: 640, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(smallOutputPath);
    } catch {
      throw new BadRequestException("ARTICLE_MEDIA_IMAGE_INVALID");
    }

    const bytes = (await stat(outputPath)).size;
    const publicUrl = `/media/articles/${key}`;
    const media = await this.dataSource.getRepository(ArticleMedia).save(
      this.dataSource.getRepository(ArticleMedia).create({
        altText: input.alt.trim() || "Article image",
        articleId: input.articleId ?? null,
        bytes,
        height: metadata.height ?? 1,
        originalMime: file.mimetype,
        publicUrl,
        storageKey: key,
        uploaderId: input.uploaderId,
        variants: {
          small: `/media/articles/${year}/${month}/${smallFileName}`,
        },
        width: metadata.width ?? 1,
      }),
    );

    return {
      alt: media.altText,
      createdAt: media.createdAt.toISOString(),
      height: media.height,
      id: media.id,
      url: media.publicUrl,
      width: media.width,
    };
  }

  async list() {
    const media = await this.dataSource.getRepository(ArticleMedia).find({
      order: { createdAt: "DESC" },
    });

    return media.map((item) => ({
      alt: item.altText,
      createdAt: item.createdAt.toISOString(),
      height: item.height,
      id: item.id,
      url: item.publicUrl,
      width: item.width,
    }));
  }

  resolvePublicPath(year: string, month: string, filename: string): string {
    if (
      !/^\d{4}$/.test(year) ||
      !/^\d{2}$/.test(month) ||
      !/^[a-f0-9-]+(?:-640)?\.webp$/i.test(filename)
    ) {
      throw new BadRequestException("invalid media path");
    }

    const root = this.root();
    const filePath = resolve(root, "articles", year, month, filename);
    const prefix = `${root}/`;

    if (!filePath.startsWith(prefix)) {
      throw new BadRequestException("invalid media path");
    }

    return filePath;
  }

  async findPublicPath(
    year: string,
    month: string,
    filename: string,
  ): Promise<string> {
    const filePath = this.resolvePublicPath(year, month, filename);

    try {
      await stat(filePath);
    } catch {
      throw new NotFoundException("ARTICLE_MEDIA_NOT_FOUND");
    }

    return filePath;
  }

  private root(): string {
    return mediaRoot(this.config.get<string>("CONTENT_MEDIA_ROOT"));
  }
}

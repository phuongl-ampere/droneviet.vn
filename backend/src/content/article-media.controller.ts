import { Controller, Get, Param, StreamableFile } from "@nestjs/common";
import { createReadStream } from "node:fs";
import { ArticleMediaService } from "./article-media.service";

@Controller("media/articles")
export class ArticleMediaController {
  constructor(private readonly mediaService: ArticleMediaService) {}

  @Get(":year/:month/:filename")
  async getMedia(
    @Param("year") year: string,
    @Param("month") month: string,
    @Param("filename") filename: string,
  ) {
    const filePath = await this.mediaService.findPublicPath(
      year,
      month,
      filename,
    );

    return new StreamableFile(createReadStream(filePath), {
      disposition: "inline",
      type: "image/webp",
    });
  }
}

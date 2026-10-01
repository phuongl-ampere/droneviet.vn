import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "../auth/entities/user.entity";
import { ResearchEngagementService } from "./research-engagement.service";

@Controller("admin/content/comments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CATALOG_MANAGER,
  UserRole.INSTRUCTOR,
)
export class AdminCommentModerationController {
  constructor(private readonly engagement: ResearchEngagementService) {}

  @Get("reports")
  listReports() {
    return this.engagement.listReportedComments();
  }

  @Post(":id/hide")
  hide(
    @Param("id") id: string,
    @Req() request: { user?: { sub?: string } },
  ) {
    return this.engagement.hideComment(id, request.user?.sub);
  }

  @Post(":id/restore")
  restore(
    @Param("id") id: string,
    @Req() request: { user?: { sub?: string } },
  ) {
    return this.engagement.restoreComment(id, request.user?.sub);
  }
}

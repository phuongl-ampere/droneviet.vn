import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DronePillarDetail } from "./drone-pillar-pages";

describe("DronePillar pages", () => {
  it("renders the certification training topic page", () => {
    render(
      <DronePillarDetail
        pillarSlug="dao-tao-chung-chi"
        topicSlug="chung-chi-lai-drone"
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Chứng chỉ lái drone" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Trang chủ" }),
    ).toHaveAttribute("href", "/");
  });

  it("renders a legal-flight topic page", () => {
    render(
      <DronePillarDetail
        pillarSlug="bay-hop-phap"
        topicSlug="ban-do-cam-bay"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Bản đồ khu vực cấm/hạn chế bay",
      }),
    ).toBeInTheDocument();
  });
});

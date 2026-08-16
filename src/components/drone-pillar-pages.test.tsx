import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DronePillarDetail, DronePillarHub } from "./drone-pillar-pages";

describe("DronePillar pages", () => {
  it("renders the certification training hub and its child links", () => {
    render(<DronePillarHub slug="dao-tao-chung-chi" />);

    expect(
      screen.getByRole("heading", { name: "Đào tạo & Chứng chỉ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Chứng chỉ lái drone/ }),
    ).toHaveAttribute("href", "/dao-tao-chung-chi/chung-chi-lai-drone");
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

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import SkeletonCard from "./SkeletonCard.vue";

describe("SkeletonCard", () => {
  it("renders an animated placeholder card", async () => {
    const wrapper = await mountSuspended(SkeletonCard);

    expect(wrapper.classes()).toContain("animate-pulse");
    expect(wrapper.find(".aspect-square").exists()).toBe(true);
  });

  it("renders three placeholder text lines", async () => {
    const wrapper = await mountSuspended(SkeletonCard);

    expect(wrapper.findAll(".p-3 > div")).toHaveLength(3);
  });
});

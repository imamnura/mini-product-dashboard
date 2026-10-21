import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import CategoryFilter from "./CategoryFilter.vue";

const categories = ["electronics", "jewelery", "men's clothing"];

describe("CategoryFilter", () => {
  it("renders a default option followed by capitalized categories", async () => {
    const wrapper = await mountSuspended(CategoryFilter, {
      props: { categories, modelValue: "" },
    });

    const options = wrapper.findAll("option");
    expect(options.map((o) => o.text())).toEqual([
      "Categories",
      "Electronics",
      "Jewelery",
      "Men's clothing",
    ]);
    expect(options.map((o) => o.attributes("value"))).toEqual([
      "",
      ...categories,
    ]);
  });

  it("reflects the current modelValue as the selected option", async () => {
    const wrapper = await mountSuspended(CategoryFilter, {
      props: { categories, modelValue: "jewelery" },
    });

    const select = wrapper.find("select").element as HTMLSelectElement;
    expect(select.value).toBe("jewelery");
  });

  it("emits update:modelValue when another category is selected", async () => {
    const wrapper = await mountSuspended(CategoryFilter, {
      props: { categories, modelValue: "" },
    });

    await wrapper.find("select").setValue("electronics");

    expect(wrapper.emitted("update:modelValue")).toEqual([["electronics"]]);
  });

  it("renders only the default option when there are no categories", async () => {
    const wrapper = await mountSuspended(CategoryFilter, {
      props: { categories: [], modelValue: "" },
    });

    expect(wrapper.findAll("option")).toHaveLength(1);
  });
});

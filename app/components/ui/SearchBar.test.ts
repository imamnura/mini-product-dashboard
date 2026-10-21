import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { clearNuxtState } from "#imports";
import SearchBar from "./SearchBar.vue";

enableAutoUnmount(afterEach);

const HISTORY_KEY = "search:history";

function mountBar(modelValue = "") {
  return mountSuspended(SearchBar, { props: { modelValue } });
}

const storedHistory = () =>
  JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "null");

describe("SearchBar", () => {
  beforeEach(() => {
    localStorage.clear();
    clearNuxtState(undefined, { reset: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes the input from modelValue", async () => {
    const wrapper = await mountBar("shoes");

    expect((wrapper.find("input").element as HTMLInputElement).value).toBe(
      "shoes"
    );
  });

  it("syncs the input when modelValue changes from outside", async () => {
    const wrapper = await mountBar("shoes");

    await wrapper.setProps({ modelValue: "" });

    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("");
  });

  it("updates the model immediately and emits a debounced change", async () => {
    const wrapper = await mountBar();
    vi.useFakeTimers();

    await wrapper.find("input").setValue("bag");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["bag"]);
    expect(wrapper.emitted("change")).toBeUndefined();

    vi.advanceTimersByTime(400);

    expect(wrapper.emitted("change")).toEqual([["bag"]]);
  });

  it("shows a clear button only when there is a query", async () => {
    const wrapper = await mountBar();
    expect(wrapper.find("button").exists()).toBe(false);

    await wrapper.find("input").setValue("bag");

    expect(wrapper.find("button").text()).toBe("✖️");
  });

  it("clears the query and model when the clear button is clicked", async () => {
    const wrapper = await mountBar("bag");

    await wrapper.find("button").trigger("click");

    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([""]);
    expect(wrapper.emitted("change")?.at(-1)).toEqual([""]);
  });

  describe("history", () => {
    it("commits a trimmed term to history on enter", async () => {
      const wrapper = await mountBar();
      const input = wrapper.find("input");

      await input.setValue("  shoes  ");
      await input.trigger("keydown", { key: "Enter" });

      expect(wrapper.emitted("change")?.at(-1)).toEqual(["shoes"]);
      expect(storedHistory()).toEqual(["shoes"]);
    });

    it("ignores blank terms on enter", async () => {
      const wrapper = await mountBar();
      const input = wrapper.find("input");

      await input.setValue("   ");
      await input.trigger("keydown", { key: "Enter" });

      expect(wrapper.emitted("change")).toBeUndefined();
      expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
    });

    it("keeps history unique, newest first and limited to 8 items", async () => {
      const wrapper = await mountBar();
      const input = wrapper.find("input");

      for (const term of ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"]) {
        await input.setValue(term);
        await input.trigger("keydown", { key: "Enter" });
      }
      await input.setValue("t5");
      await input.trigger("keydown", { key: "Enter" });

      expect(storedHistory()).toEqual([
        "t5",
        "t9",
        "t8",
        "t7",
        "t6",
        "t4",
        "t3",
        "t2",
      ]);
    });

    it("loads history from localStorage on mount", async () => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(["bag", "shoes"]));
      const wrapper = await mountBar();

      await wrapper.find("input").trigger("focus");

      const items = wrapper.findAll("li button.truncate");
      expect(items.map((b) => b.text())).toEqual(["bag", "shoes"]);
      expect(wrapper.text()).toContain("Recent searches");
    });

    it("ignores invalid history in localStorage", async () => {
      localStorage.setItem(HISTORY_KEY, "{invalid");
      const wrapper = await mountBar();

      await wrapper.find("input").trigger("focus");

      expect(wrapper.find("ul").exists()).toBe(false);
    });

    it("does not crash when saving history fails", async () => {
      const wrapper = await mountBar();
      const setItem = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("quota exceeded");
        });
      const input = wrapper.find("input");

      await input.setValue("bag");
      await input.trigger("keydown", { key: "Enter" });

      expect(setItem).toHaveBeenCalled();
      expect(wrapper.emitted("change")?.at(-1)).toEqual(["bag"]);
    });

    it("hides the dropdown when not focused or history is empty", async () => {
      const wrapper = await mountBar();

      await wrapper.find("input").trigger("focus");

      expect(wrapper.find("ul").exists()).toBe(false);
    });

    it("filters history by the current query (case-insensitive)", async () => {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(["Red Bag", "shoes", "blue bag"])
      );
      const wrapper = await mountBar();
      const input = wrapper.find("input");

      await input.trigger("focus");
      await input.setValue("BAG");

      const items = wrapper.findAll("li button.truncate");
      expect(items.map((b) => b.text())).toEqual(["Red Bag", "blue bag"]);
    });

    it("applies a history item", async () => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(["shoes"]));
      const wrapper = await mountBar();
      await wrapper.find("input").trigger("focus");

      await wrapper.find("li button.truncate").trigger("click");

      expect((wrapper.find("input").element as HTMLInputElement).value).toBe(
        "shoes"
      );
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["shoes"]);
      expect(wrapper.emitted("change")?.at(-1)).toEqual(["shoes"]);
      expect(wrapper.find("ul").exists()).toBe(false);
    });

    it("removes a single history item", async () => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(["bag", "shoes"]));
      const wrapper = await mountBar();
      await wrapper.find("input").trigger("focus");

      await wrapper.findAll("li button")[1]!.trigger("click");

      expect(wrapper.findAll("li").map((li) => li.text())).toEqual([
        expect.stringContaining("shoes"),
      ]);
      expect(storedHistory()).toEqual(["shoes"]);
    });

    it("clears all history", async () => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(["bag", "shoes"]));
      const wrapper = await mountBar();
      await wrapper.find("input").trigger("focus");

      const clearAll = wrapper
        .findAll("button")
        .find((b) => b.text() === "Clear all")!;
      await clearAll.trigger("click");

      expect(wrapper.find("ul").exists()).toBe(false);
      expect(storedHistory()).toEqual([]);
    });

    it("closes the dropdown shortly after blur", async () => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(["bag"]));
      const wrapper = await mountBar();
      const input = wrapper.find("input");
      await input.trigger("focus");
      expect(wrapper.find("ul").exists()).toBe(true);
      vi.useFakeTimers();

      await input.trigger("blur");
      expect(wrapper.find("ul").exists()).toBe(true);

      await vi.advanceTimersByTimeAsync(120);
      expect(wrapper.find("ul").exists()).toBe(false);
    });
  });
});

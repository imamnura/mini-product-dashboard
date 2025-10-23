import { mount } from "@vue/test-utils";
import ProductCard from "../../../app/components/ui/ProductCard.vue";

describe("ProductCard", () => {
  const mock = {
    id: 1,
    title: "Test Product",
    price: 30,
    description: "This is a test product.",
    category: "electronics",
    image: "https://image.jpg",
    rating: { rate: 4.5, count: 10 },
  };

  it("render product title and price", () => {
    const wrapper = mount(ProductCard, { props: { p: mock } });
    expect(wrapper.text()).toContain("Test Product");
  });

  it("links to product detail", () => {
    const wrapper = mount(ProductCard, { props: { p: mock } });
    const link = wrapper.find("a");
    expect(link.attributes("href")).toContain(`/products/${mock.id}`);
  });
});

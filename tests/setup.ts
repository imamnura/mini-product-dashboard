import { config } from "@vue/test-utils";
// global mock
// mock composables atau plugin Nuxt yang tidak ada di runtime test
config.global.mocks = {
  useRuntimeConfig: () => ({
    public: { API_BASE: "https://fakestoreapi.com" },
  }),
};

config.global.stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ["to"],
  },
};

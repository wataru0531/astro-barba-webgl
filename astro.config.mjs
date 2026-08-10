// @ts-check
import { defineConfig } from "astro/config"
import glsl from "vite-plugin-glsl"
import glslify from "rollup-plugin-glslify";


export default defineConfig({
  devToolbar: {
    enabled: false,
  },

  vite: {
    plugins: [
      glslify(),
    ],
  },

  server: {
    host: true,
  },
});
import next from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...next,
  {
    rules: {
      // Enforce structured logger over raw console in app code.
      // logger.ts itself is the sink and is exempted below.
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // The React Compiler hook rules (set-state-in-effect, purity, refs,
      // immutability) are advisory here: they flag idiomatic data-fetching
      // effects and useRef-during-render patterns that are correct in this
      // codebase. Keep them as warnings (visible signal) rather than build
      // blockers, so a live deploy is never gated on a stylistic refactor.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      // <img> in Satori/ImageResponse OG routes and avatar fallbacks is
      // intentional; surface as a warning, not an error.
      "@next/next/no-img-element": "warn",
    },
  },
  {
    files: ["src/lib/logger.ts"],
    rules: {
      "no-console": "off",
    },
  },
];

export default eslintConfig;

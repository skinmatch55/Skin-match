import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  {
    rules: {
      // Apostrophes in English copy are fine in JSX text.
      "react/no-unescaped-entities": "off",
      // Used on purpose for mount detection and resetting UI state when a sheet opens.
      "react-hooks/set-state-in-effect": "off",
      // Full page loads are intended after payment/logout (fresh server state).
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
  globalIgnores([
    "scripts/**",
    "test-results/**",
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

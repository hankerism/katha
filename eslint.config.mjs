import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // KATHA's persistence layer is localStorage-backed with SSR-safe no-ops;
      // client surfaces hydrate it with the house mount-gate pattern (read the
      // store once in a mount effect → setState → reveal). That is exactly the
      // "synchronize with an external system" case, but this rule flags every
      // synchronous setState in an effect body regardless. Revisit with
      // useSyncExternalStore when the Supabase data layer replaces local reads.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

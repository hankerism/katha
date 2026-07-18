/* Node ESM resolve hook: lets dev scripts import the project's TypeScript
 * modules despite their bundler-style extensionless relative imports.
 * Used by: node --experimental-strip-types --import ./scripts/ts-resolve-hook.mjs <script> */
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (/^\.\.?\//.test(specifier) && !/\.[a-z]+$/i.test(specifier)) {
        return next(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});

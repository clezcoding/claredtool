"use strict";

const tsJest = require("ts-jest").default;

// ponytail: regex rewrite of import.meta.url after ts-jest CJS emit; upgrade to
// Jest native ESM or a real import.meta transformer if Nest starts using other
// import.meta properties.
const IMPORT_META_URL = 'require("url").pathToFileURL(__filename).href';

function rewriteImportMeta(code) {
  // Nest 12 ESM emits `const require = createRequire(import.meta.url)`. After
  // ts-jest CJS emit that declaration collides with the wrapper `require`.
  const withoutEsmRequire = code.replace(
    /\bconst require\s*=/g,
    "const createdRequire =",
  );
  return withoutEsmRequire
    .replace(/import\.meta\.resolve\s*\(/g, "require.resolve(")
    .replace(/import\.meta\.url/g, IMPORT_META_URL);
}

function wrap(result) {
  if (result && typeof result.code === "string") {
    return { ...result, code: rewriteImportMeta(result.code) };
  }
  return result;
}

function createTransformer(config) {
  const inner = tsJest.createTransformer(config);
  return {
    process(src, filename, options) {
      return wrap(inner.process(src, filename, options));
    },
    processAsync(src, filename, options) {
      return Promise.resolve(inner.processAsync(src, filename, options)).then(
        wrap,
      );
    },
    getCacheKey(src, filename, options) {
      return `${inner.getCacheKey(src, filename, options)}:import.meta.url:createdRequire:resolve`;
    },
    getCacheKeyAsync(src, filename, options) {
      return Promise.resolve(
        inner.getCacheKeyAsync(src, filename, options),
      ).then((key) => `${key}:import.meta.url:createdRequire:resolve`);
    },
  };
}

module.exports = { createTransformer, rewriteImportMeta };

if (require.main === module) {
  const out = rewriteImportMeta(
    'const require = createRequire(import.meta.url);\nimport.meta.resolve("x");',
  );
  if (/\bconst require\s*=/.test(out)) {
    throw new Error("rewrite still shadows CJS require");
  }
  if (out.includes("import.meta")) {
    throw new Error("rewrite left import.meta");
  }
  if (!out.includes("createdRequire") || !out.includes("require.resolve(")) {
    throw new Error("rewrite missed createdRequire or import.meta.resolve");
  }
}

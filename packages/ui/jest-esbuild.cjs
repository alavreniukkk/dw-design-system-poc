const esbuild = require("esbuild");

module.exports = {
  process(source, filename) {
    const result = esbuild.transformSync(source, {
      loader: filename.endsWith("tsx") ? "tsx" : "ts",
      format: "cjs",
      jsx: "automatic",
      sourcefile: filename,
      target: "es2022",
    });
    return { code: result.code };
  },
};

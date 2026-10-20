const esbuild = require("esbuild");
const { transform } = require("@svgr/core");

module.exports = {
  process(source, filename) {
    const jsx = transform.sync(
      source.toString(),
      {
        plugins: ["@svgr/plugin-jsx"],
        jsxRuntime: "automatic",
        exportType: "default",
        svgo: false,
      },
      { filePath: filename },
    );
    const result = esbuild.transformSync(jsx, {
      loader: "jsx",
      format: "cjs",
      jsx: "automatic",
    });
    return { code: result.code };
  },
};

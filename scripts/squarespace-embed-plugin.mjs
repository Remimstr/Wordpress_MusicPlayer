import fs from "fs";
import { resolve } from "path";

export function squarespaceEmbedPlugin(rootDir) {
  return {
    name: "squarespace-embed-generator",
    closeBundle() {
      const cssPath = resolve(rootDir, "dist/composer-player.css");
      const jsPath = resolve(rootDir, "dist/composer-player.js");
      const templatePath = resolve(
        rootDir,
        "templates/squarespace-embed.template.html",
      );
      const outputPath = resolve(rootDir, "dist/squarespace-code-block.html");

      if (
        !fs.existsSync(cssPath) ||
        !fs.existsSync(jsPath) ||
        !fs.existsSync(templatePath)
      ) {
        return;
      }

      const css = fs.readFileSync(cssPath, "utf-8");
      const js = fs.readFileSync(jsPath, "utf-8");
      const template = fs.readFileSync(templatePath, "utf-8");

      const output = template
        .replace("/* STYLES */", css)
        .replace("/* RUNTIME */", js);

      fs.writeFileSync(outputPath, output);
    },
  };
}

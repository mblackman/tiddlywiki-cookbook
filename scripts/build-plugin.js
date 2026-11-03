#!/usr/bin/env node
/**
 * Builds the Cookbook plugin ($:/plugins/mblackman/cookbook):
 * Minifies embedded CSS in the output artifacts (build/cookbook.tid,
 * build/cookbook-plugin.json, and dist/cookbook-plugin.json) without modifying source files.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const PLUGIN_SRC = path.join(ROOT_DIR, "plugins", "mblackman", "cookbook");
const BUILD_DIR = path.join(ROOT_DIR, "build");
const DIST_DIR = path.join(ROOT_DIR, "dist");

function minifyTwCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function main() {
  const cssFiles = [path.join(PLUGIN_SRC, "styles", "index.css")].filter((f) =>
    fs.existsSync(f)
  );

  const backups = new Map();
  for (const file of cssFiles) {
    backups.set(file, fs.readFileSync(file, "utf8"));
  }

  try {
    for (const file of cssFiles) {
      fs.writeFileSync(file, minifyTwCss(backups.get(file)), "utf8");
    }

    fs.mkdirSync(BUILD_DIR, { recursive: true });
    fs.mkdirSync(DIST_DIR, { recursive: true });

    execSync(
      "npx cross-env TIDDLYWIKI_PLUGIN_PATH=plugins tiddlywiki demo --output build --build cookbook",
      { stdio: "inherit", cwd: ROOT_DIR }
    );

    const rawJsonPath = path.join(BUILD_DIR, "cookbook-plugin.json");
    if (fs.existsSync(rawJsonPath)) {
      const pluginObj = JSON.parse(fs.readFileSync(rawJsonPath, "utf8"));
      const dragDropBundle = Array.isArray(pluginObj) ? pluginObj : [pluginObj];
      fs.writeFileSync(
        path.join(DIST_DIR, "cookbook-plugin.json"),
        JSON.stringify(dragDropBundle, null, 2),
        "utf8"
      );
    }

    console.log(
      "✅ Built build/cookbook.tid, build/cookbook-plugin.json, and dist/cookbook-plugin.json"
    );
  } finally {
    for (const [file, originalContent] of backups.entries()) {
      fs.writeFileSync(file, originalContent, "utf8");
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

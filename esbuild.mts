import esbuild from "esbuild";
import process from "process";
import { builtinModules } from 'node:module';
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import path from "node:path";
import { parseArgs } from "node:util";



const _args = parseArgs({
    options: {
        prod:  {type: "boolean"},
        build: {type: "string"},
        watch: {type: "boolean"}, // renderer only
    }
});

const _prod          = _args.values.prod;
const _build_which   = _args.values.build;
const _renderer_only = _build_which === "renderer" ? true : false;
const _watch         = _args.values.watch;

console.log(`esbuild prod=${_prod} build=${_renderer_only ? "renderer" : "all"} watch=${_watch}`);

const _main_path    = "src/paint2/electron/main.ts";
const _render_path  = "src/paint2/app/app.ts";

const _html_path    = "src/paint2/app/app.html";

const _html         = await readFile(_html_path, "utf-8");

const _cheerio_html = cheerio.load(_html);

_cheerio_html("script[src]").each((_, _el)=>{
    const _href = _cheerio_html(_el).attr("src");
    if (!_href || _href.startsWith("http")) {
        return;
    }

    _cheerio_html(_el).attr("src", path.basename(_href).replace(/\.ts$/, ".js"));
});

const _processed_html = _cheerio_html.html();

const _common = {
    bundle: true,
    target: "es2025",
    sourcemap: _prod ? false : "inline" as const,
    minify: _prod,
    logLevel: "info" as const,
    define: {
        _DEV: _prod ? "false": "true",
    }
}

const _main = _renderer_only ? undefined : await esbuild.context({
    ..._common,
    entryPoints: [_main_path],
    outfile: ".x/main.js",
    platform: "node",
    format: "esm",
    external: [
        ...builtinModules,
        "mime-types",
        "electron",
        "electron-squirrel-startup",
    ],
});

const _renderer = await esbuild.context({
    ..._common,
    entryPoints: [_render_path],
    outfile: ".x/app.js",
    platform: "browser",
    format: "esm",
    external: [
        ...builtinModules, 
        "electron",
    ],
    loader: {
        ".wgsl":  "text",
        ".css":   "css",
        ".ttf":   "file",
        ".woff":  "file",
        ".woff2": "file",
    },
    assetNames: "assets/[name]-[hash]",
});

if (!_renderer_only) {
    await rm(".x", {recursive: true, force: true});
    await mkdir(".x", {recursive: true});
}

if (_watch) {
    await Promise.all([
        _renderer.watch(),
    ]);
} else {
    await Promise.all([
        _main?.rebuild(),
        _renderer.rebuild(),
        writeFile(".x/app.html", _processed_html),
    ]);
    process.exit(0);
}
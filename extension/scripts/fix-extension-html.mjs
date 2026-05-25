import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const htmlFiles = [
  join("dist", "src", "popup", "index.html"),
  join("dist", "src", "sidepanel", "index.html")
];

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8")
    .replaceAll('src="/popup/', 'src="../../popup/')
    .replaceAll('src="/sidepanel/', 'src="../../sidepanel/')
    .replaceAll('href="/assets/', 'href="../../assets/');

  writeFileSync(file, html);
}

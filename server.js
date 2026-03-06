/**
 * Custom Node server for Namecheap / cPanel deployment.
 * cPanel "Setup Node.js App" runs this file and sets PORT.
 * Requires: (1) node_modules from "Run NPM Install", (2) .next from local "npm run build" in the zip.
 */
const { createServer } = require("http");
const { parse } = require("url");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const cwd = __dirname;

// 1. Require node_modules (Prisma)
const prismaCmd = path.join(cwd, "node_modules", ".bin", process.platform === "win32" ? "prisma.cmd" : "prisma");
if (!fs.existsSync(prismaCmd)) {
  console.error("[server.js] Prisma not in node_modules. In cPanel: Setup Node.js App → Run NPM Install → Restart.");
  process.exit(1);
}
try {
  execSync(`"${prismaCmd}" generate`, { cwd, stdio: "pipe", encoding: "utf-8" });
} catch (e) {
  console.error("[server.js] prisma generate failed:", e.message);
  process.exit(1);
}

// 2. Require production build (.next)
const nextBuildId = path.join(cwd, ".next", "BUILD_ID");
if (!fs.existsSync(nextBuildId)) {
  console.error("[server.js] No .next build. On your computer: npm run build, then zip including .next and re-upload.");
  process.exit(1);
}

const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

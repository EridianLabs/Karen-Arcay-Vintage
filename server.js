/**
 * Custom Node server for Namecheap / cPanel deployment.
 * cPanel "Setup Node.js App" runs this file and sets PORT.
 * Runs prisma generate first if node_modules has prisma (so @prisma/client exists).
 */
const { createServer } = require("http");
const { parse } = require("url");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const next = require("next");

const cwd = __dirname;
const prismaCmd = path.join(cwd, "node_modules", ".bin", process.platform === "win32" ? "prisma.cmd" : "prisma");
if (fs.existsSync(prismaCmd)) {
  try {
    execSync(`"${prismaCmd}" generate`, { cwd, stdio: "pipe", encoding: "utf-8" });
  } catch (e) {
    console.error("[server.js] prisma generate failed:", e.message);
  }
} else {
  console.warn("[server.js] Prisma not in node_modules. Run 'Run NPM Install' in cPanel, then Restart.");
}

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

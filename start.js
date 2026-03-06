/**
 * Startup wrapper for cPanel: run "prisma generate" then start the app.
 * Use this as "Application startup file" so @prisma/client exists even if postinstall didn't run.
 * Uses the project's prisma (node_modules/.bin/prisma) so we don't get a different version via npx.
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const cwd = __dirname;
const prismaBin = path.join(cwd, "node_modules", ".bin", "prisma");
const prismaCmd = process.platform === "win32" ? "prisma.cmd" : "prisma";
const prismaPath = path.join(cwd, "node_modules", ".bin", prismaCmd);

if (!fs.existsSync(prismaPath)) {
  console.error("[start.js] Prisma not found in node_modules. Run 'Run NPM Install' in cPanel first.");
  process.exit(1);
}

try {
  execSync(`"${prismaPath}" generate`, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
} catch (e) {
  console.error("[start.js] prisma generate failed:", e.message);
  process.exit(1);
}

require("./server.js");

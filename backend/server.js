// backend/server.js
import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Choose which backend script to use:
// Replace "mini-shell.sh" with "safe_demo_shell.sh" if you prefer the sandboxed demo.
const SHELL_SCRIPT = path.join(__dirname, "mini-shell.sh");
// const SHELL_SCRIPT = path.join(__dirname, "safe_demo_shell.sh");

console.log("Using shell script:", SHELL_SCRIPT);

// Spawn the shell script as a persistent process
const shellProc = spawn("bash", [SHELL_SCRIPT], {
  cwd: __dirname,
  stdio: ["pipe", "pipe", "pipe"],
});

// Buffer for stdout data
let stdoutBuffer = "";
let stderrBuffer = "";

// Append data as it arrives
shellProc.stdout.on("data", (chunk) => {
  stdoutBuffer += chunk.toString();
});
shellProc.stderr.on("data", (chunk) => {
  stderrBuffer += chunk.toString();
});

shellProc.on("exit", (code, signal) => {
  console.error(`Shell process exited with code ${code} signal ${signal}`);
});

// Helper to write a command and wait briefly for output to be produced.
// This is a simple approach — for robust streaming use WebSockets / SSE or node-pty.
function execCommandAndCollect(cmd, timeoutMs = 200) {
  // Clear buffers
  stdoutBuffer = "";
  stderrBuffer = "";

  // Write command to shell stdin
  shellProc.stdin.write(cmd + "\n");
  // After the command completes, ask the shell to print its current working directory
  // in a machine-readable marker so the frontend can update the UI.
  shellProc.stdin.write('echo "__CWD__:$PWD"\n');

  // Return a Promise that resolves after timeoutMs with current buffers
  return new Promise((resolve) => {
    setTimeout(() => {
      const out = stdoutBuffer + (stderrBuffer ? ("\n" + stderrBuffer) : "");
      resolve(out);
    }, timeoutMs);
  });
}

app.post("/exec", async (req, res) => {
  const { input } = req.body || {};

  if (typeof input !== "string") {
    return res.status(400).json({ error: "missing input string" });
  }

  try {
    const out = await execCommandAndCollect(input, 180);
    res.json({ output: out });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Shell server running at http://localhost:${PORT}`);
});

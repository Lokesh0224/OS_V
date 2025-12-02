// // frontend/script.js
// const input = document.getElementById("commandInput");
// const output = document.getElementById("output");
// const promptEl = document.getElementById("prompt");

// const SERVER_URL = "http://localhost:3000/exec";

// function appendLine(text, className = "") {
//   const div = document.createElement("div");
//   div.className = "line " + className;
//   div.textContent = text;
//   output.appendChild(div);
//   output.scrollTop = output.scrollHeight;
// }

// function processShellOutput(raw) {
//   if (!raw || raw.trim() === "") return;

//   const lines = raw.split(/\r?\n/);
//   for (let ln of lines) {
//     if (!ln) continue;

//     if (ln.startsWith("__CMD_ECHO__:")) {
//       const rest = ln.replace("__CMD_ECHO__:", "");
//       appendLine(rest, "cyan");

//       const match = rest.match(/^(.*>)/);
//       if (match) {
//         promptEl.textContent = match[1];
//       }
//     } else if (ln.startsWith("__CLEAR__")) {
//       output.innerHTML = "";
//     } else {
//       appendLine(ln);
//     }
//   }
// }

// async function runCommand(cmd) {
//   if (!cmd) return;
//   appendLine(`${promptEl.textContent} ${cmd}`, "green");

//   try {
//     const res = await fetch(SERVER_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ input: cmd })
//     });

//     const json = await res.json();
//     processShellOutput(json.output || "");
//   } catch (err) {
//     appendLine("Backend disconnected or error", "error");
//   }
// }

// input.addEventListener("keydown", (e) => {
//   if (e.key === "Enter") {
//     const cmd = input.value.trim();
//     input.value = "";
//     runCommand(cmd);
//   }

//   if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
//     appendLine("^C", "cyan");
//     input.value = "";
//   }
// });

// // Always keep focus on input
// window.addEventListener("click", () => input.focus());
// window.addEventListener("keydown", () => input.focus());
// input.focus();






// frontend/script.js
const input = document.getElementById("commandInput");
const output = document.getElementById("output");
const promptEl = document.getElementById("prompt");

const SERVER_URL = "http://localhost:3000/exec";

// Keep track of CWD (for UI)
let cwd = "~";

function appendLine(text, className = "") {
  const div = document.createElement("div");
  div.className = "line " + className;
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function updatePrompt(newPath) {
  cwd = newPath;
  promptEl.textContent = `${cwd}>`;
}

function processShellOutput(raw) {
  if (!raw || raw.trim() === "") return;

  const lines = raw.split(/\r?\n/);
  for (let ln of lines) {
    if (!ln) continue;

    if (ln.startsWith("__CMD_ECHO__:")) {
      const rest = ln.replace("__CMD_ECHO__:", "");
      appendLine(rest, "cyan");

      // Extract working directory BEFORE '>'
      const match = rest.match(/^(.*)>/);
      if (match) {
        updatePrompt(match[1]);
      }
    }
    else if (ln.startsWith("__CLEAR__")) {
      output.innerHTML = "";
    }
    else {
      appendLine(ln);
    }
  }
}

async function runCommand(cmd) {
  if (!cmd) return;
  appendLine(`${cwd}> ${cmd}`, "green");

  try {
    const res = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: cmd })
    });

    const json = await res.json();
    processShellOutput(json.output || "");
  } catch {
    appendLine("Connection error!", "error");
  }
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const cmd = input.value.trim();
    input.value = "";
    runCommand(cmd);
  }

  if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
    appendLine("^C", "cyan");
    input.value = "";
  }
});

// Make input always focused
window.addEventListener("click", () => input.focus());
window.addEventListener("keydown", () => input.focus());
input.focus();

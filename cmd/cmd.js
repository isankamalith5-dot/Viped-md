/*
  VIPER MD - Terminal Command Executor
  Runs a shell command on the host and returns stdout/stderr.
  This is OWNER-ONLY — the caller (pair.js) must check isOwner
  before invoking runShellCommand().
*/

const { exec } = require('child_process');

const MAX_OUTPUT_LENGTH = 3500; // keep WhatsApp messages readable
const TIMEOUT_MS = 60000;       // kill runaway commands after 60s

function truncate(text) {
    if (!text) return '';
    if (text.length <= MAX_OUTPUT_LENGTH) return text;
    return text.slice(0, MAX_OUTPUT_LENGTH) + '\n...(output truncated)';
}

/**
 * Runs a shell command and resolves with a formatted result string.
 * @param {string} command - the raw shell command to run
 * @returns {Promise<{ok: boolean, output: string}>}
 */
function runShellCommand(command) {
    return new Promise((resolve) => {
        if (!command || !command.trim()) {
            return resolve({ ok: false, output: '❓ No command provided.' });
        }

        exec(command, { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error && !stdout && !stderr) {
                return resolve({
                    ok: false,
                    output: `❌ Error:\n${truncate(error.message)}`
                });
            }

            let output = '';
            if (stdout && stdout.trim()) output += stdout.trim();
            if (stderr && stderr.trim()) output += (output ? '\n\n' : '') + `⚠️ stderr:\n${stderr.trim()}`;
            if (!output) output = '✅ Command executed with no output.';

            resolve({ ok: !error, output: truncate(output) });
        });
    });
}

module.exports = { runShellCommand };


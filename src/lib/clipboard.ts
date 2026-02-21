import { spawnSync } from 'node:child_process';

function tryClipboardCommand(command: string, args: string[], text: string): boolean {
  try {
    const result = spawnSync(command, args, {
      input: text,
      encoding: 'utf8',
      stdio: ['pipe', 'ignore', 'ignore']
    });

    return result.status === 0;
  } catch {
    return false;
  }
}

export function copyToClipboard(text: string): boolean {
  if (process.platform === 'darwin') {
    return tryClipboardCommand('pbcopy', [], text);
  }

  if (process.platform === 'win32') {
    return tryClipboardCommand('clip', [], text);
  }

  return tryClipboardCommand('wl-copy', [], text) || tryClipboardCommand('xclip', ['-selection', 'clipboard'], text);
}

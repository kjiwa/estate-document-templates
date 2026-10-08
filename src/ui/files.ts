import { signal } from "@preact/signals";

// Set only on a successful save (never on cancel, never persisted across
// reloads) — the Data card's "Last saved" line.
export const lastSavedAt = signal<Date | null>(null);

const REVOKE_DELAY_MS = 1000;

function extensionFor(mimeType: string): string {
  if (mimeType === "application/json") return "json";
  if (mimeType === "text/html") return "html";
  return "txt";
}

function saveViaAnchor(
  suggestedName: string,
  mimeType: string,
  contents: string
): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = suggestedName;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

// Uses the File System Access API's save picker when present; falls back to
// a `Blob` + object-URL anchor click (Firefox, Safari, and headless
// Playwright, none of which implement the picker). Returns `false` on a
// user cancel (`AbortError`) so the "Last saved" indicator is not updated —
// the anchor fallback has no cancel signal of its own, so it always
// resolves `true`.
export async function saveFile(
  suggestedName: string,
  mimeType: string,
  contents: string
): Promise<boolean> {
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: extensionFor(mimeType).toUpperCase(),
            accept: { [mimeType]: [`.${extensionFor(mimeType)}`] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(contents);
      await writable.close();
      lastSavedAt.value = new Date();
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return false;
      throw error;
    }
  }

  saveViaAnchor(suggestedName, mimeType, contents);
  lastSavedAt.value = new Date();
  return true;
}

export interface OpenedFile {
  name: string;
  contents: string;
}

async function readOpened(file: File): Promise<OpenedFile> {
  return { name: file.name, contents: await file.text() };
}

function openViaInput(accept: string): Promise<OpenedFile | null> {
  return new Promise((resolve) => {
    const input = window.document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";
    input.addEventListener("cancel", () => {
      input.remove();
      resolve(null);
    });
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) {
        resolve(null);
        return;
      }
      readOpened(file)
        .then(resolve)
        .catch(() => resolve(null));
    });
    window.document.body.appendChild(input);
    input.click();
  });
}

// Uses the File System Access API's open picker when present; falls back to
// a hidden `<input type="file">` otherwise. Resolves `null` on cancel in
// either branch.
export async function openFile(accept: string): Promise<OpenedFile | null> {
  if (window.showOpenFilePicker) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ accept: { "*/*": [accept] } }],
      });
      if (!handle) return null;
      const file = await handle.getFile();
      return await readOpened(file);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return null;
      throw error;
    }
  }

  return openViaInput(accept);
}

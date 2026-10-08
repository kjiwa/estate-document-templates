import type { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

import {
  accepted,
  acceptDisclaimer,
  closeDisclaimer,
  openDisclaimer,
  reviewing,
} from "../ui/disclaimer";
import { useFocusTrap } from "../ui/useFocusTrap";

const IGNORE_ESCAPE = () => {};

export function AppFooter() {
  return (
    <footer class="app-footer">
      <span>Drafting aid, not legal advice. Provided as is.</span>
      <button type="button" class="link-button" onClick={openDisclaimer}>
        Disclaimer
      </button>
    </footer>
  );
}

// The dialog renders inside the app root, so the root's other children are
// made inert rather than the root itself. Declared before `useFocusTrap` so
// the opener is captured before focus moves into the dialog.
function useInertBackground(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const backdrop = dialogRef.current?.parentElement;
    const background = Array.from(
      backdrop?.parentElement?.children ?? []
    ).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== backdrop
    );
    for (const el of background) el.inert = true;
    return () => {
      for (const el of background) el.inert = false;
      opener?.focus();
    };
  }, [open, dialogRef]);
}

export function Disclaimer() {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstVisit = !accepted.value;
  const open = firstVisit || reviewing.value;

  useInertBackground(open, dialogRef);

  useFocusTrap(
    dialogRef,
    open,
    firstVisit ? IGNORE_ESCAPE : closeDisclaimer,
    firstVisit ? "first" : "review"
  );

  if (!open) return null;

  return (
    <div class="disclaimer-backdrop">
      <div
        class="disclaimer-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
        ref={dialogRef}
      >
        <h2 id="disclaimer-title">Before you use this tool</h2>
        <div class="disclaimer-body">
          <p>
            This site is a drafting aid. It is not legal advice, and using it
            does not create an attorney-client relationship. The author is not
            your lawyer.
          </p>
          <p>
            Documents are drafted under Washington State law only. Laws change,
            and this site may not reflect the current law.
          </p>
          <p>
            The site is provided &quot;as is&quot; without warranty of any kind.
            To the fullest extent permitted by law, the author is not liable for
            any loss arising from its use.
          </p>
          <p>
            You are responsible for having a licensed Washington attorney review
            any document before you sign it.
          </p>
          <p>Your entries stay in this browser. Nothing is sent to a server.</p>
          <p>Your plans are stored only in this browser. Save a backup file.</p>
        </div>
        <div class="disclaimer-actions">
          {firstVisit ? (
            <button
              type="button"
              class="btn btn-primary"
              onClick={acceptDisclaimer}
            >
              I understand and accept
            </button>
          ) : (
            <button type="button" class="btn" onClick={closeDisclaimer}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

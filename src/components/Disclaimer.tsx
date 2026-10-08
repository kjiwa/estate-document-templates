import { useRef } from "preact/hooks";

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

export function Disclaimer() {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstVisit = !accepted.value;
  const open = firstVisit || reviewing.value;

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

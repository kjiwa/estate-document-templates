import type { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

import {
  accepted,
  acceptTerms,
  closeDialog,
  openDialog,
  reviewing,
} from "../ui/terms";
import type { TermsDialog } from "../ui/terms";
import { useFocusTrap } from "../ui/useFocusTrap";

const IGNORE_ESCAPE = () => {};

function FooterLink({ dialog, label }: { dialog: TermsDialog; label: string }) {
  return (
    <button
      type="button"
      class="link-button"
      onClick={(event) => {
        // Safari does not focus a button on click; focus it so the dialog
        // can return focus here on close.
        event.currentTarget.focus();
        openDialog(dialog);
      }}
    >
      {label}
    </button>
  );
}

export function AppFooter() {
  return (
    <footer class="app-footer">
      <span>Drafting aid, not legal advice. Provided as is.</span>
      <FooterLink dialog="terms" label="Terms" />
      <FooterLink dialog="privacy" label="Privacy" />
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

const TERMS_BODY = [
  "This site is a self-help drafting aid. It produces drafts for you or your attorney to review. It is not legal advice, and using it does not create an attorney-client relationship. The author is not your lawyer.",
  "Documents are drafted to the cited Washington statutes and are not reviewed by an attorney. Laws change, and this site may not reflect the current law. Bring each draft to a licensed Washington attorney before you sign it.",
  'You use the site at your own risk. It is provided "as is" without warranty of any kind. To the fullest extent permitted by law, the author is not liable for any loss arising from its use, and you agree to hold the author harmless from any claim arising from your use of the documents you create.',
  "These terms are governed by the laws of the State of Washington.",
  "Your entries stay in this browser and nothing is sent to a server. The site sets no cookies and runs no analytics or third-party scripts.",
];

const PRIVACY_BODY = [
  "Your entries are stored in this browser's localStorage and nowhere else. Nothing is uploaded, and there is no server or account.",
  "The site sets no cookies and runs no analytics, advertising, or third-party scripts.",
  "Save a backup file from the Plans page. Clearing site data, using a private window, or switching browsers deletes your drafts.",
  "The source code is public, so you can check these statements.",
];

export function Terms() {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstVisit = !accepted.value;
  const shown = firstVisit ? "terms" : reviewing.value;
  const open = shown !== null;

  useInertBackground(open, dialogRef);

  useFocusTrap(
    dialogRef,
    open,
    firstVisit ? IGNORE_ESCAPE : closeDialog,
    firstVisit ? "first" : "review"
  );

  if (!open) return null;

  const title = shown === "terms" ? "Terms of use" : "Privacy";
  const paragraphs = shown === "terms" ? TERMS_BODY : PRIVACY_BODY;

  return (
    <div class="terms-backdrop">
      <div
        class="terms-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        ref={dialogRef}
      >
        <h2 id="terms-title">{title}</h2>
        <div class="terms-body">
          {paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
        <div class="terms-actions">
          {firstVisit ? (
            <button type="button" class="btn btn-primary" onClick={acceptTerms}>
              I understand and accept
            </button>
          ) : (
            <button type="button" class="btn" onClick={closeDialog}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

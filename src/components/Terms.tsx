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
import { PRIVACY_BODY, TERMS_BODY } from "../ui/termsCopy";
import { focusMainHeading } from "../ui/focus";
import { Footer } from "./Footer";

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
    <Footer
      terms={<FooterLink dialog="terms" label="Terms" />}
      privacy={<FooterLink dialog="privacy" label="Privacy" />}
    />
  );
}

// On first visit the opener is the body, which cannot hold focus.
function restoreFocus(opener: HTMLElement | null): void {
  if (opener?.isConnected && opener !== document.body) {
    opener.focus();
    return;
  }
  focusMainHeading();
}

// Declared as an effect so the opener is captured before `showModal()` moves
// focus; the dialog is removed from the DOM on close, so focus is restored here.
function useModalDialog(
  open: boolean,
  dialogRef: RefObject<HTMLDialogElement | null>
): void {
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.showModal();
    return () => restoreFocus(opener);
  }, [open, dialogRef]);
}

export function Terms() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstVisit = !accepted.value;
  const shown = firstVisit ? "terms" : reviewing.value;
  const open = shown !== null;

  useModalDialog(open, dialogRef);

  if (!open) return null;

  const title = shown === "terms" ? "Terms of use" : "Privacy";
  const paragraphs = shown === "terms" ? TERMS_BODY : PRIVACY_BODY;

  return (
    <dialog
      class="terms-dialog"
      aria-labelledby="terms-title"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (!firstVisit) closeDialog();
      }}
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
    </dialog>
  );
}

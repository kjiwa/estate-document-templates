import { useEffect, useRef } from "preact/hooks";

import { accepted, acceptTerms } from "../ui/terms";
import { TERMS_BODY } from "../ui/termsCopy";
import { focusMainHeading } from "../ui/focus";

export function Terms() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = !accepted.value;

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.showModal();
    // The dialog is removed from the DOM on accept, so focus is moved here.
    return focusMainHeading;
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      class="terms-dialog"
      aria-labelledby="terms-title"
      ref={dialogRef}
      onCancel={(event) => event.preventDefault()}
    >
      <h2 id="terms-title">Terms of use</h2>
      <div class="terms-body">
        {TERMS_BODY.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
      <div class="terms-actions">
        <button type="button" class="btn btn-primary" onClick={acceptTerms}>
          I understand and accept
        </button>
      </div>
    </dialog>
  );
}

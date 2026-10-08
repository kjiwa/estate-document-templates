import type { ComponentChildren } from "preact";

function SigPair({ left, right }: { left: string; right: string }) {
  return (
    <div class="sig-grid">
      <div class="sig-field">
        <div class="sig-field-line" />
        <div class="sig-field-label">{left}</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line" />
        <div class="sig-field-label">{right}</div>
      </div>
    </div>
  );
}

function SignerRows() {
  return (
    <>
      <SigPair left="Signature" right="Date" />
      <SigPair left="Printed Name" right="Telephone Number" />
    </>
  );
}

function Certification({
  title,
  children,
  reason = false,
  signers = 1,
}: {
  title: string;
  children: ComponentChildren;
  reason?: boolean;
  signers?: number;
}) {
  return (
    <div class="no-break">
      <div class="notary-heading">{title}</div>
      <p class="clause">{children}</p>
      {reason && <Reason />}
      {Array.from({ length: signers }, (_, idx) => (
        <SignerRows key={idx} />
      ))}
    </div>
  );
}

function Reason() {
  return (
    <div class="sig-field">
      <div class="sig-field-line" />
      <div class="sig-field-label">Reason</div>
    </div>
  );
}

export function CertificationPage() {
  return (
    <div class="page-break-before">
      <p class="clause">
        <strong>
          Do not complete this page at the time of signing. This page to be
          completed by the physician at the time of incapacity.
        </strong>
      </p>
      <Certification title="Certification of Incapacity by Agent">
        I certify that the principal lacks the mental capacity to make important
        decisions independently.
      </Certification>
      <Certification
        title="Certification of Incapacity by Regular Attending Physician"
        reason
      >
        I certify that I am a medical doctor and have regularly attended the
        principal and, in my opinion, this principal is now incompetent or
        disabled as defined in Paragraph 2 due to a lack of mental capacity for
        the reason stated below.
      </Certification>
      <Certification
        title="Certification of Incapacity by Qualified Physicians in Absence of Regular Attending Physician"
        reason
        signers={2}
      >
        The undersigned certify that each is a medical doctor and has examined
        the principal and reviewed the principal's medical history and that, in
        the opinion of the undersigned, the principal is now incompetent or
        disabled as defined in Paragraph 2 due to a lack of mental capacity for
        the reason stated below.
      </Certification>
    </div>
  );
}

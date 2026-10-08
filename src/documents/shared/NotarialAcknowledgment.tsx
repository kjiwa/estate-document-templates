import { useContext } from "preact/hooks";
import type { ComponentChildren } from "preact";

import { getPronouns, type Pronouns } from "../../model/pronouns";
import { Blank } from "./Blank";
import { NotarySignature } from "./NotarySignature";
import { NotaryVenue } from "./NotaryVenue";
import { PlanContext, useExecutionPath } from "./PlanContext";
import { Value } from "./Value";

export function NotarialAcknowledgment({
  preamble,
  signerRow = false,
  juratOpener,
  children,
}: {
  preamble: string;
  signerRow?: boolean;
  juratOpener: string;
  children: (pronouns: Pronouns) => ComponentChildren;
}) {
  const at = useExecutionPath();
  const plan = useContext(PlanContext);
  const pronouns = getPronouns(plan?.party.testator.gender);
  const state = plan?.party.testator.state ?? "";
  const county = plan?.party.testator.county ?? "";

  return (
    <div class="notary-block">
      <div class="notary-heading">Notarial Acknowledgment</div>
      <p class="clause">{preamble}</p>
      <NotaryVenue
        statePath="party.testator.state"
        countyPath="party.testator.county"
        state={state}
        county={county}
      />
      <p class="notary-body">
        I certify that I know or have satisfactory evidence that{" "}
        <Blank path="party.testator.name" chars={16} /> is the person who
        appeared before me, and said person acknowledged that{" "}
        <Value value={pronouns.subjective} /> {children(pronouns)}
      </p>
      {signerRow && (
        <div class="affidavit-sig-row">
          <div class="sig-field">
            <div class="sig-field-line" />
            <div class="sig-field-label">
              Declarant Signature —{" "}
              <Blank path="party.testator.name" chars={16} />
            </div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line" />
            <div class="sig-field-label">
              Witness Signature —{" "}
              <Blank path={at("witnesses.0.name")} chars={12} />
            </div>
          </div>
          <div class="sig-field">
            <div class="sig-field-line" />
            <div class="sig-field-label">
              Witness Signature —{" "}
              <Blank path={at("witnesses.1.name")} chars={12} />
            </div>
          </div>
        </div>
      )}
      <div class="notary-jurat">
        {juratOpener} <Blank path={at("executionDate.day")} chars={5} /> day of{" "}
        <Blank path={at("executionDate.month")} chars={14} />,{" "}
        <Blank path={at("executionDate.year")} chars={6} />.
      </div>
      <NotarySignature />
    </div>
  );
}

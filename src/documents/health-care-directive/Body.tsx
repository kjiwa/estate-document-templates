import type { ComponentChildren } from "preact";

import { Blank } from "../shared/Blank";
import { SignatureBlock } from "../shared/SignatureBlock";
import { Testimonium } from "../shared/Testimonium";
import { Value } from "../shared/Value";
import { usePlan } from "../shared/PlanContext";
import { ElectionTable } from "./ElectionTable";
import { WitnessDeclaration } from "./WitnessDeclaration";

// The Health Care Directive under the Natural Death Act, RCW 70.122.030.
// Every value below reads `party.testator`, `execution`, and the new
// `documents.healthCareDirective` namespace — the first schema addition
// since `documents.will`. RCW text quoted below was fetched live from
// app.leg.wa.gov this session; see the child plan's Progress section for
// the full text and its citation.
//
// Unlike the will and the remains directive, this instrument has no
// `Article`/`Clause` numbering: the source is one continuous declaration of
// lettered paragraphs (A)-(G), none of them optional, so the gap-free
// renumbering `Clause` exists for has nothing to do here.
const INSTRUMENT = "Health Care Directive";
const ROLE = "Declarer";

function TitleAndPreamble() {
  return (
    <>
      <h1 id="doc-title" class="doc-title">
        <span class="doc-title-line">Health Care Directive</span>
        <span class="doc-title-line">of</span>
        <span class="doc-title-line">
          <Blank path="party.testator.name" chars={20} />
        </span>
      </h1>
      {"\n"}
      <p class="doc-preamble">
        I, <Blank path="party.testator.name" chars={16} />, a resident of the
        State of <Blank path="party.testator.state" chars={14} />, having the
        capacity to make health care decisions, willfully and voluntarily make
        known my desire that my dying shall not be artificially prolonged under
        the circumstances set forth below, and declare this to be my Health Care
        Directive pursuant to RCW 70.122.030, and do hereby declare that:
      </p>
    </>
  );
}

// Parameterizes only the place-of-death clause within paragraph (A) — the
// diagnosis conditions and the withhold-or-withdraw direction are fixed
// prose the source and the statute both use unconditionally.
function placeOfDeathClause(placeOfDeath: string): string {
  switch (placeOfDeath) {
    case "home":
      return "and that I be permitted to die naturally at home";
    case "hospital":
      return "and that I be permitted to die naturally in the hospital, if that makes executing the funeral arrangements easier for my loved ones";
    default:
      return "and that I be permitted to die naturally";
  }
}

function ParagraphA() {
  const plan = usePlan();
  const placeOfDeath = plan.documents.healthCareDirective.placeOfDeath;

  return (
    <p class="clause">
      <strong>(A)</strong> If, at any time, I should be diagnosed in writing to
      be in a terminal condition by the attending physician, or in a permanent
      unconscious condition, with no reasonable hope of recovery, by two
      physicians, and where the application of life-sustaining treatment would
      serve only to artificially prolong the process of my dying, I direct that
      such treatment be withheld or withdrawn,{" "}
      <Value value={placeOfDeathClause(placeOfDeath)} />. As defined in RCW
      70.122.020, a "terminal condition" means an incurable and irreversible
      condition caused by injury, disease, or illness that, within reasonable
      medical judgment, will cause death within a reasonable period of time in
      accordance with accepted medical standards, and where the application of
      life-sustaining treatment would serve only to prolong the process of
      dying. If I have chosen to donate anatomical parts, nutrition and
      hydration may be administered long enough to accomplish that purpose, then
      discontinued. RCW 70.122.020 further defines a "permanent unconscious
      condition" as an incurable and irreversible condition in which the patient
      is medically assessed, within reasonable medical judgment, as having no
      reasonable probability of recovery from an irreversible coma or a
      persistent vegetative state.
    </p>
  );
}

function ParagraphB() {
  return (
    <p class="clause">
      <strong>(B)</strong> In the absence of my ability to give directions
      regarding the use of life-sustaining treatment, it is my intention that
      this Directive be honored by my family and physician(s) as the final
      expression of my legal right to refuse medical or surgical treatment, and
      I accept the consequences of that refusal. If another person is appointed
      to make health care decisions for me, whether through a durable power of
      attorney or otherwise, I request that person be guided by this Directive
      and any other clear expression of my wishes.
    </p>
  );
}

function ParagraphC() {
  return (
    <>
      <p class="clause">
        <strong>(C)</strong> If I am diagnosed to be in a terminal condition or
        in a permanent unconscious condition, I direct as follows (check one for
        each):
      </p>
      {"\n"}
      <ElectionTable />
      {"\n"}
      <p class="clause">
        However, I request that in all circumstances I always be given care and
        medication to reduce pain and suffering, to give me comfort and preserve
        my dignity, even if it may hasten my death.
      </p>
    </>
  );
}

const STATIC_PARAGRAPHS: { letter: string; body: ComponentChildren }[] = [
  {
    letter: "D",
    body: "I understand the full import of this Directive and I am emotionally and mentally capable of making the health care decisions contained in it.",
  },
  {
    letter: "E",
    body: "I understand that before I sign this Directive, I may add to, delete from, or otherwise change its wording, and that I may amend it at any time, provided any change remains consistent with Washington state law or federal constitutional law to be legally valid.",
  },
  {
    letter: "F",
    body: "It is my wish that every part of this Directive be fully implemented. If, for any reason, any part is held invalid, it is my wish that the remainder of this Directive be implemented.",
  },
  {
    letter: "G",
    body: "I hereby revoke all prior health care directives or living wills.",
  },
];

function StaticParagraphs() {
  return (
    <>
      {STATIC_PARAGRAPHS.map(({ letter, body }) => (
        <>
          <p class="clause" key={letter}>
            <strong>({letter})</strong> {body}
          </p>
          {"\n"}
        </>
      ))}
    </>
  );
}

export function Body() {
  return (
    <>
      <TitleAndPreamble />
      {"\n"}
      <ParagraphA />
      {"\n"}
      <ParagraphB />
      {"\n"}
      <ParagraphC />
      {"\n"}
      <StaticParagraphs />
      <Testimonium instrument={INSTRUMENT} />
      {"\n"}
      <SignatureBlock role={ROLE} />
      {"\n"}
      <WitnessDeclaration />
    </>
  );
}

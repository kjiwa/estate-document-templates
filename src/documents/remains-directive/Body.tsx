import { Fragment } from "preact";

import { Article } from "../shared/Article";
import { Blank } from "../shared/Blank";
import { Clause } from "../shared/Clause";
import { SignatureBlock } from "../shared/SignatureBlock";
import { Testimonium } from "../shared/Testimonium";
import { Value } from "../shared/Value";
import type { Path } from "../../model/paths";
import { usePlan } from "../shared/PlanContext";
import type { Plan } from "../../model/plan";
import { DeclarantAcknowledgment } from "./DeclarantAcknowledgment";
import { DeclarantAttestation } from "./DeclarantAttestation";

// The Disposition of Remains Directive under RCW 68.50.160. Phase 5's proof
// of the Phase 3 seam: every value below reads `party.testator`,
// `fiduciaries.remains`, and `execution` — fields the will already declares
// — so this document adds zero schema. RCW text quoted in comments below
// was fetched live from app.leg.wa.gov this session; see the child plan's
// Progress section for the full text.
const INSTRUMENT = "Disposition of Remains Directive";
const ROLE = "Declarant";

function TitleAndPreamble() {
  return (
    <>
      <h1 id="doc-title" class="doc-title">
        <span class="doc-title-line">Disposition of Remains Directive</span>
        <span class="doc-title-line">of</span>
        <span class="doc-title-line">
          <Blank path="party.testator.name" chars={20} />
        </span>
      </h1>
      {"\n"}
      <p class="doc-preamble">
        I, <Blank path="party.testator.name" chars={16} />, a resident of{" "}
        <Blank path="party.testator.county" chars={12} /> County,{" "}
        <Blank path="party.testator.state" chars={14} />, being of sound mind,
        declare this to be my Disposition of Remains Directive pursuant to RCW
        68.50.160, and I revoke all prior directives, designations, and
        directions regarding the disposition of my remains made by me.
      </p>
    </>
  );
}

function Article1() {
  const plan = usePlan();
  const preference = plan.fiduciaries.remains.preference;

  return (
    <Article number={1} title="Designation of Agent">
      <Clause
        articleNum={1}
        clauses={[
          {
            title: "Designation of Agent",
            body: (
              <>
                Pursuant to RCW 68.50.160(3)(b), I appoint{" "}
                <Blank path="fiduciaries.remains.agent" chars={16} /> as my
                agent to direct the disposition of my remains, including
                decisions concerning burial, cremation, and funeral
                arrangements. My agent's direction is sufficient to direct the
                type, place, and method of disposition of my remains. If{" "}
                <Blank path="fiduciaries.remains.agent" chars={16} /> is unable
                or unwilling to act, I appoint{" "}
                <Blank path="fiduciaries.remains.alternate" chars={16} /> as my
                alternate agent.
              </>
            ),
          },
          preference
            ? {
                title: "Wishes",
                body: (
                  <>
                    Without imposing any binding obligation on my agent, my
                    wishes regarding the place or method of disposition of my
                    remains are: <Value value={preference} />.
                  </>
                ),
              }
            : null,
        ]}
      />
    </Article>
  );
}

function EffectArticle({ number }: { number: number }) {
  return (
    <Article number={number} title="Effect, Priority, and Revocation">
      <Clause
        articleNum={number}
        clauses={[
          {
            title: "Priority of Designation",
            body: (
              <>
                This designation of agent, made through a written document
                signed and dated by me in the presence of a witness pursuant to
                RCW 68.50.160(3)(b), takes priority over the surviving spouse or
                state registered domestic partner, surviving adult children,
                surviving parents, surviving siblings, and court-appointed
                guardian named in RCW 68.50.160(3)(c) through (g).
              </>
            ),
          },
          {
            title: "Revocation",
            body: (
              <>
                I revoke all prior designations of an agent to control the
                disposition of my remains made by me. This Directive remains
                effective until I revoke it in a signed writing.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

function GoverningLawArticle({ number }: { number: number }) {
  return (
    <Article number={number} title="Severability and Governing Law">
      <Clause
        articleNum={number}
        clauses={[
          {
            title: "Severability",
            body: (
              <>
                If any provision of this Directive is held invalid or
                unenforceable, such invalidity shall not affect the remaining
                provisions, which shall continue in full force and effect.
              </>
            ),
          },
          {
            title: "Governing Law",
            body: (
              <>
                This Directive shall be construed and governed in accordance
                with the laws of the State of Washington.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

type RemainsDirective = Plan["documents"]["remainsDirective"];
type RemainsContact = RemainsDirective["arranger"];

const CONTACT_FIELDS = ["name", "address", "telephone"] as const;

function isContactSet(contact: RemainsContact): boolean {
  return CONTACT_FIELDS.some((key) => contact[key].trim() !== "");
}

function ContactLine({
  base,
  contact,
}: {
  base: string;
  contact: RemainsContact;
}) {
  const present = CONTACT_FIELDS.filter((key) => contact[key].trim() !== "");
  const value = (key: (typeof CONTACT_FIELDS)[number]) => (
    <Value path={`${base}.${key}` as Path<Plan>} />
  );
  const details = present.filter((key) => key !== "name");
  const detailText = details.map((key, idx) => (
    <Fragment key={key}>
      {idx > 0 ? ", " : null}
      {value(key)}
    </Fragment>
  ));
  if (!present.includes("name")) return <>{detailText}</>;
  return (
    <>
      {value("name")}
      {details.length > 0 ? <> ({detailText})</> : null}
    </>
  );
}

function priorArrangementsClause(instructions: RemainsDirective) {
  if (instructions.arrangementsMade === "no") {
    return {
      title: "Prior Arrangements",
      body: <>I have not made funeral or disposition prearrangements.</>,
    };
  }
  if (instructions.arrangementsMade === "yes") {
    return {
      title: "Prior Arrangements",
      body: (
        <>
          I have made prearrangements with{" "}
          <Value path="documents.remainsDirective.arrangementsWith" />. Under
          RCW 68.50.160(2), these prearrangements are not subject to
          cancellation or substantial revision by my survivors.
        </>
      ),
    };
  }
  return null;
}

function methodClause(instructions: RemainsDirective) {
  if (instructions.method === "burial") {
    return {
      title: "Method of Disposition",
      body: (
        <>Pursuant to RCW 68.50.160(1), I direct that my remains be buried.</>
      ),
    };
  }
  if (instructions.method === "cremation") {
    return {
      title: "Method of Disposition",
      body: (
        <>Pursuant to RCW 68.50.160(1), I direct that my remains be cremated.</>
      ),
    };
  }
  return null;
}

const CREMAINS_TEXT: Record<string, string> = {
  columbarium: "placed in a columbarium at",
  scattered: "scattered at",
  interred: "interred at",
  heldBy: "held by",
};

function cremainsClause(instructions: RemainsDirective) {
  const disposition = instructions.cremainsDisposition;
  if (
    instructions.method !== "cremation" ||
    !Object.hasOwn(CREMAINS_TEXT, disposition)
  ) {
    return null;
  }
  const text = CREMAINS_TEXT[disposition];
  return {
    title: "Cremated Remains",
    body: (
      <>
        I direct that my cremated remains be {text}{" "}
        <Value path="documents.remainsDirective.cremainsDetail" />.
      </>
    ),
  };
}

function arrangerClause(instructions: RemainsDirective) {
  if (!isContactSet(instructions.arranger)) return null;
  return {
    title: "Arrangements",
    body: (
      <>
        I direct that arrangements for my funeral and disposition be made
        through{" "}
        <ContactLine
          base="documents.remainsDirective.arranger"
          contact={instructions.arranger}
        />
        .
      </>
    ),
  };
}

function notifyClause(instructions: RemainsDirective) {
  const rows = instructions.notify
    .map((contact, index) => ({ contact, index }))
    .filter(({ contact }) => isContactSet(contact));
  if (rows.length === 0) return null;
  return {
    title: "Persons to Notify",
    body: (
      <>
        Upon my death, I direct that the following persons be notified:{" "}
        {rows.map(({ contact, index }, idx) => (
          <Fragment key={index}>
            {idx > 0 ? "; " : null}
            <ContactLine
              base={`documents.remainsDirective.notify.${index}`}
              contact={contact}
            />
          </Fragment>
        ))}
        .
      </>
    ),
  };
}

function optionalClauses(instructions: RemainsDirective) {
  return [
    priorArrangementsClause(instructions),
    methodClause(instructions),
    cremainsClause(instructions),
    arrangerClause(instructions),
    notifyClause(instructions),
  ];
}

function InstructionsArticle({
  number,
  clauses,
}: {
  number: number;
  clauses: ReturnType<typeof optionalClauses>;
}) {
  return (
    <Article number={number} title="Funeral and Disposition Instructions">
      <Clause
        articleNum={number}
        clauses={[
          ...clauses,
          {
            title: "Direction",
            body: (
              <>
                My agent, my family, and all other persons responsible for my
                remains shall take all steps necessary to carry out these
                instructions.
              </>
            ),
          },
        ]}
      />
    </Article>
  );
}

// Ports the will's `Body` structure: preamble, articles, testimonium +
// principal signature, witness attestation, notarial acknowledgment.
export function Body() {
  const plan = usePlan();
  const clauses = optionalClauses(plan.documents.remainsDirective);
  const withInstructions = clauses.some(Boolean);
  return (
    <>
      <TitleAndPreamble />
      {"\n"}
      <Article1 />
      {"\n"}
      {withInstructions ? (
        <>
          <InstructionsArticle number={2} clauses={clauses} />
          {"\n"}
        </>
      ) : null}
      <EffectArticle number={withInstructions ? 3 : 2} />
      {"\n"}
      <GoverningLawArticle number={withInstructions ? 4 : 3} />
      {"\n"}
      <Testimonium instrument={INSTRUMENT} />
      {"\n"}
      <SignatureBlock role={ROLE} />
      {"\n"}
      <DeclarantAttestation />
      {"\n"}
      <DeclarantAcknowledgment />
    </>
  );
}

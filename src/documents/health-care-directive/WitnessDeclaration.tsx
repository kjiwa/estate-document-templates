import { Blank } from "../shared/Blank";
import { usePlan } from "../shared/PlanContext";
import { WitnessSigColumn } from "../shared/WitnessSigColumn";

// Not `../shared/WitnessAttestation` — that component's recitals qualify
// witnesses to a Will under RCW 11.12.020. RCW 70.122.030(1) disqualifies a
// different set (the attending physician, an employee of the attending
// physician or health facility, and anyone with a claim against the
// declarer's estate) and requires a penalty-of-perjury declaration rather
// than the will's "published and declared" attestation.
export function WitnessDeclaration() {
  const plan = usePlan();
  const declarer = plan.party.testator.name;

  return (
    <div class="witness-block">
      <h2 class="doc-subtitle">Witness Declaration</h2>
      <p class="witness-declaration">
        Each of the undersigned declares under penalty of perjury under the laws
        of the State of Washington, on the date indicated above, that the
        following is true and correct: the Declarer,{" "}
        <Blank value={declarer} chars={16} />, has been personally known to me,
        and I believe the Declarer to be capable of making health care
        decisions; and I am not (a) related to the Declarer by blood, marriage,
        or adoption; (b) entitled to any portion of the Declarer's estate upon
        the Declarer's death under any will or codicil of the Declarer or by
        operation of law; (c) the Declarer's attending physician; (d) an
        employee of the attending physician or of the health facility in which
        the Declarer is a patient; or (e) a person who has a claim against any
        portion of the Declarer's estate upon the Declarer's death.
      </p>
      <div class="sig-grid">
        <WitnessSigColumn index={0} />
        <WitnessSigColumn index={1} />
      </div>
    </div>
  );
}

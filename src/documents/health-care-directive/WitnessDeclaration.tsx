import { Blank } from "../shared/Blank";
import { usePlan } from "../shared/PlanContext";
import { WitnessBlock } from "../shared/WitnessBlock";

// RCW 70.122.030(1) disqualifies the attending physician, their employees,
// and anyone with a claim against the declarer's estate, and requires a
// penalty-of-perjury declaration.
export function WitnessDeclaration() {
  const plan = usePlan();
  const declarer = plan.party.testator.name;

  return (
    <WitnessBlock title="Witness Declaration">
      Each of the undersigned declares under penalty of perjury under the laws
      of the State of Washington, on the date indicated above, that the
      following is true and correct: the Declarer,{" "}
      <Blank value={declarer} chars={16} />, has been personally known to me,
      and I believe the Declarer to be capable of making health care decisions;
      and I am not (a) related to the Declarer by blood, marriage, or adoption;
      (b) entitled to any portion of the Declarer's estate upon the Declarer's
      death under any will or codicil of the Declarer or by operation of law;
      (c) the Declarer's attending physician; (d) an employee of the attending
      physician or of the health facility in which the Declarer is a patient; or
      (e) a person who has a claim against any portion of the Declarer's estate
      upon the Declarer's death.
    </WitnessBlock>
  );
}

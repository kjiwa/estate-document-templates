import { Blank } from "./Blank";
import { useExecutionPath } from "./PlanContext";

export function NotarySignature() {
  const at = useExecutionPath();
  return (
    <div class="notary-sig-row">
      <div class="sig-column">
        <div class="sig-field">
          <div class="sig-field-line" />
          <div class="sig-field-label">Signature of Notary Public</div>
        </div>
        <div class="sig-field">
          <div class="sig-field-line">
            <Blank path={at("notary.name")} chars={20} />
          </div>
          <div class="sig-field-label">Printed Name</div>
        </div>
        <div class="sig-field">
          <div class="sig-field-line" />
          <div class="sig-field-label">Title</div>
        </div>
        <div class="sig-field">
          <div class="sig-field-line">
            <Blank path={at("notary.commissionExpires")} chars={20} />
          </div>
          <div class="sig-field-label">Commission Expires</div>
        </div>
      </div>
      <div class="notary-seal-box">Notary Seal Box</div>
    </div>
  );
}

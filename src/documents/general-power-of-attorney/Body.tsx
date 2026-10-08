import { Blank } from "../shared/Blank";
import { SignatureBlock } from "../shared/SignatureBlock";
import { Testimonium } from "../shared/Testimonium";
import { PrincipalAcknowledgment } from "./PrincipalAcknowledgment";

// A non-durable general power of attorney: Washington makes a power of
// attorney durable only if it says so, and this one deliberately does not.
// Like the health care directive it has no `Article`/`Clause` numbering.
const INSTRUMENT = "General Power of Attorney";
const ROLE = "Principal";

function Agent() {
  return <Blank path="fiduciaries.attorneysInFact.primary" chars={20} />;
}

function Title() {
  return (
    <h1 id="doc-title" class="doc-title">
      <span class="doc-title-line">General Power of Attorney</span>
      <span class="doc-title-line">of</span>
      <span class="doc-title-line">
        <Blank path="party.testator.name" chars={20} />
      </span>
    </h1>
  );
}

function Appointment() {
  return (
    <p class="doc-preamble">
      <strong>KNOW ALL PERSONS BY THESE PRESENTS</strong>, that I,{" "}
      <Blank path="party.testator.name" chars={16} />, a resident of the State
      of <Blank path="party.testator.state" chars={14} />, have made,
      constituted, and appointed, and by these presents do make, constitute, and
      appoint <Agent />, as my attorney-in-fact, to act for me and in my name,
      place, and stead and for my use and benefit. I revoke all previous general
      powers of attorney executed by me.
    </p>
  );
}

function PropertyAndCollections() {
  return (
    <p class="clause">
      This power of attorney is for the purpose of my attorney-in-fact having
      the power to execute any and all documents involving property transactions
      or closings; the power to ask, demand, sue for, recover, collect, and
      receive all sums of money, debts, dues, accounts, legacies, bequests,
      interest, dividends, annuities, and demands whatsoever that are now or
      shall hereafter become due, owing, payable, or belonging to me, and to
      have, use, and take all lawful ways and means in my name, or otherwise,
      for the recovery thereof, by attachments, arrest, distress, or otherwise,
      and to compromise and agree for the same, and to make, sign, seal, and
      deliver acquittances or other sufficient discharges for the same; for me
      and in my name, to bargain, contract, agree for, purchase, receive, and
      take lands, tenements, and hereditaments, and accept the seisin and
      possession of all lands and all deeds and other assurances in the law
      therefor; and to lease, let, demise, bargain, sell, release, convey,
      mortgage, and hypothecate lands, tenements, and hereditaments, upon such
      terms and conditions and under such covenants as my attorney-in-fact deems
      fit; to assign and transfer any note or mortgage; and to dedicate any
      street, avenue, alley, place, way, or park for public uses, provided that
      any such action relates to the transactions described above.
    </p>
  );
}

function GoodsAndBusiness() {
  return (
    <p class="clause">
      My attorney-in-fact shall also have the power to bargain, contract, and
      agree for, buy, mortgage, hypothecate, and in any and every way and manner
      deal in and with goods, wares, and merchandise, choses in action, and
      other real and personal property; to release mortgages on lands or
      chattels; and to make, do, and transact all and every kind of business of
      whatever nature and kind.
    </p>
  );
}

function Instruments() {
  return (
    <p class="clause">
      My attorney-in-fact shall also have the power, for me and in my name and
      as my act and deed, to sign, seal, execute, deliver, and acknowledge such
      deeds, leases, assignments of leases, covenants, indentures, agreements,
      mortgages, hypothecations, charter parties, bills of lading, bills, bonds,
      notes, receipts, evidences of debt, releases and satisfactions of
      mortgages, judgments, and other debts, and such other instruments in
      writing, of whatever kind or nature, as may be necessary or proper in the
      premises.
    </p>
  );
}

function PublicBenefitGifts() {
  return (
    <p class="clause">
      My attorney-in-fact shall have the power to make any gifts, whether
      outright or in trust, during my lifetime that are made for the purpose of
      qualifying me or my spouse for governmental, medical, or financial
      assistance or long-term care coverage, or maintaining eligibility for such
      assistance or coverage, or preventing estate recovery due to such
      assistance or coverage. Any such gifting may exceed the annual gift tax
      exclusion amount if necessary to that purpose. The authority granted here
      includes, but is not limited to, converting my assets into assets that do
      not disqualify me from receiving such benefits, or divesting myself of
      such assets. Gifting shall follow the distribution set forth in my most
      recent will or trust to the extent practicable. Any transfer made under
      this paragraph shall be deemed not to be a breach of fiduciary duty by my
      attorney-in-fact.
    </p>
  );
}

function DigitalAssets() {
  return (
    <p class="clause">
      My attorney-in-fact shall have the power to access, handle, distribute,
      and dispose of my digital assets and content in all manner as allowed
      under chapter 11.120 RCW, including electronic communications. "Digital
      assets" include files and content stored on my digital devices, including,
      but not limited to, desktops, laptops, tablets, peripherals, storage
      devices, mobile telephones, smartphones, and any similar digital device
      that currently exists or may exist as technology develops, or such
      comparable items as technology develops. The term "digital assets" also
      includes, but is not limited to, emails received, email accounts, digital
      music, digital photographs, digital videos, software licenses, social
      network accounts, file sharing accounts, financial accounts, domain
      registrations, DNS service accounts, web hosting accounts, tax preparation
      service accounts, online stores, affiliate programs, other online
      accounts, and similar digital items and content that currently exist or
      may exist as technology develops, or such comparable items as technology
      develops, regardless of the ownership of the physical device on which the
      digital item is stored.
    </p>
  );
}

function GivingAndGranting() {
  return (
    <p class="clause">
      <strong>GIVING AND GRANTING</strong> unto my attorney-in-fact full power
      and authority to do and perform all and every act and thing whatsoever
      requisite and necessary to be done in and about the premises, as fully to
      all intents and purposes as I might or could do if personally present, and
      hereby ratifying and confirming all that my attorney-in-fact shall
      lawfully do or cause to be done by virtue of these presents.
    </p>
  );
}

function Termination() {
  return (
    <>
      <p class="clause">
        <strong>TERMINATION.</strong> This power of attorney may be revoked by
        me at any time and shall automatically be revoked upon my death,
        provided that any person relying on this power of attorney before or
        after my death shall have full right to accept the authority of my
        attorney-in-fact until in receipt of actual notice of revocation.
      </p>
      {"\n"}
      <p class="clause">
        <strong>NOMINATION OF GUARDIAN.</strong> In the event of guardianship
        proceedings concerning me, I nominate my attorney-in-fact, <Agent />, as
        my guardian.
      </p>
      {"\n"}
      <p class="clause">
        All other provisions of termination shall abide by RCW 11.125.100, which
        provides:
      </p>
    </>
  );
}

const RCW_11_125_100: readonly string[] = [
  "(1) A power of attorney terminates when: (a) The principal dies; (b) The principal becomes incapacitated, if the power of attorney is not durable; (c) The principal revokes the power of attorney; (d) The power of attorney provides that it terminates; (e) The purpose of the power of attorney is accomplished; or (f) The principal revokes the agent's authority or the agent dies, becomes incapacitated, or resigns, and the power of attorney does not provide for another agent to act under the power of attorney.",
  "(2) An agent's authority terminates when: (a) The principal revokes the authority; (b) The agent dies, becomes incapacitated, or resigns; (c) An action is filed for the dissolution or annulment of the agent's marriage to the principal or for their legal separation, or an action is filed for dissolution or annulment of the agent's state registered domestic partnership with the principal or for their legal separation, unless the power of attorney otherwise provides; or (d) The power of attorney terminates.",
  "(3) An agent's authority which has been terminated under subsection (2)(c) of this section shall be reinstated effective immediately in the event that such action is dismissed with the consent of both parties or the petition for dissolution, annulment, or legal separation is withdrawn.",
  "(4) Unless the power of attorney otherwise provides, an agent's authority is exercisable until the authority terminates under subsection (2) of this section, notwithstanding a lapse of time since the execution of the power of attorney.",
  "(5) Termination of an agent's authority or of a power of attorney is not effective as to the agent or another person that, without actual knowledge of the termination, acts in good faith under the power of attorney. An act so performed, unless otherwise invalid or unenforceable, binds the principal and the principal's successors in interest.",
  "(6) Incapacity of the principal of a power of attorney that is not durable does not revoke or terminate the power of attorney as to an agent or other person that, without actual knowledge of the incapacity, acts in good faith under the power of attorney. An act so performed, unless otherwise invalid or unenforceable, binds the principal and the principal's successors in interest.",
  "(7) The execution of a power of attorney does not revoke a power of attorney previously executed by the principal unless the subsequent power of attorney provides that the previous power of attorney is revoked or that all other powers of attorney are revoked.",
];

function StatuteRecital() {
  return (
    <>
      {RCW_11_125_100.map((subsection) => (
        <>
          <p class="clause" key={subsection}>
            {subsection}
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
      <Title />
      {"\n"}
      <Appointment />
      {"\n"}
      <PropertyAndCollections />
      {"\n"}
      <GoodsAndBusiness />
      {"\n"}
      <Instruments />
      {"\n"}
      <PublicBenefitGifts />
      {"\n"}
      <DigitalAssets />
      {"\n"}
      <GivingAndGranting />
      {"\n"}
      <Termination />
      {"\n"}
      <StatuteRecital />
      <Testimonium instrument={INSTRUMENT} />
      {"\n"}
      <SignatureBlock role={ROLE} />
      {"\n"}
      <PrincipalAcknowledgment />
    </>
  );
}

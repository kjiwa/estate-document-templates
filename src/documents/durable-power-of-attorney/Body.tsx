import { Fragment } from "preact";
import type { ComponentChildren } from "preact";
import { useContext } from "preact/hooks";

import { Blank } from "../shared/Blank";
import { PlanContext } from "../shared/PlanContext";
import { PrincipalAcknowledgment } from "../shared/PrincipalAcknowledgment";
import { SignatureBlock } from "../shared/SignatureBlock";
import { Testimonium } from "../shared/Testimonium";
import { CertificationPage } from "./CertificationPage";

const INSTRUMENT = "Durable Power of Attorney";
const ROLE = "Principal";

interface Paragraph {
  title: string;
  body: ComponentChildren;
}

type ParagraphEntry = Paragraph | false;

function Primary() {
  return <Blank path="fiduciaries.attorneysInFact.primary" chars={20} />;
}

function Alternate() {
  return <Blank path="fiduciaries.attorneysInFact.alternate" chars={20} />;
}

function Title() {
  return (
    <h1 id="doc-title" class="doc-title">
      <span class="doc-title-line">Durable Power of Attorney</span>
      <span class="doc-title-line">of</span>
      <span class="doc-title-line">
        <Blank path="party.testator.name" chars={20} />
      </span>
    </h1>
  );
}

function Preamble() {
  return (
    <p class="doc-preamble">
      I, <Blank path="party.testator.name" chars={16} />, a resident of the
      State of <Blank path="party.testator.state" chars={14} />, as principal,
      designate the person named in Paragraph 1 as my attorney-in-fact or agent,
      to act for me as principal according to this document. I revoke any prior
      durable powers of attorney executed by me.
    </p>
  );
}

function Paragraphs({ entries }: { entries: ParagraphEntry[] }) {
  const survivors = entries.filter((entry): entry is Paragraph =>
    Boolean(entry)
  );
  return (
    <>
      {survivors.map((paragraph, idx) => (
        <Fragment key={idx}>
          <div class="clause">
            <strong>
              {idx + 1}. {paragraph.title}.
            </strong>{" "}
            {paragraph.body}
          </div>
          {"\n"}
        </Fragment>
      ))}
    </>
  );
}

const EXCLUDED_PROCEDURES: readonly string[] = [
  "therapy or other procedure to induce convulsion",
  "surgery solely for the purpose of psychosurgery",
  "other psychiatric or mental health procedures that restrict physical freedom of movement or the rights in RCW 71.05.217",
];

function HealthCarePower() {
  return (
    <li>
      (C.) To make health care decisions for me, which authority shall include,
      but shall not be limited to: (1) selecting a hospital, nursing home, and
      other health care providers; (2) deciding methods of treatment and
      employing and discharging physicians and other health care personnel; (3)
      consenting, refusing consent, or withdrawing or withholding consent for
      diagnostic or medical treatment for a physical or mental condition,
      including withholding life sustaining procedures, CPR, hydration, and/or
      nutrition; and (4) receiving and consenting to the release of medical
      information. I understand that, under RCW 11.125.400 and RCW
      11.130.335(3), my attorney-in-fact cannot consent to the following
      procedures:{" "}
      {EXCLUDED_PROCEDURES.map((procedure, idx) => (
        <Fragment key={procedure}>
          ({idx + 1}) {procedure}
          {idx < EXCLUDED_PROCEDURES.length - 1 ? "; " : "."}
        </Fragment>
      ))}
    </li>
  );
}

function GiftingPower() {
  return (
    <li>
      (G.) To deal on my behalf for all social security or government checks;
      and to make gifts of my property under the annual state and/or federal
      gift tax exclusion; and to make any gifts, whether outright or in trust,
      during my lifetime which are made for purposes of qualifying me or my
      spouse for governmental, medical or financial assistance or long-term care
      coverage, or maintaining eligibility for such assistance or coverage, or
      preventing estate recovery due to such assistance or coverage. Any such
      gifting may exceed the annual gift tax exclusion amount, if necessary, to
      the above stated purpose. The authority herein granted shall include, but
      not be limited to, converting my assets into assets that do not disqualify
      me from receiving such benefits or divesting myself of such assets.
      Gifting shall follow the distribution set forth in my most recent will or
      trust to the extent practicable. Any transfers made pursuant to this
      paragraph shall be deemed not to be a breach of fiduciary duty by the
      attorney-in-fact, and the trustee may make distributions of property in
      trust under the same conditions that I could cause the trustee to make
      such distributions and shall include the power to change the beneficiary
      designations on non-probate assets;
    </li>
  );
}

function ThirdPartyRefusal() {
  return (
    <>
      Further, if any third party (including stock transfer agents, title
      insurance companies, banks, credit unions, and savings and loan
      associations) with whom the attorney-in-fact seeks to transact refuses to
      recognize the attorney-in-fact's authority to act on my behalf pursuant to
      this power of attorney, I authorize the attorney-in-fact to sue and
      recover from such third party all resulting damages, costs, expenses, and
      attorneys' fees that are incurred because of such failure to act. The
      costs, expenses, and attorneys' fees incurred may be paid from my funds or
      other assets to the extent they are not recovered from said third party. I
      expressly direct the attorney-in-fact to move my accounts and assets from
      any brokerage, transfer agent, or other entity that refuses to recognize
      the full extent of powers that I intend to convey by this power of
      attorney;
    </>
  );
}

function FinancialPowers() {
  return (
    <ol class="powers-list">
      <li>
        1. Pay, settle or otherwise discharge any and all claims of liability or
        indebtedness against me, and, in so doing, (a) use any of my funds or
        other assets or use funds or other assets of the attorney-in-fact and
        obtain reimbursement out of my funds or other assets and (b) compromise
        any such claim and make, sign, seal and deliver acquittances, releases,
        or other sufficient discharges in respect of the same;
      </li>
      <li>
        2. Ask, demand, sue for, recover, collect and receive all sums of money,
        debts, dues, accounts, legacies, bequests, devises, dividends,
        annuities, demands, interests in real and personal property, and rights
        to the possession or use of such property, and, in so doing: (a) have,
        use and take all lawful ways and means in my name or otherwise for the
        recovery thereof by attachment, execution, eviction, foreclosure or
        otherwise; and (b) compromise and agree for, and make, sign, and
        deliver, releases or other sufficient discharges in respect of the same.
        The attorney-in-fact is specifically authorized to follow the procedures
        set forth in Washington law to petition the court for the purposes set
        forth therein. <ThirdPartyRefusal />
      </li>
      <li>
        3. Bargain, contract, agree for, purchase, receive and take lands and
        any interest therein, and accept the possession of all lands and all
        deeds and other assurances in the law therefor;
      </li>
      <li>
        4. Lease, sell, release, convey, exchange, mortgage, and release any
        mortgage on lands, and any interest therein;
      </li>
      <li>
        5. Bargain and agree for, buy, sell, pledge, assign, endorse, release,
        exchange, mortgage, release any mortgage on, and in any and every way
        and manner deal in and with goods, bonds, shares of stock, real
        property, financial instruments, accounts with financial institutions or
        securities intermediaries, insurance, annuities, and other property,
        including property transferred to the trustee of a revocable trust
        created by me, causes of action, judgments and other property in
        possession or in action;
      </li>
      <li>
        6. Purchase United States Treasury Bonds, which may be redeemed at par
        in payment of federal estate tax;
      </li>
      <li>
        7. Exercise any and every right and power which I may now or hereafter
        have in respect to any and all bank, savings, checking or agency
        accounts or accounts with loan associations, credit unions, mutual fund
        companies and securities dealers, including past accounts, and to deal
        with any and all safe deposit boxes and envelopes of other safe keeping
        accounts including, without limitation, the power and authority to open
        and close bank accounts and investment accounts for me in my name, this
        shall include money market accounts, retirement accounts, and
        certificates of deposit, and to give instructions in respect to making
        deposits in, transferring funds, and making withdrawals from any and all
        such accounts whether or not the same have been opened by the
        attorney-in-fact;
      </li>
      <li>
        8. Transfer assets of all kinds to the trustee of any trust, including
        revocable trusts, established by me alone or by me and my spouse, if I
        have one;
      </li>
      <li>
        9. Make, do and transact all and every kind of business of every kind
        and description;
      </li>
      <li>
        10. Sign, seal, execute, deliver and acknowledge all written instruments
        and do and perform each and every act and thing whatsoever which may be
        necessary or proper to be done in or about the exercise of the powers
        and authority hereinabove granted to the attorney-in-fact as fully to
        all intents and purposes as I might or could do if personally present;
        and
      </li>
      <li>
        11. Have complete and unfettered authority to access any digital or
        internet accounts and devices on my behalf. This includes without
        limitation financial institution accounts, credit card accounts, debit
        card accounts, internet stores, email accounts, social-network accounts,
        domain names, computers (including smart phones, tablet computers,
        e-readers, and all other devices), web pages, and blogs belonging to me.
        This shall include any past records, statements, and documents. The
        attorney-in-fact may, in the attorney-in-fact's discretion, change or
        modify access permissions, usernames, passwords and security settings as
        well as create, merge, terminate and liquidate accounts and services,
        and take any other action with respect to such accounts and devices.
      </li>
    </ol>
  );
}

function Powers() {
  return (
    <>
      My attorney-in-fact shall have full power and authority to do and perform
      all and every act whatsoever required and necessary to be done as fully as
      I might or could do if personally present, fully competent and without
      incapacity, disability, or incompetence including authority with respect
      to estates, trusts and other beneficial interests. My attorney-in-fact
      shall have all powers of an absolute owner of my assets and liabilities,
      whether located within or outside the State of Washington, including
      specifically but not limited to the following:
      <ol class="powers-list">
        <li>
          (A.) To provide for my support, maintenance, health, emergencies, and
          necessities without the necessity of the qualification or appointment
          of a general guardian;
        </li>
        <li>
          (B.) To sell, deed, lease, assign, mortgage, convey, and in any and
          every manner deal with any real or personal property in which I may
          now hold or hereafter acquire any legal or equitable interest;
        </li>
        <HealthCarePower />
        <li>
          (D.) To make health care decisions based upon what the
          attorney-in-fact feels is in my best interests;
        </li>
        <li>
          (E.) To provide for my recreation and travel, and for my spiritual or
          religious needs and companionship, including the care of any pets I
          own and to spend my funds to provide for them;
        </li>
        <li>
          (F.) To make advance funeral arrangements, and to provide for
          anatomical gifts; and
        </li>
        <GiftingPower />
        <li>
          (H.) To:
          <FinancialPowers />
        </li>
        <li>
          (I.) To disclaim any interest, as defined in Washington law, in any
          property to which I would otherwise succeed, and to decline to act or
          resign if appointed to serve as an officer, director, executor,
          trustee, or other fiduciary;
        </li>
        <li>
          (J.) To have authority to the full extent permitted by law, to gift or
          transfer property for the purpose of qualifying me for governmental
          medical assistance, including Medicare and Medicaid financing of
          long-term nursing home or in-home care, medical assistance or the
          limited casualty program for the medically needy, should there be a
          need for such medical care; including, if applicable, a transfer of
          property or resources as a gift to my spouse, if I have one, children
          or lineal descendants; and authority to revoke any community property
          agreement signed by me or to create, amend, revoke or terminate an
          inter-vivos trust; this shall include unlimited gifting exceeding the
          annual gift tax exclusion; and
        </li>
        <li>
          (K.) To contribute on my behalf some or all my property to a trust
          created by me during my lifetime for my benefit.
        </li>
      </ol>
    </>
  );
}

function Appointment() {
  return (
    <>
      I designate and appoint <Primary /> my attorney-in-fact, agent, and
      fiduciary. If, for any reason, this person is unable or unwilling to
      serve, I appoint <Alternate /> as my attorney-in-fact, agent, and
      fiduciary.
    </>
  );
}

const EFFECTIVENESS =
  "The powers granted to my attorney-in-fact shall become effective for all purposes upon my incapacity, disability, or incompetence. Incapacity, disability, or incompetence shall include the inability to properly care for myself and to manage my property and affairs effectively for reasons such as, but not limited to, mental illness, mental deficiency, physical illness or disability, advanced age, chronic use of drugs, or chronic intoxication, and shall also include my disappearance, confinement, or detention by a foreign power or federally recognized criminal and/or terrorist organization for more than thirty (30) days. As RCW 11.125.090 permits, my incapacity, disability, or incompetence may be conclusively evidenced by a written affidavit under oath of any qualified physician regularly attending me, or a licensed psychologist unrelated to me, or a judge or appropriate governmental official, that I am incapacitated within the meaning of RCW 11.125.020(5). Disappearance, confinement, or detention by a foreign power or federally recognized criminal and/or terrorist organization for more than thirty (30) days shall be evidenced by written affidavits of two or more persons with personal knowledge of my disappearance, confinement, or detention. My incapacity may be established by a finding of the court having jurisdiction over me; however, it shall not be necessary for a court to determine my incapacity for this power of attorney to be effective, provided that my regular attending physician or, if not available, two qualified physicians, have determined me to be incompetent. Any limitation on the effectiveness of this power of attorney due to the removal of my incapacity, disability, or incompetence, or my regaining of competence, shall not, by itself, limit the effectiveness of this power of attorney upon any subsequent incapacity, disability, or incompetence.";

const TAXES =
  "In addition to the powers outlined above, my attorney-in-fact shall have authority to represent me in all tax matters; to prepare, sign, and file federal, state, and local income, gift, and other tax returns of all kinds, including, where appropriate, joint returns, FICA returns, payroll tax returns, claims for refunds, requests for extensions of time to file returns and/or pay taxes, extensions and waivers of applicable periods of limitation, protests and petitions to administrative agencies or courts, including the tax court, regarding tax matters, and any and all other tax related documents, including but not limited to consents and agreements under the applicable section of the Internal Revenue Code, and any amendments, and consents to split gifts, closing agreements, and any power of attorney form required by the Internal Revenue Service and any state and local taxing authority with respect to any tax year between the years 1985 and 2095. My attorney-in-fact shall have authority to pay taxes due, collect and make such disposition of refunds as the attorney-in-fact shall deem appropriate, post bonds, receive confidential information and contest deficiencies determined by the Internal Revenue Service and any state and local taxing authority; to exercise any elections that I may have under federal, state, or local tax law; to allocate any generation-skipping tax exemption to which I am entitled; and generally to represent me or obtain professional representation for me in all tax matters and proceedings of all kinds and for all periods between the years 1985 and 2095 before all officers of the Internal Revenue Service and state and local authorities and in any and all courts; and to engage, compensate, and discharge attorneys, accountants, and other tax and financial advisors and consultants to represent and assist me in connection with any and all tax matters involving me or any property which I may own.";

const DURATION =
  "The authority of my attorney-in-fact to act on my behalf shall become effective on the circumstances described in Paragraph 2 above. This power of attorney shall not be affected by disability of the principal, as RCW 11.125.040 provides. It shall remain in effect according to its terms notwithstanding my disability, incapacity, incompetence, or uncertainty as to whether I may be dead or alive and until revoked or terminated as provided in Paragraph 6 hereof or as otherwise provided by law.";

const REVOCATION =
  "This power of attorney may be revoked, suspended, or terminated in writing by me with written notice to my designated attorney-in-fact and, if it has been recorded, by recording of the written instrument of revocation, suspension, or termination in the office of the recorder or auditor in each county known to me where this power of attorney has been recorded. A guardian of the principal may also revoke this power of attorney after court approval of such revocation; or upon the death of the principal upon actual knowledge or receipt of written notice by the attorney-in-fact.";

const RELIANCE =
  "My attorney-in-fact and all persons dealing with my attorney-in-fact shall be entitled to rely upon this power of attorney so long as neither my attorney-in-fact nor any person with whom he or she was dealing at the time of any act taken pursuant to this power of attorney had received actual knowledge or actual notice of any revocation, suspension or termination of the power of attorney by death or otherwise. Any action so taken, unless otherwise invalid or unenforceable, shall be binding on my heirs, devisees, legatees or personal representative.";

const LIMITATION =
  "Notwithstanding the foregoing, nothing contained herein shall authorize the attorney-in-fact to make, alter, revoke, or change any testamentary disposition of my property; or to alter, revoke or change any prior gifts of such property made previously by me while competent, except as provided in Paragraph 3.H.8 above. However, the attorney-in-fact shall specifically have the power to make gifts and said gifts shall not be invalid for federal or state tax purposes. Said gifts may be made from revocable trusts, life insurance policies, retirement accounts or other such sources if he or she reasonably believes I would have made the gift under the circumstances, considering my prior gifting history and my overall planning goals, including tax reduction. My attorney-in-fact shall be authorized to make transfers of any property to the attorney-in-fact or to exercise any of the foregoing powers in favor of the attorney-in-fact as limited by current law, and only (i) for the purpose of providing for the attorney-in-fact's education, support, or maintenance, (ii) for the purpose of qualifying me or my spouse, if I have one, for governmental medical assistance or long-term care coverage or to avoid estate recovery related to such assistance, or (iii) if the transfer constitutes an excludable gift under applicable federal or state gift and estate tax law. It is not my intent that my assets be included in the attorney-in-fact's taxable estate, should my attorney-in-fact predecease me or fail to survive me.";

const HIPAA =
  "I intend for my attorney-in-fact to be treated as I would be with respect to my rights regarding the use and disclosure of my individually identifiable health information or other medical records, including past records. This release of authority applies to information governed by the Health Insurance Portability and Accountability Act of 1996 (a.k.a. HIPAA), 42 U.S.C. Sec. 1320d and 45 C.F.R. Parts 160-164. This authority shall supersede any prior agreement I have made with my health care providers to restrict access to or disclosure of my individually identifiable health information. This authority has no expiration date and expires only if I revoke the authority in writing and deliver it to my health care provider.";

const MINOR_CHILDREN =
  "My attorney-in-fact is authorized to make health care, financial and all other types of decisions on behalf of my minor child or children, but only if the other parent of the child or children or another legal representative is not readily available to make such decisions, as RCW 11.125.410 provides. My attorney-in-fact is authorized to do all things necessary for the best interests of my children, with the same force and effect and to all intents and purposes as though I were personally present and acting for myself, hereby ratifying and confirming whatever my attorney-in-fact does by authority of this instrument; provided, however, this delegation shall not include the power to consent to marriage or adoption of my child, the performance or inducement of an abortion on or for my child, or the termination of any parental rights to my child. The authority granted under this paragraph shall be superseded by the appointment of a guardian of the person or, in the discretion of the court, the appointment of a third-party custodian by a court of competent jurisdiction for such child or children.";

const DIGITAL_ASSETS =
  'My attorney-in-fact shall have the power to access, modify, control, archive, transfer, delete and in all ways handle, distribute and dispose of my digital assets in all manner as allowed under chapter 11.120 RCW, including electronic communications. This shall also include the power to access these assets through any custodian of such assets. "Digital assets" include files stored on my digital devices, or in the cloud, including, but not limited to, desktops, laptops, tablets, peripherals, storage devices, mobile telephones, smartphones, and any similar digital device which currently exists or may exist as technology develops or such comparable items as technology develops. The term "digital assets" also includes, but is not limited to, emails received and sent, email accounts, digital music, digital photographs, digital videos, gaming accounts, software licenses, social network accounts, file sharing accounts, financial accounts, domain registrations, DNS service accounts, blogs, list-serves, web hosting accounts, tax preparation service accounts, online stores and auction sites, affiliate programs, other online accounts and similar digital assets which currently exist or may exist as technology develops, or such comparable items as technology develops, regardless of the ownership of the physical device upon which the digital item is stored.';

const PHOTOCOPIES =
  "My agent may make multiple photocopies of this document which shall be given the same force and effect as the original. Persons dealing with my attorney-in-fact may rely fully on a photocopy of this document as though the photocopy was an original.";

const LAST_GOODBYES =
  "It is important to me that my loved ones be given the chance to say their farewells to me, even if I am not capable of interacting with them. Therefore, I direct my agent to keep me alive for a reasonable period to allow loved ones to travel to where I am if this is feasible.";

export function Body() {
  const plan = useContext(PlanContext);
  const elections = plan?.documents.durablePowerOfAttorney;

  return (
    <>
      <Title />
      {"\n"}
      <Preamble />
      {"\n"}
      <Paragraphs
        entries={[
          { title: "Appointment", body: <Appointment /> },
          { title: "Effectiveness", body: EFFECTIVENESS },
          { title: "Powers", body: <Powers /> },
          { title: "Taxes", body: TAXES },
          { title: "Duration", body: DURATION },
          { title: "Revocation and Termination", body: REVOCATION },
          { title: "Reliance", body: RELIANCE },
          {
            title: "Applicable Law",
            body: "The laws of the State of Washington shall govern this power of attorney, including RCW 11.125.200 requiring acceptance.",
          },
          {
            title: "Indemnity",
            body: "My estate shall hold harmless and indemnify my attorney-in-fact from all liability for acts done in good faith and not in fraud of the principal.",
          },
          { title: "Limitation of Power", body: LIMITATION },
          { title: "HIPAA Release Authority", body: HIPAA },
          !!elections?.minorChildren && {
            title: "Minor Health Care and Financial Decisions",
            body: MINOR_CHILDREN,
          },
          {
            title: "Digital Assets and Electronic Communications",
            body: DIGITAL_ASSETS,
          },
          { title: "Photocopies", body: PHOTOCOPIES },
          !!elections?.lastGoodbyes && {
            title: "Last Goodbyes",
            body: LAST_GOODBYES,
          },
        ]}
      />
      <Testimonium instrument={INSTRUMENT} />
      {"\n"}
      <SignatureBlock role={ROLE} />
      {"\n"}
      <PrincipalAcknowledgment />
      {"\n"}
      <CertificationPage />
    </>
  );
}

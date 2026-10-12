import type { ComponentType } from "preact";

import { DOCUMENTS } from "../documents/registry";
import { TERMS_VERSION } from "../ui/terms";
import { PRIVACY_BODY, TERMS_BODY } from "../ui/termsCopy";
import { CONTENT } from "./content";

export interface Breadcrumb {
  name: string;
  path: string;
}

interface BodyProps {
  root: string;
}

export interface SitePage {
  path: string;
  title: string;
  description: string;
  breadcrumbs: Breadcrumb[];
  Body: ComponentType<BodyProps>;
}

const HOME: Breadcrumb = { name: "WA Estate Docs", path: "" };
const DOCUMENTS_CRUMB: Breadcrumb = { name: "Documents", path: "documents/" };

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </>
  );
}

function DocumentList({ root }: BodyProps) {
  return (
    <ul class="site-list">
      {DOCUMENTS.map((doc) => (
        <li key={doc.id}>
          <a href={`${root}documents/${doc.id}/`}>{doc.title}</a>
        </li>
      ))}
    </ul>
  );
}

function Landing({ root }: BodyProps) {
  return (
    <>
      <h1>Washington estate planning documents, drafted in your browser</h1>
      <p>
        WA Estate Docs is a self-help drafting aid for Washington residents.
        Fill in a plan once, review the draft beside the guidance for each
        choice, and print documents ready to bring to a Washington attorney.
      </p>
      <p>
        <a class="btn btn-primary" href={`${root}app/`}>
          Open the app
        </a>
      </p>
      <h2>Documents</h2>
      <DocumentList root={root} />
      <h2>How it works</h2>
      <ol class="site-list">
        <li>Enter names, fiduciaries, and choices once for the whole plan.</li>
        <li>
          Read the guidance beside each choice and the advisories the review
          panel raises.
        </li>
        <li>
          Print on Letter paper, or export the Attorney Memo that lists every
          choice and advisory for counsel.
        </li>
      </ol>
      <p>
        Entries stay in your browser. Nothing is uploaded, and the site runs no
        analytics or third-party scripts. Read the{" "}
        <a href={`${root}privacy/`}>privacy notice</a> and the{" "}
        <a href={`${root}terms/`}>terms of use</a>.
      </p>
    </>
  );
}

function DocumentsIndex({ root }: BodyProps) {
  return (
    <>
      <h1>Documents</h1>
      <p>
        Each document type is drafted from one shared plan to the cited
        Washington statutes. None has been reviewed by an attorney.
      </p>
      <ul class="site-cards">
        {DOCUMENTS.map((doc) => (
          <li key={doc.id}>
            <h2>
              <a href={`${root}documents/${doc.id}/`}>{doc.title}</a>
            </h2>
            <p>{CONTENT[doc.id]?.audience}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function About() {
  return (
    <>
      <h1>About WA Estate Docs</h1>
      <p>
        WA Estate Docs is a self-help drafting aid. It produces drafts for you
        or your attorney to review. It is not legal advice, and using it does
        not create an attorney-client relationship.
      </p>
      <h2>Guidance and review</h2>
      <p>
        Every decision-bearing field carries a disclosure that explains what it
        does, the options, what is typical, and its impact. The guidance never
        appears in the printed document. A review panel raises advisories, such
        as an interested witness or a missing alternate fiduciary.
      </p>
      <h2>Where your data lives</h2>
      <p>
        Entries are stored in your browser. Plans can be saved as a backup file
        and imported later. The source code is public, so the privacy statements
        can be checked.
      </p>
      <h2>Statutes</h2>
      <p>
        Documents are drafted to the cited Washington statutes. Laws change, and
        this site may not reflect the current law. Bring each draft to a
        licensed Washington attorney before you sign it.
      </p>
    </>
  );
}

function Statement({ heading, items }: { heading: string; items: string[] }) {
  return (
    <>
      <h1>{heading}</h1>
      <Paragraphs items={items} />
    </>
  );
}

function ItemList({ heading, items }: { heading: string; items: string[] }) {
  return (
    <>
      <h2>{heading}</h2>
      <ul class="site-list">
        {items.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </>
  );
}

function DocumentPage({ id, root }: BodyProps & { id: string }) {
  const doc = DOCUMENTS.find((candidate) => candidate.id === id);
  const content = CONTENT[id];
  if (!doc || !content) throw new Error(`No site content for document ${id}`);
  return (
    <>
      <h1>{doc.title}</h1>
      <p>{content.summary}</p>
      <h2>Who it is for</h2>
      <p>{content.audience}</p>
      <ItemList heading="Signing requirements" items={content.signing} />
      <ItemList
        heading="On signing day, the app collects"
        items={doc.executeGroups.map((group) => group.title)}
      />
      <ItemList heading="After drafting" items={content.after} />
      <ItemList heading="Statutes cited" items={content.citations} />
      <p>
        <a class="btn btn-primary" href={`${root}app/#/document/${doc.id}`}>
          Start this document
        </a>
      </p>
      <p>
        This is a draft to bring to a Washington attorney. It is not legal
        advice.
      </p>
    </>
  );
}

const DOCUMENT_PAGES: SitePage[] = DOCUMENTS.map((doc) => ({
  path: `documents/${doc.id}/`,
  title: doc.title,
  description: CONTENT[doc.id]?.description ?? "",
  breadcrumbs: [
    HOME,
    DOCUMENTS_CRUMB,
    { name: doc.title, path: `documents/${doc.id}/` },
  ],
  Body: ({ root }) => <DocumentPage id={doc.id} root={root} />,
}));

export const SITE_PAGES: SitePage[] = [
  {
    path: "",
    title: "WA Estate Docs: Washington estate planning documents",
    description:
      "Draft a will, remains directive, health care directive, and powers of attorney for Washington in your browser, then print them to bring to an attorney.",
    breadcrumbs: [],
    Body: Landing,
  },
  {
    path: "documents/",
    title: "Documents",
    description: `The Washington document types in WA Estate Docs: ${DOCUMENTS.map(
      (doc) => doc.title
    ).join(", ")}.`,
    breadcrumbs: [HOME, DOCUMENTS_CRUMB],
    Body: DocumentsIndex,
  },
  ...DOCUMENT_PAGES,
  {
    path: "about/",
    title: "About",
    description:
      "WA Estate Docs is a self-help drafting aid with a guidance layer, a review panel, and an Attorney Memo export. Entries stay in your browser.",
    breadcrumbs: [HOME, { name: "About", path: "about/" }],
    Body: About,
  },
  {
    path: "privacy/",
    title: "Privacy",
    description:
      "Entries are stored in your browser's localStorage. There is no server or account, and no cookies, analytics, or third-party scripts.",
    breadcrumbs: [HOME, { name: "Privacy", path: "privacy/" }],
    Body: () => <Statement heading="Privacy" items={PRIVACY_BODY} />,
  },
  {
    path: "terms/",
    title: "Terms of use",
    description:
      "Terms of use for WA Estate Docs: a self-help drafting aid that is not legal advice and creates no attorney-client relationship.",
    breadcrumbs: [HOME, { name: "Terms of use", path: "terms/" }],
    Body: () => (
      <>
        <Statement heading="Terms of use" items={TERMS_BODY} />
        <p class="site-meta">Last updated {TERMS_VERSION}</p>
      </>
    ),
  },
];

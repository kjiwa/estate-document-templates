import type { ComponentChildren } from "preact";

export interface ClauseItem {
  title: string;
  body: ComponentChildren;
}

type ClauseEntry = ClauseItem | null | undefined | false;

interface ClauseProps {
  articleNum: number;
  clauses: ClauseEntry[];
}

// Reproduces `renderClauses`' contract exactly: falsy entries are filtered
// before numbering, so optional clauses (the CPA acknowledgment, the
// disclaimer trust branch) never leave a gap — survivors are numbered
// `${articleNum}.${i + 1}` inside `<strong>`, each wrapped in
// `<p class="clause">`.
export function Clause({ articleNum, clauses }: ClauseProps) {
  const survivors = clauses.filter((clause): clause is ClauseItem =>
    Boolean(clause)
  );
  return (
    <>
      {survivors.map((clause, idx) => (
        <>
          <p class="clause" key={idx}>
            <strong>
              {articleNum}.{idx + 1} {clause.title}.
            </strong>{" "}
            {clause.body}
          </p>
          {"\n"}
        </>
      ))}
    </>
  );
}

import { Fragment, type ComponentChildren } from "preact";

export interface ClauseItem {
  title: string;
  body: ComponentChildren;
}

type ClauseEntry = ClauseItem | null | undefined | false;

interface ClauseProps {
  articleNum: number;
  clauses: ClauseEntry[];
}

// Falsy entries are filtered before numbering, so optional clauses never
// leave a gap; survivors are numbered `${articleNum}.${i + 1}`.
export function Clause({ articleNum, clauses }: ClauseProps) {
  const survivors = clauses.filter((clause): clause is ClauseItem =>
    Boolean(clause)
  );
  return (
    <>
      {survivors.map((clause, idx) => (
        <Fragment key={idx}>
          <p class="clause">
            <strong>
              {articleNum}.{idx + 1} {clause.title}.
            </strong>{" "}
            {clause.body}
          </p>
          {"\n"}
        </Fragment>
      ))}
    </>
  );
}

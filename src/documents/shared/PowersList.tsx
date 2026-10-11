import { Fragment, type ComponentChildren } from "preact";

export interface PowerItem {
  title: string;
  body: ComponentChildren;
}

type PowerEntry = PowerItem | null | undefined | false;

interface PowersListProps {
  articleNum: number;
  items: PowerEntry[];
}

// Reproduces `renderPowersList`'s `<ol class="powers-list">`.
export function PowersList({ articleNum, items }: PowersListProps) {
  const survivors = items.filter((item): item is PowerItem => Boolean(item));
  return (
    <ol class="powers-list">
      {"\n"}
      {survivors.map((item, idx) => (
        <Fragment key={idx}>
          <li>
            <strong>
              {articleNum}.{idx + 1} {item.title}.
            </strong>{" "}
            {item.body}
          </li>
          {"\n"}
        </Fragment>
      ))}
    </ol>
  );
}

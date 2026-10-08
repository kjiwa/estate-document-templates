import type { ComponentChildren } from "preact";

import { WitnessSigColumn } from "./WitnessSigColumn";

// `witnesses[0]`/`[1]` are read as fixed indices.
export function WitnessBlock({
  title,
  children,
}: {
  title: string;
  children: ComponentChildren;
}) {
  return (
    <div class="witness-block">
      <h2 class="doc-subtitle">{title}</h2>
      <p class="witness-declaration">{children}</p>
      <div class="sig-grid">
        <WitnessSigColumn index={0} />
        <WitnessSigColumn index={1} />
      </div>
    </div>
  );
}

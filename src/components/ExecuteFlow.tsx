import { Field } from "../form/Field";
import {
  currentExecuteGroup,
  executeGroupComplete,
  executeGroupIndex,
  executeGroups,
  stepExecuteGroup,
} from "../ui/execute";
import { view } from "../ui/view";

// Mirrors `design/mockups/06-signing-day.html` structurally: the progress
// bar, group heading/lead, the group's fields, Back/Continue, and the
// "Also in this flow" checklist of all four groups.
export function ExecuteFlow() {
  const groups = executeGroups.value;
  const index = executeGroupIndex.value;
  const group = currentExecuteGroup.value;
  const complete = executeGroupComplete.value;

  if (!group) return null;

  const total = groups.length;
  const percent = Math.round(((index + 1) / total) * 100);
  const isLast = index === total - 1;

  function handleContinue() {
    if (isLast) {
      view.value = "print";
      return;
    }
    stepExecuteGroup(1);
  }

  function handleBack() {
    if (index === 0) {
      view.value = "document";
      return;
    }
    stepExecuteGroup(-1);
  }

  return (
    <main id="main-content" class="execute-flow">
      <div
        class="rail-progress"
        style={{ borderBottom: "none", marginBottom: "var(--space-6)" }}
      >
        <div class="rail-progress-bar">
          <div class="rail-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span class="rail-progress-label">
          Group {index + 1} of {total} — {group.title}
        </span>
      </div>
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          marginBottom: "var(--space-1)",
        }}
      >
        {group.title}
      </h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 0 }}>{group.lead}</p>
      <div class="panel-field-group">
        {group.fields.map((field) => (
          <Field field={field} key={field.path} />
        ))}
      </div>
      <div class="field-nav" style={{ marginTop: "var(--space-8)" }}>
        <button type="button" class="btn" onClick={handleBack}>
          ← Back
        </button>
        <button type="button" class="btn btn-primary" onClick={handleContinue}>
          Continue →
        </button>
      </div>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--rule-hairline)",
          margin: "var(--space-8) 0",
        }}
      />
      <h2
        style={{ fontSize: "var(--font-size-base)", color: "var(--ink-muted)" }}
      >
        Also in this flow
      </h2>
      <ul class="card-list" style={{ listStyle: "none", padding: 0 }}>
        {groups.map((g, i) => (
          <li class="checklist-item" key={g.title}>
            <span class={`rail-check${complete[i] ? " done" : ""}`} />
            {g.title}
            {i === index ? (
              <em style={{ color: "var(--ink-muted)", marginLeft: "auto" }}>
                in progress
              </em>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}

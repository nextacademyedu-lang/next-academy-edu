---
trigger: always_on
---

# Agent Execution Protocol

> This protocol governs HOW agents decompose, plan, critique, and execute tasks in this project.
> It is referenced by `rules.md` and MUST be followed before executing any multi-step feature.

---

## Phase 1: Deep Thinking Before Any Execution

Before writing a single line of code, the agent MUST complete ALL of the following steps.

### Step 1.1 — Read & Internalize

- Read all docs listed in `rules.md §1` for the feature
- Read existing code files that will be affected
- State explicitly: "I have read: [list of files]"

### Step 1.2 — Enumerate Scenarios

Using the template from `rules.md §2`, enumerate:
- Happy path
- All error paths
- All edge cases
- All side effects
- All dependencies and dependents

### Step 1.3 — Self-Critique the Plan (MANDATORY)

Before finalizing the plan, the agent MUST argue against it:

🔴 Contradiction check: Does any part of this plan contradict existing code or docs?
→ If yes: flag it and ask the user.

🔴 Assumption audit: What am I assuming that I haven't verified?
→ List every assumption. Mark each as [VERIFIED] or [UNVERIFIED].

🔴 Worst-case analysis: What is the single most likely failure point?
→ State it. State the recovery plan.

🔴 Scope check: Am I doing more than what was asked?
→ Trim to minimum viable implementation unless otherwise instructed.

🔴 Dependency check: Does this require something that doesn't exist yet?
→ Block and ask before proceeding.


### Step 1.4 — Ask the User (Batch Questions)

Compile ALL unresolved questions from Steps 1.1–1.3 into ONE message:

Before I start, I need answers to the following:

[Question] — [Why this matters]

[Question] — [Why this matters]
...

I also want to confirm my plan:
[Brief plan summary]

Shall I proceed?

**Do NOT start coding until the user confirms.**

---

## Phase 2: Task Decomposition

Once the plan is confirmed, break it into discrete tasks.

### 2.1 — Task Granularity Rules

Each task MUST:
- Be completable by a single agent without depending on an in-progress task
- Have a clear input and output
- Touch at most 3–5 files
- Have a defined "done" condition

### 2.2 — Assign Tasks to Agents

Use this template to assign tasks:

Execution Plan
Agent 1 — [Agent Role, e.g., "Schema & Access"]
Can start: Immediately
Tasks:

 Task A: [description] → Output: [file(s) changed]

 Task B: [description] → Output: [file(s) changed]
Done condition: [What "done" looks like]
Conflicts with: None

Agent 2 — [Agent Role, e.g., "API Layer"]
Can start: After Agent 1 completes Task A
Tasks:

 Task C: [description] → Output: [file(s) changed]
Done condition: [What "done" looks like]
Conflicts with: Agent 3 must not touch [file X] until this is done

Agent 3 — [Agent Role, e.g., "UI Layer"]
Can start: After Agent 2 completes
Tasks:

 Task D: [description] → Output: [file(s) changed]
Done condition: [What "done" looks like]
Conflicts with: None

Agent 4 — Reviewer
Can start: After ALL other agents are done
Tasks:

 Review: does the full feature match the plan?

 Review: are all scenarios handled?

 Review: do all tests pass?

 Review: are logs updated?
Done condition: All checks pass OR issues are filed

### 2.3 — Conflict Prevention Rules

Before assigning tasks, check:

☐ No two agents write to the same file simultaneously
☐ Agent N+1 never assumes Agent N's output until N signals "done"
☐ Shared types/interfaces are defined by Agent 1 and treated as immutable by others
☐ If a task requires a value from another agent (e.g., a collection slug), it waits
☐ Database schema changes are always Agent 1 — never done mid-execution


---

## Phase 3: Execution

### 3.1 — Per-Task Execution Checklist

Before executing each task:

☐ Re-read the relevant doc section for this specific task
☐ Confirm the task's input files exist and are in expected state
☐ State what you are about to do in one sentence
☐ Do it
☐ State what you did and what changed
☐ Update logs if this was a significant change (see §3.2)


### 3.2 — Log Update Trigger Points

Update logs at MINIMUM at these points:

| Trigger | Which log to update |
|---|---|
| Task completed | `docs/logs/tasks.md` — mark `[x]` |
| File created or significantly modified | `docs/logs/changelog.md` |
| Error encountered | `docs/logs/errors.md` |
| Every 5–10 tool calls | `docs/logs/changelog.md` + `docs/sessions/YYYY-MM-DD-HH:MM-session-N.md` |
| Agent signals "done" | `docs/sessions/YYYY-MM-DD-HH:MM-session-N.md` — mark agent complete |
| All agents done | `docs/sessions/YYYY-MM-DD-HH:MM-session-N.md` — write summary |

### 3.3 — Mid-Execution Checkpoints

Stop and ask the user at these points:

1. **After Agent 1** — "Schema and access control are done. Here's what I created: [list]. Shall Agent 2 proceed with the API layer?"
2. **After unexpected error** — "I encountered [error]. Root cause: [X]. My proposed fix: [Y]. Shall I apply it?"
3. **After design decision** — "I had to choose between [A] and [B]. I chose [A] because [reason]. Is that correct?"
4. **Before destructive operation** — "I am about to [delete/migrate/overwrite]. This affects [files/data]. Confirm?"

---

## Phase 4: Review Agent

The Review Agent runs LAST and checks the entire feature.

### Review Checklist

☐ Does the implementation match the original plan?
☐ Does it match the docs (PRD, api-contracts, wireframes)?
☐ Are ALL scenarios from Phase 1 handled in code?
☐ Are all tests written and passing?
☐ Are logs up to date (changelog, tasks, errors, session)?
☐ Is there any dead code, console.log, or TODO left behind?
☐ Does it work in Arabic RTL?
☐ Does it work on mobile?
☐ Is access control enforced?
☐ Any security issues? (hardcoded secrets, missing sanitization, exposed routes)


### Review Output

```markdown
## Review Report — [Feature Name] — [YYYY-MM-DD HH:MM]

**Status:** ✅ PASSED / ❌ FAILED / ⚠️ PASSED WITH WARNINGS

### What Was Built
[Summary of implementation]

### Scenarios Coverage
- ✅ Happy path — covered
- ✅ Error paths — covered
- ⚠️ Edge case: [X] — partially covered, needs follow-up

### Issues Found
- [Issue] — Severity: [HIGH/MED/LOW] — [Recommended fix]

### Logs Status
- changelog.md: ✅ updated
- tasks.md: ✅ updated
- errors.md: ✅ updated / ⚠️ missing entry for [X]
- session log: ✅ updated

### Final Verdict
[SHIP IT / NEEDS FIXES / ESCALATE TO USER]
Quick Reference: Execution Flow
User requests feature
        ↓
[Phase 1] Read docs + Enumerate scenarios + Self-critique + Ask questions
        ↓
[Phase 2] Decompose into parallelizable tasks + Assign agents + Check conflicts
        ↓
[Phase 3] Agents execute tasks + Update logs + Hit checkpoints + Ask user when needed
        ↓
[Phase 4] Review agent validates everything + Reports findings
        ↓
[Final] User approves or requests fixes

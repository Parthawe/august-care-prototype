# August AI Prototype — Design Audit and Improvement Plan

## Executive Assessment

The prototype has a strong product thesis, a coherent August-inspired palette, useful scenario deep links, and a clear AI-to-clinician story. Its largest interview risk is not missing screens. It is that several screens feel like polished storyboards rather than a working conversation, while the four visual variations currently test styling more than product hypotheses.

The next pass should prioritize interaction credibility, authorship, timing, readability, and a curated review story.

## Audit Health Score

| Dimension | Score | Key finding |
|---|---:|---|
| Accessibility | 2/4 | Good semantic intent, but much of the interface uses 7–12px text, 32px controls, weak focus treatment, and color-dependent status cues. |
| Performance | 3/4 | The prototype is lean, but repeated backdrop blur, layered shadows, and gradients are expensive for a mobile surface. |
| Responsive design | 2/4 | The mobile frame adapts at 900px, but it does not account for safe-area insets, small-height devices, 200% text scaling, or long translations. |
| Theming | 2/4 | Core green tokens exist, but the stylesheet contains many one-off colors and variation-specific overrides that are not expressed as a deliberate token system. |
| Implementation integrity | 3/4 | The product language is specific and the deterministic detector found only one warning, but many visible controls are nonfunctional and the variations are largely cosmetic. |
| **Total** | **12/20** | **Acceptable foundation; significant interaction and accessibility work remains.** |

## Implementation Integrity Verdict

Pass, with important conditions.

The implementation is recognizably August: green tonal hierarchy, plain-text August replies, patient bubbles, clear AI/human labels, safety routing, clinician handoff, report review, prescription boundaries, care plan, and follow-up.

However, a reviewer can quickly discover that:

- The same clinician screen says the doctor is still reviewing and also shows completed doctor replies.
- Most composers do not add messages.
- Several buttons look actionable but do nothing.
- The four variations change surfaces, radius, and shadow more than behavior.
- The clinician uses initials instead of the requested portrait treatment.

Those gaps weaken the prototype’s credibility more than another visual-polish pass would improve it.

## Priority Findings

### P0 — Safety parsing can miss a real danger signal

The current intake logic checks whether the entire answer contains any negative word. An answer such as “No chest pain, but I fainted” contains both a negative and a danger signal, so the generic negative can incorrectly suppress emergency routing.

**Impact:** The most safety-sensitive branch can demonstrate the wrong behavior.

**Action:** Evaluate each red flag independently, support concept-specific negation, and route ambiguous answers to a safety clarification rather than routine intake.

### P0 — Async clinician timing contradicts itself

The doctor-handoff screen shows “Dr. Rao is reviewing” and an expected 30–60 minute response while doctor replies and a signed care plan are already visible.

**Impact:** The core assignment problem—managing an asynchronous human handoff—looks staged rather than designed.

**Action:** Separate:

1. Clinician assigned and reviewing.
2. Clinician replied and chat is active.
3. Care plan signed.

### P1 — The four variations are visual skins, not four product hypotheses

Classic, Ambient, Clinical, and Concierge currently vary background, radius, border, density, and elevation. Their flow, information order, and interaction model remain the same.

**Impact:** Fifty-two links create review overhead without demonstrating fifty-two meaningful decisions.

**Action:** Give each direction a specific question:

- **Classic — Continuous thread:** Familiar chat with light clinical structure. Does it feel trustworthy without feeling over-designed?
- **Ambient — Quiet companion:** Less visible system UI, more whitespace, calmer pacing. Can August collect context without feeling like a form?
- **Clinical — Transparent care system:** Stronger provenance, timestamps, license/status, and structured handoff. Does explicitness increase trust?
- **Concierge — Guided service:** Stronger clinician identity, proactive next steps, and high-touch handoff moments. Does the care feel worth paying for?

### P1 — The interface contains false affordances

The bottom navigation is intentionally static, but it is built from buttons. Other controls—history, attach, change location, view summary, choose a lab, see instructions, Ask August, and download summary—also look actionable without completing an interaction.

**Impact:** Clicking a dead control immediately breaks prototype immersion.

**Action:** Make tested-path controls work. Render intentionally static navigation as noninteractive navigation items. Downplay or remove secondary actions that are not part of the prototype.

### P1 — Dual authorship is explained but not demonstrated

“Ask August” inside the clinician thread currently changes a notice. It does not show an actual August exchange alongside the clinician conversation.

**Impact:** The most original interaction hypothesis remains copy instead of a prototype.

**Action:** Let the patient switch the composer between Dr. Rao and August. Show one concise August explanation that explicitly preserves clinician authority.

### P1 — Core text is too small

Many labels and supporting lines are between 7px and 10px. Primary conversational copy is approximately 12px.

**Impact:** The interface looks refined in a screenshot but does not feel credible as a healthcare product on a real phone, especially under stress or with larger text settings.

**Action:** Establish a 14px minimum for conversational and functional body copy, 12px minimum for secondary labels, and remove content that no longer fits rather than shrinking it.

### P2 — Too many surfaces carry equal visual weight

Glass headers, cards, bordered cards, soft shadows, pills, and green tints recur on nearly every screen.

**Impact:** Nothing feels meaningfully primary; premium becomes “everything is polished” rather than “everything is deliberate.”

**Action:** Choose one hero surface per screen. Flatten supporting information into text, dividers, and tonal sections. Avoid border plus shadow on the same quiet card.

### P2 — The clinical variation uses a generic grid backdrop

The Impeccable detector flagged the two-axis grid as a generated-interface signature. It does not represent a medical measurement surface in this context.

**Impact:** The direction feels more like an AI-made “clinical theme” than a considered healthcare product.

**Action:** Replace the grid with stronger provenance, timestamps, alignment, and structured status—not decoration.

### P2 — The unsupported-care callout uses a generated-UI side accent

The detector flagged the 3px left border on the “Why this route is different” card.

**Impact:** The treatment looks templated and competes with the actual next step.

**Action:** Use a flat tonal section with a compact heading and no side accent.

### P2 — Upload context does not return to its origin

An upload from the clinician thread routes back to the visit summary rather than the active clinician conversation.

**Impact:** The user loses the conversational context they were in.

**Action:** Track upload origin. A pre-visit upload returns to intake/summary; an in-visit upload returns to the clinician thread with a “Result added” event.

### P2 — Prescription flow lacks the decision moment

The assessment flow reaches clinician review but does not show approve, decline, test-first, or more-information outcomes.

**Impact:** The prototype stops before the highest-trust medication moment.

**Action:** Add one clinician medication-decision state and one boundary outcome.

## Positive Findings to Preserve

- August replies are plain text rather than assistant bubbles.
- Patient authorship is visually distinct.
- AI and clinician roles are named.
- The composer and bottom navigation remain spatially predictable.
- The safety interruption is visually decisive.
- The patient can review what will be shared.
- The waiting screen treats async care as a product state.
- Report extraction does not treat a single result as the final clinical answer.
- Prescription copy avoids promising medication.
- Boundaries avoid apology language and offer a next step.
- Scenario deep links make design feedback precise.

## Recommended Interview Architecture

### Primary walkthrough

One recommended flow should be obvious from the case hub:

1. Home.
2. Symptom intake.
3. Three-question intake.
4. Visit summary.
5. Pricing and consent.
6. Clinician matching.
7. Clinician reviewing.
8. Clinician replied.
9. Ask August to explain.
10. Care plan.
11. Follow-up.

### Supporting edge-case links

- Emergency interruption.
- Report upload before a visit.
- Report upload during a clinician visit.
- Prescription request and clinician decision.
- Unsupported controlled-medication request.

### Variation review

Keep four directions, but label one as the recommended design and present the other three as explicit hypotheses. A reviewer should be able to understand what each variation is testing before opening it.

## Library and Tooling Decision

### Added

- **Impeccable:** project-level design context, critique vocabulary, anti-pattern detector, hardening guidance, and browser iteration support.

### Worth adding only when used

- **Motion:** use a small animation library only if the next pass includes authored transitions for clinician joining, thread-mode switching, or a care-plan state change. CSS is sufficient for simple fades.
- **Accessibility automation:** add an axe-based check when browser-level test automation is part of the project workflow.

### Deliberately avoid

- A general UI component kit. The current August language is specific; importing a generic kit would create more design drift than leverage.
- A large icon library. The current icon vocabulary is small and already coherent.
- Decorative animation packages. Motion must communicate care state, authorship, or continuity.

## Execution Order

1. Fix emergency parsing and ambiguous safety answers.
2. Split clinician reviewing from clinician replied.
3. Make Ask August inside the clinician thread a real interaction.
4. Make the recommended walkthrough obvious in the case hub.
5. Convert four visual variations into four stated product hypotheses.
6. Remove or wire false affordances in the tested path.
7. Raise type sizes and reduce copy until each screen breathes.
8. Replace grid and side-accent anti-patterns.
9. Add upload-origin continuity and prescription decision states.
10. Run accessibility, interaction, visual, and rendered-route validation.

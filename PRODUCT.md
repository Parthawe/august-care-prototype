# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is a patient on a mobile device who has a health concern but may not know whether they need self-care, routine clinician care, testing, a prescription review, or emergency help. They need to explain what is happening in their own words and understand what happens next without navigating a conventional medical intake form.

Additional confirmed users and situations:

- A patient who already believes they need a doctor.
- A patient asking for a new prescription or refill.
- A returning patient with a follow-up question, worsening symptoms, a medication issue, or a new report.
- A caregiver asking on behalf of another person, where August must clarify who the care is for.
- A product-design interview reviewer evaluating the quality of the interaction model, visual craft, systems thinking, safety thinking, and prototype storytelling.

## Product Purpose

August is a mobile healthcare conversation that helps a patient move from an unstructured concern to the right next step. It asks focused questions, performs safety routing, structures the patient’s information for clinical review, manages an asynchronous clinician handoff, and helps the patient understand reports, care plans, and follow-up.

Success means the patient can:

- Start naturally with symptoms, a doctor request, a prescription request, or an upload.
- Understand whether the next step is emergency care, supported self-care, clinician review, or an unsupported-care alternative.
- Know whether a message or decision comes from the patient, August AI, or a licensed clinician.
- Continue the conversation without feeling pushed through a robotic decision tree.
- Wait for clinician review without feeling that the experience is frozen or abandoned.

For the design exercise, success also means the prototype communicates product reasoning and interaction depth clearly enough to support a product-design interview discussion.

## Positioning

August is not an AI answer box and does not replace a doctor. It is a care-orchestration layer that turns a natural patient conversation into a safe, understandable path through intake, routing, clinician handoff, waiting, decisions, and follow-up.

Its distinct mechanism is the continuity of one care conversation: August prepares the encounter, a clinician can enter with visibly different authority, and August can return afterward to explain or check in without losing context.

## Operating Context

- Mobile-only patient experience presented as a high-fidelity prototype.
- Natural free-text chat is the primary interaction.
- The chat composer remains available throughout conversational states.
- A persistent bottom navigation includes August in the bottom-right position.
- August asks multiple meaningful questions before suggesting a routine next step, except when an emergency or clearly unsupported condition requires earlier routing.
- A clinician may respond within minutes or much later; the interface must communicate status, response windows, notifications, and worsening-symptom guidance.
- Patients may upload lab reports, medical images, prescription photos, or other documents. August summarizes relevant information, asks the patient to confirm important extracted details, and routes significant findings for clinician review.
- August prepares a patient-reviewable pre-visit summary and a clinician-facing structured handoff containing the transcript, relevant negatives, safety flags, medications, allergies, and uploads.

## Capabilities and Constraints

Confirmed capabilities:

- Symptom intake and adaptive follow-up questions.
- Safety and emergency routing.
- Clinician-required and unsupported-care routing.
- Patient-reviewable visit summary.
- Identity, location, eligibility, and clinical-consent steps when required.
- Asynchronous clinician matching, waiting, and handoff.
- Clear separation between August AI and licensed-clinician authorship.
- Prescription assessment flow without promising medication.
- Report and image upload with extraction, summary, confirmation, and escalation.
- Clinician-authored care plans and follow-up.

Confirmed constraints:

- August does not diagnose, prescribe, or represent itself as a clinician.
- The experience may feel conversationally human but must not conceal that August is AI.
- Free text is the default; structured controls are reserved for precision, consent, identity, location, pharmacy, uploads, and safety-critical confirmation.
- Routine recommendations should follow at least three meaningful questions unless a safety or scope decision must happen sooner.
- Declines and boundaries avoid apology or liability-admitting language such as “sorry” and instead state the boundary and safest next step.
- The prototype must not claim HIPAA, legal, regulatory, telehealth, prescribing, or clinical compliance. Those requirements need specialist review.

Open product decisions:

- Exact supported specialties, conditions, states, clinician availability rules, escalation destinations, and service-level response windows are not finalized.
- The final relationship between August-only guidance, clinician review, and clinician-visible group-chat behavior remains a design hypothesis to test.

## Brand Commitments

- Product name: August.
- The interface uses August’s green, forest, mint, warm-white, and closely related tonal palette.
- The experience should feel premium, modern, calm, concise, and highly considered.
- August’s replies appear as normal conversational text rather than boxed assistant bubbles.
- Patient messages may remain visually contained to preserve authorship.
- The interface should use restrained texture/noise and visual information when it improves hierarchy and perceived craft.
- Avoid a prominent invented logo; use the August wordmark/name with restraint.
- Keep copy short and natural, with one clear question or action at a time.

## Evidence on Hand

- A working mobile prototype with 13 primary review scenarios and four visual variations per scenario.
- Product and interaction documentation in `docs/august-ai-prd.md`, `docs/august-ai-master-design-document.md`, `docs/chat-visual-interaction-research.md`, and `docs/product-design-arsenal.md`.
- User-provided screenshots and written briefs describing the intended August interface and chat behavior.
- No verified clinical protocols, legal review, real clinician profiles, real patient data, outcomes evidence, testimonials, pricing approval, or compliance certification are available. Future work must not fabricate them.

## Product Principles

1. Conversation first, structure in the background.
2. Authorship and authority must remain obvious at every step.
3. Safety interrupts the routine flow instead of becoming disclaimer text.
4. Waiting is an active care state with honest expectations and a clear fallback.
5. Every boundary should leave the patient with an understandable next step.

## Accessibility & Inclusion

The prototype should support keyboard and touch use, readable type and contrast, clear focus states, accessible labels, reduced-motion preferences, and non-color cues for status and authorship. Urgent guidance must remain understandable without relying on color alone. Long names, larger text, localization, device safe areas, screen-reader order, and low-connectivity/error states should be treated as hardening requirements even when they are not all demonstrated in the interview prototype.

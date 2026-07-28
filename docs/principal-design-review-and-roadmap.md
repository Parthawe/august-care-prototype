# August Care Prototype — Principal Design Review

**Review date:** July 2026  
**Artifact reviewed:** Public version 17, canonical `/` journey, `/cases` walkthrough, supporting `/prototype` scenarios, state machine, PRD, master design document, and product experience plan.

## Executive verdict

The prototype has a strong product thesis and a credible visual language. Its most differentiated idea is continuity: August prepares the encounter, a clinician enters with visibly different authority, and August remains available for explanation and follow-up.

The largest risks are not visual. They are:

1. **Record integrity:** some paths invent patient facts or files to keep the demo moving.
2. **Safety consistency:** the symptom flow uses the safety classifier, but the medication flow can bypass it.
3. **Operational truth:** payment, emergency calling, file upload, clinician acceptance, testing, and signed plans sometimes look more real than their modeled behavior.
4. **Product-policy alignment:** the shared-care-thread concept must be reconciled with August's current terms, which describe clinician services as separate from AI-assisted features.
5. **Clinical relationship clarity:** the experience does not precisely show when AI intake ends, when the clinician-patient relationship begins, which entity provides care, or which data becomes part of the clinical record.

The next round should prioritize trust architecture before adding visual polish.

## What should be preserved

- Natural free-text entry.
- Plain-text August responses instead of bot bubbles.
- Strong patient authorship.
- Clear August-versus-clinician mode switch.
- Private August sidecar during clinician care.
- Patient review before sharing.
- Explicit async matching and reviewing states.
- Emergency interruption that removes routine navigation.
- Controlled-medication boundary without charging.
- Medication outcomes that do not promise a prescription.
- Upload confirmation before extracted data is shared.
- Follow-up that can reopen safety or clinician care.
- Calm forest, mint, and warm-white visual system.

## Priority scorecard

| Dimension | Current | Target | Principal finding |
|---|---:|---:|---|
| Product clarity | 3/5 | 5/5 | The care-orchestration thesis is strong, but the operating model is not fully resolved. |
| Record integrity | 2/5 | 5/5 | Demo defaults can become patient facts, uploaded files, or summaries. |
| Safety architecture | 2/5 | 5/5 | Safety logic is thoughtful but not applied to every conversational branch. |
| Authorship and authority | 4/5 | 5/5 | AI/human distinction is strong; provider identity, credentials, and record boundaries are incomplete. |
| Async care | 3/5 | 5/5 | Waiting is represented, but ETA, notifications, cancellation, reassignment, and refund states are missing. |
| Consent and privacy | 2/5 | 5/5 | One checkbox combines several distinct decisions and does not explain AI-data use. |
| Medication and testing | 2/5 | 5/5 | Decisions are shown, but orders, fulfillment, results, failure, and amendment loops are incomplete. |
| Accessibility | 4/5 | 5/5 | Automated coverage is strong; cognitive accessibility and stress-state comprehension still need user testing. |
| Interaction credibility | 3/5 | 5/5 | Core chat works, but several high-trust actions are simulations or shortcuts. |
| Interview storytelling | 4/5 | 5/5 | The walkthrough is clear; the root experience and reviewer controls need a cleaner separation. |

## P0 — Fix before presenting this as a trustworthy care system

### 1. Apply one safety gate to every free-text entry

**Loophole**

The symptom intake calls the safety classifier. `SUBMIT_PRESCRIPTION` only records answers and advances the medication flow. A patient can describe trouble breathing, fainting, overdose, severe allergic reaction, or another emergency inside the medication branch without triggering the emergency interruption.

**Change**

- Run a common safety evaluator on:
  - initial concern;
  - symptom answers;
  - medication answers;
  - report notes;
  - clinician-wait messages;
  - follow-up messages.
- Expand safety concepts beyond the sore-throat example:
  - self-harm or suicide;
  - poisoning or overdose;
  - stroke signs;
  - severe bleeding;
  - anaphylaxis;
  - pregnancy emergency;
  - altered consciousness;
  - rapidly worsening symptoms.
- Route ambiguous statements to a focused clarification.
- Preserve the triggering message and originating context when safety interrupts.

**Proof**

Create red-team tests for danger, negation, mixed statements, euphemisms, misspellings, and danger signals embedded in medication or upload messages.

### 2. Remove all fabricated patient facts

**Loophole**

- Submitting the empty home composer creates a sore-throat concern.
- Upload-first creates a fixed rapid-strep PDF.
- A summary with no intake answers inserts breathing, allergy, and swelling facts the patient never reported.
- Shortcuts silently convert broad intents such as “Medication” or “Doctor visit” into a sore-throat case.

This is the most serious trust problem in the prototype. A polished interface cannot compensate for a record that invents history.

**Change**

- Disable send when the composer is empty.
- Make demo shortcuts populate the composer as editable suggested text or open an intent-specific first question.
- Store facts as structured fields with:
  - source message ID;
  - author;
  - timestamp;
  - confidence;
  - confirmation status.
- Render unanswered fields as “Not provided,” never as reassuring negatives.
- Require a real selected demo fixture in review mode and label it “Sample file.”
- Keep reviewer fixtures separate from patient-generated state.

**Proof**

Every summary statement must trace to a patient message, confirmed upload field, or clinician-authored decision.

### 3. Make urgent actions operationally honest

**Loophole**

The “Call emergency services” control changes the UI but does not initiate a call. Location is hardcoded to San Francisco and confirmed with a checkbox. “Find nearest emergency department” opens a generic Apple Maps search.

**Change**

- In the prototype, label simulated behavior explicitly: “Demo: show call handoff.”
- In a production design, use a jurisdiction-aware emergency action such as a `tel:` link where appropriate.
- Never imply that August contacted emergency services.
- Separate:
  - call local emergency number;
  - crisis support;
  - poison control;
  - nearest emergency department;
  - contact someone nearby.
- Use verified current location or require the patient to enter it.
- Do not make emergency guidance depend on account creation, payment, or upload completion.

**Proof**

Test with U.S. and non-U.S. locations, denied location permissions, no phone capability, screen reader, large text, and interrupted connectivity.

### 4. Resolve the AI/clinical operating-model contradiction

**Loophole**

The prototype's north star is one continuous care conversation with a clinician and private August sidecar. August's current U.S. terms state that professional medical services are provided by MDI clinicians and are not embedded within an AI chatbot or assistant.

**Decision required**

Choose and document one model:

1. **One encounter, separate channels:** August and clinician surfaces share an encounter timeline but remain distinct threads and records.
2. **Hard handoff:** August prepares the consultation, then the patient enters an MDI clinician experience; August is accessible outside the clinical thread.

The current UI visually approaches model 1, but the product, legal, clinical, and operational owners must confirm it.

**Change**

- Name the clinical provider entity at handoff.
- Explain when a clinician-patient relationship begins.
- Show whether August can see clinician messages and whether the clinician can see August-sidecar messages.
- Define which events belong to the consumer AI history, the clinical record, or both.
- Keep the chronological care timeline even if the message channels are separate.

### 5. Separate the consent stack

**Loophole**

One checkbox currently covers sharing the summary with a clinician. It does not distinguish:

- AI-feature consent;
- data processing and possible improvement/training use;
- transfer of selected information to the clinical provider;
- telehealth informed consent;
- electronic communications;
- payment authorization.

**Change**

Design progressive consent:

1. AI disclosure and data-use summary at first use.
2. “What will be shared” confirmation before transfer.
3. Provider identity and telehealth consent before clinical care.
4. Payment authorization with refund conditions.
5. Notification privacy choice before leaving an async state.

Show version, timestamp, and a path to review or withdraw each applicable consent.

## P1 — Required for a credible end-to-end prototype

### 6. Strengthen identity, eligibility, and jurisdiction

Current eligibility uses “Myself,” “18 or older,” and a California checkbox. Add:

- sign-in or account checkpoint;
- legal name and date of birth;
- current physical location, distinct from residence;
- supported-state check;
- patient identity verification state;
- adult-only boundary before health information about another person is collected;
- clinician authorization for the patient's current jurisdiction;
- service-scope result before payment.

Do not ask the patient to attest to a location the product already assumes.

### 7. Redesign the pre-visit summary as a source-linked transfer artifact

The summary should show:

- patient goal in their own words;
- symptoms and timeline;
- relevant safety answers;
- medications and allergies;
- relevant history;
- uploads with filename, source, and date;
- unanswered or conflicting information;
- exactly what will be shared;
- what will remain private;
- source links back to messages.

Replace a single “Correct” note with field-level correction. A correction should update the affected fact and preserve an audit history, not append a disconnected line.

### 8. Define the clinical episode

The clinician-care contract should state:

- when clinical review begins;
- what happens if no clinician accepts;
- whether cancellation is possible;
- reassignment behavior;
- expected response range;
- included follow-up period;
- whether clinician-ordered test-result review is included;
- what counts as a new concern or separate episode.

### 9. Make waiting an active service state

Add:

- last updated time;
- current queue state;
- honest response range, not a single promise;
- notification channel and privacy preview;
- “You can leave” explanation;
- update symptoms while waiting;
- cancel request;
- clinician unavailable;
- estimate changed;
- reassignment;
- refund or authorization release;
- support route;
- worsening-symptom safety interruption.

The reviewer-only delayed toggle should become a patient-visible state with a clear decision.

### 10. Establish clinician identity and authority

The clinician surface needs:

- full name;
- credential;
- role;
- treating professional entity;
- state authorization where relevant;
- accepted/reviewing/replied status;
- timestamp and time zone;
- profile/details affordance;
- clear “sample clinician” label in the public concept prototype.

Do not fabricate board certification or license details. Use verified data or explicit demonstration labels.

### 11. Complete the medication decision loop

“Medication appropriate” is not a finished workflow. Add:

- medication name;
- strength and dose;
- duration;
- instructions;
- warnings and allergy check;
- prescribing clinician;
- prescription status;
- chosen pharmacy;
- pharmacy confirmation;
- fulfillment issue;
- clinician clarification;
- declined-with-reason outcome;
- test-first outcome;
- no-medication care plan;
- side-effect and follow-up routes.

The decision must originate from a clinician-authored event, not a reviewer-state toggle.

### 12. Complete the testing loop

The signed plan recommends a rapid test but offers no direct way to complete it. Add:

- choose local lab, home kit, or outside result;
- price and coverage;
- order placed;
- appointment or shipment;
- sample collected;
- result received;
- unreadable or mismatched result;
- clinician review pending;
- result reviewed;
- plan amended;
- overdue review escalation.

The test result and amended plan should return to the same encounter timeline.

### 13. Make the care plan a real clinical artifact

The current care plan is visually strong but clinically vague. Add:

- clinician name and credential;
- signed timestamp and time zone;
- version status: draft, signed, amended, canceled;
- specific instructions rather than “follow Maya's instructions”;
- medication or test orders;
- follow-up window;
- escalation signs;
- included-message window;
- download/export;
- amendment history;
- source of each decision.

August may explain the signed plan but must link back to the clinician-authored source and must not add new medical advice.

### 14. Add a genuine August-handled route

The product promises four outcomes—emergency, unsupported, August-handled, and clinician-required—but the canonical symptom journey always recommends a clinician.

Prototype at least one low-risk information/self-care path with:

- bounded educational guidance;
- clear uncertainty;
- monitoring instructions;
- escalation signs;
- optional clinician route;
- scheduled follow-up;
- transition to clinician review if symptoms persist or worsen.

Clinical and legal owners must define what August may safely say.

## P2 — Product maturity and resilience

### 15. Error and recovery states

Prototype:

- offline;
- message failed or delayed;
- duplicate send;
- upload failed;
- unsupported or infected file;
- payment failed;
- identity verification failed;
- clinician unavailable;
- clinician reassigned;
- pharmacy unavailable;
- lab order not found;
- result not reviewed on time;
- session expired;
- abandoned intake resumed;
- duplicate encounter detected.

Every failure needs a next step, preserved work, and an accountable owner.

### 16. History and record access

The bottom navigation suggests Home, Visits, Updates, and August, but the canonical prototype does not prove these surfaces.

Add:

- encounter list;
- current status;
- clinician versus August authorship;
- submitted summary;
- consent receipt;
- signed plan;
- orders, prescriptions, and results;
- amendments;
- export;
- correction request;
- close versus reopen rules.

### 17. Cognitive accessibility

Automated accessibility coverage is strong. Add human validation for:

- stress and low health literacy;
- older adults;
- motor impairments;
- screen readers;
- 200–400% text;
- long medication names;
- long clinician names and credentials;
- localization;
- low connectivity;
- color-vision differences;
- emergency use while distracted or panicked.

Reduce decorative surfaces in urgent and transactional states. Use one primary decision per viewport.

### 18. Separate patient product from reviewer tooling

The root should feel like the patient product. Reviewer controls should live only in `/cases` or behind an explicit review mode.

For the public concept:

- label all names, portraits, prices, timestamps, and clinical content as demonstration data;
- avoid personalized “Parth” copy in the shareable patient route unless the interview setup explains it;
- keep the main walkthrough focused on one recommended design;
- move variation comparison and state simulation into the review hub.

## Revised experience architecture

```text
Care home
  → Intent and patient-written concern
  → Universal safety gate
  → Scope / age / care-for-self boundary
  → Adaptive intake
  → Route decision
      → Emergency action
      → Unsupported care + useful alternative
      → Bounded August guidance + follow-up
      → Clinician consultation
          → Source-linked pre-visit summary
          → Identity + current location
          → Provider + telehealth consent
          → Episode scope + payment authorization
          → Matching / accepted / reviewing
          → Clinician conversation
          → Medication / testing / no-medication / referral decision
          → Signed plan
          → Fulfillment or result loop
          → Follow-up
          → Close, reopen, or new episode
```

## Required state-model additions

### Safety

- `safety_checking`
- `safety_clarification`
- `emergency_action_available`
- `emergency_action_started`
- `emergency_exit_confirmed`
- `crisis_support`
- `poison_control`

### Eligibility and clinical relationship

- `scope_checking`
- `unsupported_age`
- `unsupported_location`
- `identity_required`
- `identity_failed`
- `provider_disclosed`
- `telehealth_consent_required`
- `consultation_submitted`
- `clinician_accepted`
- `clinical_relationship_started`

### Payment

- `price_disclosed`
- `payment_authorizing`
- `payment_authorized`
- `payment_failed`
- `charge_captured`
- `authorization_released`
- `refund_pending`
- `refund_complete`

### Async clinician care

- `matching`
- `delayed`
- `unavailable`
- `assigned`
- `accepted`
- `reviewing`
- `replied`
- `awaiting_patient`
- `reassigned`
- `canceled`

### Records and plans

- `summary_draft`
- `summary_confirmed`
- `summary_transferred`
- `plan_draft`
- `plan_signed`
- `plan_amended`
- `plan_canceled`
- `correction_requested`

### Uploads and orders

- `file_selecting`
- `uploading`
- `upload_failed`
- `processing`
- `low_confidence`
- `patient_correction`
- `confirmed`
- `shared`
- `order_placed`
- `scheduled`
- `result_received`
- `review_overdue`
- `result_reviewed`

## Screen-by-screen redesign

### Home

- Disable empty send.
- Make shortcuts intent starters, not hidden case generators.
- Put adult/U.S./non-emergency scope in progressive disclosure.
- Keep AI identity persistent.

### Safety

- Preserve the user's wording.
- Explain why the question is being asked.
- Clarify ambiguous answers.
- Support complaint-specific red flags without pretending a complete clinical triage protocol.

### Intake

- Show progress as purpose, not arbitrary question count.
- Allow “I don't know.”
- Let the patient correct earlier answers.
- Interrupt on new safety signals.

### Pre-visit summary

- Source-linked fields.
- Unanswered and conflicting fields.
- Field-level corrections.
- Explicit included/excluded transfer scope.
- No fabricated reassuring negatives.

### Eligibility and consent

- Separate care-for-self, age, identity, current location, service scope, provider disclosure, telehealth consent, and AI-data consent.

### Checkout

- Explain episode boundaries, additional costs, cancellation, acceptance, and refund.
- Use an authorization-versus-charge CTA that matches the real transaction.

### Matching and reviewing

- ETA range, last update, notification choice, cancellation, delay, unavailability, reassignment, and worsening-symptom routes.

### Clinician conversation

- Provider identity and credentials.
- Clear clinical-relationship-start event.
- Explicit message visibility.
- Draft preservation when switching to August.
- No August response inside the clinician channel.

### Plan and follow-up

- Signed clinical artifact with specific instructions and version history.
- Direct order/fulfillment actions.
- Follow-up window and episode-closure rules.
- Better/same/worse/side-effect/pharmacy-issue routes.

## Research plan

### Round 1 — Comprehension and trust

Recruit 5–7 adults across health literacy levels. Test:

- Who is August?
- Who is the clinician?
- When did medical care begin?
- What was shared?
- What did clinician review include?
- Can the patient safely leave while waiting?
- Which messages are private?

Target: at least 80% unaided comprehension for every authority, privacy, and care-episode question.

### Round 2 — Safety and recovery

Use scripted scenarios:

- mixed negative and danger signals;
- urgent medication request;
- self-harm language;
- upload-first;
- blocked eligibility or consent;
- no clinician available;
- delayed result;
- worsening follow-up.

Target: 100% of critical scenarios reach the intended safe state without losing the patient's work.

### Round 3 — Operational prototype

Test:

- notification return;
- clinician asks a question hours later;
- test ordered and result returned;
- prescription issue;
- plan amendment;
- correction request;
- encounter close versus reopen.

Measure completion, comprehension, trust, perceived fairness, abandonment, support need, and time-to-next-correct-action.

## Execution roadmap

### Sprint 0 — Product contract

- Decide channel model and MDI handoff.
- Define clinical-relationship start.
- Define adult, geographic, and service scope.
- Define the clinician episode, reassignment, and included follow-up.
- Approve safety responsibilities and escalation destinations.
- Map consumer AI data versus clinical record.

### Sprint 1 — Integrity and safety

- Universal safety middleware.
- Remove fabricated defaults.
- Source-linked fact model.
- Real upload fixture behavior.
- Summary correction model.
- Emergency-action truthfulness.

### Sprint 2 — Trustworthy handoff

- Identity and location verification states.
- Provider disclosure.
- Layered consent.
- Payment authorization.
- Matching, delay, unavailability, cancellation, and reassignment.
- Clinical-relationship-start event.

### Sprint 3 — Care completion

- Medication decision and fulfillment.
- Test order and result review.
- Signed/amended plan.
- Follow-up window.
- August-handled route.
- History and record access.

### Sprint 4 — Resilience and presentation

- Failure recovery.
- Cognitive-accessibility testing.
- Localization and long-content hardening.
- Separate patient and reviewer modes.
- Curate the interview walkthrough.

## Recommended interview story

Lead with one claim:

> August is a care-orchestration layer that turns patient-written context into the right next step while preserving safety, provenance, privacy, and human clinical authority.

Demonstrate:

1. Natural entry.
2. Universal safety interruption.
3. Source-linked pre-visit summary.
4. Explicit transfer and provider consent.
5. Honest asynchronous handoff.
6. Distinct clinician authority and private August explanation.
7. Signed decision with testing or medication workflow.
8. Follow-up that reopens the correct level of care.

Use edge cases to prove the system:

- emergency;
- controlled medication;
- upload-first without fabricated facts;
- no clinician available;
- payment failure;
- delayed result;
- medication declined;
- worsening follow-up.

## Definition of done

The prototype is principal-level when:

- no state invents a patient fact;
- every free-text surface can trigger safety routing;
- the AI/clinical operating model matches product terms and provider operations;
- the patient can explain who sees each message;
- the patient can explain when clinical care begins;
- every summary fact has provenance;
- every payment state explains acceptance, refund, and episode scope;
- every waiting state has an ETA range, update time, notification, and fallback;
- clinician identity and authority are explicit;
- medication and testing decisions complete their operational loops;
- signed records support version and amendment states;
- error states preserve work and provide a next action;
- the patient product contains no reviewer-only controls or unexplained demo data;
- critical comprehension and safety scenarios pass moderated testing.

## External review flags

This document is a product-design review, not legal or clinical advice. Confirm the final implementation with clinical, legal, privacy, security, operations, finance, and provider-network owners.

Relevant current references:

- August U.S. Terms of Service: https://www.meetaugust.ai/terms/us
- August U.S. Privacy Policy: https://www.meetaugust.ai/privacy/us
- HHS telehealth informed consent guidance: https://telehealth.hhs.gov/providers/preparing-patients-for-telehealth/obtaining-informed-consent
- FTC Health Breach Notification Rule: https://www.ftc.gov/legal-library/browse/rules/health-breach-notification-rule
- FTC mobile health app tool: https://www.ftc.gov/business-guidance/resources/mobile-health-apps-interactive-tool
- FDA Clinical Decision Support Software guidance: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework

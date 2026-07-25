# August AI Care Prototype PRD

## 1. Product Definition

August AI is a mobile healthcare chat experience that helps a patient move from an unstructured concern to the right next step: bounded AI guidance, emergency action, unsupported-care redirection, or licensed clinician care.

The product must feel like a calm care conversation, not a generic AI demo. The patient writes in their own words. August asks one useful question at a time, builds a structured clinical record in the background, performs safety routing, and hands the case to a clinician when required.

The central product promise is not "AI replaces the doctor." The promise is:

> August helps patients explain what is happening, prepares care safely, and makes the transition to a licensed clinician clear when clinical authority is required.

## 2. Why This Exists

Patients often do not know:

- Whether a concern is urgent.
- What information a clinician needs.
- Whether a prescription request is clinically appropriate.
- Whether they need a test, visit, pharmacy step, or self-care.
- Whether anyone is actually reviewing their case during async care.
- What to do while waiting.
- What happened after a clinician makes a decision.

August should reduce that uncertainty by making the care path visible.

## 3. Product Goals

1. Let patients begin naturally with symptoms, a doctor request, a prescription request, or an upload.
2. Collect enough information for safe routing without making the intake feel like a form.
3. Keep AI and human clinician authorship unmistakable.
4. Route urgent situations away from routine chat immediately.
5. Avoid unsupported-care dead ends by giving the safest next step.
6. Prepare a clinician-ready SOAP-style handoff.
7. Manage async clinician expectations honestly, from minutes to days.
8. Support prescription, test, no-prescription, referral, and follow-up outcomes.
9. Keep pricing flexible while making payment informed and non-misleading.
10. Produce an interview-ready prototype that shows interaction quality, safety thinking, and product maturity.

## 4. Non-Goals

- August does not diagnose as a clinician.
- August does not prescribe medication.
- August does not promise prescriptions, tests, or clinical outcomes.
- August does not hide that it is AI.
- August does not ask every possible clinical question in every encounter.
- The prototype does not claim legal, HIPAA, telehealth, prescribing, or clinical compliance. Compliance-sensitive decisions must be flagged for expert review.

## 5. Core Principles

### Human-Grade Chat, Not Robotic Chat

August should feel like a thoughtful care conversation, not a rigid chatbot or medical form.

The patient should be able to:

- Type naturally.
- Send photos or reports.
- Receive concise follow-up questions.
- Understand what August is checking.
- Wait for a doctor without feeling abandoned.
- Return later and continue from context.

August should avoid generic chatbot patterns:

- Repetitive empathy.
- Long disclaimers.
- Forced quick replies for clinical answers.
- "Please select one of the following" as the default.
- Apology language in declines.
- Instant recommendations before adequate intake.

The experience can feel human without pretending August is human.

### Authorship Is Always Visible

Every message or decision must identify its source:

- You: patient-written message.
- August AI: AI intake, explanation, preparation, routing, summary.
- Human clinician: licensed clinical judgment, prescriptions, test orders, care decisions.

August may explain a clinician's care plan, but it must not appear to be the prescribing or diagnosing entity.

### Free Text Is the Default

Clinical answers should feel like chat. The patient should type answers in their own words.

Structured controls are appropriate only when precision is required:

- Identity.
- Location/state.
- Date of birth or age.
- Consent.
- Payment.
- Pharmacy.
- Upload.
- Test selection.
- Safety confirmation when ambiguity would be dangerous.

### One Question at a Time

August should avoid long AI monologues. The conversational pattern should be:

1. Brief acknowledgement.
2. Concise reflection of relevant facts.
3. One clear question.
4. Short explanation only when it helps.

### No Liability-Admitting Apologies

Declines and unsupported states should be clear and respectful without saying "sorry."

Preferred:

> This type of care is not currently supported through August. The safest next step is...

Avoid:

- Sorry, we cannot help.
- Sorry, I cannot prescribe.
- We failed to help you.
- Your request was denied.
- Unfortunately.
- I apologize.

### Waiting Must Feel Alive

Async care can take two minutes or two days. The product must never feel frozen. It should show:

- Current state.
- Last update.
- Expected response window.
- Whether the patient can leave.
- What happens next.
- What to do if symptoms worsen.
- The ability to ask August for non-clinical explanation while waiting.

## 6. Current Prototype Scope Already Built

The current code prototype covers a focused mobile-only slice:

- Symptom entry.
- AI safety check.
- Free-text safety response.
- Medical intake.
- Patient-facing summary.
- Consent/payment handoff.
- Clinician matching.
- Human clinician chat.
- Ask August / History mode switch.
- Signed care plan.
- Emergency interruption.
- Unsupported controlled-medication path.
- Persistent bottom composer during chat.
- Constant bottom nav with August access on the bottom right.

The next design round should expand breadth and depth rather than replace this foundation.

## 7. Primary Users

### Patient With Symptoms

They may not know whether care is urgent, self-manageable, or clinician-required.

### Patient Asking for a Doctor

They already believe human care may be needed, but August still needs to collect medical context and safety information before handoff.

### Patient Asking for a Prescription

They may expect a direct refill or medication. August must gather clinical context and explain that a clinician decides whether a prescription is appropriate.

### Returning Patient

They may come back for follow-up, worsening symptoms, test results, pharmacy issues, side effects, or a new concern using prior context.

### Caregiver

They may ask about a parent, child, partner, or family member. August must clarify who the care is for and separate caregiver information from patient information.

## 8. Entry Scenarios

### Scenario A: "I Need a Doctor"

Flow:

1. Patient says they need a doctor.
2. August acknowledges and asks what is happening medically.
3. August performs safety screening.
4. August collects enough clinical context.
5. August checks eligibility and service scope.
6. August explains what will be shared.
7. Location, identity, consent, and payment are collected when required.
8. Clinician matching begins.
9. Patient sees realistic wait expectations.

Key product rule:

Even if the patient asks directly for a doctor, August still performs safety and intake before handoff.

### Scenario B: "I Need a Prescription"

Flow:

1. Patient asks for a prescription or refill.
2. August asks which medication and why.
3. August collects:
   - Current symptoms or condition.
   - Diagnosis history.
   - Dose.
   - Duration.
   - Last prescription.
   - Prior response.
   - Side effects.
   - Allergies.
   - Current medications.
   - Relevant safety details.
4. August explains that prescriptions require clinician assessment.
5. August determines whether the request is supported.
6. If supported, the case goes to a clinician.
7. Clinician decides whether prescription is appropriate.
8. August explains fulfillment or alternative next steps after clinician decision.

Recommended language:

> Before a clinician can consider this prescription, I need to understand what you're treating and how you're doing now.

Avoid:

- Your prescription is ready.
- August approved your prescription.
- Sorry, I can't prescribe.
- Payment guarantees medication.

### Scenario C: Patient Describes Symptoms

Flow:

1. Patient writes symptoms naturally.
2. August identifies the main concern.
3. August asks adaptive medical questions.
4. August updates the structured record.
5. August performs safety checks.
6. August routes to one of four outcomes:
   - Emergency.
   - Unsupported.
   - August-handled.
   - Clinician-required.

### Scenario D: Upload First

Flow:

1. Patient uploads prescription, report, photo, test result, or other document.
2. Product shows upload preview and status.
3. August confirms document type.
4. August extracts relevant information.
5. Patient confirms important extracted details.
6. August routes to explanation, intake continuation, or clinician review.
7. File is preserved in encounter history.

Visual and interaction requirements:

- Uploaded images/reports appear as patient-sent attachments.
- August shows a calm reading/retrieval state.
- August summarizes extracted information in plain text.
- The patient can confirm or correct key extracted details.
- Abnormal, unclear, or clinically significant results route to clinician review.

## 9. AI Medical Interview Requirements

August should adapt questions based on what is already known. Potential data fields:

- Primary concern.
- Patient goal.
- Symptom onset.
- Duration.
- Severity.
- Location.
- Pattern.
- Triggers.
- What helps.
- Associated symptoms.
- Red flags.
- Current medications.
- Requested medication.
- Allergies.
- Medical history.
- Pregnancy status when relevant.
- Prior diagnosis.
- Prior treatment.
- Prior testing.
- Recent changes.
- Uploads or photos.
- Current state/location.
- Age or date of birth.
- Caregiver relationship when relevant.

Do not ask all fields every time.

## 10. SOAP Note and Handoff Definition

August builds a structured clinician handoff in the background.

### Patient-Facing Summary

Shown as "What I'll share with the clinician." It should be friendly and reviewable:

- Sore throat for five days.
- Fever up to 101.5°F.
- Painful swallowing.
- Able to swallow liquids.
- Breathing normally.
- No medication allergies reported.
- Patient wants to know whether testing or treatment is needed.

### Clinician-Facing SOAP Structure

Subjective:

- Patient-stated concern.
- Timeline.
- Symptoms.
- Relevant negatives.
- Medication request.
- Patient goals.

Objective:

- Patient-reported temperature or vitals.
- Uploaded photos/documents.
- Test results.
- Medication bottle or prescription image.
- Any available measurements.

Assessment Context:

- Safety classification.
- Differential-relevant context.
- Service eligibility.
- Unsupported/scope flags.
- Do not present August as making final diagnosis.

Plan Context:

- Recommended clinician review reason.
- Open questions.
- Suggested next data to collect.
- Applicable clinical protocol.
- Consent/payment/location status.

Clinician packet includes:

- SOAP note.
- Complete transcript.
- Uploads.
- Red-flag answers.
- Allergies.
- Medications.
- State and eligibility.
- Protocol used.
- Payment/consent status.
- Unresolved questions.

## 11. Safety Routing

### Outcome 1: Emergency or Imminent Harm

Trigger examples:

- Trouble breathing.
- Severe chest pain.
- Fainting.
- Cannot swallow liquids.
- Severe allergic reaction.
- Suicidal or imminent self-harm language.
- Other clinically defined red flags.

Design requirements:

- Interrupt normal chat.
- Strong visual priority.
- Clear primary action: Call emergency services.
- Secondary action: Find nearest emergency department.
- No payment.
- No routine clinician matching.
- Preserve encounter record.
- Let the patient confirm they are taking action.

Copy direction:

> This may need emergency care now.

> Do not wait for a reply in this chat.

### Outcome 2: Unsupported Condition or Specialty

Examples:

- Controlled medication request not supported.
- Condition requiring in-person examination.
- Specialty unavailable.
- Service unavailable in the patient's state.

Design requirements:

- Explain limitation plainly.
- Avoid apology language.
- Recommend safest next step.
- Preserve collected information.
- Offer downloadable/reusable summary.
- Clarify whether urgent care, primary care, specialist care, or emergency care is appropriate.

### Outcome 3: August Can Handle

Requirements:

- Provide bounded guidance.
- State what the guidance is based on.
- Give self-care steps.
- Give monitoring instructions.
- Show escalation signs.
- Allow request for clinician review.
- Save summary.
- Schedule check-in when appropriate.

### Outcome 4: Clinician Required

Requirements:

- Explain why clinician review is recommended.
- Show what information will be shared.
- Collect missing eligibility/compliance data.
- Show expected response window.
- Explain price.
- Clarify async nature.
- Say what the patient can do while waiting.

## 12. Eligibility, Jurisdiction, and Compliance Gates

Collect progressively, only when required by the care pathway:

- Current location.
- State.
- Age/date of birth.
- Service availability.
- Clinician licensure.
- Identity verification.
- Government ID or driver's license when required.
- Telehealth consent.
- Privacy acknowledgement.
- Pharmacy location.
- Clinical protocol.
- Payment.

These are design requirements, not legal conclusions. Legal and clinical reviewers must validate exact requirements by state, condition, medication, and partner workflow.

## 13. Pricing Architecture

Pricing is unresolved and should remain flexible.

Candidate models:

- $40 upfront for clinician review.
- $20 now, additional fee as clinician visits or follow-ups occur.
- Pay only if clinician review is needed.
- Membership.
- Per-visit payment.
- Tests and fulfillment priced separately.
- Prescription fulfillment as a separate checkout path.

Product requirements:

- Do not ask for payment before the user understands the likely care path.
- Do not imply payment guarantees a prescription.
- Separate clinician review cost from medication, lab, test, pharmacy, or fulfillment costs.
- Clearly state refund/cancellation rules.
- Support alternative pricing without changing the clinical flow.

Recommended near-term prototype model:

- Show a neutral "Visit review" payment step after August recommends clinician review and confirms availability.
- Display price as configurable.
- Add copy: "Clinician review does not guarantee a prescription."
- Treat labs, pharmacy, and fulfillment as separate cost surfaces.

Open pricing question:

Should August charge a single clear upfront fee, or should it use a lower initial payment with additional charges as care escalates? The single fee is simpler and feels more trustworthy; staged pricing may reduce conversion friction but risks confusion unless the included/excluded services are very explicit.

## 14. Waiting and Async Care

Status progression:

1. Preparing your case.
2. Checking eligibility.
3. Finding a clinician licensed in your state.
4. Clinician assigned.
5. Clinician reviewing.
6. Waiting for clinician response.
7. Clinician asked a question.
8. Waiting for your response.
9. Clinician reviewing your answer.
10. Decision ready.

Waiting screen must show:

- Current status.
- Last update.
- Expected response window.
- Whether patient can leave.
- Notification behavior.
- What to do if symptoms worsen.
- Submitted summary access.
- August explanation access.

Avoid fake precise countdowns unless operationally guaranteed.

Doctor chat should intentionally communicate that a real clinician may take time:

- Doctor reviewing summary.
- Expected response window.
- Timestamps.
- Waiting for clinician.
- Waiting for patient.
- Clinician reviewing answer.
- Care plan ready.

The patient should be able to leave and return without losing context.

## 15. Human Clinician Experience

When clinician joins:

- Conversation surface changes enough to signal human care.
- Header shows clinician name and credentials.
- "Human clinician" label is visible.
- License/profile information is accessible.
- Earlier August history remains available.
- Patient does not repeat information.
- Timestamps appear on clinician messages.

Clinician can:

- Ask follow-up question.
- Request photo/document.
- Recommend prescription.
- Decline prescription.
- Order test.
- Ask for external test/result upload.
- Recommend urgent in-person care.
- Recommend specialist care.
- Provide care plan.
- Close encounter.
- Schedule follow-up.

Mode model:

- Dr. Rao: active clinician conversation.
- Ask August: AI explanation or question prep.
- History: unified encounter timeline.

When using Ask August during clinician care, show:

> August can explain information and help prepare questions. Your clinician makes clinical decisions.

## 16. Clinical Outcomes

### A. Prescription Appropriate

Show:

- Medication name.
- Dose.
- Frequency.
- Duration.
- Instructions.
- Warnings.
- Prescribing clinician.
- Date/time.
- Pharmacy.
- Fulfillment status.
- Price where relevant.
- Ability to change pharmacy before submission when allowed.

Fulfillment options:

- August-supported fulfillment.
- Send to chosen pharmacy.
- Patient obtains independently when appropriate.

Statuses:

- Prescription being prepared.
- Sent to pharmacy.
- Pharmacy confirmed receipt.
- Ready for pickup.
- Fulfillment issue.
- Clinician clarification required.

### B. Test or Lab Required

Support:

- Test ordered through August.
- External test completed and uploaded.

Show:

- Test name.
- Why requested.
- Prep instructions.
- Location or kit path.
- Expected timing.
- Upload action.
- Clinician review state.
- Result summary.
- Next action.

Lifecycle:

- Recommended.
- Ordered.
- Scheduled.
- Kit shipped.
- Sample collected.
- Processing.
- Result available.
- August explanation available.
- Clinician review required.
- Clinician reviewed.
- Follow-up plan ready.

Abnormal, uncertain, or clinically significant findings route back to clinician.

### C. No Prescription or Different Care

This is not a failure screen.

Show:

- Clinician reasoning in plain language.
- Alternative treatment/self-care.
- Referral.
- In-person evaluation recommendation.
- Testing recommendation.
- Escalation signs.
- Follow-up timing.

## 17. Care Plan

Care plan includes:

- What was decided.
- Who made the decision.
- What to do today.
- Medications.
- Tests.
- Pharmacy.
- Monitoring.
- Follow-up.
- Escalation signs.
- Open questions.
- Attached documents.
- Clinician details.
- Ask August to explain.
- Message clinician when allowed.

Clearly separate:

- Clinician-authored decision.
- August-generated explanation.

## 18. Follow-Up

Possible follow-up states:

- Medication started.
- Side effect.
- Symptoms improved.
- Symptoms unchanged.
- Symptoms worsened.
- Test completed.
- Result uploaded.
- Clinician review pending.
- New symptom.
- Patient did not respond.
- Pharmacy issue.
- Prescription unavailable.
- Referral not completed.
- Encounter complete.

August should proactively check back when clinically or operationally appropriate:

- After a care plan.
- After a medication starts.
- After an expected improvement window.
- After a test is ordered.
- After a result is uploaded.
- After a pharmacy issue.

Check-back prompts should be short and concrete, for example:

> How is your throat today: better, the same, or worse?

The answer routes back into safety, clinician review, test workflow, pharmacy workflow, or closure.

Follow-up routing:

- Emergency action.
- August guidance.
- Same clinician conversation when available.
- New clinician review.
- Test workflow.
- Pharmacy workflow.

Tone rule:

Do not repeat dramatic emotional language. Stay calm, concrete, and adaptive.

## 19. Caregiver Flow

If user asks about someone else:

1. Clarify who care is for.
2. Clarify relationship.
3. Confirm authorization/consent requirements.
4. Create or select separate patient context.
5. Keep caregiver and patient data distinct.
6. Continue intake for the correct person.

Do not merge multiple people's medical information into one encounter.

## 20. Navigation and Interface Definition

Mobile-only prototype, 390 x 844 target viewport.

Current product direction:

- Warm white background.
- Forest green primary actions.
- Mint/sage support surfaces.
- Poppins typography.
- Glass only where it helps layering.
- Patient messages in forest green.
- August messages as plain conversational text or light AI surface depending on context.
- Clinician messages in distinct human-care surfaces.
- Care header as a focused top island.
- Constant bottom nav outside active content.
- August access on the bottom-right.
- Composer stays visible in chat contexts.

Bottom nav does not need full functionality in the prototype, but it must visually establish app architecture:

- Home.
- Visits.
- Updates.
- August.

## 21. Component Inventory

Reusable components required:

- Top care header.
- Back control.
- Bottom nav.
- August access tab.
- Patient message.
- August AI message.
- Clinician message.
- System event.
- Safety banner.
- Emergency action.
- Waiting status.
- Care progress tracker.
- Message composer.
- Attachment uploader.
- Upload preview.
- Consent card.
- Identity verification card.
- Payment card.
- Clinician profile card.
- SOAP summary preview.
- Pharmacy selector.
- Prescription card.
- Test order card.
- Result card.
- Care plan card.
- Follow-up card.
- Decline/alternative-care card.
- Empty state.
- Error state.
- Offline state.
- Notification permission card.
- Modal/bottom sheet.
- Confirmation screen.
- History timeline.
- Mode switch.

Component states:

- Default.
- Pressed.
- Focused.
- Disabled.
- Loading.
- Success.
- Error.
- Selected.
- Unselected.
- Read.
- Unread.
- Pending.
- Completed.
- Expired.

## 22. Screen Inventory

### Foundation and Entry

1. Welcome/start.
2. New concern entry.
3. Returning patient.
4. Symptom entry.
5. Doctor request.
6. Prescription request.
7. Upload entry.

### AI Intake

8. August acknowledgement.
9. Medical interview question.
10. Patient free-text answer.
11. Safety question.
12. Medication history.
13. Allergy question.
14. Upload requested.
15. Upload preview.
16. Updating summary.
17. Patient-facing summary.
18. SOAP handoff preview.

### Safety and Scope

19. Emergency interruption.
20. Emergency confirmation.
21. Unsupported-care explanation.
22. Alternative-care recommendation.
23. August-handled care plan.
24. Optional clinician review.

### Clinician Preparation

25. Location/state.
26. Service availability.
27. Identity verification.
28. Telehealth consent.
29. Pharmacy selection.
30. Pricing explanation.
31. Payment.
32. Handoff confirmation.
33. Case submitted.

### Waiting

34. Matching clinician.
35. Clinician assigned.
36. Clinician reviewing.
37. Extended wait.
38. Clinician asked question.
39. Waiting for patient.
40. Symptoms worsened while waiting.

### Human Clinician Chat

41. Clinician introduction.
42. Clinician follow-up.
43. Patient response.
44. Clinician requests attachment.
45. Patient uploads attachment.
46. Ask August mode.
47. August explanation.
48. Unified history.

### Clinical Outcomes

49. Prescription proposed.
50. Prescription confirmed.
51. Pharmacy confirmation.
52. Prescription sent.
53. Fulfillment issue.
54. Test recommended.
55. Test order.
56. External test instructions.
57. Result upload.
58. Result processing.
59. Result ready.
60. Clinician reviewing result.
61. No-prescription care plan.
62. Referral/in-person recommendation.

### Care Plan and Follow-Up

63. Unified care plan.
64. Ask August to explain.
65. Message clinician.
66. Follow-up due.
67. Symptoms improved.
68. Symptoms unchanged.
69. Symptoms worsened.
70. Medication side effect.
71. Pharmacy issue.
72. New concern using prior context.
73. Encounter complete.
74. Care history.
75. Encounter detail/audit timeline.

### Errors and Edge States

76. Network unavailable.
77. Message failed.
78. Upload failed.
79. Unsupported file.
80. Clinician unavailable.
81. Service unavailable in state.
82. Payment failed.
83. Identity verification failed.
84. Pharmacy unavailable.
85. Prescription changed.
86. Order canceled.
87. Patient leaves during intake.
88. Session resumes.
89. Duplicate encounter detected.
90. Caregiver clarification.

## 23. Prototype Flows

### Flow 1: August-Handled Symptom

Symptoms -> AI intake -> safety screening -> August can handle -> self-care plan -> follow-up -> improved -> complete.

### Flow 2: Prescription With Clinician

Prescription request -> clinical context -> supported -> eligibility -> consent/payment -> clinician matching -> clinician questions -> prescription appropriate -> pharmacy -> prescription sent -> care plan -> follow-up.

### Flow 3: Prescription Declined

Prescription request -> assessment -> clinician review -> prescription not appropriate -> reasoning -> alternative plan -> follow-up.

### Flow 4: Testing Path

Symptoms -> intake -> clinician review -> test recommended -> order or upload -> result processing -> clinician review -> care plan -> follow-up.

### Flow 5: Emergency

Danger sign -> emergency classification -> routine flow stops -> emergency action -> confirmation/exit.

### Flow 6: Unsupported Care

Unsupported request -> enough intake to classify -> explanation -> alternative -> downloadable summary -> exit/referral.

### Flow 7: Async Waiting

Handoff -> matching -> long wait -> status updates -> patient leaves -> notification -> clinician asks follow-up -> patient returns -> conversation continues.

### Flow 8: Worsening After Care

Care plan -> follow-up -> worsening -> safety assessment -> emergency, clinician review, or revised care plan.

### Flow 9: Caregiver

Family-member request -> clarify patient -> consent/authorization -> separate context -> intake -> routing.

## 24. Copy System

Voice:

- Calm.
- Clear.
- Direct.
- Attentive.
- Clinically responsible.
- Respectful.
- Human, without pretending to be human.

Avoid:

- "As an AI language model."
- "Sorry."
- "Don't worry."
- "Everything will be okay."
- "This is definitely..."
- Generic empathy in every message.
- Overly cheerful medical language.
- Guaranteed prescriptions.
- Long disclaimers.

Example safety question:

> Before we continue, are you having trouble breathing, unable to swallow liquids, fainting, or having severe chest pain right now?

Example prescription framing:

> Before a clinician can consider this prescription, I need to understand what you're treating and how you're doing now.

Example unsupported framing:

> This type of care is not currently supported through August. The safest next step is to contact your current prescriber or primary care clinician.

## 25. Accessibility Requirements

- Body copy must remain readable.
- Legal text should not be smaller than 12 px in production design.
- Strong contrast over glass surfaces.
- Touch targets should be large enough for mobile use.
- Medical status cannot rely on color alone.
- Focus, pressed, disabled, and loading states visible.
- Screen-reader-friendly labels.
- Errors appear near related controls.
- Reduced-motion compatible.
- Emergency actions do not auto-dismiss.
- Long patient messages and large text settings do not break layout.

## 26. Compliance-Sensitive Areas to Flag

Require legal, clinical, operational, or compliance review:

- AI disclosure.
- Clinician disclosure.
- Telehealth consent.
- HIPAA/privacy handling.
- State licensure.
- Patient identity requirements.
- Driver's license or government ID requirements.
- Pharmacy workflows.
- Prescription authority.
- Test-order authority.
- Medical record access.
- Audit history.
- Caregiver authorization.
- Data retention.
- Emergency routing language.
- Payment/refund language.
- Notification privacy.
- Upload privacy.
- Clinician signature visibility.

## 27. Open Product Decisions

- Final pricing model.
- Whether clinician review is included in membership.
- When payment occurs.
- Response-time commitments.
- Supported states.
- Supported conditions.
- Supported prescription categories.
- Identity verification requirements.
- Pharmacy partner.
- Medication fulfillment partner.
- Test-ordering partner.
- Clinician follow-up period.
- Whether completed encounters can reopen.
- Caregiver authorization rules.
- Notification channels.
- Record-retention rules.
- Exact emergency language by jurisdiction.
- Exact legal/medical disclaimers.

## 28. Recommended Next Prototype Expansion

The current prototype should expand in this order:

1. Add entry branches for "I need a doctor" and "I need a prescription."
2. Add SOAP handoff preview and clinician packet.
3. Add prescription outcome: appropriate, declined, fulfillment issue.
4. Add test/lab path with upload and result review.
5. Add async waiting depth: long wait, notification, clinician asks follow-up.
6. Add August-handled self-care path.
7. Add caregiver clarification.
8. Add error/recovery states.
9. Refine pricing step as a configurable neutral payment architecture.

## 29. Definition of Done

The product direction is ready for design/prototype execution when:

- Mobile-only scope is preserved.
- August visual system is preserved.
- Authorship is visible everywhere.
- Patient clinical answers are primarily free text.
- No prescription is promised before clinician review.
- Emergency routing interrupts the normal flow.
- Unsupported care gives a useful next step.
- SOAP handoff is represented.
- Clinician review is clearly human-authored.
- Waiting can represent minutes to days.
- Pricing is flexible and non-misleading.
- Identity, state, consent, payment, pharmacy, and compliance gates are placed progressively.
- Prescription approval and decline are both represented.
- Test/order/upload/result workflows are represented.
- Follow-up can route back to safety, clinician, test, pharmacy, or new concern.
- Caregiver context keeps records separate.
- Buttons do not dead-end.
- No important screen contains placeholder copy.
- Legal and clinical review items are explicitly flagged.

## 30. Interview Narrative

This design should demonstrate that August is not just a pretty healthcare chatbot. It is a system for:

- Gathering useful medical context.
- Protecting patients when symptoms may be urgent.
- Avoiding premature prescription promises.
- Translating messy patient language into clinician-ready structure.
- Keeping AI and human authority separate.
- Making async care feel continuous.
- Turning clinical decisions into plain-language next steps.

The strongest presentation angle is:

> I designed August as a care orchestration conversation, not as an AI answer box. The key challenge is not only making chat look premium. It is making safety, authorship, clinician authority, waiting, pricing, and follow-up understandable inside one mobile experience.

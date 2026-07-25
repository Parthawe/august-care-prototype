# August AI Master Design Document

## 1. Purpose

This document is the source of truth for the August AI design exercise before creating more Paper screens or expanding the code prototype.

It combines:

- The product definition.
- The designer problem statement.
- The visual direction.
- The chat interaction model.
- The AI-to-clinician handoff.
- The async doctor experience.
- Report/photo upload behavior.
- Follow-up and check-back behavior.
- Safety, compliance, and liability-sensitive rules.
- Information architecture, user journeys, user flows, and edge cases.
- August design-system replication guidance.
- What needs to be drawn in Paper.
- What needs to be represented in the prototype.

The goal is to create a healthcare chat product that feels human, premium, and useful without blurring the line between August AI and a licensed clinician.

Companion docs:

- `august-ai-prd.md`: product requirements and full state inventory.
- `chat-visual-interaction-research.md`: chat interaction and visual behavior.
- `product-design-arsenal.md`: IA, journeys, flows, edge cases, and August design-system audit.

## 2. The Design Test Problem

The problem is not "make a healthcare chatbot."

The problem is:

> Design a mobile care conversation where August feels as easy and natural as messaging someone, but the patient always understands when they are talking to AI, when a doctor is involved, what is happening in the background, what they are waiting for, and what to do if the situation becomes unsafe.

The prototype needs to prove that August can handle complexity:

- Natural chat.
- Safety triage.
- Clinical intake.
- Doctor handoff.
- Async waiting.
- Prescriptions.
- Prescription declines.
- Tests and uploaded reports.
- Care plans.
- Follow-up.
- Unsupported care.
- Emergency exits.

The design should not feel robotic, bureaucratic, or like a rigid chatbot decision tree. It should feel like care unfolding through a conversation.

## 3. Product Thesis

August is not an AI answer box.

August is a care orchestration layer.

It helps the patient:

1. Say what is going on in their own words.
2. Answer the right follow-up questions.
3. Avoid unsafe routine-chat paths when symptoms may be urgent.
4. Turn messy patient language into a clinician-ready handoff.
5. Understand when and why a clinician is needed.
6. Wait for clinician review without feeling abandoned.
7. Understand prescriptions, tests, declines, and care plans.
8. Return later for follow-up without starting from scratch.

The strongest interview narrative is:

> I designed August as a continuous care conversation, not as a chatbot. The key challenge is making safety, authorship, clinician authority, waiting, reports, pricing, and follow-up understandable inside one premium mobile thread.

## 4. North Star Experience

The patient opens August and sees a calm home screen:

- "Good morning, Parth."
- "Ask August anything."
- A clear composer.
- A few relevant care shortcuts.
- Bottom nav with August on the right.

They type naturally:

> My throat has hurt for five days and I have a fever.

August does not jump to advice. It asks a few careful questions:

1. Safety.
2. Symptom detail.
3. Medical context.

Then August explains the next step:

> A clinician should review this because fever with five days of throat pain may need testing or treatment.

The patient reviews what August collected, consents, pays if needed, and waits.

The doctor does not reply instantly. The product shows that the doctor is reviewing, gives a response window, and lets the patient leave. When the doctor joins, the visual environment shifts. A real doctor profile appears. The same thread continues.

The patient can talk to the doctor, ask August to explain, upload a report or image, and receive a care plan. Later, August checks back.

## 5. Guiding Principles

### 5.1 Human-Feeling, Not Human-Impersonating

The product should feel like messaging, but August must not pretend to be a person or clinician.

Do:

- Write concise, natural questions.
- Use patient free text as the default.
- Let patients send images and reports.
- Reflect useful context.
- Keep August present and calm.

Do not:

- Make August over-emotional.
- Use fake human typing behaviors excessively.
- Hide AI identity.
- Let August make clinician decisions.
- Make every AI answer a big bot bubble.

### 5.2 Authorship Before Aesthetics

Every message must answer:

- Who wrote this?
- What authority do they have?
- Can I act on this?

Authors:

- Patient: "You."
- August AI: "August AI."
- Clinician: name, credentials, human clinician label.

### 5.3 Free Text First, Controls When Needed

Clinical answers should default to typing.

Use controls for:

- Consent.
- Payment.
- Identity.
- Location/state.
- Pharmacy.
- Upload.
- File type.
- Medication dose confirmation.
- Lab/test selection.
- Safety confirmation when ambiguity is dangerous.

### 5.4 Three Questions Before Recommendation

August should ask at least three meaningful questions before suggesting a non-emergency next step.

Exceptions:

- Emergency red flag.
- Clearly unsupported care with enough information.
- Nonclinical/admin question.
- Clinician already active and August is only explaining.

The three-question rule prevents August from feeling shallow or reckless.

### 5.5 No Apology-Liability Language

Avoid:

- Sorry.
- Unfortunately.
- I apologize.
- We cannot help you.
- Your request was denied.

Use:

- "This type of care is not currently supported through August."
- "A clinician needs to review this before a prescription can be considered."
- "The safest next step is..."
- "This may need emergency care now."

The tone should be warm, but precise.

### 5.6 Waiting Is a Product State

Waiting is not empty space. It is part of care.

The product should show:

- Current status.
- Last update.
- Expected response window.
- What the doctor is doing.
- Whether the patient can leave.
- How notifications work.
- What to do if symptoms worsen.
- What August can help explain while waiting.

### 5.7 Reports Become Conversation

Uploaded reports, photos, and prescription images should not feel like a file manager. They should become part of the chat.

The patient sends the image. August reads it, summarizes key information as text, asks for confirmation, and updates the encounter.

## 6. External Research Anchors

These references inform the direction. They do not make the design legally or clinically compliant.

- The American Medical Association frames healthcare AI as "augmented intelligence," emphasizing assistive use that enhances rather than replaces physicians, and notes that AI use in healthcare must be transparent to physicians and patients: https://www.ama-assn.org/practice-management/digital-health/augmented-intelligence-medicine
- WHO guidance on AI for health emphasizes ethics, human rights, governance, accountability, and healthcare-worker/community impact: https://www.who.int/publications/i/item/9789240029200
- HHS Telehealth guidance says informed consent requirements vary by state and recommends documenting consent before or during telehealth visits: https://telehealth.hhs.gov/providers/preparing-patients-for-telehealth/obtaining-informed-consent
- HHS health-app developer guidance highlights privacy/security protections and points developers to HIPAA, FTC, FDA, COPPA, and other potentially applicable regimes: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html
- FDA transparency principles for machine-learning-enabled medical devices emphasize clear, essential information, human-AI team performance, timing, audience, workflow, and whether AI informs or replaces clinical judgment: https://www.fda.gov/medical-devices/software-medical-device-samd/transparency-machine-learning-enabled-medical-devices-guiding-principles
- Nielsen Norman Group research on AI chatbots highlights handoff willingness, flexibility within guardrails, proactivity, emotional responsiveness, and transparency: https://www.nngroup.com/articles/dimensions-of-ai-chatbots/
- Nielsen Norman Group chatbot UX guidance supports transparency, mixed input methods, context preservation, typo/ambiguity tolerance, and human escape hatches: https://www.nngroup.com/articles/chatbots/

## 7. App Architecture

### 7.1 Home

Home is the front door to care.

Required elements:

- Greeting: "Good morning, Parth."
- Primary prompt: "Ask August anything."
- Composer: "Describe what's going on..."
- Context cards:
  - Continue a visit.
  - Upload a result.
  - Medication question.
  - Follow-up due.
- Bottom nav:
  - Home.
  - Visits.
  - Updates.
  - August.

August should sit on the bottom-right of the nav. This signals that August is always accessible.

### 7.2 Encounter Thread

An encounter is the main care object. It contains:

- Patient messages.
- August messages.
- Doctor messages.
- System events.
- Uploaded files.
- Extracted facts.
- Safety checks.
- SOAP handoff.
- Consent/payment events.
- Tests.
- Prescriptions.
- Care plan.
- Follow-up.

The thread should be continuous. Do not create disconnected chats for August and doctor.

### 7.3 Modes Inside an Encounter

Modes:

- August intake.
- Preparing clinician visit.
- Matching clinician.
- Clinician reviewing.
- Dr. Rao.
- Ask August.
- History.
- Care plan.
- Follow-up.

The header and composer should change by mode.

## 8. Visual System

### 8.1 Overall Feel

Premium, calm, healthcare-specific.

Use:

- Warm white base.
- Deep forest green.
- Mid August green.
- Mint and sage support tones.
- Poppins.
- Soft glass layers.
- Thin green-tinted borders.
- Subtle noise.
- Gentle depth.

Avoid:

- Neon.
- Heavy gradients.
- Over-glassmorphism.
- Too many cards.
- Tiny unreadable labels.
- Dense dashboard UI.
- Generic chatbot bubbles everywhere.

### 8.2 Visual Layering

Layers:

1. Phone/system frame.
2. App background.
3. Top care island/header.
4. Conversation content.
5. Structured care objects.
6. Composer.
7. Bottom nav.
8. Emergency overlay when needed.

### 8.3 Message Styles

Patient:

- Forest-green bubble.
- White text.
- Right aligned.
- Clear "You" label.

August AI:

- Plain text on canvas.
- No heavy bubble for normal replies.
- "August AI" label.
- Deep green text.
- Use small status/identity treatment.

Doctor:

- Distinct white or warm clinical surface.
- Doctor photo/avatar.
- Name and credentials.
- Human clinician label.
- Timestamp.
- Left aligned.
- Background segment shift when doctor enters.

System event:

- Centered or timeline-style marker.
- Small but legible.
- Not a chat bubble.

Structured object:

- Card only when the content is an object:
  - Summary.
  - SOAP preview.
  - Consent.
  - Payment.
  - Upload.
  - Prescription.
  - Test.
  - Care plan.
  - Emergency action.

## 9. Conversation Model

### 9.1 Starting the Chat

Patient can start with:

- Symptoms.
- "I need a doctor."
- "I need a prescription."
- Upload/report.
- Follow-up.
- General question.

August should accept messy natural language.

### 9.2 Intake Behavior

August should:

- Identify the primary concern.
- Ask safety first when medically relevant.
- Ask one question at a time.
- Ask at least three questions before non-emergency recommendation.
- Update the care summary quietly.
- Avoid over-explaining.
- Avoid instant diagnosis.

### 9.3 Example Intake

Patient:

> My throat has hurt for five days and I have a fever.

August:

> I’ll check safety first. Are you having trouble breathing, unable to swallow liquids, fainting, or having severe chest pain right now?

Patient:

> No, none of those.

August:

> What was your highest temperature, and can you swallow liquids normally?

Patient:

> 101.5 last night. Swallowing hurts but I can drink water.

August:

> Any medication allergies, or recent exposure to someone with strep?

Patient:

> No allergies. My roommate had strep last week.

August:

> A clinician should review this because fever, five days of throat pain, and possible strep exposure may need testing or treatment.

## 10. Doctor Handoff Model

### 10.1 Why One Shared Thread

Use one encounter thread, not separate chats.

Reasons:

- The patient sees continuity.
- The clinician does not feel bolted on.
- August can explain without replacing clinician judgment.
- History remains auditable.
- The handoff is visible.

### 10.2 Doctor Entry Moment

When doctor enters:

- Add system event: "Dr. Maya Rao joined."
- Shift background subtly.
- Show doctor photo.
- Show credentials.
- Show "Human clinician."
- Show license context.
- Show reviewing status before first reply.

Doctor intro:

> I’m Dr. Rao. I reviewed your sore throat, fever, and safety answers. I may ask one or two questions before recommending next steps.

### 10.3 Doctor Takes Time

The doctor should not feel instantly available.

Required states:

- Preparing your case.
- Finding a clinician licensed in your state.
- Dr. Rao assigned.
- Dr. Rao is reviewing your summary.
- Expected response: 30-60 minutes.
- You can leave this screen.
- We’ll notify you.
- Dr. Rao asked a follow-up question.
- Waiting for your response.
- Dr. Rao is reviewing your answer.
- Care plan ready.

### 10.4 Ask August During Doctor Care

Mode switch:

- Dr. Rao.
- Ask August.
- History.

Ask August can:

- Explain doctor messages.
- Prepare questions.
- Summarize current status.
- Explain care plan.
- Explain tests in plain language.
- Help interpret report summaries with boundaries.

Ask August cannot:

- Make clinical decisions.
- Override doctor.
- Prescribe.
- Diagnose.
- Change care plan.

Disclosure:

> August can explain information and help prepare questions. Dr. Rao makes clinical decisions.

## 11. Prescription Flow

### 11.1 Prescription Request Is Not a Shortcut

If the patient says "I need a prescription," August must not promise medication.

August should ask:

- Which medication?
- What are you treating?
- Current symptoms.
- Diagnosis history.
- Dose.
- Duration.
- Last prescription.
- Prior response.
- Side effects.
- Allergies.
- Current medications.
- Safety information.

Copy:

> Before a clinician can consider this prescription, I need to understand what you’re treating and how you’re doing now.

### 11.2 Prescription Approved by Clinician

Show:

- Medication name.
- Dose.
- Instructions.
- Warnings.
- Prescribing clinician.
- Pharmacy.
- Fulfillment option.
- Status.

Statuses:

- Prescription being prepared.
- Sent to pharmacy.
- Pharmacy confirmed receipt.
- Ready for pickup.
- Fulfillment issue.
- Clinician clarification required.

### 11.3 Prescription Declined

Decline should not feel like a failure screen.

Show:

- Clinician decision.
- Plain-language reasoning.
- Alternative plan.
- Escalation signs.
- Follow-up.

Avoid:

- Sorry.
- Denied.
- We cannot help.

Use:

> Dr. Rao does not recommend this medication for this visit. The safer next step is...

## 12. Tests, Reports, and Uploads

### 12.1 Upload Types

Support:

- Lab report.
- Test result.
- Prescription photo.
- Medication bottle.
- Symptom photo.
- Insurance/pharmacy document when relevant.

### 12.2 Upload Interaction

Flow:

1. Patient taps attach.
2. Patient selects/takes photo or uploads document.
3. Attachment appears as patient message.
4. Upload progress appears.
5. Status: "Reading the report."
6. August summarizes key findings in plain text.
7. Patient confirms extracted facts.
8. Summary updates.
9. If needed, clinician review starts.

Example:

> I found a rapid strep result marked negative from today. Does that match what you uploaded?

### 12.3 Report Analysis Boundary

August can:

- Extract text.
- Summarize results.
- Explain what values usually refer to.
- Ask patient to confirm.
- Prepare clinician packet.

August should route to clinician when:

- Result is abnormal.
- Result is unclear.
- Result is clinically significant.
- Result conflicts with symptoms.
- Patient asks what treatment decision to make.

## 13. SOAP and Clinical Record

August builds structured data in the background.

### 13.1 Patient View

"What I’ll share with the clinician"

- Friendly.
- Editable.
- Concise.
- Built from patient answers.

### 13.2 Clinician View

SOAP packet:

- Subjective.
- Objective.
- Assessment context.
- Plan context.

Also includes:

- Transcript.
- Uploads.
- Safety answers.
- Allergies.
- Medications.
- Location/state.
- Consent.
- Payment.
- Protocol.
- Open questions.

### 13.3 Important Boundary

August may prepare assessment context, but it should not present final diagnosis or treatment plan as AI-authored.

## 14. Safety and Routing

### 14.1 Emergency

Emergency interrupts the normal flow.

Triggers include:

- Trouble breathing.
- Cannot swallow liquids.
- Severe chest pain.
- Fainting.
- Severe allergic reaction.
- Imminent self-harm.
- Other clinical red flags.

Design:

- Strong safety screen.
- Primary: Call emergency services.
- Secondary: Find nearest emergency department.
- No payment.
- No normal doctor matching.
- Preserve record.

Copy:

> This may need emergency care now.

### 14.2 Unsupported Care

Unsupported care gives a next step.

Examples:

- Unsupported specialty.
- Unsupported state.
- Controlled medication request.
- Condition needs in-person exam.

Copy:

> This type of care is not currently supported through August. The safest next step is...

### 14.3 August Can Handle

For low-risk situations:

- Self-care guidance.
- Monitoring.
- Escalation triggers.
- Optional clinician review.
- Follow-up.

### 14.4 Clinician Required

For cases needing clinical decision:

- Explain why.
- Show what will be shared.
- Gather compliance data.
- Payment.
- Waiting.
- Doctor joins.

## 15. Pricing and Payment

Pricing is unresolved. The design should support multiple models.

Options:

- $40 upfront.
- $20 now, additional charge later.
- Pay only if clinician needed.
- Membership.
- Per-visit.
- Separate test/pharmacy/fulfillment costs.

Recommendation for prototype:

- Show payment only after clinician review is recommended and service availability is confirmed.
- Use a neutral "Visit review" payment step.
- Make price configurable.
- State that payment does not guarantee prescription.
- Separate medication/test/fulfillment costs.

Design copy:

> This covers clinician review. Prescriptions, tests, or pharmacy costs may be separate.

## 16. Follow-Up and Check-Back

August should return after the main care event.

Follow-up moments:

- After care plan.
- After medication starts.
- After test ordered.
- After result uploaded.
- After expected improvement window.
- After pharmacy issue.
- After patient does not respond.

Example prompts:

- "How is your throat today: better, the same, or worse?"
- "Did you complete the test?"
- "Any side effects since starting the medication?"
- "Your result is ready. I can summarize it before Dr. Rao reviews."

Routing:

- Better -> close loop.
- Same -> monitor or clinician follow-up.
- Worse -> safety check.
- Side effect -> clinician/safety.
- Result uploaded -> summarize and route.
- Pharmacy issue -> fulfillment support.

## 17. Caregiver Flow

If the user asks about someone else:

1. Ask who the care is for.
2. Ask relationship.
3. Explain authorization/consent needs.
4. Create/select separate patient context.
5. Keep records separate.

Do not merge caregiver and patient records.

## 18. Paper Blueprint

Paper should contain a complete, editable mobile product design, not just a happy path.

### 18.1 Foundations

Draw:

- Color tokens.
- Type scale.
- Spacing system.
- Glass rules.
- Message styles.
- Card styles.
- Icons.
- Bottom nav.
- Header.
- Composer.

### 18.2 Core Components

Draw components with states:

- Home composer.
- Chat composer.
- Attach menu.
- Patient message.
- August plain-text response.
- Doctor message with photo.
- System event marker.
- Status pill.
- Care progress tracker.
- Upload preview.
- Reading/report summary state.
- Safety alert.
- Emergency action.
- Care summary.
- SOAP preview.
- Consent.
- Payment.
- Doctor profile.
- Prescription.
- Test order.
- Result.
- Care plan.
- Follow-up.
- Error state.

### 18.3 Mobile Screens to Draw

Priority screens:

1. Home: Good morning + Ask August anything.
2. Patient starts symptom chat.
3. August safety question.
4. August second question.
5. August third question.
6. August recommendation.
7. Care summary review.
8. SOAP/handoff preview.
9. Location/state.
10. Consent.
11. Payment.
12. Matching clinician.
13. Long wait.
14. Doctor assigned.
15. Doctor reviewing.
16. Doctor joins with photo.
17. Doctor follow-up question.
18. Ask August mode.
19. History mode.
20. Prescription approved.
21. Prescription declined.
22. Test ordered.
23. Report upload.
24. Report summary.
25. Clinician reviewing result.
26. Care plan.
27. Follow-up check-back.
28. Symptoms worsened.
29. Emergency interruption.
30. Unsupported care.
31. Caregiver clarification.
32. Network/upload/payment errors.

### 18.4 Prototype Connections in Paper

Connect:

- Home to symptom flow.
- Home to prescription flow.
- Home to upload flow.
- Intake to emergency.
- Intake to clinician handoff.
- Intake to August-handled care.
- Handoff to waiting.
- Waiting to doctor.
- Doctor to prescription/test/decline.
- Care plan to follow-up.
- Follow-up to improved/same/worse.
- Ask August back to doctor.
- History from doctor and August.

No primary button should dead-end.

## 19. Code Prototype Blueprint

The code prototype should demonstrate interaction, not every Paper screen.

### 19.1 Must Show in Prototype

- Mobile-only device.
- Home with "Good morning, Parth."
- Bottom nav with August on right.
- Ask August anything composer.
- Patient free-text chat.
- Three August questions before recommendation.
- August plain text responses.
- Retrieval/reviewing states.
- Care summary.
- Payment/consent.
- Waiting with async expectations.
- Doctor joins with photo/profile.
- Doctor segment visual shift.
- Dr. Rao / Ask August / History mode.
- Report/image upload simulation.
- Report summarization.
- Prescription approval or decline.
- Test order path.
- Care plan.
- Follow-up check-back.
- Emergency branch.
- Unsupported branch.

### 19.2 Should Not Overbuild in Prototype

- Full real authentication.
- Real payment.
- Real upload processing.
- Real medical advice.
- Every legal variation by state.
- Full backend.

The prototype should be clickable, believable, and coherent.

## 20. Copy Rules

### 20.1 August Voice

August sounds:

- Calm.
- Direct.
- Brief.
- Attentive.
- Clinically careful.
- Non-robotic.

### 20.2 Doctor Voice

Doctor sounds:

- Human.
- Professional.
- Short but complete.
- Clinically authoritative.
- Specific to what patient shared.

### 20.3 System Voice

System events sound:

- Neutral.
- Factual.
- Status-oriented.

### 20.4 Banned Language

Avoid:

- Sorry.
- Unfortunately.
- I apologize.
- Don’t worry.
- Everything will be okay.
- This is definitely...
- August approved your prescription.
- Your prescription is ready.
- We cannot help you.

## 21. Compliance and Legal Review Flags

Flag these in Paper and PRD:

- AI disclosure.
- Human clinician disclosure.
- Telehealth consent.
- State licensure.
- Identity verification.
- Government ID requirements.
- HIPAA/privacy.
- Upload privacy.
- Notification privacy.
- Prescription authority.
- Test-order authority.
- Pharmacy workflow.
- Caregiver authorization.
- Emergency language.
- Payment/refund language.
- Data retention.
- Audit history.
- Clinician signature.

Do not claim compliance. Show where compliance-sensitive decisions happen.

## 22. Evaluation Criteria

The design is successful if:

- It feels like a real mobile app.
- It feels like messaging, not a form.
- August does not feel robotic.
- August does not pretend to be human.
- August asks enough before recommending.
- Doctor involvement is unmistakable.
- Doctor waiting feels expected, not broken.
- Uploaded reports feel native to chat.
- Follow-up feels continuous.
- No apology/liability language appears in declines.
- Safety exits are obvious.
- Pricing does not imply prescription guarantee.
- The same encounter contains AI, doctor, history, care plan, and follow-up.

## 23. Recommended Build Order

1. Update home to "Good morning, Parth" and "Ask August anything."
2. Rework intake into three-question flow.
3. Strengthen August plain-text styling.
4. Add doctor photo/profile and doctor segment shift.
5. Add async waiting states.
6. Add Ask August / Dr. Rao / History modes.
7. Add upload/report simulation.
8. Add prescription approved/declined branch.
9. Add test/order/result branch.
10. Add follow-up check-back.
11. Add caregiver and error states.
12. Polish visual spacing and Paper annotations.

## 24. Final Presentation Narrative

Use this as the interview story:

> I started by treating August as a care orchestration problem, not a chatbot skin. Patients enter with messy intent: symptoms, a doctor request, a prescription request, or an uploaded report. The design lets them message naturally, but August does disciplined work in the background: safety checks, adaptive intake, SOAP preparation, eligibility, and handoff. When a doctor joins, the thread changes visually so human authority is clear. Waiting is designed as an active state, not dead time. After a prescription, test, decline, or care plan, August continues the relationship with follow-up. The result is a premium healthcare chat that feels human without pretending AI is the clinician.

## 25. Open Decisions

Product:

- Final pricing model.
- Membership vs per-visit.
- Included follow-up period.
- Supported states.
- Supported conditions.
- Supported medications.
- Test-ordering partner.
- Pharmacy/fulfillment partner.
- Notification channels.
- Caregiver authorization.

Clinical/legal:

- Exact safety language.
- Exact emergency escalation rules.
- Scope of August report analysis.
- State-specific consent and ID requirements.
- Prescription decline language.
- Medical-record retention.
- Audit requirements.

Design:

- How dramatic doctor segment shift should be.
- Whether doctor segment is visually "group chat" or "phase in thread."
- Whether Ask August appears as tab, bottom sheet, or mode switch.
- How much SOAP detail the patient sees.
- How many follow-up states to prototype.

## 26. Definition of Done

Before moving to final Paper/prototype polish, the design set should include:

- Master visual system.
- Home shell.
- Chat shell.
- Three-question August intake.
- Clear AI messages as plain text.
- Patient bubbles.
- Doctor messages with photo/profile.
- Async wait states.
- Doctor/Ask August/History mode switch.
- Report upload and summary.
- Prescription approval and decline.
- Test order/result path.
- Care plan.
- Follow-up check-back.
- Emergency path.
- Unsupported-care path.
- Pricing/payment step.
- Consent/state/identity placement.
- Compliance annotations.
- No dead-end primary actions.
- No placeholder copy.
- No apology-liability language.

This is the baseline for a strong interview-ready August design.

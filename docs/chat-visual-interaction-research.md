# August Chat Visual and Interaction Research

## 0. Designer Problem Statement

The design test is not simply to make a healthcare chat screen look polished. The real problem is to make August feel like a human-grade care conversation without pretending August is human.

The experience should feel closer to messaging someone through iMessage or WhatsApp than filling out a medical form or talking to a robotic chatbot. The patient should be able to type naturally, send photos or reports, wait for a real doctor when needed, return later, and have August continue the care relationship without losing context.

The design challenge is balancing four things at once:

1. Human-feeling conversation.
2. Clear AI vs clinician authorship.
3. Honest async waiting expectations.
4. Safety and liability-aware medical language.

Success means the patient thinks:

> This feels personal and easy, but I still understand when it is August helping me and when a real doctor is making the decision.

## 1. Executive Recommendation

The strongest product direction is a single continuous care thread with visibly distinct phases:

1. Home / Ask August anything.
2. August intake.
3. August recommendation and handoff explanation.
4. Clinician segment inside the same encounter.
5. Ask August support while clinician care is active.
6. Care plan and follow-up.

Do not split the experience into disconnected chats. The patient should feel like one care story is unfolding, but the interface must make it unmistakable when the author and authority change.

The best metaphor is not a normal AI chat and not a generic doctor portal. It is closer to an iMessage-style group conversation with clinical guardrails:

- August is always available.
- The doctor can join the same encounter.
- Each participant has a distinct visual identity.
- The timeline remains chronological.
- The background/status changes when the active authority changes.
- The composer changes placeholder and destination depending on mode.

## 2. Product Shape

### Home Shell

The app shell should preserve the current direction:

- Warm white background.
- Premium forest/mint system.
- Bottom navigation always visible.
- August anchored as the right-most bottom nav item.
- "Ask August anything" as the primary home action.
- Personal greeting such as "Good morning, Parth."
- Lightweight context modules around the chat entry.

The home should not feel like a marketing page. It should feel like the front door to care.

Suggested home hierarchy:

1. Top greeting: "Good morning, Parth."
2. Primary prompt: "Ask August anything."
3. Composer: "Describe what's going on..."
4. Context cards:
   - Continue sore throat visit.
   - Upload a result.
   - Medication question.
   - Follow-up due.
5. Bottom nav:
   - Home.
   - Visits.
   - Updates.
   - August.

The current bottom nav direction is worth keeping. It gives the prototype the feeling of a real app, not a one-off chat screen.

## 2.1 Human, Not Robotic

August should not behave like a rigid decision tree. It should feel attentive and conversational while still being clinically disciplined.

Design rules:

- Patient can type normally, including messy symptoms, short phrases, or full paragraphs.
- August reflects only the useful medical signal, not every sentence.
- August asks one natural follow-up at a time.
- August does not over-explain.
- August avoids generic empathy loops.
- August avoids apology language.
- August does not use canned chatbot phrases like "I understand your concern" every time.
- August can say what it is doing in plain language: "I'm checking for safety signs first."

Bad:

> I am sorry to hear that. I understand this must be concerning. Please select one of the following options.

Better:

> I’ll check safety first. Are you having trouble breathing or unable to swallow liquids?

Best:

> I’ll check safety first. Are you having trouble breathing, unable to swallow liquids, fainting, or having severe chest pain right now?

This keeps the product human and direct without pretending to be a doctor.

## 2.2 Liability-Safe Language

Avoid apology language in clinical limitations, prescription declines, unsupported care, and safety routing.

Do not use:

- Sorry.
- Unfortunately.
- I apologize.
- We cannot help you.
- We made a mistake.
- You are denied.

Use:

- "This type of care is not currently supported through August."
- "A clinician needs to review this before a prescription can be considered."
- "The safest next step is..."
- "This may need emergency care now."
- "This request needs an established prescriber."

The tone should be warm, but not legally sloppy.

## 2.3 Reports, Photos, and Images

August should support patients sending:

- Lab reports.
- Prescription photos.
- Medication bottles.
- Symptom photos.
- External test results.
- Insurance or pharmacy documents when relevant.

Visual treatment:

- Show the image/document as a patient-sent attachment in the chat.
- Show upload progress.
- Show a compact preview card after upload.
- August summarizes extracted information as plain text, not a heavy AI box.
- Important extracted values should be confirmable.
- The original file remains in the encounter history.

Example flow:

1. Patient sends image/report.
2. Chat shows the attachment preview.
3. Status: "Reading the report."
4. August text: "I found a rapid strep result marked negative from today. Does that match what you uploaded?"
5. Patient confirms or corrects.
6. August updates the care summary or routes to clinician review.

Important boundary:

August can summarize and organize reports. Clinically significant, abnormal, unclear, or diagnosis-changing results should route to clinician review.

## 3. Chat Visual Rules

### Patient Messages

Patient messages should remain in a strong forest-green bubble.

Reason:

- The patient authored it.
- It should be visually scannable.
- It creates rhythm in the conversation.

### August AI Messages

August responses should not appear in heavy boxes.

Recommended treatment:

- Plain text on the canvas.
- Small "August AI" authorship label.
- Optional tiny August glyph or "A" identity.
- Generous line height.
- No large filled container.
- No chat bubble unless the content is a structured object.

Reason:

August is the ambient care guide. It should feel like it is charting and guiding, not competing with patient bubbles. Plain text makes the interaction calmer, more premium, and less like a chatbot widget.

Use cards only when August creates an object:

- Care summary.
- Safety alert.
- Upload preview.
- Payment.
- Clinician handoff.
- Care plan.
- Test order.
- Prescription fulfillment.

### Clinician Messages

Clinician messages need a distinct human-care surface.

Recommended treatment:

- Soft white or lightly warm card/bubble.
- Doctor photo or avatar.
- Doctor name and credentials.
- "Human clinician" label.
- Timestamp.
- License/profile affordance.
- Slightly different background zone when the doctor segment begins.

Clinician messages should not look like August messages. This is the most important visual authorship distinction in the product.

## 4. The Three-Question Rule

The user direction is strong: August should ask recurring questions and should not suggest care too early.

Recommended product rule:

August should ask at least three meaningful clinical questions before suggesting a non-emergency next step, unless:

- The patient reports an emergency red flag.
- The request is clearly unsupported and enough context exists to route safely.
- The user is asking a simple nonclinical administrative question.
- A clinician is already active and asks August to explain something.

The three questions should not be arbitrary. They should map to clinical value:

1. Safety question.
2. Symptom characterization question.
3. Context/history question.

Example sore throat flow:

1. "Are you having trouble breathing, unable to swallow liquids, fainting, or severe chest pain right now?"
2. "What was your highest temperature, and can you swallow liquids normally?"
3. "Any medication allergies or recent exposure to someone with strep?"

Only after those answers should August suggest:

- August can guide this.
- A clinician should review this.
- This may need urgent care.
- This type of care is not supported here.

This makes August feel less trigger-happy and more clinically deliberate.

## 5. Recommended Chat Architecture

### One Encounter, Multiple Modes

The conversation should be one shared encounter with mode changes, not separate threads.

Modes:

- August intake.
- Preparing clinician visit.
- Clinician reviewing.
- Dr. Maya Rao.
- Ask August.
- History.
- Care plan.

The header should show the active mode. The composer should show the active destination.

Examples:

- "Write your answer..." during intake.
- "Message Dr. Rao..." during clinician care.
- "Ask August to explain..." in Ask August mode.
- "Add a note with your result..." during upload/result flow.

### Segment Markers

Use timeline markers when the mode changes:

- "August is preparing your case."
- "Clinician review recommended."
- "Dr. Maya Rao joined."
- "Care plan signed."
- "Follow-up scheduled."

These are not chat messages. They are system events in the encounter history.

### Background Shift for Doctor Segment

When the doctor joins, subtly shift the conversation background:

- August segment: warm white with mint ambient tone.
- Doctor segment: slightly cleaner white or warmer clinical surface.
- Care plan segment: mint-tinted resolution area.
- Emergency segment: dark urgent green/safety surface.

Do not use a dramatic color change. The shift should be enough that a viewer can tell "we are in the doctor part now" even without reading every label.

## 6. Doctor Presence Design

Doctor entrance should feel like a real handoff.

Required elements:

- Doctor photo/avatar.
- Name: "Maya Rao, MD."
- Role: "Human clinician."
- License context: "Licensed in CA" or available profile detail.
- Response expectation.
- Intro message.
- Prior context acknowledgement.

Example:

> I'm Dr. Rao. I reviewed your sore throat, fever, and safety answers. I may ask one or two questions before recommending next steps.

Doctor profile module:

- Photo.
- Credentials.
- State license.
- Specialty or role.
- "Reviewed your August summary."
- Link/button: "View profile."

## 7. How August and Doctor Coexist

### Recommended Model: Shared Thread With Mode Switch

Use a mode switch while the clinician is active:

- Dr. Rao.
- Ask August.
- History.

This is better than fully separate chats because:

- The patient does not lose context.
- The handoff is visible.
- August can explain without pretending to be the clinician.
- The clinician segment stays authoritative.
- History remains auditable.

### Ask August During Doctor Care

Ask August should not send medical decisions. It can:

- Explain the doctor's message in simpler words.
- Help prepare a question for the doctor.
- Summarize what has happened.
- Explain next steps.
- Clarify what a lab or medication instruction means in general terms.

It should not:

- Contradict the doctor.
- Change the plan.
- Prescribe.
- Diagnose.
- Tell the patient to ignore the clinician.

Required disclosure:

> August can explain information and help prepare questions. Dr. Rao makes clinical decisions.

### Visual Pattern

When the user taps "Ask August":

- The thread remains in the same encounter.
- Header changes to "Ask August."
- The background returns to August's mint/warm tone.
- Doctor messages remain visible in history.
- Composer says "Ask August to explain..."
- August answer appears as plain text, not a bubble.
- Any clinically meaningful question can be forwarded to the doctor.

## 8. Interaction Flow: Symptom to Doctor

Recommended prototype sequence:

1. Home: "Good morning, Parth" and "Ask August anything."
2. Patient types symptom.
3. August shows "retrieving context" or "reviewing what you shared."
4. Patient message appears in forest bubble.
5. August asks safety question in plain text.
6. Patient answers.
7. August asks second question.
8. Patient answers.
9. August asks third question.
10. Patient answers.
11. August summarizes briefly.
12. August recommends clinician review and explains why.
13. Patient reviews "What I'll share."
14. Eligibility/payment/consent.
15. Waiting state with realistic timeline.
16. Doctor joins in same thread.
17. Doctor segment begins with photo/profile.
18. Patient chats with doctor.
19. Patient can switch to Ask August.
20. Clinician gives plan.
21. August explains the plan.
22. Follow-up remains in same history.

## 9. Visual Information Density

The interface should be premium by reducing visible noise, not by removing useful information.

Keep always visible:

- Current mode.
- Author of each message.
- Composer.
- Bottom nav.
- Emergency/worsening access.

Make secondary:

- Full SOAP note.
- Care history details.
- Compliance/legal text.
- Doctor license details.
- Payment details after summary.
- Full transcript.

Use progressive disclosure:

- Summary card with "View details."
- Doctor profile bottom sheet.
- Handoff packet preview.
- History timeline.
- Care plan expandable sections.

## 10. "Retrieving Information" States

August should not reply instantly every time.

Use calm, brief states:

- "Reviewing what you shared."
- "Checking for safety concerns."
- "Updating your care summary."
- "Preparing this for a clinician."
- "Retrieving your recent context."

Do not over-animate. Avoid theatrical typing indicators. A quiet status line or subtle three-dot mark is enough.

## 10.1 Doctor Response Time Expectations

Doctor chat should not feel instant. The prototype should intentionally simulate delay and expectation management.

Required states:

- "Dr. Rao is reviewing your summary."
- "Average response today: about 30-60 minutes."
- "You can leave this screen. We’ll notify you."
- "Dr. Rao asked a follow-up question."
- "Waiting for your response."
- "Dr. Rao is reviewing your answer."
- "Care plan ready."

The interface should make async care feel active, not abandoned.

Design pattern:

- When the doctor joins, show the doctor profile and a "reviewing" state before the first message.
- Show timestamps on doctor messages.
- Show a status line under the header.
- Allow the patient to ask August explanatory questions while waiting.
- Keep worsening-symptom action available.

Do not use a fake precise countdown unless operationally guaranteed.

## 10.2 Follow-Up and Check-Back

August should come back into the experience after the clinician decision.

Follow-up should feel like continuity, not a new chatbot session.

Possible check-back moments:

- "How is your throat today?"
- "Did you complete the test?"
- "Any side effects since starting the medication?"
- "Your result is ready. I can summarize it before Dr. Rao reviews."
- "Your symptoms were expected to improve by today. Are they better, the same, or worse?"

Follow-up routing:

- Improved -> close loop / care complete.
- Same -> continue monitoring or clinician follow-up.
- Worse -> safety check.
- Side effect -> safety check or clinician.
- Result uploaded -> summarize and route.
- Pharmacy issue -> fulfillment path.

Tone:

August should be steady and concrete. It should not repeat dramatic concern every time the patient returns.

## 11. Design Risks

### Risk 1: It Looks Like a Generic Chatbot

Mitigation:

- Use the app shell, bottom nav, greeting, care history, and structured care objects.
- Make August plain text rather than bubble-heavy.
- Use real healthcare states, not generic answer cards.

### Risk 2: Doctor and August Blur Together

Mitigation:

- Doctor photo.
- Doctor credentials.
- Human clinician label.
- Segment background change.
- System event: "Dr. Rao joined."
- Different message surface.
- Composer destination changes.

### Risk 3: August Suggests Too Early

Mitigation:

- Three-question rule.
- Explicit safety-first sequence.
- "Here's what I know so far" before recommendation.

### Risk 4: The User Feels Stuck During Waiting

Mitigation:

- Status ladder.
- Last update.
- Expected window.
- Leave-app reassurance.
- Worsening action.
- Ask August while waiting.

### Risk 5: Too Much Text

Mitigation:

- One question per turn.
- Short labels.
- Plain text August responses.
- Cards only for structured objects.
- Progressive disclosure.

## 12. Research Basis

Key external research points:

- AI healthcare products need transparency for both patients and physicians, and should position AI as assistive rather than replacing human intelligence. Source: American Medical Association, "Augmented intelligence in medicine."
- WHO guidance emphasizes ethics, human rights, governance, and accountability in AI for health. This supports visible authorship, human oversight, and clear safety routing.
- Nielsen Norman Group identifies handoff willingness, flexibility, proactivity, emotional responsiveness, and transparency as key qualities for trustworthy AI chatbots.
- NN/g's chatbot UX research also supports combining free text with structured controls, saving context across steps, tolerating ambiguity, and offering an escape hatch to a human when needed.
- Apple's Human Interface Guidelines support familiar content/control relationships, plain language, and platform-native expectations. For this prototype, the bottom nav and iMessage-inspired conversation pattern help make the app feel familiar while the clinical layers make it specific to August.

## 13. Final Design Direction

The prototype should become:

> A premium mobile care thread where August feels like a calm AI guide, the doctor feels like a real human clinician entering the same room, and the patient always knows who is speaking, what has been collected, what happens next, and how to get help if things worsen.

The immediate design changes should be:

1. Add the home state with "Good morning, Parth" and "Ask August anything."
2. Extend the intake to at least three August questions before recommendation.
3. Keep August responses as plain text.
4. Add a stronger doctor entrance with photo, profile, and segment shift.
5. Make clinician care feel like the same encounter, not a separate chat.
6. Add Ask August / Dr. Rao / History mode switch during clinician care.
7. Keep the bottom nav constant with August on the bottom right.
8. Add waiting and retrieval states that make the system feel alive.
9. Use structured cards only for care objects, not normal August replies.
10. Keep copy short and reduce visible density through progressive disclosure.
11. Add report/photo upload and plain-text summarization.
12. Add post-care August check-back and follow-up routing.
13. Remove apology language from decline, unsupported, and prescription-boundary states.

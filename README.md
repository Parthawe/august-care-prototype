# August care prototype

An interview-ready, mobile-first product prototype exploring how August AI can
move a patient from AI intake into human clinical care without blurring
authorship or medical authority.

## Prototype review links

Open `/cases` for a review index, or use direct links:

- `/cases/home` — premium August home
- `/cases/symptom-intake` — open-ended symptom chat
- `/cases/three-questions` — three natural follow-up questions
- `/cases/visit-summary` — editable clinician handoff summary
- `/cases/eligibility` — care-for-self, age, and current-state gates
- `/cases/pricing-checkout` — unchecked consent and $40 example price
- `/cases/async-wait` — clinician matching and async wait state
- `/cases/doctor-reviewing` — assigned clinician reviewing asynchronously
- `/cases/doctor-handoff` — human clinician joins the thread
- `/cases/report-upload` — report upload and extraction
- `/cases/prescription-request` — assessment-first prescription request
- `/cases/unsupported` — controlled-medication care boundary
- `/cases/care-plan` — signed care plan
- `/cases/follow-up` — next-day August check-in
- `/cases/emergency` — urgent escalation

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by the development server. The prototype presents
only the mobile care experience: centered as a device on desktop and filling
the viewport on a phone. Reviewer-only time and clinical-state controls sit
outside the device on larger screens.

Run the deterministic state, rendered-route, and browser suites with:

```bash
npm test
npm run test:e2e
```

## Product position

August AI gathers patient-written facts, performs safety routing, and explains
the process. A human clinician makes clinical decisions. The unified care
timeline keeps the handoff legible.

This is a concept prototype and does not provide medical advice.

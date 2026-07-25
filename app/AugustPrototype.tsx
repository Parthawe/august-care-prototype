"use client";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getPrototypeCase,
  type PrototypeCaseId,
  type PrototypeView,
} from "./prototypeCases";

const icons: Record<string, ReactNode> = {
  home: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.5 12 5l8 6.5V20H6v-6h12" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 14-8-4 16-3-6-7-2Z" />
      <path d="m12 14 7-10" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.8 2.9 8.2 7 10 4.1-1.8 7-5.2 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  doctor: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6" />
      <path d="M18 4v4M16 6h4" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5M10 13h5M10 17h5" />
    </svg>
  ),
  lab: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 2v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17L14 8V2" />
      <path d="M8 2h8M7.5 16h9" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c.5 5.3 3.2 8 8 8-4.8 0-7.5 2.7-8 8-.5-5.3-3.2-8-8-8 4.8 0 7.5-2.7 8-8Z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h3l1.5 4-2 1.5a15 15 0 0 0 6 6l1.5-2L21 14v3c0 2.2-1.8 4-4 4C9.3 21 3 14.7 3 7c0-2.2 1.8-4 4-4Z" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
};

function Icon({ name }: { name: keyof typeof icons }) {
  return <span className="icon">{icons[name]}</span>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span>august</span>
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav glass" aria-label="August navigation">
      <button type="button">
        <Icon name="home" />
        <span>Home</span>
      </button>
      <button type="button">
        <Icon name="file" />
        <span>Visits</span>
      </button>
      <button type="button">
        <Icon name="clock" />
        <span>Updates</span>
      </button>
      <button type="button" className="august-tab">
        <Icon name="spark" />
        <span>August</span>
      </button>
    </nav>
  );
}

function Pill({
  children,
  tone = "mint",
}: {
  children: ReactNode;
  tone?: "mint" | "dark" | "white";
}) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function Header({
  title,
  status,
  onBack,
  person = false,
}: {
  title: string;
  status: string;
  onBack: () => void;
  person?: boolean;
}) {
  return (
    <header className="care-header glass">
      <button className="icon-button" onClick={onBack} aria-label="Go back">
        <Icon name="back" />
      </button>
      <div className={`header-avatar ${person ? "person-avatar" : ""}`}>
        {person ? "MR" : "A"}
        <span className="online-dot" />
      </div>
      <div className="header-copy">
        <strong>{title}</strong>
        <span>{status}</span>
      </div>
      <button className="history-button" aria-label="View encounter details">
        <Icon name="file" />
      </button>
    </header>
  );
}

function Message({
  author,
  role,
  children,
  patient = false,
  clinician = false,
}: {
  author: string;
  role: string;
  children: ReactNode;
  patient?: boolean;
  clinician?: boolean;
}) {
  return (
    <article
      className={`message ${patient ? "message-patient" : ""} ${
        clinician ? "message-clinician" : ""
      }`}
    >
      <div className="message-meta">
        <span>{author}</span>
        <small>{role}</small>
      </div>
      <div className="message-bubble">{children}</div>
    </article>
  );
}

function Composer({
  placeholder = "Write a message…",
  onSubmit,
}: {
  placeholder?: string;
  onSubmit?: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="composer glass"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        onSubmit?.(value.trim());
        setValue("");
      }}
    >
      <button type="button" className="attach-button" aria-label="Attach a file">
        <Icon name="plus" />
      </button>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button className="send-button" aria-label="Send message">
        <Icon name="send" />
      </button>
    </form>
  );
}

function PrimaryButton({
  children,
  onClick,
  secondary = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      className={`primary-button ${secondary ? "secondary-button" : ""}`}
      onClick={onClick}
    >
      <span>{children}</span>
      <Icon name="arrow" />
    </button>
  );
}

export function AugustPrototype({
  initialView = "home",
  initialConcern = "",
}: {
  initialView?: PrototypeView;
  initialConcern?: string;
}) {
  const [view, setView] = useState<PrototypeView>(initialView);
  const [concern, setConcern] = useState(initialConcern);
  const [safetyAnswer, setSafetyAnswer] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [summary, setSummary] = useState(
    "Sore throat for five days\nPainful swallowing, but able to drink liquids\nTemperature reached 101.5°F\nBreathing normally\nNo medication allergies reported\nMain question: whether treatment or testing is needed"
  );
  const [editingSummary, setEditingSummary] = useState(false);
  const [notice, setNotice] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const openPrototypeCase = useCallback((caseId: PrototypeCaseId, updateUrl = true) => {
    const selectedCase = getPrototypeCase(caseId);
    if (!selectedCase) return;

    setView(selectedCase.view);
    setConcern(selectedCase.concern);
    setSafetyAnswer("I’m breathing normally and can drink water.");
    setReviewing(false);
    setEditingSummary(false);
    setNotice(selectedCase.note);

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (selectedCase.id === "home") {
        url.searchParams.delete("case");
      } else {
        url.searchParams.set("case", selectedCase.id);
      }
      window.history.pushState({}, "", url);
    }
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  useEffect(() => {
    const syncFromUrl = () => {
      const caseId = new URLSearchParams(window.location.search).get("case");
      const selectedCase = getPrototypeCase(caseId);
      if (selectedCase) {
        openPrototypeCase(selectedCase.id, false);
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [openPrototypeCase]);

  const startConcern = (value: string) => {
    const normalized = value.toLowerCase();
    setConcern(value);
    if (
      normalized.includes("chest pain") ||
      normalized.includes("can’t breathe") ||
      normalized.includes("can't breathe") ||
      normalized.includes("trouble breathing")
    ) {
      setView("emergency");
      return;
    }
    if (
      normalized.includes("upload") ||
      normalized.includes("report") ||
      normalized.includes("result") ||
      normalized.includes("lab")
    ) {
      setView("upload");
      return;
    }
    if (
      normalized.includes("adderall") ||
      normalized.includes("oxycodone") ||
      normalized.includes("controlled")
    ) {
      setView("unsupported");
      return;
    }
    if (
      normalized.includes("prescription") ||
      normalized.includes("refill") ||
      normalized.includes("antibiotic")
    ) {
      setView("prescription");
      return;
    }
    setReviewing(true);
    setView("intake");
    window.setTimeout(() => setReviewing(false), 1100);
  };

  const reset = () => {
    openPrototypeCase("home");
  };

  return (
    <main className="prototype-shell">
      <section className="device-stage">
        <div className="phone-frame">
          <div className="phone-status">
            <span>9:41</span>
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="phone-content" ref={contentRef}>
            {view === "home" && (
              <HomeScreen
                onSubmit={startConcern}
                onPrescription={() =>
                  startConcern("I think I need an antibiotic prescription for my sore throat.")
                }
              />
            )}
            {view === "intake" && (
              <IntakeScreen
                concern={concern || "My throat has hurt for five days."}
                reviewing={reviewing}
                onAnswer={(answer) => {
                  const normalized = answer.toLowerCase();
                  const clearNegative =
                    /\b(no|none|not|don’t|don't|do not)\b/.test(normalized);
                  const dangerSignal =
                    /\byes\b|trouble breathing|can.?t swallow|cannot swallow|faint|chest pain/.test(
                      normalized
                    );
                  setSafetyAnswer(answer);
                  setView(dangerSignal && !clearNegative ? "emergency" : "details");
                }}
                onBack={reset}
              />
            )}
            {view === "details" && (
              <DetailsScreen
                safetyAnswer={safetyAnswer || "I’m breathing normally and can drink water."}
                onContinue={() => setView("summary")}
                onBack={() => setView("intake")}
              />
            )}
            {view === "summary" && (
              <SummaryScreen
                summary={summary}
                editing={editingSummary}
                setEditing={setEditingSummary}
                setSummary={setSummary}
                onContinue={() => setView("checkout")}
                onBack={() => setView("details")}
              />
            )}
            {view === "checkout" && (
              <CheckoutScreen
                onContinue={() => setView("waiting")}
                onBack={() => setView("summary")}
              />
            )}
            {view === "waiting" && (
              <WaitingScreen
                onContinue={() => setView("clinician")}
                onBack={() => setView("checkout")}
              />
            )}
            {view === "clinician" && (
              <ClinicianScreen
                notice={notice}
                setNotice={setNotice}
                onUpload={() => setView("upload")}
                onPlan={() => setView("plan")}
                onBack={() => setView("waiting")}
              />
            )}
            {view === "upload" && (
              <UploadScreen
                onContinue={() => setView("summary")}
                onBack={reset}
              />
            )}
            {view === "prescription" && (
              <PrescriptionScreen
                onContinue={() => setView("checkout")}
                onBack={reset}
              />
            )}
            {view === "plan" && (
              <PlanScreen
                onBack={() => setView("clinician")}
                onFollowUp={() => setView("followup")}
                onHome={reset}
              />
            )}
            {view === "followup" && (
              <FollowUpScreen
                onBack={() => setView("plan")}
                onEmergency={() => setView("emergency")}
                onHome={reset}
              />
            )}
            {view === "emergency" && <EmergencyScreen onBack={reset} />}
            {view === "unsupported" && <UnsupportedScreen onBack={reset} />}
          </div>
          <BottomNav />
        </div>
      </section>
    </main>
  );
}

function HomeScreen({
  onSubmit,
  onPrescription,
}: {
  onSubmit: (value: string) => void;
  onPrescription: () => void;
}) {
  const [value, setValue] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(value || "My throat has hurt for five days and I have a fever.");
  };
  return (
    <div className="screen home-screen">
      <nav className="home-nav">
        <Brand />
        <button className="avatar">P</button>
      </nav>
      <section className="home-hero">
        <Pill>Secure · Private · Built by doctors</Pill>
        <span className="home-greeting">Good morning, Parth</span>
        <h2>Ask August anything.</h2>
        <p>Symptoms, prescriptions, reports, or follow-ups. Start in your own words.</p>
      </section>
      <form className="hero-composer glass" onSubmit={submit}>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Describe what’s going on…"
          aria-label="Describe what’s going on"
        />
        <div>
          <button type="button" className="attach-button" aria-label="Attach">
            <Icon name="plus" />
          </button>
          <button className="send-button" aria-label="Start conversation">
            <Icon name="send" />
          </button>
        </div>
      </form>
      <div className="shortcut-grid">
        <button
          onClick={() =>
            onSubmit("My throat has hurt for five days and I have a fever.")
          }
        >
          <span className="shortcut-icon">
            <Icon name="spark" />
          </span>
          <strong>Check a symptom</strong>
          <small>Chat with August</small>
          <Icon name="arrow" />
        </button>
        <button onClick={onPrescription}>
          <span className="shortcut-icon">
            <Icon name="file" />
          </span>
          <strong>Medication</strong>
          <small>Assess first</small>
          <Icon name="arrow" />
        </button>
        <button onClick={() => onSubmit("I think I need a doctor for my sore throat.")}>
          <span className="shortcut-icon">
            <Icon name="doctor" />
          </span>
          <strong>Doctor visit</strong>
          <small>Prepare handoff</small>
          <Icon name="arrow" />
        </button>
        <button onClick={() => onSubmit("I want to upload my lab report.")}>
          <span className="shortcut-icon">
            <Icon name="lab" />
          </span>
          <strong>Upload result</strong>
          <small>Summarize report</small>
          <Icon name="arrow" />
        </button>
      </div>
      <div className="privacy-note">
        <Icon name="shield" />
        <p>
          <strong>Private by design.</strong>
          August prepares care; clinicians make clinical decisions.
        </p>
      </div>
    </div>
  );
}

function IntakeScreen({
  concern,
  reviewing,
  onAnswer,
  onBack,
}: {
  concern: string;
  reviewing: boolean;
  onAnswer: (answer: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="screen conversation-screen">
      <Header title="Sore throat" status="August AI · Safety check" onBack={onBack} />
      <div className="conversation-body">
        <div className="step-row">
          <span>Intake</span>
          <div><i /><i className="active" /><i /><i /></div>
          <span>2 of 4</span>
        </div>
        <Message author="You" role="Patient" patient>
          {concern}
        </Message>
        {reviewing ? (
          <div className="reviewing-state">
            <span className="thinking-mark"><i /><i /><i /></span>
            <div>
              <strong>Checking for safety concerns</strong>
              <small>August is reviewing what you shared</small>
            </div>
          </div>
        ) : (
          <>
            <Message author="August AI" role="AI care guide">
              Before we continue, are you having trouble breathing, unable to
              swallow liquids, fainting, or having severe chest pain right now?
            </Message>
            <div className="chat-prompt">
              <Icon name="shield" />
              <span>Answer in your own words.</span>
            </div>
          </>
        )}
      </div>
      {!reviewing && (
        <Composer
          placeholder="Write your answer…"
          onSubmit={onAnswer}
        />
      )}
    </div>
  );
}

function DetailsScreen({
  safetyAnswer,
  onContinue,
  onBack,
}: {
  safetyAnswer: string;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="screen conversation-screen">
      <Header title="Sore throat" status="August AI · Medical intake" onBack={onBack} />
      <div className="conversation-body">
        <div className="step-row">
          <span>Intake</span>
          <div><i /><i /><i className="active" /><i /></div>
          <span>3 of 4</span>
        </div>
        <Message author="You" role="Patient" patient>
          {safetyAnswer}
        </Message>
        <Message author="August AI" role="AI care guide">
          Thanks. What was your highest temperature, and can you swallow
          liquids normally?
        </Message>
        <Message author="You" role="Patient" patient>
          101.5°F last night. Swallowing hurts, but I can drink water.
        </Message>
        <Message author="August AI" role="AI care guide">
          Any medication allergies or recent exposure to someone with strep?
        </Message>
        <div className="inline-answer">
          <span>No allergies. My roommate had strep last week.</span>
          <Icon name="check" />
        </div>
        <Message author="August AI" role="AI care guide">
          A clinician should review this because fever, five days of throat
          pain, and possible strep exposure may need testing or treatment.
        </Message>
        <div className="record-update">
          <Icon name="file" />
          <div>
            <strong>Care summary updated</strong>
            <span>Ready for review</span>
          </div>
          <Pill>Draft</Pill>
        </div>
        <PrimaryButton onClick={onContinue}>Review what August collected</PrimaryButton>
      </div>
      <Composer />
    </div>
  );
}

function UploadScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="screen conversation-screen upload-screen">
      <Header title="Lab report" status="August AI · Reading upload" onBack={onBack} />
      <div className="conversation-body">
        <div className="step-row">
          <span>Upload</span>
          <div><i /><i className="active" /><i /><i /></div>
          <span>Report</span>
        </div>
        <Message author="You" role="Patient" patient>
          I uploaded my rapid strep result.
        </Message>
        <section className="upload-preview">
          <div className="report-thumb">
            <Icon name="lab" />
            <span>PDF</span>
          </div>
          <div>
            <strong>Rapid strep result.pdf</strong>
            <span>Uploaded · 1 page</span>
          </div>
          <Pill>Read</Pill>
        </section>
        <div className="reviewing-state">
          <span className="thinking-mark"><i /><i /><i /></span>
          <div>
            <strong>Reading the report</strong>
            <small>August is extracting key details</small>
          </div>
        </div>
        <Message author="August AI" role="AI care guide">
          I found a rapid strep result marked negative from today. Your fever
          and throat pain still matter, so I’ll add this to the clinician
          summary instead of treating it as the final answer.
        </Message>
        <section className="extraction-card">
          <div><Icon name="check" /><span>Rapid strep: negative</span></div>
          <div><Icon name="check" /><span>Collected today</span></div>
          <div><Icon name="doctor" /><span>Clinician review recommended</span></div>
        </section>
        <PrimaryButton onClick={onContinue}>Add to visit summary</PrimaryButton>
      </div>
      <Composer placeholder="Add a note with your result…" />
    </div>
  );
}

function PrescriptionScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="screen conversation-screen">
      <Header title="Medication request" status="August AI · Assessment first" onBack={onBack} />
      <div className="conversation-body">
        <div className="step-row">
          <span>Prescription</span>
          <div><i /><i className="active" /><i /><i /></div>
          <span>Context</span>
        </div>
        <Message author="You" role="Patient" patient>
          I think I need an antibiotic for my sore throat.
        </Message>
        <Message author="August AI" role="AI care guide">
          Before a clinician can consider a prescription, I need to understand
          what you’re treating and how you’re doing now.
        </Message>
        <Message author="August AI" role="AI care guide">
          How long has your throat hurt, and have you had fever, rash, or
          trouble swallowing liquids?
        </Message>
        <Message author="You" role="Patient" patient>
          Five days, fever last night, no rash, and I can drink water.
        </Message>
        <Message author="August AI" role="AI care guide">
          Any medication allergies or antibiotics that caused problems before?
        </Message>
        <Message author="You" role="Patient" patient>
          No medication allergies.
        </Message>
        <section className="record-update">
          <Icon name="file" />
          <div>
            <strong>Prescription request prepared</strong>
            <span>A clinician decides whether medication is appropriate</span>
          </div>
          <Pill>Review</Pill>
        </section>
        <PrimaryButton onClick={onContinue}>Continue to clinician review</PrimaryButton>
      </div>
      <Composer placeholder="Answer in your own words…" />
    </div>
  );
}

function SummaryScreen({
  summary,
  editing,
  setEditing,
  setSummary,
  onContinue,
  onBack,
}: {
  summary: string;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  setSummary: (summary: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const items = summary.split("\n").filter(Boolean);
  return (
    <div className="screen summary-screen">
      <Header
        title="Prepare your visit"
        status="August AI · Review before sharing"
        onBack={onBack}
      />
      <div className="page-body">
        <div className="eyebrow">Review</div>
        <h2>What I’ll share with the clinician</h2>
        <p className="page-intro">
          Make sure this feels right before it goes to a clinician.
        </p>
        <section className="summary-card glass">
          <div className="card-heading">
            <div>
              <Icon name="file" />
              <strong>Visit summary</strong>
            </div>
            <button onClick={() => setEditing(!editing)}>
              {editing ? "Done" : "Edit"}
            </button>
          </div>
          {editing ? (
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              autoFocus
            />
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item}>
                  <Icon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="summary-source">
            <Icon name="shield" />
            <span>Built from your answers</span>
          </div>
        </section>
        <section className="clinician-recommendation">
          <div className="recommendation-icon">
            <Icon name="doctor" />
          </div>
          <div>
            <Pill>Recommended next step</Pill>
            <h3>A clinician should review this</h3>
            <p>
              A clinician can decide whether testing or treatment is needed.
            </p>
          </div>
        </section>
        <PrimaryButton onClick={onContinue}>See visit details</PrimaryButton>
        <button className="text-button" onClick={() => setEditing(true)}>
          I need to change something
        </button>
      </div>
    </div>
  );
}

function CheckoutScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const [agreed, setAgreed] = useState(true);
  return (
    <div className="screen summary-screen">
      <Header
        title="Clinician visit"
        status="Secure handoff"
        onBack={onBack}
      />
      <div className="page-body">
        <div className="visit-profile">
          <div className="profile-avatar">MR</div>
          <div>
            <span>Licensed clinician</span>
            <h2>One async visit</h2>
            <p>Typically responds within 30–60 minutes</p>
          </div>
          <strong>$39</strong>
        </div>
        <section className="included-card">
          <h3>Before you continue</h3>
          <div><Icon name="pin" /><span>You’re currently in <strong>California</strong></span><button>Change</button></div>
          <div><Icon name="clock" /><span>You can leave and return anytime</span></div>
          <div><Icon name="shield" /><span>No prescription is guaranteed</span></div>
        </section>
        <label className="consent-row">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            I consent to share this visit with a California-licensed clinician.
          </span>
        </label>
        <div className="total-row">
          <span>Total today</span>
          <strong>$39.00</strong>
        </div>
        <PrimaryButton onClick={agreed ? onContinue : undefined}>
          Confirm and send for review
        </PrimaryButton>
        <p className="legal-line">
          If no clinician accepts your case, you won’t be charged.
        </p>
      </div>
    </div>
  );
}

function WaitingScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="screen waiting-screen">
      <Header
        title="Sore throat"
        status="Finding a clinician"
        onBack={onBack}
      />
      <div className="page-body">
        <div className="orb">
          <span><Icon name="doctor" /></span>
        </div>
        <Pill>Case received</Pill>
        <h2>Your case is in good hands</h2>
        <p className="page-intro">
          We’re finding a clinician licensed in California.
        </p>
        <section className="status-track">
          <div className="done"><i><Icon name="check" /></i><span><strong>Information prepared</strong><small>Summary and consent complete</small></span></div>
          <div className="done"><i><Icon name="check" /></i><span><strong>Eligibility confirmed</strong><small>California · age 18+</small></span></div>
          <div className="current"><i><span /></i><span><strong>Matching clinician</strong><small>Expected within 30–60 minutes</small></span></div>
          <div><i /><span><strong>Clinician review</strong><small>We’ll notify you when it starts</small></span></div>
        </section>
        <div className="worsen-note">
          <Icon name="shield" />
          <span><strong>If symptoms worsen</strong>Get urgent help.</span>
        </div>
        <PrimaryButton onClick={onContinue}>Preview clinician joining</PrimaryButton>
        <button className="text-button">View submitted summary</button>
      </div>
    </div>
  );
}

function ClinicianScreen({
  notice,
  setNotice,
  onUpload,
  onPlan,
  onBack,
}: {
  notice: string;
  setNotice: (notice: string) => void;
  onUpload: () => void;
  onPlan: () => void;
  onBack: () => void;
}) {
  return (
    <div className="screen conversation-screen clinician-screen">
      <Header
        title="Maya Rao, MD"
        status="Human clinician · Active"
        onBack={onBack}
        person
      />
      <div className="mode-switch">
        <button className="active">Dr. Rao</button>
        <button
          onClick={() =>
            setNotice(
              "August can explain information and help prepare questions. Dr. Rao makes clinical decisions."
            )
          }
        >
          Ask August
        </button>
        <button onClick={() => setNotice("Your full care history is up to date.")}>
          History
        </button>
      </div>
      <div className="conversation-body">
        {notice && (
          <div className="mode-notice">
            <Icon name="spark" />
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}
        <div className="joined-event">
          <span className="line" />
          <Pill tone="white">Clinician joined · 10:16 AM</Pill>
          <span className="line" />
        </div>
        <section className="doctor-profile-card">
          <div className="doctor-photo">MR</div>
          <div>
            <strong>Maya Rao, MD</strong>
            <span>Board-certified · Licensed in CA</span>
            <small>Reviewed your August summary and safety answers.</small>
          </div>
        </section>
        <div className="reviewing-state clinician-wait">
          <span className="thinking-mark"><i /><i /><i /></span>
          <div>
            <strong>Dr. Rao is reviewing</strong>
            <small>Typical response today: 30–60 minutes</small>
          </div>
        </div>
        <Message author="Maya Rao, MD" role="Human clinician · CA licensed" clinician>
          I’m Dr. Rao. I reviewed your fever, sore throat, and safety answers.
        </Message>
        <Message author="Maya Rao, MD" role="Human clinician · 10:18 AM" clinician>
          Your symptoms could be strep throat. I recommend a rapid test today.
          Any rash or one-sided swelling?
        </Message>
        <Message author="You" role="Patient · Delivered" patient>
          No rash, and the swelling feels even on both sides.
        </Message>
        <button className="upload-inline" onClick={onUpload}>
          <Icon name="lab" />
          <span>Upload a report or test result</span>
          <Icon name="arrow" />
        </button>
        <section className="plan-preview">
          <div className="plan-preview-top">
            <span><Icon name="check" /></span>
            <div><small>Signed by Dr. Rao</small><strong>Your care plan is ready</strong></div>
          </div>
          <div className="plan-preview-items">
            <span>Rapid strep test</span>
            <span>Relief while you wait</span>
            <span>Follow-up in 24 hours</span>
          </div>
          <button onClick={onPlan}>Open care plan <Icon name="arrow" /></button>
        </section>
      </div>
      <Composer placeholder="Message Dr. Rao…" />
    </div>
  );
}

function PlanScreen({
  onBack,
  onFollowUp,
  onHome,
}: {
  onBack: () => void;
  onFollowUp: () => void;
  onHome: () => void;
}) {
  return (
    <div className="screen plan-screen">
      <Header
        title="Your care plan"
        status="Signed by Maya Rao, MD"
        onBack={onBack}
        person
      />
      <div className="page-body">
        <div className="plan-hero">
          <div className="success-seal"><Icon name="check" /></div>
          <Pill>Care plan ready</Pill>
          <h2>Your next 48 hours</h2>
          <p>Everything below was reviewed and signed by Dr. Rao.</p>
        </div>
        <section className="timeline-card">
          <div>
            <i><span>1</span></i>
            <article>
              <small>Today</small>
              <h3>Complete a rapid strep test</h3>
              <p>Your lab order has been received. Choose a nearby location.</p>
              <button>Choose a lab <Icon name="arrow" /></button>
            </article>
          </div>
          <div>
            <i><span>2</span></i>
            <article>
              <small>While you wait</small>
              <h3>Manage pain and fever</h3>
              <p>Acetaminophen as directed on the label, fluids, and rest.</p>
              <button>See instructions <Icon name="arrow" /></button>
            </article>
          </div>
          <div>
            <i><span>3</span></i>
            <article>
              <small>Within 24 hours</small>
              <h3>Dr. Rao reviews your result</h3>
              <p>We’ll notify you if the plan or medication changes.</p>
            </article>
          </div>
        </section>
        <section className="urgent-card">
          <Icon name="shield" />
          <div>
            <strong>Get urgent help if</strong>
            <span>You can’t breathe or swallow liquids, or symptoms worsen quickly.</span>
          </div>
        </section>
        <div className="plan-actions">
          <PrimaryButton onClick={onFollowUp}>Preview follow-up check-in</PrimaryButton>
          <button className="ask-august"><Icon name="spark" /> Ask August to explain</button>
          <button className="text-button" onClick={onHome}>Done for now</button>
        </div>
      </div>
    </div>
  );
}

function FollowUpScreen({
  onBack,
  onEmergency,
  onHome,
}: {
  onBack: () => void;
  onEmergency: () => void;
  onHome: () => void;
}) {
  return (
    <div className="screen conversation-screen followup-screen">
      <Header title="Follow-up" status="August AI · Check-in" onBack={onBack} />
      <div className="conversation-body">
        <div className="joined-event">
          <span className="line" />
          <Pill tone="white">Next day · 9:12 AM</Pill>
          <span className="line" />
        </div>
        <Message author="August AI" role="AI care guide">
          How is your throat today: better, the same, or worse?
        </Message>
        <Message author="You" role="Patient" patient>
          A little better. Fever is gone.
        </Message>
        <Message author="August AI" role="AI care guide">
          Good. Keep following Dr. Rao’s plan. If breathing becomes difficult,
          swallowing liquids becomes hard, or symptoms worsen quickly, get
          urgent care.
        </Message>
        <section className="followup-card">
          <div><Icon name="check" /><span>Fever improved</span></div>
          <div><Icon name="clock" /><span>Next check-in tomorrow</span></div>
          <div><Icon name="doctor" /><span>Doctor thread stays available</span></div>
        </section>
        <PrimaryButton onClick={onHome}>Close for now</PrimaryButton>
        <button className="text-button" onClick={onEmergency}>
          Symptoms are getting worse
        </button>
      </div>
      <Composer placeholder="Tell August how you feel…" />
    </div>
  );
}

function EmergencyScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen emergency-screen">
      <div className="emergency-top">
        <Brand />
        <Pill tone="dark">Urgent</Pill>
      </div>
      <div className="emergency-body">
        <div className="emergency-icon"><Icon name="phone" /></div>
        <div className="eyebrow">Paused for safety</div>
        <h2>This may need emergency care now.</h2>
        <p>
          Trouble breathing, fainting, or severe chest pain can be urgent.
        </p>
        <button className="emergency-call"><Icon name="phone" /><span><small>Call emergency services</small>911</span></button>
        <button className="emergency-location"><Icon name="pin" /><span><strong>Find the nearest emergency department</strong><small>Uses your current location</small></span><Icon name="arrow" /></button>
        <div className="emergency-guidance">
          <strong>While help is on the way</strong>
          <ul>
            <li>Unlock the door if you’re home.</li>
            <li>Sit somewhere safe.</li>
            <li>Tell someone nearby.</li>
          </ul>
        </div>
        <button className="outline-light" onClick={onBack}>I’m taking action</button>
        <small className="emergency-foot">Your conversation has been saved.</small>
      </div>
    </div>
  );
}

function UnsupportedScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen boundary-screen">
      <Header
        title="Medication request"
        status="August AI · Care boundary"
        onBack={onBack}
      />
      <div className="page-body">
        <div className="boundary-icon"><Icon name="shield" /></div>
        <Pill>Clear next steps</Pill>
        <h2>This medication isn’t supported here.</h2>
        <p className="page-intro">
          Controlled medication requests need an established prescriber.
        </p>
        <section className="why-card">
          <span>Why this route is different</span>
          <p>
            Controlled medication decisions require care from an established
            prescriber who can review your ongoing history.
          </p>
        </section>
        <section className="next-card">
          <h3>Your safest next step</h3>
          <div><i>1</i><span><strong>Contact your current prescriber</strong><small>Ask about their refill process and timing.</small></span></div>
          <div><i>2</i><span><strong>Find ongoing primary care</strong><small>We can help you prepare a concise summary.</small></span></div>
        </section>
        <PrimaryButton>Download my care summary</PrimaryButton>
        <PrimaryButton secondary onClick={onBack}>Start a different concern</PrimaryButton>
        <p className="legal-line">If stopping your medication could be unsafe, contact your prescriber or pharmacist today.</p>
      </div>
    </div>
  );
}

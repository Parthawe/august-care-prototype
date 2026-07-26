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
  type PrototypeVariationId,
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

function BottomNav({ active }: { active: "home" | "august" }) {
  return (
    <nav className="bottom-nav glass" aria-label="August navigation">
      <span className={active === "home" ? "active" : ""}>
        <Icon name="home" />
        <span>Home</span>
      </span>
      <span>
        <Icon name="file" />
        <span>Visits</span>
      </span>
      <span>
        <Icon name="clock" />
        <span>Updates</span>
      </span>
      <span className={active === "august" ? "august-tab active" : "august-tab"}>
        <Icon name="spark" />
        <span>August</span>
      </span>
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
  onDetails,
  person = false,
}: {
  title: string;
  status: string;
  onBack: () => void;
  onDetails?: () => void;
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
      {onDetails ? (
        <button
          className="history-button"
          onClick={onDetails}
          type="button"
          aria-label="View encounter details"
        >
          <Icon name="file" />
        </button>
      ) : (
        <span className="history-indicator" aria-hidden="true">
          <Icon name="file" />
        </span>
      )}
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
  onAttach,
}: {
  placeholder?: string;
  onSubmit: (value: string) => void;
  onAttach?: () => void;
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
      {onAttach ? (
        <button
          type="button"
          className="attach-button"
          onClick={onAttach}
          aria-label="Attach a file"
        >
          <Icon name="plus" />
        </button>
      ) : (
        <span className="attach-button composer-decoration" aria-hidden="true">
          <Icon name="plus" />
        </span>
      )}
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button
        className="send-button"
        disabled={!value.trim()}
        aria-label="Send message"
      >
        <Icon name="send" />
      </button>
    </form>
  );
}

function PrimaryButton({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`primary-button ${secondary ? "secondary-button" : ""}`}
      onClick={onClick}
      disabled={disabled || !onClick}
      type="button"
    >
      <span>{children}</span>
      <Icon name="arrow" />
    </button>
  );
}

export function hasEmergencySignal(answer: string) {
  const normalized = answer.toLowerCase().replace(/[’]/g, "'").trim();
  if (/^(yes|yes,|one of those|i am|i do)$/.test(normalized)) return true;

  const signals = [
    {
      positive:
        /trouble breathing|difficulty breathing|hard to breathe|short of breath|can't breathe|cannot breathe/,
      negative:
        /no (?:trouble|difficulty) breathing|not (?:having )?(?:trouble|difficulty) breathing|breathing (?:is )?(?:normal|fine|okay)|can breathe/,
    },
    {
      positive:
        /unable to swallow|can't swallow|cannot swallow|hard to swallow liquids|can't drink|cannot drink/,
      negative:
        /can swallow|able to swallow|can drink|able to drink/,
    },
    {
      positive: /fainted|fainting|passed out|feel like i (?:might|may) pass out/,
      negative:
        /didn't faint|did not faint|haven't fainted|have not fainted|no fainting|not fainting/,
    },
    {
      positive: /severe chest pain|chest pressure|pressure in (?:my )?chest/,
      negative:
        /no (?:severe )?chest pain|chest pain (?:is )?not severe|no chest pressure/,
    },
  ];

  return signals.some(
    ({ positive, negative }) =>
      positive.test(normalized) && !negative.test(normalized)
  );
}

export function AugustPrototype({
  initialView = "home",
  initialConcern = "",
  variation = "classic",
}: {
  initialView?: PrototypeView;
  initialConcern?: string;
  variation?: PrototypeVariationId;
}) {
  const [view, setView] = useState<PrototypeView>(initialView);
  const [concern, setConcern] = useState(initialConcern);
  const [safetyAnswer, setSafetyAnswer] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [summary, setSummary] = useState(
    "Sore throat for five days\nPainful swallowing, but able to drink liquids\nTemperature reached 101.5°F\nBreathing normally\nNo medication allergies reported\nMain question: whether treatment or testing is needed"
  );
  const [editingSummary, setEditingSummary] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const openPrototypeCase = useCallback((caseId: PrototypeCaseId, updateUrl = true) => {
    const selectedCase = getPrototypeCase(caseId);
    if (!selectedCase) return;

    setView(selectedCase.view);
    setConcern(selectedCase.concern);
    setSafetyAnswer("I’m breathing normally and can drink water.");
    setReviewing(false);
    setEditingSummary(false);

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
    <main className={`prototype-shell variation-${variation}`}>
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
                onUpload={() => setView("upload")}
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
                  setSafetyAnswer(answer);
                  setView(hasEmergencySignal(answer) ? "emergency" : "details");
                }}
                onUpload={() => setView("upload")}
                onBack={reset}
              />
            )}
            {view === "details" && (
              <DetailsScreen
                safetyAnswer={safetyAnswer || "I’m breathing normally and can drink water."}
                onContinue={() => setView("summary")}
                onUpload={() => setView("upload")}
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
                onContinue={() => setView("clinician-reviewing")}
                onViewSummary={() => setView("summary")}
                onBack={() => setView("checkout")}
              />
            )}
            {view === "clinician-reviewing" && (
              <ClinicianReviewingScreen
                onContinue={() => setView("clinician")}
                onUpload={() => setView("upload")}
                onBack={() => setView("waiting")}
              />
            )}
            {view === "clinician" && (
              <ClinicianScreen
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
                onUpload={() => setView("upload")}
                onBack={reset}
              />
            )}
            {view === "plan" && (
              <PlanScreen
                onBack={() => setView("clinician")}
                onFollowUp={() => setView("followup")}
                onExplain={() => setView("clinician")}
                onHome={reset}
              />
            )}
            {view === "followup" && (
              <FollowUpScreen
                onBack={() => setView("plan")}
                onEmergency={() => setView("emergency")}
                onUpload={() => setView("upload")}
                onHome={reset}
              />
            )}
            {view === "emergency" && <EmergencyScreen onBack={reset} />}
            {view === "unsupported" && <UnsupportedScreen onBack={reset} />}
          </div>
          <BottomNav active={view === "home" ? "home" : "august"} />
        </div>
      </section>
    </main>
  );
}

function HomeScreen({
  onSubmit,
  onUpload,
  onPrescription,
}: {
  onSubmit: (value: string) => void;
  onUpload: () => void;
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
        <span className="avatar" aria-label="Parth profile">P</span>
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
          <button
            type="button"
            className="attach-button"
            onClick={onUpload}
            aria-label="Attach"
          >
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
  onUpload,
  onBack,
}: {
  concern: string;
  reviewing: boolean;
  onAnswer: (answer: string) => void;
  onUpload: () => void;
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
          onAttach={onUpload}
        />
      )}
    </div>
  );
}

function DetailsScreen({
  safetyAnswer,
  onContinue,
  onUpload,
  onBack,
}: {
  safetyAnswer: string;
  onContinue: () => void;
  onUpload: () => void;
  onBack: () => void;
}) {
  const [extraAnswer, setExtraAnswer] = useState("");
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
        {extraAnswer && (
          <>
            <Message author="You" role="Patient · Added" patient>
              {extraAnswer}
            </Message>
            <Message author="August AI" role="AI care guide">
              I added that to the clinician summary.
            </Message>
          </>
        )}
        <PrimaryButton onClick={onContinue}>Review what August collected</PrimaryButton>
      </div>
      <Composer
        placeholder="Add anything else…"
        onSubmit={setExtraAnswer}
        onAttach={onUpload}
      />
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
  const [note, setNote] = useState("");
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
        {note && (
          <Message author="You" role="Patient · Note added" patient>
            {note}
          </Message>
        )}
        <PrimaryButton onClick={onContinue}>Add to visit summary</PrimaryButton>
      </div>
      <Composer
        placeholder="Add a note with your result…"
        onSubmit={setNote}
      />
    </div>
  );
}

function PrescriptionScreen({
  onContinue,
  onUpload,
  onBack,
}: {
  onContinue: () => void;
  onUpload: () => void;
  onBack: () => void;
}) {
  const [extraAnswer, setExtraAnswer] = useState("");
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
        {extraAnswer && (
          <>
            <Message author="You" role="Patient · Added" patient>
              {extraAnswer}
            </Message>
            <Message author="August AI" role="AI care guide">
              I added that for the clinician to review.
            </Message>
          </>
        )}
        <PrimaryButton onClick={onContinue}>Continue to clinician review</PrimaryButton>
      </div>
      <Composer
        placeholder="Add medication context…"
        onSubmit={setExtraAnswer}
        onAttach={onUpload}
      />
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
          <div><Icon name="pin" /><span>You’re currently in <strong>California</strong></span><small>Current</small></div>
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
        <PrimaryButton onClick={onContinue} disabled={!agreed}>
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
  onViewSummary,
  onBack,
}: {
  onContinue: () => void;
  onViewSummary: () => void;
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
        <button className="text-button" onClick={onViewSummary} type="button">
          View submitted summary
        </button>
      </div>
    </div>
  );
}

function ClinicianReviewingScreen({
  onContinue,
  onUpload,
  onBack,
}: {
  onContinue: () => void;
  onUpload: () => void;
  onBack: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="screen conversation-screen clinician-screen">
      <Header
        title="Maya Rao, MD"
        status="Human clinician · Reviewing"
        onBack={onBack}
        person
      />
      <div className="conversation-body">
        <div className="joined-event">
          <span className="line" />
          <Pill tone="white">Assigned · 10:16 AM</Pill>
          <span className="line" />
        </div>
        <section className="doctor-profile-card">
          <div className="doctor-photo">MR</div>
          <div>
            <strong>Maya Rao, MD</strong>
            <span>Board-certified · Licensed in CA</span>
            <small>Reviewing your summary, safety answers, and uploaded files.</small>
          </div>
        </section>
        <div className="reviewing-state clinician-wait">
          <span className="thinking-mark"><i /><i /><i /></span>
          <div>
            <strong>Dr. Rao is reviewing</strong>
            <small>Typical response today: 30–60 minutes</small>
          </div>
        </div>
        <section className="waiting-expectation">
          <div>
            <Icon name="clock" />
            <span>
              <strong>You can leave this screen.</strong>
              We’ll notify you when Dr. Rao replies.
            </span>
          </div>
          <div>
            <Icon name="shield" />
            <span>
              <strong>If symptoms worsen,</strong>
              get urgent help instead of waiting here.
            </span>
          </div>
        </section>
        {note && (
          <Message author="You" role="Patient · Added for Dr. Rao" patient>
            {note}
          </Message>
        )}
        <PrimaryButton onClick={onContinue}>Preview Dr. Rao’s reply</PrimaryButton>
      </div>
      <Composer
        placeholder="Add a note for Dr. Rao…"
        onSubmit={setNote}
        onAttach={onUpload}
      />
    </div>
  );
}

function ClinicianScreen({
  onUpload,
  onPlan,
  onBack,
}: {
  onUpload: () => void;
  onPlan: () => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<"doctor" | "august" | "history">("doctor");
  const [patientMessage, setPatientMessage] = useState("");

  const submitMessage = (value: string) => {
    if (mode === "history") setMode("doctor");
    setPatientMessage(value);
  };

  return (
    <div className="screen conversation-screen clinician-screen">
      <Header
        title={mode === "august" ? "August" : "Maya Rao, MD"}
        status={
          mode === "august"
            ? "AI care guide · Explaining Dr. Rao’s plan"
            : "Human clinician · Active"
        }
        onBack={onBack}
        person={mode !== "august"}
      />
      <div className="mode-switch" aria-label="Conversation view">
        <button
          className={mode === "doctor" ? "active" : ""}
          onClick={() => setMode("doctor")}
          type="button"
          aria-pressed={mode === "doctor"}
        >
          Dr. Rao
        </button>
        <button
          className={mode === "august" ? "active" : ""}
          onClick={() => setMode("august")}
          type="button"
          aria-pressed={mode === "august"}
        >
          Ask August
        </button>
        <button
          className={mode === "history" ? "active" : ""}
          onClick={() => setMode("history")}
          type="button"
          aria-pressed={mode === "history"}
        >
          History
        </button>
      </div>
      <div className="conversation-body" aria-live="polite">
        {mode === "doctor" && (
          <>
            <div className="joined-event">
              <span className="line" />
              <Pill tone="white">Dr. Rao replied · 10:18 AM</Pill>
              <span className="line" />
            </div>
            <Message author="Maya Rao, MD" role="Human clinician · CA licensed" clinician>
              I reviewed your fever, throat pain, and safety answers.
            </Message>
            <Message author="Maya Rao, MD" role="Human clinician · 10:18 AM" clinician>
              This could be strep throat. I recommend a rapid test today. Any
              rash or one-sided swelling?
            </Message>
            <Message author="You" role="Patient · Delivered" patient>
              No rash, and the swelling feels even on both sides.
            </Message>
            {patientMessage && (
              <Message author="You" role="Patient · Delivered" patient>
                {patientMessage}
              </Message>
            )}
            <button className="upload-inline" onClick={onUpload} type="button">
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
              <button onClick={onPlan} type="button">
                Open care plan <Icon name="arrow" />
              </button>
            </section>
          </>
        )}

        {mode === "august" && (
          <>
            <div className="mode-notice">
              <Icon name="spark" />
              <span>
                August can explain and help prepare questions. Dr. Rao makes
                clinical decisions.
              </span>
            </div>
            <Message author="August AI" role="AI care guide">
              Dr. Rao recommends a rapid strep test because your fever, five
              days of throat pain, and recent exposure make testing useful.
            </Message>
            <Message author="August AI" role="AI care guide">
              What would you like me to explain before you reply to Dr. Rao?
            </Message>
            {patientMessage && (
              <>
                <Message author="You" role="Patient · Private to August" patient>
                  {patientMessage}
                </Message>
                <Message author="August AI" role="AI care guide">
                  The rapid test checks for group A strep. A negative result may
                  still need clinician interpretation alongside your symptoms.
                </Message>
              </>
            )}
          </>
        )}

        {mode === "history" && (
          <section className="care-history">
            <div>
              <span>9:42 AM</span>
              <strong>August prepared your visit</strong>
              <small>Symptoms, safety answers, and allergies summarized.</small>
            </div>
            <div>
              <span>10:16 AM</span>
              <strong>Dr. Rao began review</strong>
              <small>California license and eligibility confirmed.</small>
            </div>
            <div>
              <span>10:18 AM</span>
              <strong>Dr. Rao replied</strong>
              <small>Rapid strep test recommended.</small>
            </div>
          </section>
        )}
      </div>
      <Composer
        placeholder={
          mode === "august"
            ? "Ask August about the plan…"
            : mode === "history"
              ? "Add a note for Dr. Rao…"
              : "Message Dr. Rao…"
        }
        onSubmit={submitMessage}
        onAttach={onUpload}
      />
    </div>
  );
}

function PlanScreen({
  onBack,
  onFollowUp,
  onExplain,
  onHome,
}: {
  onBack: () => void;
  onFollowUp: () => void;
  onExplain: () => void;
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
              <span className="timeline-action">Lab order ready</span>
            </article>
          </div>
          <div>
            <i><span>2</span></i>
            <article>
              <small>While you wait</small>
              <h3>Manage pain and fever</h3>
              <p>Acetaminophen as directed on the label, fluids, and rest.</p>
              <span className="timeline-action">Instructions included</span>
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
          <button className="ask-august" onClick={onExplain} type="button">
            <Icon name="spark" /> Ask August to explain
          </button>
          <button className="text-button" onClick={onHome}>Done for now</button>
        </div>
      </div>
    </div>
  );
}

function FollowUpScreen({
  onBack,
  onEmergency,
  onUpload,
  onHome,
}: {
  onBack: () => void;
  onEmergency: () => void;
  onUpload: () => void;
  onHome: () => void;
}) {
  const [followUpNote, setFollowUpNote] = useState("");
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
        {followUpNote && (
          <>
            <Message author="You" role="Patient · Added" patient>
              {followUpNote}
            </Message>
            <Message author="August AI" role="AI care guide">
              I added that to this follow-up. If it becomes hard to breathe or
              swallow liquids, get urgent help.
            </Message>
          </>
        )}
        <PrimaryButton onClick={onHome}>Close for now</PrimaryButton>
        <button className="text-button" onClick={onEmergency}>
          Symptoms are getting worse
        </button>
      </div>
      <Composer
        placeholder="Tell August how you feel…"
        onSubmit={setFollowUpNote}
        onAttach={onUpload}
      />
    </div>
  );
}

function EmergencyScreen({ onBack }: { onBack: () => void }) {
  const [actionNotice, setActionNotice] = useState("");
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
        <button
          className="emergency-call"
          onClick={() => setActionNotice("On a phone, this would open emergency calling.")}
          type="button"
        >
          <Icon name="phone" /><span><small>Call emergency services</small>911</span>
        </button>
        <button
          className="emergency-location"
          onClick={() => setActionNotice("Location results are simulated in this prototype.")}
          type="button"
        >
          <Icon name="pin" /><span><strong>Find the nearest emergency department</strong><small>Uses your current location</small></span><Icon name="arrow" />
        </button>
        {actionNotice && <div className="emergency-demo-note" aria-live="polite">{actionNotice}</div>}
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
  const downloadSummary = () => {
    const summaryText =
      "August care summary\n\nMedication requested: Adderall refill\nCare boundary: controlled medication requests are not supported through August\nSuggested next step: contact the established prescriber or ongoing primary care";
    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "august-care-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

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
        <PrimaryButton onClick={downloadSummary}>Download my care summary</PrimaryButton>
        <PrimaryButton secondary onClick={onBack}>Start a different concern</PrimaryButton>
        <p className="legal-line">If stopping your medication could be unsafe, contact your prescriber or pharmacist today.</p>
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  createEncounterState,
  encounterReducer,
  type ConversationMessage,
  type EncounterAction,
  type EncounterState,
  type PrescriptionOutcome,
} from "./encounterMachine";
import {
  getPrototypeCase,
  recommendedWalkthroughCases,
  type EncounterPhase,
  type PrototypeFixture,
  type PrototypeVariationId,
} from "./prototypeCases";

type ShellSurface = "home" | "august";

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
  copy: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </svg>
  ),
  reset: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4v6h6" />
      <path d="M5.5 15a7.5 7.5 0 1 0 .7-7.8L4 10" />
    </svg>
  ),
};

const intakeQuestions = [
  "What was your highest temperature, and can you swallow liquids normally?",
  "Any medication allergies or antibiotics that caused problems before?",
  "Any rash, one-sided swelling, or recent exposure to someone with strep?",
];

const intakeSummaryLabels = [
  "Temperature and swallowing",
  "Medication allergies",
  "Rash, swelling, or exposure",
];

const prescriptionQuestions = [
  "Which medication are you asking about, what dose, and is this new or a refill?",
  "What are you treating, and what symptoms are you having right now?",
  "How long have you used it, how did it help, and have you had side effects?",
  "What other medications do you take, and do you have any medication allergies?",
];

const phaseLabels: Record<EncounterPhase, string> = {
  entry: "Home",
  safety: "Safety check",
  intake: "Focused intake",
  summary: "Visit summary",
  eligibility: "Eligibility and consent",
  matching: "Matching",
  clinician_reviewing: "Clinician reviewing",
  clinician_active: "Clinician conversation",
  plan_ready: "Signed care plan",
  follow_up: "Follow-up",
  report: "Report workflow",
  prescription: "Medication assessment",
  emergency: "Emergency interruption",
  unsupported: "Unsupported care",
};

const variationExperience: Record<
  PrototypeVariationId,
  {
    homePill: string;
    homeTitle: string;
    homeIntro: string;
    safetyStatus: string;
    safetyProgress: string;
    safetyQuestion: string;
    safetyCue: string;
    clinicianStatus: string;
    replyEvent: string;
    handoffTitle: string;
    handoffBody: string;
  }
> = {
  classic: {
    homePill: "AI guide + human care",
    homeTitle: "Ask August anything.",
    homeIntro:
      "Start with what is happening. August will help organize the next step.",
    safetyStatus: "August AI · Safety check",
    safetyProgress: "1 of 4",
    safetyQuestion:
      "Before we continue, are you having trouble breathing, unable to swallow liquids, fainting, or severe chest pain right now?",
    safetyCue: "One clear answer is enough.",
    clinicianStatus: "Human clinician conversation",
    replyEvent: "Maya replied · 10:18 AM",
    handoffTitle: "One continuous visit",
    handoffBody: "Messages to Maya become part of this clinician conversation.",
  },
  ambient: {
    homePill: "A quieter way to get care",
    homeTitle: "What’s on your mind?",
    homeIntro: "Begin in your own words. We’ll take it one question at a time.",
    safetyStatus: "August · One quick check",
    safetyProgress: "Safety first",
    safetyQuestion:
      "Before we go on, tell me if breathing, swallowing liquids, fainting, or severe chest pain is a problem right now.",
    safetyCue: "Take your time. A short answer works.",
    clinicianStatus: "Maya is here",
    replyEvent: "Maya joined the conversation",
    handoffTitle: "The conversation continues here",
    handoffBody: "Reply when you are ready. You can leave and return at any time.",
  },
  clinical: {
    homePill: "Structured care, clearly explained",
    homeTitle: "Start a care question.",
    homeIntro:
      "Your answers form a reviewable summary before anything reaches a clinician.",
    safetyStatus: "August AI · Safety triage",
    safetyProgress: "Safety screen · 1/4",
    safetyQuestion:
      "Current warning signs: trouble breathing, unable to swallow liquids, fainting, or severe chest pain?",
    safetyCue: "Patient-reported · not shared with a clinician yet",
    clinicianStatus: "Clinician thread · Patient-visible",
    replyEvent: "Clinician reply · 10:18 AM · Shared record",
    handoffTitle: "Message visibility is explicit",
    handoffBody: "This thread is visible to Maya. The August sidecar remains private.",
  },
  concierge: {
    homePill: "Personal care, thoughtfully coordinated",
    homeTitle: "How can we care for you today?",
    homeIntro:
      "Tell August what changed. We’ll prepare the right next step with you.",
    safetyStatus: "August · Preparing your care",
    safetyProgress: "Step 1 of 4",
    safetyQuestion:
      "First, I’ll check for anything urgent. Are you having trouble breathing, unable to swallow liquids, fainting, or severe chest pain?",
    safetyCue: "I’ll use this answer to guide what happens next.",
    clinicianStatus: "Maya · Your care team",
    replyEvent: "Maya is ready for you · 10:18 AM",
    handoffTitle: "Your clinician has the context",
    handoffBody: "Maya reviewed your summary so you do not have to start over.",
  },
};

function Icon({ name }: { name: keyof typeof icons }) {
  return <span className="icon">{icons[name]}</span>;
}

function AugustOrb({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`august-orb ${compact ? "august-orb-compact" : ""}`}
      aria-hidden="true"
    >
      <span />
    </span>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span>august</span>
    </div>
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

function BottomNav({
  active,
  onHome,
  onAugust,
}: {
  active: ShellSurface;
  onHome: () => void;
  onAugust: () => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="August navigation">
      <div className="bottom-nav-main glass">
        <button
          aria-current={active === "home" ? "page" : undefined}
          aria-label="Home"
          className={active === "home" ? "active" : ""}
          onClick={onHome}
          type="button"
        >
          <Icon name="home" />
          <span>Home</span>
        </button>
      </div>
      <button
        aria-current={active === "august" ? "page" : undefined}
        aria-label={
          active === "august" ? "August chat, current" : "Open August chat"
        }
        className={
          active === "august"
            ? "bottom-nav-assistant active"
            : "bottom-nav-assistant"
        }
        onClick={onAugust}
        type="button"
      >
        <AugustOrb compact />
        <span className="bottom-nav-assistant-label">August</span>
      </button>
    </nav>
  );
}

function ClinicianPortrait({
  small = false,
}: {
  small?: boolean;
}) {
  return (
    <img
      className={small ? "clinician-portrait small" : "clinician-portrait"}
      src="/people/maya-rao-fictional.png"
      alt="Maya Rao"
    />
  );
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
      {person ? (
        <ClinicianPortrait small />
      ) : (
        <AugustOrb compact />
      )}
      <div className="header-copy">
        <strong>{title}</strong>
        <span>{status}</span>
      </div>
      <span className="history-indicator" aria-hidden="true">
        <Icon name="file" />
      </span>
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
  placeholder,
  onSubmit,
  onAttach,
  recipient,
}: {
  placeholder: string;
  onSubmit: (value: string) => void;
  onAttach?: () => void;
  recipient?: string;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="composer-stack">
      <form
        className="composer glass"
        onSubmit={(event) => {
          event.preventDefault();
          if (!value.trim()) return;
          onSubmit(value.trim());
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
        <label>
          {recipient && <span className="composer-recipient">{recipient}</span>}
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
        </label>
        <button
          className="send-button"
          disabled={!value.trim()}
          aria-label="Send message"
        >
          <Icon name="send" />
        </button>
      </form>
      <p className="composer-boundary">
        Not emergency care · Call 911 for emergencies.
      </p>
    </div>
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

function ThreadMessages({
  messages,
}: {
  messages: ConversationMessage[];
}) {
  return (
    <>
      {messages.map((item) =>
        item.author === "system" ? (
          <div className="thread-event" key={item.id}>
            <Icon name="check" />
            <span>{item.content}</span>
          </div>
        ) : (
          <Message
            author={
              item.author === "patient"
                ? "You"
                : item.author === "clinician"
                  ? "Maya Rao"
                  : "August AI"
            }
            clinician={item.author === "clinician"}
            key={item.id}
            patient={item.author === "patient"}
            role={
              item.visibility === "private-to-august"
                ? item.author === "patient"
                  ? "Private to August"
                  : "AI care guide"
                : item.author === "clinician"
                  ? `Human clinician · ${item.timestamp}`
                  : `Patient · ${item.delivery}`
            }
          >
            {item.content}
          </Message>
        )
      )}
    </>
  );
}

function canContinueEligibility(state: EncounterState) {
  return (
    state.eligibility.careFor === "self" &&
    state.eligibility.adultConfirmed &&
    state.eligibility.identityConfirmed &&
    state.eligibility.locationConfirmed
  );
}

export function AugustPrototype({
  initialView = "entry",
  initialConcern = "",
  initialFixture = "default",
  initialCaseId = "home",
  variation = "classic",
}: {
  initialView?: EncounterPhase;
  initialConcern?: string;
  initialFixture?: PrototypeFixture;
  initialCaseId?: string;
  variation?: PrototypeVariationId;
}) {
  const initialEncounter = useMemo(
    () =>
      createEncounterState({
        phase: initialView,
        concern: initialConcern,
        fixture: initialFixture,
      }),
    [initialConcern, initialFixture, initialView]
  );
  const [state, dispatch] = useReducer(encounterReducer, initialEncounter);
  const [surface, setSurface] = useState<ShellSurface>(() =>
    initialView === "entry" ? "home" : "august"
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const activeSurface = state.phase === "emergency" ? "august" : surface;

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSurface, state.phase]);

  const reset = () => {
    dispatch({
      type: "RESET",
      state: createEncounterState(),
    });
    setSurface("home");
  };

  const openHome = () => setSurface("home");

  const openAugust = () => {
    if (state.phase === "clinician_active" && state.recipient !== "august") {
      dispatch({ type: "SET_RECIPIENT", recipient: "august" });
    }
    setSurface("august");
  };

  const startConcern = (concern: string) => {
    setSurface("august");
    dispatch({ type: "START_CONCERN", concern });
  };

  const openUpload = (origin: EncounterPhase) => {
    setSurface("august");
    dispatch({ type: "START_UPLOAD", origin });
  };

  const backTo = (phase: EncounterPhase) =>
    dispatch({ type: "GO_TO", phase });

  const showNavigation = state.phase !== "emergency";

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
            {activeSurface === "home" && (
              <HomeScreen
                activeEncounter={
                  state.phase === "entry"
                    ? null
                    : {
                        concern:
                          state.concern ||
                          (state.upload
                            ? `Report: ${state.upload.filename || "Not yet selected"}`
                            : "Current care conversation"),
                        phaseLabel: phaseLabels[state.phase],
                      }
                }
                focused={false}
                onContinue={openAugust}
                onStartOver={reset}
                variation={variation}
                onSubmit={startConcern}
                onUpload={() => openUpload("entry")}
              />
            )}
            {activeSurface === "august" && state.phase === "entry" && (
              <HomeScreen
                activeEncounter={null}
                focused
                onContinue={openAugust}
                onStartOver={reset}
                variation={variation}
                onSubmit={startConcern}
                onUpload={() => openUpload("entry")}
                onHome={openHome}
              />
            )}
            {activeSurface === "august" && state.phase === "safety" && (
              <SafetyScreen
                variation={variation}
                concern={state.concern}
                clarification={state.safetyClarification}
                onAnswer={(answer) =>
                  dispatch({ type: "SUBMIT_SAFETY", answer })
                }
                onUpload={() => openUpload("safety")}
                onBack={openHome}
              />
            )}
            {activeSurface === "august" && state.phase === "intake" && (
              <IntakeScreen
                concern={state.concern}
                answers={state.intakeAnswers}
                step={state.intakeStep}
                onAnswer={(answer) =>
                  dispatch({ type: "SUBMIT_INTAKE", answer })
                }
                onUpload={() => openUpload("intake")}
                onBack={() => backTo("safety")}
              />
            )}
            {activeSurface === "august" && state.phase === "summary" && (
              <SummaryScreen
                state={state}
                dispatch={dispatch}
                onContinue={() => backTo("eligibility")}
                onBack={() => backTo("intake")}
              />
            )}
            {activeSurface === "august" && state.phase === "eligibility" && (
              <EligibilityScreen
                state={state}
                dispatch={dispatch}
                onBack={() => backTo("summary")}
              />
            )}
            {activeSurface === "august" && state.phase === "matching" && (
              <MatchingScreen
                clinicianState={state.clinicianState}
                onBack={() => backTo("eligibility")}
                onViewSummary={() => backTo("summary")}
              />
            )}
            {activeSurface === "august" &&
              state.phase === "clinician_reviewing" && (
              <ClinicianReviewingScreen
                messages={state.clinicianMessages.filter(
                  (item) => item.author === "patient"
                )}
                onBack={() => backTo("matching")}
                onSend={(content) =>
                  dispatch({
                    type: "SEND_MESSAGE",
                    recipient: "clinician",
                    content,
                  })
                }
                onUpload={() => openUpload("clinician_active")}
              />
            )}
            {activeSurface === "august" &&
              state.phase === "clinician_active" && (
              <ClinicianScreen
                variation={variation}
                state={state}
                dispatch={dispatch}
                onBack={() => backTo("clinician_reviewing")}
                onUpload={() => openUpload("clinician_active")}
              />
            )}
            {activeSurface === "august" && state.phase === "plan_ready" && (
              <PlanScreen
                onBack={() => backTo("clinician_active")}
                onFollowUp={() => backTo("follow_up")}
                onExplain={() =>
                  dispatch({ type: "SET_RECIPIENT", recipient: "august" })
                }
                onHome={openHome}
              />
            )}
            {activeSurface === "august" && state.phase === "follow_up" && (
              <FollowUpScreen
                state={state}
                dispatch={dispatch}
                onBack={() => backTo("plan_ready")}
                onEmergency={() => backTo("emergency")}
                onUpload={() => openUpload("follow_up")}
                onClinician={() => {
                  dispatch({
                    type: "SET_RECIPIENT",
                    recipient: "clinician",
                  });
                  backTo("clinician_active");
                }}
                onHome={openHome}
              />
            )}
            {activeSurface === "august" && state.phase === "report" && (
              <ReportScreen
                state={state}
                dispatch={dispatch}
                onBack={() =>
                  backTo(state.upload?.returnTo ?? "summary")
                }
              />
            )}
            {activeSurface === "august" && state.phase === "prescription" && (
              <PrescriptionScreen
                state={state}
                dispatch={dispatch}
                onBack={openHome}
                onUpload={() => openUpload("prescription")}
              />
            )}
            {state.phase === "emergency" && (
              <EmergencyScreen
                state={state}
                dispatch={dispatch}
              />
            )}
            {activeSurface === "august" && state.phase === "unsupported" && (
              <UnsupportedScreen concern={state.concern} onBack={openHome} />
            )}
          </div>
          {showNavigation && (
            <BottomNav
              active={activeSurface}
              onAugust={openAugust}
              onHome={openHome}
            />
          )}
        </div>
        <ReviewerRail
          initialCaseId={initialCaseId}
          initialState={initialEncounter}
          state={state}
          dispatch={dispatch}
          variation={variation}
        />
      </section>
    </main>
  );
}

function HomeScreen({
  activeEncounter,
  focused,
  onContinue,
  onHome,
  onStartOver,
  variation,
  onSubmit,
  onUpload,
}: {
  activeEncounter: {
    concern: string;
    phaseLabel: string;
  } | null;
  focused: boolean;
  onContinue: () => void;
  onHome?: () => void;
  onStartOver: () => void;
  variation: PrototypeVariationId;
  onSubmit: (value: string) => void;
  onUpload: () => void;
}) {
  const [value, setValue] = useState("");
  const concernInputRef = useRef<HTMLTextAreaElement>(null);
  const experience = variationExperience[variation];

  useEffect(() => {
    const pendingValue = concernInputRef.current?.value.trim();
    if (pendingValue) setValue(pendingValue);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const submittedValue =
      value.trim() ||
      String(
        new FormData(event.currentTarget as HTMLFormElement).get("concern") ?? ""
      ).trim();
    if (!submittedValue) return;
    onSubmit(submittedValue);
  };

  if (activeEncounter) {
    return (
      <div className="screen home-screen continuity-home">
        <nav className="home-nav">
          <Brand />
          <span className="avatar" aria-label="Parth profile">
            P
          </span>
        </nav>
        <section className="home-hero">
          <Pill>Conversation saved</Pill>
          <span className="home-greeting">Welcome back, Parth</span>
          <h2>Your care is waiting.</h2>
          <p>
            Return whenever you are ready. Your answers and current step are
            still here.
          </p>
        </section>
        <section className="continuity-card glass" aria-label="Current encounter">
          <div className="continuity-card-heading">
            <AugustOrb compact />
            <div>
              <small>Continue with August</small>
              <strong>{activeEncounter.phaseLabel}</strong>
            </div>
          </div>
          <p>{activeEncounter.concern}</p>
          <PrimaryButton onClick={onContinue}>
            Continue with August
          </PrimaryButton>
        </section>
        <button
          className="start-over-button"
          onClick={onStartOver}
          type="button"
        >
          Start a new question
        </button>
        <div className="privacy-note">
          <Icon name="shield" />
          <p>
            <strong>Your conversation is unchanged.</strong>
            Nothing is shared with a clinician unless the care flow says so.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`screen home-screen ${
        focused ? "focused-august-screen" : ""
      }`}
    >
      {focused ? (
        <Header
          title="August"
          status="Private AI care guide"
          onBack={onHome ?? onStartOver}
        />
      ) : (
        <nav className="home-nav">
          <Brand />
          <span className="avatar" aria-label="Parth profile">
            P
          </span>
        </nav>
      )}
      <section className="home-hero">
        <div className="home-hero-topline">
          <Pill>
            {focused
              ? "Your private August conversation"
              : experience.homePill}
          </Pill>
          {!focused && (
            <button
              className="home-presence"
              onClick={onContinue}
              type="button"
              aria-label="August is ready. Open private chat"
            >
              <AugustOrb />
              <span>
                <small>August</small>
                <strong>Ready</strong>
              </span>
            </button>
          )}
        </div>
        <span className="home-greeting">Good morning, Parth</span>
        <h2>{experience.homeTitle}</h2>
        <p>{experience.homeIntro}</p>
      </section>
      <form className="hero-composer glass" onSubmit={submit}>
        <textarea
          name="concern"
          ref={concernInputRef}
          value={value}
          onInput={(event) => setValue(event.currentTarget.value)}
          placeholder="Describe what’s going on…"
          aria-label="Describe what’s going on"
        />
        <div>
          <button
            type="button"
            className="attach-button"
            onClick={onUpload}
            aria-label="Attach a report"
          >
            <Icon name="plus" />
          </button>
          <button
            className={`send-button ${!value.trim() ? "send-button-idle" : ""}`}
            aria-label="Start conversation"
            disabled={!value.trim()}
          >
            <Icon name="send" />
          </button>
        </div>
      </form>
      <p className="hero-care-boundary">
        Not emergency care · Call 911 for emergencies.
      </p>
      <div className={`shortcut-grid shortcut-grid-${variation}`}>
        <button
          onClick={() =>
            onSubmit("My throat has hurt for five days and I have a fever.")
          }
          type="button"
        >
          <span className="shortcut-icon">
            <Icon name="spark" />
          </span>
          <strong>Check a symptom</strong>
          <small>Start in your words</small>
          <Icon name="arrow" />
        </button>
        {variation !== "ambient" && (
          <button
            onClick={() =>
              onSubmit(variation === "concierge"
                ? "I would like to talk with a clinician."
                : "I have a medication question.")
            }
            type="button"
          >
            <span className="shortcut-icon">
              <Icon name={variation === "concierge" ? "doctor" : "file"} />
            </span>
            <strong>
              {variation === "concierge" ? "Talk to a clinician" : "Medication"}
            </strong>
            <small>
              {variation === "concierge"
                ? "We’ll prepare the visit"
                : "Assessment first"}
            </small>
            <Icon name="arrow" />
          </button>
        )}
        {variation === "classic" && (
          <button
            onClick={() =>
              onSubmit("I would like to talk with a clinician.")
            }
            type="button"
          >
            <span className="shortcut-icon">
              <Icon name="doctor" />
            </span>
            <strong>Doctor visit</strong>
            <small>Prepare context</small>
            <Icon name="arrow" />
          </button>
        )}
        <button onClick={onUpload} type="button">
          <span className="shortcut-icon">
            <Icon name="lab" />
          </span>
          <strong>Upload result</strong>
          <small>Review together</small>
          <Icon name="arrow" />
        </button>
      </div>
      <div className={`privacy-note experience-note experience-note-${variation}`}>
        <Icon name="shield" />
        <p>
          <strong>
            {variation === "clinical"
              ? "You review the record before it is shared."
              : variation === "concierge"
                ? "Your context carries into the clinician visit."
                : variation === "ambient"
                  ? "One conversation, at your pace."
                  : "August is an AI care guide."}
          </strong>
          {variation === "classic"
            ? "A human clinician makes clinical decisions."
            : variation === "clinical"
              ? "A human clinician makes every clinical decision."
              : variation === "concierge"
                ? "A human clinician makes clinical decisions."
                : "Human care is available when it is the right next step."}
        </p>
      </div>
    </div>
  );
}

function SafetyScreen({
  variation,
  concern,
  clarification,
  onAnswer,
  onUpload,
  onBack,
}: {
  variation: PrototypeVariationId;
  concern: string;
  clarification: boolean;
  onAnswer: (answer: string) => void;
  onUpload: () => void;
  onBack: () => void;
}) {
  const experience = variationExperience[variation];
  return (
    <div className="screen conversation-screen">
      <Header
        title="Sore throat"
        status={experience.safetyStatus}
        onBack={onBack}
      />
      <div className="conversation-body">
        <div className="step-row">
          <span>Safety</span>
          <div>
            <i className="active" />
            <i />
            <i />
            <i />
          </div>
          <span>{experience.safetyProgress}</span>
        </div>
        <Message author="You" role="Patient" patient>
          {concern || "My throat has hurt for five days and I have a fever."}
        </Message>
        <Message author="August AI" role="AI care guide">
          {clarification
            ? "I want to make sure I understood. Are any of these happening right now: trouble breathing, unable to swallow liquids, fainting, or severe chest pain?"
            : experience.safetyQuestion}
        </Message>
        <div className={`variation-cue variation-cue-${variation}`}>
          <Icon name={variation === "clinical" ? "file" : "shield"} />
          <span>{experience.safetyCue}</span>
        </div>
        {clarification && (
          <div className="clarification-note">
            <Icon name="shield" />
            <span>Please answer with what is happening now.</span>
          </div>
        )}
      </div>
      <Composer
        placeholder="Answer in your own words…"
        onSubmit={onAnswer}
        onAttach={onUpload}
        recipient="To August"
      />
    </div>
  );
}

function IntakeScreen({
  concern,
  answers,
  step,
  onAnswer,
  onUpload,
  onBack,
}: {
  concern: string;
  answers: string[];
  step: number;
  onAnswer: (answer: string) => void;
  onUpload: () => void;
  onBack: () => void;
}) {
  const routineAnswers = answers.slice(1);
  return (
    <div className="screen conversation-screen">
      <Header
        title="Sore throat"
        status="August AI · Focused intake"
        onBack={onBack}
      />
      <div className="conversation-body">
        <div className="step-row">
          <span>Intake</span>
          <div>
            <i className="active" />
            <i className={step >= 1 ? "active" : ""} />
            <i className={step >= 2 ? "active" : ""} />
            <i />
          </div>
          <span>{Math.min(step + 2, 4)} of 4</span>
        </div>
        <Message author="You" role="Patient" patient>
          {concern || "My throat has hurt for five days and I have a fever."}
        </Message>
        {answers[0] && (
          <Message author="You" role="Safety answer" patient>
            {answers[0]}
          </Message>
        )}
        {routineAnswers.map((answer, index) => (
          <div key={`${answer}-${index}`}>
            <Message author="August AI" role="AI care guide">
              {intakeQuestions[index]}
            </Message>
            <Message author="You" role="Patient" patient>
              {answer}
            </Message>
          </div>
        ))}
        <Message author="August AI" role="AI care guide">
          {intakeQuestions[Math.min(step, intakeQuestions.length - 1)]}
        </Message>
        <div className="turn-note">
          <span>{step + 1}</span>
          <p>One focused question at a time.</p>
        </div>
      </div>
      <Composer
        placeholder="Write your answer…"
        onSubmit={onAnswer}
        onAttach={onUpload}
        recipient="To August"
      />
    </div>
  );
}

function SummaryScreen({
  state,
  dispatch,
  onContinue,
  onBack,
}: {
  state: EncounterState;
  dispatch: React.Dispatch<EncounterAction>;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [correction, setCorrection] = useState("");
  const recordedSummary: string[] =
    state.intakeAnswers.length > 0
      ? [
          state.concern || "Sore throat concern",
          `Safety answer: ${state.intakeAnswers[0]}`,
          ...state.intakeAnswers
            .slice(1)
            .map(
              (answer, index) =>
                `${intakeSummaryLabels[index]}: ${answer}`
            ),
        ]
      : state.isReviewFixture
        ? [
            state.concern || "Sore throat for five days",
            "Breathing normally; able to swallow liquids",
            "No medication allergies reported",
            "No rash or one-sided swelling reported",
          ]
        : [
            ...(state.concern ? [state.concern] : []),
            ...(state.upload?.confirmed
              ? state.upload.extractedFields.map(
                  (field) => `${field.label}: ${field.value}`
                )
              : []),
          ];
  const summaryItems = [
    ...recordedSummary,
    ...state.summaryCorrections.map(
      (item) => `Patient correction: ${item}`
    ),
  ];
  return (
    <div className="screen summary-screen">
      <Header
        title="Prepare your visit"
        status="Review before sharing"
        onBack={onBack}
      />
      <div className="page-body">
        <span className="eyebrow">Review before sharing</span>
        <h2>Pre-visit summary</h2>
        <p className="page-intro">
          Check the timing, safety answers, and details before they go to a clinician.
        </p>
        <section className="summary-card">
          <div className="card-heading">
            <span>
              <Icon name="file" />
              <strong>Patient-reported details</strong>
            </span>
            <button type="button" onClick={() => setEditing(!editing)}>
              {editing ? "Close" : "Correct"}
            </button>
          </div>
          <ul>
            {summaryItems.map((item) => (
              <li key={item}>
                <Icon name="check" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {editing && (
            <form
              className="summary-correction"
              onSubmit={(event) => {
                event.preventDefault();
                if (!correction.trim()) return;
                dispatch({
                  type: "ADD_SUMMARY_CORRECTION",
                  correction,
                });
                setCorrection("");
                setEditing(false);
              }}
            >
              <label htmlFor="summary-correction">What should change?</label>
              <textarea
                id="summary-correction"
                value={correction}
                onChange={(event) => setCorrection(event.target.value)}
                placeholder="Add the correction in your own words…"
              />
              <button type="submit" disabled={!correction.trim()}>
                Save correction
              </button>
            </form>
          )}
          <div className="summary-source">
            <Icon name="shield" />
            <span>
              {state.isReviewFixture
                ? "Sample scenario data for prototype review"
                : `Built only from your answers${
                    state.upload?.confirmed ? " and confirmed report" : ""
                  }`}
            </span>
          </div>
        </section>
        {!state.isReviewFixture && state.intakeAnswers.length === 0 && (
          <section className="unanswered-card">
            <Icon name="clock" />
            <div>
              <strong>Still unanswered</strong>
              <span>
                Safety signs, medication allergies, and relevant history have not been provided.
              </span>
            </div>
          </section>
        )}
        <section className="clinician-recommendation">
          <Icon name="doctor" />
          <div>
            <Pill>Recommended next step</Pill>
            <h3>A clinician should review this</h3>
            <p>A clinician can decide whether testing or treatment is needed.</p>
          </div>
        </section>
        <PrimaryButton onClick={onContinue}>
          Confirm summary and continue
        </PrimaryButton>
      </div>
    </div>
  );
}

function EligibilityScreen({
  state,
  dispatch,
  onBack,
}: {
  state: EncounterState;
  dispatch: React.Dispatch<EncounterAction>;
  onBack: () => void;
}) {
  const eligible =
    canContinueEligibility(state) &&
    state.consent.shareSummary &&
    state.consent.telehealth;
  return (
    <div className="screen summary-screen">
      <Header
        title="Before clinician review"
        status="Confirm who and where"
        onBack={onBack}
      />
      <div className="page-body">
        <span className="eyebrow">Eligibility and consent</span>
        <h2>Review before clinician matching</h2>
        <p className="page-intro">
          Confirm who and where you are, then choose what can be shared.
        </p>
        <section className="eligibility-card">
          <fieldset>
            <legend>Who is this care for?</legend>
            <div className="choice-row">
              <button
                className={state.eligibility.careFor === "self" ? "selected" : ""}
                onClick={() =>
                  dispatch({
                    type: "SET_ELIGIBILITY",
                    eligibility: { careFor: "self" },
                  })
                }
                type="button"
              >
                Myself
              </button>
              <button
                className={
                  state.eligibility.careFor === "someone-else" ? "selected" : ""
                }
                onClick={() =>
                  dispatch({
                    type: "SET_ELIGIBILITY",
                    eligibility: { careFor: "someone-else" },
                  })
                }
                type="button"
              >
                Someone else
              </button>
            </div>
            {state.eligibility.careFor === "someone-else" && (
              <p className="eligibility-boundary">
                This walkthrough continues with care for yourself. Caregiver authorization is a documented next flow.
              </p>
            )}
          </fieldset>
          <label className="confirm-row">
            <input
              type="checkbox"
              checked={state.eligibility.adultConfirmed}
              onChange={(event) =>
                dispatch({
                  type: "SET_ELIGIBILITY",
                  eligibility: { adultConfirmed: event.target.checked },
                })
              }
            />
            <span>
              <strong>I am 18 or older</strong>
              Age may affect whether care is available.
            </span>
          </label>
          <label className="confirm-row">
            <input
              type="checkbox"
              checked={state.eligibility.identityConfirmed}
              onChange={(event) =>
                dispatch({
                  type: "SET_ELIGIBILITY",
                  eligibility: { identityConfirmed: event.target.checked },
                })
              }
            />
            <span>
              <strong>My legal name and date of birth are correct</strong>
              A production visit may require identity verification before a clinician accepts.
            </span>
          </label>
          <label className="location-entry">
            <span>Current physical location</span>
            <input
              type="text"
              value={state.eligibility.state}
              onChange={(event) =>
                dispatch({
                  type: "SET_ELIGIBILITY",
                  eligibility: {
                    state: event.target.value,
                    locationConfirmed: false,
                  },
                })
              }
              placeholder="State"
              autoComplete="address-level1"
            />
          </label>
          <label className="confirm-row">
            <input
              type="checkbox"
              checked={state.eligibility.locationConfirmed}
              disabled={!state.eligibility.state.trim()}
              onChange={(event) =>
                dispatch({
                  type: "SET_ELIGIBILITY",
                  eligibility: { locationConfirmed: event.target.checked },
                })
              }
            />
            <span>
              <strong>
                I am physically located in {state.eligibility.state || "the state entered above"}
              </strong>
              Clinician availability depends on where you are during the consultation.
            </span>
          </label>
          <label className="confirm-row">
            <input
              type="checkbox"
              checked={state.consent.shareSummary}
              onChange={(event) =>
                dispatch({
                  type: "SET_CONSENT",
                  consent: { shareSummary: event.target.checked },
                })
              }
            />
            <span>
              <strong>Share my confirmed visit summary</strong>
              Only the details reviewed on the previous screen are shared with the clinical provider.
            </span>
          </label>
          <label className="confirm-row">
            <input
              type="checkbox"
              checked={state.consent.telehealth}
              onChange={(event) =>
                dispatch({
                  type: "SET_CONSENT",
                  consent: { telehealth: event.target.checked },
                })
              }
            />
            <span>
              <strong>I consent to a telehealth consultation</strong>
              A clinician-patient relationship begins only if a clinician accepts and starts review.
            </span>
          </label>
        </section>
        <PrimaryButton
          disabled={!eligible}
          onClick={() => dispatch({ type: "GO_TO", phase: "matching" })}
        >
          Confirm and find a clinician
        </PrimaryButton>
      </div>
    </div>
  );
}

function MatchingScreen({
  clinicianState,
  onBack,
  onViewSummary,
}: {
  clinicianState: EncounterState["clinicianState"];
  onBack: () => void;
  onViewSummary: () => void;
}) {
  const delayed = clinicianState === "delayed";
  const unavailable = clinicianState === "unavailable";
  return (
    <div className="screen waiting-screen">
      <Header title="Sore throat" status="Finding a clinician" onBack={onBack} />
      <div className="page-body">
        <div className="orb">
          <span>
            <Icon name="doctor" />
          </span>
        </div>
        <Pill>
          {unavailable
            ? "No clinician available"
            : delayed
              ? "Taking longer than expected"
              : "Case received"}
        </Pill>
        <h2>
          {unavailable
            ? "This consultation cannot start right now"
            : delayed
              ? "Your case is still in queue"
              : "Your visit is being matched"}
        </h2>
        <p className="page-intro">
          {unavailable
            ? "No clinician accepted the case. You can review your summary or choose another care option."
            : delayed
              ? "You can keep waiting or return later. We’ll update this visit when a clinician is assigned."
              : "You can leave this screen. This visit will update when a clinician is assigned."}
        </p>
        <div className="wait-meta">
          <span>Last updated</span>
          <strong>Just now</strong>
          <small>
            {unavailable
              ? "Consultation closed"
              : "Response time varies; no fixed time is promised in this prototype"}
          </small>
        </div>
        <section className="status-track">
          <div className="done">
            <i>
              <Icon name="check" />
            </i>
            <span>
              <strong>Information prepared</strong>
              <small>Summary and consent complete</small>
            </span>
          </div>
          <div className="done">
            <i>
              <Icon name="check" />
            </i>
            <span>
              <strong>Eligibility confirmed</strong>
              <small>Care for self · age · current state</small>
            </span>
          </div>
          <div className="current">
            <i>
              <span />
            </i>
            <span>
              <strong>
                {unavailable ? "No match available" : "Matching clinician"}
              </strong>
              <small>
                {unavailable
                  ? "No clinician accepted"
                  : delayed
                    ? "Still searching"
                    : "Status updates appear here"}
              </small>
            </span>
          </div>
          <div>
            <i />
            <span>
              <strong>Clinician review</strong>
              <small>Begins after a clinician accepts</small>
            </span>
          </div>
        </section>
        <div className="worsen-note">
          <Icon name="shield" />
          <span>
            <strong>If symptoms worsen</strong>
            Get urgent help instead of waiting here.
          </span>
        </div>
        <button className="text-button" onClick={onViewSummary} type="button">
          View submitted summary
        </button>
        {unavailable && (
          <button className="text-button" onClick={onBack} type="button">
            Review eligibility and care details
          </button>
        )}
      </div>
    </div>
  );
}

function ClinicianReviewingScreen({
  messages,
  onSend,
  onUpload,
  onBack,
}: {
  messages: ConversationMessage[];
  onSend: (content: string) => void;
  onUpload: () => void;
  onBack: () => void;
}) {
  return (
    <div className="screen conversation-screen clinician-screen">
      <Header
        title="Maya Rao · Sample"
        status="Clinical review · MDI-affiliated care"
        onBack={onBack}
        person
      />
      <div className="conversation-body">
        <div className="joined-event">
          <span className="line" />
          <Pill tone="white">Assigned · 10:16 AM</Pill>
          <span className="line" />
        </div>
        <section className="clinical-start-event">
          <Icon name="shield" />
          <div>
            <strong>Clinical review starts here</strong>
            <span>
              This sample clinician has accepted the consultation. Messages below are part of the clinical conversation.
            </span>
          </div>
        </section>
        <section className="doctor-profile-card">
          <ClinicianPortrait />
          <div>
            <strong>Maya Rao</strong>
            <span>Sample clinician · MDI-affiliated care</span>
            <small>Reviewing your confirmed summary and any uploaded files.</small>
          </div>
        </section>
        <div className="reviewing-state clinician-wait">
          <span className="thinking-mark">
            <i />
            <i />
            <i />
          </span>
          <div>
            <strong>Maya is reviewing</strong>
            <small>No reply has been sent yet</small>
          </div>
        </div>
        <section className="waiting-expectation">
          <div>
            <Icon name="clock" />
            <span>
              <strong>You can leave this screen.</strong>
              This visit will update when Maya replies.
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
        <ThreadMessages messages={messages} />
      </div>
      <Composer
        placeholder="Add a note for Maya…"
        onSubmit={onSend}
        onAttach={onUpload}
        recipient="To Maya"
      />
    </div>
  );
}

function ClinicianScreen({
  variation,
  state,
  dispatch,
  onUpload,
  onBack,
}: {
  variation: PrototypeVariationId;
  state: EncounterState;
  dispatch: React.Dispatch<EncounterAction>;
  onUpload: () => void;
  onBack: () => void;
}) {
  const privateToAugust = state.recipient === "august";
  const experience = variationExperience[variation];
  return (
    <div className="screen conversation-screen clinician-screen">
      <Header
        title="Sore throat visit"
        status={
          privateToAugust
            ? "Private August explanation"
            : `${experience.clinicianStatus} · Sample`
        }
        onBack={onBack}
        person={!privateToAugust}
      />
      <div className="recipient-switch" aria-label="Message recipient">
        <button
          className={!privateToAugust ? "active" : ""}
          onClick={() =>
            dispatch({ type: "SET_RECIPIENT", recipient: "clinician" })
          }
          type="button"
          aria-pressed={!privateToAugust}
        >
          <ClinicianPortrait small />
          Maya
        </button>
        <button
          className={privateToAugust ? "active" : ""}
          onClick={() =>
            dispatch({ type: "SET_RECIPIENT", recipient: "august" })
          }
          type="button"
          aria-pressed={privateToAugust}
        >
          <span className="recipient-august">
            <Icon name="spark" />
          </span>
          Ask August
        </button>
      </div>
      <div className="conversation-body" aria-live="polite">
        {privateToAugust ? (
          <>
              <section className="private-sidecar">
              <Icon name="shield" />
              <div>
                <strong>Private to August</strong>
                <span>
                  Maya cannot see messages in this sidecar unless you choose to share them.
                </span>
              </div>
            </section>
            <ThreadMessages messages={state.augustMessages} />
          </>
        ) : (
          <>
            {variation === "concierge" ? (
              <section className="concierge-handoff">
                <ClinicianPortrait />
                <div>
                  <strong>{experience.replyEvent}</strong>
                  <span>{experience.handoffBody}</span>
                </div>
              </section>
            ) : (
              <div className="joined-event">
                <span className="line" />
                <Pill tone="white">{experience.replyEvent}</Pill>
                <span className="line" />
              </div>
            )}
            <section className={`handoff-context handoff-context-${variation}`}>
              <Icon name={variation === "clinical" ? "shield" : "doctor"} />
              <div>
                <strong>{experience.handoffTitle}</strong>
                <span>{experience.handoffBody}</span>
              </div>
            </section>
            <ThreadMessages messages={state.clinicianMessages} />
            {state.prescriptionOutcome && (
              <PrescriptionOutcomeCard outcome={state.prescriptionOutcome} />
            )}
            <button className="upload-inline" onClick={onUpload} type="button">
              <Icon name="lab" />
              <span>Share a report in this visit</span>
              <Icon name="arrow" />
            </button>
            {state.clinicianMessages.some(
              (item) => item.author === "patient"
            ) ? (
              <div className="awaiting-clinician">
                <Icon name="clock" />
                <div>
                  <strong>Answer sent to Maya</strong>
                  <span>The care plan appears after clinician review.</span>
                </div>
              </div>
            ) : (
              <div className="turn-note clinician-turn">
                <span>1</span>
                <p>Reply to Maya before a plan can be signed.</p>
              </div>
            )}
          </>
        )}
      </div>
      <Composer
        placeholder={
          privateToAugust
            ? "Ask August about the visit…"
            : "Message Maya…"
        }
        onSubmit={(content) =>
          dispatch({
            type: "SEND_MESSAGE",
            recipient: state.recipient,
            content,
          })
        }
        onAttach={onUpload}
        recipient={privateToAugust ? "Private to August" : "To Maya"}
      />
    </div>
  );
}

function PrescriptionOutcomeCard({
  outcome,
}: {
  outcome: Exclude<PrescriptionOutcome, null>;
}) {
  const copy = {
    appropriate: {
      label: "Medication appropriate",
      title: "Maya approved an antibiotic",
      body: "Choose a pharmacy or take the prescription to a pharmacy you prefer. Review dosage and allergy information before fulfillment.",
    },
    "test-first": {
      label: "Testing first",
      title: "A rapid test is needed before medication",
      body: "The result will return to this visit for Maya to review before any medication decision.",
    },
    declined: {
      label: "Different care recommended",
      title: "An antibiotic is not recommended now",
      body: "Maya’s plan focuses on symptom relief, monitoring, and testing if symptoms continue or worsen.",
    },
  }[outcome];
  return (
    <section className={`prescription-outcome outcome-${outcome}`}>
      <Pill>{copy.label}</Pill>
      <h3>{copy.title}</h3>
      <p>{copy.body}</p>
    </section>
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
        status="Sample plan · Signed by Maya Rao"
        onBack={onBack}
        person
      />
      <div className="page-body">
        <div className="plan-hero">
          <div className="success-seal">
            <Icon name="check" />
          </div>
          <Pill>Sample care plan signed</Pill>
          <h2>Your next 48 hours</h2>
          <p>Maya reviewed your final answer before signing this plan.</p>
        </div>
        <section className="timeline-card">
          <div>
            <i>
              <span>1</span>
            </i>
            <article>
              <small>Today</small>
              <h3>Complete a rapid strep test</h3>
              <p>The result will return to this visit for clinician review.</p>
              <span className="timeline-action">Test recommended</span>
            </article>
          </div>
          <div>
            <i>
              <span>2</span>
            </i>
            <article>
              <small>While you wait</small>
              <h3>Manage pain and fever</h3>
              <p>Follow Maya’s instructions, drink fluids, and rest.</p>
              <span className="timeline-action">Instructions included</span>
            </article>
          </div>
          <div>
            <i>
              <span>3</span>
            </i>
            <article>
              <small>After the result</small>
              <h3>Maya reviews what comes next</h3>
              <p>This visit will update if the plan changes.</p>
            </article>
          </div>
        </section>
        <section className="urgent-card">
          <Icon name="shield" />
          <div>
            <strong>Get urgent help if</strong>
            <span>
              You cannot breathe or swallow liquids, or symptoms worsen quickly.
            </span>
          </div>
        </section>
        <div className="plan-actions">
          <PrimaryButton onClick={onFollowUp}>Open follow-up</PrimaryButton>
          <button
            className="ask-august"
            onClick={() => {
              onExplain();
              onBack();
            }}
            type="button"
          >
            <Icon name="spark" /> Ask August to explain
          </button>
          <button className="text-button" onClick={onHome} type="button">
            Done for now
          </button>
        </div>
      </div>
    </div>
  );
}

function FollowUpScreen({
  state,
  dispatch,
  onBack,
  onEmergency,
  onUpload,
  onClinician,
  onHome,
}: {
  state: EncounterState;
  dispatch: React.Dispatch<EncounterAction>;
  onBack: () => void;
  onEmergency: () => void;
  onUpload: () => void;
  onClinician: () => void;
  onHome: () => void;
}) {
  const followUpMessages = state.augustMessages.filter(
    (item) => item.timestamp === "Now"
  );
  return (
    <div className="screen conversation-screen followup-screen">
      <Header
        title="Follow-up"
        status="August AI · Check-in"
        onBack={onBack}
      />
      <div className="conversation-body">
        <div className="joined-event">
          <span className="line" />
          <Pill tone="white">Next day · 9:12 AM</Pill>
          <span className="line" />
        </div>
        <Message author="August AI" role="AI care guide">
          How is your throat today—better, the same, or worse?
        </Message>
        <ThreadMessages messages={followUpMessages} />
        <section className="followup-card">
          <div>
            <Icon name="clock" />
            <span>Tell August what changed</span>
          </div>
          <div>
            <Icon name="doctor" />
            <span>Maya’s visit remains in your history</span>
          </div>
          <div>
            <Icon name="shield" />
            <span>Worsening symptoms reopen safety</span>
          </div>
        </section>
        <button className="text-button danger-text" onClick={onEmergency}>
          Symptoms are getting worse
        </button>
        <button className="text-button" onClick={onClinician}>
          Message Maya about this visit
        </button>
        <button className="text-button" onClick={onHome}>
          Close for now
        </button>
      </div>
      <Composer
        placeholder="Tell August how you feel…"
        onSubmit={(content) =>
          dispatch({
            type: "SEND_MESSAGE",
            recipient: "august",
            content,
          })
        }
        onAttach={onUpload}
        recipient="To August"
      />
    </div>
  );
}

function ReportScreen({
  state,
  dispatch,
  onBack,
}: {
  state: EncounterState;
  dispatch: React.Dispatch<EncounterAction>;
  onBack: () => void;
}) {
  const upload = state.upload;

  useEffect(() => {
    if (upload?.status !== "processing") return;
    const timer = window.setTimeout(
      () => dispatch({ type: "COMPLETE_UPLOAD" }),
      900
    );
    return () => window.clearTimeout(timer);
  }, [dispatch, upload?.status]);

  if (!upload) return null;

  return (
    <div className="screen conversation-screen upload-screen">
      <Header
        title="Report"
        status="August AI · Confirm before sharing"
        onBack={onBack}
      />
      <div className="conversation-body">
        <div className="step-row">
          <span>Report</span>
          <div>
            <i className="active" />
            <i
              className={
                upload.status !== "selecting" &&
                upload.status !== "attached"
                  ? "active"
                  : ""
              }
            />
            <i
              className={
                upload.status === "review" || upload.status === "confirmed"
                  ? "active"
                  : ""
              }
            />
          </div>
          <span>{upload.status.replace("_", " ")}</span>
        </div>
        {upload.status === "selecting" && (
          <section className="upload-picker">
            <Icon name="file" />
            <h3>Choose the report you want to add</h3>
            <p>
              Nothing is attached until you select a file. This public prototype does not read real health documents.
            </p>
            <label className="file-picker-button">
              Select a PDF or image
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (!file) return;
                  dispatch({
                    type: "SELECT_UPLOAD_FILE",
                    filename: file.name,
                  });
                }}
              />
            </label>
            <PrimaryButton
              secondary
              onClick={() => dispatch({ type: "USE_SAMPLE_UPLOAD" })}
            >
              Use sample strep report
            </PrimaryButton>
          </section>
        )}

        {upload.status !== "selecting" && (
          <>
            <Message author="You" role="Patient" patient>
              I added {upload.filename}.
            </Message>
            <section className="upload-preview">
              <div className="report-thumb">
                <Icon name="lab" />
                <span>FILE</span>
              </div>
              <div>
                <strong>{upload.filename}</strong>
                <span>
                  {upload.source === "review-fixture"
                    ? "Sample document · prototype only"
                    : "Selected on this device"}
                </span>
              </div>
              <Pill>{upload.status === "attached" ? "Attached" : "Added"}</Pill>
            </section>
          </>
        )}

        {upload.status === "attached" && (
          <>
            <Message author="August AI" role="AI care guide">
              {upload.source === "review-fixture"
                ? "This sample lets you review the extraction and confirmation interaction. No real health document is being processed."
                : "I can attach this file to the encounter, but this public prototype will not read or extract real health information from it."}
            </Message>
            <PrimaryButton onClick={() => dispatch({ type: "PROCESS_UPLOAD" })}>
              {upload.source === "review-fixture"
                ? "Review sample extraction"
                : "Check this attachment"}
            </PrimaryButton>
          </>
        )}

        {upload.status === "processing" && (
          <div className="processing-only" aria-live="polite">
            <span className="thinking-mark">
              <i />
              <i />
              <i />
            </span>
            <div>
              <strong>Reading the report</strong>
              <span>Checking the result and collection date</span>
            </div>
          </div>
        )}

        {upload.status === "review" && (
          <>
            <Message author="August AI" role="AI care guide">
              I found these details. Confirm that they match your report before I add them to the visit.
            </Message>
            <section className="extraction-card extraction-review">
              {upload.extractedFields.map((field) => (
                <div key={field.label}>
                  <Icon name="check" />
                  <span>
                    <small>{field.label}</small>
                    <strong>{field.value}</strong>
                  </span>
                </div>
              ))}
              <div>
                <Icon name="shield" />
                <span>
                  <small>Extraction confidence</small>
                  <strong>High · patient confirmation required</strong>
                </span>
              </div>
            </section>
            <PrimaryButton onClick={() => dispatch({ type: "CONFIRM_UPLOAD" })}>
              Confirm and add to this visit
            </PrimaryButton>
            <PrimaryButton
              secondary
              onClick={() => dispatch({ type: "SET_UPLOAD_LOW_CONFIDENCE" })}
            >
              Something looks wrong
            </PrimaryButton>
          </>
        )}

        {upload.status === "low_confidence" && (
          <section className="upload-recovery">
            <Icon name="file" />
            <h3>
              {upload.source === "user-selected"
                ? "Real document reading is disabled in this prototype"
                : "I couldn’t read this reliably"}
            </h3>
            <p>
              {upload.source === "user-selected"
                ? "Use the sample report to test extraction, or continue without adding this file."
                : "The result is too unclear to add. Try a brighter photo with the full page visible, or continue without it."}
            </p>
            <PrimaryButton onClick={() => dispatch({ type: "RETRY_UPLOAD" })}>
              Try another file
            </PrimaryButton>
            <PrimaryButton
              secondary
              onClick={() =>
                dispatch({
                  type: "GO_TO",
                  phase: upload.returnTo,
                })
              }
            >
              Continue without this report
            </PrimaryButton>
          </section>
        )}

        {state.reportNotes.map((note, index) => (
          <Message
            author="You"
            role="Note with report"
            patient
            key={`${note}-${index}`}
          >
            {note}
          </Message>
        ))}
      </div>
      <Composer
        placeholder="Add a note about this report…"
        onSubmit={(content) =>
          dispatch({ type: "SUBMIT_REPORT_NOTE", content })
        }
        recipient="To August"
      />
    </div>
  );
}

function PrescriptionScreen({
  state,
  dispatch,
  onUpload,
  onBack,
}: {
  state: EncounterState;
  dispatch: React.Dispatch<EncounterAction>;
  onUpload: () => void;
  onBack: () => void;
}) {
  return (
    <div className="screen conversation-screen">
      <Header
        title="Medication request"
        status="August AI · Assessment first"
        onBack={onBack}
      />
      <div className="conversation-body">
        <div className="step-row">
          <span>Medication</span>
          <div>
            <i className="active" />
            <i className={state.prescriptionStep >= 1 ? "active" : ""} />
            <i className={state.prescriptionStep >= 2 ? "active" : ""} />
            <i className={state.prescriptionStep >= 3 ? "active" : ""} />
          </div>
          <span>{Math.min(state.prescriptionStep + 1, 4)} of 4</span>
        </div>
        <Message author="You" role="Patient" patient>
          {state.concern ||
            "I think I need an antibiotic for my sore throat."}
        </Message>
        <Message author="August AI" role="AI care guide">
          A medication request starts with an assessment. A clinician decides whether medication is appropriate.
        </Message>
        {state.prescriptionAnswers.map((answer, index) => (
          <div key={`${answer}-${index}`}>
            <Message author="August AI" role="AI care guide">
              {prescriptionQuestions[index]}
            </Message>
            <Message author="You" role="Patient" patient>
              {answer}
            </Message>
          </div>
        ))}
        {state.prescriptionStep < 4 ? (
          <Message author="August AI" role="AI care guide">
            {prescriptionQuestions[state.prescriptionStep]}
          </Message>
        ) : (
          <section className="medication-handoff">
            <Icon name="doctor" />
            <div>
              <Pill>Assessment ready</Pill>
              <h3>A clinician needs to decide what comes next</h3>
              <p>
                The outcome may be medication, testing first, or a different care plan.
              </p>
            </div>
            <PrimaryButton
              onClick={() => dispatch({ type: "GO_TO", phase: "eligibility" })}
            >
              Continue to clinician review
            </PrimaryButton>
          </section>
        )}
      </div>
      <Composer
        placeholder={
          state.prescriptionStep < 4
            ? "Answer in your own words…"
            : "Add anything else…"
        }
        onSubmit={(answer) =>
          dispatch({ type: "SUBMIT_PRESCRIPTION", answer })
        }
        onAttach={onUpload}
        recipient="To August"
      />
    </div>
  );
}

function EmergencyScreen({
  state,
  dispatch,
}: {
  state: EncounterState;
  dispatch: React.Dispatch<EncounterAction>;
}) {
  const [location, setLocation] = useState(
    state.eligibility.locationConfirmed ? state.eligibility.state : ""
  );
  const [showExit, setShowExit] = useState(false);
  return (
    <div className="screen emergency-screen">
      <div className="emergency-top">
        <Brand />
        <Pill tone="dark">Urgent</Pill>
      </div>
      <div className="emergency-body">
        <div className="emergency-icon">
          <Icon name="phone" />
        </div>
        <div className="eyebrow">Paused for safety</div>
        <h2>This may need emergency care now.</h2>
        <p>
          Trouble breathing, fainting, or severe chest pain can be urgent. August cannot contact emergency services for you.
        </p>
        <a
          className="emergency-call"
          href="tel:911"
          onClick={() => dispatch({ type: "START_EMERGENCY_ACTION" })}
        >
          <Icon name="phone" />
          <span>
            <small>Call emergency services</small>
            911
          </span>
        </a>
        <label className="emergency-location-field">
          <span>Where are you physically located right now?</span>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City and state"
            autoComplete="address-level2"
          />
        </label>
        <button
          className="emergency-location"
          disabled={!location.trim()}
          onClick={() =>
            window.open(
              `https://maps.apple.com/?q=${encodeURIComponent(
                `emergency department near ${location}`
              )}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
          type="button"
        >
          <Icon name="pin" />
          <span>
            <strong>Find the nearest emergency department</strong>
            <small>
              {location.trim()
                ? `Search near ${location}`
                : "Enter your current location first"}
            </small>
          </span>
          <Icon name="arrow" />
        </button>
        {state.emergencyActionStarted && (
          <div className="emergency-guidance" aria-live="polite">
            <strong>After you contact emergency services</strong>
            <ul>
              <li>Follow the dispatcher’s instructions.</li>
              <li>Sit somewhere safe if you can.</li>
              <li>Tell someone nearby.</li>
            </ul>
          </div>
        )}
        {!showExit ? (
          <button
            className="outline-light"
            onClick={() => setShowExit(true)}
            type="button"
          >
            I’m safe to leave this screen
          </button>
        ) : (
          <section className="emergency-exit-check">
            <strong>Confirm before leaving</strong>
            <p>
              Leave only if you are no longer experiencing these urgent warning signs or you have contacted help.
            </p>
            <button
              onClick={() => dispatch({ type: "CONFIRM_EMERGENCY_EXIT" })}
              type="button"
            >
              Confirm and return home
            </button>
            <button onClick={() => setShowExit(false)} type="button">
              Stay on this screen
            </button>
          </section>
        )}
        <button
          className="emergency-backup-link"
          onClick={() => setShowExit(true)}
          type="button"
        >
          Use a different concern
        </button>
      </div>
    </div>
  );
}

function UnsupportedScreen({
  concern,
  onBack,
}: {
  concern: string;
  onBack: () => void;
}) {
  const downloadSummary = () => {
    const summaryText =
      `August care summary\n\nPatient request: ${
        concern || "Controlled medication request"
      }\nCare boundary: this medication request is not supported through August\nSuggested next step: contact the established prescriber or ongoing primary care`;
    const blob = new Blob([summaryText], {
      type: "text/plain;charset=utf-8",
    });
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
        <div className="boundary-icon">
          <Icon name="shield" />
        </div>
        <Pill>Clear next step</Pill>
        <h2>This medication request isn’t supported here.</h2>
        <p className="page-intro">
          Controlled medication decisions need care from an established prescriber who can review the ongoing history.
        </p>
        <section className="next-card">
          <h3>What you can do next</h3>
          <div>
            <i>1</i>
            <span>
              <strong>Contact your current prescriber</strong>
              <small>Ask about their refill process and timing.</small>
            </span>
          </div>
          <div>
            <i>2</i>
            <span>
              <strong>Prepare a concise care summary</strong>
              <small>Bring the medication name, dose, and recent history.</small>
            </span>
          </div>
        </section>
        <PrimaryButton onClick={downloadSummary}>
          Download my care summary
        </PrimaryButton>
        <PrimaryButton secondary onClick={onBack}>
          Start a different concern
        </PrimaryButton>
        <p className="legal-line">
          If stopping your medication could be unsafe, contact your prescriber or pharmacist today.
        </p>
      </div>
    </div>
  );
}

function ReviewerRail({
  state,
  initialState,
  dispatch,
  variation,
  initialCaseId,
}: {
  state: EncounterState;
  initialState: EncounterState;
  dispatch: React.Dispatch<EncounterAction>;
  variation: PrototypeVariationId;
  initialCaseId: string;
}) {
  const [copied, setCopied] = useState(false);
  const walkthroughPhases = recommendedWalkthroughCases.map(
    (prototypeCase) => prototypeCase.phase
  );
  const currentIndex = walkthroughPhases.indexOf(state.phase);
  const previousPhase =
    currentIndex > 0 ? walkthroughPhases[currentIndex - 1] : null;
  const nextPhase =
    currentIndex >= 0 && currentIndex < walkthroughPhases.length - 1
      ? walkthroughPhases[currentIndex + 1]
      : null;
  const nextRequiresSimulation =
    state.phase === "matching" ||
    state.phase === "clinician_reviewing" ||
    state.phase === "clinician_active";

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <aside className="reviewer-rail" aria-label="Prototype reviewer controls">
      <div className="reviewer-kicker">Reviewer controls</div>
      <h2>{phaseLabels[state.phase]}</h2>
      <p>
        Patient UI stays realistic. Time and clinical decisions are simulated here.
      </p>
      <div className="sample-data-note">
        <ClinicianPortrait small />
        <span>
          <strong>Fictional sample clinician</strong>
          Portrait, identity, timing, and care decisions are demonstration data.
        </span>
      </div>
      <dl className="reviewer-status">
        <div>
          <dt>Case</dt>
          <dd>{getPrototypeCase(initialCaseId)?.label ?? "Custom encounter"}</dd>
        </div>
        <div>
          <dt>Direction</dt>
          <dd>{variation}</dd>
        </div>
        <div>
          <dt>Clinician</dt>
          <dd>{state.clinicianState.replace("_", " ")}</dd>
        </div>
      </dl>
      <div className="reviewer-context-actions">
        {state.phase === "matching" && (
          <>
            <button
              onClick={() => dispatch({ type: "ASSIGN_CLINICIAN" })}
              type="button"
            >
              Assign clinician
            </button>
            <button
              onClick={() => dispatch({ type: "SET_CLINICIAN_DELAYED" })}
              type="button"
            >
              Simulate delay
            </button>
            <button
              onClick={() =>
                dispatch({ type: "SET_CLINICIAN_UNAVAILABLE" })
              }
              type="button"
            >
              No clinician available
            </button>
          </>
        )}
        {state.phase === "clinician_reviewing" && (
          <button
            onClick={() => dispatch({ type: "CLINICIAN_REPLIED" })}
            type="button"
          >
            Deliver clinician reply
          </button>
        )}
        {state.phase === "clinician_active" &&
          !state.prescriptionOutcome && (
            <button
              onClick={() => dispatch({ type: "SIGN_PLAN" })}
              disabled={
                !state.clinicianMessages.some(
                  (item) => item.author === "patient"
                )
              }
              type="button"
            >
              Sign care plan
            </button>
          )}
        {state.phase === "clinician_active" &&
          state.concern.toLowerCase().includes("antibiotic") && (
            <div className="reviewer-outcomes">
              <span>Medication outcome</span>
              {(
                [
                  ["appropriate", "Appropriate"],
                  ["test-first", "Test first"],
                  ["declined", "Declined"],
                ] as Array<[Exclude<PrescriptionOutcome, null>, string]>
              ).map(([outcome, label]) => (
                <button
                  className={
                    state.prescriptionOutcome === outcome ? "selected" : ""
                  }
                  key={outcome}
                  onClick={() =>
                    dispatch({ type: "SET_PRESCRIPTION_OUTCOME", outcome })
                  }
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
      </div>
      <div className="reviewer-stepper">
        <button
          onClick={() =>
            previousPhase && dispatch({ type: "GO_TO", phase: previousPhase })
          }
          disabled={!previousPhase}
          type="button"
        >
          <Icon name="back" />
          Previous
        </button>
        <button
          onClick={() =>
            nextPhase && dispatch({ type: "GO_TO", phase: nextPhase })
          }
          disabled={!nextPhase || nextRequiresSimulation}
          title={
            nextRequiresSimulation
              ? "Use the encounter control above to preserve chronology"
              : undefined
          }
          type="button"
        >
          Next
          <Icon name="arrow" />
        </button>
      </div>
      <div className="reviewer-utilities">
        <button
          onClick={() => dispatch({ type: "RESET", state: initialState })}
          type="button"
        >
          <Icon name="reset" />
          Reset
        </button>
        <button onClick={copyLink} type="button">
          <Icon name="copy" />
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <button
        className="reviewer-directory-link"
        onClick={() => window.location.assign("/cases")}
        type="button"
      >
        All review links
      </button>
    </aside>
  );
}

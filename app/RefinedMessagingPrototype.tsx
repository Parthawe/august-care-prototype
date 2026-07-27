/* eslint-disable @next/next/no-img-element */
"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./RefinedMessagingPrototype.module.css";

type Step =
  | "august-intake"
  | "august-follow-up"
  | "august-ready"
  | "august-connect"
  | "care-inbox"
  | "maya-first"
  | "maya-follow-up"
  | "maya-reviewing"
  | "august-private"
  | "maya-plan"
  | "care-multiple"
  | "maya-team";

type Author = "august" | "patient" | "maya" | "chen";

type Message = {
  id: string;
  author: Author;
  text: string;
  time: string;
};

const icons: Record<string, ReactNode> = {
  back: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  ),
  message: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 11 17-8-7 18-2.5-7.5L3 11Z" />
      <path d="m10.5 13.5 4-4" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  ),
  lab: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 16h9" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" />
    </svg>
  ),
};

const augustBase: Message[] = [
  {
    id: "a-1",
    author: "august",
    text: "Hi Parth—what would you like help with today?",
    time: "9:40",
  },
  {
    id: "p-1",
    author: "patient",
    text: "My throat has been hurting.",
    time: "9:41",
  },
  {
    id: "a-2",
    author: "august",
    text: "When did it start, and have you had a fever?",
    time: "9:41",
  },
  {
    id: "p-2",
    author: "patient",
    text: "Five days ago. I had a fever last night.",
    time: "9:42",
  },
  {
    id: "a-3",
    author: "august",
    text: "Any trouble breathing or swallowing liquids?",
    time: "9:42",
  },
  {
    id: "p-3",
    author: "patient",
    text: "No. I can breathe and drink normally.",
    time: "9:44",
  },
  {
    id: "a-4",
    author: "august",
    text: "Has the throat pain been getting better, worse, or staying about the same?",
    time: "9:44",
  },
  {
    id: "p-4",
    author: "patient",
    text: "It is worse today. Ibuprofen helped a little.",
    time: "9:46",
  },
  {
    id: "a-5",
    author: "august",
    text: "What was your highest temperature, and have you noticed white patches or tender swelling in your neck?",
    time: "9:47",
  },
];

function Icon({ name }: { name: keyof typeof icons }) {
  return <span className={styles.icon}>{icons[name]}</span>;
}

function Avatar({
  person,
  size = "regular",
}: {
  person: "august" | "maya";
  size?: "small" | "regular" | "large";
}) {
  return (
    <img
      className={`${styles.avatar} ${styles[`avatar-${size}`]}`}
      src={
        person === "august"
          ? "/august-avatar.png"
          : "/maya-clinician-avatar.png"
      }
      alt={person === "august" ? "August" : "Maya, clinician"}
    />
  );
}

function StatusBar() {
  return (
    <div className={styles.statusBar} aria-hidden="true">
      <span>9:41</span>
      <div className={styles.statusIcons}>
        <i />
        <i />
        <i />
        <b />
      </div>
    </div>
  );
}

function AugustHeader({
  subtitle = "AI care guide",
  onCare,
}: {
  subtitle?: string;
  onCare: () => void;
}) {
  return (
    <header className={styles.header}>
      <Avatar person="august" />
      <div className={styles.headerCopy}>
        <strong>August</strong>
        <span>{subtitle}</span>
      </div>
      <button
        className={styles.headerAction}
        type="button"
        aria-label="Open Care conversations"
        onClick={onCare}
      >
        <Icon name="message" />
        <i className={styles.unreadDot} />
      </button>
    </header>
  );
}

function MayaHeader({
  status,
  team = false,
  onBack,
}: {
  status: string;
  team?: boolean;
  onBack: () => void;
}) {
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backButton}
        aria-label="Back to Care"
        onClick={onBack}
      >
        <Icon name="back" />
      </button>
      <div className={styles.teamAvatars}>
        <Avatar person="maya" />
        {team ? <span className={styles.chenAvatar}>DC</span> : null}
      </div>
      <div className={styles.headerCopy}>
        <strong>{team ? "Maya + Dr. Chen" : "Maya (Clinician)"}</strong>
        <span>{status}</span>
      </div>
      <button
        type="button"
        className={styles.headerAction}
        aria-label="Open visit details"
      >
        <Icon name="file" />
      </button>
    </header>
  );
}

function CareHeader() {
  return (
    <header className={`${styles.header} ${styles.careHeader}`}>
      <div className={styles.headerCopy}>
        <strong>Care</strong>
        <span>Your clinician conversations</span>
      </div>
      <button
        type="button"
        className={styles.headerAction}
        aria-label="Conversation history"
      >
        <Icon name="history" />
      </button>
    </header>
  );
}

function MessageItem({ message }: { message: Message }) {
  if (message.author === "patient") {
    return (
      <div className={`${styles.messageRow} ${styles.patientRow}`}>
        <div className={styles.patientBubble}>
          <p>{message.text}</p>
          <span>{message.time} · ✓✓</span>
        </div>
      </div>
    );
  }

  if (message.author === "august") {
    return (
      <div className={styles.messageRow}>
        <Avatar person="august" size="small" />
        <div className={styles.augustMessage}>
          <p>{message.text}</p>
          <span>{message.time}</span>
        </div>
      </div>
    );
  }

  const isMaya = message.author === "maya";
  return (
    <div className={styles.messageRow}>
      {isMaya ? (
        <Avatar person="maya" size="small" />
      ) : (
        <span className={styles.chenMessageAvatar}>DC</span>
      )}
      <div className={styles.clinicianMessage}>
        <div>
          <strong>{isMaya ? "Maya" : "Dr. Chen"}</strong>
          <span>{message.time}</span>
        </div>
        <p>{message.text}</p>
      </div>
    </div>
  );
}

function Typing({ person }: { person: "august" | "maya" }) {
  return (
    <div className={styles.messageRow} aria-label={`${person} is typing`}>
      <Avatar person={person} size="small" />
      <div className={styles.typing}>
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function SystemNote({
  children,
  icon = "clock",
}: {
  children: ReactNode;
  icon?: keyof typeof icons;
}) {
  return (
    <div className={styles.systemNote}>
      <Icon name={icon} />
      <span>{children}</span>
    </div>
  );
}

function Composer({
  placeholder,
  value,
  disabled,
  onChange,
  onSubmit,
}: {
  placeholder: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <button type="button" aria-label="Add attachment">
        <Icon name="plus" />
      </button>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
      />
      <button
        className={styles.sendButton}
        type="submit"
        aria-label="Send message"
        disabled={disabled || !value.trim()}
      >
        <Icon name="send" />
      </button>
    </form>
  );
}

function BottomNav({
  active,
  unread = true,
  onAugust,
  onCare,
  onReset,
}: {
  active: "august" | "care";
  unread?: boolean;
  onAugust: () => void;
  onCare: () => void;
  onReset: () => void;
}) {
  return (
    <nav className={styles.bottomNav} aria-label="Main navigation">
      <button type="button" aria-label="Restart prototype" onClick={onReset}>
        <Icon name="history" />
      </button>
      <button
        type="button"
        className={active === "care" ? styles.activeNav : ""}
        aria-label="Care conversations"
        onClick={onCare}
      >
        <Icon name="message" />
        {active === "care" ? <strong>Care</strong> : null}
        {unread ? <i className={styles.navDot} /> : null}
      </button>
      <span className={styles.navSpacer} />
      <button
        type="button"
        className={`${styles.augustNav} ${
          active === "august" ? styles.activeAugustNav : ""
        }`}
        aria-label="Open August"
        onClick={onAugust}
      >
        <Avatar person="august" size="small" />
        <strong>August</strong>
      </button>
    </nav>
  );
}

function ThreadRow({
  person,
  name,
  role,
  preview,
  time,
  unread,
  onClick,
}: {
  person: "august" | "maya" | "chen";
  name: string;
  role: string;
  preview: string;
  time: string;
  unread?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.threadRow} onClick={onClick}>
      {person === "chen" ? (
        <span className={styles.threadChen}>DC</span>
      ) : (
        <Avatar person={person} size="large" />
      )}
      <span className={styles.threadCopy}>
        <span>
          <strong>{name}</strong>
          <small>{role}</small>
        </span>
        <span>{preview}</span>
      </span>
      <span className={styles.threadMeta}>
        <small>{time}</small>
        {unread ? <b>{unread}</b> : <i>✓✓</i>}
      </span>
    </button>
  );
}

function CareInbox({
  multiple,
  connected,
  onMaya,
  onChen,
  onAugust,
}: {
  multiple: boolean;
  connected: boolean;
  onMaya: () => void;
  onChen: () => void;
  onAugust: () => void;
}) {
  return (
    <div className={styles.inbox}>
      <span className={styles.sectionLabel}>ACTIVE</span>
      {connected ? (
        <>
          <ThreadRow
            person="maya"
            name="Maya"
            role="Clinician"
            preview={
              multiple
                ? "Your rapid throat test plan is ready."
                : "Are you able to drink normally, and have you noticed a rash?"
            }
            time={multiple ? "10:41" : "10:24"}
            unread="1"
            onClick={onMaya}
          />
          <ThreadRow
            person="chen"
            name="Dr. Chen"
            role="Clinician"
            preview="Please upload one clear photo in natural light."
            time="Yesterday"
            onClick={onChen}
          />
        </>
      ) : (
        <div className={styles.emptyCare}>
          <strong>No clinician conversations yet</strong>
          <span>Start with August. A clinician appears here when care begins.</span>
        </div>
      )}
      <span className={`${styles.sectionLabel} ${styles.augustLabel}`}>
        AUGUST
      </span>
      <ThreadRow
        person="august"
        name="August"
        role="AI care guide"
        preview={
          multiple
            ? "Ask about any visit or start something new."
            : "Ask anything or start a new concern."
        }
        time="Now"
        onClick={onAugust}
      />
      {!multiple ? (
        <div className={styles.inboxExplainer}>
          <Icon name="spark" />
          <span>
            August starts care. Clinician conversations stay organized here.
          </span>
        </div>
      ) : null}
    </div>
  );
}

function ConnectionCard({ onContinue }: { onContinue: () => void }) {
  return (
    <div className={styles.connectionCard}>
      <div className={styles.connectionPerson}>
        <Avatar person="maya" size="large" />
        <div>
          <strong>Maya (Clinician)</strong>
          <span>Usually replies in 2–4 hours</span>
        </div>
      </div>
      <p>
        $40 covers the clinical review, not a prescription or specific outcome.
      </p>
      <button type="button" onClick={onContinue}>
        Review and connect · $40
      </button>
    </div>
  );
}

function PlanCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className={styles.planCard} onClick={onOpen}>
      <Icon name="lab" />
      <span>
        <strong>Rapid throat test</strong>
        <small>Plan signed by Maya · result returns here</small>
      </span>
      <span aria-hidden="true">›</span>
    </button>
  );
}

function Conversation({
  messages,
  pendingPerson,
  before,
  children,
  scrollRef,
}: {
  messages: Message[];
  pendingPerson?: "august" | "maya" | null;
  before?: ReactNode;
  children?: ReactNode;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={styles.conversation} ref={scrollRef} aria-live="polite">
      <div className={styles.transcript}>
        {before}
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {pendingPerson ? <Typing person={pendingPerson} /> : null}
        {children}
      </div>
    </div>
  );
}

export function RefinedMessagingPrototype() {
  const [step, setStep] = useState<Step>("august-intake");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<"august" | "maya" | null>(null);
  const [connected, setConnected] = useState(false);
  const [answers, setAnswers] = useState({
    detail: "",
    allergies: "",
    mayaFirst: "",
    mayaSecond: "",
  });
  const [privateMessages, setPrivateMessages] = useState<Message[]>([]);
  const [mayaExtras, setMayaExtras] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    });
  }, [step, pending, privateMessages, mayaExtras]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const laterThan = (target: Step) => {
    const order: Step[] = [
      "august-intake",
      "august-follow-up",
      "august-ready",
      "august-connect",
      "care-inbox",
      "maya-first",
      "maya-follow-up",
      "maya-reviewing",
      "august-private",
      "maya-plan",
      "care-multiple",
      "maya-team",
    ];
    return order.indexOf(step) >= order.indexOf(target);
  };

  const augustMessages = useMemo(() => {
    const messages = [...augustBase];
    if (laterThan("august-follow-up")) {
      messages.push(
        {
          id: "p-detail",
          author: "patient",
          text:
            answers.detail ||
            "102°F. I see a few white patches and my neck feels tender.",
          time: "9:49",
        },
        {
          id: "a-allergy",
          author: "august",
          text: "Any medication allergies, antibiotic reactions, or major health conditions?",
          time: "9:49",
        },
      );
    }
    if (laterThan("august-ready")) {
      messages.push(
        {
          id: "p-allergy",
          author: "patient",
          text:
            answers.allergies ||
            "No medication allergies or major conditions.",
          time: "9:51",
        },
        {
          id: "a-ready",
          author: "august",
          text: "A clinician should review the worsening pain, fever, and white patches. I can prepare this conversation for them now.",
          time: "9:51",
        },
      );
    }
    if (laterThan("august-connect")) {
      messages.push({
        id: "a-connect",
        author: "august",
        text: "I’ll share the details you confirmed. Maya’s replies will appear in Care, and you can keep messaging me while you wait.",
        time: "9:52",
      });
    }
    return messages;
    // The sequence is intentionally derived from the encounter step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, answers.detail, answers.allergies]);

  const mayaMessages = useMemo(() => {
    const messages: Message[] = [
      {
        id: "m-1",
        author: "maya",
        text: "Hi Parth—I reviewed what you shared. Are you able to drink normally, and have you noticed a rash?",
        time: "10:24",
      },
    ];
    if (laterThan("maya-follow-up")) {
      messages.push(
        {
          id: "mp-1",
          author: "patient",
          text:
            answers.mayaFirst ||
            "I can drink normally and I do not have a rash.",
          time: "10:26",
        },
        {
          id: "m-2",
          author: "maya",
          text: "Do you have white patches on your tonsils or tender swelling in the front of your neck?",
          time: "10:27",
        },
      );
    }
    if (laterThan("maya-reviewing")) {
      messages.push(
        {
          id: "mp-2",
          author: "patient",
          text:
            answers.mayaSecond ||
            "A few white patches, and the front of my neck feels tender.",
          time: "10:29",
        },
        {
          id: "m-3",
          author: "maya",
          text: "Thank you. I’m checking whether testing should happen before treatment.",
          time: "10:31",
        },
      );
    }
    if (laterThan("maya-plan")) {
      messages.push(
        {
          id: "m-plan",
          author: "maya",
          text: "I recommend a rapid throat test before deciding on medication. The result will return here for me to review.",
          time: "10:38",
        },
        {
          id: "mp-plan",
          author: "patient",
          text: "Okay, please help me arrange it.",
          time: "10:39",
        },
      );
    }
    return [...messages, ...mayaExtras];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, answers.mayaFirst, answers.mayaSecond, mayaExtras]);

  const runReply = (person: "august" | "maya", next: Step) => {
    setPending(person);
    const timer = window.setTimeout(() => {
      setPending(null);
      setStep(next);
    }, person === "maya" ? 900 : 680);
    timers.current.push(timer);
  };

  const reset = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setStep("august-intake");
    setInput("");
    setPending(null);
    setConnected(false);
    setAnswers({
      detail: "",
      allergies: "",
      mayaFirst: "",
      mayaSecond: "",
    });
    setPrivateMessages([]);
    setMayaExtras([]);
  };

  const openCare = () => {
    if (laterThan("maya-plan")) setStep("care-multiple");
    else setStep("care-inbox");
  };

  const openAugust = () => {
    if (step === "maya-reviewing" || step === "august-private") {
      setStep("august-private");
    } else if (answers.allergies) {
      setStep("august-ready");
    } else if (answers.detail) {
      setStep("august-follow-up");
    } else {
      setStep("august-intake");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || pending) return;
    setInput("");

    if (step === "august-intake") {
      setAnswers((current) => ({ ...current, detail: value }));
      runReply("august", "august-follow-up");
      return;
    }
    if (step === "august-follow-up") {
      setAnswers((current) => ({ ...current, allergies: value }));
      runReply("august", "august-ready");
      return;
    }
    if (step === "maya-first") {
      setAnswers((current) => ({ ...current, mayaFirst: value }));
      runReply("maya", "maya-follow-up");
      return;
    }
    if (step === "maya-follow-up") {
      setAnswers((current) => ({ ...current, mayaSecond: value }));
      runReply("maya", "maya-reviewing");
      return;
    }
    if (step === "august-private") {
      const id = `private-${Date.now()}`;
      setPrivateMessages((current) => [
        ...current,
        { id, author: "patient", text: value, time: "10:36" },
      ]);
      setPending("august");
      const timer = window.setTimeout(() => {
        setPrivateMessages((current) => [
          ...current,
          {
            id: `${id}-reply`,
            author: "august",
            text: "I can help explain that. This message stays private unless you choose to share it with Maya.",
            time: "10:36",
          },
        ]);
        setPending(null);
      }, 680);
      timers.current.push(timer);
      return;
    }
    if (step === "maya-plan" || step === "maya-team") {
      setMayaExtras((current) => [
        ...current,
        {
          id: `extra-${Date.now()}`,
          author: "patient",
          text: value,
          time: "11:22",
        },
      ]);
    }
  };

  const isCare = step === "care-inbox" || step === "care-multiple";
  const isMaya =
    step === "maya-first" ||
    step === "maya-follow-up" ||
    step === "maya-reviewing" ||
    step === "maya-plan" ||
    step === "maya-team";

  const composerPlaceholder = isMaya ? "Message Maya…" : "Message August…";
  const showComposer =
    step === "august-intake" ||
    step === "august-follow-up" ||
    step === "august-private" ||
    step === "maya-first" ||
    step === "maya-follow-up" ||
    step === "maya-reviewing" ||
    step === "maya-plan" ||
    step === "maya-team";

  return (
    <main className={styles.stage}>
      <section className={styles.viewport} aria-label="August care prototype">
        <StatusBar />

        {isCare ? <CareHeader /> : null}
        {!isCare && !isMaya ? (
          <AugustHeader
            subtitle={
              step === "august-private"
                ? "About your visit with Maya"
                : step === "august-ready"
                  ? "Ready for the next step"
                  : step === "august-connect"
                    ? "Preparing clinician care"
                    : "AI care guide"
            }
            onCare={openCare}
          />
        ) : null}
        {isMaya ? (
          <MayaHeader
            team={step === "maya-team"}
            status={
              step === "maya-team"
                ? "Maya leads this visit · Dr. Chen consulting"
                : step === "maya-reviewing"
                  ? "Reviewing · usually replies in 2–4 hours"
                  : step === "maya-plan"
                    ? "Plan ready"
                    : "Usually replies in 2–4 hours"
            }
            onBack={openCare}
          />
        ) : null}

        {isCare ? (
          <div className={styles.content}>
            <CareInbox
              multiple={step === "care-multiple"}
              connected={connected}
              onMaya={() =>
                setStep(
                  step === "care-multiple" ? "maya-plan" : "maya-first",
                )
              }
              onChen={() => setStep("maya-team")}
              onAugust={openAugust}
            />
          </div>
        ) : null}

        {!isCare && !isMaya ? (
          <Conversation
            messages={
              step === "august-private"
                ? augustMessages
                : augustMessages
            }
            pendingPerson={step === "august-private" ? null : pending}
            scrollRef={scrollRef}
          >
            {step === "august-ready" ? (
              <div className={styles.inlineAction}>
                <button
                  type="button"
                  onClick={() => setStep("august-connect")}
                >
                  Connect to a clinician
                </button>
              </div>
            ) : null}
            {step === "august-connect" ? (
              <ConnectionCard
                onContinue={() => {
                  setConnected(true);
                  setStep("care-inbox");
                }}
              />
            ) : null}
            {step === "august-private" ? (
              <>
                <div className={styles.contextChip}>
                  <Icon name="file" />
                  <span>Sore throat visit · Maya reviewing</span>
                  <strong>Private</strong>
                </div>
                {[
                  {
                    id: "private-question",
                    author: "patient" as const,
                    text: "What does testing first mean?",
                    time: "10:34",
                  },
                  {
                    id: "private-answer",
                    author: "august" as const,
                    text: "Maya may want a rapid throat test before deciding whether medication is appropriate. That result helps her choose the safest next step.",
                    time: "10:34",
                  },
                  {
                    id: "private-visibility",
                    author: "patient" as const,
                    text: "Will Maya see this question?",
                    time: "10:35",
                  },
                  {
                    id: "private-visibility-answer",
                    author: "august" as const,
                    text: "No. This stays with me unless you choose to share it. Maya’s conversation is waiting exactly where you left it.",
                    time: "10:35",
                  },
                  ...privateMessages,
                ].map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
                {pending === "august" ? <Typing person="august" /> : null}
                <div className={styles.privateActions}>
                  <button type="button" onClick={() => setStep("maya-plan")}>
                    Back to Maya
                  </button>
                  <button type="button">Share question</button>
                </div>
              </>
            ) : null}
          </Conversation>
        ) : null}

        {isMaya ? (
          <Conversation
            messages={
              step === "maya-team"
                ? [
                    {
                      id: "team-1",
                      author: "maya",
                      text: "I asked Dr. Chen to review the test result with me. I’ll send the final recommendation.",
                      time: "11:12",
                    },
                  ]
                : mayaMessages
            }
            pendingPerson={pending}
            scrollRef={scrollRef}
            before={
              step !== "maya-team" ? (
                <SystemNote icon="file">
                  Visit summary from August shared with Maya
                </SystemNote>
              ) : null
            }
          >
            {step === "maya-team" ? (
              <>
                <SystemNote icon="message">
                  Dr. Chen joined · Maya still leads this visit
                </SystemNote>
                {[
                  {
                    id: "team-2",
                    author: "chen" as const,
                    text: "I reviewed the result and shared my recommendation with Maya.",
                    time: "11:18",
                  },
                  {
                    id: "team-3",
                    author: "patient" as const,
                    text: "Thanks—should I wait for Maya here?",
                    time: "11:20",
                  },
                  {
                    id: "team-4",
                    author: "maya" as const,
                    text: "Yes. I’ll message you in this same conversation with the final plan.",
                    time: "11:21",
                  },
                  ...mayaExtras,
                ].map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
              </>
            ) : null}
            {step === "maya-reviewing" ? (
              <>
                <SystemNote>
                  Maya is reviewing · We’ll notify you when she replies
                </SystemNote>
                <button
                  type="button"
                  className={styles.askAugust}
                  onClick={() => setStep("august-private")}
                >
                  <Avatar person="august" size="small" />
                  Ask August while you wait
                </button>
              </>
            ) : null}
            {step === "maya-plan" ? (
              <PlanCard onOpen={() => setStep("care-multiple")} />
            ) : null}
          </Conversation>
        ) : null}

        <footer className={styles.footer}>
          {showComposer ? (
            <Composer
              placeholder={composerPlaceholder}
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={Boolean(pending)}
            />
          ) : null}
          <BottomNav
            active={isCare || isMaya ? "care" : "august"}
            unread={laterThan("care-inbox")}
            onAugust={openAugust}
            onCare={openCare}
            onReset={reset}
          />
        </footer>
      </section>
    </main>
  );
}

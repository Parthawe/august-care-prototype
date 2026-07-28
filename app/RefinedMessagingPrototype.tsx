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
type Overlay = "visit" | "connect" | "history" | "plan" | null;

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
  onDetails,
}: {
  subtitle?: string;
  onCare: () => void;
  onDetails: () => void;
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
      <button
        className={styles.headerAction}
        type="button"
        aria-label="Open conversation details"
        onClick={onDetails}
      >
        <Icon name="file" />
      </button>
    </header>
  );
}

function MayaHeader({
  status,
  team = false,
  onBack,
  onDetails,
}: {
  status: string;
  team?: boolean;
  onBack: () => void;
  onDetails: () => void;
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
        onClick={onDetails}
      >
        <Icon name="file" />
      </button>
    </header>
  );
}

function CareHeader({ onHistory }: { onHistory: () => void }) {
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
        onClick={onHistory}
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
  onAttachment,
}: {
  placeholder: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAttachment: (name: string) => void;
}) {
  const attachmentRef = useRef<HTMLInputElement>(null);

  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <input
        ref={attachmentRef}
        className={styles.fileInput}
        type="file"
        accept="image/*,.pdf"
        aria-label="Choose a photo or PDF"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onAttachment(file.name);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        aria-label="Add attachment"
        onClick={() => attachmentRef.current?.click()}
      >
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
      <button
        type="button"
        aria-label="Start a new conversation"
        onClick={onReset}
      >
        <Icon name="plus" />
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
        Maya will review the confirmed summary using independent clinical judgment.
      </p>
      <button type="button" onClick={onContinue}>
        Review clinician details
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

function OverlaySheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <strong>{title}</strong>
          <button type="button" onClick={onClose} aria-label={`Close ${title}`}>
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function RefinedMessagingPrototype() {
  const [step, setStep] = useState<Step>("august-intake");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<"august" | "maya" | null>(null);
  const [connected, setConnected] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [planReady, setPlanReady] = useState(false);
  const [sharedWithMaya, setSharedWithMaya] = useState(false);
  const [answers, setAnswers] = useState({
    detail: "",
    allergies: "",
    mayaFirst: "",
    mayaSecond: "",
  });
  const [privateMessages, setPrivateMessages] = useState<Message[]>([]);
  const [mayaExtras, setMayaExtras] = useState<Message[]>([]);
  const [augustExtras, setAugustExtras] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    });
  }, [step, pending, privateMessages, mayaExtras]);

  useEffect(() => {
    if (!answers.mayaSecond || planReady) return;
    const timer = window.setTimeout(() => {
      setPlanReady(true);
      setStep((current) =>
        current === "maya-reviewing" ? "maya-plan" : current,
      );
    }, 9000);
    timers.current.push(timer);
    return () => window.clearTimeout(timer);
  }, [answers.mayaSecond, planReady]);

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
    return [...messages, ...augustExtras];
    // The sequence is intentionally derived from the encounter step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, answers.detail, answers.allergies, augustExtras]);

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
    setOverlay(null);
    setPlanReady(false);
    setSharedWithMaya(false);
    setAnswers({
      detail: "",
      allergies: "",
      mayaFirst: "",
      mayaSecond: "",
    });
    setPrivateMessages([]);
    setMayaExtras([]);
    setAugustExtras([]);
  };

  const openCare = () => {
    if (laterThan("maya-plan")) setStep("care-multiple");
    else setStep("care-inbox");
  };

  const openAugust = () => {
    if (
      connected ||
      step === "maya-reviewing" ||
      step === "maya-plan" ||
      step === "maya-team" ||
      step === "august-private"
    ) {
      setStep("august-private");
    } else if (answers.allergies) {
      setStep("august-ready");
    } else if (answers.detail) {
      setStep("august-follow-up");
    } else {
      setStep("august-intake");
    }
  };

  const addAttachment = (name: string) => {
    const message: Message = {
      id: `attachment-${Date.now()}`,
      author: "patient",
      text: `Attached: ${name}`,
      time: "Now",
    };
    if (isMaya) {
      setMayaExtras((current) => [...current, message]);
    } else if (step === "august-private") {
      setPrivateMessages((current) => [...current, message]);
    } else {
      setAugustExtras((current) => [...current, message]);
    }
  };

  const shareQuestionWithMaya = () => {
    const latestQuestion = [...privateMessages]
      .reverse()
      .find((message) => message.author === "patient");
    if (!latestQuestion) return;
    if (!sharedWithMaya) {
      setMayaExtras((current) => [
        ...current,
        {
          id: "shared-august-question",
          author: "patient",
          text: `I asked August: “${latestQuestion.text}” I’d like your view too.`,
          time: planReady ? "10:40" : "10:36",
        },
      ]);
      setSharedWithMaya(true);
    }
    setStep(planReady ? "maya-plan" : "maya-reviewing");
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
    if (step === "august-ready" || step === "august-connect") {
      const id = `august-extra-${Date.now()}`;
      setAugustExtras((current) => [
        ...current,
        { id, author: "patient", text: value, time: "Now" },
      ]);
      setPending("august");
      const timer = window.setTimeout(() => {
        setAugustExtras((current) => [
          ...current,
          {
            id: `${id}-reply`,
            author: "august",
            text:
              step === "august-connect"
                ? "You can keep asking me questions before you connect. Maya will only receive the health details you confirmed."
                : "I can explain the next step before you decide. Connecting starts a separate conversation with Maya in Care.",
            time: "Now",
          },
        ]);
        setPending(null);
      }, 680);
      timers.current.push(timer);
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
    if (
      step === "maya-reviewing" ||
      step === "maya-plan" ||
      step === "maya-team"
    ) {
      setMayaExtras((current) => [
        ...current,
        {
          id: `extra-${Date.now()}`,
          author: "patient",
          text: value,
          time: "11:22",
        },
      ]);
      if (step !== "maya-reviewing") {
        setPending("maya");
        const id = `extra-reply-${Date.now()}`;
        const timer = window.setTimeout(() => {
          setMayaExtras((current) => [
            ...current,
            {
              id,
              author: "maya",
              text:
                step === "maya-team"
                  ? "Yes—keep using this conversation. I’ll coordinate the final recommendation here."
                  : "Yes. Send the result here when it is ready and I’ll review the next step with you.",
              time: "11:23",
            },
          ]);
          setPending(null);
        }, 850);
        timers.current.push(timer);
      }
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
  const showComposer = !isCare;

  return (
    <main className={styles.stage}>
      <section className={styles.viewport} aria-label="August care prototype">
        <StatusBar />

        {isCare ? <CareHeader onHistory={() => setOverlay("history")} /> : null}
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
            onDetails={() => setOverlay("visit")}
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
            onDetails={() => setOverlay("visit")}
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
                onContinue={() => setOverlay("connect")}
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
                    id: "private-intro",
                    author: "august" as const,
                    text: "Maya is reviewing your visit. You can ask me questions here while you wait—this stays private unless you choose to share something.",
                    time: "10:34",
                  },
                  ...privateMessages,
                ].map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
                {pending === "august" ? <Typing person="august" /> : null}
                <div className={styles.privateActions}>
                  <button
                    type="button"
                    onClick={() =>
                      setStep(
                        planReady
                          ? "maya-plan"
                          : answers.mayaFirst
                            ? "maya-reviewing"
                            : "care-inbox",
                      )
                    }
                  >
                    Back to Maya
                  </button>
                  <button
                    type="button"
                    onClick={shareQuestionWithMaya}
                    disabled={
                      !privateMessages.some(
                        (message) => message.author === "patient",
                      )
                    }
                  >
                    {sharedWithMaya ? "Shared with Maya" : "Share question"}
                  </button>
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
              <PlanCard onOpen={() => setOverlay("plan")} />
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
              onAttachment={addAttachment}
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

        {overlay === "connect" ? (
          <OverlaySheet
            title="Clinical review"
            onClose={() => setOverlay(null)}
          >
            <div className={styles.sheetPerson}>
              <Avatar person="maya" size="large" />
              <span>
                <strong>Maya</strong>
                <small>Clinician · usually replies in 2–4 hours</small>
              </span>
            </div>
            <div className={styles.sheetRows}>
              <p>
                <span>What is shared</span>
                <strong>Your answers and attachments</strong>
              </p>
              <p>
                <span>Care model</span>
                <strong>Asynchronous clinician review</strong>
              </p>
            </div>
            <p className={styles.sheetFinePrint}>
              Maya uses independent clinical judgment. Review does not
              guarantee a prescription or a specific outcome.
            </p>
            <button
              type="button"
              className={styles.sheetPrimary}
              onClick={() => {
                setConnected(true);
                setOverlay(null);
                setStep("care-inbox");
              }}
            >
              Confirm and connect
            </button>
          </OverlaySheet>
        ) : null}

        {overlay === "visit" ? (
          <OverlaySheet
            title={connected ? "Sore throat visit" : "Conversation details"}
            onClose={() => setOverlay(null)}
          >
            <div className={styles.detailList}>
              <p>
                <span>Concern</span>
                <strong>Sore throat · five days</strong>
              </p>
              <p>
                <span>Current safety</span>
                <strong>Breathing and drinking normally</strong>
              </p>
              <p>
                <span>Reported</span>
                <strong>Fever, white patches, tender neck</strong>
              </p>
              <p>
                <span>Clinician</span>
                <strong>{connected ? "Maya · reviewing" : "Not connected"}</strong>
              </p>
            </div>
          </OverlaySheet>
        ) : null}

        {overlay === "history" ? (
          <OverlaySheet
            title="Conversation history"
            onClose={() => setOverlay(null)}
          >
            <button
              type="button"
              className={styles.historyRow}
              onClick={() => {
                setOverlay(null);
                setStep(connected ? "maya-first" : "august-intake");
              }}
            >
              <span>
                <strong>Sore throat</strong>
                <small>{connected ? "Active · Maya" : "In progress · August"}</small>
              </span>
              <b>›</b>
            </button>
            <button
              type="button"
              className={styles.historyRow}
              onClick={() => {
                setOverlay(null);
                setStep("maya-team");
              }}
            >
              <span>
                <strong>Skin concern</strong>
                <small>Yesterday · Dr. Chen</small>
              </span>
              <b>›</b>
            </button>
          </OverlaySheet>
        ) : null}

        {overlay === "plan" ? (
          <OverlaySheet title="Rapid throat test" onClose={() => setOverlay(null)}>
            <div className={styles.planDetails}>
              <span className={styles.planStatus}>Plan signed by Maya</span>
              <h2>Test before deciding on medication</h2>
              <p>
                Complete a rapid throat test. Send the result in this
                conversation so Maya can review it and recommend the next step.
              </p>
            </div>
            <button
              type="button"
              className={styles.sheetPrimary}
              onClick={() => {
                setOverlay(null);
                setStep("care-multiple");
              }}
            >
              Done
            </button>
          </OverlaySheet>
        ) : null}
      </section>
    </main>
  );
}

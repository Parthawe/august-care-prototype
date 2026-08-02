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
import { hasEmergencySignal } from "./encounterMachine";
import styles from "./UnifiedCarePrototype.module.css";

type Channel = "august" | "maya" | "care" | "emergency";
type Flow = "new" | "symptom" | "prescription" | "lab";
type Phase =
  | "empty"
  | "asking"
  | "summary"
  | "eligibility"
  | "waiting"
  | "maya-active"
  | "lab-choice"
  | "lab-arranged"
  | "upload-selected"
  | "uploading"
  | "upload-processing"
  | "extract"
  | "low-confidence"
  | "result-waiting"
  | "result-reviewed"
  | "prescription-review"
  | "pharmacy"
  | "sent"
  | "alternative"
  | "unsupported"
  | "follow-up"
  | "emergency-initial"
  | "emergency-location"
  | "emergency-contacted"
  | "emergency-exit"
  | "emergency-refused"
  | "emergency-complete";
type Sender = "august" | "patient" | "maya" | "system";

type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  time?: string;
};

const icons: Record<string, ReactNode> = {
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
  message: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
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
  lab: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 16h9" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.8 2.9 8.2 7 10 4.1-1.8 7-5.2 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
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
  close: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h3l1.5 4-2 1.5a15 15 0 0 0 6 6l1.5-2L21 14v3c0 2.2-1.8 4-4 4C9.3 21 3 14.7 3 7c0-2.2 1.8-4 4-4Z" />
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
};

const symptomQuestions = [
  "When did it start, and have you had a fever?",
  "Are you having trouble breathing, unable to swallow liquids, feeling faint, or having severe chest pain?",
  "Has the throat pain been getting better, worse, or staying about the same?",
  "What was your highest temperature, and have you noticed white patches or tender swelling in your neck?",
  "Any medication allergies, antibiotic reactions, or major health conditions?",
];

const prescriptionQuestions = [
  "Is this a new prescription or a refill?",
  "What symptoms are you having, and when did they begin?",
  "Are you having trouble breathing, unable to swallow liquids, fainting, or severe chest pain?",
  "What have you tried so far, and what medicines are you taking now?",
  "Have you taken an antibiotic in the past month or ever had a severe reaction to one?",
];

const prescriptionPattern =
  /prescription|refill|antibiotic|medication|medicine|amoxicillin/i;

const labPattern = /lab|report|result|test result|upload/i;
const unsupportedPattern =
  /adderall|oxycodone|controlled medication|controlled substance/i;

const seededSymptomMessages: ChatMessage[] = [
  {
    id: "seed-august-1",
    sender: "august",
    text: "Hi Anuruddh—what would you like help with today?",
    time: "9:40",
  },
  {
    id: "seed-patient-1",
    sender: "patient",
    text: "My throat has been hurting.",
    time: "9:41",
  },
  {
    id: "seed-august-2",
    sender: "august",
    text: "When did it start, and have you had a fever?",
    time: "9:41",
  },
  {
    id: "seed-patient-2",
    sender: "patient",
    text: "Five days ago. I had a fever last night.",
    time: "9:42",
  },
  {
    id: "seed-august-3",
    sender: "august",
    text: "Are you having trouble breathing, unable to swallow liquids, feeling faint, or having severe chest pain?",
    time: "9:42",
  },
  {
    id: "seed-patient-3",
    sender: "patient",
    text: "No. I can breathe and drink normally, and I have not fainted.",
    time: "9:44",
  },
  {
    id: "seed-august-4",
    sender: "august",
    text: "Has the throat pain been getting better, worse, or staying about the same?",
    time: "9:44",
  },
  {
    id: "seed-patient-4",
    sender: "patient",
    text: "It is worse today. Ibuprofen helped a little.",
    time: "9:46",
  },
  {
    id: "seed-august-5",
    sender: "august",
    text: "What was your highest temperature, and have you noticed white patches or tender swelling in your neck?",
    time: "9:47",
  },
];

export type ReviewScenario =
  | "symptom"
  | "empty"
  | "prescription"
  | "clinician-wait"
  | "testing"
  | "upload"
  | "result-review"
  | "prescription-appropriate"
  | "prescription-declined"
  | "unsupported"
  | "follow-up"
  | "care"
  | "emergency";

type ScenarioPreset = {
  channel: Channel;
  flow: Flow;
  phase: Phase;
  questionIndex: number;
  augustMessages: ChatMessage[];
  mayaMessages: ChatMessage[];
  answers: string[];
  clinicianConnected: boolean;
  privateMode: boolean;
  labStep: number;
  labMethod: "lab" | "kit";
  emergencyConcern: string;
};

const seededPrescriptionMessages: ChatMessage[] = [
  {
    id: "seed-prescription-patient",
    sender: "patient",
    text: "I think I need an antibiotic for my sore throat.",
    time: "9:40",
  },
  {
    id: "seed-prescription-august",
    sender: "august",
    text: "I can help gather the context a clinician would need before any medication decision. Is this a new prescription or a refill?",
    time: "9:41",
  },
];

const connectedAugustMessages: ChatMessage[] = [
  ...seededSymptomMessages,
  {
    id: "seed-summary-ready",
    sender: "august",
    text: "The duration and worsening symptoms make a clinician review a reasonable next step. I organized what you shared and sent the summary you confirmed.",
    time: "9:48",
  },
];

const clinicianAssignedMessage: ChatMessage = {
  id: "seed-maya-assigned",
  sender: "system",
  text: "Your confirmed summary was shared with Maya",
  time: "9:49",
};

const baseScenario: ScenarioPreset = {
  channel: "august",
  flow: "symptom",
  phase: "asking",
  questionIndex: 3,
  augustMessages: seededSymptomMessages,
  mayaMessages: [],
  answers: [
    "Five days ago. I had a fever last night.",
    "No. I can breathe and drink normally, and I have not fainted.",
    "It is worse today. Ibuprofen helped a little.",
  ],
  clinicianConnected: false,
  privateMode: false,
  labStep: 0,
  labMethod: "lab",
  emergencyConcern: "",
};

function getScenarioPreset(scenario?: string): ScenarioPreset {
  switch (scenario) {
    case undefined:
    case "empty":
      return {
        ...baseScenario,
        flow: "new",
        phase: "empty",
        questionIndex: 0,
        augustMessages: [],
        answers: [],
      };
    case "prescription":
      return {
        ...baseScenario,
        flow: "prescription",
        questionIndex: 0,
        augustMessages: seededPrescriptionMessages,
        answers: [],
      };
    case "clinician-wait":
      return {
        ...baseScenario,
        channel: "maya",
        phase: "waiting",
        questionIndex: 5,
        augustMessages: connectedAugustMessages,
        mayaMessages: [clinicianAssignedMessage],
        clinicianConnected: true,
      };
    case "testing":
    case "upload":
      return {
        ...baseScenario,
        channel: "maya",
        flow: "prescription",
        phase: "lab-choice",
        questionIndex: 5,
        augustMessages: connectedAugustMessages,
        mayaMessages: [
          clinicianAssignedMessage,
          {
            id: "seed-maya-testing",
            sender: "maya",
            text: "A rapid throat test is the safest next step before deciding on medication. You can arrange it here or upload a result from another lab.",
            time: "1:18",
          },
        ],
        clinicianConnected: true,
      };
    case "upload-low-confidence":
      return {
        ...baseScenario,
        channel: "maya",
        flow: "prescription",
        phase: "low-confidence",
        questionIndex: 5,
        augustMessages: connectedAugustMessages,
        mayaMessages: [
          clinicianAssignedMessage,
          {
            id: "seed-maya-upload-request",
            sender: "maya",
            text: "Attach the result here. I’ll review it after you confirm what August can read.",
            time: "1:18",
          },
          {
            id: "seed-low-confidence-upload",
            sender: "patient",
            text: "Attached throat-test-photo.jpg",
            time: "1:24",
          },
        ],
        clinicianConnected: true,
      };
    case "result-review":
      return {
        ...baseScenario,
        channel: "maya",
        flow: "prescription",
        phase: "result-waiting",
        questionIndex: 5,
        augustMessages: connectedAugustMessages,
        mayaMessages: [
          clinicianAssignedMessage,
          {
            id: "seed-result-added",
            sender: "system",
            text: "Confirmed report added to Maya’s conversation",
            time: "2:04",
          },
        ],
        clinicianConnected: true,
      };
    case "prescription-appropriate":
      return {
        ...baseScenario,
        channel: "maya",
        flow: "prescription",
        phase: "result-reviewed",
        questionIndex: 5,
        augustMessages: connectedAugustMessages,
        mayaMessages: [
          clinicianAssignedMessage,
          {
            id: "seed-treatment-ready",
            sender: "maya",
            text: "I reviewed the result and your medication history. Treatment is appropriate, and the prescription details are ready for you to review.",
            time: "2:22",
          },
        ],
        clinicianConnected: true,
      };
    case "prescription-declined":
      return {
        ...baseScenario,
        channel: "maya",
        flow: "prescription",
        phase: "result-reviewed",
        questionIndex: 5,
        augustMessages: connectedAugustMessages,
        mayaMessages: [
          clinicianAssignedMessage,
          {
            id: "seed-treatment-declined",
            sender: "maya",
            text: "Based on the reaction you described, I would not prescribe that medication here. I can help with a safer alternative and when to seek in-person care.",
            time: "2:22",
          },
        ],
        clinicianConnected: true,
      };
    case "unsupported":
      return {
        ...baseScenario,
        flow: "prescription",
        phase: "unsupported",
        questionIndex: 0,
        augustMessages: [
          {
            id: "seed-unsupported-patient",
            sender: "patient",
            text: "Can you refill my controlled medication?",
            time: "9:40",
          },
          {
            id: "seed-unsupported-august",
            sender: "august",
            text: "This request isn’t supported through August. Contact the clinician who already prescribes this medication or your ongoing primary-care team.",
            time: "9:41",
          },
        ],
        answers: [],
      };
    case "follow-up":
      return {
        ...baseScenario,
        phase: "follow-up",
        questionIndex: 5,
        clinicianConnected: true,
        augustMessages: [
          ...connectedAugustMessages,
          {
            id: "seed-follow-up-divider",
            sender: "system",
            text: "Two days later",
            time: "9:30",
          },
          {
            id: "seed-follow-up",
            sender: "august",
            text: "How is your throat today—better, worse, or about the same? Add anything else you want Maya to know.",
            time: "9:30",
          },
        ],
        mayaMessages: [clinicianAssignedMessage],
      };
    case "care":
      return {
        ...baseScenario,
        channel: "care",
        phase: "waiting",
        questionIndex: 5,
        augustMessages: connectedAugustMessages,
        mayaMessages: [clinicianAssignedMessage],
        clinicianConnected: true,
      };
    case "emergency":
      return {
        ...baseScenario,
        channel: "emergency",
        phase: "emergency-initial",
        emergencyConcern: "Severe chest pain and trouble breathing",
      };
    case "symptom":
      return baseScenario;
    default:
      return {
        ...baseScenario,
        flow: "new",
        phase: "empty",
        questionIndex: 0,
        augustMessages: [],
        answers: [],
      };
  }
}

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

function Message({ message }: { message: ChatMessage }) {
  if (message.sender === "system") {
    return (
      <div className={styles.systemMessage}>
        <Icon name="check" />
        <span>{message.text}</span>
      </div>
    );
  }

  if (message.sender === "patient") {
    return (
      <div className={`${styles.messageRow} ${styles.patientRow}`}>
        <div className={styles.patientBubble}>
          <p>{message.text}</p>
          <span>{message.time ?? "Now"} · ✓✓</span>
        </div>
      </div>
    );
  }

  if (message.sender === "maya") {
    return (
      <div className={styles.messageRow}>
        <Avatar person="maya" size="small" />
        <div className={styles.mayaMessage}>
          <span>
            <strong>Maya</strong>
            <small>{message.time ?? "Now"}</small>
          </span>
          <p>{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messageRow}>
      <Avatar person="august" size="small" />
      <div className={styles.augustMessage}>
        <p>{message.text}</p>
        <span>{message.time ?? "Now"}</span>
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

function Composer({
  recipient,
  value,
  disabled,
  onChange,
  onSubmit,
  onFile,
}: {
  recipient: "August" | "Maya";
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFile: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <input
        ref={fileRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/*,.pdf"
        aria-label="Choose a photo or PDF"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        aria-label="Add attachment"
        onClick={() => fileRef.current?.click()}
      >
        <Icon name="plus" />
      </button>
      <input
        aria-label={`Message ${recipient}`}
        placeholder={`Message ${recipient}…`}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="submit"
        className={styles.sendButton}
        aria-label="Send message"
        disabled={disabled || !value.trim()}
      >
        <Icon name="send" />
      </button>
    </form>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  secondary,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${styles.primaryButton} ${
        secondary ? styles.secondaryButton : ""
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      <span>{children}</span>
      <Icon name="arrow" />
    </button>
  );
}

function BottomNav({
  active,
  hasCare,
  onNew,
  onInfo,
  onCare,
  onAugust,
}: {
  active: "august" | "care";
  hasCare: boolean;
  onNew?: () => void;
  onInfo: () => void;
  onCare: () => void;
  onAugust: () => void;
}) {
  return (
    <nav className={styles.bottomNav} aria-label="Main navigation">
      {onNew ? (
        <button type="button" aria-label="New conversation" onClick={onNew}>
          <Icon name="plus" />
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Conversation history"
        onClick={onInfo}
      >
        <Icon name="clock" />
      </button>
      <button
        type="button"
        className={active === "care" ? styles.activeNav : ""}
        aria-label="Care conversations"
        onClick={onCare}
      >
        <Icon name="message" />
        {active === "care" ? <strong>Care</strong> : null}
        {hasCare ? <i className={styles.unreadDot} /> : null}
      </button>
      <span />
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

function Header({
  channel,
  privateMode,
  onCare,
  onBack,
  showCareNavigation,
}: {
  channel: "august" | "maya" | "care";
  privateMode: boolean;
  onCare: () => void;
  onBack: () => void;
  showCareNavigation: boolean;
}) {
  if (channel === "care") {
    return (
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <strong>Care</strong>
          <span>Your clinician conversations</span>
        </div>
      </header>
    );
  }

  const maya = channel === "maya";
  return (
    <header className={styles.header}>
      {showCareNavigation ? (
        <button
          type="button"
          className={styles.backButton}
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <Icon name="back" />
        </button>
      ) : null}
      <Avatar person={maya ? "maya" : "august"} />
      <div className={styles.headerCopy}>
        <strong>{maya ? "Maya (Clinician)" : "August"}</strong>
        <span>
          {maya
            ? "Usually replies in 2–4 hours"
            : privateMode
              ? "Private · Maya cannot see this"
              : "Care guide"}
        </span>
      </div>
      {showCareNavigation ? (
        <button
          type="button"
          className={styles.headerButton}
          aria-label="Open Care conversations"
          onClick={onCare}
        >
          <Icon name="message" />
        </button>
      ) : null}
    </header>
  );
}

function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className={styles.sheetHandle} />
        <header>
          <strong>{title}</strong>
          <button type="button" aria-label={`Close ${title}`} onClick={onClose}>
            <Icon name="close" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function InlineCard({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: keyof typeof icons;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.inlineCard}>
      <div className={styles.cardTitle}>
        <span>
          <Icon name={icon} />
        </span>
        <div>
          <small>{eyebrow}</small>
          <strong>{title}</strong>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyConversation() {
  return <div className={styles.emptyConversation} aria-hidden="true" />;
}

const now = () =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());

const createMessage = (sender: Sender, text: string): ChatMessage => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  sender,
  text,
  time: now(),
});

export function UnifiedCarePrototype({
  initialScenario,
}: {
  initialScenario?: string;
}) {
  const preset = getScenarioPreset(initialScenario);
  const isolatedScenario = initialScenario !== undefined;
  const isolatedIntake =
    initialScenario === "symptom" || initialScenario === "prescription";
  const isolatedReport =
    initialScenario === "testing" ||
    initialScenario === "upload-low-confidence" ||
    initialScenario === "result-review";
  const [channel, setChannel] = useState<Channel>(preset.channel);
  const [flow, setFlow] = useState<Flow>(preset.flow);
  const [phase, setPhase] = useState<Phase>(preset.phase);
  const [questionIndex, setQuestionIndex] = useState(preset.questionIndex);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<"august" | "maya" | null>(null);
  const [augustMessages, setAugustMessages] = useState<ChatMessage[]>(
    preset.augustMessages,
  );
  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);
  const [mayaMessages, setMayaMessages] = useState<ChatMessage[]>(
    preset.mayaMessages,
  );
  const [answers, setAnswers] = useState<string[]>(preset.answers);
  const [corrections, setCorrections] = useState<string[]>([]);
  const [careForSelf, setCareForSelf] = useState(false);
  const [adult, setAdult] = useState(false);
  const [location, setLocation] = useState(false);
  const [consent, setConsent] = useState(false);
  const [clinicianConnected, setClinicianConnected] = useState(
    preset.clinicianConnected,
  );
  const [privateMode, setPrivateMode] = useState(preset.privateMode);
  const [sheet, setSheet] = useState<"info" | "summary" | null>(null);
  const [filename, setFilename] = useState("");
  const [uploadLowConfidence, setUploadLowConfidence] = useState(false);
  const [labStep, setLabStep] = useState(preset.labStep);
  const [labMethod, setLabMethod] = useState<"lab" | "kit">(
    preset.labMethod,
  );
  const [emergencyConcern, setEmergencyConcern] = useState(
    preset.emergencyConcern,
  );
  const [safeToExit, setSafeToExit] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const connected = clinicianConnected;
  const hasConversation =
    augustMessages.length > 0 ||
    privateMessages.length > 0 ||
    mayaMessages.length > 0;

  const questions =
    flow === "prescription" ? prescriptionQuestions : symptomQuestions;

  const privateThread = privateMode && connected;
  const displayedAugustMessages = privateThread
    ? [
        ...augustMessages,
        {
          id: "private-divider",
          sender: "system" as const,
          text: "Private conversation · Maya cannot see messages below",
        },
        ...privateMessages,
      ]
    : augustMessages;

  useEffect(() => {
    requestAnimationFrame(() => {
      const node = scrollRef.current;
      if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    });
  }, [
    channel,
    phase,
    pending,
    augustMessages,
    privateMessages,
    mayaMessages,
  ]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const replyAfter = (
    person: "august" | "maya",
    callback: () => void,
    duration = 560,
  ) => {
    setPending(person);
    const timer = window.setTimeout(() => {
      setPending(null);
      callback();
    }, duration);
    timers.current.push(timer);
  };

  const addAugust = (text: string) =>
    setAugustMessages((current) => [...current, createMessage("august", text)]);

  const addMaya = (text: string) =>
    setMayaMessages((current) => [...current, createMessage("maya", text)]);

  const startEmergency = (concern: string) => {
    setEmergencyConcern(concern);
    setChannel("emergency");
    setPhase("emergency-initial");
    setPending(null);
  };

  const startConversation = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    if (hasEmergencySignal(clean)) {
      startEmergency(clean);
      return;
    }

    setPrivateMode(false);
    setChannel("august");
    setAugustMessages([createMessage("patient", clean)]);
    setAnswers([]);
    setCorrections([]);
    setQuestionIndex(0);

    if (unsupportedPattern.test(clean)) {
      setFlow("prescription");
      setPhase("unsupported");
      replyAfter("august", () =>
        addAugust(
          "This request isn’t supported through August. Contact the clinician who already prescribes this medication or your ongoing primary-care team.",
        ),
      );
      return;
    }

    if (labPattern.test(clean)) {
      setFlow("lab");
      setPhase("lab-choice");
      replyAfter("august", () =>
        addAugust(
          "You can add a report here. I’ll read what is clear, then ask you to confirm it before anything is shared.",
        ),
      );
      return;
    }

    const nextFlow: Flow = prescriptionPattern.test(clean)
      ? "prescription"
      : "symptom";
    setFlow(nextFlow);
    setPhase("asking");
    replyAfter("august", () =>
      addAugust(
        nextFlow === "prescription"
          ? "I can help gather the context a clinician would need before any medication decision. Is this a new prescription or a refill?"
          : symptomQuestions[0],
      ),
    );
  };

  const completeIntake = () => {
    const recommendation =
      flow === "prescription"
        ? "I have enough context to prepare a clinician review. A clinician will decide whether medication, testing, or another plan is appropriate."
        : "The duration and worsening symptoms make a clinician review a reasonable next step. I’ve organized what you shared so you can check it first.";
    addAugust(recommendation);
    setPhase("summary");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || pending) return;
    setInput("");

    if (channel === "care") {
      setChannel("august");
      if (!connected) {
        startConversation(value);
        return;
      }
      setPrivateMode(true);
      setPrivateMessages((current) => [
        ...current,
        createMessage("patient", value),
      ]);
      replyAfter("august", () =>
        setPrivateMessages((current) => [
          ...current,
          createMessage(
            "august",
            "I can help with that while Maya reviews. This message remains private unless you choose to share it.",
          ),
        ]),
      );
      return;
    }

    if (hasEmergencySignal(value)) {
      const recipient = channel === "maya" ? "maya" : "august";
      if (recipient === "maya") {
        setMayaMessages((current) => [
          ...current,
          createMessage("patient", value),
        ]);
      } else {
        setAugustMessages((current) => [
          ...current,
          createMessage("patient", value),
        ]);
      }
      startEmergency(value);
      return;
    }

    if (phase === "empty") {
      startConversation(value);
      return;
    }

    if (privateThread) {
      setPrivateMessages((current) => [
        ...current,
        createMessage("patient", value),
      ]);
      replyAfter("august", () =>
        setPrivateMessages((current) => [
          ...current,
          createMessage(
            "august",
            "I can explain what that means while Maya reviews. This stays between you and August unless you choose to share it.",
          ),
        ]),
      );
      return;
    }

    if (phase === "asking") {
      setAugustMessages((current) => [
        ...current,
        createMessage("patient", value),
      ]);
      const nextAnswers = [...answers, value];
      setAnswers(nextAnswers);
      const next = questionIndex + 1;
      setQuestionIndex(next);
      replyAfter("august", () => {
        if (next >= questions.length) {
          completeIntake();
        } else {
          addAugust(questions[next]);
        }
      });
      return;
    }

    if (phase === "summary") {
      setCorrections((current) => [...current, value]);
      setAugustMessages((current) => [
        ...current,
        createMessage("patient", value),
      ]);
      replyAfter("august", () =>
        addAugust("I added that correction to the summary."),
      );
      return;
    }

    if (channel === "august" && phase === "follow-up") {
      setAugustMessages((current) => [
        ...current,
        createMessage("patient", value),
      ]);
      replyAfter("august", () => {
        if (/worse|fever|new symptom|not better|pain/i.test(value)) {
          if (initialScenario === "follow-up") {
            addAugust(
              "Because symptoms are worse, contact Maya in your existing care conversation. If you develop trouble breathing, cannot swallow liquids, feel faint, or have severe chest pain, seek emergency care now.",
            );
            return;
          }
          addAugust(
            "I want to recheck safety before deciding what should happen next. Are you having trouble breathing, unable to swallow liquids, feeling faint, or having severe chest pain?",
          );
          setFlow("symptom");
          setQuestionIndex(1);
          setAnswers([]);
          setPhase("asking");
          return;
        }
        addAugust(
          "I’m glad it has improved. Keep following Maya’s plan. If symptoms return or anything new concerns you, message the care team here.",
        );
      });
      return;
    }

    if (channel === "maya" && phase === "maya-active") {
      setMayaMessages((current) => [
        ...current,
        createMessage("patient", value),
      ]);
      replyAfter("maya", () => {
        if (flow === "symptom") {
          addMaya(
            "Based on the assessment, treatment is appropriate. I’m preparing the prescription details for you to review before anything is sent.",
          );
          setPhase("result-reviewed");
          return;
        }
        if (flow === "prescription" && /reaction|allerg|pregnan|kidney/i.test(value)) {
          addMaya(
            "Based on the reaction you described, I would not prescribe that medication here. I can help with a safer alternative plan and when to seek in-person care.",
          );
          setPhase("result-reviewed");
          return;
        }
        if (
          flow === "prescription" &&
          /refill|already take|current prescription/i.test(answers[0] ?? "")
        ) {
          addMaya(
            "I confirmed the refill history and the information you shared. The medication is appropriate to continue, and I can prepare the fulfillment step now.",
          );
          setPhase("result-reviewed");
          return;
        }
        addMaya(
          "A rapid throat test is the safest next step before deciding on medication. You can arrange it here or upload a result from another lab.",
        );
        setPhase("lab-choice");
      }, 720);
      return;
    }

    if (phase === "extract") {
      setMayaMessages((current) => [
        ...current,
        createMessage("patient", value),
      ]);
      setCorrections((current) => [...current, value]);
      return;
    }

    const sender = channel === "maya" ? setMayaMessages : setAugustMessages;
    sender((current) => [...current, createMessage("patient", value)]);
  };

  const connect = () => {
    setClinicianConnected(true);
    setPhase("waiting");
    setChannel("maya");
    setPrivateMode(false);
    setMayaMessages([
      createMessage(
        "system",
        "Your confirmed summary was shared with Maya",
      ),
    ]);
  };

  const checkForMaya = (result = false) => {
    if (result) {
      addMaya(
        "I reviewed the report. The rapid strep result is positive and fits the symptoms you described. I can now send the treatment plan.",
      );
      setPhase("result-reviewed");
      return;
    }
    addMaya(
      flow === "prescription"
        ? "Hi Anuruddh—I reviewed your request and history. Have you ever had a serious reaction to this medication, and are you taking anything else right now?"
        : "Hi Anuruddh—I reviewed what you shared. Is the throat swelling stronger on one side, and are you still able to drink normally?",
    );
    setPhase("maya-active");
  };

  const startUpload = (file: File) => {
    setFilename(file.name);
    setUploadLowConfidence(/blur|unreadable|dark|photo/i.test(file.name));
    const message = createMessage("patient", `Attached ${file.name}`);
    if (channel === "maya") {
      setMayaMessages((current) => [...current, message]);
    } else {
      setAugustMessages((current) => [...current, message]);
    }
    setPhase("upload-selected");
  };

  const processUpload = () => {
    setPhase("uploading");
    const uploadTimer = window.setTimeout(() => {
      setPhase("upload-processing");
      const processingTimer = window.setTimeout(() => {
        setPhase(uploadLowConfidence ? "low-confidence" : "extract");
      }, 900);
      timers.current.push(processingTimer);
    }, 900);
    timers.current.push(uploadTimer);
  };

  const confirmExtract = () => {
    if (clinicianConnected) {
      setMayaMessages((current) => [
        ...current,
        createMessage(
          "system",
          "Confirmed report added to Maya’s conversation",
        ),
      ]);
      setChannel("maya");
      setPhase("result-waiting");
      return;
    }
    setAugustMessages((current) => [
      ...current,
      createMessage("system", "Confirmed report added to this conversation"),
      createMessage(
        "august",
        "I captured the positive rapid strep result. I’ll include it in the summary so a clinician can review it with your symptoms.",
      ),
    ]);
    setCorrections((current) => [
      ...current,
      "Confirmed report: rapid strep positive; collected today.",
    ]);
    setFlow("symptom");
    setPhase("summary");
    setChannel("august");
  };

  const advanceArrangedLab = () => {
    const next = labStep + 1;
    setLabStep(next);
    if (next >= 4) {
      if (clinicianConnected) {
        setMayaMessages((current) => [
          ...current,
          createMessage("system", "Rapid throat test result is ready"),
        ]);
        setChannel("maya");
        setPhase("result-waiting");
      } else {
        setAugustMessages((current) => [
          ...current,
          createMessage("system", "Rapid throat test result is ready"),
          createMessage(
            "august",
            "The result is ready. I’ll add it to the information you review before connecting with a clinician.",
          ),
        ]);
        setCorrections((current) => [
          ...current,
          "Confirmed report: rapid strep result ready for review.",
        ]);
        setFlow("symptom");
        setChannel("august");
        setPhase("summary");
      }
    }
  };

  const openFollowUp = () => {
    setChannel("august");
    setPrivateMode(false);
    setPhase("follow-up");
    setAugustMessages((current) => [
      ...current,
      createMessage(
        "system",
        flow === "prescription" ? "Two days later" : "The next day",
      ),
      createMessage(
        "august",
        flow === "prescription"
          ? "How are you feeling since starting Maya’s plan? Tell me what has improved, what has not, and whether anything new has appeared."
          : "How is your throat today—better, worse, or about the same? Add anything else you want Maya to know.",
      ),
    ]);
  };

  const reset = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setChannel("august");
    setFlow("new");
    setPhase("empty");
    setQuestionIndex(0);
    setInput("");
    setPending(null);
    setAugustMessages([]);
    setPrivateMessages([]);
    setMayaMessages([]);
    setAnswers([]);
    setCorrections([]);
    setCareForSelf(false);
    setAdult(false);
    setLocation(false);
    setConsent(false);
    setClinicianConnected(false);
    setPrivateMode(false);
    setSheet(null);
    setFilename("");
    setLabStep(0);
    setLabMethod("lab");
    setEmergencyConcern("");
    setSafeToExit(false);
  };

  const finishEmergency = () => {
    if (isolatedScenario) {
      setPhase("emergency-complete");
      setSafeToExit(false);
      return;
    }
    reset();
  };

  const openAugust = () => {
    setChannel("august");
    setPrivateMode(connected);
  };

  const currentMessages =
    channel === "maya" ? mayaMessages : displayedAugustMessages;

  const summaryItems = useMemo(() => {
    const answerLabels =
      flow === "prescription"
        ? [
            "Request type",
            "Symptoms and timing",
            "Current safety",
            "Treatments and medicines",
            "Antibiotic history",
          ]
        : [
            "Timing and fever",
            "Current safety",
            "Progression",
            "Temperature and swelling",
            "Medication and conditions",
          ];
    const initial = augustMessages.find(
      (message) => message.sender === "patient",
    )?.text;
    return [
      ...(initial
        ? [
            {
              label:
                flow === "prescription"
                  ? "Medication request"
                  : "Main concern",
              value: initial,
            },
          ]
        : []),
      ...answers.map((answer, index) => ({
        label: answerLabels[index] ?? "Additional detail",
        value: answer,
      })),
      ...corrections.map((correction) => ({
        label: "Patient correction",
        value: correction,
      })),
    ];
  }, [answers, augustMessages, corrections, flow]);

  const summarySentence = summaryItems
    .map((item) => item.value.replace(/[.]+$/, ""))
    .join(" · ");

  if (channel === "emergency") {
    return (
      <main className={styles.stage}>
        <section
          className={`${styles.viewport} ${styles.emergencyViewport} ${
            phase === "emergency-exit"
              ? styles.emergencyLight
              : styles.emergencyDark
          }`}
          data-channel="emergency"
          data-phase={phase}
          data-scenario={initialScenario}
        >
          <StatusBar />
          <div className={styles.emergencyScreen}>
            <div className={styles.emergencyMark}>
              <Icon name="shield" />
            </div>
            {phase === "emergency-initial" ? (
              <>
                <span className={styles.emergencyEyebrow}>Urgent safety</span>
                <h1>This may need emergency care now.</h1>
                <p>
                  We’re pausing the conversation so you can get urgent help.
                </p>
                <InlineCard
                  icon="shield"
                  eyebrow="Reported"
                  title={
                    emergencyConcern ||
                    "Trouble breathing or another urgent warning sign"
                  }
                >
                  <p className={styles.cardCopy}>
                    Routine chat remains paused until the urgent concern is
                    resolved.
                  </p>
                </InlineCard>
                <PrimaryButton
                  onClick={() => setPhase("emergency-location")}
                >
                  Call emergency services
                </PrimaryButton>
                <button
                  type="button"
                  className={styles.emergencyTextButton}
                  onClick={() => setPhase("emergency-contacted")}
                >
                  I’m already getting help
                </button>
              </>
            ) : null}
            {phase === "emergency-location" ? (
              <>
                <span className={styles.emergencyEyebrow}>Location</span>
                <h1>Confirm where help is needed.</h1>
                <p>Emergency services will need your current location.</p>
                <div className={styles.locationCard}>
                  <Icon name="location" />
                  <span>
                    <strong>Current location</strong>
                    <small>San Francisco, California</small>
                  </span>
                  <button type="button" aria-label="Location confirmed">
                    <Icon name="check" />
                  </button>
                </div>
                <PrimaryButton
                  onClick={() => setPhase("emergency-contacted")}
                >
                  Confirm and call
                </PrimaryButton>
                <button
                  type="button"
                  className={styles.emergencyTextButton}
                  onClick={() => setPhase("emergency-refused")}
                >
                  I’m not calling
                </button>
              </>
            ) : null}
            {phase === "emergency-contacted" ? (
              <>
                <span className={styles.emergencyEyebrow}>Help contacted</span>
                <h1>Follow the dispatcher’s instructions.</h1>
                <p>
                  Help has been contacted. Keep your phone available.
                </p>
                <InlineCard
                  icon="phone"
                  eyebrow="While help is coming"
                  title="Follow the dispatcher’s instructions"
                >
                  <p className={styles.cardCopy}>
                    Sit somewhere safe if you can, tell someone nearby, and
                    keep this screen open.
                  </p>
                </InlineCard>
                <PrimaryButton onClick={() => setPhase("emergency-exit")}>
                  Safety check before leaving
                </PrimaryButton>
              </>
            ) : null}
            {phase === "emergency-exit" ? (
              <>
                <span className={styles.emergencyEyebrow}>Safety check</span>
                <h1>Confirm before leaving.</h1>
                <p>
                  If warning signs continue, call emergency services now.
                </p>
                <label className={styles.exitCheck}>
                  <input
                    type="checkbox"
                    checked={safeToExit}
                    onChange={(event) => setSafeToExit(event.target.checked)}
                  />
                  <span>
                    Urgent warning signs stopped or help was contacted.
                  </span>
                </label>
                <PrimaryButton
                  disabled={!safeToExit}
                  onClick={finishEmergency}
                >
                  Confirm signs stopped
                </PrimaryButton>
                <button
                  type="button"
                  className={styles.emergencyTextButton}
                  onClick={() => setPhase("emergency-contacted")}
                >
                  Stay on this screen
                </button>
              </>
            ) : null}
            {phase === "emergency-refused" ? (
              <>
                <span className={styles.emergencyEyebrow}>Immediate help is still recommended</span>
                <h1>Do not stay alone.</h1>
                <p>
                  Call emergency services, or ask someone nearby to call and
                  stay with you. Do not drive yourself.
                </p>
                <PrimaryButton
                  onClick={() => setPhase("emergency-contacted")}
                >
                  Call emergency services
                </PrimaryButton>
                <label className={styles.exitCheck}>
                  <input
                    type="checkbox"
                    checked={safeToExit}
                    onChange={(event) => setSafeToExit(event.target.checked)}
                  />
                  <span>I am with another person and understand the risk.</span>
                </label>
                <button
                  type="button"
                  className={styles.emergencyTextButton}
                  disabled={!safeToExit}
                  onClick={finishEmergency}
                >
                  Exit urgent guidance
                </button>
              </>
            ) : null}
            {phase === "emergency-complete" ? (
              <>
                <span className={styles.emergencyEyebrow}>Flow complete</span>
                <h1>Urgent guidance is complete.</h1>
                <p>
                  This emergency flow ends here. No routine conversation is
                  opened from this state.
                </p>
              </>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.stage}>
      <section
        className={styles.viewport}
        aria-label="August care conversation"
        data-channel={channel}
        data-phase={phase}
        data-scenario={initialScenario}
      >
        <StatusBar />
        <Header
          channel={channel === "care" ? "care" : channel}
          privateMode={privateThread}
          showCareNavigation={!isolatedScenario || initialScenario === "care"}
          onCare={() => setChannel("care")}
          onBack={() => {
            setChannel("care");
            setPrivateMode(false);
          }}
        />

        {channel === "care" ? (
          <div className={styles.careInbox}>
            <span className={styles.sectionLabel}>ACTIVE</span>
            {connected ? (
              <>
                <button
                  type="button"
                  className={styles.threadRow}
                  onClick={() => {
                    setChannel("maya");
                    setPrivateMode(false);
                  }}
                >
                  <Avatar person="maya" size="large" />
                  <span>
                    <strong>Maya <small>Clinician</small></strong>
                    <p>
                      {phase === "waiting"
                        ? "Reviewing your visit · we’ll notify you"
                        : phase === "result-waiting"
                          ? "Reviewing your result"
                          : "Your care conversation"}
                    </p>
                  </span>
                  <Icon name="arrow" />
                </button>
              </>
            ) : (
              <div className={styles.emptyCare}>
                <span className={styles.emptyIcon}>
                  <Icon name="message" />
                </span>
                <strong>No clinician conversation yet</strong>
                <p>
                  When a clinician joins your care, their conversation will
                  appear here.
                </p>
                <PrimaryButton onClick={openAugust}>
                  Ask August
                </PrimaryButton>
              </div>
            )}
            <span className={styles.sectionLabel}>AUGUST</span>
            <button
              type="button"
              className={styles.threadRow}
              onClick={openAugust}
            >
              <Avatar person="august" size="large" />
              <span>
                <strong>August <small>Care guide</small></strong>
                <p>Ask August privately about this care flow.</p>
              </span>
              <Icon name="arrow" />
            </button>
          </div>
        ) : (
          <div
            className={styles.conversation}
            ref={scrollRef}
            aria-label="Conversation messages"
            aria-live="polite"
            tabIndex={0}
          >
            <div
              className={`${styles.transcript} ${
                phase === "empty" ? styles.emptyTranscript : ""
              }`}
            >
              {phase === "empty" ? (
                <EmptyConversation />
              ) : (
                currentMessages.map((message) => (
                  <Message key={message.id} message={message} />
                ))
              )}
              {pending && channel !== "care" ? <Typing person={pending} /> : null}

              {initialScenario === "empty" &&
              phase === "asking" &&
              !pending ? (
                <InlineCard
                  icon="check"
                  eyebrow="Flow complete"
                  title="The opening is ready"
                >
                  <p className={styles.cardCopy}>
                    August identified the first focused question. This start
                    flow ends here.
                  </p>
                </InlineCard>
              ) : null}

              {privateThread ? (
                <button
                  type="button"
                  className={styles.returnToMaya}
                  onClick={() => {
                    setChannel("maya");
                    setPrivateMode(false);
                  }}
                >
                  <Avatar person="maya" size="small" />
                  <span>Return to Maya</span>
                  <Icon name="arrow" />
                </button>
              ) : null}

              {channel === "august" && phase === "summary" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Review before sharing"
                  title="Visit summary"
                >
                  <p className={styles.summaryParagraph}>{summarySentence}.</p>
                  <p className={styles.cardCopy}>
                    Check this before anything is shared with Maya.
                  </p>
                  <div className={styles.cardActions}>
                    {isolatedIntake ? (
                      <p className={styles.cardCopy}>
                        <strong>Intake flow complete.</strong> This isolated
                        route ends with a reviewable summary.
                      </p>
                    ) : (
                      <PrimaryButton onClick={() => setPhase("eligibility")}>
                        Confirm summary
                      </PrimaryButton>
                    )}
                    <PrimaryButton
                      secondary
                      onClick={() => setInput("Correction: ")}
                    >
                      Correct a detail
                    </PrimaryButton>
                  </div>
                </InlineCard>
              ) : null}

              {channel === "august" && phase === "unsupported" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Medication request"
                  title="A useful next step"
                >
                  <p className={styles.cardCopy}>
                    Contact the clinician who already prescribes this medication
                    or your ongoing primary-care team. You can still keep a copy
                    of the information you shared.
                  </p>
                  <div className={styles.cardActions}>
                    <PrimaryButton onClick={() => window.print()}>
                      Download a care summary
                    </PrimaryButton>
                    {!isolatedScenario ? (
                      <PrimaryButton secondary onClick={reset}>
                        Start a different concern
                      </PrimaryButton>
                    ) : null}
                  </div>
                </InlineCard>
              ) : null}

              {channel === "august" && phase === "eligibility" ? (
                <InlineCard
                  icon="shield"
                  eyebrow="Preparing clinician care"
                  title="Confirm these details before anything is shared"
                >
                  <div className={styles.confirmList}>
                    <label>
                      <input
                        type="checkbox"
                        checked={careForSelf}
                        onChange={(event) => setCareForSelf(event.target.checked)}
                      />
                      <span>This care is for me</span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={adult}
                        onChange={(event) => setAdult(event.target.checked)}
                      />
                      <span>I am 18 or older</span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={location}
                        onChange={(event) => setLocation(event.target.checked)}
                      />
                      <span>I am currently in California</span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                      />
                      <span>I reviewed and agree to telehealth consent</span>
                    </label>
                  </div>
                  <p className={styles.cardCopy}>
                    A clinician uses independent medical judgment. Review does
                    not guarantee medication or a specific outcome.
                  </p>
                  <PrimaryButton
                    disabled={!careForSelf || !adult || !location || !consent}
                    onClick={connect}
                  >
                    Confirm and connect
                  </PrimaryButton>
                </InlineCard>
              ) : null}

              {channel === "maya" && phase === "waiting" ? (
                <InlineCard
                  icon="clock"
                  eyebrow="Maya is reviewing"
                  title="Usually replies in 2–4 hours"
                >
                  <p className={styles.cardCopy}>
                    You can leave this screen. We’ll notify you when Maya replies.
                  </p>
                  <div className={styles.cardActions}>
                    <PrimaryButton
                      secondary
                      onClick={() => {
                        setChannel("august");
                        setPrivateMode(true);
                      }}
                    >
                      Ask August while you wait
                    </PrimaryButton>
                    {!isolatedScenario ? (
                      <PrimaryButton onClick={() => checkForMaya()}>
                        Check for a reply
                      </PrimaryButton>
                    ) : (
                      <p className={styles.cardCopy}>
                        <strong>Handoff flow complete.</strong> This route ends
                        before a clinician response begins.
                      </p>
                    )}
                  </div>
                </InlineCard>
              ) : null}

              {phase === "lab-choice" &&
              (channel === "maya" || !connected) ? (
                <InlineCard
                  icon="lab"
                  eyebrow="Testing"
                  title="Choose how to complete the test"
                >
                  <div className={styles.cardActions}>
                    <PrimaryButton
                      onClick={() => {
                        setLabMethod("lab");
                        setLabStep(0);
                        setPhase("lab-arranged");
                      }}
                    >
                      Choose nearby lab
                    </PrimaryButton>
                    <PrimaryButton
                      secondary
                      onClick={() => {
                        setLabMethod("kit");
                        setLabStep(0);
                        setPhase("lab-arranged");
                      }}
                    >
                      Order an at-home kit
                    </PrimaryButton>
                    <label className={styles.uploadButton}>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) startUpload(file);
                        }}
                      />
                      <span>Upload an existing result</span>
                      <Icon name="arrow" />
                    </label>
                  </div>
                </InlineCard>
              ) : null}

              {phase === "lab-arranged" &&
              (channel === "maya" || !connected) ? (
                <InlineCard
                  icon="lab"
                  eyebrow="Rapid throat test"
                  title={
                    labMethod === "kit"
                      ? [
                          "Kit shipped",
                          "Kit delivered",
                          "Sample collected",
                          "Lab is processing",
                        ][labStep]
                      : [
                          "Order ready",
                          "Appointment confirmed",
                          "Sample collected",
                          "Lab is processing",
                        ][labStep]
                  }
                >
                  <ol className={styles.progressList}>
                    {["Ordered", "Scheduled", "Collected", "Processing"].map(
                      (item, index) => (
                        <li
                          key={item}
                          className={index <= labStep ? styles.completeStep : ""}
                        >
                          <span>{index + 1}</span>
                          {item}
                        </li>
                      ),
                    )}
                  </ol>
                  <PrimaryButton onClick={advanceArrangedLab}>
                    {
                      labMethod === "kit"
                        ? [
                            "Track kit",
                            "Record sample",
                            "Send sample to lab",
                            "Result is ready",
                          ][labStep]
                        : [
                            "Open scheduling",
                            "Mark appointment complete",
                            "Send sample to lab",
                            "Result is ready",
                          ][labStep]
                    }
                  </PrimaryButton>
                </InlineCard>
              ) : null}

              {phase === "upload-selected" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Ready to upload"
                  title={filename}
                >
                  <p className={styles.cardCopy}>
                    Nothing is shared until you review what was extracted.
                  </p>
                  <PrimaryButton onClick={processUpload}>
                    Upload report
                  </PrimaryButton>
                </InlineCard>
              ) : null}

              {phase === "uploading" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Uploading"
                  title={filename}
                >
                  <div className={styles.progressTrack}>
                    <span />
                  </div>
                  <p className={styles.cardCopy}>Reading the report now…</p>
                </InlineCard>
              ) : null}

              {phase === "upload-processing" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Processing"
                  title="August is extracting key details"
                >
                  <dl className={styles.extractList}>
                    <div>
                      <dt>Current task</dt>
                      <dd>Reading labels and values</dd>
                    </div>
                    <div>
                      <dt>Next</dt>
                      <dd>You confirm the extraction</dd>
                    </div>
                  </dl>
                </InlineCard>
              ) : null}

              {phase === "low-confidence" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Needs a clearer copy"
                  title="I couldn’t read this reliably"
                >
                  <p className={styles.cardCopy}>
                    No result was added. Try a brighter photo with the full page
                    in frame, or attach the original PDF.
                  </p>
                  <label className={styles.uploadButton}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) startUpload(file);
                      }}
                    />
                    <span>Choose a clearer file</span>
                    <Icon name="arrow" />
                  </label>
                </InlineCard>
              ) : null}

              {phase === "extract" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Confirm before sharing"
                  title="I found these details"
                >
                  <dl className={styles.extractList}>
                    <div>
                      <dt>Test</dt>
                      <dd>Rapid strep</dd>
                    </div>
                    <div>
                      <dt>Result</dt>
                      <dd>Positive</dd>
                    </div>
                    <div>
                      <dt>Collected</dt>
                      <dd>Today</dd>
                    </div>
                  </dl>
                  <p className={styles.cardCopy}>
                    Type a correction below, or confirm these details.
                  </p>
                  <PrimaryButton onClick={confirmExtract}>
                    Confirm and add for Maya
                  </PrimaryButton>
                </InlineCard>
              ) : null}

              {channel === "maya" && phase === "result-waiting" ? (
                <InlineCard
                  icon="clock"
                  eyebrow="Result received"
                  title="Waiting for Maya’s review"
                >
                  <p className={styles.cardCopy}>
                    The result is not interpreted yet. We’ll notify you when
                    Maya finishes reviewing it.
                  </p>
                  <div className={styles.cardActions}>
                    <PrimaryButton
                      secondary
                      onClick={() => {
                        setChannel("august");
                        setPrivateMode(true);
                      }}
                    >
                      Ask August while you wait
                    </PrimaryButton>
                    {!isolatedReport ? (
                      <PrimaryButton onClick={() => checkForMaya(true)}>
                        Check for an update
                      </PrimaryButton>
                    ) : (
                      <p className={styles.cardCopy}>
                        <strong>Report flow complete.</strong> Clinical
                        interpretation is reviewed in its own flow.
                      </p>
                    )}
                  </div>
                </InlineCard>
              ) : null}

              {channel === "maya" && phase === "result-reviewed" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Plan from Maya"
                  title={
                    mayaMessages.some((message) =>
                      message.text.includes("would not prescribe"),
                    )
                      ? "Medication is not appropriate"
                      : "Treatment is ready"
                  }
                >
                  <p className={styles.cardCopy}>
                    {mayaMessages.some((message) =>
                      message.text.includes("would not prescribe"),
                    )
                      ? "Use supportive care and arrange an in-person evaluation if symptoms worsen or do not improve."
                      : "Review the medication instructions and choose where you want the prescription sent."}
                  </p>
                  <PrimaryButton
                    onClick={() =>
                      setPhase(
                        mayaMessages.some((message) =>
                          message.text.includes("would not prescribe"),
                        )
                          ? "alternative"
                          : "prescription-review",
                      )
                    }
                  >
                    {mayaMessages.some((message) =>
                      message.text.includes("would not prescribe"),
                    )
                      ? "View alternative plan"
                      : "Review medication plan"}
                  </PrimaryButton>
                </InlineCard>
              ) : null}

              {channel === "maya" && phase === "alternative" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Alternative care"
                  title="Supportive care and follow-up"
                >
                  <p className={styles.cardCopy}>
                    Medication was not prescribed. Follow Maya’s supportive-care
                    plan and arrange an in-person evaluation if symptoms worsen
                    or do not improve.
                  </p>
                  {initialScenario === "prescription-declined" ? (
                    <p className={styles.cardCopy}>
                      <strong>Decision flow complete.</strong> Follow-up is
                      reviewed separately.
                    </p>
                  ) : (
                    <PrimaryButton onClick={openFollowUp}>
                      View care plan
                    </PrimaryButton>
                  )}
                </InlineCard>
              ) : null}

              {channel === "maya" && phase === "prescription-review" ? (
                <InlineCard
                  icon="file"
                  eyebrow="Prescription review"
                  title="Confirm the details before submission"
                >
                  <dl className={styles.extractList}>
                    <div>
                      <dt>Medication</dt>
                      <dd>Penicillin V · prescription details</dd>
                    </div>
                    <div>
                      <dt>Instructions</dt>
                      <dd>Follow clinician directions</dd>
                    </div>
                    <div>
                      <dt>Allergy check</dt>
                      <dd>Confirmed by Maya</dd>
                    </div>
                  </dl>
                  <PrimaryButton onClick={() => setPhase("pharmacy")}>
                    Choose a pharmacy
                  </PrimaryButton>
                </InlineCard>
              ) : null}

              {channel === "maya" && phase === "pharmacy" ? (
                <InlineCard
                  icon="location"
                  eyebrow="Pharmacy"
                  title="Choose where to send it"
                >
                  <dl className={styles.extractList}>
                    <div>
                      <dt>Selected</dt>
                      <dd>Castro Community Pharmacy</dd>
                    </div>
                    <div>
                      <dt>Distance</dt>
                      <dd>0.8 miles</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>Accepting electronic prescriptions</dd>
                    </div>
                  </dl>
                  <PrimaryButton
                    onClick={() => {
                      addMaya(
                        "The prescription was sent to Castro Community Pharmacy.",
                      );
                      setPhase("sent");
                    }}
                  >
                    Confirm pharmacy
                  </PrimaryButton>
                </InlineCard>
              ) : null}

              {channel === "maya" && phase === "sent" ? (
                <InlineCard
                  icon="check"
                  eyebrow="Sent to pharmacy"
                  title="The prescription was sent"
                >
                  <dl className={styles.extractList}>
                    <div>
                      <dt>Pharmacy</dt>
                      <dd>Castro Community Pharmacy</dd>
                    </div>
                    <div>
                      <dt>Sent</dt>
                      <dd>Today · {now()}</dd>
                    </div>
                    <div>
                      <dt>Next update</dt>
                      <dd>Pharmacy confirmation</dd>
                    </div>
                  </dl>
                  {initialScenario === "prescription-appropriate" ? (
                    <p className={styles.cardCopy}>
                      <strong>Fulfillment flow complete.</strong> Follow-up is
                      reviewed separately.
                    </p>
                  ) : (
                    <PrimaryButton onClick={openFollowUp}>
                      View care plan
                    </PrimaryButton>
                  )}
                </InlineCard>
              ) : null}

              {phase === "follow-up" ? (
                <InlineCard
                  icon="clock"
                  eyebrow="Tomorrow"
                  title="August will check in"
                >
                  <p className={styles.cardCopy}>
                    {initialScenario === "follow-up"
                      ? "Tell August how you feel. This route stays inside the follow-up flow."
                      : "Tell August how you feel, or return to Maya in Care if the treatment plan needs attention."}
                  </p>
                </InlineCard>
              ) : null}
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          <Composer
            recipient={channel === "maya" ? "Maya" : "August"}
            value={input}
            disabled={
              Boolean(pending) ||
              phase === "uploading" ||
              phase === "upload-processing" ||
              (initialScenario === "empty" && phase !== "empty")
            }
            onChange={setInput}
            onSubmit={submit}
            onFile={startUpload}
          />
          {!isolatedScenario ? (
            <BottomNav
              active={
                channel === "care" || channel === "maya" ? "care" : "august"
              }
              hasCare={connected}
              onNew={reset}
              onInfo={() => setSheet("info")}
              onCare={() => setChannel("care")}
              onAugust={openAugust}
            />
          ) : null}
        </footer>

        {sheet === "info" ? (
          <Sheet
            title={hasConversation ? "Conversation details" : "Conversation history"}
            onClose={() => setSheet(null)}
          >
            {hasConversation ? (
              <>
                <div className={styles.sheetRows}>
                  <p>
                    <span>Conversation</span>
                    <strong>
                      {flow === "new"
                        ? "New"
                        : flow === "prescription"
                          ? "Medication request"
                          : flow === "lab"
                            ? "Report review"
                            : "Symptom concern"}
                    </strong>
                  </p>
                  <p>
                    <span>Active recipient</span>
                    <strong>{channel === "maya" ? "Maya" : "August"}</strong>
                  </p>
                  <p>
                    <span>Clinician</span>
                    <strong>
                      {connected ? "Maya · assigned" : "Not connected"}
                    </strong>
                  </p>
                  <p>
                    <span>Message visibility</span>
                    <strong>
                      {privateThread
                        ? "Private to August"
                        : "Current conversation"}
                    </strong>
                  </p>
                </div>
                {summaryItems.length > 0 ? (
                  <PrimaryButton onClick={() => setSheet("summary")}>
                    Review collected information
                  </PrimaryButton>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyHistory}>
                <span className={styles.emptyIcon}>
                  <Icon name="clock" />
                </span>
                <strong>No conversation history yet</strong>
                <p>
                  New conversations and clinician visits will be organized here
                  after they begin.
                </p>
                <PrimaryButton
                  onClick={() => {
                    setSheet(null);
                    setChannel("august");
                    setPrivateMode(false);
                  }}
                >
                  Start with August
                </PrimaryButton>
              </div>
            )}
          </Sheet>
        ) : null}

        {sheet === "summary" ? (
          <Sheet title="Collected information" onClose={() => setSheet(null)}>
            <ul className={styles.sheetSummary}>
              {summaryItems.map((item, index) => (
                <li key={`${item.label}-sheet-${index}`}>
                  <small>{item.label}</small>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </Sheet>
        ) : null}
      </section>
    </main>
  );
}

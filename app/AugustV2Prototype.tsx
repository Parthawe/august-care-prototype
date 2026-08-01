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
import {
  ArrowLeft,
  ArrowRight,
  BatteryMedium,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Info,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Send,
  Signal,
  UserRoundCheck,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import styles from "./AugustV2Prototype.module.css";
import {
  createPrototypeV2Encounter,
  completeJourneyStates,
  defaultIntakeAnswers,
  getCompleteJourneyId,
  getCompleteJourneyLocation,
  getPreviousPrototypeV2State,
  getPrototypeV2StateIndex,
  IntakeAnswers,
  PrototypeV2Flow,
  PrototypeV2State,
} from "./prototypeV2Machine";

type Props = {
  completeJourney?: boolean;
  initialFlow: PrototypeV2Flow;
  initialState: PrototypeV2State;
};

type Message = {
  author: "august" | "patient" | "maya" | "system";
  content: string;
  time?: string;
};

type DetailRowData = {
  icon: LucideIcon;
  label: string;
  value: string;
  verified?: boolean;
};

const summaryLabels: Record<keyof IntakeAnswers, string> = {
  concern: "Concern",
  onset: "Timing and severity",
  warningSigns: "Urgent warning signs",
  history: "History and medicines",
  allergies: "Medication allergies",
};

const intakeQuestions = [
  {
    field: "warningSigns" as const,
    prompt:
      "Any trouble breathing, difficulty swallowing liquids, fainting, or severe chest pain?",
    placeholder: "Tell August about any warning signs…",
  },
  {
    field: "history" as const,
    prompt:
      "Any major health conditions, and what medicines are you taking now?",
    placeholder: "Add health history and medicines…",
  },
  {
    field: "allergies" as const,
    prompt:
      "Any medication allergies or previous reactions to antibiotics?",
    placeholder: "Add allergies or reactions…",
  },
] as const;

function Avatar({
  person,
  size = "regular",
}: {
  person: "august" | "maya";
  size?: "small" | "regular" | "large";
}) {
  if (person === "august") {
    return (
      <img
        alt="August AI care guide"
        className={`${styles.avatar} ${styles[`avatar-${size}`]}`}
        src="/august-avatar.png"
      />
    );
  }

  return (
    <img
      alt="Maya Rao, clinician"
      className={`${styles.avatar} ${styles[`avatar-${size}`]}`}
      src="/maya-clinician-avatar.png"
    />
  );
}

function StatusBar() {
  return (
    <div className={styles.statusBar} aria-hidden="true">
      <span>9:41</span>
      <div className={styles.statusIcons}>
        <Signal size={14} strokeWidth={2.4} />
        <Wifi size={15} strokeWidth={2.4} />
        <BatteryMedium size={19} strokeWidth={2.1} />
      </div>
    </div>
  );
}

function ConversationHeader({
  canGoBack,
  clinician,
  onBack,
  onDetails,
  subtitle,
}: {
  canGoBack: boolean;
  clinician: boolean;
  onBack: () => void;
  onDetails: (trigger: HTMLButtonElement) => void;
  subtitle: string;
}) {
  return (
    <header className={styles.conversationHeader}>
      {canGoBack ? (
        <button
          aria-label="Go to previous care step"
          className={styles.headerAction}
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
      ) : null}
      <Avatar person={clinician ? "maya" : "august"} />
      <div className={styles.headerCopy}>
        <strong>{clinician ? "Maya (Clinician)" : "August"}</strong>
        <span>{subtitle}</span>
      </div>
      <button
        aria-label="Open conversation details"
        className={styles.headerAction}
        onClick={(event) => onDetails(event.currentTarget)}
        type="button"
      >
        <Info aria-hidden="true" size={19} />
      </button>
    </header>
  );
}

function MessageItem({ message }: { message: Message }) {
  if (message.author === "system") {
    return (
      <div className={styles.systemMessage}>
        <CircleCheck aria-hidden="true" size={16} />
        <p>{message.content}</p>
      </div>
    );
  }

  if (message.author === "patient") {
    return (
      <div className={`${styles.messageRow} ${styles.patientRow}`}>
        <div className={styles.patientBubble}>
          <p>{message.content}</p>
          <span>
            {message.time ?? "Now"} <CheckCheck aria-hidden="true" size={13} />
          </span>
        </div>
      </div>
    );
  }

  const isMaya = message.author === "maya";
  return (
    <div className={styles.messageRow}>
      <Avatar person={isMaya ? "maya" : "august"} size="small" />
      <div className={isMaya ? styles.clinicianMessage : styles.augustMessage}>
        {isMaya ? (
          <div className={styles.messageMeta}>
            <span>
              <strong>Maya Rao</strong>
              <small>Human clinician</small>
            </span>
            <time>{message.time ?? "10:24"}</time>
          </div>
        ) : null}
        <p>{message.content}</p>
        {!isMaya ? <time>{message.time ?? "9:41"}</time> : null}
      </div>
    </div>
  );
}

function TypingIndicator({ person }: { person: "august" | "maya" }) {
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
  disabled,
  onSubmit,
  placeholder,
  recipient,
}: {
  disabled?: boolean;
  onSubmit: (value: string) => void;
  placeholder: string;
  recipient: "August" | "Maya";
}) {
  const [value, setValue] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = value.trim();
    if (!clean || disabled) return;
    onSubmit(clean);
    setValue("");
  }

  return (
    <div className={styles.composerRegion}>
      <form className={styles.composer} onSubmit={submit}>
        <Avatar person={recipient === "August" ? "august" : "maya"} size="small" />
        <input
          aria-label={`Message ${recipient}`}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <button
          aria-label="Send message"
          className={styles.sendButton}
          disabled={disabled || !value.trim()}
          type="submit"
        >
          <Send aria-hidden="true" size={18} />
        </button>
      </form>
      <span>
        <LockKeyhole aria-hidden="true" size={11} /> To {recipient}
      </span>
    </div>
  );
}

function PassiveFooter({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className={styles.passiveFooter} role="status">
      <Icon aria-hidden="true" size={16} />
      <span>{text}</span>
    </div>
  );
}

function ProductNavigation({ careAvailable, clinician, onSelect }: {
  careAvailable: boolean;
  clinician: boolean;
  onSelect: (conversation: "care" | "august") => void;
}) {
  return (
    <nav aria-label="Current care area" className={styles.bottomNav}>
      <button aria-current={clinician ? "page" : undefined} className={clinician ? styles.activeNav : undefined} disabled={!careAvailable} onClick={() => onSelect("care")} type="button">
        {careAvailable ? <Avatar person="maya" size="small" /> : <MessageCircle aria-hidden="true" size={18} />}
        <span><strong>Care</strong><small>{careAvailable ? "Maya" : "Not connected"}</small></span>
      </button>
      <button aria-current={!clinician ? "page" : undefined} className={!clinician ? styles.activeNav : undefined} onClick={() => onSelect("august")} type="button">
        <Avatar person="august" size="small" />
        <span><strong>August</strong><small>Private support</small></span>
      </button>
    </nav>
  );
}

function PrimaryAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className={styles.primaryAction} onClick={onClick} type="button">
      <span>{children}</span>
      <ArrowRight aria-hidden="true" size={17} />
    </button>
  );
}

function DetailRow({ icon: Icon, label, value, verified }: DetailRowData) {
  return (
    <div className={styles.detailRow}>
      <span className={verified ? styles.verifiedIcon : undefined} aria-hidden="true">
        <Icon size={16} strokeWidth={2} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SummaryCard({ answers, editField, editValue, onCancel, onChange, onEdit, onSave }: {
  answers: IntakeAnswers;
  editField: keyof IntakeAnswers | null;
  editValue: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onEdit: (field: keyof IntakeAnswers) => void;
  onSave: () => void;
}) {
  const rows = Object.entries(summaryLabels) as Array<[keyof IntakeAnswers, string]>;
  return (
    <section className={styles.summaryCard}>
      <header>
        <div>
          <small>VISIT SUMMARY</small>
          <h2>Confirm what August gathered.</h2>
        </div>
        <span><LockKeyhole aria-hidden="true" size={12} /> Private until confirmed</span>
      </header>
      {rows.map(([field, label]) => editField === field ? (
        <div className={styles.inlineSummaryEditor} key={field}>
          <label htmlFor={`summary-${field}`}>{label}</label>
          <textarea autoFocus id={`summary-${field}`} onChange={(event) => onChange(event.target.value)} rows={4} value={editValue} />
          <div>
            <button className={styles.inlineCancel} onClick={onCancel} type="button">Cancel</button>
            <button className={styles.inlineSave} disabled={!editValue.trim()} onClick={onSave} type="button">Save <Check aria-hidden="true" size={15} /></button>
          </div>
        </div>
      ) : (
        <button aria-label={`Edit ${label}`} className={styles.summaryRow} key={field} onClick={() => onEdit(field)} type="button">
          <span><small>{label}</small><strong>{answers[field]}</strong></span>
          <span className={styles.editLabel}>Edit <ChevronRight aria-hidden="true" size={14} /></span>
        </button>
      ))}
    </section>
  );
}

function StatusReceipt({ details, eyebrow, rows, title }: { details: string; eyebrow: string; rows: DetailRowData[]; title: string }) {
  return (
    <section className={styles.successPanel}>
      <div className={styles.successCheck} aria-hidden="true"><Check size={27} strokeWidth={2.3} /></div>
      <small>{eyebrow}</small>
      <h1>{title}</h1>
      <p>{details}</p>
      <div className={styles.successDetails}>
        {rows.map((row) => <DetailRow {...row} key={row.label} />)}
      </div>
    </section>
  );
}

function SuggestedReply({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <div className={styles.suggestedReplyRow}>
      <button onClick={onClick} type="button">
        <span>{children}</span>
        <ArrowRight aria-hidden="true" size={15} />
      </button>
    </div>
  );
}

function CompleteJourneyConversation({
  answers,
  encounter,
  editField,
  editValue,
  flow,
  onCancelEdit,
  onChangeEdit,
  onEdit,
  onMove,
  onSaveEdit,
  patientReplies,
  pending,
  state,
}: {
  answers: IntakeAnswers;
  encounter: ReturnType<typeof createPrototypeV2Encounter>;
  editField: keyof IntakeAnswers | null;
  editValue: string;
  flow: PrototypeV2Flow;
  onCancelEdit: () => void;
  onChangeEdit: (value: string) => void;
  onEdit: (field: keyof IntakeAnswers) => void;
  onMove: (flow: PrototypeV2Flow, state: PrototypeV2State) => void;
  onSaveEdit: () => void;
  patientReplies: Message[];
  pending: "august" | "maya" | null;
  state: PrototypeV2State;
}) {
  const opening: Message = { author: "august", content: "Hi Parth. Tell me what’s going on.", time: "9:40" };
  const fullIntake: Message[] = [
    opening,
    { author: "patient", content: answers.concern, time: "9:41" },
    { author: "august", content: "Got it. When did it start, is it getting better or worse, and what was your highest temperature?", time: "9:41" },
    { author: "patient", content: answers.onset, time: "9:43" },
    { author: "august", content: intakeQuestions[0].prompt, time: "9:43" },
    { author: "patient", content: answers.warningSigns, time: "9:44" },
    { author: "august", content: intakeQuestions[1].prompt, time: "9:45" },
    { author: "patient", content: answers.history, time: "9:46" },
    { author: "august", content: intakeQuestions[2].prompt, time: "9:47" },
    { author: "patient", content: answers.allergies, time: "9:49" },
  ];

  if (flow === "intake" && ["empty", "concern", "gathering"].includes(state)) {
    return null;
  }

  if (flow === "intake" && state === "reply") {
    return (
      <div className={styles.transcript}>
        <div className={styles.dateMarker}>Today · Care</div>
        <MessageItem message={{ author: "system", content: "August shared your confirmed summary with Maya. New messages here go directly to her." }} />
        <MessageItem message={{ author: "maya", content: "Hi Parth. I reviewed your fever, worsening throat pain, safety answers, history, and allergies.", time: "10:24" }} />
        <MessageItem message={{ author: "maya", content: "You’re breathing and drinking normally, which is reassuring. I’m ready to explain the next step.", time: "10:25" }} />
        <SuggestedReply onClick={() => onMove("lab", "recommended")}>What do you recommend?</SuggestedReply>
        {patientReplies.map((message, index) => <MessageItem key={`maya-first-reply-${index}`} message={message} />)}
      </div>
    );
  }

  if (flow === "intake") {
    return (
      <div className={styles.transcript}>
        <div className={styles.dateMarker}>Today</div>
        {fullIntake.map((message, index) => <MessageItem key={`complete-intake-${index}`} message={message} />)}
        <MessageItem message={{ author: "august", content: "That’s everything I need for now. I organized it below so you can check it before anything is shared.", time: "9:50" }} />
        {state === "summary" ? (
          <>
            <SummaryCard answers={answers} editField={editField} editValue={editValue} onCancel={onCancelEdit} onChange={onChangeEdit} onEdit={onEdit} onSave={onSaveEdit} />
            <SuggestedReply onClick={() => onMove("intake", "reviewing")}>Everything looks right</SuggestedReply>
          </>
        ) : null}
        {state === "reviewing" ? (
          <>
            <MessageItem message={{ author: "patient", content: "Everything looks right. You can share it.", time: "9:51" }} />
            <MessageItem message={{ author: "august", content: "I found Maya for this visit. She is licensed where you are, treats same-day throat concerns, and has the earliest appropriate response time. She will make the clinical decision.", time: "9:52" }} />
            <section className={styles.reviewingCard}>
              <Avatar person="maya" size="large" />
              <div><strong>Maya Rao</strong><span>Human clinician</span><p>{encounter.clinician.responseEstimate}</p></div>
              <i className={styles.reviewingPulse} aria-hidden="true" />
            </section>
            <SuggestedReply onClick={() => onMove("intake", "reply")}>Continue to Maya</SuggestedReply>
          </>
        ) : null}
        {pending ? <TypingIndicator person={pending} /> : null}
      </div>
    );
  }

  const mayaOpening: Message[] = [
    { author: "system", content: "August shared your confirmed summary with Maya. New messages here go directly to her." },
    { author: "maya", content: "Hi Parth. I reviewed your fever, worsening throat pain, safety answers, history, and allergies.", time: "10:24" },
    { author: "maya", content: "You’re breathing and drinking normally, which is reassuring. I’ll explain the next step here.", time: "10:25" },
  ];

  if (flow === "lab" && state === "recommended") {
    return (
      <div className={styles.transcript}>
        <div className={styles.dateMarker}>Today · Care</div>
        {mayaOpening.map((message, index) => <MessageItem key={`maya-lab-${index}`} message={message} />)}
        <MessageItem message={{ author: "patient", content: "What do you recommend?", time: "10:26" }} />
        <MessageItem message={{ author: "maya", content: "Before I decide on medication, I recommend a rapid strep test today. The result will tell me whether an antibiotic is appropriate. I placed the order, and August can help with the appointment.", time: "10:27" }} />
        <SuggestedReply onClick={() => onMove("lab", "nearby-lab")}>Ask August to arrange it</SuggestedReply>
        {patientReplies.map((message, index) => <MessageItem key={`lab-care-reply-${index}`} message={message} />)}
      </div>
    );
  }

  if (flow === "lab") {
    return (
      <div className={styles.transcript}>
        <div className={styles.dateMarker}>Today · August</div>
        <MessageItem message={{ author: "system", content: "Maya sent the rapid strep test order to August for scheduling." }} />
        <MessageItem message={{ author: "august", content: `${encounter.lab.location} can take Maya’s order ${encounter.lab.orderCode}. It is ${encounter.lab.distance} at ${encounter.lab.address}.\n\nThe appointment is ${encounter.lab.appointment.toLowerCase()}. Bring a photo ID and the order code.\n\nDoes this appointment work for you?`, time: "10:28" }} />
        {state === "nearby-lab" ? <SuggestedReply onClick={() => onMove("lab", "confirmed")}>Yes, that time works</SuggestedReply> : null}
        {state === "confirmed" ? (
          <>
            <MessageItem message={{ author: "patient", content: "Yes, that time works for me.", time: "10:29" }} />
            <MessageItem message={{ author: "august", content: `You’re confirmed for ${encounter.lab.appointment.toLowerCase()} at ${encounter.lab.location}. Bring a photo ID. Maya’s order is already attached, and I’ll return the result to her visit.`, time: "10:30" }} />
            <SuggestedReply onClick={() => onMove("prescription", "recommended")}>Open Maya’s result</SuggestedReply>
          </>
        ) : null}
        {patientReplies.map((message, index) => <MessageItem key={`lab-august-reply-${index}`} message={message} />)}
      </div>
    );
  }

  if (flow === "prescription" && ["recommended", "review"].includes(state)) {
    return (
      <div className={styles.transcript}>
        <div className={styles.dateMarker}>Later · Care</div>
        <MessageItem message={{ author: "system", content: "Your rapid strep result returned to Maya’s visit." }} />
        <MessageItem message={{ author: "maya", content: "Your rapid strep test is positive. That result explains your symptoms and means an antibiotic is appropriate. I also checked the medicines and allergies you shared. I recommend Penicillin V.", time: "2:14" }} />
        {state === "recommended" ? <SuggestedReply onClick={() => onMove("prescription", "review")}>Show me the medication plan</SuggestedReply> : null}
        {state === "review" ? (
          <>
            <MessageItem message={{ author: "patient", content: "Show me the medication plan.", time: "2:15" }} />
            <MessageItem message={{ author: "maya", content: `${encounter.prescription.medication}, ${encounter.prescription.strength}.\n\n${encounter.prescription.directions} for ${encounter.prescription.duration}. The prescription contains ${encounter.prescription.quantity}.\n\nI prescribed this after reviewing your test result and allergy history. August can help send it to a pharmacy.`, time: "2:16" }} />
            <SuggestedReply onClick={() => onMove("prescription", "pharmacy")}>Ask August to send it</SuggestedReply>
          </>
        ) : null}
        {patientReplies.map((message, index) => <MessageItem key={`rx-care-reply-${index}`} message={message} />)}
      </div>
    );
  }

  return (
    <div className={styles.transcript}>
      <div className={styles.dateMarker}>Today · August</div>
      <MessageItem message={{ author: "system", content: "Maya sent her signed prescription to August for pharmacy support." }} />
      <MessageItem message={{ author: "august", content: `${encounter.prescription.pharmacy} is ${encounter.prescription.pharmacyDistance}. It is at ${encounter.prescription.pharmacyAddress} and is ${encounter.prescription.pharmacyAvailability.toLowerCase()}. It accepts electronic prescriptions.\n\nShould I send Maya’s signed prescription there?`, time: "2:18" }} />
      {state === "pharmacy" ? <SuggestedReply onClick={() => onMove("prescription", "sent")}>Yes, send it there</SuggestedReply> : null}
      {state === "sent" ? (
        <>
          <MessageItem message={{ author: "patient", content: "Yes, send it there.", time: "2:19" }} />
          <MessageItem message={{ author: "august", content: `Done. I sent Maya’s prescription to ${encounter.prescription.pharmacy}. The pharmacy owns the next step, and I’ll post its confirmation in Care.`, time: "2:20" }} />
        </>
      ) : null}
      {patientReplies.map((message, index) => <MessageItem key={`rx-august-reply-${index}`} message={message} />)}
    </div>
  );
}

export function AugustV2Prototype({ completeJourney = false, initialFlow, initialState }: Props) {
  const [flow, setFlow] = useState(initialFlow);
  const [state, setState] = useState(initialState);
  const [answers, setAnswers] = useState({ ...defaultIntakeAnswers });
  const [gatheringStep, setGatheringStep] = useState(0);
  const [pending, setPending] = useState<"august" | "maya" | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editField, setEditField] = useState<keyof IntakeAnswers | null>(null);
  const [editValue, setEditValue] = useState("");
  const [patientReplies, setPatientReplies] = useState<Message[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const firstDialogActionRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const timers = useRef<number[]>([]);

  const encounter = useMemo(() => ({ ...createPrototypeV2Encounter(flow, state), answers }), [answers, flow, state]);
  const stateIndex = getPrototypeV2StateIndex(flow, state);
  const clinician =
    (flow === "intake" && ["reviewing", "reply"].includes(state)) ||
    (flow === "lab" && state === "recommended") ||
    (flow === "prescription" && ["recommended", "review"].includes(state));
  const modalOpen = detailsOpen;

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("state", completeJourney ? getCompleteJourneyId(flow, state) : state);
    window.history.replaceState({}, "", url);
    requestAnimationFrame(() => {
      const conversationalState =
        completeJourney ||
        (flow === "intake" && ["empty", "concern", "gathering", "reply"].includes(state));
      transcriptRef.current?.scrollTo({
        top:
          conversationalState || patientReplies.length
            ? transcriptRef.current.scrollHeight
            : 0,
        behavior: "smooth",
      });
    });
  }, [completeJourney, flow, gatheringStep, patientReplies, pending, state]);

  useEffect(() => {
    if (!modalOpen) return;
    firstDialogActionRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setDetailsOpen(false);
        setEditField(null);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button, textarea, input, [tabindex]:not([tabindex='-1'])")).filter((node) => !node.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      requestAnimationFrame(() => lastTriggerRef.current?.focus());
    };
  }, [modalOpen]);

  function changeState(next: PrototypeV2State) {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setPending(null);
    setState(next);
  }

  function moveTo(nextFlow: PrototypeV2Flow, nextState: PrototypeV2State) {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setPending(null);
    setFlow(nextFlow);
    setState(nextState);
  }

  function goBack() {
    if (completeJourney) {
      const current = getCompleteJourneyLocation(getCompleteJourneyId(flow, state));
      if (current.index > 0) {
        const previousId = completeJourneyStates[current.index - 1];
        const location = getCompleteJourneyLocation(previousId);
        moveTo(location.flow, location.state);
      }
      return;
    }
    const previous = getPreviousPrototypeV2State(flow, state);
    if (previous.flow !== flow) {
      window.location.assign(`/prototype-v2/${previous.flow}?state=${previous.state}`);
      return;
    }
    changeState(previous.state);
  }

  function switchConversation(target: "care" | "august") {
    if (!completeJourney || (target === "care") === clinician) return;
    if (target === "care") {
      if (flow === "lab") moveTo("lab", "recommended");
      else if (flow === "prescription") moveTo("prescription", "review");
      else if (["reviewing", "reply"].includes(state)) moveTo("intake", "reply");
      return;
    }
    if (flow === "lab") moveTo("lab", "nearby-lab");
    else if (flow === "prescription") moveTo("prescription", "pharmacy");
    else moveTo("intake", state === "reviewing" ? "summary" : "reviewing");
  }

  function replyThen(next: PrototypeV2State, person: "august" | "maya") {
    setPending(person);
    const timer = window.setTimeout(() => { setPending(null); changeState(next); }, person === "maya" ? 850 : 620);
    timers.current.push(timer);
  }

  function handleComposer(value: string) {
    if (completeJourney) {
      const normalized = value.toLowerCase();
      if (flow === "intake" && state === "summary" && /\b(yes|right|correct|share|looks good)\b/.test(normalized)) {
        moveTo("intake", "reviewing");
        return;
      }
      if (flow === "intake" && state === "reviewing" && /\b(yes|continue|maya|open)\b/.test(normalized)) {
        moveTo("intake", "reply");
        return;
      }
      if (flow === "lab" && state === "nearby-lab") {
        if (/\b(yes|works|confirm|okay|ok)\b/.test(normalized)) {
          moveTo("lab", "confirmed");
          return;
        }
        if (/\b(no|change|different|cannot|can't)\b/.test(normalized)) {
          setPatientReplies((current) => [
            ...current,
            { author: "patient", content: value, time: "Now" },
            { author: "august", content: "Of course. Tell me which day, time, or area works better and I’ll look again.", time: "Now" },
          ]);
          return;
        }
      }
      if (flow === "prescription" && state === "pharmacy") {
        if (/\b(yes|send|confirm|okay|ok)\b/.test(normalized)) {
          moveTo("prescription", "sent");
          return;
        }
        if (/\b(no|change|different)\b/.test(normalized)) {
          setPatientReplies((current) => [
            ...current,
            { author: "patient", content: value, time: "Now" },
            { author: "august", content: "No problem. Tell me the pharmacy name or neighborhood you prefer.", time: "Now" },
          ]);
          return;
        }
      }
    }
    if (flow !== "intake" || state === "reply") {
      setPatientReplies((current) => [...current, { author: "patient", content: value, time: "Now" }]);
      return;
    }
    if (state === "empty") {
      setAnswers((current) => ({ ...current, concern: value }));
      replyThen("concern", "august");
      return;
    }
    if (state === "concern") {
      setAnswers((current) => ({ ...current, onset: value }));
      setGatheringStep(0);
      replyThen("gathering", "august");
      return;
    }
    if (state === "gathering") {
      const question = intakeQuestions[gatheringStep];
      setAnswers((current) => ({ ...current, [question.field]: value }));
      if (gatheringStep < intakeQuestions.length - 1) {
        setPending("august");
        const timer = window.setTimeout(() => { setGatheringStep((current) => current + 1); setPending(null); }, 620);
        timers.current.push(timer);
      } else {
        replyThen("summary", "august");
      }
    }
  }

  function openSummaryEdit(field: keyof IntakeAnswers) {
    setEditValue(encounter.answers[field]);
    setEditField(field);
  }

  function saveSummaryEdit() {
    const clean = editValue.trim();
    if (editField && clean) setAnswers((current) => ({ ...current, [editField]: clean }));
    setEditField(null);
  }

  const messages = useMemo<Message[]>(() => {
    if (flow !== "intake") return [];
    const result: Message[] = [];
    const opening = "Hi Parth. Tell me what’s going on.";
    if (state === "empty") return [{ author: "august", content: opening, time: "9:40" }];
    result.push(
      { author: "august", content: opening, time: "9:40" },
      { author: "patient", content: answers.concern, time: "9:41" },
      { author: "august", content: "Got it. When did it start, is it getting better or worse, and what was your highest temperature?", time: "9:41" },
    );
    if (state === "concern") return result;
    result.push(
      { author: "patient", content: answers.onset, time: "9:43" },
      { author: "august", content: intakeQuestions[0].prompt, time: "9:43" },
    );
    if (state === "gathering") {
      for (let index = 0; index < gatheringStep; index += 1) {
        const question = intakeQuestions[index];
        result.push(
          { author: "patient", content: answers[question.field], time: `9:${44 + index * 2}` },
          { author: "august", content: intakeQuestions[index + 1].prompt, time: `9:${45 + index * 2}` },
        );
      }
    }
    return result;
  }, [answers, flow, gatheringStep, state]);

  const composerConfig = (() => {
    if (completeJourney) {
      const recipient = clinician ? "Maya" as const : "August" as const;
      const placeholder = state === "summary"
        ? "Reply or edit the summary…"
        : state === "nearby-lab"
          ? "Tell August if this time works…"
          : state === "pharmacy"
            ? "Tell August where to send it…"
            : `Message ${recipient}…`;
      return { kind: "composer" as const, disabled: false, placeholder, recipient };
    }
    if (state === "sent" || state === "confirmed") return { kind: "passive" as const, icon: Bell, text: "Updates will appear in Care" };
    if (flow === "intake" && state === "summary") return { kind: "passive" as const, icon: LockKeyhole, text: "Nothing is shared until you confirm" };
    if (flow === "intake" && state === "reviewing") return { kind: "passive" as const, icon: Clock3, text: "August is connecting you with Maya" };
    if (flow === "intake" && state === "empty") return { kind: "composer" as const, disabled: false, placeholder: "Tell August what’s going on…", recipient: "August" as const };
    if (flow === "intake" && state === "concern") return { kind: "composer" as const, disabled: false, placeholder: "Add timing, severity, and fever…", recipient: "August" as const };
    if (flow === "intake" && state === "gathering") return { kind: "composer" as const, disabled: Boolean(pending), placeholder: intakeQuestions[gatheringStep].placeholder, recipient: "August" as const };
    if (!clinician) return { kind: "composer" as const, disabled: false, placeholder: "Message August…", recipient: "August" as const };
    return { kind: "composer" as const, disabled: false, placeholder: "Message Maya…", recipient: "Maya" as const };
  })();

  const subtitle = clinician
    ? state === "reviewing"
      ? "Reviewing · usually replies in 2 to 4 hours"
      : "Usually replies in 2 to 4 hours"
    : "Care guide";

  const conversationDetails = flow === "lab" && !clinician
    ? {
        recipient: "August · Testing support",
        privacy: "Scheduling stays with August. Appointment updates return to Maya.",
        context: "Maya’s rapid strep order, location, timing, and preparation",
        status: "Maya’s order is attached to this visit",
      }
    : flow === "prescription" && !clinician
      ? {
          recipient: "August · Pharmacy support",
          privacy: "Fulfillment stays with August. Maya’s signed prescription remains attached.",
          context: "Medication instructions, signed prescription, and pharmacy destination",
          status: "The pharmacy owns the next update after sending",
        }
      : state === "reviewing"
        ? {
            recipient: "Maya Rao · Human clinician",
            privacy: "Maya sees only the visit summary you confirmed.",
            context: "Confirmed symptoms, safety answers, medicines, and allergies",
            status: encounter.clinician.responseEstimate,
          }
      : clinician
        ? {
            recipient: "Maya Rao · Human clinician",
            privacy: "Maya sees only the information you confirmed and messages sent to Care.",
            context: "Symptoms, safety answers, medicines, allergies, and clinical decisions",
            status: `Replied ${encounter.clinician.repliedAt.replace("Today · ", "at ")}`,
          }
        : {
              recipient: "August · Care guide",
              privacy: "This conversation stays private to August until you confirm sharing.",
              context: "Symptoms, safety answers, medicines, and allergies",
              status: "No information has been shared with a clinician",
            };

  return (
    <main className={styles.stage}>
      <div className={styles.deviceColumn}>
        <section className={styles.phone} aria-label="August care">
          <StatusBar />
          <ConversationHeader
            canGoBack={completeJourney ? getCompleteJourneyLocation(getCompleteJourneyId(flow, state)).index > 0 : flow !== "intake" || stateIndex > 0}
            clinician={clinician}
            onBack={goBack}
            onDetails={(trigger) => { lastTriggerRef.current = trigger; setDetailsOpen(true); }}
            subtitle={subtitle}
          />

          <div className={styles.screen} ref={transcriptRef}>
            {completeJourney ? (
              flow === "intake" && ["empty", "concern", "gathering"].includes(state) ? (
                <div className={styles.transcript}>
                  <div className={styles.dateMarker}>Today</div>
                  {messages.map((message, index) => <MessageItem key={`${message.author}-${index}-${message.content}`} message={message} />)}
                  {pending ? <TypingIndicator person={pending} /> : null}
                </div>
              ) : (
                <CompleteJourneyConversation
                  answers={answers}
                  editField={editField}
                  editValue={editValue}
                  encounter={encounter}
                  flow={flow}
                  onCancelEdit={() => setEditField(null)}
                  onChangeEdit={setEditValue}
                  onEdit={openSummaryEdit}
                  onMove={moveTo}
                  onSaveEdit={saveSummaryEdit}
                  patientReplies={patientReplies}
                  pending={pending}
                  state={state}
                />
              )
            ) : (
              <>
            {flow === "intake" && ["empty", "concern", "gathering"].includes(state) ? (
              <div className={styles.transcript}>
                <div className={styles.dateMarker}>Today</div>
                {messages.map((message, index) => <MessageItem key={`${message.author}-${index}-${message.content}`} message={message} />)}
                {pending ? <TypingIndicator person={pending} /> : null}
              </div>
            ) : null}

            {flow === "intake" && state === "summary" ? (
              <div className={styles.contentStack}>
                <MessageItem message={{ author: "august", content: "I’ve organized what you told me. Read it once, edit anything that is off, then choose whether to share it with a clinician.", time: "9:50" }} />
                <SummaryCard answers={answers} editField={editField} editValue={editValue} onCancel={() => setEditField(null)} onChange={setEditValue} onEdit={openSummaryEdit} onSave={saveSummaryEdit} />
                <PrimaryAction onClick={() => changeState("reviewing")}>Confirm and connect</PrimaryAction>
              </div>
            ) : null}

            {flow === "intake" && state === "reviewing" ? (
              <div className={`${styles.contentStack} ${styles.quietStack}`}>
                <div className={styles.handoffNotice}>
                  <CircleCheck aria-hidden="true" size={18} />
                  <span>Only your confirmed summary was shared with Maya.</span>
                </div>
                <MessageItem message={{ author: "august", content: "I found Maya for this visit. She is licensed where you are, treats same-day throat concerns, and has the earliest appropriate response time. She will make the clinical decision.", time: "9:52" }} />
                <section className={styles.reviewingCard}>
                  <Avatar person="maya" size="large" />
                  <div><strong>Maya Rao</strong><span>Human clinician</span><p>{encounter.clinician.responseEstimate}</p></div>
                  <i className={styles.reviewingPulse} aria-hidden="true" />
                </section>
                <PrimaryAction onClick={() => changeState("reply")}>Continue to Maya</PrimaryAction>
              </div>
            ) : null}

            {flow === "intake" && state === "reply" ? (
              <div className={styles.transcript}>
                <div className={styles.dateMarker}>Today · Care</div>
                <MessageItem message={{ author: "system", content: "Maya joined the conversation. New messages now go directly to her." }} />
                <MessageItem message={{ author: "system", content: `Your confirmed summary was shared with Maya at ${encounter.clinician.sharedAt.replace("Today · ", "")}` }} />
                <MessageItem message={{ author: "maya", content: "Hi Parth. I reviewed your fever, worsening throat pain, safety answers, history, and allergies.", time: "10:24" }} />
                <MessageItem message={{ author: "maya", content: "You’re breathing and drinking normally, which is reassuring. I’ll explain the recommended next step here.", time: "10:25" }} />
                <MessageItem message={{ author: "patient", content: "Thank you. I’m ready.", time: "10:26" }} />
                {patientReplies.map((message, index) => <MessageItem key={`reply-${index}`} message={message} />)}
                {completeJourney ? <PrimaryAction onClick={() => moveTo("lab", "recommended")}>Continue with Maya’s plan</PrimaryAction> : null}
              </div>
            ) : null}

            {flow === "prescription" && state === "recommended" ? (
              <div className={styles.contentStack}>
                {completeJourney ? <MessageItem message={{ author: "system", content: "Your test result was returned to Maya’s visit. Messages now go directly to Maya." }} /> : null}
                <MessageItem message={{ author: "maya", content: completeJourney
                  ? "Your rapid strep test is positive. That result explains your symptoms and means an antibiotic is appropriate. I also checked the medicines and allergies you shared. I recommend Penicillin V."
                  : "I reviewed your symptoms, safety answers, medicines, and allergy history. I recommend Penicillin V.", time: "10:24" }} />
                <PrimaryAction onClick={() => changeState("review")}>Read treatment plan</PrimaryAction>
              </div>
            ) : null}

            {flow === "prescription" && state === "review" ? (
              <div className={styles.contentStack}>
                <MessageItem message={{ author: "maya", content: `${encounter.prescription.medication}, ${encounter.prescription.strength}.\n\n${encounter.prescription.directions} for ${encounter.prescription.duration}. The prescription contains ${encounter.prescription.quantity}.\n\nI prescribed this after reviewing your test result and allergy history. August can help you send it to a pharmacy.`, time: "10:27" }} />
                <PrimaryAction onClick={() => changeState("pharmacy")}>Ask August to send it</PrimaryAction>
              </div>
            ) : null}

            {flow === "prescription" && state === "pharmacy" ? (
              <div className={styles.contentStack}>
                <MessageItem message={{ author: "system", content: "Maya handed the signed prescription to August for pharmacy support." }} />
                <MessageItem message={{ author: "august", content: `${encounter.prescription.pharmacy} is ${encounter.prescription.pharmacyDistance}.\n\nIt is at ${encounter.prescription.pharmacyAddress} and is ${encounter.prescription.pharmacyAvailability.toLowerCase()}. It accepts electronic prescriptions.\n\nShould I send Maya’s signed prescription there?`, time: "10:39" }} />
                <PrimaryAction onClick={() => changeState("sent")}>Confirm and send</PrimaryAction>
              </div>
            ) : null}

            {flow === "prescription" && state === "sent" ? (
              <StatusReceipt
                details="The pharmacy now owns fulfillment. We’ll show its confirmation here."
                eyebrow="SENT TO PHARMACY"
                rows={[
                  { icon: Building2, label: "Destination", value: encounter.prescription.pharmacy },
                  { icon: Clock3, label: "Sent", value: encounter.prescription.sentAt, verified: true },
                  { icon: UserRoundCheck, label: "Current owner", value: "Castro Community Pharmacy" },
                  { icon: Bell, label: "Next update", value: "Pharmacy confirmation in Care" },
                ]}
                title="Prescription sent"
              />
            ) : null}

            {flow === "lab" && state === "recommended" ? (
              <div className={styles.contentStack}>
                <MessageItem message={{ author: "maya", content: "Before I decide on medication, I recommend a rapid strep test today. The result will tell me whether an antibiotic is appropriate. I’ve placed the order. August can help with the appointment.", time: "10:24" }} />
                <PrimaryAction onClick={() => changeState("nearby-lab")}>Continue with August</PrimaryAction>
              </div>
            ) : null}

            {flow === "lab" && state === "nearby-lab" ? (
              <div className={styles.contentStack}>
                <MessageItem message={{ author: "system", content: "Maya sent the test order to your private August conversation." }} />
                <MessageItem message={{ author: "august", content: `${encounter.lab.location} can take Maya’s order ${encounter.lab.orderCode}. It is ${encounter.lab.distance} at ${encounter.lab.address}.\n\nThe appointment is ${encounter.lab.appointment.toLowerCase()}. Bring a photo ID and the order code.\n\nDoes this appointment work for you?`, time: "10:28" }} />
                <PrimaryAction onClick={() => changeState("confirmed")}>Yes, confirm appointment</PrimaryAction>
              </div>
            ) : null}

            {flow === "lab" && state === "confirmed" ? (
              <div className={styles.contentStack}>
              <StatusReceipt
                details="Your appointment and Maya’s order remain connected to this visit."
                eyebrow="APPOINTMENT SCHEDULED"
                rows={[
                  { icon: CalendarDays, label: "When", value: encounter.lab.appointment, verified: true },
                  { icon: MapPin, label: "Where", value: `${encounter.lab.location} · ${encounter.lab.address}` },
                  { icon: FileCheck2, label: "Bring", value: encounter.lab.preparation },
                  { icon: Bell, label: "Next update", value: "Lab updates return to Maya’s visit" },
                ]}
                title="Appointment confirmed"
              />
              {completeJourney ? <PrimaryAction onClick={() => moveTo("prescription", "recommended")}>See Maya’s result and plan</PrimaryAction> : null}
              </div>
            ) : null}

            {flow !== "intake" && patientReplies.length ? (
              <div className={styles.threadContinuation}>
                <div className={styles.dateMarker}>Your reply</div>
                {patientReplies.map((message, index) => <MessageItem key={`decision-reply-${index}`} message={message} />)}
              </div>
            ) : null}
              </>
            )}
          </div>

          {composerConfig.kind === "composer" ? (
            <Composer disabled={composerConfig.disabled || Boolean(pending)} onSubmit={handleComposer} placeholder={composerConfig.placeholder} recipient={composerConfig.recipient} />
          ) : (
            <PassiveFooter icon={composerConfig.icon} text={composerConfig.text} />
          )}
          <ProductNavigation
            careAvailable={!completeJourney || getCompleteJourneyLocation(getCompleteJourneyId(flow, state)).index >= 5}
            clinician={clinician}
            onSelect={switchConversation}
          />
        </section>
      </div>

      {detailsOpen ? (
        <div className={styles.sheetBackdrop} onMouseDown={() => setDetailsOpen(false)} role="presentation">
          <section aria-label="Conversation details" aria-modal="true" className={styles.detailsSheet} onMouseDown={(event) => event.stopPropagation()} ref={dialogRef} role="dialog">
            <div className={styles.sheetHandle} />
            <header>
              <div><small>CARE CONTEXT</small><strong>Conversation details</strong></div>
              <button aria-label="Close conversation details" onClick={() => setDetailsOpen(false)} ref={firstDialogActionRef} type="button"><X aria-hidden="true" size={20} /></button>
            </header>
            <div className={styles.sheetIntro}>
              <Avatar person={clinician ? "maya" : "august"} size="large" />
              <div><strong>{clinician ? "Maya Rao" : "August"}</strong><span>{subtitle}</span></div>
            </div>
            <div className={styles.sheetRows}>
              <DetailRow icon={MessageCircle} label="Current recipient" value={conversationDetails.recipient} />
              <DetailRow icon={LockKeyhole} label="Privacy and sharing" value={conversationDetails.privacy} verified />
              <DetailRow icon={ClipboardCheck} label="Care context" value={conversationDetails.context} />
              <DetailRow icon={Clock3} label="Current status" value={conversationDetails.status} />
            </div>
          </section>
        </div>
      ) : null}

    </main>
  );
}

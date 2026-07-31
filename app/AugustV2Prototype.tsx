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
  FileText,
  History,
  Info,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Pill,
  Route,
  Send,
  ShieldCheck,
  Signal,
  Sparkles,
  Stethoscope,
  UserRoundCheck,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import styles from "./AugustV2Prototype.module.css";
import {
  createPrototypeV2Encounter,
  defaultIntakeAnswers,
  getPreviousPrototypeV2State,
  getPrototypeV2StateIndex,
  IntakeAnswers,
  PrototypeV2Flow,
  PrototypeV2State,
} from "./prototypeV2Machine";

type Props = {
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
  return (
    <img
      alt={person === "august" ? "August AI care guide" : "Maya Rao, clinician"}
      className={`${styles.avatar} ${styles[`avatar-${size}`]}`}
      src={
        person === "august"
          ? "/august-avatar.png"
          : "/maya-clinician-avatar.png"
      }
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
        <strong>{clinician ? "Maya Rao" : "August"}</strong>
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

function ProductNavigation({ clinician }: { clinician: boolean }) {
  return (
    <nav aria-label="Current care area" className={styles.bottomNav}>
      <span>
        <History aria-hidden="true" size={20} />
        <span className={styles.visuallyHidden}>History</span>
      </span>
      <span aria-current={clinician ? "page" : undefined} className={clinician ? styles.activeNav : undefined}>
        <MessageCircle aria-hidden="true" size={18} />
        Care
      </span>
      <span aria-current={!clinician ? "page" : undefined} className={!clinician ? styles.activeNav : undefined}>
        <Avatar person="august" size="small" />
        August
      </span>
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

function DetailCard({ children, eyebrow, title }: { children: ReactNode; eyebrow?: string; title: string }) {
  return (
    <section className={styles.detailCard}>
      {eyebrow ? <small>{eyebrow}</small> : null}
      <h2>{title}</h2>
      <div className={styles.detailRows}>{children}</div>
    </section>
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

function SummaryCard({ answers, onEdit }: { answers: IntakeAnswers; onEdit: (field: keyof IntakeAnswers, trigger: HTMLButtonElement) => void }) {
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
      {rows.map(([field, label]) => (
        <button
          aria-label={`Edit ${label}`}
          className={styles.summaryRow}
          key={field}
          onClick={(event) => onEdit(field, event.currentTarget)}
          type="button"
        >
          <span>
            <small>{label}</small>
            <strong>{answers[field]}</strong>
          </span>
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

export function AugustV2Prototype({ initialFlow, initialState }: Props) {
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

  const encounter = useMemo(() => ({ ...createPrototypeV2Encounter(initialFlow, state), answers }), [answers, initialFlow, state]);
  const stateIndex = getPrototypeV2StateIndex(initialFlow, state);
  const clinician = initialFlow !== "intake" || state === "reviewing" || state === "reply";
  const modalOpen = detailsOpen || editField !== null;

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("state", state);
    window.history.replaceState({}, "", url);
    requestAnimationFrame(() => {
      const conversationalState =
        initialFlow === "intake" &&
        ["empty", "concern", "gathering", "reply"].includes(state);
      transcriptRef.current?.scrollTo({
        top:
          conversationalState || patientReplies.length
            ? transcriptRef.current.scrollHeight
            : 0,
        behavior: "smooth",
      });
    });
  }, [gatheringStep, initialFlow, patientReplies, pending, state]);

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

  function goBack() {
    const previous = getPreviousPrototypeV2State(initialFlow, state);
    if (previous.flow !== initialFlow) {
      window.location.assign(`/prototype-v2/${previous.flow}?state=${previous.state}`);
      return;
    }
    changeState(previous.state);
  }

  function replyThen(next: PrototypeV2State, person: "august" | "maya") {
    setPending(person);
    const timer = window.setTimeout(() => { setPending(null); changeState(next); }, person === "maya" ? 850 : 620);
    timers.current.push(timer);
  }

  function handleComposer(value: string) {
    if (initialFlow !== "intake" || state === "reply") {
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

  function openSummaryEdit(field: keyof IntakeAnswers, trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger;
    setEditValue(encounter.answers[field]);
    setEditField(field);
  }

  function saveSummaryEdit() {
    const clean = editValue.trim();
    if (editField && clean) setAnswers((current) => ({ ...current, [editField]: clean }));
    setEditField(null);
  }

  const messages = useMemo<Message[]>(() => {
    if (initialFlow !== "intake") return [];
    const result: Message[] = [];
    const opening = "Hi Parth—tell me what’s going on. I’ll ask about timing, urgent warning signs, medicines, and allergies before a clinician reviews anything.";
    if (state === "empty") return [{ author: "august", content: opening, time: "9:40" }];
    result.push(
      { author: "august", content: opening, time: "9:40" },
      { author: "patient", content: answers.concern, time: "9:41" },
      { author: "august", content: "When did it start, is it getting better or worse, and what was your highest temperature?", time: "9:41" },
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
  }, [answers, gatheringStep, initialFlow, state]);

  const composerConfig = (() => {
    if (state === "sent" || state === "confirmed") return { kind: "passive" as const, icon: Bell, text: "Updates will appear in Care" };
    if (initialFlow === "intake" && state === "summary") return { kind: "passive" as const, icon: LockKeyhole, text: "Nothing is shared until you confirm" };
    if (initialFlow === "intake" && state === "reviewing") return { kind: "passive" as const, icon: Clock3, text: "Maya is reviewing your confirmed summary" };
    if (initialFlow === "intake" && state === "empty") return { kind: "composer" as const, disabled: false, placeholder: "Tell August what’s going on…", recipient: "August" as const };
    if (initialFlow === "intake" && state === "concern") return { kind: "composer" as const, disabled: false, placeholder: "Add timing, severity, and fever…", recipient: "August" as const };
    if (initialFlow === "intake" && state === "gathering") return { kind: "composer" as const, disabled: Boolean(pending), placeholder: intakeQuestions[gatheringStep].placeholder, recipient: "August" as const };
    return { kind: "composer" as const, disabled: false, placeholder: "Message Maya…", recipient: "Maya" as const };
  })();

  const subtitle = initialFlow === "prescription"
    ? "Human clinician · prescription plan"
    : initialFlow === "lab"
      ? "Human clinician · testing plan"
      : state === "reviewing"
        ? "Reviewing · usually replies in 2–4 hours"
        : state === "reply"
          ? "Human clinician · replied 1 minute ago"
          : "AI care guide · private conversation";

  return (
    <main className={styles.stage}>
      <div className={styles.deviceColumn}>
        <section className={styles.phone} aria-label="August care">
          <StatusBar />
          <ConversationHeader
            canGoBack={initialFlow !== "intake" || stateIndex > 0}
            clinician={clinician}
            onBack={goBack}
            onDetails={(trigger) => { lastTriggerRef.current = trigger; setDetailsOpen(true); }}
            subtitle={subtitle}
          />

          <div className={styles.screen} ref={transcriptRef}>
            {initialFlow === "intake" && ["empty", "concern", "gathering"].includes(state) ? (
              <div className={styles.transcript}>
                <div className={styles.dateMarker}>Today</div>
                {messages.map((message, index) => <MessageItem key={`${message.author}-${index}-${message.content}`} message={message} />)}
                {pending ? <TypingIndicator person={pending} /> : null}
              </div>
            ) : null}

            {initialFlow === "intake" && state === "summary" ? (
              <div className={styles.contentStack}>
                <div className={styles.screenIntro}>
                  <small>BEFORE ANYTHING IS SHARED</small>
                  <h1>Review your information.</h1>
                  <p>August organized the conversation. Correct anything before Maya receives it.</p>
                </div>
                <SummaryCard answers={answers} onEdit={openSummaryEdit} />
                <PrimaryAction onClick={() => changeState("reviewing")}>Confirm and connect</PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "intake" && state === "reviewing" ? (
              <div className={`${styles.contentStack} ${styles.quietStack}`}>
                <div className={styles.handoffNotice}>
                  <CircleCheck aria-hidden="true" size={18} />
                  <span>August shared only the information you confirmed.</span>
                </div>
                <div className={styles.screenIntro}>
                  <small>CARE CONNECTED</small>
                  <h1>Maya is reviewing your visit.</h1>
                  <p>You can leave this conversation. We’ll let you know when she replies.</p>
                </div>
                <section className={styles.reviewingCard}>
                  <Avatar person="maya" size="large" />
                  <div><strong>Maya Rao</strong><span>Human clinician</span><p>{encounter.clinician.responseEstimate}</p></div>
                  <i className={styles.reviewingPulse} aria-hidden="true" />
                </section>
                <DetailCard title="While Maya reviews">
                  <DetailRow icon={FileCheck2} label="Shared" value="Only your confirmed visit summary" verified />
                  <DetailRow icon={Clock3} label="Status" value="You can leave and return to Care" />
                  <DetailRow icon={Sparkles} label="August" value="Still available privately while you wait" />
                </DetailCard>
                <PrimaryAction onClick={() => changeState("reply")}>Open Care conversation</PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "intake" && state === "reply" ? (
              <div className={styles.transcript}>
                <div className={styles.dateMarker}>Today · Care</div>
                <MessageItem message={{ author: "system", content: `Your confirmed summary was shared with Maya at ${encounter.clinician.sharedAt.replace("Today · ", "")}` }} />
                <MessageItem message={{ author: "maya", content: "Hi Parth—I reviewed your fever, worsening throat pain, safety answers, history, and allergies.", time: "10:24" }} />
                <MessageItem message={{ author: "maya", content: "You’re breathing and drinking normally, which is reassuring. I’ll explain the recommended next step here.", time: "10:25" }} />
                <MessageItem message={{ author: "patient", content: "Thank you. I’m ready.", time: "10:26" }} />
                {patientReplies.map((message, index) => <MessageItem key={`reply-${index}`} message={message} />)}
              </div>
            ) : null}

            {initialFlow === "prescription" && state === "recommended" ? (
              <div className={styles.contentStack}>
                <MessageItem message={{ author: "maya", content: "Based on your symptoms, safety answers, history, and allergy review, I recommend Penicillin V.", time: "10:24" }} />
                <div className={styles.screenIntro}>
                  <small>CLINICIAN DECISION</small><h1>Maya recommends a prescription.</h1><p>The clinical decision and allergy review are signed by Maya.</p>
                </div>
                <DetailCard title="Prescription recommendation">
                  <DetailRow icon={Pill} label="Medication" value={`${encounter.prescription.medication} · ${encounter.prescription.strength}`} />
                  <DetailRow icon={Stethoscope} label="Decision author" value={`${encounter.prescription.prescriber} · Human clinician`} />
                  <DetailRow icon={ShieldCheck} label="Allergy review" value="Reviewed and confirmed by Maya" verified />
                </DetailCard>
                <PrimaryAction onClick={() => changeState("review")}>Review prescription</PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "prescription" && state === "review" ? (
              <div className={styles.contentStack}>
                <div className={styles.screenIntro}>
                  <small>PRESCRIPTION REVIEW</small><h1>Confirm the medication details.</h1><p>Review what Maya prescribed before choosing where it is sent.</p>
                </div>
                <DetailCard eyebrow="SIGNED BY MAYA RAO" title={`${encounter.prescription.medication} · ${encounter.prescription.strength}`}>
                  <DetailRow icon={Pill} label="Directions" value={encounter.prescription.directions} />
                  <DetailRow icon={CalendarDays} label="Course" value={`${encounter.prescription.duration} · ${encounter.prescription.quantity}`} />
                  <DetailRow icon={UserRoundCheck} label="Prescriber" value={`${encounter.prescription.prescriber} · Human clinician`} verified />
                  <DetailRow icon={ShieldCheck} label="Safety check" value="Allergy history reviewed" verified />
                </DetailCard>
                <PrimaryAction onClick={() => changeState("pharmacy")}>Continue to pharmacy</PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "prescription" && state === "pharmacy" ? (
              <div className={styles.contentStack}>
                <div className={styles.screenIntro}>
                  <small>FULFILLMENT</small><h1>Confirm where to send it.</h1><p>The signed prescription leaves August only after you confirm.</p>
                </div>
                <DetailCard eyebrow="SELECTED PHARMACY" title={encounter.prescription.pharmacy}>
                  <DetailRow icon={MapPin} label="Location" value={encounter.prescription.pharmacyAddress} />
                  <DetailRow icon={Route} label="Distance" value={encounter.prescription.pharmacyDistance} />
                  <DetailRow icon={Clock3} label="Availability" value={encounter.prescription.pharmacyAvailability} />
                  <DetailRow icon={FileCheck2} label="Submission status" value={encounter.prescription.electronicStatus} verified />
                </DetailCard>
                <section className={styles.confirmationStrip}><CircleCheck aria-hidden="true" size={19} /><p><strong>Ready to submit</strong><span>Maya’s signed prescription will be sent to this pharmacy.</span></p></section>
                <PrimaryAction onClick={() => changeState("sent")}>Confirm and send</PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "prescription" && state === "sent" ? (
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

            {initialFlow === "lab" && state === "recommended" ? (
              <div className={styles.contentStack}>
                <MessageItem message={{ author: "maya", content: "Before deciding on medication, I recommend a rapid strep test today. The result will guide the next step.", time: "10:24" }} />
                <div className={styles.screenIntro}>
                  <small>CLINICIAN DECISION</small><h1>Maya recommends a strep test.</h1><p>Testing comes before the medication decision.</p>
                </div>
                <DetailCard title="Testing recommendation">
                  <DetailRow icon={FileText} label="Test" value={encounter.lab.test} />
                  <DetailRow icon={Stethoscope} label="Clinical reason" value={encounter.lab.reason} />
                  <DetailRow icon={UserRoundCheck} label="Decision author" value="Maya Rao · Human clinician" verified />
                </DetailCard>
                <PrimaryAction onClick={() => changeState("nearby-lab")}>View appointment</PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "lab" && state === "nearby-lab" ? (
              <div className={styles.contentStack}>
                <div className={styles.screenIntro}>
                  <small>APPOINTMENT READY</small><h1>August arranged a nearby lab.</h1><p>Maya’s order is attached. Confirm the time and location below.</p>
                </div>
                <DetailCard eyebrow="RECOMMENDED · AUGUST ARRANGED" title={encounter.lab.location}>
                  <DetailRow icon={FileText} label="Test and order" value={`${encounter.lab.test} · ${encounter.lab.orderCode}`} verified />
                  <DetailRow icon={MapPin} label="Location" value={`${encounter.lab.address} · ${encounter.lab.distance}`} />
                  <DetailRow icon={CalendarDays} label="Appointment" value={encounter.lab.appointment} />
                  <DetailRow icon={FileCheck2} label="Bring" value={encounter.lab.preparation} />
                </DetailCard>
                <section className={styles.confirmationStrip}><CircleCheck aria-hidden="true" size={19} /><p><strong>Everything is ready</strong><span>The clinician order and appointment details stay attached to this visit.</span></p></section>
                <PrimaryAction onClick={() => changeState("confirmed")}>Confirm appointment</PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "lab" && state === "confirmed" ? (
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
            ) : null}

            {initialFlow !== "intake" && patientReplies.length ? (
              <div className={styles.threadContinuation}>
                <div className={styles.dateMarker}>Your reply</div>
                {patientReplies.map((message, index) => <MessageItem key={`decision-reply-${index}`} message={message} />)}
              </div>
            ) : null}
          </div>

          {composerConfig.kind === "composer" ? (
            <Composer disabled={composerConfig.disabled || Boolean(pending)} onSubmit={handleComposer} placeholder={composerConfig.placeholder} recipient={composerConfig.recipient} />
          ) : (
            <PassiveFooter icon={composerConfig.icon} text={composerConfig.text} />
          )}
          <ProductNavigation clinician={clinician} />
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
              <DetailRow icon={MessageCircle} label="Current recipient" value={clinician ? "Maya Rao · Human clinician" : "August · AI care guide"} />
              <DetailRow icon={LockKeyhole} label="Privacy" value={clinician ? "Maya sees only the summary you confirmed" : "Private to August until you confirm sharing"} verified />
              <DetailRow icon={ClipboardCheck} label="Care context" value="Symptoms, safety answers, medicines, and allergies" />
              {clinician ? <DetailRow icon={Clock3} label="Clinician status" value={state === "reviewing" ? encounter.clinician.responseEstimate : `Replied ${encounter.clinician.repliedAt.replace("Today · ", "at ")}`} /> : null}
            </div>
          </section>
        </div>
      ) : null}

      {editField ? (
        <div className={styles.sheetBackdrop} onMouseDown={() => setEditField(null)} role="presentation">
          <section aria-labelledby="edit-summary-title" aria-modal="true" className={`${styles.detailsSheet} ${styles.editSheet}`} onMouseDown={(event) => event.stopPropagation()} ref={dialogRef} role="dialog">
            <div className={styles.sheetHandle} />
            <header>
              <div><small>EDIT VISIT SUMMARY</small><strong id="edit-summary-title">{summaryLabels[editField]}</strong></div>
              <button aria-label="Close summary editor" onClick={() => setEditField(null)} ref={firstDialogActionRef} type="button"><X aria-hidden="true" size={20} /></button>
            </header>
            <label htmlFor="summary-edit-value">Update what Maya should receive</label>
            <textarea id="summary-edit-value" onChange={(event) => setEditValue(event.target.value)} rows={5} value={editValue} />
            <div className={styles.editActions}>
              <button className={styles.secondaryAction} onClick={() => setEditField(null)} type="button">Cancel</button>
              <button className={styles.primaryAction} disabled={!editValue.trim()} onClick={saveSummaryEdit} type="button"><span>Save change</span><Check aria-hidden="true" size={17} /></button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

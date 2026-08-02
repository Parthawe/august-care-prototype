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
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  ImagePlus,
  House,
  HeartPulse,
  LayoutGrid,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Menu,
  Mic,
  Moon,
  MoreVertical,
  Plus,
  Search,
  Send,
  Sparkles,
  UserRoundCheck,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import styles from "./AugustV2Prototype.module.css";
import {
  createPrototypeV2Encounter,
  defaultIntakeAnswers,
  getCompleteJourneyId,
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
  imageName?: string;
  imageUrl?: string;
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
      "That helps. The timing, change in symptoms, and fever tell me this needs a careful safety check.\n\nAre you having trouble breathing, unable to swallow liquids, feeling faint, or having severe chest pain?",
    placeholder: "Tell August about any warning signs…",
  },
  {
    field: "history" as const,
    prompt:
      "That’s reassuring. Being able to breathe and drink normally makes an emergency problem less likely.\n\nDo you have any major health conditions, and what medicines are you taking now?",
    placeholder: "Add health history and medicines…",
  },
  {
    field: "allergies" as const,
    prompt:
      "Got it. I’ve noted your health history and current medicines.\n\nDo you have any medication allergies or previous reactions to antibiotics?",
    placeholder: "Add allergies or reactions…",
  },
] as const;

const firstIntakeReply =
  "Of course. I can help you work through what’s going on and what the next best step might be.\n\nA sore throat with a fever is often caused by an infection, but I want to check a few details before saying how concerning it is.\n\nWhen did it start, is it getting better or worse, and what was your highest temperature?";

const intakeReadyForReview =
  "Thanks. I’ve got the main details: how long this has been going on, how it is changing, your fever, urgent warning signs, health history, medicines, and allergies.\n\nBased on what you shared, a same-day clinician review is the safest next step. I’ve organized everything below so you can check it before anything is shared.";

const clinicianHandoffMessage =
  "Based on your worsening throat pain and fever, this should be reviewed today. I found Maya Rao because she is a licensed California clinician who handles same-day throat concerns.\n\nI’ll share the summary you confirmed so you do not have to start over.";

const labRecommendationMessage =
  "Before I decide on medication, I recommend a rapid strep test today. The result will tell me whether an antibiotic is appropriate. I placed the order, and August can help with the appointment.";

const AUGUST_THINKING_DELAY = 3_800;

function getAugustIntakeHistory(answers: IntakeAnswers): Message[] {
  return [
    { author: "patient", content: answers.concern, time: "9:41" },
    { author: "august", content: firstIntakeReply, time: "9:41" },
    { author: "patient", content: answers.onset, time: "9:43" },
    { author: "august", content: intakeQuestions[0].prompt, time: "9:43" },
    { author: "patient", content: answers.warningSigns, time: "9:44" },
    { author: "august", content: intakeQuestions[1].prompt, time: "9:45" },
    { author: "patient", content: answers.history, time: "9:46" },
    { author: "august", content: intakeQuestions[2].prompt, time: "9:47" },
    { author: "patient", content: answers.allergies, time: "9:49" },
  ];
}

function AugustPreviousConversation({ answers }: { answers: IntakeAnswers }) {
  return (
    <>
      <div className={styles.dateMarker}>Earlier · August</div>
      {getAugustIntakeHistory(answers).map((message, index) => (
        <MessageItem animate={false} key={`august-history-${index}`} message={message} />
      ))}
      <MessageItem
        animate={false}
        message={{
          author: "system",
          content: "You confirmed the visit summary, and August shared it with Maya.",
        }}
      />
    </>
  );
}

function Avatar({
  person,
  size = "regular",
}: {
  person: "august" | "maya";
  size?: "small" | "regular" | "large";
}) {
  if (person === "august") {
    return <AugustIdentityMark size={size} />;
  }

  return (
    <img
      alt="Maya Rao, clinician"
      className={`${styles.avatar} ${styles[`avatar-${size}`]}`}
      src="/maya-clinician-avatar.png"
    />
  );
}

function AugustIdentityMark({ size = "regular" }: { size?: "small" | "regular" | "large" }) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.augustIdentityMark} ${styles[`augustIdentityMark-${size}`]}`}
      data-august-mark="true"
    >
      a
    </span>
  );
}

function ConversationHeader({
  clinician,
  onBack,
  onDetails,
  onSearch,
  subtitle,
}: {
  clinician: boolean;
  onBack: () => void;
  onDetails: (trigger: HTMLButtonElement) => void;
  onSearch: () => void;
  subtitle: string;
}) {
  return (
    <header className={styles.conversationHeader}>
      <button
        aria-label="Back to Chats"
        className={styles.headerAction}
        onClick={onBack}
        type="button"
      >
        <ArrowLeft aria-hidden="true" size={20} />
      </button>
      <Avatar person={clinician ? "maya" : "august"} />
      <div className={styles.headerCopy}>
        <strong>{clinician ? "Maya (Clinician)" : "August"}</strong>
        <span>{subtitle}</span>
      </div>
      <div className={styles.headerActions}>
        <button aria-label="Search conversation" className={styles.headerAction} onClick={onSearch} type="button">
          <Search aria-hidden="true" size={19} />
        </button>
        <button
          aria-label="Open conversation details"
          className={styles.headerAction}
          onClick={(event) => onDetails(event.currentTarget)}
          type="button"
        >
          <MoreVertical aria-hidden="true" size={20} />
        </button>
      </div>
    </header>
  );
}

function StreamingText({ text }: { text: string }) {
  const chunks = useMemo(() => text.match(/\S+\s*/g) ?? [text], [text]);
  const [reducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visibleCount, setVisibleCount] = useState(reducedMotion ? chunks.length : 1);
  const [complete, setComplete] = useState(reducedMotion || chunks.length <= 1);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion || chunks.length <= 1) return;
    const screen = textRef.current?.closest<HTMLElement>("[data-conversation-screen='true']");
    const shouldFollow = screen
      ? screen.scrollHeight - screen.scrollTop - screen.clientHeight < 120
      : false;
    const timer = window.setInterval(() => {
      setVisibleCount((current) => {
        const next = Math.min(current + 1, chunks.length);
        if (next === chunks.length) {
          window.clearInterval(timer);
          setComplete(true);
        }
        return next;
      });
      if (screen && shouldFollow) requestAnimationFrame(() => screen.scrollTo({ top: screen.scrollHeight, behavior: "auto" }));
    }, 42);

    return () => window.clearInterval(timer);
  }, [chunks, reducedMotion]);

  return (
    <>
      <span className={styles.visuallyHidden}>{text}</span>
      <span aria-hidden="true" ref={textRef}>
        {chunks.slice(0, visibleCount).join("")}
        {!complete ? <i className={styles.streamingCaret} /> : null}
      </span>
    </>
  );
}

function MessageItem({ animate = true, message, stream = false }: { animate?: boolean; message: Message; stream?: boolean }) {
  if (message.author === "system") {
    return (
      <div className={`${styles.systemMessage} ${animate ? "" : styles.messageStatic}`} data-message-motion={animate ? "enter" : "settled"}>
        <CircleCheck aria-hidden="true" size={16} />
        <p>{message.content}</p>
      </div>
    );
  }

  if (message.author === "patient") {
    return (
      <div className={`${styles.messageRow} ${styles.patientRow} ${animate ? "" : styles.messageStatic}`} data-message-motion={animate ? "enter" : "settled"}>
        <div className={styles.patientBubble}>
          {message.imageUrl ? <img alt={message.imageName ?? "Patient attachment"} className={styles.messageImage} src={message.imageUrl} /> : null}
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
    <div className={`${styles.messageRow} ${animate ? "" : styles.messageStatic}`} data-message-motion={animate ? "enter" : "settled"}>
      <Avatar person={isMaya ? "maya" : "august"} size="small" />
      <div className={isMaya ? styles.clinicianMessage : styles.augustMessage}>
        <p>{stream && !isMaya ? <StreamingText text={message.content} /> : message.content}</p>
        <time>{message.time ?? (isMaya ? "10:24" : "9:41")}</time>
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

function AugustThinkingIndicator() {
  return (
    <div aria-label="August is thinking" className={styles.thinkingRow} role="status">
      <Avatar person="august" size="small" />
      <div className={styles.thinkingSurface}>
        <Sparkles aria-hidden="true" size={14} />
        <span>August is thinking</span>
        <span aria-hidden="true" className={styles.thinkingDots}><i /><i /><i /></span>
      </div>
    </div>
  );
}

function ResponseProgress({
  person,
}: {
  mode?: "clinical" | "coordination" | "scheduling";
  person: "august" | "maya";
}) {
  return person === "august"
    ? <AugustThinkingIndicator />
    : <TypingIndicator person="maya" />;
}

function Composer({
  disabled,
  initialValue = "",
  onAttach,
  onSubmit,
  placeholder,
  recipient,
}: {
  disabled?: boolean;
  initialValue?: string;
  onAttach: (file: File) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  recipient: "August" | "Maya";
}) {
  const [value, setValue] = useState(initialValue);
  const [recording, setRecording] = useState(false);

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
        <div className={styles.composerPrompt}>
          <input
            aria-label={`Message ${recipient}`}
            disabled={disabled}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            value={value}
          />
        </div>
        <div className={styles.composerTools}>
          <label className={styles.attachmentButton}>
            <span className={styles.visuallyHidden}>Add an image</span>
            <Plus aria-hidden="true" size={20} />
            <input
              accept="image/*"
              disabled={disabled}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onAttach(file);
                event.target.value = "";
              }}
              type="file"
            />
          </label>
          <label className={styles.attachmentButton}>
            <span className={styles.visuallyHidden}>Take a photo</span>
            <ImagePlus aria-hidden="true" size={18} />
            <input
              accept="image/*"
              capture="environment"
              disabled={disabled}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onAttach(file);
                event.target.value = "";
              }}
              type="file"
            />
          </label>
          <button
            aria-label={recording ? "Stop audio recording" : "Record an audio message"}
            aria-pressed={recording}
            className={`${styles.attachmentButton} ${recording ? styles.recordingButton : ""}`}
            disabled={disabled}
            onClick={() => setRecording((current) => !current)}
            type="button"
          >
            <Mic aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="Send message"
            className={styles.sendButton}
            disabled={disabled || !value.trim()}
            type="submit"
          >
            <Send aria-hidden="true" size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

function EncryptionNotice({ recipient = "August" }: { recipient?: "August" | "Maya" }) {
  const description = recipient === "Maya"
    ? "Only you and Maya can read messages and attachments here. Maya can see the visit summary you confirmed."
    : "Only you and August can read messages and attachments. Nothing is shared with a clinician until you choose.";

  return (
    <div className={styles.encryptionNotice} role="note">
      <p>
        <strong><LockKeyhole aria-hidden="true" size={12} /> End-to-end encrypted</strong>
        <span>{description}</span>
      </p>
    </div>
  );
}

function EmptyAugustPrompts({ onSelect }: { onSelect: (starter: string) => void }) {
  const prompts = [
    {
      action: "Continue",
      description: "Bring over health context you’ve already shared without starting again.",
      icon: Sparkles,
      starter: "I want to continue from another AI.",
      title: "Continue from another AI",
    },
    {
      action: "Ask the care team",
      description: "Share what you want reviewed, then send it securely.",
      icon: UsersRound,
      starter: "I want a clinician to review this.",
      title: "Want a clinician to review this?",
    },
    {
      action: "Connect records",
      description: "Give August context from your labs, medications, and reports.",
      icon: BookOpen,
      starter: "I want to connect my health records.",
      title: "Connect your health records",
    },
  ];

  return (
    <section aria-label="Ways to start with August" className={styles.emptyPromptShelf}>
      {prompts.map((prompt) => {
        const Icon = prompt.icon;
        return (
          <article className={styles.emptyPromptCard} key={prompt.title}>
            <div className={styles.emptyPromptIcon}><Icon aria-hidden="true" size={21} /></div>
            <div className={styles.emptyPromptCopy}>
              <strong>{prompt.title}</strong>
              <p>{prompt.description}</p>
            </div>
            <button onClick={() => onSelect(prompt.starter)} type="button">{prompt.action}</button>
          </article>
        );
      })}
    </section>
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

type ProductTab = "updates" | "care" | "august";
type ProductNavItem = ProductTab | "home" | "library";

function ProductNavigation({ activeTab, careAvailable, onSelect }: {
  activeTab: ProductTab;
  careAvailable: boolean;
  onSelect: (tab: ProductTab) => void;
}) {
  const items: Array<{ id: ProductNavItem; label: string; icon: LucideIcon; inert?: boolean }> = [
    { id: "updates", label: "Activity", icon: LayoutGrid },
    { id: "home", label: "Home", icon: House, inert: true },
    { id: "care", label: "Chats", icon: MessageCircle },
    { id: "library", label: "Library", icon: BookOpen, inert: true },
    { id: "august", label: "August", icon: UsersRound, inert: true },
  ];

  return (
    <nav aria-label="Primary navigation" className={styles.bottomNav} data-active-tab={activeTab}>
      {items.map(({ id, icon: Icon, inert, label }) => (
        <button
          aria-current={activeTab === id ? "page" : undefined}
          aria-disabled={inert || undefined}
          aria-label={label}
          className={activeTab === id ? styles.activeNav : undefined}
          data-inert={inert || undefined}
          disabled={inert}
          key={id}
          onClick={() => { if (!inert) onSelect(id as ProductTab); }}
          type="button"
        >
          <Icon aria-hidden="true" size={20} strokeWidth={activeTab === id ? 2.3 : 2} />
          {id === "care" && careAvailable && activeTab !== "care" ? <i aria-hidden="true" className={styles.navBadge} /> : null}
          <span className={styles.visuallyHidden}>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function AugustLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <button aria-label="Start a new August chat" className={styles.newChatButton} onClick={onOpen} type="button">
      <span aria-hidden="true" className={styles.augustFabMark} data-august-mark="true">a</span>
    </button>
  );
}

function CareInbox({ careAvailable, onAskAugust, onOpenAugust, onOpenMaya }: { careAvailable: boolean; onAskAugust: (query: string) => void; onOpenAugust: () => void; onOpenMaya: () => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "clinicians">("all");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const showMaya = careAvailable && (!normalizedQuery || ["maya", "clinician", "throat", "care"].some((term) => term.includes(normalizedQuery) || normalizedQuery.includes(term)));
  const showAugust = filter === "all" && (!normalizedQuery || ["august", "care guide", "private support"].some((term) => term.includes(normalizedQuery) || normalizedQuery.includes(term)));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = query.trim();
    if (clean) onAskAugust(clean);
  }

  return (
    <div className={styles.careInbox}>
      <form className={styles.inboxSearch} onSubmit={submit} role="search">
        <AugustIdentityMark size="small" />
        <input aria-label="Ask August or search chats" onChange={(event) => setQuery(event.target.value)} placeholder="Ask August or search" type="search" value={query} />
        {query ? <button aria-label="Ask August" type="submit"><Send aria-hidden="true" size={16} /></button> : null}
      </form>

      <div aria-label="Chat filters" className={styles.chatFilters} role="group">
        {(["all", "unread", "clinicians"] as const).map((item) => (
          <button aria-pressed={filter === item} key={item} onClick={() => setFilter(item)} type="button">{item === "all" ? "All" : item === "unread" ? "Unread" : "Clinicians"}</button>
        ))}
      </div>

      {query ? (
        <button className={styles.askAugustRow} onClick={() => onAskAugust(query.trim())} type="button">
          <AugustIdentityMark size="regular" />
          <span><strong>Ask August</strong><small>{query.trim()}</small></span>
          <Send aria-hidden="true" size={17} />
        </button>
      ) : null}

      <div className={styles.chatList}>
        {showMaya ? (
          <button className={styles.inboxThread} onClick={onOpenMaya} type="button">
            <Avatar person="maya" size="large" />
            <span className={styles.inboxThreadCopy}>
              <span><strong>Maya</strong><small>Clinician</small></span>
              <span>Are you able to drink normally, and have you noticed a rash?</span>
            </span>
            <span className={styles.inboxThreadMeta}><time>10:24</time><b>1</b></span>
          </button>
        ) : null}

        {showAugust ? (
          <button className={styles.inboxThread} onClick={onOpenAugust} type="button">
            <AugustIdentityMark size="large" />
            <span className={styles.inboxThreadCopy}>
              <span><strong>August</strong><small>Care guide</small></span>
              <span>Ask anything or continue your care.</span>
            </span>
            <span className={styles.inboxThreadMeta}><time>Now</time><CheckCheck aria-hidden="true" size={16} /></span>
          </button>
        ) : null}

        {!showMaya && !showAugust && !query ? <div className={styles.emptyTabState}><MessageCircle aria-hidden="true" size={20} /><strong>No chats in this filter</strong><span>Your care conversations will appear here.</span></div> : null}
      </div>

      <AugustLauncher onOpen={onOpenAugust} />
    </div>
  );
}

function UpdatesTab({ careAvailable, onOpenAugust }: { careAvailable: boolean; onOpenAugust: () => void }) {
  return (
    <div className={styles.healthDashboard}>
      <section className={styles.healthHero}>
        <span className={styles.healthGuideLabel}><Sparkles aria-hidden="true" size={14} /> August AI guide</span>
        <h1>Hi Parth, August guides your health</h1>
        <AugustIdentityMark size="large" />
      </section>

      <section aria-label="Health overview" className={styles.healthOverviewCard}>
        <header><strong>Health overview</strong><button aria-label="Open health overview" disabled type="button"><ArrowRight aria-hidden="true" size={18} /></button></header>
        <div aria-label="Health score 82 out of 100" className={styles.healthGauge} role="img">
          <svg aria-hidden="true" viewBox="0 0 240 126">
            <path d="M20 108 A100 100 0 0 1 220 108" pathLength="100" />
            <path className={styles.healthGaugeValue} d="M20 108 A100 100 0 0 1 220 108" pathLength="100" />
          </svg>
          <span><small>Health score</small><strong>82</strong><b>/100</b></span>
        </div>
        <div className={styles.healthMetrics}>
          <div><span><HeartPulse aria-hidden="true" size={16} /></span><small>Heart</small><strong>72 <b>bpm</b></strong></div>
          <div><span><Moon aria-hidden="true" size={16} /></span><small>Sleep</small><strong>7h 45m</strong></div>
          <div><span><UsersRound aria-hidden="true" size={16} /></span><small>Care</small><strong>{careAvailable ? "Active" : "Ready"}</strong></div>
        </div>
      </section>
      <AugustLauncher onOpen={onOpenAugust} />
    </div>
  );
}

function ClinicianContactCard({ onContinue, responseEstimate }: { onContinue: () => void; responseEstimate: string }) {
  return (
    <section className={styles.clinicianContactCard}>
      <div className={styles.contactIdentity}>
        <Avatar person="maya" size="large" />
        <div><strong>Maya Rao</strong><span>Licensed clinician</span><small>{responseEstimate}</small></div>
        <i aria-hidden="true" />
      </div>
      <div className={styles.contactMatchReasons}>
        <span><CircleCheck aria-hidden="true" size={15} /> Licensed in California</span>
        <span><CircleCheck aria-hidden="true" size={15} /> Same-day throat care</span>
      </div>
      <button data-scroll-anchor="true" onClick={onContinue} type="button">
        <span>Continue conversation</span>
        <ArrowRight aria-hidden="true" size={16} />
      </button>
    </section>
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
  const fullIntake = getAugustIntakeHistory(answers);

  if (flow === "intake" && ["empty", "concern", "gathering"].includes(state)) {
    return null;
  }

  if (flow === "intake" && state === "reply") {
    return (
      <div className={styles.transcript}>
        <div className={styles.dateMarker}>Today · Care</div>
        <EncryptionNotice recipient="Maya" />
        <MessageItem message={{ author: "maya", content: "Hi Parth. I reviewed what you shared. Are you able to drink normally, and have you noticed a rash?", time: "10:24" }} />
        {patientReplies.map((message, index) => <MessageItem key={`maya-first-reply-${index}`} message={message} />)}
      </div>
    );
  }

  if (flow === "intake") {
    return (
      <div className={styles.transcript}>
        <div className={styles.dateMarker}>Today</div>
        {fullIntake.map((message, index) => <MessageItem animate={false} key={`complete-intake-${index}`} message={message} />)}
        <MessageItem message={{ author: "august", content: intakeReadyForReview, time: "9:50" }} />
        {state === "summary" ? (
          <>
            <SummaryCard answers={answers} editField={editField} editValue={editValue} onCancel={onCancelEdit} onChange={onChangeEdit} onEdit={onEdit} onSave={onSaveEdit} />
            <div className={styles.summaryPrompt}>
              <MessageItem message={{ author: "august", content: "Does everything look right? Reply yes to confirm. I won’t share anything with a clinician until you do.", time: "9:50" }} />
            </div>
          </>
        ) : null}
        {state === "reviewing" ? (
          <>
            <MessageItem message={{ author: "patient", content: "Everything looks right. You can share it.", time: "9:51" }} />
            <MessageItem message={{ author: "august", content: clinicianHandoffMessage, time: "9:52" }} />
            <ClinicianContactCard onContinue={() => onMove("intake", "reply")} responseEstimate={encounter.clinician.responseEstimate} />
            {patientReplies.map((message, index) => <MessageItem key={`handoff-reply-${index}`} message={message} />)}
          </>
        ) : null}
        {pending ? <ResponseProgress mode={flow === "intake" ? "clinical" : "coordination"} person={pending} /> : null}
      </div>
    );
  }

  if (flow === "lab" && state === "recommended") {
    return (
      <div className={styles.transcript}>
        <div className={styles.dateMarker}>Today · Care</div>
        <MessageItem message={{ author: "maya", content: "Hi Parth. I reviewed what you shared. Are you able to drink normally, and have you noticed a rash?", time: "10:24" }} />
        {patientReplies.map((message, index) => <MessageItem key={`lab-care-reply-${index}`} message={message} />)}
        <MessageItem message={{ author: "maya", content: labRecommendationMessage, time: "10:27" }} />
      </div>
    );
  }

  if (flow === "lab") {
    return (
      <div className={styles.transcript}>
        <AugustPreviousConversation answers={answers} />
        <div className={styles.dateMarker}>Today · August</div>
        <MessageItem message={{ author: "system", content: "Maya sent the rapid strep test order to August for scheduling." }} />
        <MessageItem message={{ author: "august", content: `${encounter.lab.location} can take Maya’s order ${encounter.lab.orderCode}. It is ${encounter.lab.distance} at ${encounter.lab.address}.\n\nThe appointment is ${encounter.lab.appointment.toLowerCase()}. Bring a photo ID and the order code.\n\nDoes this appointment work for you?`, time: "10:28" }} />
        {state === "nearby-lab" && pending === "august" ? (
          <>
            <MessageItem message={{ author: "patient", content: "Yes, that time works for me.", time: "Now" }} />
            <ResponseProgress mode="scheduling" person="august" />
          </>
        ) : null}
        {state === "confirmed" ? (
          <>
            <MessageItem message={{ author: "patient", content: "Yes, that time works for me.", time: "10:29" }} />
            <MessageItem message={{ author: "august", content: `You’re confirmed for ${encounter.lab.appointment.toLowerCase()} at ${encounter.lab.location}. Bring a photo ID. Maya’s order is already attached, and I’ll return the result to her visit.`, time: "10:30" }} />
          </>
        ) : null}
        {state !== "confirmed" ? patientReplies.map((message, index) => <MessageItem key={`lab-august-reply-${index}`} message={message} />) : null}
      </div>
    );
  }

  if (flow === "prescription" && ["recommended", "review"].includes(state)) {
    return (
      <div className={styles.transcript}>
        <div className={styles.dateMarker}>Later · Care</div>
        <MessageItem message={{ author: "system", content: "Your rapid strep result returned to Maya’s visit." }} />
        <MessageItem message={{ author: "maya", content: "Your rapid strep test is positive. That result explains your symptoms and means an antibiotic is appropriate. I also checked the medicines and allergies you shared. I recommend Penicillin V.", time: "2:14" }} />
        {state === "review" ? (
          <>
            <MessageItem message={{ author: "patient", content: "Show me the medication plan.", time: "2:15" }} />
            <MessageItem message={{ author: "maya", content: `${encounter.prescription.medication}, ${encounter.prescription.strength}.\n\n${encounter.prescription.directions} for ${encounter.prescription.duration}. The prescription contains ${encounter.prescription.quantity}.\n\nI prescribed this after reviewing your test result and allergy history. August can help send it to a pharmacy.`, time: "2:16" }} />
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFeedback, setSearchFeedback] = useState("");
  const [composerDraft, setComposerDraft] = useState("");
  const [editField, setEditField] = useState<keyof IntakeAnswers | null>(null);
  const [editValue, setEditValue] = useState("");
  const [patientReplies, setPatientReplies] = useState<Message[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const [conversationView, setConversationView] = useState<"thread" | "care-inbox" | "updates">("thread");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const firstDialogActionRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const timers = useRef<number[]>([]);

  const encounter = useMemo(() => ({ ...createPrototypeV2Encounter(flow, state), answers }), [answers, flow, state]);
  const clinician =
    (flow === "intake" && state === "reply") ||
    (flow === "lab" && state === "recommended") ||
    (flow === "prescription" && ["recommended", "review"].includes(state));
  const modalOpen = detailsOpen;
  const careAvailable = flow !== "intake" || ["reviewing", "reply"].includes(state);
  const showCareInbox = conversationView === "care-inbox";
  const showUpdates = conversationView === "updates";
  const activeTab: ProductTab = showUpdates
    ? "updates"
    : showCareInbox || clinician
      ? "care"
      : "august";

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("state", completeJourney ? getCompleteJourneyId(flow, state) : state);
    window.history.replaceState({}, "", url);
    let cancelled = false;
    let frame = 0;
    let scrollTimer = 0;
    const scrollLatest = (behavior: ScrollBehavior) => {
      const conversationalState =
        completeJourney ||
        (flow === "intake" && ["empty", "concern", "gathering", "reply"].includes(state)) ||
        (flow === "lab" && state !== "recommended");
      transcriptRef.current?.scrollTo({
        top:
          conversationalState || patientReplies.length
            ? transcriptRef.current.scrollHeight
            : 0,
        behavior,
      });
      if (state === "reviewing") {
        transcriptRef.current
          ?.querySelector<HTMLElement>("[data-scroll-anchor='true']")
          ?.scrollIntoView({ behavior, block: "end" });
      }
    };
    frame = requestAnimationFrame(() => {
      scrollLatest("smooth");
      scrollTimer = window.setTimeout(() => scrollLatest("auto"), 180);
    });
    document.fonts?.ready.then(() => {
      if (!cancelled) scrollLatest("auto");
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(scrollTimer);
    };
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
    if (nextFlow !== flow) setPatientReplies([]);
    setFlow(nextFlow);
    setState(nextState);
  }

  function switchTab(target: ProductTab) {
    if (target === "updates") {
      setConversationView("updates");
      return;
    }
    if (target === "care") {
      setConversationView("care-inbox");
      return;
    }

    const previousView = conversationView;
    setConversationView("thread");
    if (previousView === "thread" && !clinician) return;
    if (flow === "lab") moveTo("lab", "nearby-lab");
    else if (flow === "prescription") moveTo("prescription", "pharmacy");
    else if (state === "reply") moveTo("intake", "reviewing");
  }

  function openMayaThread() {
    setConversationView("thread");
    if (flow === "lab") moveTo("lab", "recommended");
    else if (flow === "prescription") moveTo("prescription", "review");
    else moveTo("intake", "reply");
  }

  function askAugustFromChats(query: string) {
    const clean = query.trim();
    if (!clean) return;
    setComposerDraft(clean);
    switchTab("august");
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchFeedback("");
    transcriptRef.current?.querySelectorAll(`.${styles.searchHit}`).forEach((node) => node.classList.remove(styles.searchHit));
  }

  function searchConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim().toLocaleLowerCase();
    const container = transcriptRef.current;
    if (!container || !query) {
      setSearchFeedback("Type something to search");
      return;
    }

    container.querySelectorAll(`.${styles.searchHit}`).forEach((node) => node.classList.remove(styles.searchHit));
    const matches = Array.from(container.querySelectorAll<HTMLElement>("p"))
      .filter((node) => !node.closest(`.${styles.conversationSearch}`) && node.innerText.toLocaleLowerCase().includes(query));
    if (!matches.length) {
      setSearchFeedback("No matches");
      return;
    }

    matches[0].classList.add(styles.searchHit);
    matches[0].scrollIntoView({ behavior: "smooth", block: "center" });
    setSearchFeedback(`${matches.length} ${matches.length === 1 ? "match" : "matches"}`);
  }

  function handleImageAttachment(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setUploadedImages((current) => [
        ...current,
        { id: `${file.name}-${file.lastModified}-${current.length}`, name: file.name, url: reader.result },
      ]);
    };
    reader.readAsDataURL(file);
  }

  function replyThen(next: PrototypeV2State, person: "august" | "maya") {
    setPending(person);
    const timer = window.setTimeout(() => { setPending(null); changeState(next); }, person === "maya" ? 1_100 : AUGUST_THINKING_DELAY);
    timers.current.push(timer);
  }

  function confirmLabAppointment() {
    if (pending) return;
    setPending("august");
    const timer = window.setTimeout(() => {
      setPending(null);
      changeState("confirmed");
    }, AUGUST_THINKING_DELAY);
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
      if (flow === "intake" && state === "reply") {
        setPatientReplies((current) => [...current, { author: "patient", content: value, time: "Now" }]);
        setPending("maya");
        const timer = window.setTimeout(() => { setPending(null); moveTo("lab", "recommended"); }, 1_100);
        timers.current.push(timer);
        return;
      }
      if (flow === "lab" && state === "recommended") {
        moveTo("lab", "nearby-lab");
        return;
      }
      if (flow === "lab" && state === "nearby-lab") {
        if (/\b(yes|works|confirm|okay|ok)\b/.test(normalized)) {
          confirmLabAppointment();
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
      if (flow === "lab" && state === "confirmed") {
        moveTo("prescription", "recommended");
        return;
      }
      if (flow === "prescription" && state === "recommended") {
        moveTo("prescription", "review");
        return;
      }
      if (flow === "prescription" && state === "review") {
        moveTo("prescription", "pharmacy");
        return;
      }
    }
    if (flow === "prescription" && state === "sent") {
      setPatientReplies((current) => [
        ...current,
        { author: "patient", content: value, time: "Now" },
        { author: "august", content: "The prescription has already been sent. I can still help with pharmacy timing, what happens next, or anything else about this care plan.", time: "Now" },
      ]);
      return;
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
        const timer = window.setTimeout(() => { setGatheringStep((current) => current + 1); setPending(null); }, AUGUST_THINKING_DELAY);
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
    if (state === "empty") {
      if (pending === "august" && answers.concern) {
        result.push({ author: "patient", content: answers.concern, time: "9:41" });
      }
      return result;
    }
    result.push(
      { author: "patient", content: answers.concern, time: "9:41" },
      { author: "august", content: firstIntakeReply, time: "9:41" },
    );
    if (state === "concern") {
      if (pending === "august" && answers.onset) {
        result.push({ author: "patient", content: answers.onset, time: "9:43" });
      }
      return result;
    }
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
      if (pending === "august") {
        const currentQuestion = intakeQuestions[gatheringStep];
        result.push({ author: "patient", content: answers[currentQuestion.field], time: "Now" });
      }
    }
    return result;
  }, [answers, flow, gatheringStep, pending, state]);
  const latestAugustMessageIndex = messages.reduce((latest, message, index) => message.author === "august" ? index : latest, -1);

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
      return { kind: "composer" as const, disabled: Boolean(pending), placeholder, recipient };
    }
    if (flow === "intake" && state === "summary") return { kind: "passive" as const, icon: LockKeyhole, text: "Nothing is shared until you confirm" };
    if (flow === "intake" && state === "reviewing") return { kind: "passive" as const, icon: Clock3, text: "August is connecting you with Maya" };
    if (flow === "intake" && state === "empty") return { kind: "composer" as const, disabled: false, placeholder: "Tell August what’s going on…", recipient: "August" as const };
    if (flow === "intake" && state === "concern") return { kind: "composer" as const, disabled: false, placeholder: "Add timing, severity, and fever…", recipient: "August" as const };
    if (flow === "intake" && state === "gathering") return { kind: "composer" as const, disabled: Boolean(pending), placeholder: intakeQuestions[gatheringStep].placeholder, recipient: "August" as const };
    if (!clinician) return { kind: "composer" as const, disabled: false, placeholder: "Message August…", recipient: "August" as const };
    return { kind: "composer" as const, disabled: false, placeholder: "Message Maya…", recipient: "Maya" as const };
  })();

  const subtitle = clinician ? "Usually replies in 2 to 4 hours" : "Care guide";

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
            recipient: "August · Care guide",
            privacy: "Maya can see only the visit summary you confirmed. New messages stay with August until you open her contact.",
            context: "Confirmed symptoms, safety answers, medicines, and allergies",
            status: `Maya matched · ${encounter.clinician.responseEstimate}`,
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
          {showCareInbox ? (
            <header className={styles.careInboxHeader}>
              <div><strong>Chats</strong></div>
              <div className={styles.chatHeaderActions}>
                <button aria-label="Chats options unavailable" className={styles.chatHeaderAction} disabled type="button"><MoreVertical aria-hidden="true" size={20} /></button>
              </div>
            </header>
          ) : showUpdates ? (
            <header className={styles.healthHeader}>
              <button aria-label="Menu unavailable in prototype" disabled type="button"><Menu aria-hidden="true" size={20} /></button>
              <strong>August</strong>
              <div><button aria-label="Notifications unavailable in prototype" disabled type="button"><Bell aria-hidden="true" size={19} /></button><AugustIdentityMark size="small" /></div>
            </header>
          ) : (
            <ConversationHeader
              clinician={clinician}
              onBack={() => switchTab("care")}
              onDetails={(trigger) => { lastTriggerRef.current = trigger; setDetailsOpen(true); }}
              onSearch={() => setSearchOpen((current) => !current)}
              subtitle={subtitle}
            />
          )}

          <div className={styles.screen} data-conversation-screen="true" ref={transcriptRef}>
            {searchOpen ? (
              <form className={styles.conversationSearch} onSubmit={searchConversation} role="search">
                <Search aria-hidden="true" size={17} />
                <input
                  aria-label="Search this conversation"
                  onChange={(event) => { setSearchQuery(event.target.value); setSearchFeedback(""); }}
                  onKeyDown={(event) => { if (event.key === "Escape") closeSearch(); }}
                  placeholder="Search this conversation"
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                />
                {searchFeedback ? <span aria-live="polite">{searchFeedback}</span> : null}
                <button aria-label="Close conversation search" onClick={closeSearch} type="button"><X aria-hidden="true" size={17} /></button>
              </form>
            ) : null}
            {showCareInbox ? (
              <CareInbox careAvailable={careAvailable} onAskAugust={askAugustFromChats} onOpenAugust={() => switchTab("august")} onOpenMaya={openMayaThread} />
            ) : showUpdates ? (
              <UpdatesTab careAvailable={careAvailable} onOpenAugust={() => switchTab("august")} />
            ) : completeJourney ? (
              flow === "intake" && ["empty", "concern", "gathering"].includes(state) ? (
                <div className={styles.transcript}>
                  {state !== "empty" ? <div className={styles.dateMarker}>Today</div> : null}
                  {state === "empty" && !pending ? <EncryptionNotice /> : null}
                  {messages.map((message, index) => <MessageItem key={`${message.author}-${index}-${message.content}`} message={message} stream={index === latestAugustMessageIndex && !pending} />)}
                  {pending ? <ResponseProgress person={pending} /> : null}
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
                {state !== "empty" ? <div className={styles.dateMarker}>Today</div> : null}
                {state === "empty" && !pending ? <EncryptionNotice /> : null}
                {messages.map((message, index) => <MessageItem key={`${message.author}-${index}-${message.content}`} message={message} stream={index === latestAugustMessageIndex && !pending} />)}
                {pending ? <ResponseProgress person={pending} /> : null}
              </div>
            ) : null}

            {flow === "intake" && state === "summary" ? (
              <div className={styles.contentStack}>
                <MessageItem message={{ author: "august", content: intakeReadyForReview, time: "9:50" }} />
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
                <MessageItem message={{ author: "august", content: clinicianHandoffMessage, time: "9:52" }} />
                <ClinicianContactCard onContinue={() => changeState("reply")} responseEstimate={encounter.clinician.responseEstimate} />
              </div>
            ) : null}

            {flow === "intake" && state === "reply" ? (
              <div className={styles.transcript}>
                <div className={styles.dateMarker}>Today · Care</div>
                <EncryptionNotice recipient="Maya" />
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
                <MessageItem message={{ author: "maya", content: labRecommendationMessage, time: "10:27" }} />
                <PrimaryAction onClick={() => changeState("nearby-lab")}>Continue with August</PrimaryAction>
              </div>
            ) : null}

            {flow === "lab" && state === "nearby-lab" ? (
              <div className={styles.contentStack}>
                <AugustPreviousConversation answers={answers} />
                <div className={styles.dateMarker}>Today · August</div>
                <MessageItem message={{ author: "system", content: "Maya sent the test order to your private August conversation." }} />
                <MessageItem message={{ author: "august", content: `${encounter.lab.location} can take Maya’s order ${encounter.lab.orderCode}. It is ${encounter.lab.distance} at ${encounter.lab.address}.\n\nThe appointment is ${encounter.lab.appointment.toLowerCase()}. Bring a photo ID and the order code.\n\nDoes this appointment work for you?`, time: "10:28" }} />
                {pending === "august" ? (
                  <>
                    <MessageItem message={{ author: "patient", content: "Yes, that time works for me.", time: "Now" }} />
                    <ResponseProgress mode="scheduling" person="august" />
                  </>
                ) : <PrimaryAction onClick={confirmLabAppointment}>Yes, confirm appointment</PrimaryAction>}
              </div>
            ) : null}

            {flow === "lab" && state === "confirmed" ? (
              <div className={styles.contentStack}>
              <AugustPreviousConversation answers={answers} />
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
            {uploadedImages.length ? (
              <div className={styles.attachmentThread}>
                {uploadedImages.map((item) => (
                  <MessageItem key={item.id} message={{ author: "patient", content: "Image added", imageName: item.name, imageUrl: item.url, time: "Now" }} />
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.inputZone}>
            {!showCareInbox && !showUpdates && flow === "intake" && state === "empty" && !pending ? (
              <EmptyAugustPrompts onSelect={setComposerDraft} />
            ) : null}
            {showCareInbox ? (
              null
            ) : showUpdates ? (
              null
            ) : composerConfig.kind === "composer" ? (
              <Composer disabled={composerConfig.disabled || Boolean(pending)} initialValue={composerDraft} key={`${composerConfig.recipient}-${composerDraft}`} onAttach={handleImageAttachment} onSubmit={(value) => { setComposerDraft(""); handleComposer(value); }} placeholder={composerConfig.placeholder} recipient={composerConfig.recipient} />
            ) : (
              <PassiveFooter icon={composerConfig.icon} text={composerConfig.text} />
            )}
            <div className={styles.emergencyNotice}>Not emergency care · Call 911 for emergencies.</div>
          </div>
          <ProductNavigation
            activeTab={activeTab}
            careAvailable={careAvailable}
            onSelect={switchTab}
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

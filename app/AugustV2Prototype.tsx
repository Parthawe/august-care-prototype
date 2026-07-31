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
import Link from "next/link";
import styles from "./AugustV2Prototype.module.css";
import {
  createPrototypeV2Encounter,
  defaultIntakeAnswers,
  getPrototypeV2StateIndex,
  IntakeAnswers,
  movePrototypeV2State,
  PrototypeV2Flow,
  PrototypeV2State,
  prototypeV2StateLabels,
  prototypeV2States,
} from "./prototypeV2Machine";

type Props = {
  initialFlow: PrototypeV2Flow;
  initialState: PrototypeV2State;
  initialLabel: string;
};

type Message = {
  author: "august" | "patient" | "maya" | "system";
  content: string;
  time?: string;
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

const flowNames: Record<PrototypeV2Flow, string> = {
  intake: "Shared intake",
  prescription: "Prescription continuation",
  lab: "Nearby-lab continuation",
};

function Avatar({
  person,
  size = "regular",
}: {
  person: "august" | "maya";
  size?: "small" | "regular" | "large";
}) {
  return (
    <img
      alt={person === "august" ? "August AI" : "Maya Rao, fictional clinician"}
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
        <i />
        <i />
        <i />
        <b />
      </div>
    </div>
  );
}

function ConversationHeader({
  clinician,
  subtitle,
  onDetails,
}: {
  clinician: boolean;
  subtitle: string;
  onDetails: () => void;
}) {
  return (
    <header className={styles.conversationHeader}>
      {clinician ? (
        <span className={styles.backGlyph} aria-hidden="true">
          ‹
        </span>
      ) : null}
      <Avatar person={clinician ? "maya" : "august"} />
      <div className={styles.headerCopy}>
        <strong>{clinician ? "Maya Rao (Clinician)" : "August"}</strong>
        <span>{subtitle}</span>
      </div>
      <button
        aria-label="Open conversation details"
        className={styles.headerAction}
        onClick={onDetails}
        type="button"
      >
        <span aria-hidden="true">ⓘ</span>
      </button>
    </header>
  );
}

function MessageItem({ message }: { message: Message }) {
  if (message.author === "system") {
    return (
      <div className={styles.systemMessage}>
        <span aria-hidden="true">✓</span>
        <p>{message.content}</p>
      </div>
    );
  }

  if (message.author === "patient") {
    return (
      <div className={`${styles.messageRow} ${styles.patientRow}`}>
        <div className={styles.patientBubble}>
          <p>{message.content}</p>
          <span>{message.time ?? "9:42"} · ✓✓</span>
        </div>
      </div>
    );
  }

  const isMaya = message.author === "maya";
  return (
    <div className={styles.messageRow}>
      <Avatar person={isMaya ? "maya" : "august"} size="small" />
      <div
        className={
          isMaya ? styles.clinicianMessage : styles.augustMessage
        }
      >
        {isMaya ? (
          <div className={styles.messageMeta}>
            <strong>Maya Rao</strong>
            <span>{message.time ?? "10:24"}</span>
          </div>
        ) : null}
        <p>{message.content}</p>
        {!isMaya ? <span>{message.time ?? "9:41"}</span> : null}
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
        <button
          aria-label="Add attachment"
          className={styles.attachButton}
          disabled={disabled}
          type="button"
        >
          +
        </button>
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
          ↑
        </button>
      </form>
      <span>To {recipient}</span>
    </div>
  );
}

function ProductNavigation({ clinician }: { clinician: boolean }) {
  return (
    <nav aria-label="Care navigation" className={styles.bottomNav}>
      <span>
        <i aria-hidden="true">◷</i>
        <span className={styles.visuallyHidden}>History</span>
      </span>
      <span className={clinician ? styles.activeNav : undefined}>
        <i aria-hidden="true">▱</i>
        Care
      </span>
      <span className={!clinician ? styles.activeNav : undefined}>
        <Avatar person="august" size="small" />
        August
      </span>
    </nav>
  );
}

function PrimaryAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={styles.primaryAction} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function DetailCard({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className={styles.detailCard}>
      {eyebrow ? <small>{eyebrow}</small> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.detailRow}>
      <span aria-hidden="true">{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SummaryCard({
  answers,
  onEdit,
}: {
  answers: IntakeAnswers;
  onEdit: (field: keyof IntakeAnswers) => void;
}) {
  const rows: Array<{
    field: keyof IntakeAnswers;
    label: string;
    value: string;
  }> = [
    { field: "concern", label: "Concern", value: answers.concern },
    { field: "onset", label: "Timing + severity", value: answers.onset },
    {
      field: "warningSigns",
      label: "Urgent warning signs",
      value: answers.warningSigns,
    },
    {
      field: "history",
      label: "History + medicines",
      value: answers.history,
    },
    { field: "allergies", label: "Allergies", value: answers.allergies },
  ];

  return (
    <section className={styles.summaryCard}>
      <header>
        <div>
          <small>VISIT SUMMARY</small>
          <h2>Confirm what August gathered.</h2>
        </div>
        <span>Private until confirmed</span>
      </header>
      {rows.map((row) => (
        <button
          aria-label={`Edit ${row.label}`}
          className={styles.summaryRow}
          key={row.field}
          onClick={() => onEdit(row.field)}
          type="button"
        >
          <span>
            <small>{row.label}</small>
            <strong>{row.value}</strong>
          </span>
          <i aria-hidden="true">Edit</i>
        </button>
      ))}
    </section>
  );
}

function SuccessPanel({
  details,
  eyebrow,
  rows,
  title,
}: {
  details: string;
  eyebrow: string;
  rows: Array<{ icon: string; label: string; value: string }>;
  title: string;
}) {
  return (
    <section className={styles.successPanel}>
      <div className={styles.successCheck} aria-hidden="true">
        ✓
      </div>
      <small>{eyebrow}</small>
      <h1>{title}</h1>
      <p>{details}</p>
      <div className={styles.successDetails}>
        {rows.map((row) => (
          <DetailRow {...row} key={row.label} />
        ))}
      </div>
    </section>
  );
}

function ReviewerControls({
  canGoBack,
  canGoNext,
  flow,
  label,
  onBack,
  onNext,
  onReset,
  stateIndex,
  stateTotal,
}: {
  canGoBack: boolean;
  canGoNext: boolean;
  flow: PrototypeV2Flow;
  label: string;
  onBack: () => void;
  onNext: () => void;
  onReset: () => void;
  stateIndex: number;
  stateTotal: number;
}) {
  return (
    <aside className={styles.reviewerControls} aria-label="Prototype controls">
      <div>
        <small>PROTOTYPE CONTROLS</small>
        <strong>{flowNames[flow]}</strong>
        <span>
          {String(stateIndex + 1).padStart(2, "0")} /{" "}
          {String(stateTotal).padStart(2, "0")} · {label}
        </span>
      </div>
      <div className={styles.controlButtons}>
        <button disabled={!canGoBack} onClick={onBack} type="button">
          ← Previous
        </button>
        <button onClick={onReset} type="button">
          Reset
        </button>
        <button disabled={!canGoNext} onClick={onNext} type="button">
          Next →
        </button>
      </div>
      <Link href="/prototype-v2">All starting points</Link>
    </aside>
  );
}

export function AugustV2Prototype({
  initialFlow,
  initialState,
  initialLabel,
}: Props) {
  const [state, setState] = useState(initialState);
  const [answers, setAnswers] = useState({ ...defaultIntakeAnswers });
  const [gatheringStep, setGatheringStep] = useState(0);
  const [pending, setPending] = useState<"august" | "maya" | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const encounter = useMemo(
    () => ({
      ...createPrototypeV2Encounter(initialFlow, state),
      answers,
    }),
    [answers, initialFlow, state],
  );

  const stateIndex = getPrototypeV2StateIndex(initialFlow, state);
  const stateTotal = prototypeV2States[initialFlow].length;
  const stateLabel = prototypeV2StateLabels[initialFlow][state] ?? initialLabel;
  const clinician =
    initialFlow !== "intake" ||
    state === "reviewing" ||
    state === "reply";

  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("state", state);
    window.history.replaceState({}, "", url);
    requestAnimationFrame(() => {
      transcriptRef.current?.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [state, gatheringStep, pending]);

  function changeState(next: PrototypeV2State) {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setPending(null);
    setState(next);
  }

  function replyThen(next: PrototypeV2State, person: "august" | "maya") {
    setPending(person);
    const timer = window.setTimeout(() => {
      setPending(null);
      changeState(next);
    }, person === "maya" ? 850 : 620);
    timers.current.push(timer);
  }

  function handleComposer(value: string) {
    if (initialFlow !== "intake") return;

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
        const timer = window.setTimeout(() => {
          setGatheringStep((current) => current + 1);
          setPending(null);
        }, 620);
        timers.current.push(timer);
      } else {
        replyThen("summary", "august");
      }
    }
  }

  function editSummary(field: keyof IntakeAnswers) {
    const value = window.prompt(
      `Update ${field}`,
      encounter.answers[field],
    )?.trim();
    if (value) {
      setAnswers((current) => ({ ...current, [field]: value }));
    }
  }

  function reset() {
    setAnswers({ ...defaultIntakeAnswers });
    setGatheringStep(0);
    setPending(null);
    setDetailsOpen(false);
    changeState(prototypeV2States[initialFlow][0]);
  }

  function move(direction: -1 | 1) {
    changeState(movePrototypeV2State(initialFlow, state, direction));
  }

  const messages = useMemo<Message[]>(() => {
    if (initialFlow !== "intake") return [];
    const result: Message[] = [];
    if (state === "empty") {
      return [
        {
          author: "august",
          content:
            "Hi Parth—tell me what’s going on. I’ll gather the useful details before a clinician reviews anything.",
          time: "9:40",
        },
      ];
    }

    result.push(
      {
        author: "august",
        content:
          "Hi Parth—tell me what’s going on. I’ll gather the useful details before a clinician reviews anything.",
        time: "9:40",
      },
      { author: "patient", content: answers.concern, time: "9:41" },
      {
        author: "august",
        content:
          "When did it start, is it getting better or worse, and what was your highest temperature?",
        time: "9:41",
      },
    );

    if (state === "concern") return result;

    result.push(
      { author: "patient", content: answers.onset, time: "9:43" },
      {
        author: "august",
        content: intakeQuestions[0].prompt,
        time: "9:43",
      },
    );

    if (state === "gathering") {
      for (let index = 0; index < gatheringStep; index += 1) {
        const question = intakeQuestions[index];
        result.push(
          {
            author: "patient",
            content: answers[question.field],
            time: `9:${44 + index * 2}`,
          },
          {
            author: "august",
            content: intakeQuestions[index + 1].prompt,
            time: `9:${45 + index * 2}`,
          },
        );
      }
    }

    return result;
  }, [answers, gatheringStep, initialFlow, state]);

  const composerConfig = (() => {
    if (initialFlow !== "intake") {
      return {
        disabled: true,
        placeholder:
          state === "sent" || state === "confirmed"
            ? "This prototype flow is complete"
            : "Message Maya…",
        recipient: "Maya" as const,
      };
    }
    if (state === "empty") {
      return {
        disabled: false,
        placeholder: "Tell August what’s going on…",
        recipient: "August" as const,
      };
    }
    if (state === "concern") {
      return {
        disabled: false,
        placeholder: "Add timing, severity, and fever…",
        recipient: "August" as const,
      };
    }
    if (state === "gathering") {
      return {
        disabled: Boolean(pending),
        placeholder: intakeQuestions[gatheringStep].placeholder,
        recipient: "August" as const,
      };
    }
    return {
      disabled: true,
      placeholder:
        state === "reply" ? "Message Maya…" : "Continue in the care flow",
      recipient: state === "reply" ? ("Maya" as const) : ("August" as const),
    };
  })();

  const subtitle = (() => {
    if (initialFlow === "prescription") return "Human clinician · prescription plan";
    if (initialFlow === "lab") return "Human clinician · testing plan";
    if (state === "reviewing") return "Reviewing · usually replies in 2–4 hours";
    if (state === "reply") return "Human clinician · replied 1m ago";
    return "AI care guide";
  })();

  return (
    <main className={styles.stage}>
      <section className={styles.contextPanel}>
        <Link className={styles.wordmark} href="/prototype-v2">
          August
        </Link>
        <div>
          <small>INTERACTIVE PROTOTYPE · V2</small>
          <h1>{flowNames[initialFlow]}</h1>
          <p>
            {initialFlow === "intake"
              ? "One conversation moves from natural intake to a direct human handoff."
              : initialFlow === "prescription"
                ? "Maya authors the medication decision; the patient confirms fulfillment."
                : "Maya authors the testing decision; August arranges the nearby lab."}
          </p>
        </div>
        <dl>
          <div>
            <dt>Current state</dt>
            <dd>{stateLabel}</dd>
          </div>
          <div>
            <dt>Decision owner</dt>
            <dd>
              {initialFlow === "intake" && stateIndex < 4
                ? "Patient + August"
                : "Maya · Human clinician"}
            </dd>
          </div>
        </dl>
        <p className={styles.prototypeNote}>
          Fictional product-design prototype. No real patient or clinician data.
        </p>
      </section>

      <div className={styles.deviceColumn}>
        <section className={styles.phone} aria-label="August care prototype">
          <StatusBar />
          <ConversationHeader
            clinician={clinician}
            onDetails={() => setDetailsOpen(true)}
            subtitle={subtitle}
          />

          <div className={styles.screen} ref={transcriptRef}>
            {initialFlow === "intake" &&
            ["empty", "concern", "gathering"].includes(state) ? (
              <div className={styles.transcript}>
                <div className={styles.dateMarker}>Today</div>
                {messages.map((message, index) => (
                  <MessageItem
                    key={`${message.author}-${index}-${message.content}`}
                    message={message}
                  />
                ))}
                {pending ? <TypingIndicator person={pending} /> : null}
              </div>
            ) : null}

            {initialFlow === "intake" && state === "summary" ? (
              <div className={styles.contentStack}>
                <div className={styles.screenIntro}>
                  <small>BEFORE ANYTHING IS SHARED</small>
                  <h1>Review your information.</h1>
                  <p>
                    August organized the conversation. You can correct anything
                    before Maya receives it.
                  </p>
                </div>
                <SummaryCard answers={answers} onEdit={editSummary} />
                <PrimaryAction onClick={() => changeState("reviewing")}>
                  Confirm and connect
                </PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "intake" && state === "reviewing" ? (
              <div className={styles.contentStack}>
                <div className={styles.screenIntro}>
                  <small>CARE CONNECTED</small>
                  <h1>Maya is reviewing your visit.</h1>
                  <p>
                    Your confirmed summary went directly to Maya. There was no
                    clinician-selection step.
                  </p>
                </div>
                <section className={styles.reviewingCard}>
                  <Avatar person="maya" size="large" />
                  <div>
                    <strong>Maya Rao</strong>
                    <span>Human clinician</span>
                    <p>Usually replies within 2–4 hours</p>
                  </div>
                  <i className={styles.reviewingPulse} aria-hidden="true" />
                </section>
                <DetailCard title="While Maya reviews">
                  <DetailRow
                    icon="✓"
                    label="Shared"
                    value="Only the summary you confirmed"
                  />
                  <DetailRow
                    icon="◷"
                    label="Status"
                    value="You can leave and return to Care"
                  />
                  <DetailRow
                    icon="A"
                    label="August"
                    value="Still available privately while you wait"
                  />
                </DetailCard>
                <PrimaryAction onClick={() => changeState("reply")}>
                  Open Care conversation
                </PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "intake" && state === "reply" ? (
              <div className={styles.transcript}>
                <div className={styles.dateMarker}>Today · Care</div>
                <MessageItem
                  message={{
                    author: "system",
                    content:
                      "Your confirmed summary was shared with Maya at 9:52 AM",
                  }}
                />
                <MessageItem
                  message={{
                    author: "maya",
                    content:
                      "Hi Parth—I reviewed your fever, worsening throat pain, safety answers, history, and allergies.",
                    time: "10:24",
                  }}
                />
                <MessageItem
                  message={{
                    author: "maya",
                    content:
                      "You’re breathing and drinking normally, which is reassuring. I’ll explain the recommended next step here.",
                    time: "10:25",
                  }}
                />
                <MessageItem
                  message={{
                    author: "patient",
                    content: "Thank you. I’m ready.",
                    time: "10:26",
                  }}
                />
              </div>
            ) : null}

            {initialFlow === "prescription" && state === "recommended" ? (
              <div className={styles.contentStack}>
                <MessageItem
                  message={{
                    author: "maya",
                    content:
                      "Based on your clinical assessment and confirmed allergy history, a prescription is appropriate. I’m proposing Penicillin V after confirming your allergy history.",
                    time: "10:24",
                  }}
                />
                <div className={styles.screenIntro}>
                  <small>CLINICIAN DECISION</small>
                  <h1>Maya recommends a prescription.</h1>
                  <p>The recommendation is clinician-authored and signed.</p>
                </div>
                <DetailCard title="Prescription recommendation">
                  <DetailRow
                    icon="◇"
                    label="Medication"
                    value="Penicillin V · prescription details"
                  />
                  <DetailRow
                    icon="⌁"
                    label="Decision author"
                    value="Maya Rao · Human clinician"
                  />
                  <DetailRow
                    icon="✓"
                    label="Allergy check"
                    value="Confirmed by Maya"
                  />
                </DetailCard>
                <PrimaryAction onClick={() => changeState("review")}>
                  Review prescription
                </PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "prescription" && state === "review" ? (
              <div className={styles.contentStack}>
                <div className={styles.screenIntro}>
                  <small>PRESCRIPTION REVIEW</small>
                  <h1>Confirm the details before submission.</h1>
                  <p>
                    Review the medication, instructions, pharmacy, and clinical
                    author.
                  </p>
                </div>
                <DetailCard title="Penicillin V">
                  <DetailRow
                    icon="◇"
                    label="Medication"
                    value="Penicillin V · prescription details"
                  />
                  <DetailRow
                    icon="▤"
                    label="Instructions"
                    value="Follow clinician directions"
                  />
                  <DetailRow
                    icon="▦"
                    label="Pharmacy"
                    value="Castro Community Pharmacy"
                  />
                  <DetailRow
                    icon="⌁"
                    label="Prescriber"
                    value="Maya Rao · Human clinician"
                  />
                </DetailCard>
                <PrimaryAction onClick={() => changeState("pharmacy")}>
                  Send to this pharmacy
                </PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "prescription" && state === "pharmacy" ? (
              <div className={styles.contentStack}>
                <div className={styles.screenIntro}>
                  <small>PHARMACY</small>
                  <h1>Confirm where to send it.</h1>
                  <p>Availability is confirmed before submission.</p>
                </div>
                <DetailCard title="Castro Community Pharmacy">
                  <DetailRow
                    icon="▦"
                    label="Selected"
                    value="Castro Community Pharmacy"
                  />
                  <DetailRow icon="⌖" label="Distance" value="0.8 miles" />
                  <DetailRow
                    icon="◇"
                    label="Status"
                    value="Accepting electronic prescriptions"
                  />
                </DetailCard>
                <section className={styles.confirmationStrip}>
                  <span aria-hidden="true">✓</span>
                  <p>
                    <strong>Ready to submit</strong>
                    Maya’s signed prescription will be sent here.
                  </p>
                </section>
                <PrimaryAction onClick={() => changeState("sent")}>
                  Confirm pharmacy
                </PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "prescription" && state === "sent" ? (
              <SuccessPanel
                details="Fulfillment is now with the selected pharmacy."
                eyebrow="SENT TO PHARMACY"
                rows={[
                  {
                    icon: "▦",
                    label: "Pharmacy",
                    value: "Castro Community Pharmacy",
                  },
                  { icon: "◷", label: "Sent", value: "Today · 10:42 AM" },
                  {
                    icon: "→",
                    label: "Next update",
                    value: "Pharmacy confirmation",
                  },
                ]}
                title="Prescription sent"
              />
            ) : null}

            {initialFlow === "lab" && state === "recommended" ? (
              <div className={styles.contentStack}>
                <MessageItem
                  message={{
                    author: "maya",
                    content:
                      "Before deciding on medication, I recommend a rapid strep test today.",
                    time: "10:24",
                  }}
                />
                <div className={styles.screenIntro}>
                  <small>CLINICIAN DECISION</small>
                  <h1>Maya recommends a strep test.</h1>
                  <p>The test will guide the medication decision.</p>
                </div>
                <DetailCard title="Testing recommendation">
                  <DetailRow
                    icon="▤"
                    label="Test"
                    value="Rapid strep test"
                  />
                  <DetailRow
                    icon="◇"
                    label="Reason"
                    value="Guides the medication decision"
                  />
                  <DetailRow
                    icon="⌁"
                    label="Decision author"
                    value="Maya Rao · Human clinician"
                  />
                </DetailCard>
                <PrimaryAction onClick={() => changeState("nearby-lab")}>
                  View test option
                </PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "lab" && state === "nearby-lab" ? (
              <div className={styles.contentStack}>
                <div className={styles.screenIntro}>
                  <small>TEST OPTION</small>
                  <h1>August arranged a nearby lab.</h1>
                  <p>
                    The clinician order and instructions are already attached.
                  </p>
                </div>
                <DetailCard
                  eyebrow="RECOMMENDED · AUGUST ARRANGED"
                  title="Mission Lab"
                >
                  <DetailRow
                    icon="▦"
                    label="Nearby lab"
                    value="Mission Lab · 1.2 miles"
                  />
                  <DetailRow
                    icon="◷"
                    label="Appointment"
                    value="Tomorrow · 9:30 AM"
                  />
                  <DetailRow
                    icon="▤"
                    label="Bring"
                    value="Photo ID and order code"
                  />
                  <DetailRow
                    icon="✓"
                    label="Order"
                    value="Rapid strep test · attached"
                  />
                </DetailCard>
                <section className={styles.confirmationStrip}>
                  <span aria-hidden="true">✓</span>
                  <p>
                    <strong>One focused option</strong>
                    No external-lab or upload branch appears in this prototype.
                  </p>
                </section>
                <PrimaryAction onClick={() => changeState("confirmed")}>
                  Confirm nearby lab
                </PrimaryAction>
              </div>
            ) : null}

            {initialFlow === "lab" && state === "confirmed" ? (
              <SuccessPanel
                details="This appointment stays connected to Maya’s visit."
                eyebrow="SCHEDULED"
                rows={[
                  {
                    icon: "◷",
                    label: "When",
                    value: "Tomorrow · 9:30 AM",
                  },
                  { icon: "⌖", label: "Where", value: "Mission Lab" },
                  { icon: "▤", label: "Order", value: "Rapid strep test" },
                ]}
                title="Appointment confirmed"
              />
            ) : null}
          </div>

          <Composer
            disabled={composerConfig.disabled || Boolean(pending)}
            onSubmit={handleComposer}
            placeholder={composerConfig.placeholder}
            recipient={composerConfig.recipient}
          />
          <ProductNavigation clinician={clinician} />
        </section>

        <ReviewerControls
          canGoBack={stateIndex > 0}
          canGoNext={stateIndex < stateTotal - 1}
          flow={initialFlow}
          label={stateLabel}
          onBack={() => move(-1)}
          onNext={() => move(1)}
          onReset={reset}
          stateIndex={stateIndex}
          stateTotal={stateTotal}
        />
      </div>

      {detailsOpen ? (
        <div
          className={styles.sheetBackdrop}
          onMouseDown={() => setDetailsOpen(false)}
          role="presentation"
        >
          <section
            aria-label="Conversation details"
            aria-modal="true"
            className={styles.detailsSheet}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className={styles.sheetHandle} />
            <header>
              <strong>Conversation details</strong>
              <button
                aria-label="Close conversation details"
                onClick={() => setDetailsOpen(false)}
                type="button"
              >
                ×
              </button>
            </header>
            <DetailRow
              icon="⌁"
              label="Decision owner"
              value={
                initialFlow === "intake" && stateIndex < 4
                  ? "August gathers context"
                  : "Maya Rao · Human clinician"
              }
            />
            <DetailRow
              icon="◇"
              label="Prototype data"
              value="Fictional patient, clinician, orders, and appointments"
            />
            <DetailRow
              icon="✓"
              label="Privacy model"
              value="Only the confirmed summary is shared with Maya"
            />
          </section>
        </div>
      ) : null}
    </main>
  );
}

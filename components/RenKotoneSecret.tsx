"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { isolateDialog, restoreFocus, trapTabKey } from "@/lib/accessibility";
import { lockDocumentScroll } from "@/lib/browserRuntime";

const SECRET = ["E", "I", "L", "A", "V"] as const;
const STEP_TIMEOUT = 9000;
const CONFIRM_TIMEOUT = 7000;
const OPEN_MS = 1460;
const CLOSE_MS = 860;
const SWAP_MS = 230;

type Person = "kotone" | "ren";
type ActionKey = "action" | "finisher" | "victory" | "outtake";
type Phase = "closed" | "opening" | "active" | "closing";
type UiCue = "open" | "close" | "select" | ActionKey;

type Pose = {
  src: string;
  label: string;
  scale?: number;
  x?: number;
  y?: number;
  rotate?: number;
  mobileScale?: number;
  mobileX?: number;
  mobileY?: number;
};

type PersonData = {
  first: string;
  last: string;
  side: "pink" | "cyan";
  poses: readonly Pose[];
  actionPose: Record<ActionKey, readonly number[]>;
  voices: Record<ActionKey, readonly string[]>;
};

const PEOPLE: Record<Person, PersonData> = {
  kotone: {
    first: "KOTONE",
    last: "SHIOMI",
    side: "pink",
    poses: [
      { src: "/easter-egg/sprites/kotone/idle.png", label: "IDLE", scale: 1.03, x: -2, y: 1, mobileScale: .98 },
      { src: "/easter-egg/sprites/kotone/action-up.png", label: "QUICK DRAW", scale: .96, x: -1, y: 2, rotate: -.3, mobileScale: .91 },
      { src: "/easter-egg/sprites/kotone/action-down.png", label: "FINISHER", scale: .92, x: 1, y: 1, rotate: .4, mobileScale: .88 },
      { src: "/easter-egg/sprites/kotone/action-right.png", label: "ACTION POSE", scale: 1.01, x: 0, y: 1, mobileScale: .95 },
      { src: "/easter-egg/sprites/kotone/new-portrait.png", label: "PORTRAIT", scale: .82, x: -2, y: 3, mobileScale: .76, mobileY: 2 },
      { src: "/easter-egg/sprites/kotone/new-naginata.png", label: "NAGINATA", scale: .88, x: 1, y: 0, rotate: -.5, mobileScale: .82 },
      { src: "/easter-egg/sprites/kotone/new-chibi.webp", label: "CHIBI CUT", scale: .95, x: 0, y: 4, mobileScale: .88, mobileY: 4 },
      { src: "/easter-egg/sprites/kotone/new-visor.png", label: "VISOR", scale: .82, x: 1, y: 1, mobileScale: .76 },
    ],
    actionPose: {
      action: [1],
      finisher: [2, 5],
      victory: [4, 7],
      outtake: [6, 3],
    },
    voices: {
      action: ["/easter-egg/voice/kotone/ATTACK1FEMC.mp3"],
      finisher: ["/easter-egg/voice/kotone/FINISHER1FEMC.mp3"],
      victory: [
        "/easter-egg/voice/kotone/VICTORY1FEMC.mp3",
        "/easter-egg/voice/kotone/VICTORY2FEMC.mp3",
        "/easter-egg/voice/kotone/VICTORY3FEMC.mp3",
      ],
      outtake: [
        "/easter-egg/voice/kotone/DEFEAT1FEMC.mp3",
        "/easter-egg/voice/kotone/DEFEAT2FEMC.mp3",
      ],
    },
  },
  ren: {
    first: "REN",
    last: "AMAMIYA",
    side: "cyan",
    poses: [
      { src: "/easter-egg/sprites/ren/idle.webp", label: "IDLE", scale: 1.01, x: 1, y: 1, mobileScale: .96 },
      { src: "/easter-egg/sprites/ren/action-up.webp", label: "ACTION", scale: .98, x: 0, y: 2, rotate: .25, mobileScale: .92 },
      { src: "/easter-egg/sprites/ren/action-down.webp", label: "FINISHER", scale: .94, x: 1, y: 1, rotate: -.4, mobileScale: .89 },
      { src: "/easter-egg/sprites/ren/action-left.png", label: "VICTORY", scale: .95, x: 0, y: 0, mobileScale: .9 },
      { src: "/easter-egg/sprites/ren/new-spotlight.png", label: "SPOTLIGHT", scale: .78, x: 1, y: 1, mobileScale: .72 },
      { src: "/easter-egg/sprites/ren/new-poster.png", label: "POSTER CUT", scale: .80, x: 0, y: 2, mobileScale: .74, mobileY: 1 },
      { src: "/easter-egg/sprites/ren/new-slide.png", label: "GUN SLIDE", scale: .92, x: -1, y: 0, mobileScale: .86 },
      { src: "/easter-egg/sprites/ren/new-arsene.png", label: "ARSENE", scale: .86, x: 0, y: 0, mobileScale: .8 },
    ],
    actionPose: {
      action: [1, 6],
      finisher: [2, 7],
      victory: [3, 4],
      outtake: [5, 0],
    },
    voices: {
      action: [
        "/easter-egg/voice/ren/ATTACK1REN.mp3",
        "/easter-egg/voice/ren/ATTACK2REN.mp3",
        "/easter-egg/voice/ren/ATTACK3REN.mp3",
        "/easter-egg/voice/ren/ATTACK4REN.mp3",
      ],
      finisher: [
        "/easter-egg/voice/ren/FINISHER1REN.mp3",
        "/easter-egg/voice/ren/FINISHER2REN.mp3",
      ],
      victory: [
        "/easter-egg/voice/ren/VICTORY1REN.mp3",
        "/easter-egg/voice/ren/VICTORY2REN.mp3",
        "/easter-egg/voice/ren/VICTORY3REN.mp3",
        "/easter-egg/voice/ren/VICTORY4REN.mp3",
      ],
      outtake: [
        "/easter-egg/voice/ren/DEFEAT1REN.mp3",
        "/easter-egg/voice/ren/DEFEAT2REN.mp3",
        "/easter-egg/voice/ren/DEFEAT3REN.mp3",
        "/easter-egg/voice/ren/DEFEAT4REN.mp3",
        "/easter-egg/voice/ren/DEFEAT5REN.mp3",
        "/easter-egg/voice/ren/DEFEAT6REN.mp3",
        "/easter-egg/voice/ren/DEFEAT7REN.mp3",
      ],
    },
  },
};

const ACTIONS: Record<ActionKey, { label: string; sub: string; cue: string }> = {
  action: { label: "ACTION", sub: "CALL THE MOVE", cue: "ROLL" },
  finisher: { label: "FINISH", sub: "HERO TAKE", cue: "HOLD FRAME" },
  victory: { label: "WIN", sub: "KEEP ROLLING", cue: "PRINT IT" },
  outtake: { label: "OUTTAKE", sub: "CUT THE CAMERA", cue: "RESET" },
};

const ALL_ASSETS = Object.values(PEOPLE).flatMap((person) => [
  ...person.poses.map((pose) => pose.src),
  ...Object.values(person.voices).flat(),
]);

function makeActionCursor() {
  return {
    kotone: { action: 0, finisher: 0, victory: 0, outtake: 0 },
    ren: { action: 0, finisher: 0, victory: 0, outtake: 0 },
  } satisfies Record<Person, Record<ActionKey, number>>;
}

function poseStyle(pose: Pose): CSSProperties {
  return {
    "--pose-scale": pose.scale ?? 1,
    "--pose-x": `${pose.x ?? 0}%`,
    "--pose-y": `${pose.y ?? 0}%`,
    "--pose-rotate": `${pose.rotate ?? 0}deg`,
    "--pose-mobile-scale": pose.mobileScale ?? pose.scale ?? 1,
    "--pose-mobile-x": `${pose.mobileX ?? pose.x ?? 0}%`,
    "--pose-mobile-y": `${pose.mobileY ?? pose.y ?? 0}%`,
  } as CSSProperties;
}

export default function RenKotoneSecret() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [selected, setSelected] = useState<Person>("kotone");
  const [poseIndex, setPoseIndex] = useState<Record<Person, number>>({ kotone: 0, ren: 0 });
  const [previousPose, setPreviousPose] = useState<Record<Person, number | null>>({ kotone: null, ren: null });
  const [speaking, setSpeaking] = useState<Person | null>(null);
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);
  const [fxToken, setFxToken] = useState(0);
  const [status, setStatus] = useState("DIRECTOR READY // PICK A GUEST");

  const poseIndexRef = useRef<Record<Person, number>>({ kotone: 0, ren: 0 });
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioToken = useRef(0);
  const actionCursor = useRef(makeActionCursor());
  const phaseTimer = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);
  const poseTimers = useRef<Record<Person, number | null>>({ kotone: null, ren: null });
  const webAudioRef = useRef<AudioContext | null>(null);

  const mounted = phase !== "closed";

  const clearTimers = useCallback(() => {
    if (phaseTimer.current !== null) window.clearTimeout(phaseTimer.current);
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    for (const person of ["kotone", "ren"] as const) {
      if (poseTimers.current[person] !== null) window.clearTimeout(poseTimers.current[person]!);
      poseTimers.current[person] = null;
    }
    phaseTimer.current = null;
    settleTimer.current = null;
  }, []);

  const uiTone = useCallback((kind: UiCue) => {
    try {
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return;
      const ctx = webAudioRef.current ?? new AudioContextCtor();
      webAudioRef.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      const peak = kind === "select" ? .012 : kind === "action" ? .02 : kind === "finisher" ? .028 : kind === "victory" ? .022 : kind === "outtake" ? .018 : .035;
      const duration = kind === "select" ? .08 : kind === "open" || kind === "close" ? .28 : .18;
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      gain.connect(ctx.destination);
      const freqs: Record<UiCue, number[]> = {
        open: [180, 360, 720], close: [520, 260, 130], select: [620],
        action: [410, 820], finisher: [230, 460, 920], victory: [520, 780, 1040], outtake: [300, 150],
      };
      freqs[kind].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        osc.type = kind === "outtake" ? "square" : index % 2 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now + index * .035);
        osc.connect(gain);
        osc.start(now + index * .035);
        osc.stop(now + duration + .03);
      });
    } catch {

    }
  }, []);

  const stopVoice = useCallback(() => {
    audioToken.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setSpeaking(null);
  }, []);

  const changePose = useCallback((person: Person, next: number) => {
    const total = PEOPLE[person].poses.length;
    const normalized = (next + total) % total;
    const currentIndex = poseIndexRef.current[person];
    if (normalized === currentIndex) return;
    setPreviousPose((previous) => ({ ...previous, [person]: currentIndex }));
    poseIndexRef.current = { ...poseIndexRef.current, [person]: normalized };
    setPoseIndex(poseIndexRef.current);
    if (poseTimers.current[person] !== null) window.clearTimeout(poseTimers.current[person]!);
    poseTimers.current[person] = window.setTimeout(() => {
      setPreviousPose((previous) => ({ ...previous, [person]: null }));
      poseTimers.current[person] = null;
    }, SWAP_MS);
  }, []);

  const openSecret = useCallback(() => {
    clearTimers();
    stopVoice();
    setSelected("kotone");
    poseIndexRef.current = { kotone: 0, ren: 0 };
    setPoseIndex(poseIndexRef.current);
    setPreviousPose({ kotone: null, ren: null });
    setActiveAction(null);
    setStatus("PRIVATE CUT // CAMERA BOOT");
    setPhase("opening");
    uiTone("open");
    phaseTimer.current = window.setTimeout(() => {
      setPhase("active");
      setStatus("DIRECTOR READY // PICK A GUEST");
      phaseTimer.current = null;
    }, OPEN_MS);
  }, [clearTimers, stopVoice, uiTone]);

  const close = useCallback(() => {
    if (phase === "closed" || phase === "closing") return;
    clearTimers();
    stopVoice();
    setActiveAction(null);
    setStatus("THAT'S A WRAP // CUTTING CAMERA");
    setPhase("closing");
    uiTone("close");
    phaseTimer.current = window.setTimeout(() => {
      setPhase("closed");
      poseIndexRef.current = { kotone: 0, ren: 0 };
      setPoseIndex(poseIndexRef.current);
      setPreviousPose({ kotone: null, ren: null });
      phaseTimer.current = null;
    }, CLOSE_MS);
  }, [clearTimers, phase, stopVoice, uiTone]);

  const playAction = useCallback((person: Person, action: ActionKey) => {
    if (phase !== "active") return;
    stopVoice();
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    uiTone(action);
    setSelected(person);
    setSpeaking(person);
    setActiveAction(action);
    setFxToken((token) => token + 1);

    const data = PEOPLE[person];
    const cursor = actionCursor.current[person][action];
    actionCursor.current[person][action] += 1;
    const posePool = data.actionPose[action];
    const pose = posePool[cursor % posePool.length];
    changePose(person, pose);

    const voices = data.voices[action];
    const voiceIndex = cursor % voices.length;
    const actionLabel = action === "action" && person === "kotone" ? "BLUE SHOT" : ACTIONS[action].cue;
    setStatus(`${data.first} // ${actionLabel} // TAKE ${voiceIndex + 1}/${voices.length}`);

    const token = ++audioToken.current;
    const audio = new Audio(voices[voiceIndex]);
    audio.preload = "auto";
    audio.volume = .86;
    audioRef.current = audio;

    const finish = () => {
      if (audioToken.current !== token) return;
      if (audioRef.current === audio) audioRef.current = null;
      setSpeaking(null);
      settleTimer.current = window.setTimeout(() => {
        if (audioToken.current !== token) return;
        changePose(person, 0);
        setActiveAction(null);
        setStatus("DIRECTOR READY // PICK A GUEST");
        settleTimer.current = null;
      }, 320);
    };

    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    window.setTimeout(() => void audio.play().catch(finish), 35);
  }, [changePose, phase, stopVoice, uiTone]);

  const cyclePose = useCallback((person: Person, direction = 1) => {
    if (phase !== "active") return;
    stopVoice();
    uiTone("select");
    setSelected(person);
    setActiveAction(null);
    const total = PEOPLE[person].poses.length;
    const next = (poseIndexRef.current[person] + direction + total) % total;
    changePose(person, next);
    setStatus(`${PEOPLE[person].first} // LOOK ${String(next + 1).padStart(2, "0")}/${String(total).padStart(2, "0")} // ${PEOPLE[person].poses[next].label}`);
  }, [changePose, phase, stopVoice, uiTone]);

  const choosePose = useCallback((person: Person, next: number) => {
    if (phase !== "active") return;
    stopVoice();
    uiTone("select");
    setSelected(person);
    setActiveAction(null);
    changePose(person, next);
    setStatus(`${PEOPLE[person].first} // LOOK ${String(next + 1).padStart(2, "0")}/${String(PEOPLE[person].poses.length).padStart(2, "0")} // ${PEOPLE[person].poses[next].label}`);
  }, [changePose, phase, stopVoice, uiTone]);

  const moveParallax = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (phase !== "active" || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
    stageRef.current.style.setProperty("--mx", x.toFixed(3));
    stageRef.current.style.setProperty("--my", y.toFixed(3));
  }, [phase]);

  const resetParallax = useCallback(() => {
    stageRef.current?.style.setProperty("--mx", "0");
    stageRef.current?.style.setProperty("--my", "0");
  }, []);

  useEffect(() => {
    const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    const params = new URLSearchParams(location.search);
    if (local && params.get("afterHoursPreview") === "1") openSecret();
  }, [openSecret]);

  useEffect(() => {
    if (!mounted) return;
    for (const src of ALL_ASSETS) {
      if (/\.(?:png|webp)$/i.test(src)) {
        const image = new Image();
        image.decoding = "async";
        image.src = src;
      } else {
        const audio = new Audio();
        audio.preload = "metadata";
        audio.src = src;
      }
    }
  }, [mounted]);

  useEffect(() => {
    let index = 0;
    let started = 0;
    let confirmUntil = 0;

    const onPointerUp = (event: PointerEvent) => {
      if (mounted) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const now = performance.now();
      const letterEl = target.closest<SVGElement>("[data-valie-secret-letter]");

      if (letterEl) {
        const letter = letterEl.getAttribute("data-valie-secret-letter");
        if (!letter) return;
        if (!started || now - started > STEP_TIMEOUT) {
          index = 0;
          started = now;
        }
        if (letter === SECRET[index]) {
          index += 1;
          if (index === SECRET.length) {
            confirmUntil = now + CONFIRM_TIMEOUT;
            index = 0;
            started = 0;
          }
        } else {
          index = letter === SECRET[0] ? 1 : 0;
          started = index ? now : 0;
          confirmUntil = 0;
        }
        return;
      }

      if (target.closest("[data-valie-secret-confirm]") && confirmUntil > now) {
        confirmUntil = 0;
        openSecret();
      }
    };

    document.addEventListener("pointerup", onPointerUp, true);
    return () => document.removeEventListener("pointerup", onPointerUp, true);
  }, [mounted, openSecret]);

  useEffect(() => {
    if (!mounted) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unlock = lockDocumentScroll("ren-kotone-secret-12249");
    const restoreIsolation = overlayRef.current ? isolateDialog(overlayRef.current) : () => {};
    const frame = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));

    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (overlayRef.current) {
        trapTabKey(event, overlayRef.current);
      }
    };
    const visibility = () => document.hidden && stopVoice();
    addEventListener("keydown", keydown, true);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("keydown", keydown, true);
      document.removeEventListener("visibilitychange", visibility);
      restoreIsolation();
      unlock();
      stopVoice();
      restoreFocus(previousFocus.current);
    };
  }, [close, mounted, stopVoice]);

  useEffect(() => () => {
    clearTimers();
    stopVoice();
    if (webAudioRef.current) {
      void webAudioRef.current.close().catch(() => {});
      webAudioRef.current = null;
    }
  }, [clearTimers, stopVoice]);

  const backdrop = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase === "active" && event.target === event.currentTarget) close();
  };

  return (
    <>
      {mounted ? (
        <div
          ref={overlayRef}
          className="rk49-secret"
          data-phase={phase}
          data-selected={selected}
          data-action={activeAction ?? "none"}
          data-speaker={speaking ?? "none"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rk49-title"
          onPointerDown={backdrop}
        >
          {(phase === "opening" || phase === "closing") ? (
            <div className="rk49-curtain" aria-hidden="true"><i /><i /><i /></div>
          ) : null}

          {phase === "opening" ? (
            <div className="rk49-intro" aria-hidden="true">
              <div className="rk49-intro__ghosts"><img src={PEOPLE.kotone.poses[0].src} alt="" /><img src={PEOPLE.ren.poses[0].src} alt="" /></div>
              <span>CAMERA 02 // PRIVATE ROLL</span>
              <strong>AFTER <em>HOURS</em></strong>
              <small>DIRECTOR'S MONITOR // ROLLING</small>
            </div>
          ) : null}

          {phase === "closing" ? (
            <div className="rk49-outro" aria-hidden="true"><span>CAMERA OFFLINE</span><strong>THAT'S A <em>WRAP.</em></strong><small>PRIVATE REEL SAVED</small></div>
          ) : null}

          <section ref={stageRef} className="rk49-stage" onPointerMove={moveParallax} onPointerLeave={resetParallax}>
            <div className="rk49-stage__light rk49-stage__light--pink" aria-hidden="true" />
            <div className="rk49-stage__light rk49-stage__light--cyan" aria-hidden="true" />
            <div className="rk49-stage__grain" aria-hidden="true" />

            <button ref={closeRef} type="button" className="rk49-close" onClick={close} aria-label="Close After Hours secret">
              <span>×</span><small>WRAP</small>
            </button>

            <header className="rk49-header">
              <h2 id="rk49-title">AFTER <em>HOURS</em></h2>
              <p>Eight looks per guest. Call the take, change the frame, roll again.</p>
            </header>

            <div className="rk49-actors">
              {(["kotone", "ren"] as const).map((person) => {
                const data = PEOPLE[person];
                const pose = data.poses[poseIndex[person]];
                const previousIndex = previousPose[person];
                const previous = previousIndex === null ? null : data.poses[previousIndex];
                const isSelected = selected === person;
                const isSpeaking = speaking === person;
                const actionClass = isSelected && activeAction ? ` is-action-${activeAction}` : "";
                return (
                  <article key={person} className={`rk49-actor rk49-actor--${person}${isSelected ? " is-selected" : " is-muted"}${isSpeaking ? " is-speaking" : ""}${actionClass}`}>
                    <button type="button" className="rk49-actor__hit" onClick={() => { stopVoice(); setActiveAction(null); setSelected(person); uiTone("select"); }} aria-label={`Select ${data.first} ${data.last}`} />
                    <div className="rk49-actor__name"><b>{data.first}</b><span>{data.last}</span></div>
                    <div className="rk49-actor__frame"><i /><i /><i /><i /><span>CAM {person === "kotone" ? "A" : "B"}</span></div>
                    <div className="rk49-actor__shadow" aria-hidden="true" />
                    <div className="rk49-actor__portrait">
                      {previous ? <img className="rk49-pose rk49-pose--previous" src={previous.src} style={poseStyle(previous)} alt="" aria-hidden="true" /> : null}
                      <img className="rk49-pose rk49-pose--current" src={pose.src} style={poseStyle(pose)} alt={`${data.first} ${data.last} — ${pose.label}`} decoding="async" />
                    </div>
                    <div className="rk49-look">
                      <button type="button" onClick={() => cyclePose(person, -1)} aria-label={`Previous ${data.first} pose`}>‹</button>
                      <div className="rk49-look__readout"><small>LOOK {String(poseIndex[person] + 1).padStart(2, "0")} / {String(data.poses.length).padStart(2, "0")}</small><b>{pose.label}</b><div className="rk49-look__film">{data.poses.map((_, index) => <button key={index} type="button" className={index === poseIndex[person] ? "is-active" : ""} onClick={() => choosePose(person, index)} aria-label={`${data.first} look ${index + 1}`} />)}</div></div>
                      <button type="button" onClick={() => cyclePose(person, 1)} aria-label={`Next ${data.first} pose`}>›</button>
                    </div>
                  </article>
                );
              })}

              <div key={fxToken} className="rk49-fx" aria-hidden="true">
                <span className="rk49-fx__backwash" />
                <span className="rk49-fx__flash" />
                <span className="rk49-fx__shot" />
                <span className="rk49-fx__cards" />
                <span className="rk49-fx__slash" />
                <span className="rk49-fx__burst" />
                <span className="rk49-fx__front" />
                <strong className="rk49-fx__cut">CUT!</strong>
              </div>
            </div>

            <div className="rk49-console">
              <div className="rk49-console__status"><small>DIRECTOR MONITOR</small><strong aria-live="polite">{status}</strong></div>
              <div className="rk49-console__guest" aria-label="Choose guest">
                {(["kotone", "ren"] as const).map((person) => (
                  <button key={person} type="button" className={selected === person ? "is-active" : ""} onClick={() => { stopVoice(); setActiveAction(null); setSelected(person); uiTone("select"); }}>
                    <span>{PEOPLE[person].first}</span><small>{PEOPLE[person].last}</small>
                  </button>
                ))}
              </div>
              <div className="rk49-console__actions">
                {(Object.keys(ACTIONS) as ActionKey[]).map((action) => (
                  <button key={action} type="button" data-action={action} className={activeAction === action ? "is-live" : ""} onClick={() => playAction(selected, action)}>
                    <span>{ACTIONS[action].label}</span><small>{ACTIONS[action].sub}</small><i>{ACTIONS[action].cue}</i>
                  </button>
                ))}
              </div>
            </div>

            <footer className="rk49-footer"><span>VALIE // PRIVATE REEL</span><span>ESC TO WRAP · LOOK DOTS JUMP DIRECTLY TO ANY SPRITE</span></footer>
          </section>
        </div>
      ) : null}
    </>
  );
}

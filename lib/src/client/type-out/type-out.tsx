import { HTMLProps, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styles from "./type-out.module.scss";
import { Optional } from "@m2d/core/utils";
import { addAnimationListeners, setupTypingFX } from "./utils";

/**
 * Props for the TypeOut component.
 * Provides fine-grained control over typing behavior, repetition, and accessibility.
 */
interface DefaultTypeOutProps extends HTMLProps<HTMLDivElement> {
  children: ReactNode;

  /** Typing speed in characters per second. @default 20 */
  speed: number;

  /** Deletion speed in characters per second. @default 40 */
  delSpeed: number;

  /** Whether to hide the blinking cursor. @default false */
  noCursor: boolean;

  /** Whether to hide the blinking cursor after completing the anim. @default false */
  noCursorAfterAnimEnd: false;

  /** Sequence of steps (lines or phrases) to animate through. */
  steps: ReactNode[];

  /** Number of times to repeat the animation. @default Infinity */
  repeat: number;

  /** Whether to override user's reduced motion preference. @default false */
  force?: boolean;

  /** Controls whether the animation is paused. */
  paused: boolean;
}

const defaultTypeOutProps: DefaultTypeOutProps = {
  children: "",
  speed: 20,
  delSpeed: 40,
  noCursor: false,
  noCursorAfterAnimEnd: false,
  steps: [""],
  repeat: Infinity,
  force: false,
  paused: false,
};

export type TypeOutProps = Optional<DefaultTypeOutProps>;

const TypingAnimation = ({
  children,
  className,
  delSpeed,
  noCursor,
  noCursorAfterAnimEnd,
  repeat,
  speed,
  steps,
  style,
  paused,
  ...props
}: DefaultTypeOutProps) => {
  const [processing, setProcessing] = useState(true);
  const animatedSteps = useMemo(() => {
    const newSteps = children ? [...steps, children] : steps;
    if (newSteps.length < 2) newSteps.unshift("", "");
    return newSteps.map(setupTypingFX);
  }, [children, steps]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger animations on mount or changes
  useEffect(() => {
    if (!containerRef.current) return;
    setProcessing(true);

    const enqueue = (node: Element, els: Element[]) => {
      els.push(node);
      const el = node as HTMLElement;
      if (el.classList.contains(styles.hk)) el.style.setProperty("--n", "0");
      else if (el.classList.contains(styles.word)) {
        el.style.setProperty("--n", `${el.textContent?.length ?? 0}`);
        el.style.setProperty("--w", `${el.offsetWidth}px`);
      }
      Array.from(node.children).forEach(child => enqueue(child, els));
    };

    const elements: Element[][] = [];
    Array.from(containerRef.current.children).forEach(child => {
      const els: Element[] = [];
      enqueue(child, els);
      elements.push(els);
    });

    for (let i = 0; i < elements[0].length; i++) {
      const el = elements[0][i] as HTMLElement;
      const nextEl = elements[0][i + 1] as HTMLElement;
      const animListener = (e: AnimationEvent) => {
        e.stopPropagation();
        el.removeEventListener("animationend", animListener);
        el.style.width = el.style.getPropertyValue("--w");
        el.classList.remove(styles.type, styles.hk);

        // skipcq: JS-0354
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        nextEl
          ? nextEl.classList.add(styles.type)
          : (addAnimationListeners(elements as HTMLElement[][], repeat, noCursorAfterAnimEnd),
            el.classList.add(styles.del));
      };
      el.addEventListener("animationend", animListener);
    }

    requestAnimationFrame(() => elements[0][0].classList.add(styles.type));
    setProcessing(false);
  }, [animatedSteps, repeat, noCursorAfterAnimEnd]);

  // Respect pause and pause on visibility hidden
  useEffect(() => {
    if (paused) {
      containerRef.current?.classList.add(styles.paused);
      return () => null;
    }
    const handleVisibilityChange = () => {
      containerRef.current?.classList[document.visibilityState === "visible" ? "remove" : "add"](
        styles.paused,
      );
    };
    handleVisibilityChange();
    addEventListener("visibilitychange", handleVisibilityChange);
    return () => removeEventListener("visibilitychange", handleVisibilityChange);
  }, [paused]);

  return (
    <div
      {...props}
      className={[
        className,
        styles.typeout,
        processing ? styles.processing : "",
        noCursor ? "" : styles.cursor,
      ].join(" ")}
      ref={containerRef}
      // @ts-expect-error -- using custom CSS variables
      style={{ "--speed": speed, "--delSpeed": delSpeed, ...style }}
      data-testid="type-out">
      {animatedSteps.map((step, i) => (
        <div key={i} className={styles.hk}>
          {step}
        </div>
      ))}
    </div>
  );
};

/**
 * TypeOut component — main entry point.
 * Handles prefers-reduced-motion and conditional rendering.
 *
 * @example
 * ```tsx
 * <TypeOut steps={["Hello", "World"]} />
 * ```
 */
export const TypeOut = (props_: TypeOutProps) => {
  const { children, force, steps, ...props } = {
    ...defaultTypeOutProps,
    ...props_,
  };
  const [suppressAnimation, setSuppressAnimation] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleReducedMotion = () => setSuppressAnimation(motionQuery.matches);
    handleReducedMotion();
    motionQuery.addEventListener("change", handleReducedMotion);
    return () => motionQuery.removeEventListener("change", handleReducedMotion);
  }, []);

  return !force && suppressAnimation ? (
    <div {...props}>{steps[steps.length - 1] || children || steps[0]}</div>
  ) : (
    <TypingAnimation {...props} {...{ children, steps }} />
  );
};

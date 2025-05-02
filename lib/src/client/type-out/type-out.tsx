import { HTMLProps, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styles from "./type-out.module.scss";
import { Optional } from "@m2d/core/utils";

/**
 * Props for the TypeOut component.
 * Provides fine-grained control over typing behavior, repetition, and accessibility.
 */
export interface DefaultTypeOutProps extends HTMLProps<HTMLDivElement> {
  children: ReactNode;

  /** Typing speed in characters per second. @default 20 */
  speed: number;

  /** Deletion speed in characters per second. @default 40 */
  delSpeed: number;

  /** Whether to hide the blinking cursor. @default false */
  noCursor: boolean;

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
  steps: [""],
  repeat: Infinity,
  force: false,
  paused: false,
};

type TypeOutProps = Optional<DefaultTypeOutProps>;

/**
 * Wraps text nodes in <span> with classes and handles nested JSX structure.
 * Supports waiting durations as numeric values.
 */
const setupTypingFX = (children: ReactNode): ReactNode => {
  const handleNode = (node: ReactNode): ReactNode => {
    if (Array.isArray(node)) return node.map(handleNode);
    if (!node) return node;

    if (typeof node === "string") {
      return node
        .trim()
        .split(" ")
        .map(word => (
          <span className={styles.word} key={crypto.randomUUID()}>
            {word}&nbsp;
          </span>
        ));
    }

    // @ts-expect-error - TS doesn't know that node is an object with children
    if (typeof node === "object" && node.props?.children) {
      const {
        type: Tag,
        props: { children, className, ...props },
        // skipcq: JS-0323
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } = node as any;
      return (
        <Tag key={crypto.randomUUID()} className={[styles.hk, className].join(" ")} {...props}>
          {handleNode(children)}
        </Tag>
      );
    }

    if (typeof node === "number") {
      const [duration, reverseDuration] = node > 0 ? [node, 0] : [0, -node];
      return (
        <span
          key={crypto.randomUUID()}
          className={[styles.word, styles.wait].join(" ")}
          // @ts-expect-error -- custom css prop
          style={{ "--d": `${duration}ms`, "--r": `${reverseDuration}ms` }}>
          &nbsp;
        </span>
      );
    }

    /* v8 ignore next */
    return node;
  };
  return handleNode(children);
};

/**
 * Computes differing start index for each pair of steps to know what to animate.
 */
const compareSteps = (elements: HTMLElement[][]): number[] => {
  const stepStartIndices: number[] = [];
  for (let i = 0; i < elements.length; i++) {
    const currentStepEls = elements[i];
    const nextStepEls = elements[(i + 1) % elements.length];
    let j = 0;
    for (; j < currentStepEls.length && j < nextStepEls.length; j++) {
      const isCurrentStepWord = currentStepEls[j].classList.contains(styles.word);
      const isNextStepWord = nextStepEls[j].classList.contains(styles.word);
      if (
        !(
          isCurrentStepWord &&
          isNextStepWord &&
          currentStepEls[j].textContent === nextStepEls[j].textContent
        ) &&
        (isCurrentStepWord || isNextStepWord)
      ) {
        break;
      }
    }
    stepStartIndices.push(j);
  }
  return stepStartIndices;
};

/** Update element styles after type animation */
const updateAfterTypeAnim = (el: HTMLElement) => {
  el.style.width = el.style.getPropertyValue("--w");
  el.classList.remove(styles.type, styles.hk);
};

/** Update styles after del animation */
const updateAfterDelAnim = (el: HTMLElement) => {
  el.style.width = "0";
  el.classList.remove(styles.del);
  if (!el.classList.contains(styles.word)) el.classList.add(styles.hk);
};

/**
 * Handles the chain of animation listeners for typing + deleting effects across steps.
 */
const addAnimationListeners = (elements: HTMLElement[][], repeat: number) => {
  const stepStartIndices = compareSteps(elements);
  let iCheck = 0;
  while (iCheck < elements.length && elements[iCheck].length === stepStartIndices[iCheck]) iCheck++;

  // Return early if all steps are exactly same
  if (iCheck === elements.length) return;

  let repeatCount = 0;

  for (let i = 0; i < elements.length; i++) {
    for (let j = 1; j < elements[i].length; j++) {
      const el = elements[i][j];
      const nextEl = elements[i][j + 1];
      const prevEl = elements[i][j - 1];

      const animListener = (e: AnimationEvent) => {
        e.stopPropagation();
        if (el.classList.contains(styles.type)) {
          updateAfterTypeAnim(el);
          if (nextEl) nextEl.classList.add(styles.type);
          else if (i !== elements.length - 1 || repeatCount++ < repeat)
            el.classList.add(styles.del);
          else el.classList.add(styles.cursor);
        } else {
          updateAfterDelAnim(el);
          if (j === stepStartIndices[i]) {
            let i2 = (i + 1) % elements.length;
            while (elements[i2].length === stepStartIndices[i2]) i2 = (i2 + 1) % elements.length;
            const nextStepEls = elements[i2];
            for (let k = 0; k < j; k++) updateAfterTypeAnim(nextStepEls[k]);
            for (let k = 0; k < j; k++) updateAfterDelAnim(elements[i][k]);
            nextStepEls[j].classList.add(styles.type);
          } else if (prevEl) prevEl.classList.add(styles.del);
        }
      };
      el.addEventListener("animationend", animListener);
    }
  }
};

const TypingAnimation = ({
  children,
  className,
  delSpeed,
  noCursor,
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
          : (addAnimationListeners(elements as HTMLElement[][], repeat),
            el.classList.add(styles.del));
      };
      el.addEventListener("animationend", animListener);
    }

    requestAnimationFrame(() => elements[0][0].classList.add(styles.type));
    setProcessing(false);
  }, [animatedSteps, delSpeed, repeat, speed]);

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

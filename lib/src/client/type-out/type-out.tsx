import { HTMLProps, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styles from "./type-out.module.scss";
import { Optional } from "@m2d/core/utils";

export interface DefaultTypeOutProps extends HTMLProps<HTMLDivElement> {
  children: ReactNode;

  /**
   * Typing speed in characters per second
   * @default 30
   */
  speed: number;
  /**
   * Deleting speed in characters per second
   * @default 60
   */

  delSpeed: number;
  /**
   * Whether to hide the cursor
   * @default false
   */
  noCursor: boolean;

  /**
   * lines to show one after another
   */
  steps: ReactNode[];

  /**
   * number of times to repeat the steps
   * @default Infinity
   */
  repeat: number;
  /**
   * Whether to force the typing animation irrespective of `prefers-reduced-motion`
   * @default false
   */
  force?: boolean;
}

const defaultTypeOutProps: DefaultTypeOutProps = {
  children: "",
  speed: 30,
  delSpeed: 60,
  noCursor: false,
  steps: [""],
  repeat: Infinity,
  force: false,
};

type TypeOutProps = Optional<DefaultTypeOutProps>;

const setupTypingFX = (children: ReactNode): ReactNode => {
  const handleNode = (node: ReactNode): ReactNode => {
    if (Array.isArray(node)) return node.map(handleNode);
    // handle null, undefined, etc.
    if (!node) return node;
    if (typeof node === "string")
      return node.split(" ").map(word => (
        <span className={styles.word} key={crypto.randomUUID()}>
          {word}&nbsp;
        </span>
      ));
    // @ts-expect-error - TS doesn't know that node is an object with children
    if (typeof node === "object" && node.props.children) {
      const {
        // @ts-expect-error - TS doesn't know that node is an object with children
        type: Tag,
        // @ts-expect-error - TS doesn't know that node is an object with children
        props: { children, className, ...props },
      } = node;
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
          style={{ "--d": `${duration}ms`, "--r": `${reverseDuration}ms` }}
        />
      );
    }
    return node;
  };
  return handleNode(children);
};

/**
 * Compare steps and adjust durations
 */
const compareStepsAndAdjustDurations = (elements: HTMLElement[][]) => {
  for (let i = 0; i < elements.length; i++) {
    const currentStepEls = elements[i];
    const nextStepEls = elements[(i + 1) % elements.length];

    for (let j = 0; j < currentStepEls.length && j < nextStepEls.length; j++) {
      const isCurrentStepWord = currentStepEls[j].classList.contains(styles.word);
      const isNextStepWord = nextStepEls[j].classList.contains(styles.word);
      if (
        isCurrentStepWord &&
        isNextStepWord &&
        currentStepEls[j].textContent === nextStepEls[j].textContent
      ) {
        nextStepEls[j].classList.add(styles.t0);
        currentStepEls[j].classList.add(styles.d0);
      } else if (isCurrentStepWord || isNextStepWord) {
        break;
      }
    }
  }
};

/**
 * Add animation listeners
 */
const addAnimationListeners = (elements: HTMLElement[][], repeat: number) => {
  let repeatCount = 0;

  for (let i = 0; i < elements.length; i++) {
    for (let j = 0; j < elements[i].length; j++) {
      const el = elements[i][j] as HTMLElement;
      const nextEl = elements[i][j + 1] as HTMLElement | undefined;
      const prevEl = elements[i][j - 1] as HTMLElement | undefined;

      const animListener = (e: AnimationEvent) => {
        e.stopPropagation();
        if (el.classList.contains(styles.type)) {
          el.style.width = el.style.getPropertyValue("--w");
          el.classList.remove(styles.type);
          el.classList.remove(styles.hk);
          if (nextEl) nextEl.classList.add(styles.type);
          else {
            el.classList.add(styles.del);
          }
        } else {
          el.style.width = "0";
          el.classList.remove(styles.del);
          if (!el.classList.contains(styles.word)) el.classList.add(styles.hk);
          if (prevEl) prevEl.classList.add(styles.del);
          else if (i === elements.length - 1) {
            if (repeatCount < repeat) elements[0][0].classList.add(styles.type);
            repeatCount++;
          } else elements[i + 1][0].classList.add(styles.type);
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
  ...props
}: DefaultTypeOutProps) => {
  const [processing, setProcessing] = useState(true);
  const animatedSteps = useMemo(() => {
    const newSteps = children ? [children, ...steps] : steps;
    if (newSteps.length < 2) {
      newSteps.push("");
      newSteps.push("");
    }
    console.log(newSteps);
    return newSteps.map(setupTypingFX);
  }, [children, steps]);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    setProcessing(true);
    const enqueue = (node: Element, els: Element[]) => {
      els.push(node);
      const el = node as HTMLElement;
      if (node.classList.contains(styles.hk)) el.style.setProperty("--n", "0");
      else if (node.classList.contains(styles.word)) {
        const len = node.textContent?.length ?? 0;
        const width = el.offsetWidth;
        el.style.setProperty("--n", `${len}`);
        el.style.setProperty("--w", `${width}px`);
      }

      if (node.children.length) Array.from(node.children).forEach(child => enqueue(child, els));
    };
    const elements: Element[][] = [];
    Array.from(containerRef.current.children).forEach(child => {
      const els: Element[] = [];
      enqueue(child, els);
      elements.push(els);
    });

    // first step always starts from empty string
    for (let i = 0; i < elements[0].length; i++) {
      const el = elements[0][i] as HTMLElement;
      const nextEl = elements[0][i + 1] as HTMLElement;
      const animListener = (e: AnimationEvent) => {
        e.stopPropagation();
        el.removeEventListener("animationend", animListener);
        el.style.width = el.style.getPropertyValue("--w");
        el.classList.remove(styles.type);
        el.classList.remove(styles.hk);
        if (nextEl) nextEl.classList.add(styles.type);
        else {
          compareStepsAndAdjustDurations(elements as HTMLElement[][]);
          addAnimationListeners(elements as HTMLElement[][], repeat);
          el.classList.add(styles.del);
        }
      };
      el.addEventListener("animationend", animListener);
    }

    requestAnimationFrame(() => {
      elements[0][0].classList.add(styles.type);
    });

    setProcessing(false);
  }, [animatedSteps, delSpeed, repeat, speed]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      containerRef.current?.classList[document.visibilityState === "visible" ? "remove" : "add"](
        styles.pause,
      );
    };
    handleVisibilityChange();
    addEventListener("visibilitychange", handleVisibilityChange);
    return () => removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

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
 *
 *
 * @example
 * ```tsx
 * <TypeOut />
 * ```
 *
 * @source - Source code
 */
export const TypeOut = (props_: TypeOutProps) => {
  const { children, repeat, force, steps, ...props } = {
    ...defaultTypeOutProps,
    ...props_,
  };
  const [suppressAnimation, setSuppressAnimation] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleReducedMotion = () => setSuppressAnimation(motionQuery.matches);
    handleReducedMotion();
    motionQuery.addEventListener("change", handleReducedMotion);
    // skipcq: JS-0045
    return () => motionQuery.removeEventListener("change", handleReducedMotion);
  }, []);

  /**
   * Do not animate if prefers-reduced-motion
   */
  return !force && suppressAnimation ? (
    <div {...props}>{steps[steps.length - 1] || children || steps[0]}</div>
  ) : (
    <TypingAnimation {...props} {...{ children, steps, repeat }} />
  );
};

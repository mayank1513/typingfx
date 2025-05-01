import { HTMLProps, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styles from "./type-out.module.scss";
import { Optional } from "@m2d/core/utils";

export interface DefaultTypeOutProps extends HTMLProps<HTMLDivElement> {
  children: ReactNode;

  /**
   * Typing speed in characters per second
   * @default 60
   */
  speed: number;
  /**
   * Deleting speed in characters per second
   * @default 20
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
  speed: 60,
  delSpeed: 20,
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

    if (typeof node === "number")
      // @ts-expect-error -- custom css prop
      return <span key={crypto.randomUUID()} style={{ "--d": `${node}ms` }} />;
    return node;
  };
  return handleNode(children);
};

const TypingAnimation = ({
  children,
  speed,
  delSpeed,
  repeat,
  steps,
  className,
  noCursor,
  ...props
}: DefaultTypeOutProps) => {
  const [processing, setProcessing] = useState(true);
  const animatedSteps = useMemo(
    () => (children ? [children, ...steps] : steps).map(setupTypingFX),
    [children, steps],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    setProcessing(true);
    const enqueue = (node: Element, els: Element[]) => {
      els.push(node);
      const el = node as HTMLElement;
      if (node.classList.contains(styles.hk)) el.style.setProperty("--d", "0s");
      else if (node.classList.contains(styles.word)) {
        const len = node.textContent?.length ?? 0;
        const width = el.offsetWidth;
        el.style.setProperty("--d", `${len / speed}s`);
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

    // Compare steps and wire links
    let repeatCount = 0;

    for (const els of elements) {
      for (let j = 0; j < els.length - 1; j++) {
        const el = els[j] as HTMLElement;
        const nextEl = els[j + 1] as HTMLElement;
        el.addEventListener("animationend", e => {
          e.stopPropagation();
          el.style.width = el.style.getPropertyValue("--w");
          el.style.height = "auto";
          el.classList.remove(styles.type);
          el.classList.remove(styles.hk);
          nextEl.classList.add(styles.type);
        });
      }
    }

    requestAnimationFrame(() => {
      elements[0][0].classList.add(styles.type);
    });

    setProcessing(false);
  }, [animatedSteps, speed]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log("visibility changed", document.visibilityState);
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
   * Do not animate if repeat is 0 or negative
   */
  return (!force && suppressAnimation) || repeat < 1 ? (
    <div {...props}>{steps[steps.length - 1] || children || steps[0]}</div>
  ) : (
    <TypingAnimation {...props} {...{ children, steps, repeat }} />
  );
};

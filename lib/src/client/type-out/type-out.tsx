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
  cursor: boolean;
}

const defaultTypeOutProps: DefaultTypeOutProps = {
  children: "",
  speed: 30,
  cursor: true,
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
      return <span key={crypto.randomUUID()} style={{ "--d": `${node}ms` }}></span>;
    return node;
  };
  return handleNode(children);
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
  const { children, speed, className, cursor, ...props } = { ...defaultTypeOutProps, ...props_ };
  const [processing, setProcessing] = useState(true);
  const animatedJSX = useMemo(() => setupTypingFX(children), [children]);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    setProcessing(true);
    const elements: Element[] = [];
    const enqueue = (node: Element) => {
      elements.push(node);
      const el = node as HTMLElement;
      if (node.classList.contains(styles.hk)) el.style.setProperty("--d", "0s");
      else if (node.classList.contains(styles.word)) {
        const len = node.textContent?.length ?? 0;
        const width = el.offsetWidth;
        el.style.setProperty("--d", `${len / speed}s`);
        el.style.setProperty("--w", `${width}px`);
      }

      if (node.children.length) {
        Array.from(node.children).forEach(enqueue);
      }
    };
    Array.from(containerRef.current.children).forEach(enqueue);

    console.log("els ---- ", elements);

    for (let i = 0; i < elements.length - 1; i++) {
      const el = elements[i] as HTMLElement;
      const nextEl = elements[i + 1] as HTMLElement;
      elements[i].addEventListener("animationend", e => {
        e.stopPropagation();
        el.style.width = el.style.getPropertyValue("--w");
        el.style.height = "auto";
        el.classList.remove(styles.anim);
        el.classList.remove(styles.hk);
        nextEl.classList.add(styles.anim);
        console.log({ el, nextEl });
      });
    }

    requestAnimationFrame(() => {
      elements[0].classList.add(styles.anim);
    });

    setProcessing(false);
  }, [animatedJSX, speed]);
  return (
    <div
      {...props}
      className={[className, styles.typeout, processing ? styles.processing : ""].join(" ")}
      ref={containerRef}
      data-testid="type-out">
      {animatedJSX}
      <span className={styles.anim}></span>
    </div>
  );
};

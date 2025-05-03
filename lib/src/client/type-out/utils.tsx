import { isValidElement, ReactNode } from "react";
import styles from "./type-out.module.scss";

/**
 * Wraps text nodes in <span> with classes and handles nested JSX structure.
 * Supports waiting durations as numeric values.
 */
export const setupTypingFX = (children: ReactNode): ReactNode => {
  /** recursively setup the node */
  const handleNode = (node: ReactNode): ReactNode => {
    if (Array.isArray(node)) return node.map(handleNode);

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

    if (isValidElement(node)) {
      const { type: Tag, props } = node;
      const classNameObj =
        // @ts-expect-error props is unknown
        typeof Tag === "string" ? { className: [styles.hk, props.className].join(" ") } : {};
      // @ts-expect-error Tag has no call signature
      if (Tag instanceof Function) return handleNode(Tag(props));
      return (
        // @ts-expect-error props is unknown
        <Tag key={crypto.randomUUID()} {...props} {...classNameObj}>
          {/* @ts-expect-error props is unknown */}
          {handleNode(props.children)}
        </Tag>
      );
    }

    return node;
  };
  return handleNode(children);
};

/**
 * list elements and apply custom CSS vars
 */
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
/**
 * list elements and apply custom CSS vars
 */
export const listElements = (root: HTMLElement): HTMLElement[][] => {
  return Array.from(root.children).map(child => {
    const els: Element[] = [];
    enqueue(child, els);
    return els;
  }) as HTMLElement[][];
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
export const updateAfterTypeAnim = (el: HTMLElement) => {
  el.style.width = el.style.getPropertyValue("--w");
  el.classList.remove(styles.type, styles.hk);
};

/** Update styles after del animation */
export const updateAfterDelAnim = (el: HTMLElement) => {
  el.style.width = "0";
  el.classList.remove(styles.del);
  if (!el.classList.contains(styles.word)) el.classList.add(styles.hk);
};

/**
 * Handles the chain of animation listeners for typing + deleting effects across steps.
 */
export const addAnimationListeners = (
  elements: HTMLElement[][],
  repeat: number,
  noCursorAfterAnimEnd: boolean,
) => {
  const stepStartIndices = compareSteps(elements);
  let iCheck = 0;
  while (iCheck < elements.length && elements[iCheck].length === stepStartIndices[iCheck]) iCheck++;

  // Return early if all steps are exactly same
  if (iCheck === elements.length) return;

  let repeatCount = 0;

  for (let i = 0; i < elements.length; i++) {
    for (let j = 0; j < elements[i].length; j++) {
      const el = elements[i][j];
      const nextEl = elements[i][j + 1];
      const prevEl = elements[i][j - 1];

      el.onanimationend = (e: AnimationEvent) => {
        e.stopPropagation();
        if (el.classList.contains(styles.type)) {
          updateAfterTypeAnim(el);
          if (nextEl) nextEl.classList.add(styles.type);
          else if (i !== elements.length - 1 || repeatCount++ < repeat)
            el.classList.add(styles.del);
          else if (!noCursorAfterAnimEnd) el.classList.add(styles.cursor);
        } else {
          updateAfterDelAnim(el);
          if (
            (j === elements[i].length - 1 && elements[i].length === stepStartIndices[i]) ||
            j === stepStartIndices[i]
          ) {
            let i2 = (i + 1) % elements.length;
            while (elements[i2].length === stepStartIndices[i2]) i2 = (i2 + 1) % elements.length;
            if (i2 === i) i2 = (elements.length + i2 - 1) % elements.length;
            const nextStepEls = elements[i2];
            for (let k = 0; k < j; k++) updateAfterTypeAnim(nextStepEls[k]);
            for (let k = 0; k < j; k++) updateAfterDelAnim(elements[i][k]);
            nextStepEls[nextStepEls[j] ? j : j - 1].classList.add(styles.type);
          } else if (prevEl) prevEl.classList.add(styles.del);
        }
      };
    }
  }
};

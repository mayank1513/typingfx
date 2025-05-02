import { ReactNode } from "react";
import styles from "./type-out.module.scss";

/**
 * Wraps text nodes in <span> with classes and handles nested JSX structure.
 * Supports waiting durations as numeric values.
 */
export const setupTypingFX = (children: ReactNode): ReactNode => {
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

    // @ts-expect-error - TS doesn't know that node is an object with children
    if (typeof node === "object" && node?.props?.children) {
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
export const addAnimationListeners = (elements: HTMLElement[][], repeat: number) => {
  const stepStartIndices = compareSteps(elements);
  let iCheck = 0;
  while (iCheck < elements.length && elements[iCheck].length === stepStartIndices[iCheck]) iCheck++;

  // Return early if all steps are exactly same
  if (iCheck === elements.length) return;

  console.log({ stepStartIndices });

  let repeatCount = 0;

  for (let i = 0; i < elements.length; i++) {
    for (let j = 0; j < elements[i].length; j++) {
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
          if (
            (j === elements[i].length - 1 && elements[i].length === stepStartIndices[i]) ||
            j === stepStartIndices[i]
          ) {
            console.log("----------hk---------", { j });
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
      el.addEventListener("animationend", animListener);
    }
  }
};

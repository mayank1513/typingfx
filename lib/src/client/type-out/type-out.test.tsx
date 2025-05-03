import { render, screen } from "@testing-library/react";
import { TypeOut } from "./type-out"; // import the component
import { beforeAll, describe, it } from "vitest";
import styles from "./type-out.module.scss";
import {
  addAnimationListeners,
  listElements,
  updateAfterDelAnim,
  updateAfterTypeAnim,
} from "./utils";

const CustomComponent = () => <>Hi! I am from custom component</>;

describe("TypeOut Component", () => {
  // Test for Reduced Motion Preference
  it("should render last step without animation if prefers-reduced-motion is set to reduce", ({
    expect,
  }) => {
    const { container } = render(<TypeOut steps={["Hello World", "I am using TypingFX"]} />);
    expect(container.getElementsByClassName(styles.typeout).length).toBe(0);
  });

  // Test for Force Prop: Ensures animation is shown even with reduced motion preference
  it("should override reduced-motion and show animation when force is true", async ({ expect }) => {
    const { container } = render(
      <TypeOut
        steps={[
          "Hello World",
          "I am using TypingFX",
          <>
            <CustomComponent />
          </>,
        ]}
        paused
        force
        componentAnimation={{ wrapper: "div" }}
      />,
    );

    await screen.findByText("TypingFX");
    // Check if typing animation is applied even if reduced-motion is preferred
    expect(container.getElementsByClassName(styles.typeout).length).toBe(1);
  });

  // Test cursor behavior
  it("should hide cursor when noCursor is true", ({ expect }) => {
    render(
      <TypeOut
        steps={[
          <>
            Hello{500}
            <CustomComponent />
          </>,
          "How are you",
        ]}
        noCursor
        speed={10}
        delSpeed={20}
        force
        repeat={4}
      />,
    );

    const container = screen.getByTestId("type-out");

    // Check that the cursor class is not present
    expect(container.classList).not.toContain(styles.cursor);
  });
});

describe.concurrent("Utils", () => {
  let list: HTMLElement[][];
  let typeOutEl: HTMLElement;
  beforeAll(() => {
    const { container } = render(<TypeOut steps={["Hello World", "I am using TypingFX"]} force />);
    typeOutEl = container.getElementsByClassName(styles.typeout)[0] as HTMLElement;
    list = listElements(typeOutEl);
  });

  it("listElements", ({ expect }) => {
    expect(list.length).not.toBe(0);
  });

  it("addAnimationListeners", ({ expect }) => {
    addAnimationListeners(list, 1, false);
    expect(list[0][0].classList).toContain(styles.hk);
    updateAfterTypeAnim(list[0][0]);
    expect(list[0][0].classList).not.toContain(styles.hk);
    updateAfterDelAnim(list[0][0]);
    expect(list[0][0].classList).toContain(styles.hk);
  });
});

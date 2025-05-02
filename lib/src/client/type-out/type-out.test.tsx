import { act, render, screen, waitFor } from "@testing-library/react";
import { TypeOut } from "./type-out"; // import the component
import { describe, expect, it, vi } from "vitest";
import styles from "./type-out.module.scss";

describe("TypeOut Component", () => {
  // Test for Reduced Motion Preference
  it("should render last step without animation if prefers-reduced-motion is set to reduce", ({
    expect,
  }) => {
    const { container } = render(<TypeOut steps={["Hello World", "I am using TypingFX"]} />);
    expect(container.getElementsByClassName(styles.typeout).length).toBe(0);
  });

  // Test for Force Prop: Ensures animation is shown even with reduced motion preference
  it("should override reduced-motion and show animation when force is true", () => {
    const { container } = render(<TypeOut steps={["Hello World", "I am using TypingFX"]} force />);
    // Check if typing animation is applied even if reduced-motion is preferred
    expect(container.getElementsByClassName(styles.typeout).length).toBe(1);
  });

  // Test cursor behavior
  it("should hide cursor when noCursor is true", ({ expect }) => {
    render(
      <TypeOut
        steps={[<>Hello{500}</>, "How are you"]}
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

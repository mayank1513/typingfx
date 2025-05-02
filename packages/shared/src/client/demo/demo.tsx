"use client";

import { TypeOut } from "typingfx";
import styles from "./demo.module.scss";
import { useState } from "react";

const steps = [
  <div key={1}>
    Hare <span style={{ color: "green" }}>Krishna</span> Hare Krishna Hare Krishna
    <p>Hare Krishna</p>
    <p>{3000}Hare Rama</p>
  </div>,
  3000,
  <p key={2}>Hare Krishna {3000} Hare Krishna Krishna Krishna Hare Hare</p>,
  <p key={3}>Hare Krishna Hare Krishna Hare Rama Hare Rama</p>,
];

/** React live demo */
export function Demo() {
  const [paused, setPaused] = useState(false);
  return (
    <div className={styles.demo}>
      <button onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</button>
      <TypeOut paused={paused} steps={steps} repeat={1}>
        Hari Hari
      </TypeOut>
    </div>
  );
}

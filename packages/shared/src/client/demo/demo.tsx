"use client";

import { TypeOut } from "typingfx";
import styles from "./demo.module.scss";

/** React live demo */
export function Demo() {
  return (
    <div className={styles.demo}>
      <TypeOut
        steps={[
          <p>Hare Krishna Hare Krishna Hare Krishna</p>,
          <p>Hare Krishna Hare Krishna Krishna Krishna Hare Hare</p>,
          <p>Hare Krishna, Hare Rama</p>,
        ]}></TypeOut>
    </div>
  );
}

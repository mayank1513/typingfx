"use client";

import { TypeOut } from "typingfx";
import styles from "./demo.module.scss";

/** React live demo */
export function Demo() {
  return (
    <div className={styles.demo}>
      <TypeOut
        steps={[
          <p key={1}>
            Hare <span style={{ color: "green" }}>Krishna</span> Hare Krishna Hare Krishna
          </p>,
          <p key={2}>Hare Krishna Hare Krishna Krishna Krishna Hare Hare</p>,
          <p key={3}>Hare Krishna Hare Krishna Hare Rama Hare Rama</p>,
        ]}></TypeOut>
    </div>
  );
}

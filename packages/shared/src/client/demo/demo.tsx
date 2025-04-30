"use client";

import { TypeOut } from "typingfx";
import styles from "./demo.module.scss";

/** React live demo */
export function Demo() {
  return (
    <div className={styles.demo}>
      <TypeOut>
        <p>Hare Krishna Hare Krishna</p>
        <p style={{ color: "red" }}>Krishna Krishna Hare Hare</p>
        {2500}
        <p>
          Hare Rama Hare Rama <br />
          Rama Rama Hare Hare
        </p>
      </TypeOut>
    </div>
  );
}

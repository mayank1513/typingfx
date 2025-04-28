"use client";

import { TypeOut } from "typingfx";
import styles from "./demo.module.scss";

/** React live demo */
export function Demo() {
  return (
    <div className={styles.demo}>
      <TypeOut>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl quis ultricies
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl quis ultricies
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl quis ultricies
        </p>
      </TypeOut>
    </div>
  );
}

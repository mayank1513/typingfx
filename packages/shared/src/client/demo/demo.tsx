"use client";

import { TypeOut } from "typingfx";
import styles from "./demo.module.scss";
import { useEffect, useMemo, useState } from "react";

const steps = [
  <div key={0}>Hare</div>,
  <div key={1}>
    Hare <span style={{ color: "green" }}>Krishna</span> Hare Krishna Hare Krishna
    <p>Hare Krishna</p>
    <p>{3000}Hare Rama</p>
  </div>,
  <p key={2}>Hare Krishna {3000} Hare Krishna Krishna Krishna Hare Hare</p>,
  <p key={3}>Hare Krishna Hare Krishna Hare Rama Hare Rama</p>,
];

/** React live demo */
export function Demo() {
  const [paused, setPaused] = useState(false);
  const [user, setUser] = useState<{ name: string }>();
  useEffect(() => {
    setTimeout(() => {
      // setUser({ name: "Mayank" });
    }, 3000);
  }, []);
  const welcome = useMemo(
    () => (
      <>
        {1000}Welcome <i>{`${user?.name},`}</i> {500}How can I help you?{-3000}
      </>
    ),
    [user],
  );
  return (
    <div className={styles.demo}>
      <button onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</button>
      <TypeOut paused={paused} repeat={3}>
        {welcome}
      </TypeOut>
    </div>
  );
}

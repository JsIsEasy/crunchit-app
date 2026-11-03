import Image from "next/image";
import React from "react";
import styles from "./logo.module.css";

export function Logo() {
  return (
    <span className={styles.logo}>
      <Image
        src="/brand/mark.svg"
        alt=""
        width={38}
        height={36}
        className={styles.mark}
      />
      <span className={styles.wordmark}>CrunchIt</span>
    </span>
  );
}

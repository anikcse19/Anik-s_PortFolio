"use client";
import React, { useState } from "react";
import confetti from "canvas-confetti";
import { IoMdCopy } from "react-icons/io";

const ConfettiButton = () => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 10000);
    if (!copied) {
      await navigator.clipboard.writeText("anikdebcse@gmail.com");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          y: 0.6,
        },
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "black",
        color: "white",
        // border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        border: ".5px solid white",
      }}
    >
      {!copied && <IoMdCopy className="flex " />}
      {copied ? "copied!" : "Copy my email"}
    </button>
  );
};

export default ConfettiButton;

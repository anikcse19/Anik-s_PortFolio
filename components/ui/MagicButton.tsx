"use client";
import React from "react";
import { IconClipboard } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export const MagicButton = ({
  title,
  icon,
  position,
  handleClick,
  otherClasses,
  from,
}: {
  title?: string;
  icon: React.ReactNode;
  position: string;
  handleClick?: () => void;
  otherClasses?: string;
  from?: string;
}) => {
  if (from == "resume") {
    return (
      <button className="relative outline-none inline-flex h-12 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex gap-2 h-full w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 px-3 py-1 text-sm font-medium text-slate-400 backdrop-blur-3xl">
          {position == "left" && icon}
          {title}
          {position == "right" && icon}
        </span>
      </button>
    );
  }
  return (
    // Button code
    <button className="inline-flex gap-2 h-12 animate-shimmer items-center justify-center outline-none rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
      {position == "left" && icon}
      {title}
      {position == "right" && icon}
    </button>
  );
};

// Button code

// tailwind.config.js code

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dark" | "gradient";
  gradient?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = "default",
  gradient,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl transition-all duration-300",
        variant === "default" && "glass",
        variant === "dark" && "glass-dark",
        variant === "gradient" && "p-[1px]",
        onClick && "cursor-pointer hover:translate-y-[-4px]",
        className
      )}
      style={
        variant === "gradient" && gradient
          ? {
              background: gradient,
            }
          : undefined
      }
    >
      {variant === "gradient" ? (
        <div className="bg-[#0f0f23]/90 backdrop-blur-xl rounded-2xl p-6 h-full">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

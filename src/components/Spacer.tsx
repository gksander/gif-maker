import * as React from "react";

export const Spacer: React.FC<{
  size?: "sm" | "base" | "lg" | "xl";
}> = ({ size = "base" }) => {
  const hClass = (() => {
    if (size === "sm") return "h-2";
    if (size === "base") return "h-4";
    if (size === "lg") return "h-6";
    if (size === "xl") return "h-8";
  })();
  return <div className={`bg-transparent ${hClass}`} />;
};

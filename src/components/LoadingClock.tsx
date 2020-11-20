import * as React from "react";
import { motion } from "framer-motion";

// Config
const R = 256;
const tickBackoff = 25;
const tickL = 25;
const R1 = R - tickBackoff - tickL;
const R2 = R - tickBackoff;
const $2PI = 2 * Math.PI;
const totalDuration = 14;
const hourNumbers = Array.from({ length: 12 }).map((_, i) => i);

// Animation
const origin = { originX: "256px", originY: "256px" };

/**
 * Loading clock
 */
export const LoadingClock: React.FC<{ color?: string }> = ({
  color = "black",
}) => {
  return (
    <svg
      width="100%"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary-700"
    >
      <circle
        cx="256"
        cy="256"
        r="248"
        className="stroke-current"
        fill="transparent"
        strokeWidth="16"
      />
      {hourNumbers.map(i => {
        const x1 = R + R1 * Math.cos((i / 12) * $2PI);
        const y1 = R + R1 * Math.sin((i / 12) * $2PI);
        const x2 = R + R2 * Math.cos((i / 12) * $2PI);
        const y2 = R + R2 * Math.sin((i / 12) * $2PI);
        return (
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            key={i}
            stroke="rgb(120,120,120)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        );
      })}

      {/* Big hand */}
      <motion.path
        d="M251.362 32.2065C251.833 23.9312 261.167 23.9311 261.638 32.2065L271.986 213.803C272.207 217.689 269.843 221 266.847 221H246.153C243.157 221 240.793 217.689 241.014 213.803L251.362 32.2065Z"
        className="fill-current"
        style={{ ...origin }}
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: totalDuration / 12,
          repeat: Infinity,
        }}
      />
      {/* Little hand */}
      <motion.path
        d="M253.019 99.0104C253.339 93.6632 259.661 93.6632 259.981 99.0104L266.99 216.349C267.14 218.86 265.539 221 263.51 221H249.49C247.461 221 245.86 218.86 246.01 216.349L253.019 99.0104Z"
        className="fill-current"
        style={{ ...origin }}
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: totalDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M256 310C285.823 310 310 285.823 310 256C310 226.177 285.823 202 256 202C226.177 202 202 226.177 202 256C202 285.823 226.177 310 256 310ZM256 282C270.359 282 282 270.359 282 256C282 241.641 270.359 230 256 230C241.641 230 230 241.641 230 256C230 270.359 241.641 282 256 282Z"
        className="fill-current"
      />
    </svg>
  );
};

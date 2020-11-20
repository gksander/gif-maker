import * as React from "react";
import { motion, Variants } from "framer-motion";

const variants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    // scale: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    // scale: 0.9,
    transition: { duration: 0.3 },
  },
};

export const PageWrapper: React.FC = ({ children }) => {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="transition-all duration-150"
    >
      {children}
    </motion.div>
  );
};

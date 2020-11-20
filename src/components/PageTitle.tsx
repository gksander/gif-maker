import * as React from "react";
import { motion } from "framer-motion";

export const PageTitle: React.FC = ({ children }) => {
  return (
    <motion.div
      className="text-3xl font-bold"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      {children}
    </motion.div>
  );
};

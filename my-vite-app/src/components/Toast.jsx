import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, 2800);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`op-toast op-toast-${type}`}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;

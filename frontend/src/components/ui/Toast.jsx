import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-6 right-6 z-50 font-poppins"
        >
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
            ${type === 'success' ? 'bg-success/10 border border-success/20 text-success' : 'bg-red-500/10 border border-red-500/20 text-red-500'}
            backdrop-blur-md
          `}>
            {type === 'success' ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
            <span className="text-sm font-medium pr-4">{message}</span>
            <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
              <FiX size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

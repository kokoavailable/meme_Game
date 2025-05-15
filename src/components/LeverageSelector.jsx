import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LEVERAGE_MSG = {
  1: "씹게이",
  10: "가자 브로",
  50: "진짜..?",
  100: "와우 핫가이!🔥"
};

const LeverageSelector = ({ leverage, setLeverage }) => {
  const options = [1, 10, 50, 100];
  const [showMsg, setShowMsg] = useState(null);
  const timeoutRef = useRef();

  const handleClick = (option) => {
    setLeverage(option);
    setShowMsg(option);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowMsg(null), 1100);
  };

  // 언마운트 시 타이머 정리 (메모리 누수 방지)
  React.useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center gap-2">
        {options.map(option => (
          <button
            key={option}
            onClick={() => handleClick(option)}
            className={`inline-flex items-center gap-1 whitespace-nowrap font-sans font-bold
              px-4 py-2 rounded-lg transition-colors
              ${leverage === option
                ? "bg-green-600 text-white shadow"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"}
            `}
            style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            {option}x{option === 100 && <span className="ml-1">🔥</span>}
          </button>
        ))}
      </div>
      <div className="h-7 flex items-center justify-center mt-2 relative" style={{ minHeight: 28 }}>
        <AnimatePresence>
          {showMsg && (
            <motion.div
              key={showMsg}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="absolute w-full text-center text-xs font-bold text-green-600 pointer-events-none"
            >
              {LEVERAGE_MSG[showMsg]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LeverageSelector;

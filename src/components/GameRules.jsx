import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
const GameRules = ({ leverage }) => {
  const [open, setOpen] = useState(false);
  const leverageRules = {
    1: { profit: "10%", stopLoss: "-55%", rekt: "-100%", fomo: "-15%" },
    10: { profit: "200%", stopLoss: "-40%", rekt: "-30%", fomo: "-10%" },
    50: { profit: "400%", stopLoss: "-25%", rekt: "-10%", fomo: "-10%" },
    100: { profit: "800%", stopLoss: "-10%", rekt: "-5%", fomo: "-10%" }
  };
  return (
    <div className="bg-white bg-opacity-10 rounded-lg p-4 mt-8">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpen(!open)}>
        <h3 className="text-lg font-bold">게임 규칙</h3>
        <ChevronDown size={20} className={`transform transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="mt-4">
          <p className="mb-2">이곳은 현실이 아닙니다. 레버리지가 높을수록 행복합니다!</p>
          <p className="mb-4">현재 레버리지 ({leverage}x) 결과표:</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2">결과</th>
                <th className="text-right pb-2">변동률</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(leverageRules[leverage]).map(([key, value]) => (
                <tr key={key} className="border-b border-opacity-20">
                  <td className="py-2">{key}</td>
                  <td className={`text-right py-2 ${value.startsWith("-") ? "text-red-500" : "text-green-500"}`}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default GameRules;

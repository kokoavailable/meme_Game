import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
const GameHistory = ({ history }) => {
  const [open, setOpen] = useState(false);
  if (!history.length) return null;
  const labels = { profit: "익절 🚀", stopLoss: "손절 📉", rekt: "청산 💀", fomo: "FOMO 😔" };
  return (
    <div className="bg-white bg-opacity-10 rounded-lg p-4 mt-6">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpen(!open)}>
        <h3 className="text-lg font-bold">거래 내역</h3>
        <ChevronDown size={20} className={`transform transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2">레버리지</th>
                <th className="text-left pb-2">결과</th>
                <th className="text-right pb-2">변동률</th>
                <th className="text-right pb-2">자본금</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} className="border-b border-opacity-20">
                  <td className="py-2">{item.leverage}x</td>
                  <td className="py-2">{labels[item.outcome]}</td>
                  <td className={`text-right py-2 ${item.resultPercent > 0 ? "text-green-500" : "text-red-500"}`}>
                    {item.resultPercent > 0 ? "+" : ""}{item.resultPercent}%
                  </td>
                  <td className="text-right py-2">{item.newBalance.toFixed(2)}$</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default GameHistory;

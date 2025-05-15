import React from "react";
const ResultDisplay = ({ result, resultMessage, memeAsset, balance }) => {
  if (!memeAsset) return null;
  const resultStyles = {
    profit: "bg-green-100 border-green-500 text-green-700",
    stopLoss: "bg-yellow-100 border-yellow-500 text-yellow-700",
    rekt: "bg-red-100 border-red-500 text-red-700",
    fomo: "bg-purple-100 border-purple-500 text-purple-700"
  };
  const resultLabels = {
    profit: "익절 (TO THE MOON)! 🚀",
    stopLoss: "손절 (Stop Loss)... 📉",
    rekt: "청산 (REKT)! 💀",
    fomo: "FOMO (현타)... 😔"
  };
  return (
    <div className={`mt-6 p-4 border-2 rounded-lg ${resultStyles[result]}`}>
      <h3 className="text-xl font-bold mb-2">{resultLabels[result]}</h3>
      <div className="flex flex-col items-center">
        <img src={memeAsset.img} alt="meme" className="w-48 h-48 object-cover rounded-lg mb-4" />
        <p className="text-center text-lg font-bold mb-2">{memeAsset.text}</p>
        <p className="text-lg">{resultMessage}</p>
        <p className="mt-2">현재 자본금: {balance.toFixed(2)}$</p>
      </div>
    </div>
  );
};
export default ResultDisplay;
import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import LeverageSelector from "./components/LeverageSelector";
import RouletteWheel from "./components/RouletteWheel";
import ResultDisplay from "./components/ResultDisplay";
import GameRules from "./components/GameRules";
import GameHistory from "./components/GameHistory";

const MemeCoinGame = () => {
  const [balance, setBalance] = useState(100);
  const [leverage, setLeverage] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [highScore, setHighScore] = useState(100);
  const [showResults, setShowResults] = useState(false);
  const [memeAsset, setMemeAsset] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [spinSpeed, setSpinSpeed] = useState(10);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const spinnerRef = useRef(null);
  const spinIntervalRef = useRef(null);

  // leverage settings & meme assets kept the same
  const leverageSettings = {
    1: {
      probabilities: { profit: 15, stopLoss: 30, rekt: 45, fomo: 10 },
      results: { profit: 10, stopLoss: -55, rekt: -100, fomo: -15 }
    },
    10: {
      probabilities: { profit: 40, stopLoss: 25, rekt: 25, fomo: 10 },
      results: { profit: 200, stopLoss: -40, rekt: -30, fomo: -10 }
    },
    50: {
      probabilities: { profit: 70, stopLoss: 10, rekt: 10, fomo: 10 },
      results: { profit: 400, stopLoss: -25, rekt: -10, fomo: -10 }
    },
    100: {
      probabilities: { profit: 85, stopLoss: 5, rekt: 5, fomo: 5 },
      results: { profit: 800, stopLoss: -10, rekt: -5, fomo: -10 }
    }
  };

  const memeAssets = {
    profit: [
      { img: "/api/placeholder/200/200", sound: "rocket-launch", text: "도지 로켓 🚀 TO THE MOON!" },
      { img: "/api/placeholder/200/200", sound: "cash-sound", text: "페페 돈다발 💰 WAGMI!" },
      { img: "/api/placeholder/200/200", sound: "car-engine", text: "람보르기니 언제 살거야? 🏎️" }
    ],
    stopLoss: [
      { img: "/api/placeholder/200/200", sound: "sigh", text: "슬픈 페페 😢 Cut Loss..." },
      { img: "/api/placeholder/200/200", sound: "paper-rip", text: "Paper Hands 📄🙌" },
      { img: "/api/placeholder/200/200", sound: "sadge", text: "Sadge... 아깝다" }
    ],
    rekt: [
      { img: "/api/placeholder/200/200", sound: "bankruptcy", text: "운지 페페 👆 REKT!" },
      { img: "/api/placeholder/200/200", sound: "scream", text: "멘붕 페페 🤯 파산!" },
      { img: "/api/placeholder/200/200", sound: "gong", text: "거지 구걸 🧎‍♂️ 망했어요..." }
    ],
    fomo: [
      { img: "/api/placeholder/200/200", sound: "bus-sound", text: "지금 사도 되나요? 🚌 버스 떠남..." },
      { img: "/api/placeholder/200/200", sound: "laugh", text: "I missed the pump 😭" },
      { img: "/api/placeholder/200/200", sound: "sigh", text: "창밖 부자 구경 중 👀" }
    ],
    legendary: [
      { img: "/api/placeholder/200/200", sound: "legendary", text: "전설의 100배 익절! 🌕 GODMODE!" }
    ]
  };

  const getSegmentByAngle = (rotation, config) => {
    const wedgeKeys = ["profit", "stopLoss", "rekt", "fomo"];
    const wedges = wedgeKeys.map(key => ({
      key,
      value: config[key]
    }));
  
    let current = 0;
    const segments = wedges.map(({ key, value }) => {
      const start = (current + 270) % 360;
      const end = (start + value * 3.6) % 360;
      current += value * 3.6;
      return { key, start, end };
    });
  
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const arrowAngle = (270 - normalizedRotation + 360) % 360;
  
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const isLast = i === segments.length - 1;
  
      if (seg.start < seg.end) {
        if (
          (arrowAngle >= seg.start && arrowAngle < seg.end) ||
          (isLast && arrowAngle === seg.end)
        ) return seg.key;
      } else {
        if (
          arrowAngle >= seg.start || arrowAngle < seg.end ||
          (isLast && arrowAngle === seg.end)
        ) return seg.key;
      }
    }
  
    return null;
  };
  

  const calculateResult = () => {
    const probs = leverageSettings[leverage].probabilities;
    const rand = Math.random() * 100;
    if (rand < probs.profit) return "profit";
    if (rand < probs.profit + probs.stopLoss) return "stopLoss";
    if (rand < probs.profit + probs.stopLoss + probs.rekt) return "rekt";
    return "fomo";
  };

  const startSpin = () => {
    if (balance <= 0) return;
    setIsSpinning(true);
    setShowResults(false);
    setMemeAsset(null);
    let rotation = currentRotation;
    spinIntervalRef.current = setInterval(() => {
      rotation += spinSpeed;
      setCurrentRotation(rotation);
    }, 16);
    setSpinSpeed(10 + Math.random() * 5);
  };

  const stopSpin = () => {
    clearInterval(spinIntervalRef.current);
    const probs = leverageSettings[leverage].probabilities;
    const outcome = getSegmentByAngle(currentRotation % 360, probs);
    const resultPercent = leverageSettings[leverage].results[outcome];
    const changeAmount = balance * (resultPercent / 100);
    const newBalance = Math.max(0, balance + changeAmount);
    const isLegendary = leverage === 100 && outcome === "profit";
    setResult(outcome);
    setResultMessage(`${resultPercent > 0 ? "+" : ""}${resultPercent}% (${changeAmount.toFixed(2)}$)`);
    const assets = isLegendary ? memeAssets.legendary : memeAssets[outcome];
    setMemeAsset(assets[Math.floor(Math.random() * assets.length)]);
    setBalance(newBalance);
    if (newBalance > highScore) setHighScore(newBalance);
    setGameHistory(prev => [{
      id: Date.now(), leverage, outcome, resultPercent, prevBalance: balance, newBalance
    }, ...prev].slice(0, 10));
    setTimeout(() => {
      setShowResults(true);
      setIsSpinning(false);
    }, 500);
  };

  const resetBalance = () => {
    setBalance(100);
    setShowResults(false);
    setMemeAsset(null);
    setResult(null);
  };

  useEffect(() => () => clearInterval(spinIntervalRef.current), []);

  const themeColors = isDarkTheme
    ? { bg: "bg-green-900", text: "text-gray-100" }
    : { bg: "bg-yellow-100", text: "text-gray-900" };

  return (
    <div className={`min-h-screen ${themeColors.bg} ${themeColors.text} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <Header
          balance={balance}
          highScore={highScore}
          toggleTheme={() => setIsDarkTheme(!isDarkTheme)}
          toggleSound={() => setIsMuted(!isMuted)}
          isDarkTheme={isDarkTheme}
          isMuted={isMuted}
        />
        <div className="max-w-md mx-auto mt-8">
          <LeverageSelector leverage={leverage} setLeverage={setLeverage} />
          <div className="relative mt-8">
            <RouletteWheel
              spinnerRef={spinnerRef}
              rotation={currentRotation}
              leverage={leverage}
            />
            <div className="mt-6 flex justify-center gap-4">
              {!isSpinning ? (
                <button
                  onClick={startSpin}
                  disabled={balance <= 0}
                  className={`px-6 py-3 rounded-lg font-bold text-white ${
                    balance <= 0 ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
                  } transition-colors`}
                >
                  올인! ({balance.toFixed(2)}$)
                </button>
              ) : (
                <button
                  onClick={stopSpin}
                  className="px-6 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  멈추기!
                </button>
              )}
              <button
                onClick={resetBalance}
                className="px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                리셋
              </button>
            </div>
          </div>
          {showResults && (
            <ResultDisplay
              result={result}
              resultMessage={resultMessage}
              memeAsset={memeAsset}
              balance={balance}
            />
          )}
          <GameRules leverage={leverage} />
          <GameHistory history={gameHistory} />
        </div>
      </div>
    </div>
  );
};
export default MemeCoinGame;
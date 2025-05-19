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
  const [selectedSegment, setSelectedSegment] = useState(null);
  const spinnerRef = useRef(null);
  const spinIntervalRef = useRef(null);

  // 레버리지별 설정 - RouletteWheel 컴포넌트와 동일한 확률 사용
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
      probabilities: { profit: 40, stopLoss: 25, rekt: 25, fomo: 10 },
      results: { profit: 400, stopLoss: -25, rekt: -10, fomo: -10 }
    },
    100: {
      probabilities: { profit: 45, stopLoss: 20, rekt: 20, fomo: 15 },
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

  // 룰렛 휠 컴포넌트에서 선택된 결과를 수신하는 콜백 함수
  const handleSegmentSelect = (segment) => {
    setSelectedSegment(segment);
  };

  const startSpin = () => {
    if (balance <= 0) return;
    
    setIsSpinning(true);
    setShowResults(false);
    setMemeAsset(null);
    setSelectedSegment(null); // 선택된 세그먼트 초기화
    
    // 시작시 회전 각도 저장
    const startRotation = currentRotation;
    
    // 결과 사전 계산 (이제 실제로 사용하지 않음 - 휠의 회전 결과를 사용)
    const targetResult = calculateResult();
    
    // 무작위 회전 각도 (2-4 바퀴) + 타겟 각도
    const minSpins = 2;
    const maxSpins = 4;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const totalRotation = spins * 360 + Math.random() * 360;
    
    let currentSpeed = spinSpeed;
    let currentAngle = startRotation;
    
    spinIntervalRef.current = setInterval(() => {
      // 점점 느려지게 회전
      if (currentAngle >= startRotation + totalRotation - 360) {
        currentSpeed = Math.max(1, currentSpeed * 0.97);
      }
      
      currentAngle += currentSpeed;
      setCurrentRotation(currentAngle);
      
      // 목표 각도에 도달하면 정지
      if (currentAngle >= startRotation + totalRotation) {
        stopSpin();
      }
    }, 16);
  };

  // 이제 calculateResult는 실제로 사용되지 않지만, 구현은 유지
  const calculateResult = () => {
    const probs = leverageSettings[leverage].probabilities;
    const rand = Math.random() * 100;
    if (rand < probs.profit) return "profit";
    if (rand < probs.profit + probs.stopLoss) return "stopLoss";
    if (rand < probs.profit + probs.stopLoss + probs.rekt) return "rekt";
    return "fomo";
  };

  const stopSpin = () => {
    clearInterval(spinIntervalRef.current);
    
    // 룰렛 휠에서 선택된 세그먼트를 결과로 사용
    const outcome = selectedSegment || "profit";
    
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

  // 컴포넌트 언마운트 시 인터벌 정리
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
              onSelect={handleSegmentSelect}
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

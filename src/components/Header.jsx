import React from "react";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";

const Header = ({ balance, highScore, toggleTheme, toggleSound, isDarkTheme, isMuted }) => (
  <header className="flex justify-between items-center py-4">
    <div>
      <h1 className="text-2xl font-bold">밈코인 룰렛 🎰</h1>
      <p className="text-sm italic">이곳은 현실이 아닙니다. 레버리지가 높을수록 행복합니다!</p>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="font-semibold">자본금: {balance.toFixed(2)}$</div>
        <div className="text-sm">최고기록: {highScore.toFixed(2)}$</div>
      </div>
      <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <button onClick={toggleSound} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  </header>
);
export default Header;
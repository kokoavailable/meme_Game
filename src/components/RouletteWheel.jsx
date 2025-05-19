import React, { useEffect, useCallback } from "react";

const COLORS = {
  profit: "#22c55e",
  stopLoss: "#eab308",
  rekt: "#ef4444",
  fomo: "#a21caf"
};

const LABELS = {
  profit: "익절",
  stopLoss: "손절",
  rekt: "청산",
  fomo: "FOMO"
};

// 레버리지별 구성을 상수로 분리
const LEVERAGE_CONFIG = {
  1: { profit: 15, stopLoss: 30, rekt: 45, fomo: 10 },
  10: { profit: 40, stopLoss: 25, rekt: 25, fomo: 10 },
  50: { profit: 40, stopLoss: 25, rekt: 25, fomo: 10 },
  100: { profit: 45, stopLoss: 20, rekt: 20, fomo: 15 }
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const rad = d => (Math.PI / 180) * d;
  const normalize = a => (a + 360) % 360;
  const s = normalize(startAngle);
  const e = normalize(endAngle);

  const x1 = cx + r * Math.cos(rad(s));
  const y1 = cy + r * Math.sin(rad(s));
  const x2 = cx + r * Math.cos(rad(e));
  const y2 = cy + r * Math.sin(rad(e));
  const delta = (e - s + 360) % 360;
  const largeArcFlag = delta > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    "Z"
  ].join(" ");
};

// Fixed segment selection function
const getSegmentByAngle = (rotation, config) => {
  // 회전 각도를 0-360 범위로 정규화
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  
  // 화살표는 항상 270도(위)를 가리킴
  // 휠이 회전하면 화살표 위치에 어떤 세그먼트가 오는지 계산
  // 기준점은 270도 (화살표 위치)
  const arrowPosition = 270;
  
  // 세그먼트의 각도 계산 (시계 방향)
  let startAngle = 270; // 화살표 위치부터 시작
  
  // 세그먼트 정의 (시계 방향으로 회전)
  const segments = [];
  
  // profit 세그먼트
  segments.push({
    name: "profit",
    start: startAngle,
    end: (startAngle + config.profit * 3.6) % 360,
    value: config.profit
  });
  startAngle = segments[0].end;
  
  // stopLoss 세그먼트
  segments.push({
    name: "stopLoss",
    start: startAngle,
    end: (startAngle + config.stopLoss * 3.6) % 360,
    value: config.stopLoss
  });
  startAngle = segments[1].end;
  
  // rekt 세그먼트
  segments.push({
    name: "rekt",
    start: startAngle,
    end: (startAngle + config.rekt * 3.6) % 360,
    value: config.rekt
  });
  startAngle = segments[2].end;
  
  // fomo 세그먼트
  segments.push({
    name: "fomo",
    start: startAngle,
    end: (startAngle + config.fomo * 3.6) % 360,
    value: config.fomo
  });
  
  // 회전에 따른 실제 화살표가 가리키는 위치 계산
  // 회전이 시계 방향이면, 화살표의 상대적 위치는 반시계 방향으로 이동
  const effectiveArrowPosition = (arrowPosition - normalizedRotation + 360) % 360;
  
  // 디버깅 정보
  console.log(`Rotation: ${normalizedRotation}°, Arrow at: ${effectiveArrowPosition}°`);
  segments.forEach(segment => {
    console.log(`${segment.name}: ${segment.start}° ~ ${segment.end}° (${segment.value}%)`);
  });
  
  // 현재 화살표 위치에 해당하는 세그먼트 찾기
  for (const segment of segments) {
    // 0도를 지나는 세그먼트 (end < start)
    if (segment.end < segment.start) {
      if (effectiveArrowPosition >= segment.start || effectiveArrowPosition < segment.end) {
        console.log(`Selected segment (wrap): ${segment.name}`);
        return segment.name;
      }
    } 
    // 일반적인 세그먼트
    else if (effectiveArrowPosition >= segment.start && effectiveArrowPosition < segment.end) {
      console.log(`Selected segment (normal): ${segment.name}`);
      return segment.name;
    }
  }
  
  // 기본값 반환 (이론적으로 여기까지 오지 않아야 함)
  console.error("No segment found at rotation: " + normalizedRotation);
  return "profit"; // 기본값
};

const RouletteWheel = ({ spinnerRef, rotation, leverage, onSelect }) => {
  // 숫자로 변환하여 안전하게 접근
  const numericLeverage = Number(leverage);
  const leverageConfig = LEVERAGE_CONFIG[numericLeverage] || LEVERAGE_CONFIG[10]; // 기본값 설정

  // 메모이제이션된 세그먼트 선택 함수
  const getSelectedSegment = useCallback(() => {
    if (!leverageConfig) return null;
    
    return getSegmentByAngle(rotation, leverageConfig);
  }, [rotation, leverageConfig]);

  // 결과 전달 effect
  useEffect(() => {
    if (onSelect && typeof onSelect === "function") {
      const result = getSelectedSegment();
      onSelect(result);
    }
  }, [onSelect, getSelectedSegment]);

  // 구간 데이터 준비
  const wedgeKeys = ["profit", "stopLoss", "rekt", "fomo"];
  const wedges = wedgeKeys.map(key => ({
    key,
    value: leverageConfig[key]
  }));

  const size = 256;
  const center = size / 2;
  const strokeWidth = 8;
  const radius = center - strokeWidth / 2;

  let currentAngle = 0;
  let current = 0;
  let labelDefs = [];

  wedges.forEach(({ value }, idx) => {
    const start = (current + 270) % 360;
    const end = (start + value * 3.6) % 360;
    const arcRadius = radius - strokeWidth * 1.7;

    const arcStart = [
      center + arcRadius * Math.cos((Math.PI / 180) * start),
      center + arcRadius * Math.sin((Math.PI / 180) * start),
    ];
    const arcEnd = [
      center + arcRadius * Math.cos((Math.PI / 180) * end),
      center + arcRadius * Math.sin((Math.PI / 180) * end),
    ];
    const largeArcFlag = ((end - start + 360) % 360) > 180 ? 1 : 0;

    const arcId = `arc-label-${idx}`;
    labelDefs.push(
      <path
        id={arcId}
        key={arcId}
        fill="none"
        stroke="none"
        d={
          `M ${arcStart[0]} ${arcStart[1]} ` +
          `A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${arcEnd[0]} ${arcEnd[1]}`
        }
      />
    );

    current += value * 3.6;
  });

  currentAngle = 0;

  // 현재 선택된 세그먼트
  const selectedSegment = getSelectedSegment();

  return (
    <div className="relative flex justify-center items-center w-[256px] h-[256px] mx-auto">
      {/* 디버그 정보 표시 */}
      <div className="absolute top-[-30px] left-0 text-xs text-gray-500 w-full text-center">
        {numericLeverage}배 / 선택: {selectedSegment}
      </div>
      
      <div
        className="absolute z-50"
        style={{
          top: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "12px solid red"
        }}
      ></div>

      <svg
        ref={spinnerRef}
        className="absolute top-0 left-0"
        width={size}
        height={size}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#fff"
          stroke="#222"
          strokeWidth={strokeWidth}
        />
        <defs>{labelDefs}</defs>
        {wedges.map(({ key, value }, idx) => {
          const start = (currentAngle + 270) % 360;
          const end = (start + value * 3.6) % 360;
          const path = describeArc(center, center, radius - strokeWidth / 2, start, end);
          currentAngle += value * 3.6;

          return (
            <g key={key}>
              <path d={path} fill={COLORS[key]} />
              <text fontWeight="bold" fontSize="18" fill="white">
                <textPath
                  href={`#arc-label-${idx}`}
                  startOffset="50%"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                >
                  {LABELS[key]}
                </textPath>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default RouletteWheel;

import React, { useEffect } from "react";


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

const getSegmentByAngle = (rotation, config) => {
  const wedges = [
    { key: "profit", value: config.profit },
    { key: "stopLoss", value: config.stopLoss },
    { key: "rekt", value: config.rekt },
    { key: "fomo", value: config.fomo }
  ];

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
      ) {
        return seg.key;
      }
    } else {
      if (
        arrowAngle >= seg.start || arrowAngle < seg.end ||
        (isLast && arrowAngle === seg.end)
      ) {
        return seg.key;
      }
    }
  }

  return null;
};

const RouletteWheel = ({ spinnerRef, rotation, leverage, onSelect }) => {
  const leverageConfig = {
    1: { profit: 15, stopLoss: 30, rekt: 45, fomo: 10 },
    10: { profit: 40, stopLoss: 25, rekt: 25, fomo: 10 },
    50: { profit: 55, stopLoss: 15, rekt: 15, fomo: 15 },
    100: { profit: 70, stopLoss: 10, rekt: 10, fomo: 10 }
  }[leverage];


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

  return (
    <div className="relative flex justify-center items-center w-[256px] h-[256px] mx-auto">
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

const COLORS = ['#ff7a45', '#ffc53d', '#4dc9a0', '#5b8def', '#b37feb', '#ff85c0', '#36cfc9', '#95de64'];

function slicePath(i: number, n: number, r: number) {
  if (n === 1) return `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`;
  const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M 0 0 L ${r * Math.cos(a0)} ${r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`;
}

type Props = {
  items: string[];
  rotation: number;
  spinning: boolean;
  onSpinEnd: () => void;
};

export default function Wheel({ items, rotation, spinning, onSpinEnd }: Props) {
  const n = items.length;
  const r = 150;
  const fontSize = n > 12 ? 11 : n > 8 ? 13 : 15;

  return (
    <div className="wheel-wrap">
      <div className="pointer" aria-hidden />
      <svg
        viewBox="-160 -160 320 320"
        className="wheel"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
        }}
        onTransitionEnd={onSpinEnd}
        role="img"
        aria-label={`메뉴 ${n}개가 있는 돌림판`}
      >
        <circle r={157} fill="var(--wheel-rim)" />
        {n === 0 ? (
          <circle r={r} fill="var(--surface-2)" />
        ) : (
          items.map((name, i) => {
            const mid = ((i + 0.5) / n) * 360;
            const color = COLORS[(n % COLORS.length === 1 && i === n - 1 ? i + 1 : i) % COLORS.length];
            return (
              <g key={`${name}-${i}`}>
                <path d={slicePath(i, n, r)} fill={color} stroke="#fff" strokeWidth={2} />
                <text
                  transform={`rotate(${mid}) translate(0 ${-r * 0.62}) rotate(${n > 8 ? 90 : 0})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fontWeight={700}
                  fill="#1f1f1f"
                >
                  {name.length > 7 ? `${name.slice(0, 6)}…` : name}
                </text>
              </g>
            );
          })
        )}
        <circle r={22} fill="#fff" stroke="var(--wheel-rim)" strokeWidth={4} />
        <text textAnchor="middle" dominantBaseline="central" fontSize={18}>
          🍚
        </text>
      </svg>
    </div>
  );
}

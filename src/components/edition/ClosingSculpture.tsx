import type { ReactNode } from "react";

type Point = [number, number, number];
type Band = [height: number, width: number, depth: number, front?: number];

// Orthographic projection of the little stage. Positive Z points toward the visitor.
function project([x, y, z]: Point) {
  return [x * .984 + z * .178, y - z * .105];
}

function position(point: Point) {
  return project(point).map((coordinate) => coordinate.toFixed(1)).join(",");
}

function volume(center: Point, bands: Band[], sides = 12, brightness = 1) {
  const rings = bands.map(([height, width, depth, front = 0]) =>
    Array.from({ length: sides }, (_, index): Point => {
      const angle = (index / sides) * Math.PI * 2;
      return [center[0] + Math.sin(angle) * width, center[1] + height, center[2] + Math.cos(angle) * depth + front];
    }),
  );
  const faces: { z: number; art: ReactNode }[] = [];

  for (let row = 0; row < rings.length - 1; row++) {
    for (let col = 0; col < sides; col++) {
      const next = (col + 1) % sides;
      const a = rings[row][col], b = rings[row][next];
      const c = rings[row + 1][next], d = rings[row + 1][col];
      const angle = (col + .5) * Math.PI * 2 / sides;
      const light = brightness * (.3 + .64 * Math.max(0, Math.cos(angle + .55)) + .08 * Math.sin(row));
      const tint = Math.round(12 + 58 * light);
      faces.push({
        z: a[2] + b[2] - (a[0] + b[0]) * .18,
        art: <g key={row + "/" + col}>
          <polygon points={[a,b,c,d].map(position).join(" ")} fill={`rgb(${Math.round(tint * .68)},${tint},${Math.round(tint * .34)})`} />
          <path d={`M${position(a)}L${position(c)}`} opacity=".34" />
        </g>,
      });
    }
  }
  return <g stroke="#bdf580" strokeOpacity=".65" strokeWidth=".52" strokeLinejoin="round">
    {faces.sort((a,b) => a.z - b.z).map((face) => face.art)}
  </g>;
}

function limb(x: number, y: number, angle: number, length: number, width: number, end: number, light = .85) {
  return <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    {volume([0,0,0], [[0,width*.5,width*.45],[4,width,width*.82],[length*.36,width*.96,width*.8],[length*.68,(width+end)/2,width*.6],[length,end,end*.75]], 9, light)}
  </g>;
}

function Figure() {
  return <g>
    {/* Boots, tapered trousers and asymmetric shirt hem. */}
    {volume([-19,261,2], [[0,8,6],[7,10,10,2],[13,12,17,7],[17,12,17,7],[18,10,14,7]], 10)}
    {volume([20,259,-1], [[0,8,6],[8,10,10,3],[15,12,16,6],[18,12,16,6],[19,10,15,6]], 10)}
    {limb(-15,153,2.2,112,13,8,.5)}
    {limb(15,154,-2,109,13,8,.54)}
    {volume([0,147,0], [[0,21,12],[9,28,14],[22,25,13],[32,17,10]], 14,.52)}
    {limb(26,89,-15,47,9,7)}
    {limb(38,133,13,40,7,4.5)}
    {volume([29,171,3], [[0,4,4],[4,5,4],[11,4,3],[16,2,2]], 8)}
    {limb(-26,88,49,39,10,7)}
    <g transform="translate(-55.5 113.5)">
      <g className="wave">
        {limb(0,0,161,32,7,4.2)}
        <g transform="translate(-10 -30) rotate(-12)">
          {volume([0,-7,0], [[-3,4,2],[0,6,3],[6,6,3],[10,3,2]], 8)}
          <g fill="none" stroke="#a5d782" strokeWidth="2.5" strokeLinecap="round">
            <path d="M-4 -8l-3 -8M-1.5 -9l-.7 -11M1.2 -9l1 -12M4 -8l2.4 -9M5 0l5 -5 1 -3"/>
          </g>
        </g>
      </g>
    </g>
    {volume([0,86,0], [[-12,11,7],[-7,24,11],[0,31,14],[9,32,17],[20,28,16],[36,23,14],[51,23,13],[63,24,13],[72,25,14]], 17,.76)}
    {volume([0,66,0], [[-5,8,7],[3,8,7],[9,10,8],[14,11,8]], 11,1.05)}
    {/* A slightly turned face, layered fringe, moustache and chin patch. */}
    <g transform="translate(0 0) rotate(-4 0 55)">
      {volume([0,48,0], [[-19,10,9],[-14,15,12],[-5,17,14],[2,16,14,1],[10,13,12,2],[16,9,9,2],[20,5,5,2]], 15,1.35)}
      <path d="M-9 46q4 -3 8 0m5 0q4 -3 8 -1M2 47l-1 8 4 1m-9 5q6 -3 13 -1m-10 2q4 2 8 0m-5 4 3 0" fill="none" stroke="#d2fba3" strokeWidth="1.1" strokeLinecap="round"/>
      <g stroke="#98ca62" strokeWidth=".52">
        {Array.from({length: 24}, (_, index) => {
          const angle = index / 24 * Math.PI * 2;
          const x = Math.sin(angle) * 14, y = 34 + Math.cos(angle) * 8;
          const size = 4.7 + (index % 4);
          return <path key={index} d={`M${x-size} ${y} q-2 -9 ${size} -10 q11 -2 8 6 q-1 4 -9 9 q4 -6 -2 -5Z`} fill={index % 3 === 0 ? "#293b14" : "#16250e"}/>;
        })}
      </g>
    </g>
  </g>;
}

function Drone({x, y, scale}: {x:number; y:number; scale:number}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g className="hovercraft">
      {volume([0,0,0], [[-10,4,4],[-7,14,13],[1,19,14],[6,16,12],[11,6,5]], 10)}
      <path d="m-14 -2 8 -2 15 1 -3 3 -18 2Z" fill="#bbff73"/>
      <path d="m-12 6 -8 4 -3 7m35 -11 8 4 4 6m-18 -25 1 -6 4 -2" stroke="#a6c785" strokeWidth="1" fill="none"/>
    </g>
  </g>;
}

export default function ClosingSculpture() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 380">
    <style>{`
      .wave { animation: wave 4s ease-in-out infinite; }
      .hovercraft { animation: hover 4s ease-in-out infinite alternate; }
      @keyframes wave { 0%,50%,100% {transform:rotate(-5deg)} 12%,36% {transform:rotate(9deg)} 24% {transform:rotate(-9deg)} }
      @keyframes hover { from {transform:translateY(-3px) rotate(-4deg)} to {transform:translateY(3px) rotate(4deg)} }
      @media (prefers-reduced-motion:reduce){.wave,.hovercraft{animation:none}}
    `}</style>
    <defs>
      <radialGradient id="floorLight">
        <stop stopColor="#b7ff61" stopOpacity=".48"/><stop offset=".36" stopColor="#97d64e" stopOpacity=".2"/><stop offset="1" stopColor="#82db4a" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="projection" x2="0" y2="1">
        <stop stopColor="#b5fc6c" stopOpacity="0"/><stop offset="1" stopColor="#c1ff75" stopOpacity=".12"/>
      </linearGradient>
    </defs>
    <g transform="translate(241 314)">
      <ellipse cy="6" rx="193" ry="32" fill="url(#floorLight)"/>
      <g fill="none" stroke="#a4d878"><ellipse rx="116" ry="19" opacity=".48"/><ellipse rx="135" ry="22" opacity=".22" strokeDasharray="3 6"/><ellipse rx="66" ry="11" opacity=".4"/></g>
      <path d="M-59 0 -132 -235 147 -235 56 0Z" fill="url(#projection)"/>
    </g>
    <g fontFamily="monospace" fontSize="6" fill="#99bf78" opacity=".66">
      <text x="98" y="99">01 1010</text><text x="374" y="155">01</text><text x="87" y="233">110</text><text x="349" y="268">10 0110</text>
    </g>
    <Drone x={126} y={146} scale={.73}/>
    <Drone x={358} y={198} scale={.94}/>
    <g transform="translate(240 34)"><Figure/></g>
  </svg>;
}

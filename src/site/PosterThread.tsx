import { useEffect, useRef } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

type Point = { x: number; y: number };

// The thread at rest, in the 1200 × 700 space of the drawing.
const REST: Point[] = [
  { x: -60, y: 610 },
  { x: 110, y: 500 },
  { x: 225, y: 345 },
  { x: 340, y: 330 },
  { x: 430, y: 465 },
  { x: 505, y: 590 },
  { x: 610, y: 602 },
  { x: 700, y: 505 },
  { x: 765, y: 330 },
  { x: 880, y: 192 },
  { x: 1005, y: 172 },
  { x: 1072, y: 270 },
  { x: 1050, y: 388 },
  { x: 962, y: 408 },
  { x: 934, y: 330 },
  { x: 985, y: 220 },
  { x: 1094, y: 96 },
  { x: 1196, y: -8 },
  { x: 1290, y: -70 },
];

const RANGE = 190; // how far from the pointer the thread still feels it
const PUSH = 0.55; // share of the pointer's movement passed on to the thread
const STIFFNESS = 0.035;
const DAMPING = 0.9;
const MAX_OFFSET = 130;

/** Smooth curve through every point (Catmull-Rom turned into cubic Béziers). */
const toPath = (points: Point[]) => {
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
};

const REST_PATH = toPath(REST);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * The poster's thread. It is drawn once on load, then behaves like a slack thread: moving
 * the mouse past it drags the nearby part along, and it swings back to rest on its own.
 */
function PosterThread() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path || reduced) {
      return undefined;
    }

    const points = REST.map((point) => ({ ...point }));
    const speeds = REST.map(() => ({ x: 0, y: 0 }));
    let last: Point | null = null;
    let frame = 0;

    const step = () => {
      let energy = 0;

      points.forEach((point, index) => {
        const speed = speeds[index];
        speed.x = (speed.x + (REST[index].x - point.x) * STIFFNESS) * DAMPING;
        speed.y = (speed.y + (REST[index].y - point.y) * STIFFNESS) * DAMPING;
        point.x = clamp(point.x + speed.x, REST[index].x - MAX_OFFSET, REST[index].x + MAX_OFFSET);
        point.y = clamp(point.y + speed.y, REST[index].y - MAX_OFFSET, REST[index].y + MAX_OFFSET);
        energy +=
          Math.abs(speed.x) +
          Math.abs(speed.y) +
          Math.abs(point.x - REST[index].x) +
          Math.abs(point.y - REST[index].y);
      });

      if (energy < 0.6) {
        // settled: snap to rest and stop the loop until the next pointer move
        path.setAttribute('d', REST_PATH);
        frame = 0;
        return;
      }

      path.setAttribute('d', toPath(points));
      frame = window.requestAnimationFrame(step);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        return;
      }

      const matrix = svg.getScreenCTM();
      if (!matrix) {
        return;
      }

      const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const current = { x: local.x, y: local.y };
      const previous = last;
      last = current;
      if (!previous) {
        return;
      }

      const moveX = clamp(current.x - previous.x, -60, 60);
      const moveY = clamp(current.y - previous.y, -60, 60);

      points.forEach((point, index) => {
        const distance = Math.hypot(current.x - point.x, current.y - point.y);
        if (distance < RANGE) {
          const force = (1 - distance / RANGE) * PUSH;
          speeds[index].x += moveX * force;
          speeds[index].y += moveY * force;
        }
      });

      if (!frame) {
        frame = window.requestAnimationFrame(step);
      }
    };

    const handlePointerLeave = () => {
      last = null;
    };

    const host = svg.parentElement;
    if (!host) {
      return undefined;
    }

    host.addEventListener('pointermove', handlePointerMove);
    host.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      host.removeEventListener('pointermove', handlePointerMove);
      host.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [reduced]);

  return (
    <svg
      ref={svgRef}
      className="sm-poster__art"
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path ref={pathRef} className="sm-poster__thread" pathLength={1} d={REST_PATH} />
    </svg>
  );
}

export default PosterThread;

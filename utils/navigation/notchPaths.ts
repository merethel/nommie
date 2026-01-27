// utils/navigation/notchPaths.ts

export function buildNotchMaskPath(w: number, h: number) {
  // Closed path (needed for masking)
  return `
    M 0 0
    C ${w * 0.18} 0, ${w * 0.05} ${h}, ${w * 0.5} ${h}
    C ${w * 0.95} ${h}, ${w * 0.82} 0, ${w} 0
    L 0 0
    Z
  `;
}

export function buildNotchStrokePath(w: number, h: number) {
  // Open path (so no top line is stroked)
  return `
    M 0 0
    C ${w * 0.18} 0, ${w * 0.05} ${h}, ${w * 0.5} ${h}
    C ${w * 0.95} ${h}, ${w * 0.82} 0, ${w} 0
  `;
}

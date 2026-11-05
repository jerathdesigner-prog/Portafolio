/**
 * Eye geometry of the hero illustration, in pixels of the original image
 * (`HERO_IMAGE_SIZE`). Measured on `/static/media/a0ea6851412f.webp`; the patch
 * `/static/media/hero-eyes-patch.webp` is that same region with the painted
 * pupils removed, so the CSS pupils can move over a blank sclera.
 */
export interface Point {
  x: number;
  y: number;
}

export interface HeroEye {
  /** Centre and size of the visible eye opening (clip area). */
  center: Point;
  height: number;
  /** Pupil radius and its position in the original drawing (rest pose). */
  pupilRadius: number;
  rest: Point;
  width: number;
}

export const HERO_IMAGE_SIZE = { height: 4608, width: 3072 } as const;

export const HERO_EYES_PATCH = {
  height: 110,
  url: '/static/media/hero-eyes-patch.webp',
  width: 340,
  x: 1300,
  y: 460,
} as const;

export const HERO_EYES: readonly HeroEye[] = [
  {
    center: { x: 1367, y: 515.5 },
    height: 55,
    pupilRadius: 18,
    rest: { x: 1384.5, y: 521 },
    width: 86,
  },
  {
    center: { x: 1574.5, y: 513 },
    height: 56,
    pupilRadius: 17.5,
    rest: { x: 1570, y: 519.5 },
    width: 89,
  },
];

/** Share of the pupil that may slide under the eyelids at full reach. */
export const TUCK = { x: 0.8, y: 1 } as const;

/**
 * Where the pupil should be (image pixels) to look at `pointer`.
 * `eyeOnScreen` is the eye centre in viewport pixels and `reach` the pointer
 * distance (viewport pixels) at which the pupil reaches the eyelids.
 */
export function pupilTarget(
  eye: HeroEye,
  eyeOnScreen: Point,
  pointer: Point,
  reach: number,
): Point {
  const dx = pointer.x - eyeOnScreen.x;
  const dy = pointer.y - eyeOnScreen.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0 || reach <= 0) {
    return { ...eye.center };
  }
  const strength = Math.min(1, distance / reach);
  const rangeX = eye.width / 2 - eye.pupilRadius * TUCK.x;
  const rangeY = eye.height / 2 - eye.pupilRadius * TUCK.y;
  return {
    x: eye.center.x + (dx / distance) * strength * rangeX,
    y: eye.center.y + (dy / distance) * strength * rangeY,
  };
}

/** Pupil box as percentages of its eye opening (for `left/top/width/height`). */
export function pupilBox(eye: HeroEye, pupil: Point) {
  const left = eye.center.x - eye.width / 2;
  const top = eye.center.y - eye.height / 2;
  const size = eye.pupilRadius * 2;
  return {
    height: (size / eye.height) * 100,
    left: ((pupil.x - eye.pupilRadius - left) / eye.width) * 100,
    top: ((pupil.y - eye.pupilRadius - top) / eye.height) * 100,
    width: (size / eye.width) * 100,
  };
}

/** Box of `rect` (image pixels) as percentages of the whole illustration. */
export function imagePercentBox(rect: {
  height: number;
  width: number;
  x: number;
  y: number;
}) {
  return {
    height: (rect.height / HERO_IMAGE_SIZE.height) * 100,
    left: (rect.x / HERO_IMAGE_SIZE.width) * 100,
    top: (rect.y / HERO_IMAGE_SIZE.height) * 100,
    width: (rect.width / HERO_IMAGE_SIZE.width) * 100,
  };
}

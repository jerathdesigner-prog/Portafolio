import {
  HERO_EYES,
  imagePercentBox,
  pupilBox,
  pupilTarget,
  TUCK,
} from './hero-eyes.geometry';

const [eye] = HERO_EYES;
const onScreen = { x: 500, y: 300 };

describe('pupilTarget', () => {
  it('looks right, toward a pointer on the right, up to the eye edge', () => {
    const far = pupilTarget(eye, onScreen, { x: 5000, y: 300 }, 200);

    expect(far.y).toBeCloseTo(eye.center.y);
    expect(far.x).toBeCloseTo(
      eye.center.x + eye.width / 2 - eye.pupilRadius * TUCK.x,
    );
  });

  it('moves less when the pointer is close to the eye', () => {
    const near = pupilTarget(eye, onScreen, { x: 550, y: 300 }, 200);
    const far = pupilTarget(eye, onScreen, { x: 900, y: 300 }, 200);

    expect(near.x - eye.center.x).toBeCloseTo((far.x - eye.center.x) / 4);
  });

  it('looks up toward a pointer above, within the vertical range', () => {
    const up = pupilTarget(eye, onScreen, { x: 500, y: -1000 }, 200);

    expect(up.x).toBeCloseTo(eye.center.x);
    expect(up.y).toBeCloseTo(
      eye.center.y - (eye.height / 2 - eye.pupilRadius * TUCK.y),
    );
  });

  it('stays centred when the pointer is exactly on the eye', () => {
    expect(pupilTarget(eye, onScreen, onScreen, 200)).toEqual(eye.center);
  });
});

describe('pupilBox', () => {
  it('places the rest pupil where the illustration painted it', () => {
    const box = pupilBox(eye, eye.rest);
    const openingLeft = eye.center.x - eye.width / 2;

    expect(openingLeft + (box.left / 100) * eye.width).toBeCloseTo(
      eye.rest.x - eye.pupilRadius,
    );
    expect((box.width / 100) * eye.width).toBeCloseTo(eye.pupilRadius * 2);
  });
});

describe('imagePercentBox', () => {
  it('converts image pixels into percentages of the 3072x4608 drawing', () => {
    expect(
      imagePercentBox({ height: 461, width: 307.2, x: 1536, y: 0 }),
    ).toEqual({ height: (461 / 4608) * 100, left: 50, top: 0, width: 10 });
  });
});

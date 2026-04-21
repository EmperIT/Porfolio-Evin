export const INTRO_FOCUS_KEY = '__INTRO__';

export const focusDistanceScale = 1.35;
export const maxMoveToPlanetDurationMs = 1200;

export const defaultZoomOutTarget = {
  x: -175,
  y: 115,
  z: 5
};

// Edit these values to control where focus panels appear and how connectors attach.
export const PANEL_LAYOUT = {
  margin: 16,
  topMin: 10,
  bottomPadding: 50,
  introGap: 300,
  planetGap: 300,
  attachYMax: 64,
  attachYFactor: 0.5,
  leftStartOffset: -16,
  rightStartOffset: 16,
  introOffsetY: -150,
  introRightOffsetY: 30,
  introOffsetX: -30
};
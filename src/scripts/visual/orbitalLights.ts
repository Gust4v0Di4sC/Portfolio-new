export type OrbitalLightConfig = {
  id: string;
  color: string;
  hex: number;
  phase: number;
  speed: number;
  radiusX: number;
  radiusY: number;
  size: number;
  brightness: number;
};

export const orbitalLightConfigs: OrbitalLightConfig[] = [
  {
    id: 'red',
    color: '#ff3f5f',
    hex: 0xff3f5f,
    phase: 0.18,
    speed: 0.34,
    radiusX: 0.34,
    radiusY: 0.2,
    size: 1,
    brightness: 1,
  },
  {
    id: 'green',
    color: '#53ff7b',
    hex: 0x53ff7b,
    phase: 2.42,
    speed: -0.27,
    radiusX: 0.27,
    radiusY: 0.16,
    size: 0.86,
    brightness: 0.9,
  },
  {
    id: 'violet',
    color: '#9a74ff',
    hex: 0x9a74ff,
    phase: 3.82,
    speed: 0.23,
    radiusX: 0.22,
    radiusY: 0.13,
    size: 0.78,
    brightness: 0.86,
  },
  {
    id: 'magenta',
    color: '#ff55d7',
    hex: 0xff55d7,
    phase: 5.08,
    speed: -0.2,
    radiusX: 0.18,
    radiusY: 0.11,
    size: 0.7,
    brightness: 0.78,
  },
];

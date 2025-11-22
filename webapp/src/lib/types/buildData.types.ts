export type PotentialConfig = {
  level?: number;
  priority?: number;
  [k: string]: unknown;
};

export interface BuildData {
  name: string;
  description: string;
  id: string;
  mainId?: number;
  support1Id?: number;
  support2Id?: number;
  discId?: number;
  disc1Id?: number;
  disc2Id?: number;
  potentialIds: number[];
  potentialConfigs?: [number, PotentialConfig][];
  // Deprecated, use potentialConfigs instead
  levelMap?: [number, number][];
  notes?: [number, number][];
  editMode: boolean;
  [k: string]: unknown;
}

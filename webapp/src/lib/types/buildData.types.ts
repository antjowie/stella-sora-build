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
  potentialIds: number[];
  potentialConfigs?: [number, PotentialConfig][];
  levelMap?: [number, number][];
  editMode: boolean;
  [k: string]: unknown;
}

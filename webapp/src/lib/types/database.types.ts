export type Skill = [number, number];
export type NotesPair = [number, number];
export type ParamCollection = {
  idx: number;
  values: string[];
};

export enum Rarity {
  SSR = 1,
  SR = 2,
  R = 3,
}
export enum CharacterClass {
  Vanguard = 1,
  Versatile = 2,
  Support = 3,
}
export enum Element {
  Aqua = 1,
  Ignis = 2,
  Terra = 3,
  Ventus = 4,
  Lux = 5,
  Umbra = 6,
  None = 7,
}
export enum PotentialRarity {
  Common = 1,
  Rare = 2,
  Main = 3,
}

export interface Database {
  characters: Character[];
  discs: Disc[];
}
export interface Character {
  id: number;
  name: string;
  class: CharacterClass;
  element: Element;
  rarity: Rarity;
  mainBuild1Name: string;
  mainBuild1Desc: string;
  mainBuild2Name: string;
  mainBuild2Desc: string;
  supportBuild1Name: string;
  supportBuild1Desc: string;
  supportBuild2Name: string;
  supportBuild2Desc: string;
  potentials: Potential[];
}
export interface Potential {
  id: number;
  name: string;
  descShort: string;
  descLong: string;
  rarity: PotentialRarity;
  // Indicates which of the 3 standard builds this potential belongs to
  build: number;
  // Indicates whether this potential is for the main build, support build, or both (1, 2, or 3)
  type: number;
  params: ParamCollection[];
}
export interface Disc {
  id: number;
  name: string;
  desc: string;
  element: number;
  rarity: number;
  skills: {
    name: string;
    desc: string;
    params: ParamCollection[];
    notes: NotesPair[][];
  }[];
}

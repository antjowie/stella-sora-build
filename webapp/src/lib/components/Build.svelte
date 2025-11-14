<script lang="ts">
  import { PotentialRarity } from "$lib/database";
  import type { Character, Potential } from "$lib/database.types";
  import { sortPotentials } from "$lib/util";
  import PotentialButton from "./PotentialButton.svelte";

  interface Props {
    buildIndex?: number;
    isMain?: boolean;
    overrideTitle?: string;
    showDesc: boolean;
    showBrief: boolean;
    character: Character;
    overridePotentialIds?: number[];
    activePotentialIds?: number[];
    onClicked?: (id: number) => void;
    editMode: boolean;
    onLevelChanged?: (id: number, level: number) => void;
    levelMap?: [number, number][];
    levelOverride?: number;
    blockClickReason?: string;
    blockedPotentialIds?: number[];
  }

  let {
    buildIndex,
    isMain,
    overrideTitle,
    showDesc,
    showBrief,
    character,
    overridePotentialIds = [],
    activePotentialIds = [],
    onClicked,
    editMode,
    onLevelChanged,
    levelMap = [],
    levelOverride,
    blockClickReason,
    blockedPotentialIds = [],
  }: Props = $props();

  function getTitle(title: string): string {
    if (overrideTitle !== undefined) return overrideTitle;
    return title;
  }

  const getNameAndDesc = () => {
    if (isMain) {
      switch (buildIndex) {
        case 1:
          return {
            name: getTitle(character.mainBuild1Name),
            desc: character.mainBuild1Desc,
          };
        case 2:
          return {
            name: getTitle(character.mainBuild2Name),
            desc: character.mainBuild2Desc,
          };
        default:
          return { name: getTitle("Generic build"), desc: "" };
      }
    } else {
      switch (buildIndex) {
        case 1:
          return {
            name: getTitle(character.supportBuild1Name),
            desc: character.supportBuild1Desc,
          };
        case 2:
          return {
            name: getTitle(character.supportBuild2Name),
            desc: character.supportBuild2Desc,
          };
        default:
          return { name: getTitle("Generic build"), desc: "" };
      }
    }
  };

  const buildName = getNameAndDesc().name;
  const buildDesc = getNameAndDesc().desc;
  const potentials = (
    overridePotentialIds.length > 0
      ? overridePotentialIds
          .map((id) => character.potentials.find((p) => p.id === id))
          .filter((p) => p !== undefined)
      : character.potentials
          // Filter out potentials that are not relevant to the current build
          .filter(
            (potential) =>
              potential.build === buildIndex &&
              ((isMain ? potential.type === 1 : potential.type === 2) ||
                potential.type === 3),
          )
  ).sort(sortPotentials);

  function getLevel(id: number): number | undefined {
    return levelMap.find(([potentialId, level]) => potentialId === id)?.[1];
  }
</script>

<h3 class="build-name">{buildName}</h3>
{#if buildDesc!.length > 0}
  <p class="build-desc">{buildDesc}</p>
{/if}

<div class="potentials-container">
  {#each potentials as potential}
    <PotentialButton
      {potential}
      {showBrief}
      {showDesc}
      {activePotentialIds}
      {onClicked}
      {editMode}
      {onLevelChanged}
      level={levelOverride ?? getLevel(potential.id)}
      blockClick={blockedPotentialIds.includes(potential.id)
        ? blockClickReason
        : undefined}
    />
  {/each}
</div>

<style>
  .potentials-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .potentials-container {
      grid-template-columns: repeat(auto-fill, 300px);
      justify-content: start;
    }
  }

  .build-name {
    font-size: 1.5rem;
    font-weight: 700;
    padding: 0.5rem 0;
  }

  .build-desc {
    font-size: 1rem;
    font-weight: normal;
    margin-bottom: 1rem;
  }
</style>

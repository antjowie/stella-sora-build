<script lang="ts">
  import type { PotentialConfig } from "$lib/types/buildData.types";
  import type { Character } from "$lib/types/database.types";
  import { sortPotentialPriorities, sortPotentials } from "$lib/util";
  import PotentialButton, {
    type PotentialButtonConfig,
  } from "./PotentialButton.svelte";

  interface Props {
    buildIndex?: number;
    isMain?: boolean;
    overrideTitle?: string;
    character: Character;
    config: PotentialButtonConfig;
    overridePotentialIds?: number[];
    activePotentialIds?: number[];
    onClicked?: (id: number) => void;
    onPotentialConfigChanged?: (id: number, config: PotentialConfig) => void;
    potentialConfigs?: [number, PotentialConfig][];
    levelOverride?: number;
    showPriority: boolean;
    blockClickReason?: string;
    blockedPotentialIds?: number[];
  }

  const {
    buildIndex,
    isMain,
    overrideTitle,
    character,
    config,
    overridePotentialIds = [],
    activePotentialIds = [],
    onClicked,
    onPotentialConfigChanged,
    potentialConfigs = [],
    levelOverride,
    showPriority,
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

  const buildName = $derived(getNameAndDesc().name);
  const buildDesc = $derived(getNameAndDesc().desc);
  let potentials = $derived(
    (overridePotentialIds.length > 0
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
    )
      .toSorted(sortPotentials)
      .toSorted(
        config.editMode === false
          ? sortPotentialPriorities(potentialConfigs)
          : () => 0,
      ),
  );

  function getPotentialConfig(id: number): PotentialConfig {
    const orig =
      potentialConfigs.find(
        ([potentialId, value]) => potentialId === id,
      )?.[1] ?? {};

    // Create a copy of the config object
    let config = { ...orig };

    if (levelOverride !== undefined) {
      config.level = levelOverride;
    }

    // If we want to show priority and it's not already set
    // set it to a default value
    // 0 means don't show, 1, 2 and 3 are low to high priority
    if (showPriority && config.priority === undefined) {
      config.priority = 2;
    }

    return config;
  }
</script>

<h3 class="build-name">{buildName}</h3>
{#if buildDesc.length > 0}
  <p class="build-desc">{buildDesc}</p>
{/if}

<div class="potentials-container">
  {#each potentials as potential}
    <PotentialButton
      {potential}
      {config}
      {activePotentialIds}
      {onClicked}
      {onPotentialConfigChanged}
      potentialConfig={getPotentialConfig(potential.id)}
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
    font-weight: 600;
    padding: 0.5rem 0;
  }

  .build-desc {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
</style>

<script lang="ts">
  import { PotentialRarity, type Character } from "$lib/types/database.types";
  import { fly } from "svelte/transition";
  import PotentialList from "./PotentialList.svelte";
  import type { PotentialConfig } from "$lib/types/buildData.types";
  import type { PotentialButtonConfig } from "./PotentialButton.svelte";

  interface Props {
    character: Character;
    config: PotentialButtonConfig;
    showMain: boolean;
    title?: string;
    activePotentialIds?: number[];
    onClicked?: (id: number) => void;
    onPotentialConfigChanged?: (id: number, config: PotentialConfig) => void;
    potentialConfigs?: [number, PotentialConfig][];
    levelOverride?: number;
    showPriority: boolean;
  }
  const props: Props = $props();

  const activeEpicPotentials =
    props.activePotentialIds?.filter(
      (id) =>
        props.character.potentials.find((p) => p.id === id)?.rarity ===
        PotentialRarity.Main,
    ) ?? [];
  let blockedPotentialIds: number[] = [];
  if (activeEpicPotentials.length >= 2) {
    const epicPotentials = props.character.potentials.filter(
      (id) => id.rarity === PotentialRarity.Main,
    );
    blockedPotentialIds = epicPotentials
      .filter((p) => activeEpicPotentials.includes(p.id) === false)
      .map((p) => p.id);
  }

  const data = $derived({
    ...props,
    blockedPotentialIds,
    blockClickReason: "Can only select 2 main potentials!",
  });

  const build1 = $derived({ buildIndex: 1, isMain: true, ...data });
  const build2 = $derived({ buildIndex: 2, isMain: true, ...data });
  const build3 = $derived({ buildIndex: 3, isMain: true, ...data });
  const build4 = $derived({ buildIndex: 1, isMain: false, ...data });
  const build5 = $derived({ buildIndex: 2, isMain: false, ...data });
  const build6 = $derived({ buildIndex: 3, isMain: false, ...data });
</script>

{#key props.showMain}
  <div
    in:fly={{ duration: 300, delay: 150, x: -100 }}
    out:fly={{ duration: 150, x: 100 }}
  >
    {#if props.showMain}
      {#if props.title === undefined || props.title.length > 0}
        <h1 class="title">{props.title ?? "Main builds"}</h1>
      {/if}
      <PotentialList {...build1} />
      <PotentialList {...build2} />
      <PotentialList {...build3} />
    {:else}
      {#if props.title === undefined || props.title.length > 0}
        <h1 class="title">{props.title ?? "Support builds"}</h1>
      {/if}
      <PotentialList {...build4} />
      <PotentialList {...build5} />
      <PotentialList {...build6} />
    {/if}
  </div>
{/key}

<style>
</style>

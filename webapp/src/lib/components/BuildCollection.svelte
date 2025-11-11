<script lang="ts">
  import { PotentialRarity, type Character } from "$lib/database";
  import { fly } from "svelte/transition";
  import Build from "./Build.svelte";

  interface Props {
    character: Character;
    showDesc: boolean;
    showBrief: boolean;
    showMain: boolean;
    title?: string;
    activePotentialIds?: number[];
    onClicked?: (id: number) => void;
    editMode: boolean;
    onLevelChanged?: (id: number, level: number) => void;
    levelMap?: [number, number][];
  };

  let { character, showDesc, showBrief, showMain, title = "", activePotentialIds = [], onClicked, editMode, onLevelChanged, levelMap = [] }: Props = $props();

  let blockedPotentialIds: number[] = $state([]);

  let data = $derived({
    showDesc,
    showBrief,
    character,
    activePotentialIds,
    onClicked,
    editMode,
    onLevelChanged,
    levelMap,
    blockedPotentialIds,
    blockClickReason:"Can only select 2 main potentials"
  });

  const build1 = $derived({buildIndex: 1, isMain: true, ...data});
  const build2 = $derived({buildIndex: 2, isMain: true, ...data});
  const build3 = $derived({buildIndex: 3, isMain: true, ...data});
  const build4 = $derived({buildIndex: 1, isMain: false, ...data});
  const build5 = $derived({buildIndex: 2, isMain: false, ...data});
  const build6 = $derived({buildIndex: 3, isMain: false, ...data});

  $effect(() => {
      const activeEpicPotentials =
        activePotentialIds.
          filter(id => character.potentials.find(p => p.id === id)?.rarity === PotentialRarity.Main);
      blockedPotentialIds = [];
      if (activeEpicPotentials.length >= 2) {
        const epicPotentials = character.potentials.filter(id => id.rarity === PotentialRarity.Main);
        blockedPotentialIds = epicPotentials
          .filter(p => activeEpicPotentials.includes(p.id) === false)
          .map(p => p.id);
      }
  });
</script>

{#key showMain}
<div in:fly={{ duration: 300, delay: 150, x: -100 }} out:fly={{ duration: 150, x: 100 }}>
{#if showMain}
    <h1 class="title">{title.length == 0 ? "Main builds" : title}</h1>
    <Build {...build1} />
    <Build {...build2} />
    <Build {...build3} />
{:else}
    <h1 class="title">{title.length == 0 ? "Support builds" : title}</h1>
    <Build {...build4} />
    <Build {...build5} />
    <Build {...build6} />
{/if}
</div>
{/key}

<style>
    .title {
        padding-top: 1rem;
    }
</style>

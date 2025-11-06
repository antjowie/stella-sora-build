<script lang="ts">
  import type { Character } from "$lib/database";
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
  };

  let { character, showDesc, showBrief, showMain, title = "", activePotentialIds = [], onClicked }: Props = $props();

  const data = $derived({
     showDesc,
     showBrief,
     character,
     activePotentialIds,
     onClicked,
  });

  const build1 = $derived({buildIndex: 1, isMain: true, ...data});
  const build2 = $derived({buildIndex: 2, isMain: true, ...data});
  const build3 = $derived({buildIndex: 3, isMain: true, ...data});
  const build4 = $derived({buildIndex: 1, isMain: false, ...data});
  const build5 = $derived({buildIndex: 2, isMain: false, ...data});
  const build6 = $derived({buildIndex: 3, isMain: false, ...data});
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

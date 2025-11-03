<script lang="ts">
  import type { Character } from "$lib/database.svelte";
  import { fade } from "svelte/transition";
  import Build from "./Build.svelte";

  type BuildCollectionProps = {
    character: Character;
    showDesc: boolean;
    showBrief: boolean;
    showMain: boolean;
    title: string;
  };

  let { character, showDesc, showBrief, showMain, title = "" }: BuildCollectionProps = $props();

  const build1 = $derived({buildIndex: 1, isMain: true, showDesc, showBrief, character});
  const build2 = $derived({buildIndex: 2, isMain: true, showDesc, showBrief, character});
  const build3 = $derived({buildIndex: 3, isMain: true, showDesc, showBrief, character});
  const build4 = $derived({buildIndex: 1, isMain: false, showDesc, showBrief, character});
  const build5 = $derived({buildIndex: 2, isMain: false, showDesc, showBrief, character});
  const build6 = $derived({buildIndex: 3, isMain: false, showDesc, showBrief, character});

</script>

{#key showMain}
<div in:fade={{ duration: 300, delay: 150 }} out:fade={{ duration: 150 }}>
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
        font-size: 2rem;
        font-weight: bold;
        margin-top: 1rem;
    }
</style>

<script lang="ts">
    import { potentialRarityColor } from "./database.svelte";
    import type { Character } from "./database.types";

  let {buildIndex, isMain, showDesc, showBrief, character}: {buildIndex: number, isMain: boolean, showDesc: boolean, showBrief: boolean, character: Character } = $props();

  const getNameAndDesc = () => {
    if (isMain)
    {
      switch (buildIndex) {
        case 1: return { name: character.mainBuild1Name, desc: character.mainBuild1Desc };
        case 2: return { name: character.mainBuild2Name, desc: character.mainBuild2Desc };
        default: return { name: "Generic build", desc: "" };
      }
    }
    else
    {
      switch (buildIndex) {
        case 1: return { name: character.supportBuild1Name, desc: character.supportBuild1Desc };
        case 2: return { name: character.supportBuild2Name, desc: character.supportBuild2Desc };
        default: return { name: "Generic build", desc: "" };
      }
    }
  };

  const replaceText = (text: string) => {
    return text
      .replace(/<color[^>]*>.*?<\/color>/g, 'X') // Replace color tags with 'x'
      .replace(/&[^&]*&/g, 'Y') // Replace special characters with 'x'
      .replace(/##([^#]+)#[^#]*#/g, '$1') // Replace ##content#xxxx# patterns with just the content
    ;
  };

  const buildName = getNameAndDesc().name;
  const buildDesc = getNameAndDesc().desc;
  const potentials = character.potentials
    // Filter out potentials that are not relevant to the current build
    .filter((potential) => potential.build === buildIndex &&
      ((isMain ? potential.type === 1 : potential.type === 2)|| potential.type === 3))
    // Sort potentials by ID and rarity, multiply so we can "categorize" them
    // This seems to match the game quite well
    .sort((a, b) => (a.id + (3 - a.rarity) * 1000) - (b.id + (3 - b.rarity) * 1000));
</script>

<h3 class="build-name">{buildName}</h3>
{#if buildDesc!.length > 0}
<p class="build-desc">{buildDesc}</p>
{/if}
<div class="potentials-container">
{#each potentials as potential}
    <div class="potential"
        style:background-color={potentialRarityColor[potential.rarity]}
    >
        <p>{potential.name}</p>
{#if showDesc}
        <p class="description">{replaceText(showBrief ? potential.descShort : potential.descLong)}</p>
{/if}
    </div>
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

.potential {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
    background-color: white;
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
}

.potential > p:first-child {
    font-weight: 700;
    text-align: center;
}

.potential .description {
    font-weight: normal;
    text-align: left;
    margin: 0.5rem 0 0 0;
}
</style>

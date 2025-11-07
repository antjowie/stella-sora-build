<script lang="ts">
  import { potentialRarityColor } from "$lib/database";
  import type { Potential } from "$lib/database.types";

  interface Props {
    potential: Potential;
    showBrief: boolean;
    showDesc: boolean;
    activePotentialIds?: number[];
    onClicked?: (id: number) => void;
  };

  let { potential, showBrief, showDesc, activePotentialIds = [], onClicked }: Props = $props();

  // TODO: actually query the param values
  const replaceText = (text: string) => {
    return text
      .replace(/<color[^>]*>.*?<\/color>/g, 'X') // Replace color tags with 'x'
      .replace(/&[^&]*&/g, 'Y') // Replace special characters with 'x'
      .replace(/##([^#]+)#[^#]*#/g, '$1') // Replace ##content#xxxx# patterns with just the content
    ;
  };
</script>

<button
    class="potential
    { onClicked ?
      (activePotentialIds.includes(potential.id) ? "active" : "inactive")
      : "default"}"
    style:background-color={potentialRarityColor[potential.rarity]}
    onclick={() => { if(onClicked) onClicked(potential.id); }}
>
    <p>{potential.name}</p>
{#if showDesc}
    <p class="description">{replaceText(showBrief ? potential.descShort : potential.descLong)}</p>
{/if}
</button>

<style>
    .default:hover {
        transform: scale(1);
        cursor: auto;
    }

    .potential {
        border: 1px solid #ccc;
        padding: 1rem;
        border-radius: 8px;
        background-color: white;
        overflow: hidden;
        transition: 0.2s;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-content: start;
        user-select: text;
    }

    .potential > p:first-child {
        font-weight: 700;
        text-align: center;
    }

    .potential .description {
        text-align: left;
        margin: 0.5rem 0 0 0;
    }

    .active {
        filter: grayscale(0);
        --radius: 5px;
        box-shadow:
            inset var(--radius) var(--radius) var(--green),
            inset var(--radius) calc(-1 * var(--radius)) var(--green),
            inset calc(-1 * var(--radius)) calc(-1 * var(--radius)) var(--green),
            inset calc(-1 * var(--radius)) var(--radius) var(--green)
            ;
    }

    .inactive {
        filter: grayscale(0.5);
    }

    .active:hover:active, .inactive:hover:active {
        transform: scale(1);
    }

    .active:hover, .inactive:hover {
        transform: scale(1.05);
    }
</style>

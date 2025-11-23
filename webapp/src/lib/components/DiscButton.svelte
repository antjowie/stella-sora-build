<script lang="ts">
  import { Element, type Disc } from "$lib/types/database.types";
  import { getElementIconUrl, getDiscCoverUrl, getImageUrl } from "$lib/util";
  import { base } from "$app/paths";
  import { global, darkModeBrightness } from "$lib/global.svelte";

  interface Props {
    disc: Disc;
    clickOverride?: (id: number) => void;
  }

  const { disc, clickOverride }: Props = $props();
</script>

{#snippet button()}
  <div
    class="button-wrapper"
    style="--brightness: {global.darkMode ? darkModeBrightness : 1}"
  >
    <button
      class="button {'rarity-' + disc.rarity}"
      onclick={() => {
        if (clickOverride) clickOverride(disc.id);
      }}
      style:background-image="url({getDiscCoverUrl(disc.id)}), url({getImageUrl(
        'Disc',
        'fallback',
      )})"
    >
    </button>
    <div class="disc-name">{disc.name}</div>
    <img
      class="element-icon"
      src={getElementIconUrl(disc.element)}
      onerror={(e: any) => {
        e.target.src = getImageUrl("Element", "fallback");
      }}
      alt={Element[disc.element]}
      onclick={() => {
        if (clickOverride) clickOverride(disc.id);
      }}
    />
  </div>
{/snippet}

{#if clickOverride === undefined}
  <a href={`${base}/disc/${disc.id}`}>
    {@render button()}
  </a>
{:else}
  {@render button()}
{/if}

<style>
  .button-wrapper {
    position: relative;
    display: block;
    cursor: pointer;
    aspect-ratio: 1;
    transition: 0.2s;

    &:hover {
      transform: scale(1.05);
    }

    &:active:hover {
      transform: scale(0.9);
    }
  }

  button:hover {
    transform: scale(1);
  }

  button:active:hover {
    transform: scale(1);
  }

  .element-icon {
    position: absolute;
    top: -0.5rem;
    left: -0.5rem;
    right: 0;
    bottom: 0;
    width: 3rem;
    filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2));
    z-index: 5;
  }

  .button {
    position: relative;
    border-radius: var(--border-radius);
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: hidden;
    font-weight: 600;
    padding: 0;
    color: var(--primary-content);

    border: 4px solid;
    border-image-slice: 1;
    /*border-width: 10px;*/
    border-image-source: var(--gradient);

    filter: drop-shadow(0 0px 4px rgba(0, 0, 0, 0.5))
      brightness(var(--brightness));

    &:hover {
      filter: drop-shadow(0 0px 8px rgba(0, 0, 0, 0.5));
    }
  }

  .button.rarity-1 {
    --gradient: linear-gradient(
      135deg,
      rgb(219, 131, 239) 0%,
      rgb(134, 167, 251) 50%,
      rgb(126, 243, 247) 100%
    );
  }

  .button.rarity-2 {
    --gradient: linear-gradient(
      135deg,
      rgb(245, 213, 92) 0%,
      rgb(245, 243, 117) 50%,
      rgb(241, 245, 203) 100%
    );
  }

  .button.rarity-3 {
    --gradient: linear-gradient(
      135deg,
      rgb(137, 196, 212) 0%,
      rgb(181, 241, 249) 50%,
      rgb(211, 247, 247) 100%
    );
  }

  a {
    text-decoration: none;
  }

  .disc-name {
    text-align: center;
    color: var(--primary);
  }
</style>

<script lang="ts">
  import { page } from "$app/state";
  import Slider from "$lib/components/Slider.svelte";
  import { elementColor } from "$lib/consts";
  import { global } from "$lib/global.svelte";
  import {
    getDiscCoverUrl,
    getElementIconUrl,
    loadPreferenceNum,
  } from "$lib/util";
  import { Element } from "$lib/types/database.types";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import DiscSkills from "$lib/components/DiscSkills.svelte";

  const disc = $derived(
    global.database.discs.find(
      (d) => d.id === parseInt(page.params.id ?? "-1"),
    ),
  );
  // svelte-ignore state_referenced_locally
  const maxLevel = disc?.skills[0].params[0].values.length ?? 1;
  let discLevel = $state(1);

  onMount(() => {
    discLevel = Math.min(loadPreferenceNum("discLevel", 6), maxLevel);
  });

  $effect(() => {
    if (browser) {
      localStorage.setItem("discLevel", String(discLevel));
    }
  });
</script>

{#if disc === undefined}
  <div>Can't find Disc</div>
{:else}
  <div class="disc-container">
    <img
      src={getDiscCoverUrl(disc.id)}
      onerror={(e: any) => {
        e.target.src = getDiscCoverUrl();
      }}
      alt={disc.name}
    />
    <div>
      <h2>{disc.name}</h2>
      <div class="disc-info">
        <li class="element-item" style:color={elementColor[disc.element]}>
          <img
            class="element-icon"
            src={getElementIconUrl(disc.element)}
            onerror={(e: any) => (e.target.src = getElementIconUrl())}
            alt={Element[disc.element]}
          />
          {Element[disc.element]}
        </li>
      </div>
    </div>
  </div>
  <Slider bind:value={discLevel} max={maxLevel} text="Lvl." />
  <DiscSkills skills={disc.skills} levels={[discLevel]} />
{/if}

<style>
  h2 {
    font-size: 2rem;
    margin-bottom: 0rem;
  }

  .disc-container {
    display: flex;
    align-items: end;
    gap: 0.5rem;
  }

  .disc-container > img {
    height: 12rem;
    filter: brightness(var(--brightness));
  }

  .disc-info {
    display: flex;
    list-style-type: none;
    gap: 0.5rem;
  }

  .disc-info li.element-item {
    position: relative;
    padding-left: 4.25rem;
    background-color: var(--primary-bg-dark);
  }

  .element-icon {
    position: absolute;
    top: 50%;
    left: 2rem;
    max-width: 3rem;
    transform: translate(-50%, -50%);
  }

  .disc-info li {
    color: var(--secondary);
    font-weight: 600;
    margin-right: 0.2rem;
    padding: 0.5rem;
    border-radius: 4px;
    /*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);*/
  }
</style>

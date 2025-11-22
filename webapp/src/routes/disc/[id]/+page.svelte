<script>
  import { page } from "$app/state";
  import Slider from "$lib/components/Slider.svelte";
  import { elementColor, global } from "$lib/global.svelte";
  import {
    getDiscCoverUrl,
    getElementIconUrl,
    getNoteIconUrl,
    loadPreferenceNum,
    patchDescription,
  } from "$lib/util";
  import { Element } from "$lib/types/database.types";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import Notes from "$lib/components/Notes.svelte";

  const disc = global.database.discs.find(
    (d) => d.id === parseInt(page.params.id ?? "-1"),
  );
  let discLevel = $state(1);
  // svelte-ignore non_reactive_update
  let maxLevel = 0;
  if (disc) {
    maxLevel = disc.skills[0].params[0].values.length;
  }

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
    <img src={getDiscCoverUrl(disc.id)} alt={disc.name} />
    <div>
      <h2>{disc.name}</h2>
      <div class="disc-info">
        <li class="element-item" style:color={elementColor[disc.element]}>
          <img
            class="element-icon"
            src={getElementIconUrl(disc.element)}
            alt={Element[disc.element]}
          />
          {Element[disc.element]}
        </li>
      </div>
    </div>
  </div>
  <Slider bind:value={discLevel} max={maxLevel} text="Lvl." />
  {#each disc.skills as skill, idx}
    {#if idx === 0}
      <h1>Melody</h1>
    {:else if idx === 1}
      <h1>Harmony</h1>
    {/if}
    <h3>{skill.name}</h3>
    <p>{@html patchDescription(skill.desc, skill.params, discLevel)}</p>
    <Notes
      notes={skill.notes[Math.min(discLevel - 1, skill.notes.length - 1)]}
    />
  {/each}
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

  p {
    white-space: pre-wrap;
  }
</style>

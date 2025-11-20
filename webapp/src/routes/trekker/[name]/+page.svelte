<script lang="ts">
  import {
    database,
    getCharacterPortraitUrl,
    type Character,
  } from "$lib/database";
  import { page } from "$app/state";
  import {
    CharacterElement,
    CharacterClass,
    characterClassColor,
    characterElementColor,
  } from "$lib/database";
  import BuildCollection from "$lib/components/BuildCollection.svelte";
  import { browser } from "$app/environment";
  import { loadPreferenceBool, loadPreferenceNum } from "$lib/util";
  import { getElementIconUrl } from "$lib/database";
  import { onMount } from "svelte";

  const character: Character | undefined = database.characters.find(
    (c) => c.name === page.params.name,
  );

  let showDesc = $state(true);
  let showBrief = $state(true);
  let showMain = $state(true);
  let maxLevel = $derived(
    Math.max(
      ...(character?.potentials
        .filter(
          (pot) =>
            (showMain ? pot.type === 1 : pot.type === 2) || pot.type === 3,
        )
        .map((pot) => {
          let max = 0;
          for (const param of Object.values(pot.params)) {
            max = Math.max(max, param.values.length);
          }
          return max;
        }) ?? [1]),
    ),
  );
  // svelte-ignore state_referenced_locally
  let levelSlider = $state(maxLevel);

  let isSticky = $state(false);
  function observeSticky(node: HTMLElement) {
    const observer = new IntersectionObserver(([entry]) => {
      isSticky = !entry.isIntersecting;
    });

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  onMount(() => {
    showDesc = loadPreferenceBool("showDesc", true);
    showBrief = loadPreferenceBool("showBrief", true);
    levelSlider = Math.min(loadPreferenceNum("levelSlider", 6), maxLevel);
  });

  $effect(() => {
    if (browser) {
      localStorage.setItem("showDesc", String(showDesc));
      localStorage.setItem("showBrief", String(showBrief));
      localStorage.setItem("levelSlider", String(levelSlider));
    }
  });
</script>

{#if character === undefined}
  <p>Can't find character</p>
{:else}
  <div class="character-container">
    <img src={getCharacterPortraitUrl(character.name)} alt={character.name} />
    <div>
      <h2>{character.name}</h2>
      <div class="character-info">
        <li
          class="element-item"
          style:color={characterElementColor[character.element]}
        >
          <img
            class="element-icon"
            src={getElementIconUrl(character.element)}
            alt={CharacterElement[character.element]}
          />
          {CharacterElement[character.element]}
        </li>
        <li style:background-color={characterClassColor[character.class]}>
          {CharacterClass[character.class]}
        </li>
      </div>
    </div>
  </div>
  <div class="toggles-container">
    <label class="toggle">
      <input type="checkbox" name="showMain" bind:checked={showMain} />
      Show Main
    </label>
    <label class="toggle">
      <input type="checkbox" name="showDesc" bind:checked={showDesc} />
      Show Description
    </label>
    <label class="toggle">
      <input type="checkbox" name="showBrief" bind:checked={showBrief} />
      Show Brief
    </label>
  </div>
  <div use:observeSticky style="height: 1px;"></div>
  <div class="slider interact-background" class:stuck={isSticky}>
    <label for="slider">Lvl. {levelSlider}</label>
    <input
      id="slider"
      type="range"
      min="1"
      max={maxLevel ?? 1}
      bind:value={levelSlider}
      step="1"
    />
  </div>
  <BuildCollection
    {character}
    {showDesc}
    {showBrief}
    {showMain}
    showPriority={false}
    levelOverride={levelSlider}
    editMode={false}
  />
{/if}

<style>
  h2 {
    font-size: 2rem;
    margin-bottom: 0rem;
  }

  .character-container {
    display: flex;
    align-items: end;
    gap: 0.5rem;
  }

  .character-container img {
    width: 12rem;
    filter: brightness(var(--brightness));
  }

  .character-info {
    display: flex;
    list-style-type: none;
    gap: 0.5rem;
    padding-bottom: 1rem;
  }

  .character-info li.element-item {
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

  .character-info li {
    color: var(--secondary);
    font-weight: 600;
    margin-right: 0.2rem;
    padding: 0.5rem;
    border-radius: 4px;
    /*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);*/
  }

  .toggles-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .slider {
    position: sticky;
    top: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin: 0.5rem 0;
    max-width: 250px;
    z-index: 10;

    & > input {
      padding: 0;
    }
  }

  .stuck {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
</style>

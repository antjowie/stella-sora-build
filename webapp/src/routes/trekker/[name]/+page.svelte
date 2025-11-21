<script lang="ts">
  import { page } from "$app/state";
  import BuildCollection from "$lib/components/BuildCollection.svelte";
  import { browser } from "$app/environment";
  import {
    getCharacterPortraitUrl,
    getElementIconUrl,
    loadPreferenceBool,
    loadPreferenceNum,
  } from "$lib/util";
  import { onMount } from "svelte";
  import {
    characterClassColor,
    elementColor,
    global,
  } from "$lib/global.svelte";
  import {
    CharacterClass,
    Element,
    type Character,
  } from "$lib/types/database.types";
  import Slider from "$lib/components/Slider.svelte";

  const character: Character | undefined = global.database.characters.find(
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
  let potentialLevel = $state(maxLevel);

  onMount(() => {
    showDesc = loadPreferenceBool("showDesc", true);
    showBrief = loadPreferenceBool("showBrief", true);
    potentialLevel = Math.min(loadPreferenceNum("potentialLevel", 6), maxLevel);
  });

  $effect(() => {
    if (browser) {
      localStorage.setItem("showDesc", String(showDesc));
      localStorage.setItem("showBrief", String(showBrief));
      localStorage.setItem("potentialLevel", String(potentialLevel));
    }
  });
</script>

{#if character === undefined}
  <p>Can't find character</p>
{:else}
  <div class="character-container">
    <div class="character-portrait">
      <img src={getCharacterPortraitUrl(character.name)} alt={character.name} />
    </div>
    <div>
      <h2>{character.name}</h2>
      <div class="character-info">
        <li class="element-item" style:color={elementColor[character.element]}>
          <img
            class="element-icon"
            src={getElementIconUrl(character.element)}
            alt={Element[character.element]}
          />
          {Element[character.element]}
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
  <Slider bind:value={potentialLevel} max={maxLevel ?? 1} text="Lvl. "></Slider>
  <BuildCollection
    {character}
    {showDesc}
    {showBrief}
    {showMain}
    showPriority={false}
    levelOverride={potentialLevel}
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

  .character-portrait {
    overflow: hidden;

    & > img {
      width: 12rem;
      filter: brightness(var(--brightness));
      transform: scale(1.2);
    }
  }

  .character-info {
    display: flex;
    list-style-type: none;
    gap: 0.5rem;

    & .element-icon {
      position: absolute;
      top: 50%;
      left: 2rem;
      max-width: 3rem;
      transform: translate(-50%, -50%);
    }

    & > li.element-item {
      position: relative;
      padding-left: 4.25rem;
      background-color: var(--primary-bg-dark);
    }

    & li {
      color: var(--secondary);
      font-weight: 600;
      margin-right: 0.2rem;
      padding: 0.5rem;
      border-radius: 4px;
      /*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);*/
    }
  }

  .toggles-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }
</style>

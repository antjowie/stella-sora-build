<script lang="ts">
  import { page } from "$app/state";
  import { database, CharacterElement, CharacterClass, characterClassColor, characterElementColor } from "$lib/database.svelte";
  import BuildCollection from "$lib/BuildCollection.svelte";
  import { browser } from "$app/environment";
  import { loadPreference } from "$lib/util";
  import { url } from "$lib/global";

  let character = database.data.find(c => c.name === page.params.name);

  let showDesc = $state(loadPreference('showDesc', true));
  let showBrief = $state(loadPreference('showBrief', true));
  let showMain = $state(true);

  // Save to localStorage when values change
  $effect(() => {
    if (browser) {
      localStorage.setItem('showDesc', String(showDesc));
    }
  });

  $effect(() => {
    if (browser) {
      localStorage.setItem('showBrief', String(showBrief));
    }
  });
</script>

{#if character === undefined}
<p>Can't find character</p>
{:else}
<div class="character-container">
    <img src={character.portraitUrl} alt={character.name} />
    <div>
        <h2>{character.name}</h2>
        <div class="character-info">
            <li
                style:background-color="{characterElementColor[character.element]}"
                style:color="white"
            >
                    {CharacterElement[character.element]}</li>
            <li
                style:background-color="{characterClassColor[character.class]}"
                style:color="white"
            >
                    {CharacterClass[character.class]}</li>
        </div>
    </div>
</div>
<div class="toggles-container">
    <label>
        <input
    		type="checkbox"
    		name="showMain"
    		bind:checked={showMain}
    		/>Show Main
    </label>
    <label>
        <input
    		type="checkbox"
    		name="showDesc"
    		bind:checked={showDesc}
    		/>Show Description
    </label>
    <label>
        <input
    		type="checkbox"
    		name="showBrief"
    		bind:checked={showBrief}
    		/>Show Brief
    </label>
</div>
<BuildCollection title={""} {character} {showDesc} {showBrief} {showMain} />
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
        width: auto;
    }

    .character-info {
        display: flex;
        list-style-type: none;
        padding-bottom: 1rem;
    }

    .character-info li {
        margin-right: 0.2rem;
        padding: 0.5rem;
        border-radius: 2px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toggles-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

</style>

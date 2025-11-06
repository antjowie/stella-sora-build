<script lang="ts">
  import { database } from "$lib/database";
  import { page } from "$app/state";
  import { CharacterElement, CharacterClass, characterClassColor, characterElementColor, type Database } from "$lib/database";
  import BuildCollection from "$lib/components/BuildCollection.svelte";
  import { browser } from "$app/environment";
  import { loadPreference } from "$lib/util";

  let character = database.data.find(c => c.name === page.params.name);

  let showDesc = $state(loadPreference("showDesc", true));
  let showBrief = $state(loadPreference("showBrief", true));
  let showMain = $state(true);

  $effect(() => {
    if (browser) {
      localStorage.setItem("showDesc", String(showDesc));
      localStorage.setItem("showBrief", String(showBrief));
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
            >
                    {CharacterElement[character.element]}</li>
            <li
                style:background-color="{characterClassColor[character.class]}"
            >
                    {CharacterClass[character.class]}</li>
        </div>
    </div>
</div>
<div class="toggles-container">
    <label class = "toggle">
        <input
    		type="checkbox"
    		name="showMain"
    		bind:checked={showMain}
    		>
        Show Main
    </label>
    <label class = "toggle">
        <input
    		type="checkbox"
    		name="showDesc"
    		bind:checked={showDesc}
    		/>
        Show Description
    </label>
    <label class = "toggle">
        <input
    		type="checkbox"
    		name="showBrief"
    		bind:checked={showBrief}
    		/>
        Show Brief
    </label>
</div>
<BuildCollection {character} {showDesc} {showBrief} {showMain} />
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
        color: var(--secondary);
        font-weight: 600;
        margin-right: 0.2rem;
        padding: 0.5rem;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toggles-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

</style>

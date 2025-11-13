<script lang="ts">
  import { database, getCharacterPortraitUrl } from "$lib/database";
  import { page } from "$app/state";
  import { CharacterElement, CharacterClass, characterClassColor, characterElementColor } from "$lib/database";
  import BuildCollection from "$lib/components/BuildCollection.svelte";
  import { browser } from "$app/environment";
  import { loadPreference } from "$lib/util";
  import { getElementIconUrl} from "$lib/database";

  let character = database.find(c => c.name === page.params.name);

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
    <img src={getCharacterPortraitUrl(character.name)} alt={character.name} />
    <div>
        <h2>{character.name}</h2>
        <div class="character-info">
            <li
                class="element-item"
                style:color="{characterElementColor[character.element]}"
            >
                <img
                    class="element-icon"
                    src={getElementIconUrl(character.element)}
                    alt={CharacterElement[character.element]} />
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
<BuildCollection {character} {showDesc} {showBrief} {showMain} editMode={false} />
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

</style>

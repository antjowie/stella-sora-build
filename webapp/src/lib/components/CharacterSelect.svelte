<script lang="ts">
    import { database, CharacterElement, type Character } from "$lib/database";
    import Portrait from "$lib/components/Portrait.svelte";

    interface Props {
        excludedCharacter?: Character[];
        clickOverride?: (character: Character) => void;
    }

    let { excludedCharacter = [], clickOverride }: Props = $props();

    let searchQuery = $state("");
    const allElements = Object.values(CharacterElement).filter(key => isNaN(Number(key)));
    let elements = $state([]);

    let filteredCharacters = $derived(database.data
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .filter((character) =>
        (searchQuery.length === 0 || character.name.toLowerCase().includes(searchQuery.toLowerCase()))
        && (elements.length === 0 || elements.find(element => element === CharacterElement[character.element]) !== undefined)
        && (excludedCharacter.length === 0 || excludedCharacter.find(excluded => excluded.characterId === character.characterId) === undefined))
    );
</script>

<div class="main-container">
    <div class="filter-container">
        <input type="text" placeholder="Search..." bind:value={searchQuery} />
        {#each allElements as element}
       	<label>
      		<input
     			type="checkbox"
     			name="element"
     			value={element}
     			bind:group={elements}
      		/>
      		{element}
       	</label>
        {/each}
    </div>

    <div class="character-container">
        {#each filteredCharacters as character: (character.characterId)}
            <Portrait {character} {clickOverride}/>
        {/each}
    </div>
</div>

<style>
    .main-container {
        display: flex;
        flex-direction: column;
    }

    .filter-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1rem;
        gap: 0.5rem;
    }

    .filter-container > input:focus {
        border-color: var(--secondary-bg);
    }

    .filter-container label {
        padding: 0.5rem;
        user-select: none;
        border: 1px solid rgba(0, 0, 0, 0);
        transition: 0.2s;
    }

    .filter-container label:has(*:focus) {
        border-color: var(--secondary-bg);
    }

    .character-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, 140px);
        grid-gap: 1rem;
        justify-content: space-between;
        width: 100%;
    }

    @media (max-width: 480px) {
        .character-container {
            grid-template-columns: repeat(auto-fill, 30%);
        }
    }
</style>

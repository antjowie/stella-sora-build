<script lang="ts">
    import { database, CharacterElement, type Character } from "$lib/database";
    import Portrait from "$lib/components/Portrait.svelte";

    interface Props {
        excludedCharacters?: number[];
        clickOverride?: (character: Character) => void;
    }

    let { excludedCharacters = [], clickOverride }: Props = $props();

    let searchQuery = $state("");
    const allElementsStrings: string[] = Object.values(CharacterElement)
      .filter(key => isNaN(Number(key)))
      .map(x => x.toString());
    let elementStrings = $state<string[]>([]);

    let filteredCharacters = $derived(database.data
      .filter((character) =>
        (searchQuery.length === 0 || character.name.toLowerCase().includes(searchQuery.toLowerCase()))
        && (elementStrings.length === 0 || elementStrings.includes(CharacterElement[character.element]))
        && (excludedCharacters.length === 0 || excludedCharacters.includes(character.id) === false)
      )
      .toSorted((a, b) => a.name.localeCompare(b.name))
    );
</script>

<div class="main-container">
    <div class="filter-container">
        <input type="text" placeholder="Search..." bind:value={searchQuery} />
        {#each allElementsStrings as elemString}
            <label class="toggle">
                <input
                    type="checkbox"
                    name="element"
                    value={elemString}
                    bind:group={elementStrings}
                />
                {elemString}
            </label>
        {/each}
    </div>

    <div class="character-container">
        {#each filteredCharacters as character: (character.id)}
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

    .character-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, 9rem);
        grid-gap: 1rem;
        justify-content: space-between;
        width: 100%;
    }

    @media (max-width: 13rem) {
        .character-container {
            grid-template-columns: repeat(auto-fill, 45%);
        }
    }
</style>

<script lang="ts">
    import { database, CharacterElement } from "$lib/database.svelte";
    import Portrait from "$lib/Portrait.svelte";

    let searchQuery = $state("");
    const allElements = Object.values(CharacterElement).filter(key => isNaN(Number(key)));
    let elements = $state([]);

    let filteredCharacters = $derived(database.data
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .filter((character) =>
        (searchQuery.length === 0 || character.name.toLowerCase().includes(searchQuery.toLowerCase()))
        &&(elements.length === 0 || elements.find(element => element === CharacterElement[character.element]) !== undefined))
    );
</script>

<svelte:head>
    <title>Stella Sora Build</title>
</svelte:head>

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
        <Portrait {character}/>
    {/each}
</div>

<style>
    .filter-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1rem;
        gap: 0.5rem;
    }

    .filter-container > input:focus {
        border-color: #49568b;
    }

    .filter-container label {
        padding: 0.5rem;
    }

    .character-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
        gap: 1rem;
        width: 100%;
    }
</style>

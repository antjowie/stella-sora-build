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
        <Portrait {character}/>
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
    }

    .character-container {
        display: grid;
        /* Need a better approch for this... */
        /*height: calc(100vh - 200px);*/
        overflow-y: auto;
        grid-template-columns: repeat(auto-fill, 140px);
        /*grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));*/
        justify-content: center;

        gap: 1.5rem;
        width: 100%;
        padding: 1rem;
    }
</style>

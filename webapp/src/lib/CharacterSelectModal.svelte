<script lang="ts">
    import { database, CharacterElement, CharacterClass, characterGradeColor, characterClassColor, characterElementColor } from "$lib/database.svelte";
    import type { Character } from "$lib/database.svelte";
    import { fade, scale } from "svelte/transition";

    interface Props {
        onSelect: (character: Character) => void;
        onClose: () => void;
        selectedCharacters: Character[];
    }

    let { onSelect, onClose, selectedCharacters }: Props = $props();

    let searchQuery = $state("");

    let filteredCharacters = $derived(
        database.data
            .filter(character =>
                (searchQuery.length === 0 ||
                character.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                selectedCharacters.find(x => x.characterId === character.characterId) === undefined)
            .toSorted((a, b) => a.name.localeCompare(b.name))
    );

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }

    function handleSelect(character: Character) {
        onSelect(character);
    }
</script>

<div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
    transition:fade={{ duration: 200 }}
>
    <div class="modal-content">
        <div class="modal-header">
            <h2>Select Character</h2>
            <button class="close-button" onclick={onClose}>&times;</button>
        </div>

        <div class="search-container">
            <input
                type="text"
                placeholder="Search characters..."
                bind:value={searchQuery}
            />
        </div>

        <div class="characters-grid">
            {#each filteredCharacters as character (character.characterId)}
                <button
                    class="character-card"
                    onclick={() => handleSelect(character)}
                    style:--grade-color={characterGradeColor[character.grade]}
                    style:background-image="url({character.portraitUrl})"
                    transition:scale={{ duration: 150 }}
                >
                    <div class="character-info">
                        <span
                            class="badge"
                            style:background-color={characterElementColor[character.element]}
                        >
                            {CharacterElement[character.element]}
                        </span>
                        <span
                            class="badge"
                            style:background-color={characterClassColor[character.class]}
                        >
                            {CharacterClass[character.class]}
                        </span>
                    </div>
                    <div class="character-name">
                        <p>{character.name}</p>
                    </div>
                </button>
            {/each}
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background-color: #fbf9f3;
        overflow: hidden;
        border-radius: 1rem;
        max-width: 1200px;
        width: 100%;
        min-height: 90vh;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background-color: #49568b;
        border-bottom: 12px solid #f9ebb3;
    }

    .modal-header h2 {
        color: #f9f9f7;
        margin: 0;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #f9f9f7;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
    }

    .close-button:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .search-container {
        padding: 1rem 1.5rem;
    }

    .search-container input {
        width: 100%;
        padding: 0.75rem;
    }

    .search-container input:focus {
        outline: none;
        border-color: #7d81e3;
    }

    .characters-grid {
        padding: 1.5rem;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .character-card {
        position: relative;
        border: none;
        padding: 0;
        background-color: #f0f7fa;
        border-radius: 0.5rem;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        min-height: 12rem;
        border-top: solid 0.5rem var(--grade-color);
        border-bottom: solid 1.5rem var(--grade-color);
        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2);
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .character-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(240, 247, 250, 0.7);
        pointer-events: none;
    }

    .character-card:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
    }

    .character-card:active {
        transform: scale(0.95);
    }

    .character-info {
        position: relative;
        z-index: 1;
        display: flex;
        gap: 0.2rem;
        padding: 0.25rem;
    }

    .badge {
        flex: 1;
        padding: 0.25rem;
        font-size: 0.75rem;
        color: white;
        text-align: center;
        font-weight: 600;
    }

    .character-name {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        z-index: 1;
    }

    .character-name p {
        margin: 0;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    @media (max-width: 768px) {
        .characters-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }

        .modal-content {
            max-height: 95vh;
        }
    }
</style>

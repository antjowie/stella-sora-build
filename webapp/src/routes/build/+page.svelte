<script lang="ts">
    import { browser } from "$app/environment";
    import BuildCollection from "$lib/components/BuildCollection.svelte";
    import CharacterSelectModal from "$lib/components/CharacterSelectModal.svelte";
    import type { Character, Potential } from "$lib/database.svelte";
    import { loadPreference } from "$lib/util";

    type BuildData = {
        characterId: number | null;
        characterName: string | null;
        selectedPotentialIds: number[];
        buildName: string;
        lastModified: string;
    };

    let showCharacterModal = $state(false);
    // 1 is main, 2 is support 1, 3 is support 2
    let selectedRole = 0;
    let mainCharacter = $state<Character | null>(null);
    let supportCharacter1 = $state<Character | null>(null);
    let supportCharacter2 = $state<Character | null>(null);
     let selectedPotentialIds = $state<number[]>([]);
    let buildName = $state("My Build");

    let showOnlySelected = $state(false);
    let showDesc = $state(loadPreference('showDesc', true));
    let showBrief = $state(loadPreference('showBrief', true));

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

    // Load build from localStorage on mount
    $effect(() => {
        if (browser) {
            const saved = localStorage.getItem("currentBuild");
            if (saved) {
                try {
                    const data: BuildData = JSON.parse(saved);
                    buildName = data.buildName;
                    selectedPotentialIds = data.selectedPotentialIds;
                    // We'll need to find the character from the database
                    // This will be handled after database loads
                } catch (e) {
                    console.error("Failed to load build:", e);
                }
            }
        }
    });

    // Save build to localStorage whenever it changes
    $effect(() => {
        if (browser && mainCharacter) {
            const buildData: BuildData = {
                characterId: mainCharacter.characterId,
                characterName: mainCharacter.name,
                selectedPotentialIds,
                buildName,
                lastModified: new Date().toISOString(),
            };
            localStorage.setItem("currentBuild", JSON.stringify(buildData));
        }
    });

    function handleCharacterSelect(character: Character) {
      switch(selectedRole) {
        case 0:
          mainCharacter = character;
          break;
        case 1:
          supportCharacter1 = character;
          break;
        case 2:
          supportCharacter2 = character;
          break;
      }
      showCharacterModal = false;
    }

    function togglePotential(potentialId: number) {
        if (selectedPotentialIds.includes(potentialId)) {
            selectedPotentialIds = selectedPotentialIds.filter(id => id !== potentialId);
        } else {
            selectedPotentialIds = [...selectedPotentialIds, potentialId];
        }
    }

    function resetBuild() {
        if (confirm("Are you sure you want to clear this build?")) {
            mainCharacter = null;
            supportCharacter1 = null;
            supportCharacter2 = null;
            selectedPotentialIds = [];
            buildName = "My Build";
            if (browser) {
                localStorage.removeItem("currentBuild");
            }
        }
    }
</script>

<svelte:head>
    <title>Stella Sora Build</title>
</svelte:head>

<div class="build-editor">
    <h1>Build Editor is still work in progress!!!</h1>
    <div class="header">
        <button class="reset-button" onclick={resetBuild}>Reset Build</button>
    </div>

    <div class="build-name-container">
        <label for="buildName">Build Name:</label>
        <input
            id="buildName"
            type="text"
            bind:value={buildName}
            placeholder="Enter build name..."
        />
    </div>

    <div class="character-container">
        {#each [
          { title: "Main", character: mainCharacter, role: 0, },
          { title: "Support", character: supportCharacter1, role: 1, },
          { title: "Support", character: supportCharacter2, role: 2, },
        ] as data}
        <div>
            <h3>{data.title}</h3>
            <button class="character-selector" onclick={() =>
              {selectedRole = data.role; showCharacterModal = true}}>
                {#if data.character}
                <!-- <Portrait character={data.character} /> -->
                  <img src={data.character.portraitUrl} alt={data.character.name} />
                    <div class="character-overlay">
                        <p class="character-name">{data.character.name}</p>
                        <p class="change-text">Click to change</p>
                    </div>
                {:else}
                    <div class="placeholder">
                        <p>Click to select a character</p>
                    </div>
                {/if}
            </button>
        </div>
        {/each}
    </div>

    <div class="toggles-container">
        <label>
            <input
        		type="checkbox"
        		name="showOnlySelected"
        		bind:checked={showOnlySelected}
        		/>Show Only Selected
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

    <div class="potentials-container">
        <h2>Select Potentials ({selectedPotentialIds.length} selected)</h2>
        {#each [
          {character: mainCharacter, showMain: true},
          {character: supportCharacter1, showMain: false},
          {character: supportCharacter2, showMain: false},
         ] as data}
         {#if data.character}
         <BuildCollection
             title={data.character.name}
             character={data.character}
             showDesc={showDesc}
             showBrief={showBrief}
             showMain={data.showMain}
             />
         {/if}
        {/each}
    </div>
</div>

{#if showCharacterModal}
    <CharacterSelectModal
        onSelect={handleCharacterSelect}
        onClose={() => showCharacterModal = false}
        excludedCharacter={[mainCharacter, supportCharacter1, supportCharacter1].filter(x => x !== null)}
    />
{/if}

<style>

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .reset-button {
        padding: 0.5rem 1rem;
        background-color: #e55833;
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;
    }

    .reset-button:hover {
        background-color: #d14825;
    }

    .build-name-container {
        margin-bottom: 2rem;
    }

    .build-name-container label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .build-name-container input {
        width: 100%;
        max-width: 400px;
    }

    .build-name-container input:focus {
        outline: none;
        border-color: #7d81e3;
    }

    .character-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .character-container h3 {
        margin-top: 0;
        margin-bottom: 0;
    }

    .character-selector {
        position: relative;
        width: 140px;
        height: 200px;
        border: 3px solid #f3efe7;
        border-radius: 0.5rem;
        overflow: hidden;
        cursor: pointer;
        transition: 0.2s;
        background-color: var(--primary-bg-dark);
        padding: 0;
        display: flex;
        background-size: cover;
    }

    .character-selector img {
        transform: scale(1.2);
    }

    .character-selector :global(.button) {
        width: 100%;
        height: 100%;
        min-height: unset;
    }

    .character-selector:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .character-selector :global(img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .character-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(255, 255, 255, 0.8) 75%, transparent);
        padding: 1rem;
        color: white;
    }

    .character-name {
        margin: 0;
        font-weight: 700;
        font-size: 1.1rem;
    }

    .change-text {
        margin: 0.25rem 0 0 0;
        font-size: 0.85rem;
        opacity: 0.8;
    }

    .placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 1rem;
        color: #3e4566;
        font-weight: 600;
    }

    .potentials-container h2 {
        margin-top: 0;
        margin-bottom: 1rem;
    }

    .toggles-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding-bottom: 1rem;
    }
</style>

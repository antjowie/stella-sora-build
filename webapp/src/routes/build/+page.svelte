<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import { decodeBuild, encodeBuild } from "$lib/build";
    import type { BuildData } from "$lib/buildData.types";
    import Build from "$lib/components/Build.svelte";
    import BuildCollection from "$lib/components/BuildCollection.svelte";
    import CharacterSelectModal from "$lib/components/CharacterSelectModal.svelte";
    import  {database, type Character } from "$lib/database";
    import { loadPreference } from "$lib/util";
    import { fly } from "svelte/transition";
    import { replaceState } from "$app/navigation";
    import { onMount } from "svelte";
    import { addToast } from "$lib/toastStore";

    let showCharacterModal = $state(false);
    // 1 is main, 2 is support 1, 3 is support 2
    let selectedRole = 0;
    let mainCharacter = $state<Character | undefined>(undefined);
    let supportCharacter1 = $state<Character | undefined>(undefined);
    let supportCharacter2 = $state<Character | undefined>(undefined);
    const defaultBuildData: BuildData = {
      name: "My Build",
      potentialIds: [],
    };
    // TODO: Don't use object for reactivity, it doesn't work
    // it only works for top level properties, not nested properties
    let buildData = $state<BuildData>(defaultBuildData);

    let showOnlySelected = $state(false);
    let showDesc = $state(loadPreference("showDesc", true));
    let showBrief = $state(loadPreference("showBrief", true));

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

    function onClicked(potentialId: number) {
      if (buildData.potentialIds.includes(potentialId)) {
        buildData.potentialIds = buildData.potentialIds.filter(id => id !== potentialId);
      } else {
        buildData.potentialIds = [...buildData.potentialIds, potentialId];
      }
    }

    function resetBuild() {
      if (confirm("Are you sure you want to clear this build?")) {
        Object.assign(buildData, defaultBuildData);
        mainCharacter = undefined;
        supportCharacter1 = undefined;
        supportCharacter2 = undefined;
        addToast({ message: "Build cleared!", type: "success" });
      }
    }

    function copyBuildURLToClipboard() {
      navigator.clipboard.writeText(window.location.href);
      addToast({ message: "Link copied to clipboard!", type: "success" });
    }

    function saveBuild() {
      const res = localStorage.getItem("builds");
      let builds: BuildData[] = [];
      if (res) {
        builds = JSON.parse(res);
      }
      builds.push(buildData);
      localStorage.setItem("builds", JSON.stringify(builds));
      addToast({ message: "Saving not yet implemented!", type: "error" });
    }

    // Save to localStorage when values change
    $effect(() => {
      if (browser) {
        localStorage.setItem('showDesc', String(showDesc));
        localStorage.setItem('showBrief', String(showBrief));
      }
    });

    // Otherwise we get error in console
    let mounted: boolean = false;
    // Save changes to URL when build data changes
    $effect(() => {
      buildData.mainId = mainCharacter?.characterId || undefined;
      buildData.support1Id = supportCharacter1?.characterId || undefined;
      buildData.support2Id = supportCharacter2?.characterId || undefined;
      const name = buildData.name;

      if (mounted) {
        replaceState(page.url.pathname + "?&build=" + encodeBuild(buildData), "");
      }
    });

    onMount(() => {
      let build = page.url.searchParams.get("build");
      if (build) {
        try {
          Object.assign(buildData, decodeBuild(build));
          const getChar = (id?: number): Character | undefined => database.data.find(c => c.characterId === id);
          mainCharacter = getChar(buildData.mainId);
          supportCharacter1 = getChar(buildData.support1Id);
          supportCharacter2 = getChar(buildData.support2Id);
        } catch (error) {
          addToast({ message: "Error loading build!", type: "error" });
          console.error("Error decoding build:", error);
        }
      }
      showOnlySelected = buildData.potentialIds.length > 0 && loadPreference("showDesc", false);

      // To prevent error in console
      // very ugly but online they say onMount works, but it doesn't
      setTimeout(() => {
        mounted = true;
      }, 100);
    });
</script>

<div class="build-editor">
    <div class="button-container">
        <button class="reset-button" onclick={resetBuild}>Reset Build</button>
        <button onclick={copyBuildURLToClipboard}>Copy Build URL</button>
        <button onclick={saveBuild}>Save Build</button>
    </div>

    <div class="build-name-container">
        <label for="buildName">Build Name:</label>
        <input
            id="buildName"
            maxlength="30"
            type="text"
            bind:value={buildData.name}
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
        		/>
            Show Only Selected
        </label>
        <label>
            <input
        		type="checkbox"
        		name="showDesc"
        		bind:checked={showDesc}
        		/>
            Show Description
        </label>
        <label>
            <input
        		type="checkbox"
        		name="showBrief"
        		bind:checked={showBrief}
        		/>
            Show Brief
        </label>
    </div>

    <h2>Select Potentials ({buildData.potentialIds.length} selected)</h2>
    {#key showOnlySelected}
    <!-- <div class="potentials-container" in:fade={{ duration: 300, delay: 150 }} out:fade={{ duration: 150 }}> -->
    <div class="potentials-container" in:fly={{ duration: 300, delay: 150, x: -100 }} out:fly={{ duration: 150, x: 100 }}>
        {#if showOnlySelected}
            {#each [
            mainCharacter,
            supportCharacter1,
            supportCharacter2,
            ] as character}
                {#if character}
                    <h1 class="title">{character.name}</h1>
                    <Build
                        character={character}
                        overrideTitle=""
                        overridePotentialIds={buildData.potentialIds}
                        {showBrief}
                        {showDesc}
                    />
                {/if}
            {/each}
        {:else}
            {#each [
            {character: mainCharacter, showMain: true},
            {character: supportCharacter1, showMain: false},
            {character: supportCharacter2, showMain: false},
            ] as data}
            {#if data.character}
                <BuildCollection
                    {showDesc}
                    {showBrief}
                    title={data.character.name}
                    character={data.character}
                    showMain={data.showMain}
                    activePotentialIds={buildData.potentialIds}
                    {onClicked}
                    />
            {/if}
            {/each}
        {/if}
    </div>
    {/key}
</div>

{#if showCharacterModal}
    <CharacterSelectModal
        onSelect={handleCharacterSelect}
        onClose={() => showCharacterModal = false}
        excludedCharacter={[mainCharacter, supportCharacter1, supportCharacter1].filter(x => x !== undefined)}
    />
{/if}

<style>
    .title {
        padding-top: 1rem;
    }

    .button-container {
        display: flex;
        justify-content: left;
        align-items: center;
        margin-bottom: 1rem;
        gap: 1rem;
    }

    .reset-button {
        background-color: #e55833;
        color: var(--secondary);
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

    .toggles-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding-bottom: 1rem;
    }
</style>

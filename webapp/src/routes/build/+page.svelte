<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import { decodeBuild, encodeBuild } from "$lib/build";
    import type { BuildData } from "$lib/buildData.types";
    import Build from "$lib/components/Build.svelte";
    import BuildCollection from "$lib/components/BuildCollection.svelte";
    import CharacterSelectModal from "$lib/components/CharacterSelectModal.svelte";
    import  {database, type Character } from "$lib/database";
    import { getLocalStoredBuilds, loadPreference } from "$lib/util";
    import { fade, fly } from "svelte/transition";
    import { afterNavigate, pushState, replaceState } from "$app/navigation";
    import { onMount, tick } from "svelte";
    import { addToast } from "$lib/toastStore";
    import { localStorageBuildsKey } from "$lib/global";
    import { marked } from "marked";
    import Portrait from "$lib/components/Portrait.svelte";

    let showCharacterModal = $state(false);
    // 1 is main, 2 is support 1, 3 is support 2
    let selectedRole = 0;
    // svelte-ignore state_referenced_locally
    const defaultBuildData: BuildData = {
      name: "My Build",
      description: "My description",
      id: crypto.randomUUID(),
      mainId: undefined,
      support1Id: undefined,
      support2Id: undefined,
      potentialIds: [],
      editMode: false,
    };
    let name = $state(defaultBuildData.name);
    let description = $state(defaultBuildData.description);
    let mainCharacter = $state<Character | undefined>(undefined);
    let supportCharacter1 = $state<Character | undefined>(undefined);
    let supportCharacter2 = $state<Character | undefined>(undefined);
    let selectedPotentials = $state<number[]>(defaultBuildData.potentialIds);
    let selectedPotentialsViewMode = $state<number[]>(defaultBuildData.potentialIds);
    // If not true, we get hydration warning. Not too sure why actually...
    let editMode = $state(browser ? defaultBuildData.editMode : true);
    let showDesc = $state(loadPreference("showDesc", true));
    let showBrief = $state(loadPreference("showBrief", true));
    let id: string = $state(crypto.randomUUID());
    let buildData: BuildData = $derived({
      name,
      description,
      id,
      mainId: mainCharacter?.id,
      support1Id: supportCharacter1?.id,
      support2Id: supportCharacter2?.id,
      potentialIds: selectedPotentials,
      editMode
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

      // We swapped characters, purge all ids that are not in the new character's potentials
      const contains = (id: number, character: Character | undefined) => character !== undefined && character.potentials.findIndex(p => p.id === id) >= 0;
      selectedPotentials = selectedPotentials
        .filter(id =>
          contains(id, mainCharacter) ||
          contains(id, supportCharacter1) ||
          contains(id, supportCharacter2));
      showCharacterModal = false;
    }

    function createClickListener(list: number[]): (id: number) => void {
      return (id: number) => {
        const index = list.indexOf(id);
        if (index !== -1) {
          list.splice(index, 1);
        } else {
          list.push(id);
        }
      };
    }

    function resetBuild() {
      if (confirm("Are you sure you want to clear this build?")) {
        name = defaultBuildData.name;
        description = defaultBuildData.description;
        id = crypto.randomUUID();
        mainCharacter = undefined;
        supportCharacter1 = undefined;
        supportCharacter2 = undefined;
        selectedPotentials = [];
        addToast({ message: "Build cleared!", type: "success" });
      }
    }

    function copyBuildURLToClipboard() {
      navigator.clipboard.writeText(window.location.href);
      addToast({ message: "Link copied to clipboard!", type: "success" });
    }

    function saveBuild() {
      let localBuilds = getLocalStoredBuilds();
      // Check if id already exists, if not this could be a new build or an
      // existing one we modified. In this case we need to regenerate the ID.
      // Otherwise if we send the build back to the original author their build
      // will be overwritten.
      const buildExists = localBuilds.some((build) => build.id === buildData.id);
      if (!buildExists) {
        buildData.id = crypto.randomUUID();
      }

      let idx = localBuilds.findIndex((build) => build.id === buildData.id);
      if (idx >= 0)
      {
        localBuilds[idx] = buildData;
      }
      else
      {
        localBuilds.push(buildData);
      }
      localStorage.setItem(localStorageBuildsKey, JSON.stringify(localBuilds));
      addToast({ message: "Build saved!", type: "success" });
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
    // svelte-ignore non_reactive_update
    let descriptionElem: HTMLTextAreaElement;

    function updateUrlAndCache(build: BuildData)
    {
      if (mounted === false) return
      const data = encodeBuild(build);
      replaceState(page.url.pathname + "?&build=" + data, "");
      localStorage.setItem("cachedBuild", data);
    }

    // Save changes to URL when build data changes
    $effect(() => {
      if (descriptionElem)
      {
        descriptionElem.style.height = "auto";
        descriptionElem.style.height = `${descriptionElem.scrollHeight + 4}px`;
      }

      selectedPotentialsViewMode = [];
      updateUrlAndCache(buildData);
    });

    afterNavigate(async (navigation) => {
      try {
        let buildBase64;
        // If we navigate back, the searchParams even though updated with updateState, they always return 0
        // so we just use cached localStorage whenever we do a navigation
        // popstate is on both forward and backward navigation
        if (navigation.type === "popstate") buildBase64 = localStorage.getItem("cachedBuild");
        else buildBase64 = page.url.searchParams.get("build");

        if (buildBase64 !== null) {
            const build: BuildData = decodeBuild(buildBase64);
            const getChar = (id?: number): Character | undefined => database.data.find(c => c.id === id);
            name = build.name;
            description = build.description;
            id = build.id;
            mainCharacter = getChar(build.mainId);
            supportCharacter1 = getChar(build.support1Id);
            supportCharacter2 = getChar(build.support2Id);
            selectedPotentials = build.potentialIds;
            editMode = build.editMode;
        }

      } catch (error) {
        addToast({ message: "Error loading build!", type: "error" });
        console.error("Error decoding build:", error);
      }

      // Prevent error in console
      await tick();
      mounted = true;
      if (selectedPotentials.length === 0 &&
          mainCharacter === undefined &&
          supportCharacter1 === undefined &&
          supportCharacter2 === undefined) {
        editMode = true;
      }
      updateUrlAndCache(buildData);
    });
</script>

<div class="build-editor">
    <div class="button-container">
        <label>
            <input
        		type="checkbox"
        		name="editMode"
        		bind:checked={editMode}
        		/>
            Edit Mode
        </label>
        <button onclick={saveBuild}>Save Build</button>
        <button onclick={copyBuildURLToClipboard}>Copy Build URL</button>
    {#if editMode}
        <button transition:fade={{duration: 300}} class="reset-button" onclick={resetBuild}>Reset Build</button>
    {/if}
    </div>

    {#key editMode}
    <div  in:fly={{ duration: 300, delay: 150, x: -100 }} out:fly={{ duration: 150, x: 100 }}>
    {#if editMode}
    <div class="text-container">
        <label for="name">Build Name:</label>
        <input
            id="name"
            maxlength="22"
            type="text"
            bind:value={name}
            placeholder="Enter build name..."
        />
    </div>
    <div class="text-container">
        <label for="description">Description (markdown):</label>
        <textarea
            id="description"
            maxlength="500"
            bind:value={description}
            bind:this={descriptionElem}
            placeholder="Enter description..."
        >
        </textarea>
    </div>
    {:else}
    <div class="text-container">
        <h2>{name}</h2>
        <p>{@html marked(description)}</p>
    </div>
    {/if}

    <div class="character-container">
        {#each [
          { title: "Main", character: mainCharacter, role: 0, },
          { title: "Support", character: supportCharacter1, role: 1, },
          { title: "Support", character: supportCharacter2, role: 2, },
        ] as data}
        <div>
            <h3>{data.title}</h3>
            {#if editMode === false && data.character}
                <div class="character-selector-size">
                    <Portrait character={data.character}/>
                </div>
            {:else}
                <button
                    class="character-selector-size character-selector
                    {editMode === false && data.character === undefined ? "disabled" : ""}
                    "
                    onclick={() => {
                if (editMode) {
                    selectedRole = data.role;
                    showCharacterModal = true;
                }
                }}>
                    {#if data.character}
                        {#if editMode}
                            <img src={data.character.portraitUrl} alt={data.character.name} />
                            <div class="character-overlay">
                                <p class="character-name">{data.character.name}</p>
                                <p class="change-text">Click to change</p>
                            </div>
                        {/if}
                    {:else}
                        <div class="placeholder">
                            <p>{editMode ? "Click to select a character" : "No character selected"}</p>
                        </div>
                    {/if}
                </button>
            {/if}
        </div>
        {/each}
    </div>

    <div class="toggles-container">
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

    {#if editMode}
    <h2>Selected Potentials ({selectedPotentials.length} selected)</h2>
    {:else}
    <h2>Collected Potentials {selectedPotentialsViewMode.length}/{selectedPotentials.length}</h2>
    {/if}
    {#if (mainCharacter || supportCharacter1 || supportCharacter2) === undefined}
    <div class="select-characters-hint">
        <p>No characters selected...</p>
    </div>
    {/if}
    <!-- <div class="potentials-container" in:fade={{ duration: 300, delay: 150 }} out:fade={{ duration: 150 }}> -->
    <div class="potentials-container">
        {#if editMode}
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
                    activePotentialIds={selectedPotentials}
                    onClicked={createClickListener(selectedPotentials)}
                    />
            {/if}
            {/each}
        {:else}
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
                        overridePotentialIds={selectedPotentials}
                        activePotentialIds={selectedPotentialsViewMode}
                        onClicked={createClickListener(selectedPotentialsViewMode)}
                        {showBrief}
                        {showDesc}
                    />
                {/if}
            {/each}
        {/if}
        </div>
    </div>
    {/key}
</div>

{#if showCharacterModal}
    <CharacterSelectModal
        onSelect={handleCharacterSelect}
        onClose={() => showCharacterModal = false}
        excludedCharacters={[mainCharacter, supportCharacter1, supportCharacter2]
          .filter(x => x !== undefined).map(x => x.id)}
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
        background-color: var(--light-red);
        color: var(--secondary);
    }

    .reset-button:hover {
        background-color: var(--red);
    }

    .text-container {
        margin-bottom: 2rem;
    }

    .text-container label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .text-container input {
        width: 100%;
        max-width: 400px;
    }

    .text-container input:focus {
        outline: none;
        border-color: #7d81e3;
    }

    textarea {
        resize: none;
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

    .character-selector-size {
        width: 150px;
        height: 210px;
    }

    .character-selector {
        position: relative;
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

    .character-selector:hover:not(.disabled) {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .character-selector.disabled {
        opacity: 0.5;
        cursor: auto;
    }

    .character-selector.disabled:hover {
        transform: scale(1.0);
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

    .select-characters-hint {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 1rem;
        font-size: 2rem;
        font-weight: 600;
        opacity: 0.3;
    }
</style>

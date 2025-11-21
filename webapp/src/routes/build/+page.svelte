<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import {
    decodeJson,
    encodeJson,
    getLocalStoredBuilds,
    validate,
  } from "$lib/build";
  import type { BuildData, PotentialConfig } from "$lib/types/buildData.types";
  import Build from "$lib/components/Build.svelte";
  import BuildCollection from "$lib/components/BuildCollection.svelte";
  import BuildItemSelectModal from "$lib/components/BuildItemSelectModal.svelte";
  import type { Character, Potential } from "$lib/types/database.types";
  import { global } from "$lib/global.svelte";
  import { getCharacterPortraitUrl } from "$lib/util";
  import { loadPreferenceBool } from "$lib/util";
  import { fly } from "svelte/transition";
  import { replaceState } from "$app/navigation";
  import { onMount, tick } from "svelte";
  import { addToast } from "$lib/toastStore";
  import { localStorageBuildsKey } from "$lib/global.svelte";
  import { marked } from "marked";
  import DOMPurify from "isomorphic-dompurify";
  // Only allow markdown so user can't run arbitrary code
  marked.use({
    renderer: { html: () => "" },
  });
  import CharacterButton from "$lib/components/CharacterButton.svelte";
  import * as htmlToImage from "html-to-image";

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
  let selectedPotentialsViewMode = $state<number[]>(
    defaultBuildData.potentialIds,
  );
  let editMode = $state(false);
  let showDesc = $state(true);
  let showBrief = $state(true);
  let id: string = $state(crypto.randomUUID());
  // Each entry is a pair of [id, level]
  let potentialConfigs: [number, PotentialConfig][] = $state([]);
  let localBuilds = $state(getLocalStoredBuilds());
  const isNewBuild = $derived(
    localBuilds.find((build) => build.id === id) === undefined,
  );
  let buildData: BuildData = $derived({
    name,
    description,
    id,
    mainId: mainCharacter?.id,
    support1Id: supportCharacter1?.id,
    support2Id: supportCharacter2?.id,
    potentialIds: selectedPotentials,
    potentialConfigs,
    editMode,
  });
  const hasUnsavedChanges = $derived(
    JSON.stringify(
      localBuilds
        .map((build) => {
          let b = { ...build };
          b.editMode = editMode;
          return b;
        })
        .find((build) => build.id === id),
    ) !== JSON.stringify(buildData),
  );

  function handleCharacterSelect(character: Character) {
    switch (selectedRole) {
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
    let availablePotentials: Potential[] = [];
    if (mainCharacter)
      availablePotentials = [
        ...availablePotentials,
        ...mainCharacter.potentials,
      ];
    if (supportCharacter1)
      availablePotentials = [
        ...availablePotentials,
        ...supportCharacter1.potentials,
      ];
    if (supportCharacter2)
      availablePotentials = [
        ...availablePotentials,
        ...supportCharacter2.potentials,
      ];
    let availableIds = availablePotentials.map((potential) => potential.id);

    selectedPotentials = selectedPotentials.filter((id) =>
      availableIds.includes(id),
    );
    potentialConfigs = potentialConfigs.filter(([id, obj]) =>
      availableIds.includes(id),
    );
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
    if (
      hasUnsavedChanges === false ||
      confirm("This will clear your unsaved changes. Are you sure?")
    ) {
      name = defaultBuildData.name;
      description = defaultBuildData.description;
      id = crypto.randomUUID();
      mainCharacter = undefined;
      supportCharacter1 = undefined;
      supportCharacter2 = undefined;
      selectedPotentials = [];
      potentialConfigs = [];
    }
  }

  function copyBuildURLToClipboard() {
    navigator.clipboard.writeText(window.location.href);
    addToast({ message: "Link copied to clipboard!", type: "success" });
  }

  function saveBuild() {
    // Check if id already exists, if not this could be a new build or an
    // existing one we modified. In this case we need to regenerate the ID.
    // Otherwise if we send the build back to the original author their build
    // will be overwritten.
    if (isNewBuild) {
      id = crypto.randomUUID();
      // Update manually cuz reactivity happens after this function
      buildData.id = id;
    }

    let idx = localBuilds.findIndex((build) => build.id === buildData.id);
    if (idx >= 0) {
      localBuilds[idx] = buildData;
    } else {
      localBuilds = [buildData, ...localBuilds];
    }
    localStorage.setItem(localStorageBuildsKey, JSON.stringify(localBuilds));
    localBuilds = getLocalStoredBuilds();
    addToast({ message: "Build saved!", type: "success" });
  }

  function onPotentialConfigChanged(id: number, config: PotentialConfig) {
    let idx = potentialConfigs.findIndex(([id2, c]) => id === id2);
    if (idx >= 0) {
      potentialConfigs[idx] = [id, config];
    } else {
      potentialConfigs.push([id, config]);
    }
  }

  // Otherwise we get error in console
  let mounted: boolean = false;
  function updateUrlAndCache(build: BuildData) {
    if (mounted === false) return;
    try {
      const data = encodeJson(build);
      replaceState(page.url.pathname + "?&build=" + data, "");
      if (editMode) localStorage.setItem("cachedBuild", data);
    } catch (error) {
      addToast({ message: "Error saving build!", type: "error" });
      console.error("Error saving build:", error);
    }
  }

  let buildContainer: HTMLElement | undefined = $state();
  let exportAsPNGButton: HTMLButtonElement | undefined = $state();
  let togglesContainer: HTMLElement | undefined = $state();
  let collectedPotentialsContainer: HTMLElement | undefined = $state();
  let watermarkElement: HTMLElement | undefined = $state();
  async function exportBuildAsPNG() {
    if (
      !buildContainer ||
      !exportAsPNGButton ||
      !togglesContainer ||
      !collectedPotentialsContainer ||
      !watermarkElement
    ) {
      console.error(
        "DOM elements not loaded!",
        buildContainer,
        exportAsPNGButton,
        togglesContainer,
        collectedPotentialsContainer,
        watermarkElement,
      );
      addToast({ message: "DOM not loaded!", type: "error" });
      return;
    }
    buildContainer.style.padding = "32px";
    exportAsPNGButton.disabled = true;
    togglesContainer.style.display = "none";
    collectedPotentialsContainer.style.display = "none";
    watermarkElement.innerText = "Generated by stellabuilds.pages.dev";
    await htmlToImage
      .toPng(buildContainer, {
        backgroundColor: "var(--primary-bg)",
      })
      .then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = (name.length === 0 ? "Untitled" : name) + ".png";
        a.click();
      })
      .catch((error) => {
        addToast({ message: "Error exporting build as PNG!", type: "error" });
        console.error("Error exporting build as PNG:", error);
      });
    buildContainer.style.padding = "0";
    exportAsPNGButton.disabled = false;
    togglesContainer.style.display = "block";
    collectedPotentialsContainer.style.display = "block";
    watermarkElement.innerText = "";
  }

  onMount(async () => {
    editMode = defaultBuildData.editMode;
    showDesc = loadPreferenceBool("showDesc", showDesc);
    showBrief = loadPreferenceBool("showBrief", showBrief);

    // Prevent error in console as navigation handler might not be ready yet
    try {
      let buildBase64 = page.url.searchParams.get("build");
      // If we navigate back, the searchParams even though updated with updateState, they always return 0
      // so we just use cached localStorage whenever we do a navigation
      // popstate is on both forward and backward navigation
      if (buildBase64 === null) {
        buildBase64 = localStorage.getItem("cachedBuild");
      }

      if (buildBase64 !== null) {
        const build: BuildData = decodeJson(buildBase64);
        validate(build);
        const getChar = (id?: number): Character | undefined =>
          global.database.characters.find((c) => c.id === id);
        name = build.name;
        description = build.description;
        id = build.id;
        mainCharacter = getChar(build.mainId);
        supportCharacter1 = getChar(build.support1Id);
        supportCharacter2 = getChar(build.support2Id);
        selectedPotentials = build.potentialIds;
        const levelMap = build.levelMap ?? [];
        potentialConfigs = build.potentialConfigs ?? [];
        // Import levelMap into potentialConfigs
        for (let i = 0; i < levelMap.length; i++) {
          const levelKv = levelMap[i];
          const idx = potentialConfigs.findIndex((kv) => kv[0] === levelKv[0]);
          if (idx >= 0) {
            potentialConfigs[idx][1].level = levelKv[1];
          } else {
            potentialConfigs.push([
              levelKv[0],
              {
                level: levelKv[1],
              },
            ]);
          }
        }

        editMode = build.editMode;
      }
    } catch (error) {
      addToast({ message: "Error loading build!", type: "error" });
      console.error("Error decoding build:", error);
    }

    if (
      selectedPotentials.length === 0 &&
      mainCharacter === undefined &&
      supportCharacter1 === undefined &&
      supportCharacter2 === undefined
    ) {
      editMode = true;
    }
    await tick();
    mounted = true;
    updateUrlAndCache(buildData);
  });

  // Resize description textarea when content changes
  let descriptionElem: HTMLTextAreaElement | undefined = $state();
  $effect(() => {
    if (descriptionElem) {
      descriptionElem.style.height = "auto";
      descriptionElem.style.height = `${descriptionElem.scrollHeight + 4}px`;
    }
  });

  // Save changes to URL when build data changes
  $effect(() => {
    updateUrlAndCache(buildData);
  });

  // Update page title when build name changes
  $effect(() => {
    document.title = page.data.title.replace(
      "- Build",
      "- " + (name.length == 0 ? "Build" : name),
    );
  });

  // Generate description to display after rendering to prevent hydration mismatch
  let sanitizedDescription = $state();
  $effect(() => {
    sanitizedDescription = DOMPurify.sanitize(
      marked(description, { async: false }),
    );
  });

  // Save to localStorage when values change
  $effect(() => {
    if (browser) {
      localStorage.setItem("showDesc", String(showDesc));
      localStorage.setItem("showBrief", String(showBrief));
    }
  });
</script>

<div class="build-editor">
  <div class="button-container">
    <button
      class="reset-button {hasUnsavedChanges ? 'unsaved-changes' : ''}"
      onclick={resetBuild}>Create new Build</button
    >
    <label class="toggle">
      <input type="checkbox" name="editMode" bind:checked={editMode} />
      Edit Mode
    </label>
    {#if isNewBuild === false}
      <button onclick={saveBuild}>Overwrite Build</button>
    {/if}
    <button
      onclick={() => {
        id = crypto.randomUUID();
        saveBuild();
      }}>Save as new Build</button
    >
    <button onclick={copyBuildURLToClipboard}>Copy Build URL</button>
    <button onclick={exportBuildAsPNG} bind:this={exportAsPNGButton}
      >Export as PNG</button
    >
  </div>

  {#key editMode}
    <div
      in:fly={{ duration: 300, delay: 150, x: -100 }}
      out:fly={{ duration: 150, x: 100 }}
      bind:this={buildContainer}
    >
      {#if editMode}
        <div class="text-container">
          <label for="name">Build Name:</label>
          <input
            class="input"
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
            class="input"
            id="description"
            maxlength="2500"
            bind:value={description}
            bind:this={descriptionElem}
            placeholder="Enter description..."
          >
          </textarea>
        </div>
      {:else}
        <div class="text-container">
          <h2>{name}</h2>
          <p>
            {@html sanitizedDescription}
          </p>
        </div>
      {/if}

      <div class="character-container">
        {#each [{ title: "Main", character: mainCharacter, role: 0 }, { title: "Support", character: supportCharacter1, role: 1 }, { title: "Support", character: supportCharacter2, role: 2 }] as data}
          <div>
            <h2>{data.title}</h2>
            {#if editMode === false && data.character}
              <div class="character-selector-size">
                <CharacterButton character={data.character} />
              </div>
            {:else}
              <button
                class="character-selector-size character-selector
                    {editMode === false && data.character === undefined
                  ? 'disabled'
                  : ''}
                    "
                onclick={() => {
                  if (editMode) {
                    selectedRole = data.role;
                    showCharacterModal = true;
                  }
                }}
              >
                {#if data.character}
                  {#if editMode}
                    <img
                      src={getCharacterPortraitUrl(data.character.name)}
                      alt={data.character.name}
                    />
                    <div class="character-overlay">
                      <p class="character-name">{data.character.name}</p>
                      <p class="change-text">Click to change</p>
                    </div>
                  {/if}
                {:else}
                  <div class="placeholder">
                    <p>
                      {editMode
                        ? "Click to select a character"
                        : "No character selected"}
                    </p>
                  </div>
                {/if}
              </button>
            {/if}
          </div>
        {/each}
      </div>

      <div class="toggles-container" bind:this={togglesContainer}>
        <label class="toggle">
          <input type="checkbox" name="showDesc" bind:checked={showDesc} />
          Show Description
        </label>
        <label class="toggle">
          <input type="checkbox" name="showBrief" bind:checked={showBrief} />
          Show Brief
        </label>
      </div>

      {#if editMode}
        <h2 bind:this={collectedPotentialsContainer}>
          Selected Potentials ({selectedPotentials.length} selected)
        </h2>
      {:else}
        <h2 bind:this={collectedPotentialsContainer}>
          Collected Potentials {selectedPotentialsViewMode.length}/{selectedPotentials.length}
        </h2>
      {/if}
      {#if (mainCharacter || supportCharacter1 || supportCharacter2) === undefined}
        <div class="select-characters-hint">
          <p>No characters selected...</p>
        </div>
      {/if}
      <!-- <div class="potentials-container" in:fade={{ duration: 300, delay: 150 }} out:fade={{ duration: 150 }}> -->
      <div class="potentials-container">
        {#if editMode}
          {#key `${mainCharacter?.id ?? ""}-${supportCharacter1?.id ?? ""}-${supportCharacter2?.id ?? ""}`}
            {#each [mainCharacter, supportCharacter1, supportCharacter2] as character}
              {#if character}
                <BuildCollection
                  {showDesc}
                  {showBrief}
                  {editMode}
                  {onPotentialConfigChanged}
                  {potentialConfigs}
                  title={character.name}
                  {character}
                  showPriority={true}
                  showMain={mainCharacter !== undefined &&
                    character.id === mainCharacter.id}
                  activePotentialIds={selectedPotentials}
                  onClicked={createClickListener(selectedPotentials)}
                />
              {/if}
            {/each}
          {/key}
        {:else}
          {#each [mainCharacter, supportCharacter1, supportCharacter2] as character}
            {#if character}
              <h1 class="title">{character.name}</h1>
              <Build
                {showBrief}
                {showDesc}
                {editMode}
                {potentialConfigs}
                {character}
                showPriority={true}
                overrideTitle=""
                overridePotentialIds={selectedPotentials}
                activePotentialIds={selectedPotentialsViewMode}
                onClicked={createClickListener(selectedPotentialsViewMode)}
              />
            {/if}
          {/each}
        {/if}
      </div>
      <div style="opacity: 0.5; padding-top: 0.5rem;">
        <i bind:this={watermarkElement}></i>
      </div>
    </div>
  {/key}
</div>

{#if showCharacterModal}
  <BuildItemSelectModal
    onSelect={handleCharacterSelect}
    onClose={() => (showCharacterModal = false)}
    excludedIds={[mainCharacter, supportCharacter1, supportCharacter2]
      .filter((x) => x !== undefined)
      .map((x) => x.id)}
  />
{/if}

<style>
  .title {
    padding-top: 1rem;
  }

  .button-container {
    display: flex;
    justify-content: left;
    align-items: stretch;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  button {
    border-radius: 64px;
  }

  .reset-button {
    background-color: var(--secondary-bg);
    color: var(--white);
  }

  .reset-button:hover {
    background-color: var(--secondary-bg-dark);
  }

  .unsaved-changes {
    background-color: var(--red);
    color: var(--secondary);
  }

  .unsaved-changes:hover {
    background-color: var(--red);
    filter: brightness(0.9);
  }

  .text-container {
    margin-bottom: 1rem;
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
    border-color: var(--secondary-bg);
  }

  .input {
    color: var(--primary);
  }

  textarea {
    resize: none;
  }

  .character-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .character-container h2 {
    margin-bottom: 0.5rem;
  }

  .character-selector-size {
    width: 150px;
    aspect-ratio: 150/210;
  }

  @media (max-width: 472px) {
    .character-selector-size {
      width: 100px;
    }
  }

  .character-selector {
    position: relative;
    /*border: 3px solid #f3efe7;*/
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    transition: 0.2s;
    background-color: #f3efe7;
    padding: 0;
    display: flex;
    background-size: cover;
    color: var(--primary-content);
    filter: brightness(var(--brightness));
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
    transform: scale(1);
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
    background: linear-gradient(
      to top,
      rgba(255, 255, 255, 0.8) 75%,
      transparent
    );
    padding: 1rem;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  }

  .character-name {
    margin-top: 0.5rem;
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

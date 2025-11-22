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
  import PotentialList from "$lib/components/PotentialList.svelte";
  import PotentialBuilds from "$lib/components/PotentialBuilds.svelte";
  import ItemSelectModal from "$lib/components/ItemSelectModal.svelte";
  import type {
    Character,
    Disc,
    DiscSkill,
    NotesCollection,
    Potential,
  } from "$lib/types/database.types";
  import { global, noteIds, noteIdsToElement } from "$lib/global.svelte";
  import {
    getCharacterPortraitUrl,
    getDiscCoverUrl,
    getDiscSkillLevelFromNotes,
    getEffectiveNoteIdsFromDisc,
  } from "$lib/util";
  import { loadPreferenceBool } from "$lib/util";
  import { fade, fly } from "svelte/transition";
  import { replaceState } from "$app/navigation";
  import Icon from "@iconify/svelte";
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
  import Notes from "$lib/components/Notes.svelte";
  import DiscButton from "$lib/components/DiscButton.svelte";
  import CharacterSelect from "$lib/components/CharacterSelect.svelte";
  import DiscSelect from "$lib/components/DiscSelect.svelte";
  import DiscSkills from "$lib/components/DiscSkills.svelte";

  let showModal = $state(false);

  const getChar = (id?: number): Character | undefined =>
    global.database.characters.find((c) => c.id === id);
  const getDisc = (id?: number): Disc | undefined =>
    global.database.discs.find((d) => d.id === id);

  let name = $state("My Build");
  let description = $state("My description");
  let id: string = $state(crypto.randomUUID());
  let mainCharacter = $state<Character | undefined>(undefined);
  let supportCharacter1 = $state<Character | undefined>(undefined);
  let supportCharacter2 = $state<Character | undefined>(undefined);
  let disc = $state<Disc | undefined>(undefined);
  let disc1 = $state<Disc | undefined>(undefined);
  let disc2 = $state<Disc | undefined>(undefined);
  let potentialConfigs: [number, PotentialConfig][] = $state([]);
  let notes = $state<[number, number][]>([]);

  let selectedPotentials = $state<number[]>([]);
  let selectedPotentialsViewMode = $state<number[]>([]);
  let editMode = $state(false);
  let buildData: BuildData = $derived({
    name,
    description,
    id,
    mainId: mainCharacter?.id,
    support1Id: supportCharacter1?.id,
    support2Id: supportCharacter2?.id,
    discId: disc?.id,
    disc1Id: disc1?.id,
    disc2Id: disc2?.id,
    potentialIds: selectedPotentials,
    potentialConfigs,
    notes: notes.toSorted((a, b) => a[0] - b[0]),
    editMode,
  });

  function applyBuild(build: BuildData) {
    name = build.name;
    description = build.description;
    id = build.id;
    mainCharacter = getChar(build.mainId);
    supportCharacter1 = getChar(build.support1Id);
    supportCharacter2 = getChar(build.support2Id);
    disc = getDisc(build.discId);
    disc1 = getDisc(build.disc1Id);
    disc2 = getDisc(build.disc2Id);

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
    notes = build.notes ?? [];

    editMode = build.editMode;
  }
  function resetBuild() {
    if (
      hasUnsavedChanges === false ||
      confirm("This will clear your unsaved changes. Are you sure?")
    ) {
      // Reset build
      name = "My Build";
      description = "My description";
      id = crypto.randomUUID();
      mainCharacter = undefined;
      supportCharacter1 = undefined;
      supportCharacter2 = undefined;
      disc = undefined;
      disc1 = undefined;
      disc2 = undefined;
      potentialConfigs = [];
      notes = [];

      // Reset some vars
      selectedPotentials = [];
      selectedPotentialsViewMode = [];
    }
  }

  let showDesc = $state(true);
  let showBrief = $state(true);
  let showDiscDetails = $state(true);

  const handleDisc = (disc: Disc | undefined) =>
    disc ? getEffectiveNoteIdsFromDisc(disc) : [];
  const effectiveNoteIds = $derived([
    ...new Set([
      ...handleDisc(disc),
      ...handleDisc(disc1),
      ...handleDisc(disc2),
    ]),
  ]);
  let localBuilds = $state<BuildData[]>([]);
  const isNewBuild = $derived(
    localBuilds.find((build) => build.id === id) === undefined,
  );

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

  // 1 is main, 2 is support 1, 3 is support 2
  // svelte-ignore non_reactive_update
  let selectedRole = 0;
  function handleItemSelect(id: number) {
    switch (selectedRole) {
      case 0:
        mainCharacter = getChar(id);
        break;
      case 1:
        supportCharacter1 = getChar(id);
        break;
      case 2:
        supportCharacter2 = getChar(id);
        break;
      case 3:
        disc = getDisc(id);
        break;
      case 4:
        disc1 = getDisc(id);
        break;
      case 5:
        disc2 = getDisc(id);
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
    showModal = false;
  }

  function clearSelection(role: number) {
    switch (role) {
      case 0:
        mainCharacter = undefined;
        break;
      case 1:
        supportCharacter1 = undefined;
        break;
      case 2:
        supportCharacter2 = undefined;
        break;
      case 3:
        disc = undefined;
        break;
      case 4:
        disc1 = undefined;
        break;
      case 5:
        disc2 = undefined;
        break;
    }
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

  function onNoteChanged(id: number, value: number) {
    let idx = notes.findIndex(([id2, v]) => id === id2);
    if (idx >= 0) {
      notes[idx] = [id, value];
    } else {
      notes.push([id, value]);
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
    const oldData = [
      togglesContainer.style.display,
      collectedPotentialsContainer.style.display,
    ];
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
    togglesContainer.style.display = oldData[0];
    collectedPotentialsContainer.style.display = oldData[1];
    watermarkElement.innerText = "";
  }

  onMount(async () => {
    localBuilds = getLocalStoredBuilds();
    showDesc = loadPreferenceBool("showDesc", showDesc);
    showBrief = loadPreferenceBool("showBrief", showBrief);
    showDiscDetails = loadPreferenceBool("showDiscDetails", showDiscDetails);

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
        applyBuild(build);
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
    // Prevent error in console as navigation handler might not be ready yet
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
      localStorage.setItem("showDiscDetails", String(showDiscDetails));
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
        {#each [{ title: "Main", item: mainCharacter, role: 0 }, { title: "Support", item: supportCharacter1, role: 1 }, { title: "Support", item: supportCharacter2, role: 2 }, { title: "Disc", item: disc, role: 3 }, { title: "Disc", item: disc1, role: 4 }, { title: "Disc", item: disc2, role: 5 }] as data, idx}
          <div>
            <h2>{data.title}</h2>
            {#if editMode === false && data.item}
              <div class="character-selector-size">
                {#if idx <= 2}
                  <CharacterButton character={data.item as Character} />
                {:else}
                  <DiscButton disc={data.item as Disc} />
                {/if}
              </div>
            {:else}
              <div class="character-selector-wrapper">
                <button
                  class="character-selector-size character-selector
                      {editMode === false && data.item === undefined
                    ? 'disabled'
                    : ''}
                      "
                  onclick={() => {
                    if (editMode) {
                      selectedRole = data.role;
                      showModal = true;
                    }
                  }}
                >
                  {#if data.item}
                    {#if editMode}
                      <img
                        src={idx <= 2
                          ? getCharacterPortraitUrl(data.item.name)
                          : getDiscCoverUrl(data.item.id)}
                        alt={data.item.name}
                      />

                      <div class="character-overlay">
                        <p class="character-name">{data.item.name}</p>
                        <p class="change-text">Click to change</p>
                      </div>
                    {/if}
                  {:else}
                    <div class="placeholder">
                      <p>
                        {editMode ? "Click to select" : "Nothing selected"}
                      </p>
                    </div>
                  {/if}
                </button>
                {#if editMode && data.item}
                  <button
                    class="clear-button"
                    onclick={() => clearSelection(data.role)}
                    title="Clear selection"
                  >
                    <Icon icon="mdi:close-circle" />
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>

      {#if editMode}
        <Notes {notes} {onNoteChanged} {effectiveNoteIds} />
      {:else}
        <Notes
          notes={noteIds
            .map((noteId) => {
              // It's not an elemental note
              const element: number | undefined =
                noteIdsToElement.find(([id]) => id === noteId)?.[1] ??
                undefined;
              const value: number =
                notes.find((note) => note[0] === noteId)?.[1] ?? 0;
              if (element === undefined) return [noteId, value];

              const teamElements = [
                mainCharacter,
                supportCharacter1,
                supportCharacter2,
              ]
                .filter((c) => c !== undefined)
                .map((c) => c.element);
              // To match in game visuals elemental notes are shown using the following criteria:
              // 1. If our team has a member with the same element as the note
              // 2. If we have more then 0 of that note
              if (teamElements.includes(element) || value > 0) {
                return [noteId, value];
              }
              return undefined;
            })
            .filter((note) => note !== undefined) as [number, number][]}
          {effectiveNoteIds}
        />
      {/if}

      <div class="toggles-container" bind:this={togglesContainer}>
        <label class="toggle">
          <input type="checkbox" name="showDesc" bind:checked={showDesc} />
          Show Description
        </label>
        <label class="toggle">
          <input type="checkbox" name="showBrief" bind:checked={showBrief} />
          Show Brief
        </label>
        <label class="toggle">
          <input
            type="checkbox"
            name="showDiscDetails"
            bind:checked={showDiscDetails}
          />
          Show Disc details
        </label>
        {#if editMode === false && selectedPotentialsViewMode.length > 0}
          <button
            transition:fade
            onclick={() => (selectedPotentialsViewMode = [])}
          >
            Unselect Potentials
          </button>
        {/if}
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

      {#if showDiscDetails}
        <h1>Discs</h1>
        {#if (disc || disc1 || disc2) === undefined}
          <div class="select-characters-hint">
            <p>No discs selected...</p>
          </div>
        {:else}
          {#each [disc, disc1, disc2] as item}
            {#if item}
              <DiscSkills
                skills={item.skills}
                levels={item.skills.map((skill) =>
                  getDiscSkillLevelFromNotes(skill, notes),
                )}
              />
            {/if}
          {/each}
        {/if}
        <h1>Potentials</h1>
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
                <h1 class="title">{character.name}</h1>
                <PotentialBuilds
                  {showDesc}
                  {showBrief}
                  {editMode}
                  {onPotentialConfigChanged}
                  {potentialConfigs}
                  title=""
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
              <PotentialList
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

{#if showModal}
  {#if selectedRole <= 2}
    <ItemSelectModal
      title="Select Character"
      onSelect={handleItemSelect}
      onClose={() => (showModal = false)}
      excludedIds={[mainCharacter, supportCharacter1, supportCharacter2]
        .filter((x) => x !== undefined)
        .map((x) => x.id)}
    >
      {#snippet button(excludedIds, handleSelect)}
        <CharacterSelect {excludedIds} clickOverride={handleSelect} />
      {/snippet}
    </ItemSelectModal>
  {:else}
    <ItemSelectModal
      title="Select Disc"
      onSelect={handleItemSelect}
      onClose={() => (showModal = false)}
      excludedIds={[disc, disc1, disc2]
        .filter((x) => x !== undefined)
        .map((x) => x.id)}
    >
      {#snippet button(excludedIds, handleSelect)}
        <DiscSelect {excludedIds} clickOverride={handleSelect} />
      {/snippet}
    </ItemSelectModal>
  {/if}
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

  .character-selector-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
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

  .clear-button {
    position: absolute;
    top: -8px;
    right: -8px;
    border: none;
    border-radius: 50%;
    padding: 0;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-bg-darker);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    /*transition: background-color 0.2s;*/

    &:hover {
      color: var(--red);
      transform: scale(1.15);
    }

    & :global(svg) {
      width: 2.2rem;
      height: 2.2rem;
    }
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
    padding: 0.5rem 0;
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

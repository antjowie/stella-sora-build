<script lang="ts">
  import { browser } from "$app/environment";
  import { resolve } from "$app/paths";
  import landing from "$lib/assets/landing.webp";
  import { decodeJson, encodeJson, validate } from "$lib/build";
  import type { BuildData } from "$lib/types/buildData.types";
  import { getCharacterPortraitUrl } from "$lib/util";
  import { localStorageBuildsKey, title } from "$lib/consts";
  import { addToast } from "$lib/toastStore";
  import { getLocalStoredBuilds } from "$lib/build";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { global } from "$lib/global.svelte";

  let localBuilds = $state<BuildData[]>([]);
  let reorderMode = $state(false);
  let draggedIndex: number | null = null;

  function updateLocalStoredBuilds() {
    localStorage.setItem(localStorageBuildsKey, JSON.stringify(localBuilds));
  }

  function addBuilds(importedBuilds: BuildData[]) {
    try {
      if (!Array.isArray(importedBuilds)) {
        addToast({
          message: `JSON array expected!`,
          type: "error",
        });
        return;
      }

      let hasInvalidBuild = false;
      let usedIds = new Set<string>();
      for (let i = 0; i < importedBuilds.length; i++) {
        try {
          validate(importedBuilds[i]);
          if (usedIds.has(importedBuilds[i].id))
            throw new Error(`Duplicate ID: ${importedBuilds[i].id}`);
          usedIds.add(importedBuilds[i].id);
        } catch (error) {
          console.error(`Validation failed for build ${i + 1}:`, error);
          importedBuilds.splice(i, 1);
          i--;
          if (!hasInvalidBuild) {
            addToast({
              message: `Some builds failed validation!`,
              type: "error",
            });
            hasInvalidBuild = true;
          }
        }
      }

      let existingBuilds = getLocalStoredBuilds();
      for (let i = 0; i < existingBuilds.length; i++) {
        const match = importedBuilds.findIndex(
          (build) => build.id === existingBuilds[i].id,
        );
        if (match >= 0) {
          // Replace existing build with imported one and remove it from the imported array
          existingBuilds[i] = importedBuilds[match];
          importedBuilds.splice(match, 1);
        }
      }

      if (importedBuilds.length === 0) {
        addToast({ message: "No new builds to import", type: "info" });
        return;
      }

      localBuilds = [...importedBuilds, ...existingBuilds];
      addToast({ message: "Builds imported!", type: "success" });
      updateLocalStoredBuilds();
    } catch (error) {
      console.error("Import failed:", error);
      addToast({ message: "Invalid format!", type: "error" });
    }
  }

  function deleteBuild(buildId: string) {
    if (browser) {
      if (confirm("Are you sure you want to remove this build?")) {
        localBuilds = localBuilds.filter((b) => b.id !== buildId);
        addToast({ message: "Build removed!", type: "success" });
        updateLocalStoredBuilds();
      }
    }
  }

  function importBuilds() {
    if (browser) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";

      input.onchange = async (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const text = await file.text();
        let importedBuilds: BuildData[] = JSON.parse(text);
        addBuilds(importedBuilds);
      };

      input.click();
    }
  }

  function exportBuilds() {
    if (browser) {
      const builds = getLocalStoredBuilds();
      const blob = new Blob([JSON.stringify(builds, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "builds.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({ message: "Builds exported!", type: "success" });
    }
  }

  onMount(() => {
    localBuilds = getLocalStoredBuilds();

    let importBase64 = page.url.searchParams.get("import");
    if (importBase64 !== null) {
      try {
        const decodedBuilds: BuildData[] = decodeJson(importBase64);
        addBuilds(decodedBuilds);
        addToast({ message: "Successfully imported builds!", type: "success" });
      } catch (error) {
        console.error("Import failed:", error);
        addToast({ message: "Failed to import builds!", type: "error" });
      }
    }
  });
</script>

<div class="main-container">
  <img
    class="background-image"
    src={landing}
    alt="Stella Sora characters background"
    fetchpriority="high"
    style:--brightness={global.darkMode ? 0.3 : 0.7}
  />
  <div class="text-container">
    <h1>{title}</h1>
    <h2>Browse Trekker potentials and create custom builds to share!</h2>
    <div class="button-container">
      <a class="button primary" href={resolve("/build")}>Create a build</a>
      <a class="button" href={resolve("/trekker")}>Check out Trekkers</a>
    </div>
    {#if localBuilds.length === 0}
      <p>No builds yet!</p>
      <button class="build-container-button" onclick={importBuilds}
        >Import builds</button
      >
    {:else}
      <div class="build-container">
        <button class="build-container-button" onclick={exportBuilds}
          >Export builds</button
        >
        <button class="build-container-button" onclick={importBuilds}
          >Import builds</button
        >
        <button
          class="build-container-button"
          onclick={() => (reorderMode = !reorderMode)}
        >
          <input type="checkbox" bind:checked={reorderMode} /> Reorder mode
        </button>
        <div class="build-grid">
          {#each localBuilds as build, index (build.id)}
            <div
              class="build-card {reorderMode ? 'draggable' : ''}"
              draggable={reorderMode}
              role="listitem"
              ondragstart={() => (draggedIndex = index)}
              ondragover={(event) => {
                event.preventDefault();
              }}
              ondrop={() => {
                if (draggedIndex !== null && draggedIndex !== index) {
                  const updated = [...localBuilds];
                  const [moved] = updated.splice(draggedIndex, 1);
                  updated.splice(index, 0, moved);
                  localBuilds = updated;
                }
                draggedIndex = null;
              }}
              animate:flip={{ duration: 300 }}
              out:fade={{ duration: 300 }}
            >
              <p style:grid-area="title" class="build-title">
                {build.name}
              </p>
              <div
                style:grid-area="main"
                class="build-image"
                role="img"
                aria-label={`Main character: ${global.database.characters.find((c) => c.id === build.mainId)?.name ?? "Invalid"}`}
                style:background-image="url({getCharacterPortraitUrl(
                  global.database.characters.find((c) => c.id === build.mainId)
                    ?.id,
                )}), url({getCharacterPortraitUrl()})"
              ></div>
              <div
                style:grid-area="sup1"
                class="build-image"
                role="img"
                aria-label={`Support character 1: ${global.database.characters.find((c) => c.id === build.support1Id)?.name ?? "Invalid"}`}
                style:background-image="url({getCharacterPortraitUrl(
                  global.database.characters.find(
                    (c) => c.id === build.support1Id,
                  )?.id,
                )}), url({getCharacterPortraitUrl()})"
              ></div>
              <div
                style:grid-area="sup2"
                class="build-image"
                role="img"
                aria-label={`Support character 2: ${global.database.characters.find((c) => c.id === build.support2Id)?.name ?? "Invalid"}`}
                style:background-image="url({getCharacterPortraitUrl(
                  global.database.characters.find(
                    (c) => c.id === build.support2Id,
                  )?.id,
                )}), url({getCharacterPortraitUrl()})"
              ></div>
              <div style:grid-area="buttons" class="build-buttons-container">
                <a
                  class="build-edit"
                  href={resolve("/build") +
                    `?&build=${encodeJson({ ...build, editMode: false })}`}
                  >View</a
                >
                <a
                  class="build-edit"
                  href={resolve("/build") +
                    `?&build=${encodeJson({ ...build, editMode: true })}`}
                  >Edit</a
                >
                <a
                  class="build-delete"
                  href={resolve("/")}
                  onclick={() => deleteBuild(build.id)}>Delete</a
                >
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .main-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background-color: var(--secondary-bg);
  }

  .background-image {
    position: absolute;
    object-fit: cover;
    width: 100%;
    height: 100%;
    object-position: center;
    filter: blur(6px) brightness(var(--brightness));
    transform: scale(1.2);
    transition: 0.2s;
  }

  .text-container {
    display: flex;
    position: relative;
    z-index: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    padding-top: 4rem;
    text-align: center;
    color: var(--white);
  }

  .text-container h1 {
    padding-top: 2rem;
    font-size: 4rem;
  }

  .text-container h2 {
    font-size: 2rem;
  }

  .text-container p {
    font-size: 1.5rem;
  }

  .button-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    font-size: 1.5rem;
    text-align: center;
  }

  @media (max-width: 768px) {
    .button-container {
      flex-direction: column;
    }
  }

  a.button {
    padding: 1rem 2rem;
    border-radius: 100px;
    background-color: var(--primary-bg-dark);
    text-decoration: none;
    transition: 0.2s;
    color: var(--primary);
  }

  a.button:hover {
    filter: brightness(0.95);
    transform: scale(1.05);
  }

  a.button:hover:active {
    filter: brightness(1.05);
    transform: scale(0.9);
  }

  .build-container {
    width: 90%;
    /*padding: 1rem;*/
    overflow-y: scroll;
    height: 50vh;
    position: relative;
    background-color: rgba(from var(--primary-bg) r g b / 0.25);
    border-radius: 4px;
  }

  .build-container-button {
    padding: 1rem 2rem;
    margin: 1rem 0.25rem;
    border-radius: 100px;

    &:hover {
      background-color: var(--primary-bg-darker);
    }
  }

  .build-grid {
    display: grid;
    /* Don't know how to avoid hardcoding... Can't seem to infer from child.
            Maybe that's just the css way */
    grid-template-columns: repeat(auto-fill, minmax(240px, 22rem));
    /*grid-template-rows: repeat(auto-fill, 11rem);*/
    grid-gap: 1rem;
    justify-content: center;
  }

  .build-card {
    display: grid;
    aspect-ratio: 22/11;
    grid-template-columns: 1fr 1fr 1fr auto;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "title  title   title   buttons"
      "main   sup1    sup2    buttons";
    background-color: var(--primary-bg);
    border-radius: 4px;
    gap: 0.5rem;
    padding: 0.5rem;
    align-self: start;
  }

  .build-card.draggable {
    cursor: grab;
    opacity: 0.95;
    border: 2px dashed var(--primary);
  }

  .build-card.draggable:active {
    cursor: grabbing;
    opacity: 0.8;
  }

  p.build-title {
    text-align: left;
    overflow: auto;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--primary);
    font-size: 1.25rem;
  }

  .build-image {
    width: 100%;
    height: 100%;
    background-color: var(--primary-bg-dark);
    border-radius: 4px;
    background-repeat: no-repeat;
    background-size: 130%;
    background-position: 50% 50%;
    filter: brightness(var(--brightness));
  }

  .build-buttons-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .build-buttons-container > a {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--primary-bg-dark);
    width: 100%;
    height: 100%;
    border-radius: 4px;
    padding: 0.5rem;
    user-select: none;
    transition: 0.2s;

    &:hover {
      background-color: var(--primary-bg-darker);
      transform: scale(1.05);
    }
  }

  .build-delete {
    color: var(--red);
  }

  .build-delete:hover {
    color: var(--secondary);
    background-color: var(--red) !important;
  }

  a {
    text-decoration: none;
    color: var(--primary);
  }
</style>

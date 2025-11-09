<script lang="ts">
    import { browser } from "$app/environment";
    import { base, resolve } from "$app/paths";
    import landing from "$lib/assets/landing.webp";
    import { encodeBuild, validate } from "$lib/build";
    import type { BuildData } from "$lib/buildData.types";
    import { database } from "$lib/database";
    import { localStorageBuildsKey } from "$lib/global";
    import { addToast } from "$lib/toastStore";
    import { getLocalStoredBuilds } from "$lib/util";
    import { flip } from "svelte/animate";
    import { fade } from "svelte/transition";

    let localBuilds = $state<BuildData[]>(getLocalStoredBuilds());

    $effect(() => {
      localStorage.setItem(localStorageBuildsKey, JSON.stringify(localBuilds));
    });

    function deleteBuild(buildId: string) {
      if (browser) {
        if (confirm("Are you sure you want to remove this build?")) {
          localBuilds = localBuilds.filter(b => b.id !== buildId);
          addToast({ message: "Build removed!", type: "success" });
        }
      }
    }

    function exportBuilds() {
      if (browser) {
        const builds = getLocalStoredBuilds();
        const blob = new Blob([JSON.stringify(builds, null, 2)], { type: "application/json" });
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

    function importBuilds() {
      if (browser) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";

        input.onchange = async (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) return;

          try {
            const text = await file.text();
            let importedBuilds = JSON.parse(text);

            if (!Array.isArray(importedBuilds)) {
              throw new Error("Invalid format: expected a JSON array.");
            }

            let hasInvalidBuild = false;
            for (let i = 0; i < importedBuilds.length; i++) {
              try {
                validate(importedBuilds[i]);
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
              const match = importedBuilds.findIndex((build) => build.id === existingBuilds[i].id);
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
          } catch (error) {
            console.error("Import failed:", error);
            addToast({ message: "Invalid format!", type: "error" });
          }
        };

        input.click();
      }
    }

</script>

<div class="main-container">
    <img class="background-image"  src={landing} alt="Landing" fetchpriority="high"/>
    <div class="text-container">
        <h1>Stella Sora Build</h1>
        <h2>Browse Trekker potentials and create custom builds to share!</h2>
        <div class="button-container">
            <a class="button primary" href={resolve("/build")}>Create a build</a>
            <a class="button" href={resolve("/trekker")}>Check out Trekkers</a>
        </div>
        {#if localBuilds.length === 0}
            <p>No builds yet!</p>
        {:else}
        <div class="build-container">
            <button onclick={exportBuilds}>Export all</button>
            <button onclick={importBuilds}>Import all</button>
            <div class="build-grid">
                {#each localBuilds as build (build.id)}
                    <div class="build-card"
                        animate:flip={{duration: 300}}
                        out:fade={{duration: 300}}
                    >
                        <p style:grid-area="title" class="build-title">{build.name}</p>
                        <div style:grid-area="main" class="build-image"
                            style:background-image="url({database.data.find(c => c.id === build.mainId)?.portraitUrl || ""})"
                            ></div>
                        <div style:grid-area="sup1" class="build-image"
                            style:background-image="url({database.data.find(c => c.id === build.support1Id)?.portraitUrl || ""})"
                            ></div>
                        <div style:grid-area="sup2" class="build-image"
                            style:background-image="url({database.data.find(c => c.id === build.support2Id)?.portraitUrl || ""})"
                            ></div>
                        <div style:grid-area="buttons" class="build-buttons-container">
                            <button class="build-edit" onclick={() => {
                              build.editMode = false;
                              window.location.href = (`${base}/build?&build=${encodeBuild(build)}`)}
                            }
                            >View</button>
                            <button class="build-edit" onclick={() => {
                              build.editMode = true;
                              window.location.href = (`${base}/build?&build=${encodeBuild(build)}`)}
                            }
                            >Edit</button>
                            <button class="build-delete" onclick={() => deleteBuild(build.id)}>Delete</button>
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
        filter: blur(6px) brightness(0.7);
        transform: scale(1.2);
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
    }

    .text-container h1 {
        color: var(--secondary);
        padding-top: 2rem;
        font-size: 4rem;
    }

    .text-container h2 {
        color: var(--secondary);
        font-size: 2rem;
    }

    .text-container p {
        color: var(--secondary);
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
    }

    a.button:hover {
        filter: brightness(0.95);
        transform: scale(1.05);
    }

    a.button:hover:active {
        filter: brightness(1.05);
        transform: scale(0.9);
    }

    a.primary {
        color: var(--secondary);
        background-color: var(--secondary-bg);
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

    .build-container > button {
        padding: 1rem;
        margin: 1rem;
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
            "main   sup1    sup2    buttons"
        ;
        background-color: var(--primary-bg);
        border-radius: 4px;
        gap: 0.5rem;
        padding: 0.5rem;
        align-self: start;
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
    }

    .build-buttons-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .build-buttons-container > button {
        background-color: var(--primary-bg-dark);
        width: 100%;
        height: 100%;
    }

    button.build-edit:hover {
        background-color: var(--primary-bg-darker);
    }

    button.build-delete {
        color: var(--red);
    }

    button.build-delete:hover {
        color: var(--secondary);
        background-color: var(--red);
    }
</style>

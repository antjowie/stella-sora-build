<script lang="ts">
    import { resolve } from "$app/paths";
    import landing from "$lib/assets/landing.webp";
    import type { BuildData } from "$lib/buildData.types";
    import { getLocalStoredBuilds } from "$lib/util";
    import { flip } from "svelte/animate";

    let localBuilds = $state<BuildData[]>(getLocalStoredBuilds());
</script>

<div class="main-container">
    <img src={landing} alt="Landing" fetchpriority="high" class="background-image" />
    <div class="text-container">
        <h1>Stella Sora Build</h1>
        <h2>Browse Trekker potentials and create custom builds to share!</h2>
        <div>
            <a class="button primary" href={resolve("/build")}>Make a build</a>
            <a class="button" href={resolve("/trekker")}>Check out Trekkers</a>
        </div>
        {#if localBuilds.length === 0}
            <p>No builds yet!</p>
        {/if}
        <div class="build-container">
            {#each localBuilds as build (build.id)}
                <div class="build-card"
                    animate:flip
                >
                    build
                </div>
            {/each}
        </div>
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

    img {
        position: absolute;
        object-fit: cover;
        width: 100%;
        height: 100%;
        object-position: center;
        filter: blur(6px) brightness(0.7);
        transform: scale(1.1);
    }

    .text-container {
        display: flex;
        position: relative;
        z-index: 100;
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

    .text-container div {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1rem;
        padding: 2rem;
        font-size: 1.5rem;
        text-align: center;
    }

    @media (max-width: 768px) {
        .text-container div {
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
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        /*font-size: 1.5rem;*/
    }

    .build-card {
        background-color: var(--primary-bg-dark);
        border-radius: 4px;
    }

</style>

<script lang="ts">
    import { resolve } from "$app/paths";
    import landing from "$lib/assets/landing.webp";
</script>

<svelte:head>
    <title>Stella Sora Build</title>
</svelte:head>

<div class="background" style="background-image: url({landing});"></div>
<div class="text-container">
    <h1>No custom builds found</h1>
    <div>
        <a class="button primary" href={resolve("/build")}>Make a build</a>
        <a class="button" href={resolve("/database")}>Check out Database</a>
    </div>
</div>

<style>
    .background {
        position: absolute;
        background-size: cover;
        background-position: bottom;
        background-repeat: no-repeat;
        background-attachment: fixed;
        filter: blur(6px) brightness(0.7);
        transform: scale(1.1);
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .text-container {
        display: flex;
        position: relative;
        z-index: 100;
        font-size: 2rem;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        padding-top: 4rem;
        text-align: center;
    }

    .text-container h1 {
        color: var(--secondary);
        padding: 2rem;
    }

    .text-container div {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1rem;
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
</style>

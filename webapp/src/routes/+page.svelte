<script lang="ts">
    import { resolve } from "$app/paths";
    import landing from "$lib/assets/landing.webp";
</script>

<div class="main-container">
    <img src={landing} alt="Landing" class="background-image" />
    <div class="text-container">
        <h1>No custom builds found</h1>
        <div>
            <a class="button primary" href={resolve("/build")}>Make a build</a>
            <a class="button" href={resolve("/database")}>Check out Database</a>
        </div>
    </div>
</div>

<style>
    .main-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
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

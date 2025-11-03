<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { databaseLoading, databaseError } from "$lib/database.svelte";
	import { page } from "$app/state";

	let { children } = $props();

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap" rel="stylesheet">
</svelte:head>

<div class="layout-wrapper">
	<nav>
		<a href="/" aria-current={page.url.pathname === '/'}>Builds</a>
		<a href="/database" aria-current={page.url.pathname.search('/database') >= 0}>Database</a>
	</nav>

	<main>
	{#if databaseLoading.value}
		<p>Loading database...</p>
	{:else if databaseError.value}
		<p>Failed to load database: {databaseError.value}</p>
	{:else}
		{@render children()}
	{/if}
	</main>

	<footer>
		<a href="https://github.com/yourusername/stella-sora-build">GitHub</a>
	</footer>
</div>

<style>
    :global(html, body) {
        background-color: #bbcfef;
        font-family: "Sora", sans-serif;
        font-optical-sizing: auto;
        font-weight: 450;
        font-style: normal;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        width: 100%;
        height: 100%;
    }

    .layout-wrapper {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    :global(*) {
        color: #3e4566;
        box-sizing: border-box;
    }

    nav a[aria-current=true]{border-bottom:2px solid}

    nav {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background-color: #9cadc8;
    }

    nav a {
        display: inline-block;
        color: #3e4566;
        text-decoration: none;
    }

    main {
        padding: 1rem;
        flex: 1;
    }

    footer {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        background-color: #9cadc8;
        width: 100%;
    }

    :global(label:has(input)) {
        padding: 0.5rem;
        border-radius: 64px;
        background-color: #9cadc8;
    }
</style>

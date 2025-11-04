<script lang="ts">
	import { databaseLoading, databaseError } from "$lib/database.svelte";
	import { page } from "$app/state";
	import { resolve, base } from "$app/paths";

	let { children } = $props();
</script>

<svelte:head>
    <!-- Favicon -->
	<link rel="icon" type="image/png" href={`${base}/favicon/favicon-96x96.png`} sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href={`${base}/favicon/favicon.svg`} />
    <link rel="shortcut icon" href={`${base}/favicon/favicon.ico`} />
    <link rel="apple-touch-icon" sizes="180x180" href={`${base}/favicon/apple-touch-icon.png`} />
    <meta name="apple-mobile-web-app-title" content="MyWebSite" />
    <link rel="manifest" href={`${base}/favicon/site.webmanifest`} />

    <!-- Meta data -->
    <title>{page.data.title}</title>
    <meta name="description" content={page.data.description} />
    <meta property="og:title" content={page.data.title} />
    <meta property="og:description" content={page.data.description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={page.url.href} />
    <meta property="og:image" content={page.data.ogImage} />

    <!-- Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</svelte:head>

<div class="main-container">
	<nav>
		<a class="underline" href={resolve("/")} aria-current={page.url.pathname === resolve(`/`)}>Home</a>
		<a class="underline" href={resolve("/build")} aria-current={page.url.pathname.search('/build') >= 0}>Build Editor</a>
		<a class="underline" href={resolve("/database")} aria-current={page.url.pathname.search('/database') >= 0}>Database</a>
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
		<a href="https://github.com/antjowie/stella-sora-build">GitHub</a>
	</footer>
</div>

<style>
    :global(*, *::before, *::after) {
        --primary: #264278;
        --secondary: #f9f9f7;
        --primary-bg: #fbf9f3;
        --primary-bg-dark: #f3efe7;
        --primary-bg-darker: #e7e3db;
        --secondary-bg: #49568b;
        --bg-stripe: #f9ebb3;
        font-family: "Noto Sans", sans-serif;
        font-optical-sizing: auto;
        color: var(--primary);
        box-sizing: border-box;
        padding: 0;
        margin: 0;
    }

    :global(html) {
      font-size: 16px;
    }

    @media (max-width: 768px) {
      :global(html) {
        font-size: 14px;
      }
    }

    @media (max-width: 480px) {
      :global(html) {
        font-size: 10px;
      }
    }

    :global(html, body) {
        background-color: var(--primary-bg);
        overflow-x: hidden;
    }

    :global(input) {
        padding: 0.5rem;
        border: 1px solid var(--primary-bg-dark);
        border-radius: 32px;
        outline: none;
        transition: 0.2s;
    }

    :global(label:has(input)) {
        padding: 0.5rem;
        border-radius: 64px;
        background-color: var(--primary-bg-dark);
    }

    :global(a) {
        text-decoration: none;
    }

    :global(.underline)  {
        position: relative;
        transition: 0.2s;
    }

    :global(.underline::before) {
        content: "";
        position: absolute;
        border-color: var(--secondary);
        border-style: solid;
        border-width: 1px;
        width: 100%;
        bottom: -3px;
        transition: 0.2s;
        transform: scaleX(0);
    }

    :global(.underline:hover::before) {
        transform: scaleX(1);
    }

    :global(.underline[aria-current=true]::before) {
        transform: scaleX(1);
    }

    .main-container {
        display: grid;
        grid-template-rows: auto 1fr auto;
        min-height: 100vh;
    }

    nav {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--secondary-bg);
        border-bottom: solid 12px var(--bg-stripe);
        z-index: 1;
    }

    nav a {
        color: var(--secondary);
    }

    main {
        /*
        My recommendation is to do all layout with grid, since you can avoid wrappers.
        This is just in case you do want to use position absolute
        */
        position: relative;
        padding: 1rem;
    }

    footer {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        background-color: var(--primary-bg-darker);
        z-index: 1;
    }
</style>

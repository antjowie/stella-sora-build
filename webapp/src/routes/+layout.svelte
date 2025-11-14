<script lang="ts">
	import { page } from "$app/state";
	import { resolve, base } from "$app/paths";
    import Toasts from "$lib/components/Toasts.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import { afterNavigate } from "$app/navigation";
    import { encodeJson, getLocalStoredBuilds } from "$lib/build";

    let { children } = $props();
	let shouldMigrate = $state(false);
	let showMigrationWarning = $state(false);
	let showMoreMigrationWarningDetails = $state(false);
	let migrationLink = $state("");
	afterNavigate(() => {
		if (page.url.host.includes("github")) {
		// if (base === "") {
		    shouldMigrate = true;
			showMigrationWarning = true;
			showMoreMigrationWarningDetails = false;
			migrationLink = "https://stellabuilds.pages.dev/";
			const localBuilds = getLocalStoredBuilds();
			const encodedBuilds = encodeJson(localBuilds);
			migrationLink = migrationLink + "?import=" + encodedBuilds;
		}
	});
</script>

<svelte:head>
    <!-- Favicon -->
	<link rel="icon" type="image/png" href={`${base}/favicon/favicon-96x96.png`} sizes="96x96" />
    <link rel="shortcut icon" href={`${base}/favicon/favicon.ico`} />
    <link rel="apple-touch-icon" sizes="180x180" href={`${base}/favicon/apple-touch-icon.png`} />
    <meta name="apple-mobile-web-app-title" content="Stella Sora Builds" />
    <link rel="manifest" href={`${base}/favicon/site.webmanifest`} />

    <!-- Meta data -->
    <title>{page.data.title}</title>
    <meta name="description" content={page.data.description} />
    <meta property="og:title" content={page.data.title} />
    <meta property="og:description" content={page.data.description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={page.url.href} />
    <meta property="og:image" content={page.data.ogImage} />
</svelte:head>

<div class="main-container">
	<nav>
		<a class="underline" href={resolve("/")} aria-current={page.url.pathname === resolve(`/`)}>Home</a>
		<a class="underline" href={resolve("/build")} aria-current={page.url.pathname.search('/build') >= 0}>Build</a>
		<a class="underline" href={resolve("/trekker")} aria-current={page.url.pathname.search('/trekker') >= 0}>Trekkers</a>
		{#if shouldMigrate}
		<p class="migration-warning">
			Outdated site, please use <a href="https://stellabuilds.pages.dev{page.route.id}">new site</a>
		</p>
		{/if}
	</nav>

	<Toasts />

	{#if showMigrationWarning}
	<Modal title="Site/URL outdated! Please go to new site" onClose={() => showMigrationWarning = false}>
	    {#snippet content()}
			<p style="font-size: 30px;">Please select one option below to reach the new site.</p>
			<button class="button primary" onclick={() => window.location.href = migrationLink}>Import old builds to new site</button>
			<button onclick={() => window.location.href = `https://stellabuilds.pages.dev${page.route.id}`}>Open this page on new site</button>
			<br/>
			<br/>
			<button onclick={() => showMoreMigrationWarningDetails = !showMoreMigrationWarningDetails}>More Details</button>
			{#if showMoreMigrationWarningDetails}
				<p>If the "import old builds to new site" somehow fails you might have too many custom builds. To work around this, you can go to <a href="/">home</a> and click "Export builds". Then on the new site click "Import builds".</p>

			<h3>Why</h3>
			<p>I moved the site from GitHub Pages to Cloudflare Pages for several reasons.</p>
			<ol style:padding-left="20px">
				<li>It has a nicer free domain.</li>
				<li>It prepares us for potentially adding databases and accounts.</li>
				<li>It supports building branch previews from the get go.</li>
				<li>Overall, it has more features and is more flexible.</li>
			</ol>
			<br/>
			<p>Your local builds are stored in your browser's local storage. Since this domain is different, your builds can't be accessed. So you have to manually import them.</p>
			<p>I don't expect this to migration to be required again. It would only happen if I purchase a domain but if it gets that far builds will likely be stored in a database, and accessed by user accounts.</p>
			{/if}			<br/>
		{/snippet}
	</Modal>
	{/if}

	<main style:padding={page.data.disableMainPadding ? "0" : "1rem"}>
	    {@render children()}
	</main>

	<footer>
		<a href="https://github.com/antjowie/stella-sora-build" target="_blank">GitHub</a>
	</footer>
</div>

<style>
    /* Generated with https://gwfh.mranftl.com/fonts/noto-sans?subsets=latin */
    /* noto-sans-regular - latin */
    @font-face {
      font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
      font-family: 'Noto Sans';
      font-style: normal;
      font-weight: 400;
      src: url('$lib/assets/fonts/noto-sans-v42-latin-regular.woff2') format('woff2'); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
    }

    /* noto-sans-500 - latin */
    @font-face {
      font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
      font-family: 'Noto Sans';
      font-style: normal;
      font-weight: 500;
      src: url('$lib/assets/fonts/noto-sans-v42-latin-500.woff2') format('woff2'); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
    }

    /* noto-sans-600 - latin */
    @font-face {
      font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
      font-family: 'Noto Sans';
      font-style: normal;
      font-weight: 600;
      src: url('$lib/assets/fonts/noto-sans-v42-latin-600.woff2') format('woff2'); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
    }

    /* noto-sans-700 - latin */
    @font-face {
      font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
      font-family: 'Noto Sans';
      font-style: normal;
      font-weight: 700;
      src: url('$lib/assets/fonts/noto-sans-v42-latin-700.woff2') format('woff2'); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
    }

    /* noto-sans-800 - latin */
    @font-face {
      font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
      font-family: 'Noto Sans';
      font-style: normal;
      font-weight: 800;
      src: url('$lib/assets/fonts/noto-sans-v42-latin-800.woff2') format('woff2'); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
    }

    /* noto-sans-900 - latin */
    @font-face {
      font-display: swap; /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
      font-family: 'Noto Sans';
      font-style: normal;
      font-weight: 900;
      src: url('$lib/assets/fonts/noto-sans-v42-latin-900.woff2') format('woff2'); /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
    }

    :root {
        --primary: #264278;
        --secondary: #f9f9f7;
        --primary-bg: #fbf9f3;
        --primary-bg-dark: #f3efe7;
        --primary-bg-darker: #e7e3db;
        --secondary-bg: #49568b;
        --bg-stripe: #f9ebb3;
        --green: #89b486;
        --light-red: #e55833;
        --red: #d14825;
    }

    :global(*, *::before, *::after) {
        font-family: inherit;
        box-sizing: inherit;
        padding: 0;
        margin: 0;
    }

    :global(html, body) {
      font-size: 16px;
      background-color: var(--primary-bg);
      scrollbar-color: var(--secondary-bg) rgba(0, 0, 0, 0);
      scrollbar-width: thin;
      font-family: "Noto Sans", sans-serif;
      font-optical-sizing: auto;
      color: var(--primary);
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      :global(html, body) {
        font-size: 14px;
      }
    }

    @media (max-width: 480px) {
      :global(html, body) {
        font-size: 10px;
      }
    }

    :global(button) {
        padding: 0.5rem 1rem;
        color: var(--primary);
        background-color: var(--primary-bg-dark);
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: 0.2s;
    }

    :global(button, rem) {
        font-size: 1rem;
    }

    :global(a.button.primary, button.primary) {
        color: var(--secondary) !important;
        background-color: var(--secondary-bg) !important;
    }

    :global(a.button.primary:hover, button.primary:hover) {
        background-color: var(--primary) !important;
    }

    :global(a:hover:active, button:hover:active) {
        transform: scale(1.0);
    }

    :global(button:hover) {
        background-color: var(--primary-bg-darker);
        transform: scale(1.05);
    }

    :global(input) {
        padding: 0.5rem;
        border: 1px solid var(--primary-bg-dark);
        border-radius: 64px;
        outline: none;
        background-color: var(--primary-bg-dark);
        transition: 0.2s;
    }

    :global(input:focus-within) {
        border-color: var(--secondary-bg);
    }

    :global(label:has(input), .interact-background) {
        background-color: var(--primary-bg-dark);
        padding: 0.5rem;
        border-radius: 64px;
        transition: 0.2s;
    }

    :global(.toggle) {
        user-select: none;
        border: 1px solid rgba(0, 0, 0, 0);
        /*cursor: pointer;*/
    }

    /*:global(.toggle > input) {
        cursor: pointer;
    }*/

    :global(.toggle:focus-within, .toggle:focus) {
        border-color: var(--secondary-bg);
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

    :global(textarea) {
        background-color: var(--primary-bg-dark);
        border: solid 1px var(--secondary);
        border-radius: 4px;
        padding: 0.5rem;
        resize: vertical;
        width: 100%;
    }

    /* End global styles*/
    .main-container {
        display: grid;
        grid-template-rows: auto 1fr auto;
        min-height: 100dvh;
        min-width: 100vw;
    }

    nav {
        position: sticky;
        top: 0;
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--secondary-bg);
        border-bottom: solid 12px var(--bg-stripe);
        z-index: 100;
    }

    nav > a{
        color: var(--secondary);
        text-decoration: none;
    }

    .migration-warning, .migration-warning a{
        color: var(--red);
        font-weight: bold;
    }

    main {
        /*
        My recommendation is to do all layout with grid, since you can avoid wrappers.
        This is just in case you do want to use position absolute
        */
        position: relative;
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

<script>
  import { base } from "$app/paths";
  import { database } from "$lib/database";
</script>

<h2>Page is work in progress</h2>
{#each database.discs as disc}
  <div><a href={`${base}/disc/${disc.id}`}>{disc.name}</a></div>
{/each}

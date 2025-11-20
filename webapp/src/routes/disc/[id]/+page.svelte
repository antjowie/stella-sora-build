<script>
  import { page } from "$app/state";
  import { database, getElementIconUrl } from "$lib/database";
  import { patchDescription } from "$lib/util";

  const disc = database.discs.find(
    (d) => d.id === parseInt(page.params.id ?? ""),
  );
  let level = $state(1);
  // svelte-ignore non_reactive_update
  let maxLevel = 0;
  if (disc) {
    maxLevel = disc.skills[0].params[0].values.length;
  }
</script>

<h2>Page is work in progress</h2>
{#if disc === undefined}
  <div>Disc not found</div>
{:else}
  <h2>
    <img src={getElementIconUrl(disc.element)} alt={disc.name} />{disc.name}
  </h2>
  <p>{disc.desc}</p>
  <div class="slider interact-background">
    <label for="slider">Lvl. {level}</label>
    <input
      id="slider"
      type="range"
      min="1"
      max={maxLevel}
      bind:value={level}
      step="1"
    />
  </div>
  {#each disc.skills as skill, idx}
    <h3>{skill.name}</h3>
    <p>{@html patchDescription(skill.desc, skill.params, level)}</p>
    <p>cost {skill.notes[Math.min(level - 1, skill.notes.length - 1)]}</p>
  {/each}
{/if}

<style>
  /*.toggles-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }*/

  p {
    white-space: pre-wrap;
  }

  .slider {
    position: sticky;
    top: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin: 0.5rem 0;
    max-width: 250px;
    z-index: 10;

    & > input {
      padding: 0;
    }
  }
</style>

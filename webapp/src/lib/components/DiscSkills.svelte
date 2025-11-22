<script lang="ts">
  import {
    type DiscSkill,
    type NotesCollection,
  } from "$lib/types/database.types";
  import { patchDescription } from "$lib/util";
  import Notes from "./Notes.svelte";

  interface Props {
    skills: DiscSkill[];
    levels: number[];
  }

  const { skills, levels }: Props = $props();
  const clampedLevelIdx = (level: number, skill: DiscSkill) =>
    Math.min(level, skill.params[0].values.length - 1);
  const getNotes = (skill: DiscSkill, level: number): [number, number][] =>
    skill.notes.map((note: NotesCollection) => [
      note.id,
      note.values[clampedLevelIdx(level - 1, skill)],
    ]);
</script>

{#each skills as skill, idx}
  {#if idx === 0}
    <h1>Melody</h1>
  {:else if idx === 1}
    <h1>Harmony</h1>
  {/if}
  <h3>
    {skill.name} Lvl.{clampedLevelIdx(levels[idx % levels.length] - 1, skill) +
      1}
  </h3>
  <p>
    {@html patchDescription(
      skill.desc,
      skill.params,
      levels[idx % levels.length],
    )}
  </p>
  <Notes notes={getNotes(skill, levels[idx % levels.length])} />
{/each}

<style>
  p {
    white-space: pre-wrap;
  }
</style>

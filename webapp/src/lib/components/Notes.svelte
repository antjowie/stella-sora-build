<script lang="ts">
  import { noteIds } from "$lib/global.svelte";
  import type { NotesPair } from "$lib/types/database.types";
  import { getNoteIconUrl } from "$lib/util";

  interface Props {
    notes: NotesPair[];
    onNoteChanged?: (id: number, value: number) => void;
    effectiveNoteIds?: number[];
  }

  const {
    notes = [],
    onNoteChanged,
    effectiveNoteIds: effectiveNotes = [],
  }: Props = $props();
  const editNotes: NotesPair[] = $derived(
    noteIds.map((id) => [id, notes.find((note) => note[0] === id)?.[1] || 0]),
  );
</script>

{#if notes.length > 0 || onNoteChanged}
  <div class="notes-container">
    {#each onNoteChanged ? editNotes : notes as note}
      <div class="note {effectiveNotes.includes(note[0]) ? 'highlight' : ''}">
        <img src={getNoteIconUrl(note[0])} alt="Note" />
        {#if onNoteChanged}
          <input
            type="number"
            value={note[1]}
            oninput={(e) => {
              let target = e.target as HTMLInputElement;
              const value = Number(target.value);
              target.value = value.toString();
              onNoteChanged(note[0], Math.max(0, Math.min(value, 99)));
            }}
          />
        {:else}
          <p>{note[1]}</p>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .notes-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .note {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /*padding: 0 0.1rem;*/
    padding-top: 0.5rem;
    text-align: center;
    border-radius: 32px;

    & img {
      width: 2em;
      transform: scale(1.5);
    }

    & input {
      color: var(--primary);
      width: 3em;
      text-align: center;
      appearance: textfield;
    }

    & p {
      /*background: var(--primary-bg-dark);*/
      padding: 0.5rem;
      border-radius: 32px;
    }
  }

  .note.highlight {
    background: var(--secondary-bg);
    color: var(--white);
    /*background: linear-gradient(
      to top,
      var(--primary-bg) 0%,
      var(--secondary-bg) 100%
    );*/
  }
</style>

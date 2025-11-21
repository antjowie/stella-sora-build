<script lang="ts">
  import { global } from "$lib/global.svelte";
  import CharacterButton from "$lib/components/CharacterButton.svelte";
  import FilteredItemSelect from "./FilteredItemSelect.svelte";
  import type { Character } from "$lib/types/database.types";

  interface Props {
    excludedIds?: number[];
    clickOverride?: (character: Character) => void;
  }

  const { excludedIds = [], clickOverride }: Props = $props();
  const items = global.database.characters.map((character) => ({
    id: character.id,
    name: character.name,
    element: character.element,
    rarity: character.rarity,
  }));
</script>

<FilteredItemSelect {excludedIds} {items}>
  {#snippet item(id)}
    <CharacterButton
      character={global.database.characters.find(
        (character) => character.id === id,
      )!}
      {clickOverride}
    />
  {/snippet}
</FilteredItemSelect>

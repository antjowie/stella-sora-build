<script lang="ts">
  import { global } from "$lib/global.svelte";
  import CharacterButton from "$lib/components/CharacterButton.svelte";
  import ItemSelect from "./ItemSelect.svelte";

  interface Props {
    excludedIds?: number[];
    clickOverride?: (id: number) => void;
  }

  const { excludedIds = [], clickOverride }: Props = $props();
  const items = global.database.characters.map((character) => ({
    id: character.id,
    name: character.name,
    element: character.element,
    rarity: character.rarity,
  }));
</script>

<ItemSelect {excludedIds} {items}>
  {#snippet item(id)}
    <CharacterButton
      character={global.database.characters.find(
        (character) => character.id === id,
      )!}
      {clickOverride}
    />
  {/snippet}
</ItemSelect>

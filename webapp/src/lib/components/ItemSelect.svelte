<script lang="ts">
  import { Element } from "$lib/types/database.types";
  import { getElementIconUrl } from "$lib/util";
  import type { Snippet } from "svelte";

  export interface Item {
    id: number;
    name: string;
    element: Element;
    rarity: number;
  }

  interface Props {
    excludedIds?: number[];
    items: Item[];
    item: Snippet<[number]>;
  }

  const { excludedIds = [], items, item }: Props = $props();

  let searchQuery = $state("");
  const allElementsStrings: string[] = Object.keys(Element).filter((key) =>
    isNaN(Number(key)),
  );
  let elementStrings = $state<string[]>([]);

  let filteredItems = $derived(
    items
      .filter(
        (item) =>
          (searchQuery.length === 0 ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (elementStrings.length === 0 ||
            elementStrings.includes(Element[item.element] as string)) &&
          (excludedIds.length === 0 || excludedIds.includes(item.id) === false),
      )
      .sort(
        (a, b) =>
          a.name.localeCompare(b.name) + (a.rarity * 100 - b.rarity * 100),
      ),
  );
</script>

<div class="main-container">
  <div class="filter-container">
    <input
      class="filter-item"
      type="text"
      placeholder="Search..."
      bind:value={searchQuery}
    />
    {#each allElementsStrings as elemString}
      <label class="filter-item toggle">
        <input
          type="checkbox"
          name="element"
          value={elemString}
          bind:group={elementStrings}
        />
        <img
          src={getElementIconUrl(Element[elemString as keyof typeof Element])}
          onerror={(e: any) => {
            e.target.src = getElementIconUrl();
          }}
          alt={elemString}
        />
      </label>
    {/each}
  </div>

  <div class="item-container">
    {#each filteredItems as filteredItem: (filteredItem.id)}
      {@render item(filteredItem.id)}
    {/each}
  </div>
</div>

<style>
  .main-container {
    display: flex;
    flex-direction: column;
  }

  .filter-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  .filter-item {
    display: flex;
    align-items: center;
    height: 2.5rem;
    color: var(--primary);
  }

  .toggle {
    position: relative;
    padding-right: 3.75rem;
  }

  .toggle img {
    position: absolute;
    top: 50%;
    right: 6px;
    width: 3rem;
    transform: translateY(-50%);
    filter: brightness(var(--brightness));
  }

  .item-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, 9rem);
    grid-gap: 1rem;
    justify-content: space-between;
    width: 100%;
  }

  @media (max-width: 13rem) {
    .item-container {
      grid-template-columns: repeat(auto-fill, 45%);
    }
  }
</style>

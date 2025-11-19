<script lang="ts">
  import {
    PotentialRarity,
    potentialRarityColorDesaturated,
  } from "$lib/database";
  import type { Potential } from "$lib/database.types";
  import { addToast } from "$lib/toastStore";
  import potentialBorder from "$lib/assets/borders/potential-border.webp";
  import potentialBorderActive from "$lib/assets/borders/potential-border-active.webp";
  import potentialBorderEdged from "$lib/assets/borders/potential-border-edged.webp";
  import potentialBorderEdgedActive from "$lib/assets/borders/potential-border-edged-active.webp";
  import Icon from "@iconify/svelte";
  import type { PotentialConfig } from "$lib/buildData.types";

  function clampLevel(inLevel: number): number {
    if (inLevel < 1) inLevel = 1;
    else if (inLevel > maxLevel) inLevel = maxLevel;
    return inLevel;
  }

  interface Props {
    potential: Potential;
    showBrief: boolean;
    showDesc: boolean;
    activePotentialIds?: number[];
    blockClick?: string;
    onClicked?: (id: number) => void;
    editMode: boolean;
    onPotentialConfigChanged?: (id: number, level: PotentialConfig) => void;
    potentialConfig: PotentialConfig;
  }

  const {
    potential,
    showBrief,
    showDesc,
    activePotentialIds = [],
    blockClick = undefined,
    onClicked,
    editMode,
    onPotentialConfigChanged,
    potentialConfig,
  }: Props = $props();

  const active = $derived(activePotentialIds.includes(potential.id));
  // We store params as [param1, param2, param3, ...]
  // But some params don't scale with level and only have 1 value
  // So max level is decided by biggest array, and others just repeat
  const maxLevel = Object.values(potential.params).reduce(
    (max, cur) => Math.max(cur.values.length, max),
    1,
  );

  const level = $derived(
    clampLevel(
      potentialConfig.level ??
        (potential.rarity === PotentialRarity.Main ? 1 : 6),
    ),
  );

  const priority = $derived(potentialConfig.priority ?? 0);

  const replaceText = (text: string) => {
    // Replace all span color with bold
    text = text.replace(/<span style="/g, '<b class="outline" style="');
    text = text.replace(/<\/span>/g, "</b>");
    text = text.replace(/\u000b/g, "<br/>");

    // Params are stored as &Param1&
    const paramRegex = /&[^&]*&/g;
    const paramTexts = text.match(paramRegex);
    if (paramTexts === null) return text;

    for (const paramText of paramTexts) {
      let idx = parseInt(
        paramText.slice("&Param".length, paramText.length - 1),
      );
      const params = potential.params.find((param) => param.idx === idx);
      if (params !== undefined) {
        const levelIdx = Math.min(level - 1, params.values.length - 1);
        const param = params.values[levelIdx];
        text = text.replace(paramText, param);
      } else {
        text = text.replace(paramText, "MISSING");
      }
    }

    return text;
  };

  function handleOnClick() {
    if (onClicked) {
      if (blockClick) {
        addToast({ message: blockClick, type: "error" });
      } else {
        onClicked(potential.id);
      }
    }
  }

  function handleLevelChange(event: Event) {
    event.stopPropagation();
    const target = event.target as HTMLDivElement;
    const value = target.textContent;
    let newLevel = level;
    if (value === "++") {
      newLevel = level + 5;
    } else if (value === "+") {
      newLevel = level + 1;
    } else if (value === "−−") {
      newLevel = level - 5;
    } else if (value === "−") {
      newLevel = level - 1;
    }

    newLevel = clampLevel(newLevel);

    if (newLevel !== level) {
      onPotentialConfigChanged?.(potential.id, {
        ...potentialConfig,
        level: newLevel,
      });
    }
  }

  function handlePriorityChange(event: Event, newPriority: number) {
    event.stopPropagation();
    if (potentialConfig.priority !== newPriority) {
      onPotentialConfigChanged?.(potential.id, {
        ...potentialConfig,
        priority: newPriority,
      });
    }
  }

  const scale = 0.4;
  const borderImage = $derived(
    showDesc || editMode
      ? `url("${active ? potentialBorderActive : potentialBorder}") 80 fill / ${scale * 80}px`
      : `url("${active ? potentialBorderEdgedActive : potentialBorderEdged}") 80 80 80 205 fill / ${scale * 80}px ${scale * 80}px ${scale * 80}px ${scale * 205}px`,
  );
  const showDescLayout = $derived(showDesc || editMode);
</script>

{#snippet priorityComponent(visualPriority: number, canEdit: boolean)}
  {#if visualPriority === 1}
    <div
      class="{canEdit ? 'button' : ''} priority"
      role="button"
      aria-current={priority === 1}
      onclick={(e) => handlePriorityChange(e, 1)}
      style:--color-bg="var(--red)"
    >
      <Icon
        icon="mdi:triangle-down"
        color="var(--red)"
        width="0.9em"
        height="0.9em"
      />
      <Icon icon="mdi:triangle-down-outline" color="white" />
    </div>
  {:else if visualPriority === 2}
    <div
      class="{canEdit ? 'button' : ''} priority"
      role="button"
      aria-current={priority === 2}
      onclick={(e) => handlePriorityChange(e, 2)}
      style:--color-bg="currentColor"
    >
      <Icon icon="mdi:horizontal-line" />
    </div>
  {:else if visualPriority === 3}
    <div
      class="{canEdit ? 'button' : ''} priority"
      role="button"
      aria-current={priority === 3}
      onclick={(e) => handlePriorityChange(e, 3)}
      style:--color-bg="var(--green)"
    >
      <Icon
        icon="mdi:triangle"
        color="var(--green)"
        width="0.9em"
        height="0.9em"
      />
      <Icon icon="mdi:triangle-outline" color="white" />
    </div>
  {/if}
{/snippet}

{#snippet nameComponent()}
  <div class="name">
    <span>{potential.name}</span>
    <div class="priority-container">
      {#if editMode}
        {@render priorityComponent(3, true)}
        {@render priorityComponent(2, true)}
        {@render priorityComponent(1, true)}
      {:else}
        {#if priority === 3}
          {@render priorityComponent(3, false)}
        {/if}
        <!-- {#if priority === 2}
          {@render priorityComponent(2, false)}
        {/if} -->
        {#if priority === 1}
          {@render priorityComponent(1, false)}
        {/if}
      {/if}
    </div>
  </div>
{/snippet}

{#snippet lvlComponent()}
  <div class="level {showDescLayout ? 'showDesc' : 'notShowDesc'}">
    Lv. {level}
    {#if editMode}
      <div class="edit clampedLevel">
        <div
          class="button {level == 1 ? 'disabled' : ''}"
          onclick={handleLevelChange}
        >
          −−
        </div>
        <div
          class="button {level == 1 ? 'disabled' : ''}"
          onclick={handleLevelChange}
        >
          −
        </div>
        <span>Lv. {level}</span>
        <div
          class="button {level == maxLevel ? 'disabled' : ''}"
          onclick={handleLevelChange}
        >
          +
        </div>
        <div
          class="button {level == maxLevel ? 'disabled' : ''}"
          onclick={handleLevelChange}
        >
          ++
        </div>
      </div>
    {/if}
  </div>
{/snippet}

<button
  class="potential
    {onClicked && blockClick ? 'disabled' : ''}
    {onClicked ? (active ? 'active' : 'inactive') : 'default'}"
  style:--color={potentialRarityColorDesaturated[potential.rarity]}
  style:border-image={borderImage}
  style:padding="28px"
  onclick={() => {
    handleOnClick();
  }}
>
  <!-- Put name first or after level based on layout for proper text select logic -->
  {#if showDescLayout}
    {@render nameComponent()}
    {@render lvlComponent()}
  {:else}
    {@render lvlComponent()}
    {@render nameComponent()}
  {/if}
  {#if showDesc}
    <p class="description">
      {@html replaceText(showBrief ? potential.descShort : potential.descLong)}
    </p>
  {/if}
</button>

<style>
  .disabled {
    /*pointer-events: none;*/
    opacity: 0.5 !important;
    cursor: not-allowed;
    transform: scale(1) !important;
  }

  .default:hover {
    transform: scale(1);
    cursor: auto;
  }

  .potential {
    --radius: 5px;
    --padding: 20px;
    --border-size: 32px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-content: start;
    user-select: text;
    transition: transform 0.2s;
    padding: var(--padding);
    background-image:
            /*radial-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.35)),*/
            /*radial-gradient(ellipse at top, rgba(255, 255, 255, 0), transparent),
              radial-gradient(ellipse at bottom, rgb(var(--color-rgb) / 0.9), transparent),*/
          /*linear-gradient(rgba(200, 200, 200, 0.25), rgba(200, 200, 200, 0.25)),*/
          /*linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),*/ linear-gradient(
      var(--color),
      var(--color)
    );
    /*background-color: var(--color);*/

    /* To add radius the border-image */
    mask-image: radial-gradient(circle at center, black 99%, transparent 100%);
    mask-composite: intersect;
    border-radius: 5px;
    -webkit-mask-image: radial-gradient(
      circle at center,
      black 99%,
      transparent 100%
    );
    -webkit-mask-composite: destination-in;
    color: var(--primary-content);
    filter: grayscale(0) brightness(var(--brightness));
  }

  .potential .name {
    font-weight: 700;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .priority-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .priority {
    display: grid;
    place-items: center;
    grid-template-columns: 1;
    grid-template-rows: 1;
    font-size: 1.25rem;
    height: 1.5rem;
    width: 1.5rem;

    --border-color: transparent;
    --radius: 100px;
    transition: 0.2s;
    box-shadow:
      inset var(--radius) var(--radius) var(--border-color),
      inset var(--radius) calc(-1 * var(--radius)) var(--border-color),
      inset calc(-1 * var(--radius)) calc(-1 * var(--radius))
        var(--border-color),
      inset calc(-1 * var(--radius)) var(--radius) var(--border-color);
  }

  :global(.priority svg) {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    /*filter: saturate(2);*/
    transition: 0.2s;
    /*filter: saturate(calc((2 - var(--brightness)) * 2));*/
  }

  :global(.button.priority[aria-current="true"]) {
    --border-color: var(--color-bg);

    & svg {
      color: white !important;
    }
  }

  .potential .level {
    position: relative;
    font-weight: 700;
    align-self: center;
  }

  .potential .level.showDesc {
    margin: 0.5rem 0 0 0;
    width: 80%;
    background-color: white;
  }

  .potential .level.notShowDesc {
    position: absolute;
    top: 5px;
    left: 2px;
    width: 64px;
    height: calc(var(--padding));
  }

  .potential .edit {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    height: 100%;
    z-index: 100;
    user-select: none;
  }

  .potential .edit div {
    padding: 0 4px;
  }

  .potential .description {
    text-align: left;
    margin: 0.5rem 0 0 0;
    font-weight: 500;
    font-size: 0.75rem;
  }

  @media (max-width: 472px) {
    .potential .description {
      font-size: 1rem;
    }
  }

  /* For the param values */
  :global(.outline) {
    /*-webkit-text-stroke: 3px var(--secondary);*/
    -webkit-text-stroke: 3px rgba(255, 255, 255, 0.75);
    paint-order: stroke fill;
    /*font-weight: 900;*/
    /*font-weight: ;*/
  }

  .button {
    background-color: var(--primary-bg-dark-content);

    transition: filter 0.2s;
    &:hover {
      filter: brightness(0.8);
    }
  }

  .active {
    --border-color: var(--green);
    filter: grayscale(0) brightness(var(--brightness));
    box-shadow:
      inset var(--radius) var(--radius) var(--border-color),
      inset var(--radius) calc(-1 * var(--radius)) var(--border-color),
      inset calc(-1 * var(--radius)) calc(-1 * var(--radius))
        var(--border-color),
      inset calc(-1 * var(--radius)) var(--radius) var(--border-color);
  }

  .inactive {
    --border-color: white;
    filter: grayscale(0.25) brightness(var(--brightness));
  }

  .active:hover:active,
  .inactive:hover:active {
    transform: scale(1);
  }

  .active:hover,
  .inactive:hover {
    transform: scale(1.01);
  }
</style>

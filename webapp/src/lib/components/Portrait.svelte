<script lang="ts">
  import type { Character } from '$lib/database.types';
  import { CharacterElement, characterGradeColor, characterElementColor, characterClassColor, CharacterClass, getElementIconUrl } from '$lib/database';
  import { resolve } from '$app/paths';

  interface Props {
      character: Character;
      clickOverride?: (character: Character) => void;
  }

  let { character, clickOverride }: Props = $props();
</script>

<div class="button-wrapper">
  <button
      class="button
      {character.grade == 1 ? 'grade-1' : 'grade-2'}
      "

      onclick={() =>
      {
        if (clickOverride) clickOverride(character)
        else window.location.href = resolve(`/trekker/${character.name}`);
      }
      }
      style:background-image="url({character.portraitUrl})"
      >
    <div class="button-content">
        <div class="halftone-color">
            <div class="halftone"></div>
        </div>
        <div
            class="character-info"
            style:background-color="{characterClassColor[character.class]}"
        >
            {CharacterClass[character.class]}
        </div>
        <div class="character-name">{character.name}</div>
    </div>
  </button>
  <img class="element-icon"
    src={getElementIconUrl(character.element)}
    alt={CharacterElement[character.element]} />
</div>



<style>
    .button-wrapper {
      position: relative;
      display: block;
      cursor: pointer;
      aspect-ratio: 265/362;
    }

    .button {
      --border-radius: 4px;
      --bottom-height: 20px;
      position: relative;
      border-radius: var(--border-radius);
      background: center/cover no-repeat;
      background-size: 110%;
      width: 100%;
      height: 100%;
      z-index: 1;
      overflow: hidden;
      font-weight: 600;
      padding: 0;
    }

    /* bottom and top*/
    .button::before {
        content: "";
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        background-position: top, bottom;
        background-repeat: no-repeat;
        background-size: 100% var(--border-radius), 100% var(--bottom-height);
        pointer-events: none;
        z-index: 2;
    }

    /* extra dark border */
    .button::after {
        content: "";
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        background-position: bottom;
        background-repeat: no-repeat;
        background-size: 100% var(--border-radius);
        filter: brightness(0.7);
        pointer-events: none;
        z-index: 4;
    }

    .button.grade-1::before {
        background-image:
            linear-gradient(90deg,rgba(219, 131, 239, 1) 0%, rgba(134, 167, 251, 1) 50%, rgba(126, 243, 247, 1) 100%),
            linear-gradient(90deg,rgba(219, 131, 239, 1) 0%, rgba(134, 167, 251, 1) 50%, rgba(126, 243, 247, 1) 100%);
    }

    .button.grade-1::after {
        background-image: linear-gradient(90deg,rgba(219, 131, 239, 1) 0%, rgba(134, 167, 251, 1) 50%, rgba(126, 243, 247, 1) 100%);
    }

    .button.grade-2::before {
        background-image:
            linear-gradient(90deg,rgba(245, 213, 92, 1) 0%, rgba(245, 243, 117, 1) 50%, rgba(241, 245, 203, 1) 100%),
            linear-gradient(90deg,rgba(245, 213, 92, 1) 0%, rgba(245, 243, 117, 1) 50%, rgba(241, 245, 203, 1) 100%);
    }

    .button.grade-2::after {
        background-image: linear-gradient(90deg,rgba(245, 213, 92, 1) 0%, rgba(245, 243, 117, 1) 50%, rgba(241, 245, 203, 1) 100%);
    }

    .button-content {
        display: grid;
        grid-template-rows: 1fr 6fr;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .halftone-color {
        content: "";
        position: absolute;
        inset: 0;

    }

    .halftone {
        content: "";
        position: absolute;
        inset: 0;

        background: white;
        filter:contrast(8) invert(100%) opacity(0.77);
        transform: scale(1.1);
        mix-blend-mode: screen;
    }

    @media (max-width: 768px) {
      .halftone {
          bottom: 6px;
      }
    }

    @media (max-width: 480px) {
      .halftone {
          bottom: 16px;
      }
      .character-info {
          font-size: 0.85rem !important;
      }
    }

    .halftone::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, black, transparent 32.5%);
    }

    .halftone::after {
        content: "";
        position: absolute;
        inset: 0;

        --stop1: 10%;
        --stop2: 75%;
        --size: 7px;

        background-image: radial-gradient(
          circle at center,
          black var(--stop1),
          transparent var(--stop2)),
        radial-gradient(
          circle at center,
          black var(--stop1),
          transparent var(--stop2))
        ;
        background-size: var(--size) var(--size);
        background-position: 0 0, calc(var(--size) * 0.5) calc(var(--size) * 0.5);
        mask-image: linear-gradient(to top, rgb(0 0 0), rgb(0 0 0 / 0) 60%);
    }
    .button-wrapper {
        transition: 0.2s;
    }

    .button-wrapper:hover {
        transform: scale(1.05);
    }

    .button-wrapper:active:hover {
        transform: scale(0.9);
    }

    button:hover {
        transform: scale(1.0);
    }

    button:active:hover {
        transform: scale(1.0);
    }

    .element-icon {
        position: absolute;
        top: -0.5rem;
        left: -0.5rem;
        right: 0;
        bottom: 0;
        width: 3rem;
        filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2));
        z-index: 5;
    }

    .character-info {
        position: absolute;
        top: var(--border-radius);
        right: 0;
        height: 2rem;
        width: 60%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary);
        filter: drop-shadow(0.75rem 4px 4px rgba(0, 0, 0, 0.2));
        clip-path: polygon(0 0,120% 0,120% 120%,10% 120%);
        font-size: 1em;
    }

    .character-name {
        position: absolute;
        right: 5px;
        bottom: var(--bottom-height);
        margin: 0;
        font-size: 1.25em;
    }
</style>

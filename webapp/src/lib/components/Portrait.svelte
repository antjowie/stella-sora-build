<script lang="ts">
  import type { Character } from '$lib/database.types';
  import { CharacterElement, characterGradeColor, characterElementColor, characterClassColor, CharacterClass  } from '$lib/database';
  import { resolve } from '$app/paths';

  interface Props {
      character: Character;
      disabled?: boolean;
      clickOverride?: (character: Character) => void;
  }

  let { character, disabled = false, clickOverride }: Props = $props();
</script>

<a
	class="button
	{disabled ? "disabled" : ""}
	"
	href={clickOverride === undefined ? resolve(`/trekker/${character.name}`) : ""}
	onclick={() => clickOverride && clickOverride(character)}
	data-sveltekit-preload-data="hover"
	style:--grade-color={characterGradeColor[character.grade]}
	style:background-image="url({character.portraitUrl})"
	>
	<div class="character-info">
    <li
        style:background-color="{characterElementColor[character.element]}"
    >
            {CharacterElement[character.element]}</li>
    <li
        style:background-color="{characterClassColor[character.class]}"
    >
            {CharacterClass[character.class]}</li>
	</div>
	<div class="character-name">
	    <p>{character.name}</p>
	</div>
</a>

<style>
	.button {
        display: grid;
        grid-template-rows: 1fr 6fr;
        border-radius: 0.5rem;
        transition: 0.2s;
        /*height: 220px;*/
        /*width: 150px;*/
        aspect-ratio: auto 140/200;
        border-top: solid 0.5rem var(--grade-color);
        border-bottom: solid 1.25rem var(--grade-color);
        box-shadow: 0 4px 0 hsl(from var(--grade-color) h calc(s - 50) calc(l - 20)), 0 6px 5px rgba(0,0,0, 0.3);
        position: relative;
        font-weight: 600;
        background-repeat: no-repeat;
        background-size: 120% 120%;
        background-position: 50% 0%;
    }

    .button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to top,
        rgba(240, 247, 250, 0.8) 10%,
        rgba(240, 247, 250, 0) 25%);
        pointer-events: none;
    }

    .button:hover:not(.disabled) {
        transform: scale(1.05);
    }

    .button:active:hover:not(.disabled) {
        transform: scale(0.9);
    }

    .character-info {
        display: grid;
        grid-template-columns: 2fr 3fr;
        z-index: 1;
        /*overflow-x: hidden;*/
    }

    .character-info li {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary);
        box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
        /*text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;*/
    }

    .character-name p {
        position: absolute;
        right: 6px;
        bottom: 2px;
        margin: 0;
    }
</style>

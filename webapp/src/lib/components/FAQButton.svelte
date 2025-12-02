<script lang="ts">
  import type { Snippet } from "svelte";

  export let title: string;
  export let children: Snippet;

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<button
  onclick={toggle}
  aria-expanded={isOpen}
  aria-controls="content-{title.replace(/\s+/g, '-').toLowerCase()}"
>
  <div class="header-content">
    <h4 class="title">{title}</h4>
    <svg
      class="chevron {isOpen ? 'rotated' : ''}"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>

  <p class={isOpen ? "open" : ""}>
    {@render children()}
  </p>
</button>

<style>
  button {
    display: flex;
    flex-direction: column;
    align-items: left;
    margin-bottom: 0.5rem;
    padding: 0.5rem 1rem;

    border: 1px solid var(--secondary-bg);
    border-radius: 0.75rem;

    width: 100%;
    background-color: transparent;

    &:hover {
      transform: scale(1);

      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);

      background-color: var(--primary-bg-dark);
    }

    & .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      & .title {
        font-weight: 600;
      }

      & .chevron {
        transition: transform 0.2s;
        flex-shrink: 0;
        margin-left: 1rem;
      }

      & .chevron.rotated {
        transform: rotate(-180deg);
      }
    }

    & p {
      max-height: 0;
      overflow: hidden;
      text-align: left;
      color: var(--primary);
      transition:
        max-height 0.2s,
        padding 0.2s;

      &.open {
        max-height: 10rem;
        padding-top: 0.5rem;
      }
    }
  }
</style>

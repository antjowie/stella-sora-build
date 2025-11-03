<script lang="ts">
    import { resolve } from "$app/paths";
</script>

<div class="background" style="background-image: url({resolve('/landing.jpg',{})});"></div>
<div class="main">
    <h1>No custom builds found</h1>
    <div>
        <a class="button primary" href={resolve("/build",{})}>Make a build</a>
        <a class="button" href={resolve("/database",{})}>Check out Database</a>
    </div>
</div>

<style>
    .primary {
        background-color: #49568b !important;
        color: white;
    }

    .background {
        position: absolute;
        background-size: cover;
        background-position: bottom;
        background-repeat: no-repeat;
        background-attachment: fixed;
        filter: blur(6px) brightness(0.7);
        transform: scale(1.1);
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .main {
        position: relative;
        z-index: 100;
        font-size: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        /*padding-top: 4rem;*/
    }

    .main h1 {
        color: white;
        padding: 2rem;
    }

    .main div {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1rem;
        text-align: center;
    }

    .button {
        padding: 1rem 2rem;
        border-radius: 100px;
        background-color: #f3efe7;
        text-decoration: none;
        transition: 0.2s;
    }

    .button:hover {
        background-color: #f3efe7;
        transform: scale(1.05);
    }

    /*.button:hover:active {
        background-color: #f3efe7;
        transform: scale(0.8);
    }*/

    @media (max-width: 768px) {
        .main {
            font-size: 1.5rem;
        }

        .button {
            font-size: 1rem;
        }

        .main div {
            flex-direction: column;
        }
    }
</style>

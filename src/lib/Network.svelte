<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let status: "host" | "client" | null;
    export let room_id: null | string;

    let room_id_text: string;
    let name: string;

    const dispatch = createEventDispatcher();
</script>

<style>
    .networking {
        position: fixed;
        z-index: 1;
        top: 24px;
        left: 24px;
        background: #fff;
        padding: 12px;
    }
</style>
    

<div class="networking">
    {#if status == null}
    <input type="text" bind:value={name} placeholder="name" />
    <button on:click={() => dispatch("host")}>Host</button>

    <input type="text" bind:value={room_id_text} placeholder="Room ID" />
    <button on:click={() => dispatch("join", { room_id: room_id_text, name: name })}>Join</button>
    {:else if status == "host"}
    <p>Room ID: {room_id}</p>
    {:else if status == "client"}
    <p>Room ID: {room_id}</p>
    {/if}
</div>
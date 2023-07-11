
<script lang="ts">
import Player from '$lib/Player.svelte';
import Wall from '$lib/Wall.svelte';
import Room from '$lib/Room.svelte';

import type * as wld from "$lib/world";

export let world: wld.World;
export let x: number;
export let y: number;
</script>
<style>
.world {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: hsl(100, 50%, 70%);
}
</style>
<div class="world">
{#if world}
{#each Object.entries(world.things) as [id, thing]}
    {#if thing.type == "player"}
<Player x={thing.x - x} y={thing.y - y} />
    {:else if thing.type == "wall"}
<Wall x={thing.x - x} y={thing.y - y} w={thing.w} h={thing.h} texture_id={thing.texture_id} />
    {:else if thing.type == "room"}
<Room x={thing.x - x} y={thing.y - y} w={thing.w} h={thing.h} background_id={thing.background_id} />
    {/if}
{/each}
{/if}
</div>
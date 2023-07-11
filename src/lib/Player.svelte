<script lang="ts">
export let x: number;
export let y: number;
</script>

<style>
.player {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: hsl(280, 100%, 50%);
    border-radius: 10px;

    position: absolute;

    margin-top: 50vh;
    margin-left: 50%;
    transform: translate(-10px, -10px)
}
</style>

<div class="player" style={"top:" + (y*24) + "px;left:" + (x*24) + "px"}>      
</div>
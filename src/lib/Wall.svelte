<script lang="ts">
    export let x: number;
    export let y: number;
    export let w: number;
    export let h: number;
    export let texture_id: number;
</script>

<style>
.wall {
    display: inline-block;
    width: 24px;
    height: 24px;
    background: #000;

    position: absolute;
    margin-top: 50vh;
    margin-left: 50%;
    transform: translate(-12px, -12px);
}
.texture-0 {
    background: hsl(220, 5%, 55%);
}
.texture-1 {
    background: hsl(20, 25%, 55%);
}
</style>

<div class={"wall texture-" + texture_id} style={"top:" + (y*24) + "px;left:" + (x*24) + "px;width:" + (w*24) + "px;height:" + (h*24) + "px"}>      
</div>
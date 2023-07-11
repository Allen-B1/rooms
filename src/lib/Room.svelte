<script lang="ts">
    export let x: number;
    export let y: number;
    export let w: number;
    export let h: number;
    export let background_id: number;
</script>

<style>
.room {
    display: inline-block;
    width: 24px;
    height: 24px;
    background: #000;

    position: absolute;
    margin-top: 50vh;
    margin-left: 50%;
    transform: translate(-12px, -12px);

    z-index: -1;
}
.background-0 {
    background: hsl(220, 5%, 70%);
}
.background-1 {
    background: hsl(20, 25%, 70%);
}
</style>

<div class={"room background-" + background_id} style={"top:" + (y*24) + "px;left:" + (x*24) + "px;width:" + (w*24) + "px;height:" + (h*24) + "px"}>      
</div>
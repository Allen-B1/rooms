<script lang="ts">
    export const prerender = true;

    import World from '$lib/World.svelte';
    import Network from '$lib/Network.svelte';
    import * as wld from '$lib/world';
    import { writable, type Writable } from 'svelte/store';
    import { broadcast } from '$lib/utils';

    const world: Writable<wld.World> = writable(wld.Worlds.default());
    let player_id = "me";
    let status: null | "host" | "client" = null;
    let room_id: null | string = null;
    let client_dc = null;

    let mic: Writable<MediaStream | null> = writable(null);

    const PEER_PREFIX = "tsbx-";
/*    const PEER_OPTIONS = {
        key: "peerjs", 
        host: "localhost",
        port: 9000,
    }; */
    const PEER_OPTIONS = {};

    function host() {
        setup_mic();

        let peer = new Peer(PEER_PREFIX + Math.random().toString(36).slice(2), PEER_OPTIONS);
        let connections = {};
        let mediaConnections = {};
        let audios: Record<string, HTMLAudioElement> = {};

        function setupMedia(mc) {
            mediaConnections[mc.peer] = mc;
            mc.on("stream", function(stream) {
                let audio = new Audio();
                audio.srcObject = stream;
                audio.play();
                audios[mc.peer] = audio;
            });
            mc.on("close", function() {
                delete mediaConnections[mc.peer];
                delete audios[mc.peer];
            });
        }

        peer.on("open", function() {
            console.log("connected with id: " +peer.id);

            status = "host";
            room_id = peer.id.slice(PEER_PREFIX.length);
            $world.players[peer.id] = player_id;

            peer.on("connection", function(dc) {
                dc.on("open", function() {
                    console.log("connected to remote peer " + dc.peer);

                    // maintain connections
                    connections[dc.peer] = dc;

                    // create Thing
                    let thing_id = Math.random().toString(36).slice(2);
                    $world.things[thing_id] = {
                        type: "player",
                        name: dc.metadata.name,
                        x: 1,
                        y: 1,
                    };
                    $world.players[dc.peer] = thing_id;

                    // send thing id
                    dc.send(["player_id", thing_id]);
                    dc.send(["world", $world]);
                    broadcast(connections, ["player_join", {id: thing_id, peer_id: dc.peer}]);

                    // initiate call
                    let mc = peer.call(dc.peer, $mic);
                    setupMedia(mc);

                    // handle events
                    dc.on("data", function(data: [string, any]) {
                        let [type, payload] = data;
                        switch (type) {
                        case "move":
                            let x = payload.x;
                            let y = payload.y;
                            
                            if (Math.abs($world.things[thing_id].x - x) + Math.abs($world.things[thing_id].y - y) == 1) {
                                $world.things[thing_id].x = x;
                                $world.things[thing_id].y = y;
                            }
                        }
                    });

                    dc.on("close", function() {
                        delete connections[dc.peer];

                        world.update(function (world) {
                            delete world.things[thing_id];
                            delete world.players[dc.peer];
                            return world;
                        });
                        

                        broadcast(connections, ["player_leave", {id: thing_id, peer_id: dc.peer}]);
                    });
                });
            });

            world.subscribe((world) => {
                broadcast(connections, ["world", world]);
            });

            mic.subscribe((stream) => {
                for (let peer_id of Object.keys($world.players)) {
                    let mc = peer.call(peer_id, stream);
                    setupMedia(mc);
                }
            });

            peer.on("call", function(mc) {
                mc.answer($mic);
                setupMedia(mc);
            });
        });
    }

    function join(room_id_: string, name: string) {
        setup_mic();

        console.log('joining?' + room_id + ";" + name);
        let peer_id = PEER_PREFIX + room_id_;
        let peer = new Peer(PEER_PREFIX + Math.random().toString(36).slice(2), PEER_OPTIONS);
        
        let peers = new Set([peer_id]);
        let mediaConnections = {};
        let audios: Record<string, HTMLAudioElement> = {};

        function setupMedia(mc) {
            mediaConnections[mc.peer] = mc;
            mc.on("stream", function(stream) {
                let audio = new Audio();
                audio.srcObject = stream;
                audio.play();
                audios[mc.peer] = audio;
            });
            mc.on("close", function() {
                delete mediaConnections[mc.peer];
                delete audios[mc.peer];
            });
        }

        peer.on("open", function() {
            console.log('connecting to ' + peer_id + "...");
            let dc = peer.connect(peer_id, {metadata: {name: name}});
            dc.on("open", function() {
                console.log("connected to the world");
                status = "client";
                room_id = room_id_;
                client_dc = dc;
            });
            dc.on("data", function(data) {
                let [type, payload] = data;
                switch (type) {
                case "player_id":
                    player_id = payload;
                    break;
                case "player_join":
                    peers.add(payload.peer_id);
                    let mc = peer.call(payload.peer_id, $mic);
                    setupMedia(mc);
                    break;
                case "player_leave":
                    peers.delete(payload.peer_id);
                    break;
                case "world":
                    console.log("world", payload);
                    $world = payload;
                    break;
                }
            });
            dc.on("close", function() {
                status = null;
                room_id = null;
                client_dc = null;
            });
        });

        peer.on("call", function(mc) {
            mc.answer($mic);
            setupMedia(mc);
        });

        mic.subscribe((stream) => {
            for (let peer_id of peers) {
                let mc = peer.call(peer_id, stream);
                setupMedia(mc);
            }
        });
    }

    function on_keypress(evt: KeyboardEvent) {
        if (["w", "a", "s", "d"].includes(evt.key)) {
            let target_x = $world.things[player_id].x,
                target_y = $world.things[player_id].y;

            switch (evt.key) {
            case "w": target_y -= 1; break;
            case "a": target_x -= 1; break;
            case "d": target_x += 1; break;
            case "s": target_y += 1; break;
            }

            if (wld.Worlds.getForeground($world, target_x, target_y) != null) {
                return;
            }

            if (status != "client") {
                $world.things[player_id].x = target_x;
                $world.things[player_id].y = target_y;
            } else {
                client_dc.send(["move", {x: target_x, y: target_y}])
            }
        }
    };

    function setup_mic() {
        navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function (stream) {
            $mic = stream;
        });
    }
</script>
<Network status={status} room_id={room_id} on:host={host} on:join={(evt) => join(evt.detail.room_id, evt.detail.name)} />
<World world={$world} x={$world.things[player_id] && $world.things[player_id].x} y={$world.things[player_id] && $world.things[player_id].y} />
<svelte:window on:keypress={on_keypress} />
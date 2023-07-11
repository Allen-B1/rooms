export interface World {
    things: Record<string, Thing>,
};

export type Thing = Player | Wall | Room;
interface BaseThing {
    type: string,
    x: number,
    y: number,
}
export interface Player extends BaseThing { 
    type: "player",
    name: string,
    peer_id: null | string,
}
export interface Wall extends BaseThing {
    type: "wall",
    texture_id: number,
    w: number,
    h: number,
}
export interface Room extends BaseThing {
    type: "room", 
    background_id: number,
    w: number,
    h: number,
}

export const Things = {
    isForeground(thing: Thing) {
        return thing.type == "wall";
    },
    dimensions(thing: Thing) {
        switch (thing.type) {
        case "player": return {w: 1, h: 1};
        case "wall":
        case "room": return {w: thing.w, h: thing.h};
        }
    }
}

export const Worlds = {
    /** Expensive O(things) computation */
    getForeground(world: World, x: number, y: number): string {
        for (let [id, thing] of Object.entries(world.things)) {
            let dimen = Things.dimensions(thing);
            if (Things.isForeground(thing) && thing.x <= x && x < thing.x + dimen.w &&
                    thing.y <= y && y < thing.y + dimen.h) {
                return id;
            }
        }
    },

    default(): World {
        return {
            things: {
                me: { type: "player", name: "Host", x: 0, y: 0, peer_id: null },
                wall1: { type: "wall", x: -5, y: -3, w: 11, h: 1, texture_id: 0 },
                wall2: { type: "wall", x: -5, y: -3, w: 1, h: 7, texture_id: 0 },
                wall3: { type: "wall", x: 5, y: -3, w: 1, h: 7, texture_id: 0 },
                wall4: { type: "wall", x: -5, y: 3, w: 9, h: 1, texture_id: 0 },
                room: { type: "room", x: -5, y: -3, w: 11, h: 7, background_id: 0 }
            }
        };
    }
}
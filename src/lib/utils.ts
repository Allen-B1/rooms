export function broadcast(connections: Record<string, any>, data: any) {
    for (let conn of Object.values(connections)) {
        conn.send(data);
    }
}

export function mute(stream: MediaStream) {
    let tracks = stream.getAudioTracks();
    for (let i = 0; i < tracks.length; i++) {
        let track = tracks[i];
        track.enabled = false;
    }
}

export function unmute(stream: MediaStream) {
    let tracks = stream.getAudioTracks();
    for (let i = 0; i < tracks.length; i++) {
        let track = tracks[i];
        track.enabled = true;
    }
}
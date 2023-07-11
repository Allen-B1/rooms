export function broadcast(connections: Record<string, any>, data: any) {
    for (let conn of Object.values(connections)) {
        conn.send(data);
    }
}
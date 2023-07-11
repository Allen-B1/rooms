export function broadcast(connections: any[], data: any) {
    for (let conn of connections) {
        conn.send(data);
    }
}
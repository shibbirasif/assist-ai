import net from "net";

export async function findAvailablePort(startPort: number, endPort = 65535): Promise<number> {
    for (let port = startPort; port <= endPort; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error(`No available port in range ${startPort}-${endPort}`);
}

function isPortAvailable(port: number) {
    return new Promise<boolean>((resolve) => {
        const server = net.createServer();
        server.listen(port, 'localhost', () => {
            server.close(() => resolve(true));
        });
        server.on('error', () => resolve(false));
    });
}

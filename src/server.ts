import { createServer, Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import colors from 'colors';
import { validateConfig } from './DB/configValidation';
import { connectToDatabase } from './DB/db';
import app from './app';
import config from './config';
import { logger } from './shared/logger';
import { socketHelper } from './helpers/socketHelper';
import { setupProcessHandlers } from './DB/processHandlers';
import { setupSecurity } from './DB/security';
import { setupCluster } from './DB/cluster';

// Define the types for the servers
let httpServer: HttpServer;
let socketServer: SocketServer;

// Function to start the server
export async function startServer() {
     try {
          // Validate config
          validateConfig();
          // Connect to the database
          await connectToDatabase();
          // Create HTTP server
          httpServer = createServer(app);
          const port = Number(config.port);
          const ipAddress = config.ip_address as string;

          // Set timeouts
          httpServer.timeout = 120000;
          httpServer.keepAliveTimeout = 5000;
          httpServer.headersTimeout = 60000;

          // Set up Socket.io server
          socketServer = new SocketServer(httpServer, {
               cors: {
                    origin: config.allowed_origins || '*',
               },
          });

          socketHelper.socket(socketServer);
          //@ts-ignore
          global.io = socketServer;

          // Start HTTP server with Socket.IO attached
          httpServer.listen(port, '0.0.0.0', () => {
               logger.info(colors.yellow(`♻️  Application and Socket.IO listening on http://${ipAddress}:${port}`));
          });
     } catch (error) {
          logger.error(colors.red('Failed to start server'), error);
          process.exit(1);
     }
}
// Set up error handlers
setupProcessHandlers();
// Set up security middleware
setupSecurity();
if (config.node_env === 'production') {
     setupCluster();
} else {
     startServer();
}
// Export server instances
export { httpServer, socketServer };

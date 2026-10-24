import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectRedis } from "./config/redis.js";
import { initSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 8000;

if (!PORT) {
  console.error("Error: PORT is not defined. Please configure PORT in your .env file or environment.");
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectRedis();
  } catch (error) {
    console.error("Failed to connect to Redis on startup:", error.message || error);
  }

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

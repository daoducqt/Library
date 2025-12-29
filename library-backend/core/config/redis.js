// // d:\Library\library-backend\core\config\redis.js
// import IORedis from "ioredis";

// let redisClient = null;

// if (process.env.REDIS_URL) {
//   try {
//     redisClient = new IORedis(process.env.REDIS_URL, {
//       retryStrategy: (times) => {
//         if (times > 3) {
//           console.warn("❌ Redis connection failed after 3 retries. Running without Redis.");
//           return null; // Stop retrying
//         }
//         return Math.min(times * 100, 2000);
//       },
//       maxRetriesPerRequest: 3,
//     });

//     redisClient.on("connect", () => {
//       console.log("✅ Connected to Redis server");
//     });

//     redisClient.on("error", (err) => {
//       console.error("⚠️ Redis connection error:", err.message);
//       // Không set null ở đây, để retry strategy handle
//     });

//     redisClient.on("close", () => {
//       console.warn("⚠️ Redis connection closed");
//     });

//   } catch (error) {
//     console.error("❌ Failed to initialize Redis client:", error.message);
//     redisClient = null;
//   }
// } else {
//   console.warn("⚠️ REDIS_URL not configured. Running without Redis.");
// }

// export { redisClient };
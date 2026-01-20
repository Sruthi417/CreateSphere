import "./config/env.js";
import { PORT } from "./config/env.js";

import app from "./app.js";
import { connectToDatabase } from "./config/database.js";

// ✅ import cleanup worker
import { startChatbotCleanupWorker } from "./utils/cleanup.js";

const startServer = async () => {
  try {
    await connectToDatabase();

    const port = PORT || 5001;

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);

      // ✅ Start worker only after server is running
      startChatbotCleanupWorker();
      console.log("✅ Chatbot cleanup worker started");
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
};

startServer();

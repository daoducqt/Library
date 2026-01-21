import chatRoutes from "./chat.routes.js";

const ChatRouter = (app) => {
  app.use("/api/chat", chatRoutes);
};

export default ChatRouter;

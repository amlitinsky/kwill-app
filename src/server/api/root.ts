import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { messageRouter } from "./routers/message";
import { chatRouter } from "./routers/chat";
import { meetingRouter } from "./routers/meeting";
import { toolRouter } from "./routers/tool";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chat: chatRouter,
  message: messageRouter,
  tool: toolRouter,
  meeting: meetingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

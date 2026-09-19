/** Result shape for server actions that delete something. Expected failures are returned, not thrown, so the message survives in production. */
export type DeleteResult = { success: true } | { success: false; error: string };

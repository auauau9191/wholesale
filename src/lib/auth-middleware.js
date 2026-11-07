import { createMiddleware } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { getFreshAccessToken } from "@/lib/backend/client";
import { createClientFromRequest } from "@/lib/backend/client.server";

// Both middlewares hand handlers the same lazy `context.getBase44()`: a function, not the
// client, so a handler that never touches the data opens no database connection. The name
// is kept from the app's Base44 days; it now returns the Supabase backend
// (src/lib/backend/client.server.js) with the same API. The connection closes when the
// handler is done.
const withGetBase44 = async (next, request = getRequest()) => {
  let client;
  try {
    return await next({ context: { getBase44: () => (client ??= createClientFromRequest(request)) } });
  } finally {
    if (client) await client.end();
  }
};

// Applied to every server function by src/start.js: sends the visitor's access token with
// the call so `context.getBase44()` acts as the visitor. Anonymous visitors send nothing.
export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const token = typeof window === "undefined" ? null : await getFreshAccessToken();
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  })
  .server(({ next }) => withGetBase44(next));

// Applied to every request by src/start.js, so a server route handler
// (`server.handlers`) receives the same `context.getBase44()` as a server function.
export const base44RequestMiddleware = createMiddleware({ type: "request" }).server(({ next, request }) =>
  withGetBase44(next, request),
);

// Only an auth rejection means "not signed in"; outages propagate as themselves.
const currentUser = (context) =>
  context
    .getBase44()
    .auth.me()
    .catch((error) => {
      if (error?.status === 401 || error?.status === 403) return null;
      throw error;
    });

// Add this to a server function that needs a signed-in caller; it rejects anonymous callers
// and sets `context.user`:
//   createServerFn().middleware([requireUser]).handler(({ context }) => context.user.id)
export const requireUser = createMiddleware({ type: "function" }).server(async ({ next, context }) => {
  const user = await currentUser(context);
  if (!user) {
    setResponseStatus(401);
    throw Object.assign(new Error("Unauthorized"), { status: 401, code: "UNAUTHORIZED" });
  }
  return next({ context: { user } });
});

// The same for a server route: `server: { middleware: [requireUserRoute], handlers }`.
export const requireUserRoute = createMiddleware({ type: "request" }).server(async ({ next, context }) => {
  const user = await currentUser(context);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return next({ context: { user } });
});

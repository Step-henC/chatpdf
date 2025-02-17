import { clerkMiddleware } from "@clerk/nextjs/server";
//clerk auth documentation lays out all this code
// all routes are public by default by clerk and you must opt-in for protection
// esp true of our stripe webhook
export default clerkMiddleware();



export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date) return Response.json({ error: "Date requise" }, { status: 400 });
  const listed = await getStore("studio-310-bookings", { consistency: "strong" }).list({ prefix: `${date}/` });
  return Response.json({ booked: listed.blobs.map((b) => b.key.split("/")[1]) });
};

export const config: Config = { path: "/api/availability" };
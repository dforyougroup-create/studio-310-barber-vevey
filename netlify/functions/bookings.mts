import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

const store = () => getStore("studio-310-bookings", { consistency: "strong" });
const keyFor = (date: string, time: string) => `${date}/${time}`;

export default async (req: Request) => {
  const url = new URL(req.url);
  if (req.method === "GET") {
    const date = url.searchParams.get("date");
    if (!date) return Response.json({ error: "Date requise" }, { status: 400 });
    const listed = await store().list({ prefix: `${date}/` });
    return Response.json({ booked: listed.blobs.map((b) => b.key.split("/")[1]) });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const body = await req.json();
  const required = ["service", "date", "time", "name", "phone"];
  if (required.some((k) => !body[k])) return Response.json({ error: "Veuillez compléter les champs requis." }, { status: 400 });
  const key = keyFor(body.date, body.time);
  const existing = await store().get(key);
  if (existing) return Response.json({ error: "Ce créneau vient d'être réservé. Choisissez-en un autre." }, { status: 409 });
  const booking = { id: crypto.randomUUID(), ...body, createdAt: new Date().toISOString() };
  await store().setJSON(key, booking);
  return Response.json({ ok: true, bookingId: booking.id }, { status: 201 });
};

export const config: Config = { path: "/api/bookings" };
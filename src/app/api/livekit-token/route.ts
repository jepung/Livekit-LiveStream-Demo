import { AccessToken } from "livekit-server-sdk";

export async function POST(req: Request) {
  const { room, identity } = await req.json();
  const at = new AccessToken(
    process.env.NEXT_PUBLIC_API_KEY,
    process.env.NEXT_PUBLIC_SECRET_KEY,
    { identity }
  );
  at.addGrant({ roomJoin: true, room });

  return Response.json({
    token: await at.toJwt(),
  });
}

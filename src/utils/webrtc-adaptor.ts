export const getLiveKitToken = async ({
  room,
  identity,
}: {
  room: string;
  identity: string;
}) => {
  console.log(room, identity);
  const res = await fetch("api/livekit-token", {
    method: "POST",
    body: JSON.stringify({ room, identity }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { token } = await res.json();
  return token;
};

import { gameExists } from "../../_lib/game.repository";

type RouteContext = { params: Promise<{ gameId: string }> };

export const GET = async (_request: Request, context: RouteContext) => {
  const { gameId } = await context.params;
  return Response.json({ exists: gameExists(gameId) });
};

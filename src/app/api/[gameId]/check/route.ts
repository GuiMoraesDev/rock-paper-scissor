import { getGame } from "../../_lib/game.store";

type RouteContext = { params: Promise<{ gameId: string }> };

export const GET = async (_request: Request, context: RouteContext) => {
  const { gameId } = await context.params;
  const exists = Boolean(getGame(gameId));
  return Response.json({ exists });
};

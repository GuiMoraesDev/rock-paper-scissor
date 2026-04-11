import { z } from "zod";

export const joinGameSchema = z.object({
  playerName: z
    .string()
    .min(1, "Hey, you can't play with no name")
    .max(20, "It can't be that long (You hear yourself?)"),
  gameId: z
    .string()
    .length(6, "Game code must be exactly 6 characters")
    .transform((val) => val.toUpperCase()),
});

export type JoinGameSchemaProps = z.infer<typeof joinGameSchema>;

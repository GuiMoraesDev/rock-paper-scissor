import { z } from "zod";

export const createGameSchema = z.object({
  playerName: z
    .string()
    .min(1, "Hey, whoever-you-are, you can't play without a name.")
    .max(20, "It can't be that long (You hear yourself?)"),
  rounds: z.enum(
    ["1", "3", "5"],
    "Wanna play forever? Pick the number of rounds",
  ),
});

export type CreateGameSchemaProps = z.infer<typeof createGameSchema>;

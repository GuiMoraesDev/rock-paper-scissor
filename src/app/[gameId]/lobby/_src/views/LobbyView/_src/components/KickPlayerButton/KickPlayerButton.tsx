"use client";

import { Button } from "@/components/atoms/Button";
import { useKickPlayerMutation } from "../../../../../hooks/useKickPlayerMutation";

type KickPlayerButtonProps = {
  gameId: string;
};

export const KickPlayerButton = ({ gameId }: KickPlayerButtonProps) => {
  const { mutate, isPending } = useKickPlayerMutation();

  return (
    <Button
      variant="red"
      size="icon"
      data-testid="kick-player-button"
      onClick={() => mutate({ gameId })}
      disabled={isPending}
      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+0.5rem)]"
      title="Kick player"
    >
      ✕
    </Button>
  );
};

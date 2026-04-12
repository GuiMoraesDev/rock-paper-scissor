import { useGameSSE } from "@/app/[gameId]/_src/providers/GameSSEProvider";
import { Button } from "@/components/atoms/Button";
import { useAcceptRematchMutation } from "../../../../hooks/useAcceptRematchMutation";
import { useDenyRematchMutation } from "../../../../hooks/useDenyRematchMutation";

type AnswerRematchButtonProps = {
  gameId: string;
};

export const AnswerRematchButton = ({ gameId }: AnswerRematchButtonProps) => {
  const { markRematchCancelled } = useGameSSE();

  const acceptRematchMutation = useAcceptRematchMutation();
  const denyRematchMutation = useDenyRematchMutation({
    onSuccess: markRematchCancelled,
  });

  const handleAcceptRematch = () => {
    acceptRematchMutation.mutate({ gameId });
  };

  const handleDenyRematch = () => {
    acceptRematchMutation.mutate({ gameId });
  };

  const isPending =
    acceptRematchMutation.isPending || denyRematchMutation.isPending;

  return (
    <div className="flex gap-4">
      <Button
        data-testid="accept-rematch-button"
        variant="green"
        size="sm"
        disabled={isPending}
        onClick={handleAcceptRematch}
      >
        {acceptRematchMutation.isPending ? "..." : "Accept"}
      </Button>

      <Button
        data-testid="deny-rematch-button"
        variant="red"
        size="sm"
        disabled={isPending}
        onClick={handleDenyRematch}
      >
        {denyRematchMutation.isPending ? "..." : "Decline"}
      </Button>
    </div>
  );
};

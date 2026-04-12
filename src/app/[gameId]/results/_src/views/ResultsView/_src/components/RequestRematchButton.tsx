import { useGameSSE } from "@/app/[gameId]/_src/providers/GameSSEProvider";
import { Button } from "@/components/atoms/Button";
import { useRequestRematchMutation } from "../../../../hooks/useRequestRematchMutation";

type RequestRematchButtonProps = {
  gameId: string;
};

export const RequestRematchButton = ({ gameId }: RequestRematchButtonProps) => {
  const { markRematchSent } = useGameSSE();
  const { mutate, isPending } = useRequestRematchMutation({
    onSuccess: markRematchSent,
  });

  const handleRequestRematch = () => {
    mutate({ gameId });
  };

  return (
    <Button
      data-testid="rematch-button"
      variant="green"
      disabled={isPending}
      onClick={handleRequestRematch}
    >
      {isPending ? "..." : "🔄 Rematch"}
    </Button>
  );
};

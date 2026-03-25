import { type ComponentProps } from "react";
import clsx from "clsx";

type Props = ComponentProps<"span"> & {
  move: string;
  size?: "md" | "lg" | "xl";
};

export const moveEmojiMap: Record<string, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

const sizeClasses = {
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl md:text-7xl",
};

export function MoveEmoji({
  move,
  size = "md",
  className,
  ...props
}: Props) {
  return (
    <span className={clsx(sizeClasses[size], className)} {...props}>
      {moveEmojiMap[move]}
    </span>
  );
}

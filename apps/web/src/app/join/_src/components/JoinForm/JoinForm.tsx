"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import type { JoinGameSchemaProps } from "@/schemas/joinGame/schema";
import { useJoinFormSteps } from "./hooks/useJoinFormSteps";
import { useJoinGameMutation } from "./hooks/useJoinGameMutation";
import { useJoinGameValidation } from "./hooks/useJoinGameValidation";

type JoinFormProps = {
  code?: string;
};

export const JoinForm = ({ code }: JoinFormProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = useJoinGameValidation({
    defaultValues: {
      gameId: code,
    },
  });

  const { currentStep, goToPrevStep, goToNextStep } = useJoinFormSteps({
    trigger,
    clearErrors,
  });

  const { mutate: joinGame, isPending: isJoiningGame } = useJoinGameMutation();

  const onSubmit = ({ gameId, playerName }: JoinGameSchemaProps) => {
    joinGame({ gameId, playerName });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) =>
        console.error(formErrors, getValues()),
      )}
      className="text-center animate-bounce-in w-full max-w-lg py-12 px-8 h-full flex grow items-center justify-between"
    >
      <section
        data-hidden={currentStep !== 1}
        className="hidden flex-col gap-6 items-center justify-between w-full data-[hidden=false]:flex"
      >
        <div className="flex flex-col gap-4 justify-center w-full">
          <h2 className="font-fun text-3xl md:text-4xl text-rps-red">
            What&apos;s your name?
          </h2>

          <Input
            data-testid="name-input"
            placeholder="Enter your name..."
            autoFocus
            focusColor="red"
            {...register("playerName")}
          />

          <p className="text-red-600 text-sm w-full text-start">
            {errors.playerName?.message}
          </p>
        </div>

        <footer className="flex gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-left hover:text-rps-red"
          >
            <Link href="/">← Back to home</Link>
          </Button>

          <Button
            data-testid="next-step-button"
            variant="ghost"
            size="sm"
            className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-right hover:text-rps-red"
            onClick={goToNextStep}
          >
            Next →
          </Button>
        </footer>
      </section>

      <section
        data-hidden={currentStep !== 2}
        className="hidden flex-col gap-6 items-center justify-between w-full data-[hidden=false]:flex"
      >
        <div className="flex flex-col gap-4 justify-center w-full">
          <h2 className="font-fun text-3xl md:text-4xl text-rps-red">
            Enter Game Code
          </h2>

          <p className="font-fun text-xl text-gray-400">
            Ask your friend for the code!
          </p>

          <Input
            data-testid="game-code-input"
            placeholder="XXXXXX"
            autoFocus
            focusColor="red"
            size="lg"
            {...register("gameId")}
          />

          <p className="text-red-600 text-sm w-full text-start">
            {errors.gameId?.message}
          </p>
        </div>

        <footer className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevStep}
            className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-left hover:text-rps-red"
          >
            ← Back to name
          </Button>

          <Button
            data-testid="join-game-button"
            variant="ghost"
            size="sm"
            type="submit"
            disabled={isJoiningGame}
            className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-right hover:text-rps-red"
          >
            {isJoiningGame ? "Joining..." : "Join game →"}
          </Button>
        </footer>
      </section>
    </form>
  );
};

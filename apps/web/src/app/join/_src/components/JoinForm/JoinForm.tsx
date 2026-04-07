"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Toast } from "@/components/atoms/Toast";
import { joinGame, setPlayerToken } from "@/lib/game-api";
import type { JoinGameSchemaProps } from "@/schemas/joinGame.schema";
import { useJoinGameValidation } from "./hooks/useJoinGameValidation";

export function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCode = searchParams.get("code")?.toUpperCase() || "";
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = useJoinGameValidation({
    defaultValues: {
      gameId: prefilledCode,
    },
  });

  const handleGoToSecondStep = async () => {
    const isValid = await trigger("playerName");

    if (!isValid) return;

    setCurrentStep(2);
    clearErrors();
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (values: JoinGameSchemaProps) => {
    try {
      const { gameId, playerToken } = await joinGame(
        values.gameId,
        values.playerName,
      );
      setPlayerToken(playerToken, gameId);
      router.push(`/game/${gameId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to join game";
      setError(message);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <>
      <Toast message={error} />

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
              onClick={handleGoToSecondStep}
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
              onClick={handlePrevStep}
              className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-left hover:text-rps-red"
            >
              ← Back to name
            </Button>

            <Button
              data-testid="join-game-button"
              variant="ghost"
              size="sm"
              type="submit"
              className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-right hover:text-rps-red"
            >
              Join game →
            </Button>
          </footer>
        </section>
      </form>
    </>
  );
}

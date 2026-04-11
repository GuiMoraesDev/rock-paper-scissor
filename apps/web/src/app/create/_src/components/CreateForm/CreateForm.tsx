"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { toast } from "@/components/atoms/Toaster";
import { setPlayerToken } from "@/lib/game-api";
import type { CreateGameSchemaProps } from "@/schemas/createGame/schema";
import { createGame } from "@/services/lobby.api";
import { useCreateGameValidation } from "./hooks/useCreateGameValidation";

const ROUNDS_OPTIONS = [1, 3, 5];

export function CreateForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = useCreateGameValidation();

  const createGameMutation = useMutation({
    mutationFn: createGame,
    onSuccess: ({ gameId, playerToken }) => {
      setPlayerToken(playerToken, gameId);
      router.push(`/game/${gameId}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handlePrevStep = () => {
    setCurrentStep((step) => {
      if (step === 2) {
        return 1;
      }

      return 2;
    });
  };

  const handleGoToSecondStep = async () => {
    const isValid = await trigger("playerName");

    if (!isValid) return;

    setCurrentStep((step) => {
      if (step === 1) {
        return 2;
      }

      return 1;
    });

    clearErrors();
  };

  const onSubmit = (values: CreateGameSchemaProps) => {
    createGameMutation.mutate({
      playerName: values.playerName,
      rounds: Number(values.rounds),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (error) =>
        console.error(error, getValues()),
      )}
      className="text-center animate-bounce-in w-full max-w-lg py-12 px-8 h-full flex grow items-center justify-between"
    >
      <section
        data-hidden={currentStep !== 1}
        className="hidden flex-col gap-6 items-center justify-between w-full data-[hidden=false]:flex"
      >
        <div className="flex flex-col gap-4 justify-center w-full">
          <h2 className="font-fun text-3xl md:text-4xl text-rps-blue">
            What&apos;s your name?
          </h2>

          <Input
            data-testid="name-input"
            placeholder="Enter your name..."
            autoFocus
            focusColor="blue"
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
            className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-left hover:text-rps-blue"
          >
            <Link href="/">← Back to home</Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            data-testid="next-step-button"
            className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-right hover:text-rps-blue"
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
        <h2 className="font-fun text-3xl md:text-4xl text-rps-blue">
          How many rounds?
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {ROUNDS_OPTIONS.map((rounds) => (
            <Button
              key={rounds}
              data-testid={`rounds-${rounds}`}
              variant={rounds === 1 ? "yellow" : rounds === 3 ? "red" : "blue"}
              className="border-4 opacity-100 [&:has(input:not(:checked))]:border-transparent [&:has(input:not(:checked))]:opacity-85"
              asChild
            >
              <label
                key={rounds}
                htmlFor={`rounds-${rounds}`}
                className="flex flex-col gap-2"
              >
                <input
                  type="radio"
                  hidden
                  id={`rounds-${rounds}`}
                  className="peer"
                  value={rounds}
                  {...register("rounds")}
                />

                <span className="text-4xl md:text-5xl block">
                  {rounds === 1 ? "⚡" : rounds === 3 ? "🔥" : "💀"}
                </span>

                <p className="text-2xl">
                  {rounds} {rounds === 1 ? "Round" : "Rounds"}
                </p>
              </label>
            </Button>
          ))}
        </div>
        <p className="text-red-600 text-sm w-full text-start">
          {errors.rounds?.message}
        </p>

        <footer className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevStep}
            className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-left hover:text-rps-blue"
          >
            ← Back to name
          </Button>

          <Button
            variant="ghost"
            size="sm"
            data-testid="create-game-button"
            type="submit"
            disabled={createGameMutation.isPending}
            className="whitespace-nowrap inline-flex items-center leading-none animate-slide-in-right hover:text-rps-blue"
          >
            {createGameMutation.isPending ? "Creating..." : "Create game →"}
          </Button>
        </footer>
      </section>
    </form>
  );
}

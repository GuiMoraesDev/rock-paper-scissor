import { useState } from "react";
import type { UseFormClearErrors, UseFormTrigger } from "react-hook-form";
import type { CreateGameSchemaProps } from "@/schemas/createGame/schema";

type UseCreateFormStepsProps = {
  trigger: UseFormTrigger<CreateGameSchemaProps>;
  clearErrors: UseFormClearErrors<CreateGameSchemaProps>;
};

export const useCreateFormSteps = ({
  trigger,
  clearErrors,
}: UseCreateFormStepsProps) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const goToPrevStep = () => setCurrentStep(1);

  const goToNextStep = async () => {
    const isValid = await trigger("playerName");

    if (!isValid) return;

    setCurrentStep(2);
    clearErrors();
  };

  return { currentStep, goToPrevStep, goToNextStep };
};

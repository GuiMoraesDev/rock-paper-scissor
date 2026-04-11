import { useState } from "react";
import type { UseFormClearErrors, UseFormTrigger } from "react-hook-form";
import type { JoinGameSchemaProps } from "@/schemas/joinGame/schema";

type UseJoinFormStepsProps = {
  trigger: UseFormTrigger<JoinGameSchemaProps>;
  clearErrors: UseFormClearErrors<JoinGameSchemaProps>;
};

export const useJoinFormSteps = ({
  trigger,
  clearErrors,
}: UseJoinFormStepsProps) => {
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

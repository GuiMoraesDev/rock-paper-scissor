import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormProps, useForm } from "react-hook-form";
import {
  type CreateGameSchemaProps,
  createGameSchema,
} from "@/schemas/createGame.schema";

type UseCreateGameValidationProps = UseFormProps<CreateGameSchemaProps>;

export const useCreateGameValidation = (
  props?: UseCreateGameValidationProps,
) => {
  return useForm<CreateGameSchemaProps>({
    resolver: zodResolver(createGameSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    ...props,
  });
};

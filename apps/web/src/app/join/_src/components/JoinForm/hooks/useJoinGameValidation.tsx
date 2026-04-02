import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormProps, useForm } from "react-hook-form";
import {
  type JoinGameSchemaProps,
  joinGameSchema,
} from "@/schemas/joinGame.schema";

type UseJoinGameValidationProps = UseFormProps<JoinGameSchemaProps>;

export const useJoinGameValidation = (props?: UseJoinGameValidationProps) => {
  return useForm<JoinGameSchemaProps>({
    resolver: zodResolver(joinGameSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    ...props,
  });
};

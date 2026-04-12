"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/atoms/Toaster";
import { clearPlayerToken } from "@/lib/game-api";
import { denyRematch as denyRematchService } from "@/services/results.api";

export const useDenyRematchMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: denyRematchService,
    onSuccess: () => {
      clearPlayerToken();
      router.push("/");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

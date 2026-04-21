import { type ExternalToast, toast as SonnerToast } from "sonner";

export { Toaster } from "./Toaster";

export const toast = {
  ...SonnerToast,
  success: (message: string, options?: ExternalToast) =>
    SonnerToast.success(message, {
      position: "top-right",
      richColors: true,
      ...options,
    }),
  error: (message: string, options?: ExternalToast) =>
    SonnerToast.error(message, {
      position: "top-right",
      richColors: true,
      ...options,
    }),
  info: (message: string, options?: ExternalToast) =>
    SonnerToast.info(message, {
      position: "top-right",
      richColors: true,
      ...options,
    }),
  warning: (message: string, options?: ExternalToast) =>
    SonnerToast.warning(message, {
      position: "top-right",
      richColors: true,
      ...options,
    }),
};

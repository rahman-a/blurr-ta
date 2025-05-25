import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/lib/actions/auth";
import type { RegisterData, RegisterResult } from "@/lib/schemas/auth";

export function useRegister() {
  return useMutation<RegisterResult, Error, RegisterData>({
    mutationFn: registerUser,
  });
}

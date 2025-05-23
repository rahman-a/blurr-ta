import { auth } from "@/auth";
import RegistrationForm from "@/components/auth/registration-form";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[400px] px-4 sm:px-6 mx-auto">
        <RegistrationForm />
      </div>
    </main>
  );
}

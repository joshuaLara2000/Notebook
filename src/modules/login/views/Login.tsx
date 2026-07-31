import { LoginForm } from "@/modules/login/components/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Login() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* decorative post-it, for flavor */}
      <div
        className="absolute -left-4 top-16 hidden h-40 w-40 rotate-[-8deg] sm:block"
        style={{
          backgroundColor: "var(--postit-yellow)",
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,.18))",
        }}
        aria-hidden
      />
      <div
        className="absolute -right-6 bottom-20 hidden h-36 w-36 rotate-[7deg] sm:block"
        style={{
          backgroundColor: "var(--postit-cyan)",
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,.18))",
        }}
        aria-hidden
      />

      <Card className="relative z-10 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Mi libreta</CardTitle>
          <CardDescription>
            Inicia sesión para abrir tus apuntes y post-its.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LoginForm />
          <p className="text-ink-soft text-center text-xs">
            Acceso temporal local — pendiente de conectar con Supabase.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

import { useState } from "react";
import { Formik, Form, Field } from "formik";

import { loginUser } from "@/platform/auth/services/loginUser.service";
import { signUpUser } from "@/platform/auth/services/signUpUser.service";
import { useAuthStore } from "@/platform/auth/store/useAuthStore";
import {
  loginSchema,
  type LoginInput,
} from "@/modules/login/schemas/login.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialValues: LoginInput & { name: string } = {
  email: "",
  password: "",
  name: "",
};

export function LoginForm() {
  const setUser = useAuthStore((s) => s.setUser);
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={async (values, { setSubmitting, setErrors, setStatus }) => {
        setStatus(undefined);
        const result =
          mode === "login"
            ? await loginUser(values)
            : await signUpUser(values);

        if (result.ok) {
          // Refleja el usuario de inmediato; el listener de auth lo mantiene al día.
          setUser(result.user);
          return;
        }
        if (result.fieldErrors) setErrors(result.fieldErrors);
        if (result.error) setStatus({ error: result.error });
        setSubmitting(false);
      }}
    >
      {({
        errors,
        touched,
        isSubmitting,
        status,
        handleBlur,
        handleChange,
        values,
      }) => (
        <Form className="flex w-full flex-col gap-4">
          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Field
                as={Input}
                id="name"
                name="name"
                placeholder="Tu nombre"
                autoComplete="name"
                disabled={isSubmitting}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo</Label>
            <Field
              as={Input}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              disabled={isSubmitting}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.email}
              aria-invalid={Boolean(touched.email && errors.email)}
              className={cn(
                touched.email && errors.email && "border-destructive"
              )}
            />
            {touched.email && errors.email ? (
              <p className="text-destructive text-sm">{errors.email}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Field
              as={Input}
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="••••••••"
              disabled={isSubmitting}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              aria-invalid={Boolean(touched.password && errors.password)}
              className={cn(
                touched.password && errors.password && "border-destructive"
              )}
            />
            {touched.password && errors.password ? (
              <p className="text-destructive text-sm">{errors.password}</p>
            ) : null}
          </div>

          {status?.error ? (
            <p className="text-destructive text-sm" role="alert">
              {status.error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? mode === "login"
                ? "Entrando…"
                : "Creando cuenta…"
              : mode === "login"
                ? "Entrar a mi libreta"
                : "Crear cuenta"}
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-ink-soft hover:text-ink text-center text-sm"
          >
            {mode === "login"
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </Form>
      )}
    </Formik>
  );
}

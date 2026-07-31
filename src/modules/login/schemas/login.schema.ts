import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Ingresa un correo válido.")
    .required("Ingresa tu correo."),
  password: yup.string().required("Ingresa tu contraseña."),
});

export type LoginInput = yup.InferType<typeof loginSchema>;

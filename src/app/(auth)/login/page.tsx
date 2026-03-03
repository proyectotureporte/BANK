"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales inválidas");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-start pt-[18vh] lg:justify-center lg:pt-0 px-6 py-6 sm:px-10 lg:px-12 xl:px-20">
      {/* Nav bar with logo */}
      <div className="absolute top-0 left-0 right-0 h-14 sm:h-16 lg:h-20 bg-white flex items-center px-3 lg:px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="BTF Bank"
          className="w-[220px] h-[45px] sm:w-[200px] sm:h-[50px] lg:w-[250px] lg:h-[50px]"
        />
      </div>

      {/* Form centered */}
      <div className="w-full max-w-sm sm:max-w-md">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white lg:text-gray-900 mb-1 sm:mb-2">
          Bienvenido a Ocean bank
        </h1>
        <p className="text-base sm:text-lg text-white/70 lg:text-gray-400 mb-6 sm:mb-10">
          Ingresa a tu cuenta
        </p>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 sm:p-4 text-sm sm:text-base text-red-600 mb-4 sm:mb-6">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-base sm:text-lg font-medium text-white lg:text-gray-700 mb-1.5 sm:mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              {...form.register("email")}
              className="w-full h-12 sm:h-14 rounded-lg border border-gray-300 bg-white/20 lg:bg-transparent px-4 text-base sm:text-lg text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {form.formState.errors.email && (
              <p className="mt-1.5 text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-white lg:text-gray-700 mb-1.5 sm:mb-2">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
              className="w-full h-12 sm:h-14 rounded-lg border border-gray-300 bg-white/20 lg:bg-transparent px-4 text-base sm:text-lg text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {form.formState.errors.password && (
              <p className="mt-1.5 text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Link
            href="/forgot-password"
            className="inline-block text-sm sm:text-base text-white/70 lg:text-gray-500 hover:text-blue-400 lg:hover:text-blue-600 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 sm:h-14 items-center justify-center rounded-full px-12 sm:px-16 text-base sm:text-lg font-semibold text-white transition-all disabled:opacity-60 hover:brightness-110"
              style={{
                background:
                  "linear-gradient(135deg, #1a3a6b 0%, #1e4d8c 40%, #2563a8 65%, #8b7a3a 85%, #c5a94e 100%)",
              }}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Acceso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

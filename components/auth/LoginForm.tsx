"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage("Não foi possível entrar. Confira o e-mail e a senha.");
      return;
    }

    router.push("/coordenadoria");
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="mt-8 space-y-5">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">E-mail</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          placeholder="seuemail@exemplo.com"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Senha</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          placeholder="Digite sua senha"
        />
      </label>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      router.push("/movies");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#043344] px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-semibold text-center text-white mb-6">
          Sign in
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-transparent space-y-4"
        >
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 rounded-lg bg-[#224957] text-white outline-none"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-sm text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 rounded-lg bg-[#224957] text-white outline-none"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-sm text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 justify-center">
            <input
              id="remember"
              type="checkbox"
              className="bg-[#224957] color-[#224957]"
            />
            <label
              htmlFor="remember"
              className="text-sm text-white font-normal"
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2BD17E] text-white py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

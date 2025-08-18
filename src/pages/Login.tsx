import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "../context/Auth/AuthContext";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuthContext();
  const [errMsg, setErrMsg] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setErrMsg("");
    try {
      await login(data.email, data.password);
    } catch (e) {
      setErrMsg(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-sm bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      {errMsg && <p className="text-sm text-red-600 mb-2">{errMsg}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input {...register("email")} type="email" className="w-full border rounded-lg px-3 py-2" />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input {...register("password")} type="password" className="w-full border rounded-lg px-3 py-2" />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        <button disabled={isSubmitting} className="w-full rounded-lg bg-gray-900 text-white py-2">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

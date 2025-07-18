"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

type FormData = {
  title: string;
  publishing_year: number;
  poster?: FileList;
};

export default function NewMoviePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      let poster_url: any = null;

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = fileInput?.files?.[0];

      if (file) {
        const fileName = `${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("posters")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error("Failed to upload image");
        }

        const { data: urlData } = supabase.storage
          .from("posters")
          .getPublicUrl(fileName);

        poster_url = urlData.publicUrl;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/movies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: data.title,
            publishing_year: Number(data.publishing_year),
            poster_url,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to create movie");

      toast.success("Movie created successfully!");
      router.push("/movies");
    } catch (error: any) {
      toast.error(error.message || "Failed to create movie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#043344] px-4 py-10">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12">
        <div className="border-2 border-dashed border-gray-400 rounded-lg h-[400px] flex items-center justify-center overflow-hidden">
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <span className="text-sm text-gray-200">Drop an image here</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              {...register("poster")}
              onChange={handleImageChange}
            />
          </label>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 self-center"
        >
          <h1 className="text-3xl text-white font-bold mb-4">
            Create a new movie
          </h1>

          <input
            type="text"
            placeholder="Title"
            className="w-full px-4 py-2 rounded bg-[#0e3a48] text-white outline-none"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-sm text-red-400">{errors.title.message}</p>
          )}

          <input
            type="number"
            placeholder="Publishing year"
            className="w-full px-4 py-2 rounded bg-[#0e3a48] text-white outline-none"
            {...register("publishing_year", { required: "Year is required" })}
          />
          {errors.publishing_year && (
            <p className="text-sm text-red-400">
              {errors.publishing_year.message}
            </p>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push("/movies")}
              className="px-6 py-2 rounded border border-white text-white hover:bg-white hover:text-[#043344] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

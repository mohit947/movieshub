"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type FormData = {
  title: string;
  publishing_year: number;
  poster?: FileList;
};

export default function EditMoviePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPosterUrl, setCurrentPosterUrl] = useState<string | null>(null);
  const currentPage = useSelector(
    (state: RootState) => state.pagination.currentPage
  );
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

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

  useEffect(() => {
    const fetchMovie = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/movies?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allMovies = await res.json();
      console.log("all", allMovies);

      const movie = allMovies?.data?.find((m: any) => m.id === id);
      if (!movie) {
        toast.error("Movie not found");
        router.push("/movies");
        return;
      }

      setValue("title", movie.title);
      setValue("publishing_year", movie.publishing_year);
      setCurrentPosterUrl(movie.poster_url);
      setLoading(false);
    };

    fetchMovie();
  }, [id, setValue, router]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    let poster_url = currentPosterUrl;

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

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/movies/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: data.title,
            publishing_year: Number(data.publishing_year),
            ...(poster_url && { poster_url }),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update movie");
      toast.success("Movie updated");
      router.push("/movies");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#043344] px-4 py-10">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12">
        <div className="border-2 border-dashed border-gray-400 rounded-lg h-[400px] flex items-center justify-center overflow-hidden">
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer relative">
            {imagePreview || currentPosterUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={imagePreview || currentPosterUrl || ""}
                  alt="Movie poster"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-sm text-gray-200">
                Drop other image here
              </span>
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
          <h1 className="text-3xl text-white font-bold mb-4">Edit</h1>

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
              {loading ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

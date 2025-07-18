"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setPage } from "@/store/features/paginationSlice";

export default function MoviesPage() {
  const [movies, setMovies] = useState<any>({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const dispatch = useDispatch();
  const currentPage = useSelector(
    (state: RootState) => state.pagination.currentPage
  );

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  useEffect(() => {
    const fetchMovies = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/movies?page=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch movies");
        }

        const data = await res.json();
        setMovies(data);
      } catch (err: any) {
        toast.error(err.message || "Error fetching movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleMovieClick = (id: string) => {
    router.push(`/movies/${id}/edit`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      dispatch(setPage(currentPage - 1));
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(movies.total / 8);
    if (currentPage < totalPages) {
      dispatch(setPage(currentPage + 1));
    }
  };

  const totalPages = Math.ceil(movies.total / 8);

  return (
    <div className="min-h-screen bg-[#093545] px-4 py-6 text-white">
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2">
          <h1 className="text-2xl font-semibold">My movies</h1>
          <img
            onClick={() => router.push("/movies/new")}
            src="/add.svg"
            alt="Add movie"
            className="cursor-pointer"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="text-sm hover:underline flex items-center gap-1"
          >
            Logout <img src="/logout.svg" alt="Logout" />
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : movies.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <p className="text-xl mb-4">Your movie list is empty</p>
          <Link
            href="/movies/new"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Add a new movie
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {movies.data.map((movie: any) => (
              <div
                key={movie.id}
                onClick={() => handleMovieClick(movie.id)}
                className="cursor-pointer bg-[#092C39] rounded-xl"
              >
                {movie.poster_url && (
                  <div className="relative w-full h-60">
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      fill
                      className="object-cover rounded-t-xl"
                      style={{ padding: "6px", borderRadius: "12px" }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-base font-bold">{movie.title}</h2>
                  <p className="text-xs text-gray-300">
                    {movie.publishing_year}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={handlePrevPage}
                className="text-sm px-4 py-2 rounded bg-[#0e3a48] hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-[#0e3a48]"
                disabled={currentPage <= 1}
              >
                Prev
              </button>

              <div className="flex gap-2 items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <span
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`text-sm px-2 py-1 rounded cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-[#2BD17E]"
                          : "bg-[#092C39] hover:bg-green-700"
                      }`}
                    >
                      {pageNum}
                    </span>
                  )
                )}
              </div>

              <button
                onClick={handleNextPage}
                className="text-sm px-4 py-2 rounded bg-[#0e3a48] hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-[#0e3a48]"
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

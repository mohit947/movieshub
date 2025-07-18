"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="text-center p-10">
      <button
        className="text-sm px-4 py-2 rounded bg-[#0e3a48] hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-[#0e3a48]"
        onClick={() => {
          router.push("/movies");
        }}
      >
        Go to Movies
      </button>
    </main>
  );
}

import Link from "next/link";
import { Inter } from "next/font/google";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white ${inter.className}`}
    >
      <div className="z-10 w-full max-w-3xl text-center">
        <h1 className="mb-8 text-5xl font-extrabold tracking-tight">
          Welcome to Data Visualization
        </h1>
        <p className="mb-12 text-xl">
          Upload your CSV or Excel file or Google Sheet link to generate visualizations of your
          data.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          >
            Sign In / Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}

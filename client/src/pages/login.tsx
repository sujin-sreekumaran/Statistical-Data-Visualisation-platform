import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { signIn, getSession } from "next-auth/react";
import { GetServerSideProps } from "next";

interface Errors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Login() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoginError("");
    const newErrors: Errors = {};

    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePassword(password)) {
      newErrors.password =
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }

    if (!isSignIn && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      try {
        const endpoint = isSignIn
          ? `${process.env.NEXT_PUBLIC_LOCAL_URL}/api/login`
          : `${process.env.NEXT_PUBLIC_LOCAL_URL}/api/signup`;
        const response = await axios.post(endpoint, { email, password });
        const { token } = response.data;

        if (!token) {
          throw new Error("No token received");
        }

        localStorage.setItem("token", token);
        router.push("/file-upload");
      } catch (error) {
        console.error("Authentication error:", error);
        setLoginError("Your email or password is incorrect. Please try again.");
      }
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: "" }));
    setLoginError("");
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: "" }));
    setLoginError("");
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/file-upload" });
    } catch (error) {
      console.error("Google login error:", error);
      setLoginError("An error occurred during Google login. Please try again.");
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Welcome</h2>
          <div className="mt-3 flex justify-center">
            <div className="flex space-x-4 bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => {
                  setIsSignIn(true);
                  setErrors({});
                  setLoginError("");
                }}
                className={`px-4 py-2 rounded-md transition-all duration-300 ${
                  isSignIn ? "bg-white shadow-md" : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsSignIn(false);
                  setErrors({});
                  setLoginError("");
                }}
                className={`px-4 py-2 rounded-md transition-all duration-300 ${
                  !isSignIn ? "bg-white shadow-md" : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                autoComplete="off"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          {!isSignIn && (
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}

          {loginError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{loginError}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              {isSignIn ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="w-5 h-5 mr-2"
              />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/file-upload",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Step 1: Create the account
      await api.post("/auth/signup", formData);

      // Step 2: Log in automatically
      const loginResponse = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Step 3: Save the authentication token
      localStorage.setItem(
        "touchgrass_token",
        loginResponse.data.access_token
      );

      // Step 4: Navigate to profile discovery
      navigate("/profile-discovery");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Something went wrong. Please try again.";

      setError(
        typeof message === "string"
          ? message
          : JSON.stringify(message)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#eef6ef] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-[#5c8d68] tracking-wide uppercase">
            TouchGrass
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#18352a]">
            Create your account
          </h1>

          <p className="mt-3 text-[#64756b]">
            Start discovering things worth doing offline.
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#30483b] mb-2"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-[#d5e1d7] px-4 py-3 outline-none focus:border-[#5c8d68] focus:ring-2 focus:ring-[#dcecdf]"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#30483b] mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-[#d5e1d7] px-4 py-3 outline-none focus:border-[#5c8d68] focus:ring-2 focus:ring-[#dcecdf]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#30483b] mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-[#d5e1d7] px-4 py-3 outline-none focus:border-[#5c8d68] focus:ring-2 focus:ring-[#dcecdf]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#3f704d] px-4 py-3 font-semibold text-white transition hover:bg-[#315c3e] disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-[#64756b]">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-[#3f704d] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

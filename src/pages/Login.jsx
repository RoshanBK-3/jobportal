import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";

const USER_KEY = "user";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Direct Supabase query - bypassing auth.js for testing
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password);

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        setError("Database error. Please try again.");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const user = data[0];

      if (user.role !== role) {
        setError(`You registered as a ${user.role}. Please select the correct role.`);
        setLoading(false);
        return;
      }

      // Save user to localStorage
      const userToStore = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profile_pic || "",
        companyName: user.company_name || ""
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userToStore));
      
      // Redirect
      if (user.role === "company") {
        window.location.href = "/company-home";
      } else {
        window.location.href = "/";
      }
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-md mx-auto bg-white p-6 mt-10 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`px-4 py-1 rounded transition ${
              role === "user" ? "bg-orange-600 text-white" : "bg-gray-200"
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setRole("company")}
            className={`px-4 py-1 rounded transition ${
              role === "company" ? "bg-orange-600 text-white" : "bg-gray-200"
            }`}
          >
            Company
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
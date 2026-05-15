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

      // ✅ FIX: Save ALL user data including location and contact
      const userToStore = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        age: user.age || "",
        gender: user.gender || "",
        location: user.location || "",      // ← ADD THIS
        contact: user.contact || "",        // ← ADD THIS
        companyName: user.company_name || user.name || "",
        profilePic: user.profile_pic || "",
        cv: user.cv || ""
      };
      
      console.log("Saving to localStorage:", userToStore);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to continue to JobPortal</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            
            <div className="flex justify-center gap-3 mb-8">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  role === "user" 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                👤 Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole("company")}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  role === "company" 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🏢 Employer
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-orange-600 font-semibold hover:text-orange-700 transition"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
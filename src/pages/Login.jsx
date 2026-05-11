import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loginUser } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const user = await loginUser(form.email, form.password);

    if (!user) {
      alert("Invalid email or password");
      setLoading(false);
      return;
    }

    if (user.role !== form.role) {
      alert("Selected role does not match account type");
      setLoading(false);
      return;
    }

    if (user.role === "company") {
      navigate("/company-home");
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-md mx-auto bg-white p-6 mt-10 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "user" })}
            className={`px-4 py-1 rounded ${form.role === "user" ? "bg-orange-600 text-white" : "bg-gray-200"}`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "company" })}
            className={`px-4 py-1 rounded ${form.role === "company" ? "bg-orange-600 text-white" : "bg-gray-200"}`}
          >
            Company
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className="bg-orange-600 text-white py-2 rounded-lg" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
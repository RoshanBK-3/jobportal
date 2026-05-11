import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser } from "../utils/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "",
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    location: "",
    contact: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    let newUser = {};

    if (role === "user") {
      newUser = { ...userForm, role: "user" };
    } else {
      newUser = { ...companyForm, role: "company" };
    }

    const success = await registerUser(newUser);

    if (success) {
      alert("Registration successful! Please login.");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-md mx-auto bg-white p-6 mt-10 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-center">Create Account</h2>

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setRole("user")}
            className={`px-4 py-1 rounded ${role === "user" ? "bg-orange-600 text-white" : "bg-gray-200"}`}
          >
            User
          </button>
          <button
            onClick={() => setRole("company")}
            className={`px-4 py-1 rounded ${role === "company" ? "bg-orange-600 text-white" : "bg-gray-200"}`}
          >
            Company
          </button>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          {role === "user" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
              />
              <select
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={userForm.gender}
                onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Age"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={userForm.age}
                onChange={(e) => setUserForm({ ...userForm, age: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required
              />
            </>
          )}

          {role === "company" && (
            <>
              <input
                type="text"
                placeholder="Company Name"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Location"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={companyForm.location}
                onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={companyForm.contact}
                onChange={(e) => setCompanyForm({ ...companyForm, contact: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={companyForm.password}
                onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                required
              />
            </>
          )}

          <button type="submit" className="bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
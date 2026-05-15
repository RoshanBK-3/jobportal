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
      newUser = { 
        ...userForm, 
        role: "user",
        age: userForm.age ? parseInt(userForm.age) : null
      };
    } else {
      newUser = { 
        name: companyForm.companyName,
        companyName: companyForm.companyName,
        location: companyForm.location,
        contact: companyForm.contact,
        email: companyForm.email,
        password: companyForm.password,
        role: "company"
      };
    }

    console.log("Sending user data:", newUser);
    const success = await registerUser(newUser);

    if (success) {
      alert("Registration successful! Please login.");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
            <p className="text-gray-500 text-sm">Join JobPortal to find your dream job</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            
            {/* Role Toggle */}
            <div className="flex justify-center gap-3 mb-5">
              <button
                onClick={() => setRole("user")}
                className={`px-7 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  role === "user" 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                👤 Job Seeker
              </button>
              <button
                onClick={() => setRole("company")}
                className={`px-7 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  role === "company" 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🏢 Employer
              </button>
            </div>

            <form onSubmit={handleSignup} className="space-y-3.5">
              {role === "user" && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Age"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={userForm.age}
                      onChange={(e) => setUserForm({ ...userForm, age: e.target.value })}
                    />
                    <select
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      value={userForm.gender}
                      onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />

                  <input
                    type="email"
                    placeholder="Email Address *"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password *"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    placeholder="Company Name *"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Location"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={companyForm.location}
                      onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    />
                    <input
                      type="tel"
                      placeholder="Contact"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={companyForm.contact}
                      onChange={(e) => setCompanyForm({ ...companyForm, contact: e.target.value })}
                    />
                  </div>

                  <input
                    type="email"
                    placeholder="Email Address *"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password *"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                    required
                  />
                </>
              )}

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md text-sm mt-2"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account →"}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-5">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-orange-600 font-semibold hover:text-orange-700 transition"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
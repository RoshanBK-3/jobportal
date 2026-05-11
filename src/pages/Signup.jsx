import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser, loginUser } from "../utils/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");

  // 👤 USER FIELDS
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "", // ✅ ADDED
  });

  // 🏢 COMPANY FIELDS
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    location: "",
    contact: "",
    email: "",
    password: "",
  });

  // =========================
  // HANDLE SIGNUP
  // =========================
  const handleSignup = (e) => {
    e.preventDefault();

    let newUser = {};

    if (role === "user") {
      newUser = {
        ...userForm,
        role: "user",
      };
    } else {
      newUser = {
        ...companyForm,
        role: "company",
      };
    }

    registerUser(newUser);
    loginUser(newUser.email, newUser.password);

    alert("Signup successful!");

    if (newUser.role === "company") {
      navigate("/company-home");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-md mx-auto bg-white p-6 mt-10 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-center">Create Account</h2>

        {/* ROLE SWITCH */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setRole("user")}
            className={`px-4 py-1 rounded ${
              role === "user" ? "bg-orange-600 text-white" : "bg-gray-200"
            }`}
          >
            User
          </button>

          <button
            onClick={() => setRole("company")}
            className={`px-4 py-1 rounded ${
              role === "company" ? "bg-orange-600 text-white" : "bg-gray-200"
            }`}
          >
            Company
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          {/* ================= USER ================= */}
          {role === "user" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className="border p-2 rounded"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                required
              />

              {/* ✅ GENDER ADDED HERE (USER ONLY) */}
              <select
                className="border p-2 rounded"
                value={userForm.gender}
                onChange={(e) =>
                  setUserForm({ ...userForm, gender: e.target.value })
                }
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                type="number"
                placeholder="Age"
                className="border p-2 rounded"
                value={userForm.age}
                onChange={(e) =>
                  setUserForm({ ...userForm, age: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Phone"
                className="border p-2 rounded"
                value={userForm.phone}
                onChange={(e) =>
                  setUserForm({ ...userForm, phone: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                required
              />
            </>
          )}

          {/* ================= COMPANY ================= */}
          {role === "company" && (
            <>
              <input
                type="text"
                placeholder="Company Name"
                className="border p-2 rounded"
                value={companyForm.companyName}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    companyName: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Location"
                className="border p-2 rounded"
                value={companyForm.location}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    location: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Contact Number"
                className="border p-2 rounded"
                value={companyForm.contact}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    contact: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded"
                value={companyForm.email}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded"
                value={companyForm.password}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    password: e.target.value,
                  })
                }
                required
              />
            </>
          )}

          <button className="bg-orange-600 text-white py-2 rounded-lg">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

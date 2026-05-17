import { useNavigate } from "react-router-dom";

export default function Footer({ onTabChange }) {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-3">
              JobPortal
            </h1>
            <p className="text-gray-400 text-sm">
              Find the right job and make your career grow faster.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onTabChange ? onTabChange("jobs") : navigate("/")}
                  className="text-gray-400 hover:text-orange-400 transition"
                >
                  Jobs
                </button>
              </li>
              <li>
                <a href="/" className="text-gray-400 hover:text-orange-400 transition">
                  Companies
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-orange-400 transition">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <p className="text-gray-400 text-sm">support@jobportal.com</p>
            <div className="flex gap-3 mt-3">
              <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition text-xl">
                🌐
              </span>
              <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition text-xl">
                🐦
              </span>
              <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition text-xl">
                💼
              </span>
              <span className="text-gray-500 hover:text-orange-400 cursor-pointer transition text-xl">
                📸
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Job Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
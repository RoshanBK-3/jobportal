import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getJobs } from "../data/jobs";
import { isLoggedIn, getCurrentUser } from "../utils/auth";
import { supabase } from "../supabaseClient";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hasAppliedToJob, setHasAppliedToJob] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const jobs = await getJobs();
        
        if (!jobs || !Array.isArray(jobs)) {
          setJob(null);
          setLoading(false);
          return;
        }
        
        const foundJob = jobs.find((j) => String(j.id) === String(id));
        setJob(foundJob || null);
      } catch (error) {
        console.error("Error loading job:", error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadJob();
  }, [id]);

  // Check if user already applied
  useEffect(() => {
    const checkApplicationStatus = async () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      
      if (user && job) {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', job.id)
            .eq('applied_by', user.email);
          
          if (!error && data && data.length > 0) {
            setHasAppliedToJob(true);
          } else {
            setHasAppliedToJob(false);
          }
        } catch (error) {
          console.error("Error checking application status:", error);
          setHasAppliedToJob(false);
        }
      }
    };
    
    checkApplicationStatus();
  }, [job]);

  const handleApply = async () => {
    if (isApplying) return;

    if (!isLoggedIn()) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const user = getCurrentUser();

    if (!user?.profilePic) {
      alert("Please upload a profile picture before applying");
      navigate("/dashboard");
      return;
    }

    if (!user?.cv) {
      alert("Please upload your CV/Resume before applying");
      navigate("/dashboard");
      return;
    }

    setIsApplying(true);

    try {
      // Check if already applied
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', job.id)
        .eq('applied_by', user.email);
      
      if (existing && existing.length > 0) {
        alert("You have already applied for this job!");
        setIsApplying(false);
        return;
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('applications')
        .insert([{
          job_id: job.id,
          job_title: job.title,
          job_company: job.company,
          job_location: job.location,
          applied_by: user.email,
          applied_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setHasAppliedToJob(true);
      alert("Applied Successfully! You'll be notified via email about selection.");
    } catch (error) {
      console.error("Apply error:", error);
      alert("Failed to apply. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="text-center py-20">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Job not found</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 bg-white mt-10 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">{job.title}</h1>

        <p className="text-gray-500 mb-4">
          {job.company} • {job.location}
        </p>

        <div className="flex gap-2 mb-4 flex-wrap">
          {job.skills && job.skills.map((skill, index) => (
            <span
              key={index}
              className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs"
            >
              {skill}
            </span>
          ))}
        </div>

        <p className="text-gray-700 mb-6">{job.description}</p>

        <button
          onClick={handleApply}
          disabled={hasAppliedToJob || isApplying}
          className={`px-6 py-2 rounded-lg transition ${
            hasAppliedToJob
              ? "bg-green-500 text-white cursor-not-allowed"
              : isApplying
              ? "bg-gray-400 text-white cursor-wait"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {hasAppliedToJob ? "✅ Applied" : isApplying ? "Applying..." : "Apply Now"}
        </button>
      </div>
    </div>
  );
}
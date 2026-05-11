const JOBS_KEY = "jobs";

// =======================
// DEFAULT JOBS WITH DIFFERENT DATES
// =======================
const getDefaultJobs = () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return [
    {
      id: 1,
      title: "Frontend Developer Intern",
      company: "ABC Tech",
      location: "Kathmandu",
      skills: ["React", "Tailwind"],
      description: "Work on modern frontend applications using React.",
      createdAt: now.toISOString(),
    },
    {
      id: 2,
      title: "Backend Developer Intern",
      company: "XYZ Solutions",
      location: "Pokhara",
      skills: ["Node.js", "MongoDB"],
      description: "Build APIs and handle server-side logic.",
      createdAt: yesterday.toISOString(),
    },
    {
      id: 3,
      title: "Full Stack Intern",
      company: "TechNepal",
      location: "Lalitpur",
      skills: ["React", "Node.js"],
      description: "Work on both frontend and backend systems.",
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: 4,
      title: "UI Designer Senior",
      company: "Techmandu",
      location: "Syangja",
      skills: ["React", "Next.js"],
      description: "Work on frontend systems.",
      createdAt: threeDaysAgo.toISOString(),
    },
    {
      id: 5,
      title: "DevOps Intern",
      company: "CloudTech",
      location: "Kathmandu",
      skills: ["Docker", "AWS", "Jenkins"],
      description: "Learn and work on cloud infrastructure.",
      createdAt: lastWeek.toISOString(),
    },
  ];
};

// =======================
// GET JOBS (NORMALIZED)
// =======================
export const getJobs = () => {
  const data = localStorage.getItem(JOBS_KEY);

  if (!data) {
    const defaultJobs = getDefaultJobs();
    localStorage.setItem(JOBS_KEY, JSON.stringify(defaultJobs));
    return defaultJobs;
  }

  const jobs = JSON.parse(data);

  // 🔥 FIX: normalize createdAt to ISO string always
  return jobs.map((job) => ({
    ...job,
    createdAt: job.createdAt
      ? new Date(job.createdAt).toISOString()
      : new Date().toISOString(),
  }));
};

// =======================
// SAVE JOBS
// =======================
const saveJobs = (jobs) => {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
};

// =======================
// ADD JOB - FIXED
// =======================
export const addJob = (job) => {
  const jobs = getJobs();

  const newJob = {
    ...job,
    id: job.id || Date.now(),
    // 🔥 Ensure createdAt is set, use existing or current time
    createdAt: job.createdAt || new Date().toISOString(),
  };

  jobs.push(newJob);
  saveJobs(jobs);
  return newJob;
};

// =======================
// DELETE JOB
// =======================
export const deleteJob = (id) => {
  const jobs = getJobs().filter((job) => job.id !== id);
  saveJobs(jobs);
};

// =======================
// UPDATE JOB - FIX: Keep original createdAt
// =======================
export const updateJob = (updatedJob) => {
  const jobs = getJobs().map((job) =>
    job.id === updatedJob.id
      ? {
          ...updatedJob,
          createdAt: job.createdAt, // 🔥 Keep the original creation date
        }
      : job
  );

  saveJobs(jobs);
};

// =======================
// RESET JOBS TO DEFAULT (for testing)
// =======================
export const resetJobs = () => {
  const defaultJobs = getDefaultJobs();
  localStorage.setItem(JOBS_KEY, JSON.stringify(defaultJobs));
  return defaultJobs;
};
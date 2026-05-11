const KEY = "bookmarks";

// get bookmarks
export const getBookmarks = () => {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

// save bookmarks
const saveBookmarks = (jobs) => {
  localStorage.setItem(KEY, JSON.stringify(jobs));
};

// toggle bookmark
export const toggleBookmark = (job) => {
  let jobs = getBookmarks();

  const exists = jobs.find((j) => j.id === job.id);

  if (exists) {
    jobs = jobs.filter((j) => j.id !== job.id);
  } else {
    jobs.push(job);
  }

  saveBookmarks(jobs);
};

// check bookmark
export const isBookmarked = (id) => {
  const jobs = getBookmarks();
  return jobs.some((j) => j.id === id);
};

// ✅ ADD THIS (FIX FOR YOUR ERROR)
export const getBookmarkedJobs = () => {
  return getBookmarks();
};
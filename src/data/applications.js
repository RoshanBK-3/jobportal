// In-memory store for applications (demo purposes)
let applications = [];

export const addApplication = (app) => {
  applications.push(app);
};

export const getApplications = () => {
  return applications;
};
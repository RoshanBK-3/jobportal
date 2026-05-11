let applications = [];

export const addApplication = (app) => {
  applications.push(app);
};

export const getApplications = () => {
  return applications;
};
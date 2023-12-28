const cronJobs: VoidFunction[] = [];

let cronRunning = false;

export const start = () => {
  if (cronRunning) return
  cronRunning = true;
}

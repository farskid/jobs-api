function seniority(job = { title: "" }) {
  switch (true) {
    case ["sr", "ssr", "senior"].includes(job.title.toLowerCase()):
      return "senior";
    case job.title.toLowerCase().includes("lead"):
      return "lead";
    default:
      return null;
  }
}

module.exports.withSeniority = function withSeniority(job) {
  return {
    ...job,
    level: seniority(job),
  };
};

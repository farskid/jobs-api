function seniority(job = { title: "" }) {
  switch (true) {
    case job.title.toLowerCase().match(/sr|ssr|senior/gi) != null:
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

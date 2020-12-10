const fs = require("fs").promises;
const path = require("path");
const PATH_DB = path.join(process.cwd(), "src/db.json");

module.exports.writeJobs = function (jobs) {
  return fs.writeFile(PATH_DB, JSON.stringify(jobs));
};

module.exports.readJobs = function () {
  return fs
    .readFile(PATH_DB)
    .then((jobsBuffer) => Promise.resolve(JSON.parse(jobsBuffer.toString())));
};

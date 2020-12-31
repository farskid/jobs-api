const express = require("express");
const { default: fetch } = require("node-fetch");
const cors = require("cors");
const { getJobsFromHTML } = require("./jobs");
const db = require("./db.js");
const { withSeniority } = require("./seniority.js");
const PORT = process.env.PORT || 9000;

const server = express();
const apiRouter = express.Router();

const PER_PAGE = 10;

apiRouter.get("/jobs", async (req, res) => {
  let { page = 1, perPage = PER_PAGE } = req.query;

  console.log("GET", `/jobs?page=${page}&perPage=${perPage}`);

  try {
    const cachedJobs = await db.readJobs();

    if (cachedJobs.length > 0) {
      return res.json({
        page,
        total: cachedJobs.length,
        jobs: cachedJobs
          .slice(page * perPage - perPage, page * perPage)
          .map(withSeniority),
      });
    }

    // Fresh fetch

    const html = await fetch(
      "https://weworkremotely.com/categories/remote-programming-jobs"
    ).then((resp) => resp.text());

    const jobs = getJobsFromHTML(html);

    await db.writeJobs(jobs);

    const pageCount = Math.ceil(jobs.length / perPage);
    page = Number(page);

    //   invalid page, return the first page
    if (!page) {
      console.log(`invalid page, page is reset to 1`);
      page = 1;
    }

    // //   pages over the last page, return the last page
    if (page > pageCount) {
      console.log(
        `page over the last page, page is reset to the last page ${pageCount}`
      );
      page = pageCount;
    }

    return res.json({
      page,
      total: jobs.length,
      jobs: jobs
        .slice(page * perPage - perPage, page * perPage)
        .map(withSeniority),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server internal err");
  }
});

server.use(cors());
server.use("/api", apiRouter);

server.listen(PORT, () => {});

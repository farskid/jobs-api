const express = require("express");
const { default: fetch } = require("node-fetch");
const serverlessHTTP = require("serverless-http");
const cors = require("cors");
const { getJobsFromHTML } = require("../jobs");
const db = require("../db.js");

const server = express();
const apiRouter = express.Router();

const PER_PAGE = 10;

apiRouter.get("/jobs", async (req, res) => {
  let { page = 1, perPage = PER_PAGE } = req.query;

  console.log("GET", `/jobs?page=${page}&perPage=${perPage}`);

  try {
    const cachedJobs = await db.readJobs();

    if (cachedJobs.length > 0) {
      return responseDecorator(res).json({
        page,
        total: cachedJobs.length,
        jobs: cachedJobs.slice(page * perPage - perPage, page * perPage),
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

    return responseDecorator(res).json({
      page,
      total: jobs.length,
      jobs: jobs.slice(page * perPage - perPage, page * perPage),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server internal err");
  }
});

server.use(cors());
server.use("/.netlify/functions/api", apiRouter);
server.set("etag", false);

// No idea why a middleware didn't work!
function responseDecorator(res) {
  // new Date().toISOString()
  res.setHeader("x-last-modified", new Date().toISOString());
  // Disable caching
  res.set("Cache-Control", "no-store");

  res.setHeader("Content-Type", "application/json");

  console.log(res.headers);
  return res;
}

// Server will start at port 9000 by default
module.exports.handler = serverlessHTTP(server);

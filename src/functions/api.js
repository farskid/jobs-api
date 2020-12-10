const express = require("express");
const { default: fetch } = require("node-fetch");
const serverlessHTTP = require("serverless-http");
const cors = require("cors");
const { getJobsFromHTML } = require("../jobs");

const server = express();
const apiRouter = express.Router();

// const PER_PAGE = 10;

apiRouter.get("/", (_, res) => {
  res.send("Nothing on this endpoint!");
});

apiRouter.get("/jobs", (req, res) => {
  let { page = 1, perPage = PER_PAGE } = req.query;

  console.log("GET", `/jobs?page=${page}&perPage=${perPage}`);

  const htmlReq = fetch(
    "https://weworkremotely.com/categories/remote-programming-jobs"
  );

  htmlReq
    .then((resp) => resp.text())
    .then((html) => {
      const jobs = getJobsFromHTML(html);

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
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Server internal err");
    });
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
  return res;
}

// Server will start at port 9000 by default
module.exports.handler = serverlessHTTP(server);

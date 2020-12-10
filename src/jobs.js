const cheerio = require("cheerio");
const uuid = require("uuid");

module.exports.getJobsFromHTML = (html) => {
  const $ = cheerio.load(html);
  return $(".jobs ul > li")
    .not("#one-signal-subscription-form")
    .map((_, el) => {
      const isNew = !!$(el).find(".new");
      const $job = $(el).find("a");
      const link = $job.attr("href") || null;
      const company = $(el).find(".company").text() || null;
      const title = $(el).find(".title").text() || null;
      const date = $(el).find("time").attr("datetime") || null;
      const type = $(el).find(".company").eq(1).text() || null;
      const region = $(el).find(".region").text() || null;
      return {
        id: uuid.v4(),
        isNew,
        link: `https://weworkremotely.com${link}`,
        company,
        title,
        date,
        type,
        region,
      };
    })
    .toArray();
};

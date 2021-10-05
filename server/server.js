const express = require("express");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const HtmlTableToJson = require("html-table-to-json");

const app = express();
const port = process.env.PORT || 3001;

function getParsedTime(runTime) {
  const timeInfo = runTime.split("+");
  const rawTime = Number(timeInfo[0]);
  let adjustedTime;
  let cones = 0;
  let dnf = false;
  if (timeInfo[1]) {
    timeInfo[1] === "dnf" ? (dnf = true) : (cones = Number(timeInfo[1]));
  }
  if (!dnf) {
    adjustedTime = rawTime + cones * 2;
  }
  return { rawTime, adjustedTime, cones, dnf };
}

function uniqueID() {
  return Math.floor(Math.random() * Date.now());
}

async function parseData(siteData) {
  const jsonTable = HtmlTableToJson.parse(siteData("[name=#top]").html());
  const results = jsonTable.results[2];

  const runners = [];

  while (results.length > 0) {
    let firstItem = results.shift();
    if (typeof firstItem.Driver === "undefined") {
      firstItem = results.shift();
    }
    const secondItem = results.shift();
    const runs = [];

    Object.entries(firstItem).forEach(([key, value]) => {
      if (key.includes("Run") && value !== "") {
        const { cones, rawTime, dnf, adjustedTime } = getParsedTime(value);
        runs.push({ runGroup: 1, rawTime, adjustedTime, dnf, cones });
      }
    });
    Object.entries(secondItem).forEach(([key, value]) => {
      if (key.includes("Run") && value !== "") {
        const { cones, rawTime, dnf, adjustedTime } = getParsedTime(value);
        runs.push({ runGroup: 2, rawTime, adjustedTime, dnf, cones });
      }
    });

    runners.push({
      id: uniqueID(),
      driver: firstItem.Driver,
      position: Number(firstItem["Pos."].replace("T", "")),
      class: firstItem.Class,
      number: firstItem["#"],
      car: {
        model: firstItem["Car Model"],
        color: firstItem["Car Color"],
      },
      trophy: firstItem["Pos."].includes("T"),
      runs,
    });
  }
  return runners;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/results", async (req, res) => {
  const siteUrl = "http://ne-svt.org/results/results_sample.html";
  const result = await axios.get(siteUrl);
  const siteData = cheerio.load(result.data);

  const runData = await parseData(siteData);
  res.send(runData);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

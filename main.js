const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const { parseAsync } = require("json2csv");
var fs = require("fs");

const options = {
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  attributeNamePrefix: "@_",
};

const main = async () => {
  const newJsonData = await getXmlData();
  const newData = parseData(newJsonData.rss.channel.item);
  const csvData = await convertJsonToXml(newData);
  createCsvFile(csvData);
};

const parseData = (data) => {
  const architecture = data.map((e) => {
    return {
      id: getId(e.guid),
      Title: e.title,
      Description: truncateString(e.description, 68),
      "Article URL": e.link,
      "Image URL": e.enclosure["@_url"],
      "Image Size": Math.round(parseInt(e.enclosure["@_length"]) * 0.001),
    };
  });
  return architecture;
};

const getXmlData = async () => {
  const xmlData = await axios.get("https://www.lepoint.fr/politique/rss.xml");
  const parser = new XMLParser(options);
  return parser.parse(xmlData.data);
};

const convertJsonToXml = async (data) => {
  const fields = [
    "id",
    "Title",
    "Description",
    "Article URL",
    "Image URL",
    "Image Size",
  ];
  const opts = { fields };

  return await parseAsync(data, opts);
};

const createCsvFile = (data) => {
  fs.appendFile("lePoint.csv", data, function (err) {
    if (err) throw err;
    console.log("File created");
  });
};

const truncateString = (data, num) => {
  if (data.length <= num) {
    return str;
  }
  return data.slice(0, num) + "...";
};

const getId = (idString) => {
  const url = new URL(idString);
  const myArray = url.pathname.split("/");
  const lastValue = myArray[myArray.length - 1];
  const separ = lastValue.split("-");
  const id = separ[separ.length - 1].replace(".php", "");

  return id;
};

main();

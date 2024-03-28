const fs = require("fs");
const { join } = require("path");

const pathToDB = join(__dirname, "db.json");
const db = Object.values(JSON.parse(fs.readFileSync(pathToDB)));

let errorMessages = [];
let evaluatedIds = {};
const CATEGORIES = ["course", "resource", "template", "project"];
const LANGUAGES = ["en", "fr"];
const isValidHTTPURL = (str) =>
  null !==
  str.match(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i
  );

db.forEach((el) => {
  if (!el.id) {
    errorMessages.push(`Article has no ID : ${JSON.stringify(el, null, 2)}`);
  }

  if (!el.title || typeof el.title !== "string" || el.title.trim() === "") {
    errorMessages.push(
      `Article has an empty title or no title : ${JSON.stringify(el, null, 2)}`
    );
  }

  if (evaluatedIds[el.id]) {
    errorMessages.push(
      `You have multiple articles with the same ID : ${JSON.stringify(
        el,
        null,
        2
      )} \n ${JSON.stringify(evaluatedIds[el.id], null, 2)}`
    );
  }

  if (!el.url || !isValidHTTPURL(el.url)) {
    errorMessages.push(
      `Article has an invalid http(s) URL or no URL : ${JSON.stringify(
        el,
        null,
        2
      )}`
    );
  }

  if (!isValidHTTPURL(el.thumbnail) && el.thumbnail.trim() !== "") {
    errorMessages.push(
      `The URL of the thumbnail is malformed : ${JSON.stringify(el, null, 2)}`
    );
  }

  if (!el.language) {
    errorMessages.push(
      `The article dosen't specify a language : ${JSON.stringify(el, null, 2)}`
    );
  }

  //some partial salvage
  el.language = el.language.toLowerCase();
  if (!LANGUAGES.includes(el.language)) {
    errorMessages.push(
      `The article specifies an unsupported language: \n supported languages ${LANGUAGES} \n ${JSON.stringify(
        el,
        null,
        2
      )}`
    );
  }

  if (!el.type) {
    errorMessages.push(
      `The article dosen't specify a category : ${JSON.stringify(el, null, 2)}`
    );
  }

  //some partial salvage
  el.type = el.type.toLowerCase();
  if (!CATEGORIES.includes(el.type)) {
    errorMessages.push(
      `The article specifies an unsupported category: \n supported categories ${CATEGORIES} \n ${JSON.stringify(
        el,
        null,
        2
      )}`
    );
  }
  //##################
  //
  //start of salvaging
  //
  //##################
  evaluatedIds[el.id] = el;

  if (!el.description) {
    el.description = "";
  }

  if (!el.tags) {
    el.tags = [];
  }

  if (!el.thumbnail) {
    el.thumbnail = "";
  }
});

if (errorMessages.length > 0) {
  throw errorMessages.join("\n");
}

fs.writeFileSync(pathToDB, JSON.stringify(db, null, 2));

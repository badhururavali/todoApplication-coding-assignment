const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializerDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (request, response) => {
      console.log("Server is Running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializerDbAndServer();

// Invalid scenarios for all API's

app.get("/todos", async (request, response) => {
  let getQuery = "";
  let data = null;
  const { search_q = "", status, priority, category } = request.query;
  switch (true) {
    case status !== undefined:
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}' AND status = '${status}';`;
      data = "Todo Status";
      break;
    case priority !== undefined:
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}' AND priority = '${priority}';`;
      data = "Todo Priority";
      break;
    case category !== undefined:
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}' AND category = '${category}';`;
      data = "Todo Category";
      break;
  }

  const result = await db.get(getQuery);
  if (result === undefined) {
    response.status(400);
    response.send(`Invalid ${data}`);
  } else {
    response.send(result);
  }
});

app.get("/agenda", async (request, response) => {
  const { search_q = "", due_date } = request.query;
  const getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND due_date = '${due_date}';`;

  const result = await db.get(getQuery);
  if (result === undefined) {
    response.status(400);
    response.send(`Invalid Due Date`);
  }
});

// check API 1 column are undefined or not
const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasPriorityAndCategory = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

// Get API 1
app.get("/todos", async (request, response) => {
  const { search_q = "", todo, status, priority, due_date } = request.query;
  let getQuerys = "";
  let data = null;

  switch (true) {
    case hasStatus(request.query):
      getQuerys = `
            SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
             AND status = '${status}';
            `;
      break;
    case hasPriority(request.query):
      getQuerys = `
          SELECT * FROM todo WHERE todo LIKE '%${search_q}%' 
          AND priority = '${priority}';`;
      break;
    case hasPriorityAndStatus(request.query):
      getQuerys = `
        SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
         AND priority = '${priority}'
          AND status = '${status}';`;
      break;
    case hasCategoryANDStatus(request.query):
      getQuerys = `
        SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
         AND category = '${category}'
          AND status = '${status}';`;
    case hasCategory(request.query):
      getQuerys = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
         AND category = '${category}';`;
    case hasPriorityAndCategory(request.query):
      getQuerys = `SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%' AND category='${category}' AND priority = '${priority}';`;

    default:
      getQuerys = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getQuerys);
  response.send(data);
});

module.exports = app;

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Pool } = require("pg");

const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const port = Number(process.env.PORT || 3000);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || String(databaseUrl).trim() === "") {
  console.error(
    "FATAL: DATABASE_URL no está definida. En Railway, añade PostgreSQL al proyecto y comparte " +
      "su DATABASE_URL con el servicio de la API (Variables → referencia al servicio Postgres)."
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", dbConnected: true });
  } catch (error) {
    res.status(500).json({ status: "error", dbConnected: false, error: error.message });
  }
});

app.use(routes);

app.use(errorHandler);

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection established.");

    app.listen(port, () => {
      console.log(`API listening on port ${port}.`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }
}

start();

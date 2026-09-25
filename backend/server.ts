import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import { join } from "path";
import appRoutes from "./src/routes";
import "dotenv/config";

const PORT = process.env.PORT || 3000

const openapiDocument = load(readFileSync(join(__dirname, "openapi.yaml"), "utf8")) as object;

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.use(appRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
import express from "express";
import cors from "cors";
import appRoutes from "./src/routes";
import "dotenv/config";

const PORT = process.env.PORT || 3000


const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(appRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analyze", analyzeRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Metafy Backend rodando na porta", PORT);
});

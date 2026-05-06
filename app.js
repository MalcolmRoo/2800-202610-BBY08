require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

// middleware
app.use(cors());
app.use(express.json());

// API routes FIRST
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running" });
});

app.post("/api/identify", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const organ = req.body.organ || "leaf";
    const apiKey = process.env.PLANTNET_API_KEY;

    const form = new FormData();
    form.append("organs", organ);
    form.append("images", req.file.buffer, {
      filename: "plant.jpg",
      contentType: req.file.mimetype,
    });

    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`,
      {
        method: "POST",
        body: form,
      },
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "PlantNet API error" });
    }

    const data = await response.json();
    const top = data.results[0];

    res.json({
      scientificName: top.species.scientificNameWithoutAuthor,
      commonName: top.species.commonNames[0] || "Unknown",
      score: Math.round(top.score * 100),
      remainingCalls: data.remainingIdentificationRequests,
    });
  } catch (err) {
    console.error("Identify error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PermaPeople search route
app.post("/api/permapeople/search", async (req, res) => {
  try {
    const q = req.body.q;
    if (!q) {
      return res.status(400).json({ error: "Missing search term q" });
    }

    const response = await fetch("https://permapeople.org/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q }),
    });

    if (!response.ok) {
      const raw = await response.text();
      console.error("PermaPeople search error:", raw);
      return res.status(500).json({ error: "PermaPeople search failed" });
    }

    const data = await response.json();
    res.json(data); // { plants: [ ... ] }
  } catch (err) {
    console.error("PermaPeople search exception:", err);
    res.status(500).json({ error: "Server error in PermaPeople search" });
  }
});

// PermaPeople get single plant by ID
app.get("/api/permapeople/plants/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const response = await fetch(`https://permapeople.org/api/plants/${id}`, {
      headers: {
        "x-permapeople-key-id": process.env.PERMA_KEY_ID,
        "x-permapeople-key-secret": process.env.PERMA_KEY_SECRET,
        "Content-Type": "application/json",
      },
    });

    const raw = await response.text();
    console.log("RAW PERMAPEOPLE PLANT RESPONSE:", raw);

    try {
      const data = JSON.parse(raw);
      return res.json(data);
    } catch (e) {
      return res.json({ error: "PermaPeople returned non‑JSON", raw });
    }
  } catch (err) {
    console.error("PermaPeople plant exception:", err);
    res.json({ error: "Server error in PermaPeople plant fetch" });
  }
});

// ignore this ajax call: Trefle plant details route
app.get("/api/plant-details", async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) {
      return res.status(400).json({ error: "Missing plant name" });
    }

    const trefleToken = process.env.TREFLE_TOKEN;

    // 1. Search Trefle for the plant by scientific name
    const searchUrl = `https://trefle.io/api/v1/plants/search?token=${trefleToken}&q=${encodeURIComponent(name)}`;
    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      const raw = await searchResponse.text();
      console.error("Trefle search error:", raw);
      return res.status(500).json({ error: "Trefle search request failed" });
    }

    const searchData = await searchResponse.json();

    if (!searchData.data || searchData.data.length === 0) {
      return res.status(404).json({ error: "Plant not found in Trefle" });
    }

    const plantId = searchData.data[0].id;

    // 2. Fetch full plant details
    const detailUrl = `https://trefle.io/api/v1/plants/${plantId}?token=${trefleToken}`;
    const detailResponse = await fetch(detailUrl);

    if (!detailResponse.ok) {
      const raw = await detailResponse.text();
      console.error("Trefle detail error:", raw);
      return res.status(500).json({ error: "Trefle detail request failed" });
    }

    const detailData = await detailResponse.json();

    if (!detailData || !detailData.data) {
      console.error("Unexpected Trefle detail format:", detailData);
      return res
        .status(500)
        .json({ error: "Unexpected Trefle response format" });
    }

    // 3. Return clean data to frontend
    res.json(detailData.data);
  } catch (err) {
    console.error("Trefle error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// page routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/camera", (req, res) => {
  res.sendFile(path.join(__dirname, "camera.html"));
});
app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, "search.html"));
});
app.get("/plant", (req, res) => {
  res.sendFile(path.join(__dirname, "plant.html"));
});

// static files AFTER routes
app.use(express.static(path.join(__dirname, "styles")));
app.use(express.static(path.join(__dirname, "src")));

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

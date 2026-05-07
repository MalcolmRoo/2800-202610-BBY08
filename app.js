require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch").default;
const FormData = require("form-data");

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

// middleware
app.use(cors());
app.use(express.json());

// test route — confirm server is running
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// PlantNet identify route — receives image from camera, forwards to PlantNet API
app.post("/api/identify", upload.single("image"), async (req, res) => {
  try {
    // Step 1: Check file exists
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Step 2: Setup organ and API key
    const organ = req.body.organ || "auto"; // default to auto detection
    const apiKey = process.env.PLANTNET_API_KEY;

    console.log("[API] File:", req.file.originalname);
    console.log("[API] API Key exists:", !!apiKey);
    console.log("[API] Organ:", organ);

    // Step 3: Build FormData to send to PlantNet
    const form = new FormData();
    form.append("organs", organ);
    form.append("images", req.file.buffer, {
      filename: "plant.jpg",
      contentType: req.file.mimetype,
    });
    console.log("[API] FormData created");

    // Step 4: Call PlantNet API
    const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`;
    console.log("[API] Calling PlantNet...");

    const response = await fetch(url, { method: "POST", body: form });
    console.log("[API] PlantNet status:", response.status);

    // Check HTTP status before reading body
    if (!response.ok) {
      const errorText = await response.text();
      console.log("[API] PlantNet HTTP error:", errorText);

      // Handle species not found specifically
      if (response.status === 404 || errorText.includes("Species not found")) {
        return res
          .status(404)
          .json({
            error: "Could not identify plant. Try with a clearer photo.",
          });
      }

      return res.status(response.status).json({ error: "PlantNet API error" });
    }

    // Step 5: Parse response
    const data = await response.json();
    console.log("[API] Response received, results:", data.results?.length);

    // Check for species not found in JSON body too
    if (data.error && data.error.includes("Species not found")) {
      return res
        .status(404)
        .json({ error: "Could not identify plant. Try with a clearer photo." });
    }

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: "No results found" });
    }

    // Take top result (highest confidence)
    const top = data.results[0];
    console.log("[API] Top result:", top.species?.scientificNameWithoutAuthor);

    // Return clean result to frontend
    res.json({
      scientificName: top.species?.scientificNameWithoutAuthor || "Unknown",
      commonName: top.species?.commonNames?.[0] || "Unknown",
      score: Math.round(top.score * 100), // convert 0.94 → 94%
      remainingCalls: data.remainingIdentificationRequests, // track daily limit
    });
  } catch (err) {
    console.error("[API] ERROR:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Permapeople search route — searches by scientific name, returns plant list
app.post("/api/permapeople/search", async (req, res) => {
  try {
    const q = req.body.q;
    if (!q) return res.status(400).json({ error: "Missing search term q" });

    const response = await fetch("https://permapeople.org/api/search", {
      method: "POST",
      headers: {
        "x-permapeople-key-id": process.env.PERMA_KEY_ID,
        "x-permapeople-key-secret": process.env.PERMA_KEY_SECRET,
        "Content-Type": "application/json",
        "x-permapeople-key-id": process.env.PERMA_KEY_ID, // auth key
        "x-permapeople-key-secret": process.env.PERMA_KEY_SECRET, // auth secret
      },
      body: JSON.stringify({ q }),
    });
    

    if (!response.ok) {
      const raw = await response.text();
      console.error("PermaPeople search error:", raw);
      return res.status(500).json({ error: "PermaPeople search failed" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("PermaPeople search exception:", err);
    res.status(500).json({ error: "Server error in PermaPeople search" });
  }
});

// Permapeople get single plant by ID — returns full plant details
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

    // Parse JSON response safely
    try {
      const data = JSON.parse(raw);
      return res.json(data);
    } catch (e) {
      return res.json({ error: "PermaPeople returned non-JSON", raw });
    }
  } catch (err) {
    console.error("PermaPeople plant exception:", err);
    res.json({ error: "Server error in PermaPeople plant fetch" });
  }
});

// page routes — serve HTML files
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

// static files AFTER routes — styles, src scripts, and public assets
app.use(express.static(path.join(__dirname, "styles")));
app.use(express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, "public")));

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

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
app.use(express.static(__dirname));

// Static files (explicit mappings)
app.use(express.static(path.join(__dirname, "styles")));
app.use(express.static(path.join(__dirname, "src")));

// API routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running" });
});

app.post("/api/identify", upload.single("image"), async (req, res) => {
  try {
    // Step 1: Check file
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Step 2: Setup
    const organ = req.body.organ || "leaf";
    const apiKey = process.env.PLANTNET_API_KEY;
    
    console.log("[API] File:", req.file.originalname);
    console.log("[API] API Key exists:", !!apiKey);
    console.log("[API] Organ:", organ);

    // Step 3: Create FormData for PlantNet
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
    
    const response = await fetch(url, {
      method: "POST",
      body: form,
    });
    
    console.log("[API] PlantNet status:", response.status);

    // Check HTTP status FIRST - before reading body
    if (!response.ok) {
      const errorText = await response.text();
      console.log("[API] PlantNet HTTP error:", errorText);
      
      // Handle 404 specifically
      if (response.status === 404 || errorText.includes("Species not found")) {
        return res.status(404).json({ error: "Could not identify plant. Try with a clearer photo." });
      }
      
      return res.status(response.status).json({ error: "PlantNet API error" });
    }

    // Step 5: Parse response (only called once, body is OK)
    const data = await response.json();
    console.log("[API] Response received, results:", data.results?.length);

    // Check for "Species not found" in the JSON response
    if (data.error && data.error.includes("Species not found")) {
      return res.status(404).json({ error: "Could not identify plant. Try with a clearer photo." });
    }

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: "No results found" });
    }

    const top = data.results[0];
    console.log("[API] Top result:", top.species?.scientificNameWithoutAuthor);

    res.json({
      scientificName: top.species?.scientificNameWithoutAuthor || "Unknown",
      commonName: top.species?.commonNames?.[0] || "Unknown",
      score: Math.round(top.score * 100),
      remainingCalls: data.remainingIdentificationRequests,
    });
  } catch (err) {
    console.error("[API] ERROR:", err.message);
    console.error("[API] Stack:", err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
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
    res.json(data);
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
      return res.json({ error: "PermaPeople returned non-JSON", raw });
    }
  } catch (err) {
    console.error("PermaPeople plant exception:", err);
    res.json({ error: "Server error in PermaPeople plant fetch" });
  }
});

// Trefle plant details route
app.get("/api/plant-details", async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) {
      return res.status(400).json({ error: "Missing plant name" });
    }

    const trefleToken = process.env.TREFLE_TOKEN;

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
      return res.status(500).json({ error: "Unexpected Trefle response format" });
    }

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

// 404
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
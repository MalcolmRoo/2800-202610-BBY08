require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8']);

require("dotenv").config();
const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const bcrypt = require('bcrypt');
const saltRounds = 12;
const Joi = require('joi');
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch").default;
const FormData = require("form-data");
const fs = require("fs");
const csv = require("csv-parser");
const { findPlantInCSV } = require("./src/csvParse");

const app = express();
const port = process.env.PORT || 3000;
const expireTime = 24 * 60 * 60 * 1000;
const upload = multer({ storage: multer.memoryStorage() });

//User Database Keys
const mongodb_host = process.env.HOST;
const mongodb_user = process.env.USER;
const mongodb_password = process.env.DATABASE_PASS;
const mongodb_session_database = process.env.SESSION_DB;
const mongodb_user_database = process.env.USER_DB;

const node_session_secret = process.env.NODE_SECRET;

const {database} = require('./src/databaseConnection');
const userCollection = database.db(mongodb_user_database).collection('users');


// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        return res.status(404).json({
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

      //checks local csv database for a match
      const name = data.name || "";
      const localInfo = await findPlantInCSV(name);

      const finalData = {
        ...data,
        local_data: localInfo || null,
        is_local: !!localInfo,
      };

      if (finalData.is_local && finalData.local_data.LookAlike?.trim() !== ""){
        finalData.trigger_warning = true;
        const lookAlikeName = finalData.local_data.LookAlike;
        const lookAlikeInfo = await findPlantInCSV(lookAlikeName);
        finalData.local_data.lookAlikeInfo = lookAlikeInfo;
      }
      console.log(finalData);

      return res.json(finalData);
    } catch (e) {
      return res.json({ error: "PermaPeople returned non-JSON", raw });
    }
  } catch (err) {
    console.error("PermaPeople plant exception:", err);
    res.json({ error: "Server error in PermaPeople plant fetch" });
  }
});

// Groq AI chat route — receives plant context + user question, returns AI answer
app.post("/api/chat", async (req, res) => {
  try {
    const { plantName, latinName, question } = req.body;

    // Validate inputs
    if (!question || !plantName) {
      return res.status(400).json({ error: "Missing plant name or question" });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    // Build system prompt with plant context
    // This tells the AI exactly what plant the user is asking about
    // and restricts it to only answer plant-related questions
    const systemPrompt = `You are a helpful plant assistant for GreenScan, an urban foraging app. 
The user has just identified a plant: ${plantName} (${latinName}).
Your job is to answer questions about this specific plant only.
Topics you can help with: edibility, preparation methods, safety, foraging tips, medicinal uses, habitat.
If asked anything unrelated to this plant or foraging, politely redirect the conversation back to the plant.
Keep answers concise, clear and beginner-friendly. Make sure that the answers and stright to the point no useless info, Also try to lay out answers in easy to read bullet points if possible.
try to give short and concise answers, if the answer is too long try to summarize it in a few sentences. If you don't know the answer, say you don't know instead of making something up.
 `;

    // Call Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          max_tokens: 300, // keep answers short and mobile friendly
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[CHAT] Groq error:", errorText);
      return res
        .status(500)
        .json({ error: "AI service unavailable. Try again." });
    }

    const data = await response.json();
    const answer =
      data.choices[0]?.message?.content || "Sorry I could not answer that.";

    console.log("[CHAT] Question:", question);
    console.log("[CHAT] Answer:", answer.substring(0, 100) + "...");

    res.json({ answer });
  } catch (err) {
    console.error("[CHAT] ERROR:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

var mongoStore = MongoStore.create({
  mongoUrl:`mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_session_database}`,
  crypto: {
    secret: process.env.MONGO_SESSION_SECRET
  }
});

app.use(session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true
}));

app.post('/loginSubmit', async(req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  
  const schema = Joi.string().max(20).required();
  const validationResult = schema.validate(email);

  if(validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect('/login');
    return;
  }

  const result = await userCollection.find({email: email}.project({username: 1, email: 1, password: 1, favourites: 1, settings: 1, _id: 1})).toArray();

  if(result.length != 1){
    //what to do if no user found
    console.log("no user found");
    return;
  }

  if(await bcrypt.compare(password, result[0].password)){
    req.session.authenticated = true;
    req.session.username = result[0].username;
    erq.session.cookie.maxAge = expireTime;

    res.redirect('/');
    return;
  } else {
    // what to do if pass is wrong
    console.log("pass is wrong");
    return;
  }
});

app.post('/signUpSubmit', async(req, res) => {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object({
      username: Joi.string().alphanum().max(35).required(),
      email: Joi.string().max(45).required(),
      password: Joi.string().max(20).required()
    });

    const validationResult = schema.validate({username, email, password});

    if(validationResult.error != null){
        console.log(validationResult.error);
        res.redirect('/login');
        return;
    }

    var hashedPassword = bcrypt.hashSync(password, saltRounds);
    await userCollection.insertOne({username: username, email: email, password: hashedPassword, favourites:[], settings:[]});

    req.session.authenticated = true;
    req.session.username = username;
    req.session.cookie.maxAge = expireTime;

    res.redirect('/');
    return;
});

// page routes — serve HTML files
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});
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
app.get("/favorites", (req, res) => {
  res.sendFile(path.join(__dirname, "favorites.html"));
});
app.get("/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "settings.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// static files AFTER routes — styles, src scripts, and public assets
app.use(express.static(path.join(__dirname, "styles")));
app.use(express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "data")));

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

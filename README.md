# GreenScan

## What is GreenScan?
GreenScan is an app designed to help you understand and learn about foraging. It allows you to quickly search for information about the plants around you—whether you are in your backyard, at a local park, or on a hike. It is perfect for anyone looking to supplement their daily food budget or for curious gourmands. GreenScan supports plant searches using both photos and text. Whether you are a new or experienced forager, our goal is to make identifying edible plants easier than ever.

## Tech Stack
- **HTML5**: Front End
- **CSS3**: Front End
- **JavaScript**: Front and Back End
- **GitHub**: Project Repository
- **Render**: Web Hosting
- **PlantNet**: Plant image identification API
- **PermaPeople**: Plant database API
- **Groq**: AI chatbot
- **Node.js & Express.js**: Back end server and routing
- **MongoDB**: User database

## Features Implemented
- **Plant image identification**
- **Camera & image upload support**
- **AI-powered plant assistant**
- **Toxicity and lookalike warnings**
- **Favorites system**
- **Plant search functionality**
- **Share functionality**
- **Local caching**
- **Responsive mobile-first UI**

## File Structure
```
2800-BBY8/
├── data/
│   └── PNWPlants.csv          # Local plant database
├── public/                    # Static assets (images, icons, vectors)
├── src/                       # Frontend application logic
│   ├── camera.js              # Handles live camera feed and image taking
│   ├── chat.js                # AI chatbot
│   ├── chatPage.js            # Additonal AI chatbot functionality
│   ├── csvParse.js            # Parse the local database
│   ├── databaseConnection.js  # Functions to connect to MongoDB
│   ├── favorites.js           # Handles favouriting specific results
│   ├── global.js              # Regularly re-used functions
│   ├── identify.js            # PlantNet API and PermaPeople API interfacing
│   ├── index.js               # Main screen functionality
|   ├── login.js               # Display correct login/sign up form
│   ├── plantData.js           # Parse and categorize recieved plant data
│   ├── result.js              # Display text search results
│   ├── search.js              # Text search functionality
│   ├── settings.js            # User Settings
│   ├── share.js               # Social Media Sharing Capability
│   ├── tutorial.js            # Tutorial Functionality
│   └── uploadImage.js         # Upload an image functionality
├── styles/                    # Global and component stylesheets
│   ├── 404.css                # Styles 404 page
│   ├── camera.css             # Styles live camera feed page
│   ├── chat.css               # Styles AI chat page
│   ├── favorites.css          # Styles user favourites page
│   ├── global.css             # Global Style variables
│   ├── index.css              # Styles main page
│   ├── login.css              # Styles login/sign up page
│   ├── plant.css              # Styles plant progile page
│   ├── search.css             # Styles text search results page
│   ├── settings.css           # Styles settings page
│   ├── style.css              # Collects all the stylesheets together
│   └── warning.css            # Stles toxic lookalike warning message
├── .gitignore                 # Gitignore
├── 404.html                   # 404 page
├── about_us.html              # About us page
├── app.js                     # File routing and global functions
├── camera.html                # Camera live feed and capture page
├── chat.html                  # AI chatbot page
├── favorites.html             # User favourites page
├── help.html                  # Help page
├── index.html                 # Main page
├── package-lock.json          # Packages
├── package.json               # Packages
├── plant.html                 # Plant results page
├── README.md                  # Readme
├── search.html                # Search results page
└── settings.html              # Settings page
```

## How to Access GreenScan
Visit this link for the most recent stable release: [GreenScan](https://two800-202610-bby08.onrender.com/)

## How to Use GreenScan
1. **Identify**: Choose to scan a plant using your device's camera, uploading a photo, or searching by text.
2. **Scan**: The API will attempt to identify the plant. If it is unsuccessful, you may be prompted to try again (ideally with a clearer image).
3. **Learn**: Once successfully identified, you will be redirected to the plant's profile to explore its details.
4. **Chat**: If you have further questions, use the built-in AI assistant on the profile page to get more information.

## AI and API Credits
- **Plant Data**: We utilize the database and API provided by [PermaPeople](https://permapeople.org/), which is licensed under the Creative Commons Attribution 4.0 License.
- **Image Identification**: We use the [Pl@ntNet API](https://plantnet.org/en/) to process and identify plants through images.
-**AI chatbot**: AI Assistant powered by Groq API and large language models for conversational plant guidance, care recommendations, and user support.

## Licenses
This project is available under the [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) license.


## The Team
- Malcolm Roosdahl : mroosdahl@my.bcit.ca
- Zach Mosdell : zmosdell@my.bcit.ca
- Veerpartap Singh Kahlon : Vkahlon4@my.bcit.ca
- Shaan Puar : Spuar2@my.bcit.ca
- Xi Yao : xyao23@my.bcit.ca

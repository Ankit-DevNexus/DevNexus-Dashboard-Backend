import express from "express";
import axios from "axios";
import TokenModel from "../models/Token.js";
const router = express.Router();

APP_ID = process.env.APP_ID;
APP_SECRET = process.env.APP_SECRET;
REDIRECT_URI = process.env.REDIRECT_URI;

router.get("/facebook/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code parameter");

    console.log("code:", code);
    console.log("APP_ID:", APP_ID);
    console.log("APP_SECRET:", APP_SECRET ? "present" : "missing");
    console.log("REDIRECT_URI:", REDIRECT_URI);

    const shortTokenRes = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
      params: {
        client_id: APP_ID,
        redirect_uri: REDIRECT_URI,
        client_secret: APP_SECRET,
        code,
      },
    });

    const shortToken = shortTokenRes.data.access_token;

    const longTokenRes = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
      params: {
        grant_type: "fb_exchange_token",
        client_id: APP_ID,
        client_secret: APP_SECRET,
        fb_exchange_token: shortToken,
      },
    });

    const longToken = longTokenRes.data.access_token;

    const pageRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${longToken}`);
    const pages = pageRes.data.data;

    if (!pages || pages.length === 0) {
      console.warn("No pages connected to this user.");
    }

    for (const page of pages) {
      await TokenModel.create({
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
        user_access_token: longToken,
        token_created_at: new Date(),
      });
    }

    res.send("Tokens and pages stored");
  } catch (err) {
    console.error("Error in /facebook/callback:", err.response?.data || err.message);
    res.status(500).send("Something went wrong during token processing.");
  }
});


export default router;

// // routes/callback.js
// import express from "express";
// import axios from "axios";
// import TokenModel from "../models/Token.js";
// const router = express.Router();

// const { APP_ID, APP_SECRET, REDIRECT_URI } = process.env;

// router.get("/facebook/callback", async (req, res) => {
//   const code = req.query.code;

//   const shortTokenRes = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
//     params: {
//       client_id: APP_ID,
//       redirect_uri: REDIRECT_URI,
//       client_secret: APP_SECRET,
//       code,
//     },
//   });

//   console.log("code:", code);
//   console.log("APP_ID:", APP_ID);
//   console.log("APP_SECRET:", APP_SECRET ? "present" : "missing");
//   console.log("REDIRECT_URI:", REDIRECT_URI);


//   const shortToken = shortTokenRes.data.access_token;

//   // Exchange for long-lived token
//   const longTokenRes = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
//     params: {
//       grant_type: "fb_exchange_token",
//       client_id: APP_ID,
//       client_secret: APP_SECRET,
//       fb_exchange_token: shortToken,
//     },
//   });

//   const longToken = longTokenRes.data.access_token;

//   // Get Pages
//   const pageRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${longToken}`);
//   const pages = pageRes.data.data;

//   for (const page of pages) {
//     // Save to DB
//     await TokenModel.create({
//       page_id: page.id,
//       page_name: page.name,
//       page_access_token: page.access_token,
//       user_access_token: longToken,
//       token_created_at: new Date(),
//     });
//   }

//   res.send("Tokens and pages stored");
// });

// export default router;

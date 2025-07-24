// routes/callback.js
import axios from "axios";
import TokenModel from "../models/Token.js";

const { APP_ID, APP_SECRET, REDIRECT_URI } = process.env;

export const exchangeAndStoreFacebookTokens = async (req, res) => {
  const code = req.query.code;

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

  for (const page of pages) {
    await TokenModel.create({
      page_id: page.id,
      page_name: page.name,
      page_access_token: page.access_token,
      user_access_token: longToken,
      token_created_at: new Date(),
    });

    // 🔥 Subscribe to leadgen webhook automatically
    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${page.id}/subscribed_apps`,
        {
          subscribed_fields: ["leadgen"],
        },
        {
          params: {
            access_token: page.access_token,
          },
        }
      );
      console.log(`Subscribed to leadgen for page ${page.name}`);
    } catch (error) {
      console.error(`❌ Failed to subscribe page ${page.name} to leadgen webhook:`, error.response?.data || error.message);
    }
  }

  res.send("Tokens and pages stored");
};


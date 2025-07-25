import express from 'express';
import axios from 'axios';
import MetaLeadsModel from "../models/MetaLeadsModel.js";
import TokenModel from "../models/Token.js";

const router = express.Router();
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

router.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry || []) {
      const pageId = entry.id;
      const changes = entry.changes;

      if (!Array.isArray(changes)) {
        console.warn("Invalid or missing 'changes' in entry:", entry);
        continue;
      }

      for (const change of changes) {
        if (!change?.value?.leadgen_id) {
          console.warn("Missing leadgen_id in change:", change);
          continue;
        }

        const leadgen_id = change.value.leadgen_id;
        const form_id = change.value.form_id;

        const tokenData = await TokenModel.findOne({ page_id: pageId });
        if (!tokenData) {
          console.error("Token not found for page:", pageId);
          continue;
        }

        const url = `https://graph.facebook.com/v19.0/${leadgen_id}?access_token=${tokenData.page_access_token}`;
        console.log("Fetching lead from:", url);

        try {
          const leadRes = await axios.get(url);
          const lead = leadRes.data;

          await MetaLeadsModel.create({
            leadgen_id,
            form_id,
            page_id: pageId,
            field_data: lead.field_data,
            created_time: lead.created_time,
          });

          console.log("New lead saved");
        } catch (err) {
          console.error("Error fetching lead data:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  } else {
    return res.sendStatus(404);
  }
});


export default router;

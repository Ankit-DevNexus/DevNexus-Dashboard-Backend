// routes/webhook.js
import MetaLeadsCollection from "../models/MetaLeadsModel.js";
import TokenModel from "../models/Token.js";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

export const verifyWebhook =  (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
}



export const handleFacebookWebhook = async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const { id: pageId, changes } = entry;

      for (const change of changes) {
        const leadgen_id = change.value.leadgen_id;
        const form_id = change.value.form_id;

        const tokenData = await TokenModel.findOne({ page_id: pageId });
        if (!tokenData) return;

        const leadRes = await axios.get(`https://graph.facebook.com/v19.0/${leadgen_id}?access_token=${tokenData.page_access_token}`);
        const lead = leadRes.data;

        const savedLead = await MetaLeadsCollection.create({
          leadgen_id,
          form_id,
          page_id: pageId,
          field_data: lead.field_data,
          created_time: lead.created_time,
        });
        console.log("Saved lead:", savedLead);


        console.log("New lead stored");
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
};



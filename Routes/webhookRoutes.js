import MetaLeadsModel from "../models/MetaLeadsModel.js";

import express from 'express';
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
        for (const entry of body.entry) {
            const { id: pageId, changes } = entry;

            for (const change of changes) {
                const leadgen_id = change.value.leadgen_id;
                const form_id = change.value.form_id;

                if (!change.value || !change.value.leadgen_id) {
                    console.warn("Missing leadgen_id in webhook payload:", change.value);
                    continue;
                }


                const tokenData = await TokenModel.findOne({ page_id: pageId });
                if (!tokenData) return;

                console.log("Fetching lead data from:", `https://graph.facebook.com/v19.0/${leadgen_id}?access_token=${tokenData.page_access_token}`);

                try {
                    const leadRes = await axios.get(`https://graph.facebook.com/v19.0/${leadgen_id}?access_token=${tokenData.page_access_token}`);
                    const lead = leadRes.data;

                    await MetaLeadsModel.create({
                        leadgen_id,
                        form_id,
                        page_id: pageId,
                        field_data: lead.field_data,
                        created_time: lead.created_time,
                    });

                    console.log("New lead stored");
                } catch (err) {
                    console.error("Failed to fetch lead:", {
                        message: err.message,
                        response: err.response?.data,
                        status: err.response?.status
                    });
                }

            }
        }
        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

export default router;

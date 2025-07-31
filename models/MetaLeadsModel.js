import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
    leadgen_id: String,
    form_id: String,
    page_id: String,
    campaign_name: String,
    field_data: Array,
    created_time: {
        type: Date,
        default : Date.now,
    },
}, {
    timestamps: true, // adds createdAt and updatedAt fields automatically
});

const MetaLeadsModel = mongoose.model("MetaLeadsCollection", leadSchema);
export default MetaLeadsModel;





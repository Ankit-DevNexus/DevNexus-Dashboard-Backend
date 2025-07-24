import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
    //   leadgen_id: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //   },
    //   form_id: {
    //     type: String,
    //     required: true,
    //   },
    //   page_id: {
    //     type: String,
    //     required: true,
    //   },
    //   field_data: [
    //     {
    //       name: String,
    //       values: [String],
    //     },
    //   ],
    leadgen_id: String,
    form_id: String,
    page_id: String,
    field_data: Array,
    created_time: {
        type: Date,
        default : Date.now,
    },
}, {
    timestamps: true, // adds createdAt and updatedAt fields automatically
});

const MetaLeadsCollection = mongoose.model("MetaLeadsCollection", leadSchema);
export default MetaLeadsCollection;





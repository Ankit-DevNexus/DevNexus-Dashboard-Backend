// // models/MetaLead.js

// import mongoose from 'mongoose';

// const MetaLeadSchema = new mongoose.Schema({
//   lead_id: { type: String, required: true, unique: true },
//   full_name: { type: String },
//   email: { type: String },
//   phone_number: { type: String },
//   city:{type: String},
//   created_time: { type: Date },
//   form_id: { type: String },
//   source: { type: Object }, // full raw field_data if needed
//   created_at: { type: Date, default: Date.now }
// });

// const metaAdsLeadsModel =  mongoose.model('MetaLead', MetaLeadSchema);
// export default metaAdsLeadsModel;

// models/MetaLead.js

import mongoose from 'mongoose';
// import { dashboardDB } from '../config/ConnectMongoDB.js';

const MetaLeadSchema = new mongoose.Schema({
  lead_id: { type: String, required: true, unique: true },
  form_id: { type: String },
  created_time: { type: Date },
  created_at: { type: Date, default: Date.now },
  // source: { type: Array },           // full field_data array
  AllFields: { type: Object }   // flattened key-value fields
});

const metaAdsLeadsModel = mongoose.model('MetaLead', MetaLeadSchema);
export default metaAdsLeadsModel;


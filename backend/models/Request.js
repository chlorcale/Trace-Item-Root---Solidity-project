const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    bizName: String,
    productName: String,
    productCode: String,
    certification: String,
    area: String,
    pType: Number,
    region: String, 
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = RequestSchema;
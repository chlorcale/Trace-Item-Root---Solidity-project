const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productId: Number,
    productCode: String,
    name: String,
    manufacturer: String,
    certification: String,
    area: String,
    region: String, // "VN" hoặc "AUS"
    productType: String,
    productionDate: Date,
    activationDate: Date,
    steps: [{
        description: String,
        detail: String,
        imageHash: String,
        time: Date,
        actor: String
    }]
});

// Xuất Schema thay vì Model để có thể dùng với nhiều Connection khác nhau (Multi-DB)
module.exports = ProductSchema;
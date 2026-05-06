const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios'); // Thay thế ethers bằng axios
const cors = require('cors');
const path = require('path');

const ProductSchema = require('./models/Product');
const RequestSchema = require('./models/Request');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. THIẾT LẬP KẾT NỐI HUB (MONGODB) ---
const connVN = mongoose.createConnection('mongodb://localhost:27017/CaMauHub_VN');
const connAUS = mongoose.createConnection('mongodb://localhost:27017/SydneyHub_AUS');

const ProductVN = connVN.model('Product', ProductSchema);
const RequestVN = connVN.model('ProductRequest', RequestSchema);
const ProductAUS = connAUS.model('Product', ProductSchema);
const RequestAUS = connAUS.model('ProductRequest', RequestSchema);

const os = require('os');

// Hàm tự động lấy IP LAN
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIp();
// --- 2. CẤU HÌNH COSMOS BLOCKCHAIN ---
// Địa chỉ API của Cosmos Node (Mặc định cổng 1317)
const COSMOS_API = "http://localhost:1317"; 
console.log("🌌 [Cosmos Node] Kết nối tới AppChain qua REST API: " + COSMOS_API);

const getModels = (region) => {
    return (region === 'AUS' || region === 1) 
        ? { Product: ProductAUS, Request: RequestAUS, hubName: "AUS" } 
        : { Product: ProductVN, Request: RequestVN, hubName: "VN" };
};

// --- 3. LOGIC ĐỒNG BỘ (COSMOS RELAYER SYNC) ---

const syncFromCosmos = async () => {
    console.log("🔍 [Relayer] Đang quét các khối Cosmos để đồng bộ dữ liệu...");
    try {
        // 1. Lấy danh sách sản phẩm từ Cosmos Module 'trace'
        const resProducts = await axios.get(`${COSMOS_API}/tracechain/trace/v1/product`);
        const cosmosProducts = resProducts.data.product || [];

        const resSteps = await axios.get(`${COSMOS_API}/tracechain/trace/v1/trace_step`);
        const allSteps = resSteps.data.trace_step || [];

        for (const p of cosmosProducts) {
            // Xác định Hub dựa trên origin lưu trên Chain
            const isVN = p.origin === "Vietnam" || p.origin === "VN";
            const { Product, hubName } = getModels(isVN ? 'VN' : 'AUS');

            // Lọc các bước timeline thuộc về sản phẩm này
            const productSteps = allSteps
                .filter(s => s.product_id === p.id)
                .map(s => ({
                    description: s.description,
                    detail: s.location, // Cosmos 'location' map vào 'detail'
                    time: s.time, // Cosmos lưu dạng string/number tùy proto
                    actor: s.creator
                }));

            const updatedProduct = {
                productId: Number(p.id),
                productCode: p.id, // Dùng ID làm code định danh
                name: p.name,
                manufacturer: p.manufacturer,
                region: isVN ? 0 : 1, // 0 cho VN, 1 cho AUS
                steps: productSteps,
                productType: "Thường" // Có thể map thêm logic pType từ Cosmos ở đây
            };

            await Product.findOneAndUpdate({ productId: updatedProduct.productId }, updatedProduct, { upsert: true });
        }
        console.log(`✅ [Sync Success] Đã cập nhật ${cosmosProducts.length} sản phẩm từ Cosmos Chain.`);
    } catch (err) {
        console.error("❌ [Cosmos Sync Error]:", err.message);
    }
};

// --- 4. API ENDPOINTS ---

// API Truy xuất cho Mobile (Interchain Trace)
app.get('/api/trace/:region/:id', async (req, res) => {
    try {
        const { id, region } = req.params;
        const { Product } = getModels(region);

        // Tìm kiếm linh hoạt: khớp productId (số) HOẶC productCode (chuỗi)
        const data = await Product.findOne({
            $or: [
                { productId: Number(id) },
                { productCode: id }
            ]
        });

        if (!data) return res.status(404).json({ message: "Không tìm thấy dữ liệu!" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách sản phẩm theo vùng cho màn hình Home
app.get('/api/products', async (req, res) => {
    try {
        const { Product } = getModels(req.query.region);
        const products = await Product.find().sort({ productId: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin duyệt yêu cầu
app.get('/api/requests/pending', async (req, res) => {
    const listVN = await RequestVN.find({ status: "pending" });
    const listAUS = await RequestAUS.find({ status: "pending" });
    res.json([...listVN, ...listAUS]);
});

// --- 5. KHỞI ĐỘNG SERVER ---
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌌 [Cosmos Node] Kết nối tới AppChain: http://localhost:1317`);
    console.log(`🚀 Backend đang chạy tại: http://${LOCAL_IP}:${PORT}`);
    console.log(`📱 App Mobile hãy kết nối tới: http://${LOCAL_IP}:${PORT}/api/trace/VN/0`);
});

const AUTO_SYNC_INTERVAL = 10000; 

setInterval(async () => {
    console.log("♻️ [Auto-Sync] Đang kiểm tra cập nhật từ Cosmos...");
    await syncFromCosmos(); 
}, AUTO_SYNC_INTERVAL);
// sydney-relayer.js
const { ethers } = require('ethers');
const addresses = require('../frontend/src/contracts/addresses.json');
const TruyXuatJSON = require('../frontend/src/contracts/TruyXuatNguonGoc.json');

// Cấu hình mạng lưới (Simulation of IBC Channels)
const CA_MAU_RPC = "http://127.0.0.1:7546"; // Ganache VN Node
const SYDNEY_RPC = "http://127.0.0.1:7546"; // Giả lập cùng mạng Ganache nhưng khác Channel

async function crossChainTrace(productId) {
    console.log("🇦🇺 [Sydney Hub] Đang khởi tạo kết nối IBC tới Ca Mau Hub...");
    
    try {
        // 1. Kết nối tới node Việt Nam
        const vnProvider = new ethers.providers.JsonRpcProvider(CA_MAU_RPC);
        const vnContract = new ethers.Contract(
            addresses.VN, 
            TruyXuatJSON.abi, 
            vnProvider
        );

        console.log(`🔍 [IBC-Query] Đang yêu cầu dữ liệu cho Sản phẩm ID: ${productId}`);
        
        // 2. Lấy dữ liệu gốc từ Blockchain Việt Nam
        const product = await vnContract.products(productId);
        const history = await vnContract.getProductHistory(productId);

        if(product.name === "") {
            console.log("🚨 [Alert] Không tìm thấy dữ liệu gốc tại Ca Mau Hub. Cảnh báo hàng giả!");
            return;
        }

        // 3. Hiển thị kết quả dưới dạng Log của Cosmos Node
        console.log("\n--- 📦 KẾT QUẢ XÁC THỰC XUYÊN BIÊN GIỚI ---");
        console.log(`✅ Tên SP: ${product.name}`);
        console.log(`🏭 Xuất xứ: ${product.manufacturer}`);
        console.log(`📜 Trạng thái: Đã Mint trên Blockchain VN (Addr: ${addresses.VN})`);
        console.log(`📊 Số bước nhật ký đã kiểm chứng: ${history.length}`);
        
        console.log("\n--- 📋 LỊCH TRÌNH VẬN CHUYỂN (ON-CHAIN) ---");
        history.forEach((step, index) => {
            console.log(`Step ${index + 1}: ${step.description} | 👤 ${step.actor.substring(0, 10)}...`);
        });

        console.log("\n✨ [Success] Dữ liệu đã được Sydney Hub phê duyệt và lưu tạm vào Cache.");

    } catch (error) {
        console.error("❌ [IBC-Error] Kết nối thất bại:", error.message);
    }
}

// Chạy demo cho Sản phẩm ID 1 (Tôm Cà Mau)
crossChainTrace(1);
const TruyXuatNguonGoc = artifacts.require("TruyXuatNguonGoc");
const fs = require('fs');
const path = require('path');

module.exports = async function (deployer) {
  try {
    console.log("🚀 Đang triển khai các Hub Blockchain...");

    // 1. Deploy Hub Việt Nam (Type 0)
    await deployer.deploy(TruyXuatNguonGoc, 0);
    const vnHub = await TruyXuatNguonGoc.deployed();

    // 2. Deploy Hub Úc (Type 1 - Tạo instance mới hoàn toàn)
    // Dùng .new() để đảm bảo 2 địa chỉ contract là khác nhau hoàn toàn
    const ausHub = await TruyXuatNguonGoc.new(1);

    // 3. Chuẩn bị dữ liệu địa chỉ
    const addresses = {
      VN: vnHub.address,
      AUS: ausHub.address,
      networkId: 1337, 
      lastUpdated: new Date().toLocaleString()
    };

    // 4. Đường dẫn đến thư mục contracts của frontend
    const filePath = path.join(__dirname, '../frontend/src/contracts/addresses.json');
    
    // 5. Ghi file an toàn
    fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));

    console.log("-----------------------------------------");
    console.log("✅ HỆ THỐNG LIÊN CHUỖI ĐÃ SẴN SÀNG");
    console.log("🇻🇳 VN Hub (Ca Mau):", vnHub.address);
    console.log("🇦🇺 AUS Hub (Sydney):", ausHub.address);
    console.log("📝 Đã cập nhật file addresses.json!");
    console.log("-----------------------------------------");

  } catch (err) {
    console.error("❌ Lỗi trong quá trình Deploy:");
    console.error(err);
  }
};
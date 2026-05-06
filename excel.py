import pandas as pd
import random

# --- 1. ĐỊNH NGHĨA 6 MẢNG ĐỘC LẬP (MỖI MẢNG 20+ SẢN PHẨM) ---
# categories = {
#     "THỦY_SẢN": ["Tôm Sú Cà Mau", "Cua Năm Căn", "Cá Linh Non", "Tôm Tích", "Cá Ngừ Đại Dương", "Mực Lá", "Cá Hồi Sa Pa", "Cua Lột", "Ốc Hương", "Sò Huyết", "Cá Lóc Đồng", "Cá Thác Lác", "Ghẹ Hàm Ninh", "Tôm Khô Rạch Gốc", "Chả Cá Thác Lác", "Nước Mắm Phú Quốc", "Mắm Ba Khía", "Khô Cá Khoai", "Sứa Biển", "Tôm Hùm Bình Ba"],
#     "NÔNG_SẢN": ["Gạo ST25", "Cà Phê Robusta", "Hạt Điều Bình Phước", "Hồ Tiêu Phú Quốc", "Gạo Nàng Xe", "Trà Cổ Thụ", "Hạt Macca", "Đậu Nành", "Ngô Nếp", "Khoai Lang Kén", "Bột Sắn Dây", "Nếp Tú Lệ", "Gạo Huyết Rồng", "Tiêu Đen", "Quế Trà Bồng", "Hạt Sen", "Đỗ Xanh", "Mè Đen", "Lạc Đỏ", "Đậu Ngự"],
#     "TRÁI_CÂY": ["Sầu Riêng Ri6", "Thanh Long", "Vú Sữa Lò Rèn", "Bưởi Da Xanh", "Vải Thiều Lục Ngạn", "Nhãn Xuồng", "Măng Cụt", "Xoài Cát Hòa Lộc", "Cam Sành", "Quýt Hồng", "Dâu Tây Đà Lạt", "Bơ Sáp", "Chôm Chôm", "Na Chi Lăng", "Mít Thái", "Chuối Ngự", "Hồng Giòn", "Táo Ninh Thuận", "Nho Tím", "Dưa Lưới"],
#     "HÀNG_NHẬP_KHẨU": ["Bò Wagyu Úc", "Cá Hồi Tasmania", "Bào Ngư NZ", "Rượu Vang Shiraz", "Cherry Mỹ", "Táo Envy", "Đùi Lợn Muối TBN", "Phô Mai Pháp", "Thịt Cừu NZ", "Socola Bỉ", "Dầu Ô Liu Ý", "Việt Quất", "Mơ Nhật", "Bò Mỹ Prime", "Cá Tuyết", "Sữa Bột Úc", "Nho Mẫu Đơn", "Bánh Quy Anh", "Tương Hàn Quốc", "Mì Ramen Nhật"],
#     "ĐẶC_SẢN_ĐỊA_PHƯƠNG": ["Mật Ong U Minh", "Bánh Pía Sóc Trăng", "Kẹo Dừa Bến Tre", "Nem Chua Lai Vung", "Mè Xử Huế", "Bánh Chưng Bờ Đậu", "Tương Bần", "Cốm Làng Vòng", "Trà Thái Nguyên", "Tỏi Lý Sơn", "Hành Kinh Môn", "Thịt Gác Bếp", "Rượu Cần", "Bánh Đậu Xanh", "Giò Chả Ước Lễ", "Vịt Quay Lạng Sơn", "Cơm Cháy Ninh Bình", "Mực Rim Me", "Mắm Tôm Hậu Lộc", "Sâm Ngọc Linh"],
#     "DƯỢC_LIỆU_LÂM_SẢN": ["Nấm Linh Chi", "Đông Trùng Hạ Thảo", "Tinh Dầu Quế", "Thảo Quả", "Sa Nhân", "Nấm Hương Rừng", "Măng Khô", "Tổ Yến", "Khổ Qua Rừng", "Dây Thìa Canh", "Giảo Cổ Lam", "Tam Thất", "Đinh Lăng", "Hà Thủ Ô", "Trinh Nữ Hoàng Cung", "Sâm Đất", "Gỗ Trầm Hương", "Hạt Dẻ Cao Bằng", "Măng Vầu", "Lá Tắm Người Dao"]
# }

# companies = ["HTX Thủy Sản 1", "Cty Nông Sản Việt", "Tasmanian Group", "DNTN Ba Hùng", "Global Logistics", "VinFarm", "Green Agro"]
# log_templates = [
#     {"desc": "THU_HOACH", "det": "Khai thác trực tiếp từ vùng nguyên liệu chuẩn."},
#     {"desc": "SO_CHE", "det": "Làm sạch và phân loại bằng công nghệ sensor."},
#     {"desc": "KIEM_DINH", "det": "Đối soát vi sinh và tồn dư hóa chất."},
#     {"desc": "DONG_GOI", "det": "Đóng gói chân không, dán mã Interchain ID."},
#     {"desc": "XUAT_KHO", "det": "Vận chuyển đông lạnh đến Hub trung tâm."}
# ]

# def ultra_chaos(text):
#     if not text: return ""
#     r = random.random()
#     if r < 0.2: return f"   {text.lower()}   "
#     if r < 0.4: return f"@@_{text.upper()}_##"
#     if r < 0.6: return text.replace(" ", "___") + "!!!"
#     return text

# data = []
# # Tạo hơn 120 sản phẩm (mỗi loại 20 cái)
# for cat, items in categories.items():
#     for p_name in items:
#         p_id = f"{cat[:2]}_{random.randint(100, 999)}_{random.randint(1000, 9999)}"
#         biz = random.choice(companies)
#         # Mỗi SP có 3-5 bước nhật ký
#         for step in random.sample(log_templates, random.randint(3, 5)):
#             data.append({
#                 "Phân loại": cat,
#                 "Mã SP": p_id,
#                 "Tên sản phẩm": ultra_chaos(p_name),
#                 "Doanh nghiệp": ultra_chaos(biz),
#                 "Mô tả bước": ultra_chaos(step["desc"]),
#                 "Chi tiết bước": step["det"],
#                 "Link ảnh": f"https://ipfs.io/ipfs/Qm{random.getrandbits(64)}",
#                 "Chứng nhận": random.choice(["VietGAP", "OCOP", "GlobalGAP", "Organic"]),
#                 "Vùng": random.choice(areas) if 'areas' in locals() else "Vùng liên kết"
#             })

# df = pd.DataFrame(data)
# df.to_excel("Global_Enterprise_SupplyChain_500.xlsx", index=False)
# print(f"✅ Đã tạo file với {len(df)} dòng dữ liệu siêu nhiễu đa ngành!")

# import pandas as pd
# import random

# # --- DANH MỤC DỮ LIỆU ĐỒNG BỘ UI ---
products = ["TEST 123", "TÔM SÚ CÀ MAU", "CÀ PHÊ ROBUSTA", "BÒ WAGYU ÚC", "SẦU RIÊNG RI6", "Tôm Sú Cà Mau", "Cua Năm Căn", "Cá Linh Non", "Tôm Tích", "Cá Ngừ Đại Dương", "Mực Lá", "Cá Hồi Sa Pa", "Cua Lột", "Ốc Hương", "Sò Huyết", "Cá Lóc Đồng", "Cá Thác Lác", "Ghẹ Hàm Ninh", "Tôm Khô Rạch Gốc", "Chả Cá Thác Lác", "Nước Mắm Phú Quốc", "Mắm Ba Khía", "Khô Cá Khoai", "Sứa Biển", "Tôm Hùm Bình Ba"]
owners = ["456", "HTX MINH PHÚ", "GLOBAL LOGISTICS", "GREEN AGRO", "TASMANIAN GROUP", "HTX Thủy Sản 1", "Cty Nông Sản Việt", "Tasmanian Group", "DNTN Ba Hùng", "Global Logistics", "VinFarm", "Green Agro"]
categories = ["Thường", "OCOP", "Sở hữu trí tuệ"]
hubs = ["VIETNAM_CA_MAU_HUB", "AUSTRALIA_SYDNEY_HUB"]

log_templates = [
    {"desc": "THU_HOACH", "det": "Khai thác trực tiếp từ vùng nguyên liệu chuẩn."},
    {"desc": "SO_CHE", "det": "Làm sạch và phân loại bằng công nghệ sensor."},
    {"desc": "KIEM_DINH", "det": "Đối soát vi sinh và tồn dư hóa chất."},
    {"desc": "DONG_GOI", "det": "Đóng gói chân không, dán mã Interchain ID."},
    {"desc": "XUAT_KHO", "det": "Vận chuyển đông lạnh đến Hub trung tâm."}
]

def ultra_noise(text):
    if not text: return ""
    r = random.random()
    if r < 0.2: return f"   {text.lower()}   "
    if r < 0.4: return f"@@_{text.upper()}_##"
    if r < 0.6: return text.replace(" ", "___") + "!!!"
    return text

data = []
# Tạo 120 sản phẩm độc lập (~500 dòng nhật ký)
for i in range(1, 121):
    hub = random.choice(hubs)
    p_name = random.choice(products) if i > 5 else "TEST 123" # Giữ mẫu như ảnh demo
    p_id = f"{i:03}" # Format ID #005 như trong ảnh
    owner = random.choice(owners) if i > 5 else "456"
    
    # Chia Hub dựa trên ORIGIN_HUB
    region_code = "VN" if "VIETNAM" in hub else "AUS"
    
    for step in random.sample(log_templates, random.randint(2, 3)):
        data.append({
            "ORIGIN_HUB": hub,
            "Mã SP": f"{region_code}_{p_id}",
            "Tên sản phẩm": ultra_noise(p_name),
            "ENTITY_OWNER": ultra_noise(owner),
            "ASSET_CATEGORY": random.choice(categories),
            "Mô tả bước": ultra_noise(step["desc"]),
            "Chi tiết bước": step["det"],
            "Link bằng chứng": f"https://ipfs.io/ipfs/Qm{random.getrandbits(64)}"
        })

df = pd.DataFrame(data)
df.to_excel("Interchain_Sync_Data_500.xlsx", index=False)
print("✅ Đã tạo file Excel đồng bộ hoàn toàn với giao diện ItemDetail!")
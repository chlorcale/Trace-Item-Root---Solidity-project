import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TruyXuatJSON from '../contracts/TruyXuatNguonGoc.json';
import addresses from '../contracts/addresses.json';

const SydneyNode = () => {
  const [logs, setLogs] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);

  // Hàm ghi Log vào "Terminal" ảo trên giao diện
  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '🔴' : type === 'success' ? '🟢' : '🔵';
    setLogs(prev => [`[${time}] ${prefix} ${msg}`, ...prev].slice(0, 15));
  };

  // 1. CHỨC NĂNG: KIỂM TRA XUYÊN BIÊN GIỚI (IBC SIMULATION)
  const handleCrossChainTrace = async () => {
    if (!searchId) return;
    setLoading(true);
    addLog(`Đang khởi tạo giao thức IBC tới Ca Mau Hub (VN)...`);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Kết nối trực tiếp tới Contract VN từ Node AUS
      const vnContract = new ethers.Contract(addresses.VN, TruyXuatJSON.abi, provider);
      
      addLog(`📡 Sending Packet: { type: "QUERY", id: ${searchId}, dest: "VN_HUB" }`);
      
      const product = await vnContract.products(searchId);
      
      if (product.name === "") {
        addLog(`🚨 CẢNH BÁO: Không tìm thấy dữ liệu gốc tại VN. Hàng lậu!`, 'error');
      } else {
        addLog(`📥 Nhận Packet: { status: "VERIFIED", origin: "CA_MAU_BLOCKCHAIN" }`, 'success');
        addLog(`✅ XÁC THỰC THÀNH CÔNG: ${product.name} (Xuất xứ: ${product.manufacturer})`, 'success');
      }
    } catch (err) {
      addLog(`❌ IBC Connection Timeout: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sydney-container animate-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#002B7F', margin: 0 }}>🇦🇺 Sydney Terminal Node (AUS)</h2>
        <span className="badge-info">Cosmos SDK v3.0 | IBC Active</span>
      </div>

      <div className="grid-2">
        {/* CỘT TRÁI: ĐIỀU KHIỂN */}
        <div className="card" style={{ borderTop: '4px solid #002B7F' }}>
          <h4>🔍 Truy vấn Liên chuỗi (Cross-Chain)</h4>
          <p style={{ fontSize: '13px', color: '#666' }}>Xác thực sản phẩm từ mạng lưới Việt Nam thông qua cổng IBC.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <input 
              type="number" 
              placeholder="Nhập ID từ VN..." 
              className="input-field"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
            <button className="btn-primary" onClick={handleCrossChainTrace} disabled={loading} style={{ background: '#002B7F' }}>
              {loading ? "PROCESSING..." : "KIỂM CHỨNG IBC"}
            </button>
          </div>
          
          <hr style={{ margin: '20px 0', opacity: 0.1 }} />
          
          <h4>🇦🇺 Đăng ký Nội địa (Sydney Hub)</h4>
          <button className="btn-primary" style={{ width: '100%', background: '#FFCD00', color: '#000' }}>
            MINT SẢN PHẨM ÚC
          </button>
        </div>

        {/* CỘT PHẢI: TERMINAL LOGS */}
        <div className="terminal-box">
          <div className="terminal-header">
            <span>root@sydney-hub:~</span>
            <div className="dots"><span></span><span></span><span></span></div>
          </div>
          <div className="terminal-content">
            {logs.length === 0 && <p className="typing">Waiting for IBC packets...</p>}
            {logs.map((log, i) => (
              <p key={i} className="log-line">{log}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SydneyNode;
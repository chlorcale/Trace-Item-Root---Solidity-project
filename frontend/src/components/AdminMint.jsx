import React, { useState } from 'react';
import { ethers } from 'ethers';
import TruyXuatJSON from '../contracts/TruyXuatNguonGoc.json';

const AdminMint = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        factory: '', 
        code: '', 
        price: '0', 
        date: '', 
        area: '' 
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleMint = async () => {
        // Khởi tạo trạng thái
        setStatus({ type: 'info', message: 'Hệ thống đang khởi tạo giao dịch...' });
        
        if (!window.ethereum) {
            setStatus({ type: 'error', message: 'Yêu cầu cài đặt MetaMask để thực hiện tác vụ này.' });
            return;
        }

        if (!formData.name || !formData.code || !formData.date) {
            setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ các trường thông tin bắt buộc.' });
            return;
        }

        setLoading(true);
        try {
            // --- GIAI ĐOẠN 1: ETHEREUM HUB DEPLOYMENT ---
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const { chainId } = await provider.getNetwork();
            const networkData = TruyXuatJSON.networks[chainId.toString()];

            if (networkData) {
                setStatus({ type: 'info', message: 'Đang xác thực trên Ethereum Network...' });
                const signer = provider.getSigner();
                const contract = new ethers.Contract(networkData.address, TruyXuatJSON.abi, signer);
                
                const tx = await contract.mintProduct(
                    formData.code, 
                    formData.name, 
                    "Standard Verification", 
                    formData.area,
                    ethers.utils.parseEther(formData.price || "0"),
                    Math.floor(new Date(formData.date).getTime() / 1000),
                    0
                );
                await tx.wait();
            }

            // --- GIAI ĐOẠN 2: COSMOS SDK SYNCHRONIZATION ---
            setStatus({ type: 'info', message: 'Đang đồng bộ hóa dữ liệu trên Cosmos Hub...' });
            const cosmosRes = await fetch('http://localhost:5000/api/cosmos/create-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    manufacturer: formData.factory,
                    origin: formData.area,
                    from: 'alice'
                })
            });

            const cosmosData = await cosmosRes.json();
            
            if (cosmosData.success) {
                setStatus({ type: 'success', message: 'Giao dịch hoàn tất. Dữ liệu đã được ghi nhận trên hệ thống Multi-chain.' });
                setFormData({ name: '', factory: '', code: '', price: '0', date: '', area: '' });
            } else {
                throw new Error("Lỗi đồng bộ Cosmos: " + cosmosData.output);
            }

        } catch (error) {
            setStatus({ type: 'error', message: error.reason || error.message });
        } finally {
            setLoading(false);
        }
    };

    // Style helper cho các thông báo trạng thái
    const getStatusStyle = () => {
        const colors = {
            error: { bg: '#fdecea', text: '#d32f2f' },
            success: { bg: '#edf7ed', text: '#2e7d32' },
            info: { bg: '#e5f6fd', text: '#0288d1' }
        };
        const current = colors[status.type] || { bg: 'transparent', text: 'transparent' };
        return {
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '13px',
            backgroundColor: current.bg,
            color: current.text,
            display: status.message ? 'block' : 'none',
            border: `1px solid ${current.text}44`
        };
    };

    return (
        <div style={{ 
            maxWidth: '900px', 
            margin: '40px auto', 
            padding: '30px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Header Section */}
            <div style={{ borderBottom: '1px solid #eaeaea', marginBottom: '30px', paddingBottom: '15px' }}>
                <h2 style={{ color: '#1a202c', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                    Khởi tạo Sản phẩm (Cross-Chain Deployment)
                </h2>
                <p style={{ color: '#718096', fontSize: '13px', marginTop: '5px' }}>
                    Thiết lập định danh sản phẩm trên hạ tầng Ethereum và Cosmos SDK.
                </p>
            </div>

            {/* Status Notification Area */}
            <div style={getStatusStyle()}>
                {status.message}
            </div>

            {/* Form Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="input-group">
                    <label style={labelStyle}>Tên sản phẩm (Bắt buộc)</label>
                    <input 
                        style={inputStyle}
                        placeholder="Nhập tên chính thức" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                </div>
                <div className="input-group">
                    <label style={labelStyle}>Mã định danh (Barcode/GTIN)</label>
                    <input 
                        style={inputStyle}
                        placeholder="840..." 
                        value={formData.code}
                        onChange={e => setFormData({...formData, code: e.target.value})} 
                    />
                </div>
                <div className="input-group">
                    <label style={labelStyle}>Đơn vị sản xuất</label>
                    <input 
                        style={inputStyle}
                        placeholder="Tên doanh nghiệp / HTX" 
                        value={formData.factory}
                        onChange={e => setFormData({...formData, factory: e.target.value})} 
                    />
                </div>
                <div className="input-group">
                    <label style={labelStyle}>Khu vực canh tác</label>
                    <input 
                        style={inputStyle}
                        placeholder="Vị trí địa lý" 
                        value={formData.area}
                        onChange={e => setFormData({...formData, area: e.target.value})} 
                    />
                </div>
                <div className="input-group">
                    <label style={labelStyle}>Đơn giá niêm yết (ETH)</label>
                    <input 
                        style={inputStyle}
                        type="number" 
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                    />
                </div>
                <div className="input-group">
                    <label style={labelStyle}>Thời điểm thu hoạch</label>
                    <input 
                        style={inputStyle}
                        type="date" 
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})} 
                    />
                </div>
            </div>

            {/* Action Section */}
            <button 
                onClick={handleMint} 
                disabled={loading}
                style={{ 
                    marginTop: '40px', 
                    width: '100%', 
                    padding: '14px',
                    backgroundColor: loading ? '#a0aec0' : '#2d3748',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '15px',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease'
                }}
            >
                {loading ? "ĐANG XÁC THỰC DỮ LIỆU..." : "XÁC NHẬN KHỞI TẠO CHUỖI"}
            </button>
        </div>
    );
};

// Common Styles
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#4a5568', marginBottom: '6px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', boxSizing: 'border-box', outline: 'none', fontSize: '14px', color: '#2d3748' };

export default AdminMint;
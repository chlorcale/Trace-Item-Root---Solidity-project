import React, { useState } from 'react';
import { ethers } from 'ethers';
import TruyXuatJSON from '../contracts/TruyXuatNguonGoc.json';
import addresses from '../contracts/addresses.json';

const AddStep = ({ setActiveTab, setActiveTraceId, currentHub }) => {
    const [stepData, setStepData] = useState({ id: '', desc: '', detail: '', hash: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleAddStep = async () => {
        const productId = parseInt(stepData.id);
        
        // Validation logic
        if (isNaN(productId) || productId <= 0) {
            setStatus({ type: 'error', message: 'Mã định danh sản phẩm (ID) không hợp lệ.' });
            return;
        }
        if (!stepData.desc) {
            setStatus({ type: 'error', message: 'Tiêu đề quy trình là bắt buộc.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Khởi tạo tiến trình ghi nhật ký đa chuỗi...' });

        try {
            if (!window.ethereum) throw new Error("Yêu cầu MetaMask để xác thực giao dịch.");
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractAddress = addresses[currentHub]; 
            
            if (!contractAddress) throw new Error(`Hệ thống không xác định được Hub: ${currentHub}`);

            // --- GIAI ĐOẠN 1: GHI DỮ LIỆU LÊN ETHEREUM HUB ---
            const contract = new ethers.Contract(contractAddress, TruyXuatJSON.abi, signer);
            setStatus({ type: 'info', message: `Đang thực thi lệnh ghi tại ${currentHub} Network...` });
            
            const tx = await contract.addProductionLog(
                productId,
                stepData.desc,
                stepData.detail || "",
                stepData.hash || ""
            );
            await tx.wait();

            // --- GIAI ĐOẠN 2: ĐỒNG BỘ HÓA COSMOS SDK (WSL BRIDGE) ---
            setStatus({ type: 'info', message: 'Đang đồng bộ hóa nhật ký lên Cosmos Hub...' });
            
            const cosmosRes = await fetch('http://localhost:5001/api/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'STEP',
                    data: {
                        id: productId,
                        desc: stepData.desc,
                        detail: stepData.detail || "N/A"
                    }
                })
            });

            const cosmosResult = await cosmosRes.json();

            // --- HOÀN TẤT ---
            if (cosmosResult.output) {
                setStatus({ type: 'success', message: 'Nhật ký đã được xác thực và lưu trữ thành công trên đa chuỗi.' });
                
                if (setActiveTab && setActiveTraceId) {
                    setTimeout(() => {
                        setActiveTraceId(stepData.id);
                        setActiveTab('trace');
                    }, 1500);
                }
            }

            setStepData({ id: '', desc: '', detail: '', hash: '' });

        } catch (error) {
            setStatus({ type: 'error', message: `Lỗi hệ thống: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            {/* Header Section */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={titleStyle}>Ghi nhật ký Quy trình (Process Logging)</h3>
                    <p style={subtitleStyle}>Cập nhật hành trình sản phẩm vào sổ cái Hub {currentHub}</p>
                </div>
                <div style={getBadgeStyle(currentHub)}>
                    {currentHub === 'VN' ? 'GATEWAY: VIETNAM' : 'GATEWAY: AUSTRALIA'}
                </div>
            </div>

            {/* Status Box */}
            <div style={getStatusStyle(status.type)}>
                {status.message}
            </div>

            {/* Form Section */}
            <div style={formGridStyle}>
                <div style={groupFullStyle}>
                    <label style={labelStyle}>Mã ID Sản phẩm (Blockchain ID) *</label>
                    <input 
                        type="number"
                        style={inputStyle}
                        placeholder="VD: 101" 
                        value={stepData.id}
                        onChange={e => setStepData({...stepData, id: e.target.value})} 
                    />
                </div>

                <div style={groupFullStyle}>
                    <label style={labelStyle}>Tiêu đề Bước thực hiện *</label>
                    <input 
                        style={inputStyle}
                        placeholder="VD: Kiểm định chất lượng xuất khẩu" 
                        value={stepData.desc}
                        onChange={e => setStepData({...stepData, desc: e.target.value})} 
                    />
                </div>

                <div style={groupFullStyle}>
                    <label style={labelStyle}>Mô tả chi tiết kỹ thuật</label>
                    <textarea 
                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                        placeholder="Nhập thông số kỹ thuật hoặc chi tiết quy trình..." 
                        value={stepData.detail}
                        onChange={e => setStepData({...stepData, detail: e.target.value})} 
                    />
                </div>

                <div style={groupFullStyle}>
                    <label style={labelStyle}>Liên kết minh chứng (Resource URL)</label>
                    <input 
                        style={inputStyle}
                        placeholder="https://ipfs.io/ipfs/..." 
                        value={stepData.hash}
                        onChange={e => setStepData({...stepData, hash: e.target.value})} 
                    />
                </div>
            </div>

            <button 
                style={loading ? btnDisabledStyle : btnPrimaryStyle} 
                onClick={handleAddStep} 
                disabled={loading}
            >
                {loading ? "ĐANG XÁC THỰC DỮ LIỆU..." : "XÁC NHẬN GHI NHẬT KÝ"}
            </button>
        </div>
    );
};

/* --- STYLES SYSTEM (Professional/Minimalist) --- */
const containerStyle = { padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #edf2f7', marginBottom: '25px', paddingBottom: '15px' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a202c' };
const subtitleStyle = { margin: '4px 0 0', fontSize: '13px', color: '#718096' };
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr', gap: '20px' };
const groupFullStyle = { width: '100%' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.025em' };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#2d3748' };

const getBadgeStyle = (hub) => ({
    padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
    backgroundColor: hub === 'VN' ? '#f0fff4' : '#ebf8ff',
    color: hub === 'VN' ? '#22543d' : '#2a4365',
    border: `1px solid ${hub === 'VN' ? '#c6f6d5' : '#bee3f8'}`
});

const getStatusStyle = (type) => {
    if (!type) return { display: 'none' };
    const styles = {
        error: { bg: '#fff5f5', color: '#c53030' },
        success: { bg: '#f0fff4', color: '#2f855a' },
        info: { bg: '#ebf8ff', color: '#2b6cb0' }
    };
    return {
        padding: '12px 16px', borderRadius: '4px', marginBottom: '25px', fontSize: '13px',
        backgroundColor: styles[type].bg, color: styles[type].color, border: `1px solid ${styles[type].color}33`
    };
};

const btnPrimaryStyle = { width: '100%', marginTop: '30px', padding: '14px', backgroundColor: '#2d3748', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' };
const btnDisabledStyle = { ...btnPrimaryStyle, backgroundColor: '#cbd5e0', cursor: 'not-allowed' };

export default AddStep;
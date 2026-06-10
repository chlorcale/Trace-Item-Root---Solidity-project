import React, { useState } from 'react';
import { ethers } from 'ethers';
import TruyXuatJSON from '../contracts/TruyXuatNguonGoc.json';

const RegisterBiz = ({ onSystemUpdate }) => {
    const [formData, setFormData] = useState({ name: '', taxCode: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!formData.name || !formData.taxCode) {
            setStatus({ type: 'error', message: 'Yêu cầu cung cấp đầy đủ Tên pháp nhân và Mã số thuế.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Đang khởi tạo giao dịch xác thực danh tính...' });

        try {
            if (!window.ethereum) throw new Error("Yêu cầu MetaMask để thực hiện ký số.");

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // Xác định Network ID chuẩn cho môi trường Development
            const networkId = TruyXuatJSON.networks["1337"] ? "1337" : "5777";
            const contractAddress = TruyXuatJSON.networks[networkId]?.address;

            if (!contractAddress) throw new Error("Hệ thống không tìm thấy Smart Contract trên mạng lưới hiện tại.");

            const contract = new ethers.Contract(contractAddress, TruyXuatJSON.abi, signer);

            // --- GIAI ĐOẠN 1: ĐĂNG KÝ TRÊN ETHEREUM HUB ---
            setStatus({ type: 'info', message: 'Đang ghi danh tính doanh nghiệp vào Ethereum Ledger...' });
            const tx = await contract.registerManufacturer(formData.name, formData.taxCode);
            await tx.wait();

            // --- GIAI ĐOẠN 2: ĐỒNG BỘ HÓA COSMOS IDENTITY (WSL BRIDGE) ---
            // Đảm bảo danh tính được nhất quán trên mô hình Interchain
            setStatus({ type: 'info', message: 'Đang đồng bộ hóa quyền truy cập trên Cosmos SDK...' });
            await fetch('http://localhost:5000/api/cosmos/register-identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    taxCode: formData.taxCode,
                    address: await signer.getAddress()
                })
            });

            setStatus({ type: 'success', message: 'Đăng ký danh tính hoàn tất. Quyền hạn của bạn đã được cập nhật trên đa chuỗi.' });
            
            if (onSystemUpdate) {
                setTimeout(onSystemUpdate, 2000);
            }

        } catch (error) {
            setStatus({ type: 'error', message: `Lỗi xác thực: ${error.reason || error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Form Header */}
            <div style={styles.header}>
                <h3 style={styles.title}>ĐĂNG KÝ DANH TÍNH DOANH NGHIỆP</h3>
                <p style={styles.subtitle}>
                    Thiết lập định danh pháp nhân trên sổ cái Blockchain để kích hoạt quyền khởi tạo tài sản (Minting).
                </p>
            </div>

            {/* Inline Status Feedback */}
            {status.message && (
                <div style={getStatusStyle(status.type)}>
                    {status.message}
                </div>
            )}

            <div style={styles.formStack}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Tên doanh nghiệp / Pháp nhân (Chính thức)</label>
                    <input 
                        style={styles.input}
                        placeholder="VD: Công ty TNHH Thủy Sản Việt Nam" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Mã số thuế / Mã số doanh nghiệp</label>
                    <input 
                        style={styles.input}
                        placeholder="VD: 0123456789" 
                        value={formData.taxCode}
                        onChange={e => setFormData({...formData, taxCode: e.target.value})}
                    />
                </div>

                <button 
                    style={loading ? styles.btnDisabled : styles.btnPrimary} 
                    onClick={handleRegister} 
                    disabled={loading}
                >
                    {loading ? "ĐANG XỬ LÝ DỮ LIỆU..." : "XÁC NHẬN ĐĂNG KÝ DANH TÍNH"}
                </button>
            </div>

            <div style={styles.footer}>
                <p>Hệ thống ghi nhận thông tin bất biến (Immutable) trên mạng lưới phân tán.</p>
                <p>Mã hóa chuẩn: SHA-256 | Layer: Ethereum & Cosmos</p>
            </div>
        </div>
    );
};

/* --- SYSTEM STYLES (Clean & Slate Theme) --- */
const styles = {
    container: { maxWidth: '520px', margin: '40px auto', padding: '40px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontFamily: 'Inter, sans-serif' },
    header: { borderBottom: '1px solid #edf2f7', marginBottom: '30px', paddingBottom: '20px' },
    title: { margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.05em' },
    subtitle: { margin: '8px 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' },
    formStack: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { width: '100%' },
    label: { display: 'block', fontSize: '11px', fontWeight: '800', color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.025em' },
    input: { width: '100%', padding: '12px', border: '1px solid #cbd5e0', borderRadius: '2px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#2d3748' },
    btnPrimary: { width: '100%', padding: '14px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.05em', transition: 'background 0.2s' },
    btnDisabled: { width: '100%', padding: '14px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '13px', fontWeight: '700', cursor: 'not-allowed' },
    footer: { marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.6' }
};

const getStatusStyle = (type) => {
    const themes = {
        error: { bg: '#fff5f5', color: '#c53030' },
        success: { bg: '#f0fff4', color: '#2f855a' },
        info: { bg: '#ebf8ff', color: '#2b6cb0' }
    };
    const theme = themes[type] || themes.info;
    return {
        padding: '12px 16px', borderRadius: '2px', marginBottom: '25px', fontSize: '13px', fontWeight: '500',
        backgroundColor: theme.bg, color: theme.color, border: `1px solid ${theme.color}33`
    };
};

export default RegisterBiz;
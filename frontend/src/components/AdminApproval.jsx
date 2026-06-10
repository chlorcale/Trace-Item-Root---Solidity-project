import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import TruyXuatJSON from '../contracts/TruyXuatNguonGoc.json';
import addresses from '../contracts/addresses.json';

const HUB_CONFIG = {
    VN: { address: addresses.VN, name: "Vietnam Hub (Cà Mau)" },
    AUS: { address: addresses.AUS, name: "Australia Hub (Sydney)" }
};

const AdminApproval = ({ currentHub }) => {
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '', id: null });
    const [loadingId, setLoadingId] = useState(null);

    const fetchRequests = useCallback(() => {
        fetch('http://localhost:5000/api/requests/pending')
            .then(res => res.json())
            .then(data => setRequests(data.filter(r => r.region === currentHub)))
            .catch(e => setStatus({ type: 'error', message: 'Không thể kết nối máy chủ dữ liệu.', id: 'fetch' }));
    }, [currentHub]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const handleApprove = async (req) => {
        setLoadingId(req._id);
        setStatus({ type: 'info', message: `Đang khởi tạo tiến trình phê duyệt lô hàng ${req.productCode}...`, id: req._id });

        try {
            if (!window.ethereum) throw new Error("Yêu cầu cài đặt MetaMask để thực hiện giao dịch On-chain.");

            // --- GIAI ĐOẠN 1: BLOCKCHAIN EXECUTION (ETHEREUM) ---
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractAddr = HUB_CONFIG[currentHub].address;
            const contract = new ethers.Contract(contractAddr, TruyXuatJSON.abi, signer);

            const tx = await contract.mintFromOffchain(
                req.productCode, 
                req.productName, 
                req.certification || "Standard Certification", 
                req.area, 
                req.bizName,
                Math.floor(Date.now() / 1000), 
                req.pType || 0
            );

            setStatus({ type: 'info', message: 'Giao dịch Ethereum đang được khai thác...', id: req._id });
            await tx.wait(); 

            // --- GIAI ĐOẠN 2: COSMOS SDK SYNCHRONIZATION (WSL BRIDGE) ---
            setStatus({ type: 'info', message: 'Đang đồng bộ hóa trạng thái trên Cosmos Hub...', id: req._id });
            const cosmosRes = await fetch('http://localhost:5000/api/cosmos/create-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: req.productName,
                    manufacturer: req.bizName,
                    origin: req.area,
                    from: currentHub === 'VN' ? 'alice' : 'bob' // Phân quyền Hub theo ví Cosmos
                })
            });

            // --- GIAI ĐOẠN 3: DATABASE STATUS UPDATE ---
            await fetch(`http://localhost:5000/api/requests/approve/${req._id}`, { method: 'POST' });

            setStatus({ type: 'success', message: 'Phê duyệt hoàn tất trên đa chuỗi.', id: req._id });
            setTimeout(fetchRequests, 2000); 

        } catch (err) {
            setStatus({ type: 'error', message: `Thất bại: ${err.message}`, id: req._id });
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <h2 style={titleStyle}>Phê duyệt Gateway: {HUB_CONFIG[currentHub].name}</h2>
                <div style={badgeStyle}>
                    <span style={dotStyle}></span> Node: {HUB_CONFIG[currentHub].address}
                </div>
            </div>

            {/* Global Error (if any) */}
            {status.id === 'fetch' && (
                <div style={{ ...statusBox, backgroundColor: '#fdecea', color: '#d32f2f' }}>{status.message}</div>
            )}

            {requests.length === 0 ? (
                <div style={emptyStateStyle}>Hệ thống không ghi nhận yêu cầu phê duyệt mới.</div>
            ) : (
                <table style={tableStyle}>
                    <thead>
                        <tr style={theadRowStyle}>
                            <th style={thStyle}>ĐƠN VỊ ĐỀ NGHỊ</th>
                            <th style={thStyle}>CHI TIẾT SẢN PHẨM</th>
                            <th style={thStyle}>NGUỒN GỐC</th>
                            <th style={thStyle}>TRẠNG THÁI</th>
                            <th style={thStyle}>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(r => (
                            <tr key={r._id} style={tbodyRowStyle}>
                                <td style={tdStyle}>
                                    <div style={primaryTextStyle}>{r.bizName}</div>
                                    <div style={secondaryTextStyle}>Business ID: {r._id.slice(-6)}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={primaryTextStyle}>{r.productName}</div>
                                    <div style={codeStyle}>{r.productCode}</div>
                                </td>
                                <td style={tdStyle}>{r.area}</td>
                                <td style={tdStyle}>
                                    {status.id === r._id ? (
                                        <div style={{ color: status.type === 'error' ? '#d32f2f' : '#0288d1', fontSize: '11px' }}>
                                            {status.message}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#718096', fontSize: '11px' }}>Chờ xác thực</span>
                                    )}
                                </td>
                                <td style={tdStyle}>
                                    <button 
                                        style={loadingId === r._id ? btnDisabled : btnStyle} 
                                        onClick={() => handleApprove(r)} 
                                        disabled={loadingId === r._id}
                                    >
                                        {loadingId === r._id ? "Đang xử lý..." : "Duyệt & Ghi chuỗi"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

/* --- ENTERPRISE STYLES (Clean & Minimalist) --- */
const containerStyle = { padding: '25px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #edf2f7', paddingBottom: '15px' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a202c' };
const badgeStyle = { fontSize: '11px', color: '#718096', backgroundColor: '#f7fafc', padding: '4px 10px', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'monospace' };
const dotStyle = { height: '6px', width: '6px', backgroundColor: '#38a169', borderRadius: '50%', display: 'inline-block', marginRight: '6px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thStyle = { textAlign: 'left', padding: '12px', fontSize: '11px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' };
const tdStyle = { padding: '16px 12px', borderBottom: '1px solid #f7fafc' };
const theadRowStyle = { backgroundColor: '#fff' };
const tbodyRowStyle = { transition: 'background-color 0.2s' };
const primaryTextStyle = { fontSize: '14px', fontWeight: '500', color: '#2d3748' };
const secondaryTextStyle = { fontSize: '12px', color: '#a0aec0' };
const codeStyle = { fontSize: '12px', color: '#4a5568', fontBold: '600' };
const emptyStateStyle = { textAlign: 'center', padding: '60px', color: '#a0aec0', fontSize: '14px' };
const statusBox = { padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '13px' };
const btnStyle = { backgroundColor: '#2d3748', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };
const btnDisabled = { ...btnStyle, backgroundColor: '#cbd5e0', cursor: 'not-allowed' };

export default AdminApproval;
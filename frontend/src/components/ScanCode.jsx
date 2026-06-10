import React, { useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import { useNavigate } from 'react-router-dom';

const ScanCode = ({ setActiveTab, setActiveTraceId }) => {
    const [preview, setPreview] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    
    // State để lưu trữ thông tin sau khi quét thành công
    const [decodedData, setDecodedData] = useState({ id: '', hub: '' });
    
    const navigate = useNavigate();
    const qrReader = new BrowserQRCodeReader();

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageDataUrl = event.target.result;
                    setPreview(imageDataUrl);
                    robustDecoding(imageDataUrl);
                };
                reader.readAsDataURL(blob);
            }
        }
    };

    const robustDecoding = (dataUrl) => {
        setIsScanning(true);
        setDecodedData({ id: '', hub: '' }); // Reset data cũ
        
        const img = new Image();
        img.src = dataUrl;
        img.onload = async () => {
            try {
                const result = await qrReader.decodeFromImageElement(img);
                const rawData = result.getText();
                
                // 1. Tách ID và Hub
                const productId = rawData.replace(/[^\d]/g, '');
                const detectedHub = rawData.includes('VN') || rawData.startsWith('84') ? 'VN' : 'AUS';

                // 2. Lưu lại data để hiển thị nút bấm
                setDecodedData({ id: productId, hub: detectedHub });
                
                // 3. Hiển thị thông báo (Sử dụng định dạng #ID thay vì HEX)
                setStatus({ 
                    type: 'success', 
                    message: `XÁC THỰC THÀNH CÔNG: SẢN PHẨM #${productId.padStart(3, '0')}` 
                });

            } catch (err) {
                console.error("QR Error:", err);
                setStatus({ 
                    type: 'error', 
                    message: "LỖI HỆ THỐNG: Không tìm thấy điểm neo QR hợp lệ. Hãy chụp kèm lề trắng xung quanh mã." 
                });
            } finally {
                setIsScanning(false);
            }
        };
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>AUTHENTICATION_GATEWAY</h3>
                <div style={styles.statusIndicator}>
                    <span style={isScanning ? styles.pulseDot : styles.readyDot}></span>
                    {isScanning ? "ANALYSIZING" : "LISTENING"}
                </div>
            </div>

            {/* Thông báo trạng thái thông thường */}
            {status.message && status.type !== 'success' && (
                <div style={getStatusStyle(status.type)}>
                    {status.message}
                </div>
            )}

            {/* Vùng hiển thị khi QUÉT THÀNH CÔNG */}
            {status.type === 'success' && (
                <div style={styles.successContainer}>
                    <div style={styles.successMsg}>{status.message}</div>
                    <div style={styles.actionPrompt}>
                        <button 
                            style={styles.btnActionPrimary}
                            onClick={() => navigate(`/item/${decodedData.hub}/${decodedData.id}`)}
                        >
                            XEM BÁO CÁO CHI TIẾT (ITEM_DETAIL)
                        </button>
                        <button 
                            style={styles.btnActionSecondary}
                            onClick={() => {
                                setActiveTraceId(decodedData.id);
                                setActiveTab('trace');
                            }}
                        >
                            XEM NHẬT KÝ TRÊN DASHBOARD
                        </button>
                    </div>
                </div>
            )}

            <div onPaste={handlePaste} style={styles.dropZone} tabIndex="0">
                {!preview && !isScanning && (
                    <div style={styles.placeholder}>
                        <p style={styles.instruction}>Nhấp vào đây và nhấn <span style={styles.key}>CTRL + V</span></p>
                        <p style={styles.metaInfo}>Mẹo: Chụp ảnh mã QR từ mục "Sản phẩm" rồi dán vào đây</p>
                    </div>
                )}
                {preview && <img src={preview} alt="Source" style={styles.previewImage} />}
                {isScanning && <div style={styles.laserLine}></div>}
            </div>
        </div>
    );
};

/* --- ENTERPRISE STYLES --- */
const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '35px', backgroundColor: '#fff', borderRadius: '2px', border: '1px solid #e2e8f0', fontFamily: 'Inter, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
    title: { fontSize: '15px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.05em' },
    statusIndicator: { fontSize: '10px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' },
    pulseDot: { width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 8px #3b82f6' },
    readyDot: { width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' },
    dropZone: { position: 'relative', height: '320px', border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', outline: 'none', overflow: 'hidden' },
    placeholder: { textAlign: 'center' },
    instruction: { fontSize: '14px', fontWeight: '600', color: '#334155' },
    key: { backgroundColor: '#1e293b', color: '#fff', padding: '3px 8px', borderRadius: '2px' },
    metaInfo: { fontSize: '11px', color: '#94a3b8', marginTop: '10px' },
    previewImage: { maxHeight: '90%', maxWidth: '90%', border: '1px solid #e2e8f0' },
    laserLine: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px', backgroundColor: '#3b82f6', boxShadow: '0 0 15px #3b82f6', animation: 'scanAnim 2s infinite linear' },
    
    // Success Actions Styles
    successContainer: { 
        marginTop: '10px', 
        marginBottom: '25px', 
        padding: '25px', 
        backgroundColor: '#f0fff4', 
        border: '1px solid #dcfce7', 
        borderRadius: '2px',
        textAlign: 'center' 
    },
    successMsg: { color: '#16a34a', fontWeight: '800', fontSize: '14px', marginBottom: '20px', letterSpacing: '0.02em' },
    actionPrompt: { display: 'flex', gap: '12px', justifyContent: 'center' },
    btnActionPrimary: { backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '12px 20px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.05em' },
    btnActionSecondary: { backgroundColor: '#fff', color: '#1e293b', border: '1px solid #1e293b', padding: '12px 20px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.05em' },
};

const getStatusStyle = (type) => {
    const theme = type === 'error' ? { bg: '#fff5f5', color: '#c53030' } : { bg: '#eff6ff', color: '#2563eb' };
    return { padding: '12px 16px', borderRadius: '2px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', backgroundColor: theme.bg, color: theme.color, border: `1px solid ${theme.color}33` };
};

export default ScanCode;
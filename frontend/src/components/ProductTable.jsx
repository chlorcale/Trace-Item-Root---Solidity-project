import React, { useEffect, useState, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const ProductTable = ({ currentHub }) => {
    const [products, setProducts] = useState([]);
    const [showQR, setShowQR] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Đồng bộ hóa dữ liệu từ Backend Bridge (Cosmos SDK/Ethereum)
    const fetchProducts = useCallback(() => {
        setLoading(true);
        fetch(`http://localhost:5000/api/products?region=${currentHub}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Registry Sync Error:", err);
                setLoading(false);
            });
    }, [currentHub]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div style={styles.container}>
            {/* Header chuyên nghiệp với định danh Hub */}
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <h3 style={styles.title}>ON-CHAIN_ASSET_REGISTRY</h3>
                    <p style={styles.subtitle}>Sổ cái quản lý tài sản đã được xác thực đa chuỗi</p>
                </div>
                <div style={styles.regionBadge}>
                    NODE_ID:: {currentHub === 'VN' ? 'VIETNAM_HUB' : 'AUSTRALIA_HUB'}
                </div>
            </div>

            {/* Bảng danh mục tài sản */}
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.theadRow}>
                            <th style={styles.th}>BLOCKCHAIN_ID</th>
                            <th style={styles.th}>MANUFACTURER_ENTITY</th>
                            <th style={styles.th}>COMMODITY_NAME</th>
                            <th style={styles.th}>SYSTEM_COMMANDS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" style={styles.loadingCell}>ĐANG ĐỒNG BỘ DỮ LIỆU...</td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={styles.emptyCell}>CHƯA CÓ DỮ LIỆU GHI NHẬN TRÊN HUB NÀY</td>
                            </tr>
                        ) : (
                            products.map(p => (
                                <tr key={`${p.region}-${p.productId}`} style={styles.tbodyRow}>
                                    <td style={styles.tdId}>ID: #{p.productId.toString().padStart(3, '0')}</td>
                                    <td style={styles.td}>{p.manufacturer}</td>
                                    <td style={styles.tdName}>{p.name.toUpperCase()}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actionGroup}>
                                            <button 
                                                style={styles.btnInspect} 
                                                onClick={() => navigate(`/item/${currentHub}/${p.productId}`)}
                                            >
                                                INSPECT
                                            </button>
                                            <button 
                                                style={styles.btnQR} 
                                                onClick={() => setShowQR(p)}
                                            >
                                                GENERATE_QR
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal hiển thị QR Code xác thực */}
            {showQR && (
                <div style={styles.modalOverlay} onClick={() => setShowQR(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <span style={styles.modalTitle}>PRODUCT_IDENTITY_MARKER</span>
                        </div>
                        
                        <div style={styles.qrWrapper}>
                          <QRCodeCanvas 
                              value={`${showQR.region}${showQR.productId.toString().padStart(4, '0')}`}
                              size={256}
                              level={"M"} // Chuyển về mức M để mã QR trông đơn giản hơn, ít chi tiết thừa
                              includeMargin={true} // Tạo lề trắng rộng hơn xung quanh mã
                              // XÓA HẲN ĐOẠN imageSettings { ... } Ở ĐÂY
                              style={{ 
                                  border: '1px solid #e2e8f0',
                                  padding: '10px',
                                  backgroundColor: '#fff' 
                              }}
                          />
                      </div>

                        <div style={styles.qrMeta}>
                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>ID_DECODED</span>
                                <span style={styles.metaValue}>{showQR.productId}</span>
                            </div>
                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>PROTOCOL</span>
                                <span style={styles.metaValue}>ISO/IEC 18004</span>
                            </div>
                        </div>

                        <button style={styles.btnClose} onClick={() => setShowQR(null)}>
                            CLOSE_INTERFACE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/* --- ENTERPRISE SYSTEM STYLES --- */
const styles = {
    container: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    titleGroup: { textAlign: 'left' },
    title: { margin: 0, fontSize: '13px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.05em' },
    subtitle: { margin: '4px 0 0', fontSize: '11px', color: '#64748b' },
    regionBadge: { fontSize: '10px', fontWeight: '800', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.08)', padding: '5px 12px', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '2px' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    theadRow: { borderBottom: '1px solid #e2e8f0' },
    th: { textAlign: 'left', padding: '14px 20px', fontSize: '10px', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.1em' },
    tbodyRow: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
    td: { padding: '16px 20px', fontSize: '13px', color: '#475569' },
    tdId: { padding: '16px 20px', fontSize: '12px', color: '#64748b', fontFamily: 'monospace', fontWeight: '700' },
    tdName: { padding: '16px 20px', fontSize: '13px', fontWeight: '800', color: '#1e293b' },
    loadingCell: { textAlign: 'center', padding: '50px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' },
    emptyCell: { textAlign: 'center', padding: '50px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' },
    actionGroup: { display: 'flex', gap: '8px' },
    btnInspect: { background: '#1e293b', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '2px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
    btnQR: { background: '#fff', color: '#475569', border: '1px solid #cbd5e0', padding: '7px 14px', borderRadius: '2px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
    
    // Modal & QR Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: '#fff', padding: '40px', borderRadius: '4px', width: '380px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
    modalHeader: { marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
    modalTitle: { fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.15em' },
    qrWrapper: { backgroundColor: '#fff', padding: '15px', display: 'inline-block', border: '1px solid #f1f5f9', borderRadius: '4px' },
    qrMeta: { marginTop: '25px', textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '4px' },
    metaRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
    metaLabel: { fontSize: '10px', fontWeight: '800', color: '#94a3b8' },
    metaValue: { fontSize: '11px', fontWeight: '700', color: '#1e293b', fontFamily: 'monospace' },
    btnClose: { width: '100%', marginTop: '30px', padding: '14px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.05em' }
};

export default ProductTable;
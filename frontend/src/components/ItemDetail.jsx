import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ItemDetail = () => {
    const { region, id } = useParams(); // Lấy Hub và ID trực tiếp từ URL
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cấu hình Hub động để tránh nhầm lẫn dữ liệu giữa VN và AUS
    const isVN = region?.toUpperCase() === 'VN';
    const hubConfig = {
        name: isVN ? 'VIETNAM_CA_MAU_HUB' : 'AUSTRALIA_SYDNEY_HUB',
        color: isVN ? '#dc2626' : '#002B7F', // Đỏ cho VN, Xanh dương cho AUS
        short: isVN ? 'VN' : 'AUS'
    };

    useEffect(() => {
        // Luôn sử dụng cả region và id để gọi API, đảm bảo không lấy nhầm dữ liệu chain kia
        const API_URL = `http://localhost:5000/api/trace/${region}/${id}`;
        
        setLoading(true);
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("API_FETCH_ERROR:", err);
                setLoading(false);
            });
    }, [region, id]); // Re-fetch khi đổi Region hoặc ID

    const handleOpenAudit = () => {
        localStorage.setItem('pendingTraceId', id);
        localStorage.setItem('pendingTraceHub', region);
        navigate('/');
    };

    if (loading) return <div style={styles.statusMsg}>ANALYSIZING_BLOCK_DATA...</div>;
    if (!product) return <div style={styles.statusMsg}>ERROR: ASSET_NOT_FOUND_ON_{hubConfig.short}_CHAIN</div>;

    return (
        <div style={styles.wrapper}>
            {/* Thanh điều hướng nhanh */}
            <div style={styles.nav}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>← RETURN_TO_LIST</button>
                <div style={{...styles.hubBadge, color: hubConfig.color, borderColor: hubConfig.color}}>
                    CONNECTED_NODE: {hubConfig.name}
                </div>
            </div>

            <div style={styles.reportContainer}>
                {/* Header: Phân biệt rõ Hub bằng màu sắc */}
                <div style={{...styles.reportHeader, borderBottomColor: hubConfig.color}}>
                    <div style={styles.headerTop}>
                        <div style={{...styles.statusBadge, backgroundColor: hubConfig.color}}>
                            {hubConfig.short}_CHAIN_VERIFIED
                        </div>
                        <button onClick={handleOpenAudit} style={styles.auditBtn}>OPEN_IN_AUDIT_TERMINAL</button>
                    </div>
                    <h1 style={styles.reportTitle}>{product?.name?.toUpperCase() || 'UNDEFINED_ASSET'}</h1>
                    <p style={styles.reportSubtitle}>Interchain Traceability Protocol | ID: #{id.padStart(3, '0')}</p>
                </div>

                {/* Grid thông số kỹ thuật */}
                <div style={styles.specGrid}>
                    <div style={styles.specBox}>
                        <span style={styles.specLabel}>ORIGIN_HUB</span>
                        <span style={{...styles.specValue, color: hubConfig.color}}>{hubConfig.name}</span>
                    </div>
                    <div style={styles.specBox}>
                        <span style={styles.specLabel}>ASSET_ID</span>
                        <span style={styles.specValue}>#{id.padStart(3, '0')}</span>
                    </div>
                    <div style={styles.specBox}>
                        <span style={styles.specLabel}>ENTITY_OWNER</span>
                        <span style={styles.specValue}>{product.manufacturer || 'UNKNOWN'}</span>
                    </div>
                    <div style={styles.specBox}>
                        <span style={styles.specLabel}>ASSET_CATEGORY</span>
                        <div style={styles.typeBadge}>{product.productType || 'STANDARD'}</div>
                    </div>
                </div>

                {/* Timeline nhật ký - Sửa lỗi mất ảnh */}
                <div style={styles.timelineSection}>
                    <h3 style={styles.sectionTitle}>IMMUTABLE_ASSET_JOURNEY</h3>
                    <div style={styles.timelineContainer}>
                        {product.steps && product.steps.map((step, i) => (
                            <div key={i} style={styles.timelineItem}>
                                <div style={styles.timeLineLeft}>
                                    <div style={styles.dateText}>{new Date(step.time).toLocaleDateString('en-GB')}</div>
                                    <div style={styles.hourText}>{new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <div style={styles.timeLineCenter}>
                                    <div style={{...styles.timelineNode, backgroundColor: hubConfig.color}}></div>
                                    {i !== product.steps.length - 1 && <div style={styles.timelineConnector}></div>}
                                </div>
                                <div style={styles.timeLineRight}>
                                    <h4 style={styles.stepTitle}>{step.description?.toUpperCase() || 'LOG_ENTRY'}</h4>
                                    <p style={styles.stepDetail}>{step.detail}</p>
                                    
                                    {/* Hiển thị bằng chứng hình ảnh (Khắc phục lỗi mất ảnh) */}
                                    {step.imageHash && step.imageHash !== "" && (
                                        <div style={styles.imageContainer}>
                                            <div style={styles.imgLabel}>VISUAL_EVIDENCE_ATTACHED:</div>
                                            <a href={step.imageHash} target="_blank" rel="noreferrer">
                                                <img 
                                                    src={step.imageHash} 
                                                    alt="Evidence" 
                                                    style={styles.stepImg}
                                                    onError={(e) => { e.target.parentElement.parentElement.style.display = 'none'; }}
                                                />
                                            </a>
                                        </div>
                                    )}

                                    <div style={styles.actorBox}>VALIDATOR: {step.actor}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.reportFooter}>
                    Dữ liệu được trích xuất từ {hubConfig.name}. Mã định danh ID mang tính chất nội bộ vùng.
                </div>
            </div>
        </div>
    );
};

/* --- STYLES: AUDITOR SLATE --- */
const styles = {
    wrapper: { padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    nav: { maxWidth: '1000px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: '1px solid #e2e8f0', padding: '8px 16px', fontSize: '11px', fontWeight: '800', color: '#64748b', cursor: 'pointer' },
    hubBadge: { fontSize: '10px', fontWeight: '900', padding: '6px 12px', border: '1px solid', borderRadius: '2px' },
    reportContainer: { maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '50px' },
    reportHeader: { borderBottom: '4px solid', paddingBottom: '30px', marginBottom: '40px' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    statusBadge: { color: '#fff', fontSize: '10px', fontWeight: '900', padding: '4px 12px' },
    auditBtn: { backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' },
    reportTitle: { margin: 0, fontSize: '28px', color: '#0f172a', fontWeight: '900' },
    reportSubtitle: { margin: '8px 0 0', fontSize: '12px', color: '#94a3b8' },
    specGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: '#e2e8f0', border: '1px solid #e2e8f0', marginBottom: '50px' },
    specBox: { padding: '20px', backgroundColor: '#fff' },
    specLabel: { display: 'block', fontSize: '9px', fontWeight: '800', color: '#94a3b8', marginBottom: '6px' },
    specValue: { fontSize: '14px', fontWeight: '800', color: '#1e293b' },
    typeBadge: { display: 'inline-block', padding: '2px 8px', backgroundColor: '#f1f5f9', fontSize: '10px', fontWeight: '700' },
    timelineSection: { marginTop: '20px' },
    sectionTitle: { fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
    timelineContainer: { paddingLeft: '10px' },
    timelineItem: { display: 'flex', marginBottom: '40px' },
    timeLineLeft: { width: '110px' },
    dateText: { fontSize: '12px', fontWeight: '700', color: '#1e293b' },
    hourText: { fontSize: '11px', color: '#94a3b8' },
    timeLineCenter: { width: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
    timelineNode: { width: '10px', height: '10px', borderRadius: '50%', zIndex: 2 },
    timelineConnector: { width: '2px', backgroundColor: '#e2e8f0', flexGrow: 1, position: 'absolute', top: '10px', bottom: '-30px' },
    timeLineRight: { flexGrow: 1 },
    stepTitle: { margin: '0 0 8px 0', fontSize: '14px', fontWeight: '800', color: '#1e293b' },
    stepDetail: { fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 15px 0' },
    imageContainer: { backgroundColor: '#f8fafc', padding: '15px', border: '1px solid #e2e8f0', marginBottom: '15px' },
    imgLabel: { fontSize: '9px', fontWeight: '800', color: '#94a3b8', marginBottom: '10px' },
    stepImg: { width: '250px', border: '1px solid #cbd5e0' },
    actorBox: { fontSize: '10px', color: '#94a3b8', fontWeight: '600', fontFamily: 'monospace' },
    reportFooter: { marginTop: '50px', borderTop: '1px solid #f1f5f9', paddingTop: '30px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' },
    statusMsg: { textAlign: 'center', padding: '100px', color: '#64748b', fontSize: '12px', fontWeight: '800' }
};

export default ItemDetail;
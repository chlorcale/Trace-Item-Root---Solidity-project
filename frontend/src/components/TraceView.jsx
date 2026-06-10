import React, { useState, useEffect, useCallback } from 'react';

const TraceView = ({ externalId, currentHub }) => {
    const [searchId, setSearchId] = useState(externalId || '');
    const [hub, setHub] = useState(currentHub || 'VN');
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleTrace = useCallback(async () => {
        if (!searchId) return;
        setLoading(true);
        setStatus({ type: 'info', message: 'Đang truy vấn sổ cái liên chuỗi (Interchain Query)...' });
        
        try {
            const res = await fetch(`http://localhost:5000/api/trace/${hub}/${searchId}`);
            if (!res.ok) throw new Error(`Không tìm thấy mã định danh #${searchId} trên mạng lưới ${hub}`);
            
            const data = await res.json();
            setProduct(data);
            setStatus({ type: 'success', message: 'Dữ liệu đã được xác thực bởi Tendermint BFT.' });
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [searchId, hub]);

    useEffect(() => {
        if (externalId) {
            setSearchId(externalId);
            setHub(currentHub);
        }
    }, [externalId, currentHub]);

    useEffect(() => {
        if (externalId) handleTrace();
    }, [externalId, handleTrace]);

    return (
        <div style={styles.container}>
            {/* Control Header */}
            <div style={styles.header}>
                <h3 style={styles.title}>PROTOCOL_TRACEABILITY_AUDITOR</h3>
                <div style={styles.searchControls}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>GATEWAY_HUB</label>
                        <select 
                            value={hub} 
                            onChange={(e) => setHub(e.target.value)} 
                            style={styles.select}
                        >
                            <option value="VN">VIETNAM_NETWORK</option>
                            <option value="AUS">AUSTRALIA_NETWORK</option>
                        </select>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>ASSET_IDENTIFIER</label>
                        <input 
                            type="number" 
                            placeholder="Nhập ID số..." 
                            style={styles.input}
                            value={searchId}
                            onChange={e => setSearchId(e.target.value)}
                        />
                    </div>
                    <button 
                        style={loading ? styles.btnDisabled : styles.btnPrimary} 
                        onClick={handleTrace} 
                        disabled={loading}
                    >
                        {loading ? "PROCESSING..." : "VALIDATE_ASSET"}
                    </button>
                </div>
            </div>

            {/* Status Feedback */}
            {status.message && (
                <div style={getStatusStyle(status.type)}>
                    {status.message.toUpperCase()}
                </div>
            )}

            {product ? (
                <div style={styles.resultContainer}>
                    {/* Asset Metadata Summary */}
                    <div style={styles.productSummary}>
                        <div style={styles.summaryBox}>
                            <span style={styles.summaryLabel}>ASSET_NAME</span>
                            <span style={styles.summaryValue}>{product.name.toUpperCase()}</span>
                        </div>
                        <div style={styles.summaryBox}>
                            <span style={styles.summaryLabel}>GTIN_CODE</span>
                            <span style={styles.summaryValue}>{product.productCode}</span>
                        </div>
                        <div style={styles.summaryBox}>
                            <span style={styles.summaryLabel}>NETWORK_HUB</span>
                            <span style={styles.summaryValue}>{product.region}</span>
                        </div>
                        <div style={styles.summaryBox}>
                            <span style={styles.summaryLabel}>CERTIFICATION</span>
                            <span style={styles.typeBadge}>{product.productType}</span>
                        </div>
                    </div>
                    
                    {/* Audit Timeline */}
                    <div style={styles.timelineSection}>
                        <h4 style={styles.sectionTitle}>IMMUTABLE_TRANSACTION_LOG</h4>
                        <div style={styles.timeline}>
                            {product.steps && product.steps.map((step, i) => (
                                <div key={i} style={styles.stepCard}>
                                    <div style={styles.stepMeta}>
                                        <div style={styles.stepTime}>
                                            {new Date(step.time).toLocaleString('en-GB')}
                                        </div>
                                        <div style={styles.stepActor}>
                                            ACTOR:: {step.actor.substring(0, 12)}...
                                        </div>
                                    </div>
                                    <div style={styles.stepContent}>
                                        <div style={styles.stepTitle}>{step.description.toUpperCase()}</div>
                                        <p style={styles.stepDetail}>{step.detail}</p>
                                        
                                        {/* Visual Evidence (IPFS/Cloud) */}
                                        {step.imageHash && (
                                            <div style={styles.evidenceContainer}>
                                                <div style={styles.evidenceLabel}>TECHNICAL_EVIDENCE:</div>
                                                <a href={step.imageHash} target="_blank" rel="noreferrer">
                                                    <img 
                                                        src={step.imageHash} 
                                                        alt="On-chain Proof" 
                                                        style={styles.evidenceImage}
                                                        onError={(e) => { e.target.style.display = 'none'; }} 
                                                    />
                                                </a>
                                                <a href={step.imageHash} target="_blank" rel="noreferrer" style={styles.imgLink}>
                                                    VIEW_ORIGINAL_SOURCE_URL
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : searchId && !loading && (
                <div style={styles.emptyState}>
                    CHỜ NHẬP MÃ ĐỊNH DANH VÀ KÍCH HOẠT QUY TRÌNH KIỂM CHỨNG.
                </div>
            )}
        </div>
    );
};

/* --- ENTERPRISE STYLES --- */
const styles = {
    container: { backgroundColor: '#ffffff', borderRadius: '2px', border: '1px solid #e2e8f0', overflow: 'hidden', fontFamily: 'Inter, sans-serif' },
    header: { padding: '30px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' },
    title: { margin: '0 0 25px 0', fontSize: '14px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.1em' },
    searchControls: { display: 'flex', gap: '20px', alignItems: 'flex-end' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em' },
    select: { padding: '10px 15px', borderRadius: '2px', border: '1px solid #cbd5e0', fontSize: '13px', fontWeight: '600', color: '#475569', backgroundColor: '#fff', outline: 'none', width: '180px' },
    input: { padding: '10px 15px', borderRadius: '2px', border: '1px solid #cbd5e0', fontSize: '13px', color: '#1e293b', width: '220px', outline: 'none' },
    btnPrimary: { padding: '10px 25px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.05em' },
    btnDisabled: { padding: '10px 25px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '12px', fontWeight: '700', cursor: 'not-allowed' },
    
    resultContainer: { padding: '30px', animation: 'fadeInUp 0.4s ease' },
    productSummary: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: '#e2e8f0', border: '1px solid #e2e8f0', marginBottom: '40px' },
    summaryBox: { padding: '20px', backgroundColor: '#fff' },
    summaryLabel: { display: 'block', fontSize: '9px', fontWeight: '800', color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.05em' },
    summaryValue: { fontSize: '14px', fontWeight: '700', color: '#1e293b' },
    typeBadge: { fontSize: '11px', fontWeight: '800', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.05)', padding: '2px 8px', borderRadius: '2px' },

    timelineSection: { marginTop: '20px' },
    sectionTitle: { fontSize: '12px', fontWeight: '800', color: '#1e293b', borderLeft: '3px solid #1e293b', paddingLeft: '15px', marginBottom: '30px', letterSpacing: '0.05em' },
    stepCard: { display: 'flex', gap: '30px', marginBottom: '40px', borderBottom: '1px solid #f1f5f9', paddingBottom: '30px' },
    stepMeta: { width: '150px', flexShrink: 0 },
    stepTime: { fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '5px' },
    stepActor: { fontSize: '10px', color: '#94a3b8', fontWeight: '600', fontFamily: 'monospace' },
    stepTitle: { fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' },
    stepDetail: { fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px 0' },
    
    evidenceContainer: { backgroundColor: '#f8fafc', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '2px' },
    evidenceLabel: { fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '12px' },
    evidenceImage: { width: '280px', borderRadius: '2px', border: '1px solid #cbd5e0', marginBottom: '10px', display: 'block' },
    imgLink: { fontSize: '11px', color: '#3b82f6', textDecoration: 'none', fontWeight: '700' },
    
    emptyState: { textAlign: 'center', padding: '100px', color: '#94a3b8', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }
};

const getStatusStyle = (type) => {
    const themes = {
        error: { bg: '#fef2f2', text: '#dc2626' },
        success: { bg: '#f0fff4', text: '#16a34a' },
        info: { bg: '#eff6ff', text: '#2563eb' }
    };
    const theme = themes[type] || themes.info;
    return {
        padding: '12px 30px', fontSize: '11px', fontWeight: '800', 
        backgroundColor: theme.bg, color: theme.text, borderBottom: `1px solid ${theme.text}22`
    };
};

export default TraceView;
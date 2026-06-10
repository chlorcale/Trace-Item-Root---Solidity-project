import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Edit3, Trash2, Save, X, Hash, Factory, ClipboardList } from 'lucide-react';

const ProductRow = ({ item, onUpdate, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // State cục bộ lưu toàn bộ object để chỉnh sửa
    const [tempItem, setTempItem] = useState({ ...item });

    const handleSave = () => {
        onUpdate(item.productCode, tempItem);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempItem({ ...item });
        setIsEditing(false);
    };

    // Hàm sửa đổi từng bước trong mảng history
    const updateStep = (index, value) => {
        const newHistory = [...tempItem.history];
        newHistory[index].description = value.toUpperCase();
        setTempItem({ ...tempItem, history: newHistory });
    };

    return (
        <tr 
            style={{ ...styles.tr, backgroundColor: isHovered ? '#f8fafc' : '#fff' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 1. CỘT ID (Cố định) */}
            <td style={styles.tdCode}>
                <div style={styles.idWrapper}>
                    <Hash size={12} color="#94a3b8" />
                    <span>{item.productCode}</span>
                </div>
            </td>
            
            {/* 2. CỘT THÔNG TIN TÀI SẢN (Sửa Tên & Doanh nghiệp) */}
            <td style={styles.tdAsset}>
                {isEditing ? (
                    <div style={styles.editStack}>
                        <input 
                            style={styles.inputMain} 
                            value={tempItem.name} 
                            onChange={(e) => setTempItem({ ...tempItem, name: e.target.value.toUpperCase() })}
                            placeholder="Tên sản phẩm"
                        />
                        <input 
                            style={styles.inputSub} 
                            value={tempItem.manufacturer} 
                            onChange={(e) => setTempItem({ ...tempItem, manufacturer: e.target.value })}
                            placeholder="Doanh nghiệp"
                        />
                    </div>
                ) : (
                    <div style={styles.infoWrapper}>
                        <div style={styles.primaryText}>{item.name}</div>
                        <div style={styles.secondaryText}>{item.manufacturer}</div>
                    </div>
                )}
            </td>

            {/* 3. CỘT QUY TRÌNH NHẬT KÝ (Sửa từng Step trong Array) */}
            <td style={styles.tdLogs}>
                {isEditing ? (
                    <div style={styles.stepEditGrid}>
                        {tempItem.history.map((step, idx) => (
                            <input 
                                key={idx}
                                style={styles.inputStep} 
                                value={step.description}
                                onChange={(e) => updateStep(idx, e.target.value)}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={styles.stepChain}>
                        {item.history.map((s, idx) => (
                            <span key={idx} style={styles.stepBadge}>{s.description}</span>
                        ))}
                    </div>
                )}
            </td>

            {/* 4. CỘT BẰNG CHỨNG (PROOF) */}
            <td style={styles.tdProof}>
                {item.history.every(s => s.image) ? (
                    <div style={styles.proofOk}><CheckCircle2 size={14} /><span>VALID</span></div>
                ) : (
                    <div style={styles.proofWarn}><AlertCircle size={14} /><span>MISSING</span></div>
                )}
            </td>

            {/* 5. CỘT QUẢN LÝ (MANAGE) */}
            <td style={styles.tdManage}>
                <div style={{ ...styles.actionWrapper, opacity: isHovered || isEditing ? 1 : 0 }}>
                    {isEditing ? (
                        <div style={styles.confirmGroup}>
                            <button onClick={handleSave} style={styles.btnSave}><Save size={14}/></button>
                            <button onClick={handleCancel} style={styles.btnCancel}><X size={14}/></button>
                        </div>
                    ) : (
                        <div style={styles.toolGroup}>
                            <button onClick={() => setIsEditing(true)} style={styles.btnIcon}><Edit3 size={15} color="#3b82f6" /></button>
                            <button onClick={() => onDelete(item.productCode)} style={styles.btnIcon}><Trash2 size={15} color="#ef4444" /></button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

const styles = {
    tr: { borderBottom: '1px solid #f1f5f9', height: '80px', transition: 'all 0.2s' },
    tdCode: { paddingLeft: '20px', width: '140px' },
    idWrapper: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '800', color: '#64748b', fontFamily: 'monospace' },
    tdAsset: { width: '280px' },
    infoWrapper: { display: 'flex', flexDirection: 'column', gap: '4px' },
    primaryText: { fontWeight: '900', color: '#0f172a', fontSize: '13px' },
    secondaryText: { fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
    tdLogs: { padding: '10px 0' },
    stepChain: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    stepBadge: { fontSize: '9px', fontWeight: '800', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '2px', border: '1px solid #e2e8f0' },
    tdProof: { textAlign: 'center', width: '100px' },
    proofOk: { display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#10b981', fontSize: '10px', fontWeight: '900' },
    proofWarn: { display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontSize: '10px', fontWeight: '900' },
    tdManage: { width: '110px', textAlign: 'right', paddingRight: '20px' },
    actionWrapper: { transition: 'opacity 0.2s' },
    toolGroup: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
    confirmGroup: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
    btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px' },
    btnSave: { background: '#10b981', color: '#fff', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '2px' },
    btnCancel: { background: '#94a3b8', color: '#fff', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '2px' },
    // Input Styles
    editStack: { display: 'flex', flexDirection: 'column', gap: '5px' },
    inputMain: { border: '1px solid #3b82f6', outline: 'none', padding: '5px 8px', fontSize: '12px', fontWeight: '800', width: '220px' },
    inputSub: { border: '1px solid #cbd5e1', outline: 'none', padding: '4px 8px', fontSize: '10px', width: '220px', color: '#64748b' },
    stepEditGrid: { display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '350px' },
    inputStep: { border: '1px solid #3b82f6', background: '#eff6ff', outline: 'none', padding: '3px 6px', fontSize: '9px', fontWeight: '800', width: '80px', borderRadius: '2px' }
};

export default ProductRow;
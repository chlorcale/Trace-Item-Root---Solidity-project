import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, userRole }) => {
    const isAdmin = userRole === 'admin';
    const isBiz = userRole === 'business';

    return (
        <aside style={styles.sidebar}>
            {/* 1. Identity Section: Hiển thị định danh hệ thống và vai trò */}
            <div style={styles.logoSection}>
                <h2 style={styles.systemTitle}>WEB3_TRACE_CORE</h2>
                <div style={getRoleBadgeStyle(userRole)}>
                    {userRole === 'admin' ? "ROOT_ADMIN" : userRole === 'business' ? "ENTITY_PARTNER" : "STAKEHOLDER"}
                </div>
            </div>
            
            {/* 2. Navigation System: Danh sách các module nghiệp vụ */}
            <nav style={styles.navStack}>
                
                {/* NHÓM: VẬN HÀNH HỆ THỐNG */}
                <div style={styles.navLabel}>SYSTEM_OPERATIONS</div>
                <button 
                    style={activeTab === 'overview' ? styles.navBtnActive : styles.navBtn} 
                    onClick={() => setActiveTab('overview')}
                >
                    OVERVIEW_DASHBOARD
                </button>
                
                <button 
                    style={activeTab === 'products' ? styles.navBtnActive : styles.navBtn} 
                    onClick={() => setActiveTab('products')}
                >
                    ASSET_REGISTRY
                </button>
                
                <button 
                    style={activeTab === 'scan' ? styles.navBtnActive : styles.navBtn} 
                    onClick={() => setActiveTab('scan')}
                >
                    AUTH_GATEWAY
                </button>

                <button 
                    style={activeTab === 'map' ? styles.navBtnActive : styles.navBtn} 
                    onClick={() => setActiveTab('map')}
                >
                    GEOSPATIAL_MAP
                </button>

                {/* NHÓM: XỬ LÝ HÀNG LOẠT (Dành riêng cho Admin - Demo Sếp) */}
                {isAdmin && (
                    <>
                        <div style={styles.navLabel}>BATCH_PROCESSING</div>
                        <button 
                            style={activeTab === 'import-excel' ? styles.navBtnActive : styles.navBtn} 
                            onClick={() => setActiveTab('import-excel')}
                        >
                            EXCEL_DATA_PIPELINE
                        </button>
                    </>
                )}

                {/* NHÓM: NGHIỆP VỤ LOGISTICS */}
                <div style={styles.navLabel}>BUSINESS_LOGISTICS</div>

                {isAdmin && (
                    <button 
                        style={activeTab === 'admin-approval' ? styles.navBtnActive : styles.navBtn} 
                        onClick={() => setActiveTab('admin-approval')}
                    >
                        PROTOCOL_APPROVAL
                    </button>
                )}

                {isBiz && (
                    <button 
                        style={activeTab === 'biz-request' ? styles.navBtnActive : styles.navBtn} 
                        onClick={() => setActiveTab('biz-request')}
                    >
                        MINT_REQUEST_INIT
                    </button>
                )}

                {(isAdmin || isBiz) && (
                    <button 
                        style={activeTab === 'add-step' ? styles.navBtnActive : styles.navBtn} 
                        onClick={() => setActiveTab('add-step')}
                    >
                        PROCESS_LOGGING
                    </button>
                )}

                <button 
                    style={activeTab === 'register-biz' ? styles.navBtnActive : styles.navBtn} 
                    onClick={() => setActiveTab('register-biz')}
                >
                    IDENTITY_REGISTRATION
                </button>

                {/* NHÓM: MẠNG LƯỚI LIÊN KẾT (INTERCHAIN) */}
                <div style={styles.navLabel}>INTERCHAIN_NETWORK</div>
                <button 
                    style={{
                        ...(activeTab === 'sydney-node' ? styles.navBtnActive : styles.navBtn),
                        borderLeft: '4px solid #3b82f6',
                        background: activeTab === 'sydney-node' ? 'rgba(59, 130, 246, 0.15)' : 'transparent'
                    }} 
                    onClick={() => setActiveTab('sydney-node')}
                >
                    SYDNEY_NODE_AUS
                </button>
            </nav>

            {/* 3. Footer: Thông tin phiên bản và giao thức */}
            <div style={styles.footer}>
                <div style={styles.versionLine}>V3.0 COSMOS_SDK_PROTOCOL</div>
                <div style={styles.statusLine}>NETWORK_STATUS: STABLE</div>
            </div>
        </aside>
    );
};

/* --- FIXED SYSTEM STYLES (Professional Deep Slate) --- */
const styles = {
    sidebar: {
        width: '280px',
        height: '100vh',
        backgroundColor: '#0f172a', // Slate-900
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e293b',
        fontFamily: "'Inter', sans-serif",
        position: 'fixed', 
        top: 0,
        left: 0,
        zIndex: 100,
        overflow: 'hidden' 
    },
    logoSection: {
        padding: '40px 25px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0 
    },
    systemTitle: {
        margin: '0 0 12px 0',
        fontSize: '15px',
        fontWeight: '900',
        letterSpacing: '0.15em',
        color: '#f8fafc'
    },
    navStack: {
        flex: 1,
        padding: '20px 0',
        overflowY: 'auto',
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none' 
    },
    navLabel: {
        padding: '25px 25px 10px',
        fontSize: '10px',
        fontWeight: '800',
        color: '#475569',
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
    },
    navBtn: {
        width: '100%',
        padding: '14px 25px',
        backgroundColor: 'transparent',
        border: 'none',
        borderLeft: '4px solid transparent',
        color: '#94a3b8',
        fontSize: '12px',
        fontWeight: '600',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    navBtnActive: {
        width: '100%',
        padding: '14px 25px',
        backgroundColor: '#1e293b', // Slate-800
        border: 'none',
        borderLeft: '4px solid #3b82f6', // Xanh dương làm điểm nhấn
        color: '#f8fafc',
        fontSize: '12px',
        fontWeight: '700',
        textAlign: 'left',
        cursor: 'pointer'
    },
    footer: {
        padding: '20px 25px',
        borderTop: '1px solid #1e293b',
        backgroundColor: '#020617', // Slate-950
        flexShrink: 0 
    },
    versionLine: { 
        fontSize: '10px', 
        fontWeight: '700', 
        color: '#475569', 
        fontFamily: 'monospace' 
    },
    statusLine: { 
        fontSize: '9px', 
        color: '#10b981', // Màu xanh lá trạng thái ổn định
        fontWeight: '800', 
        marginTop: '4px' 
    }
};

/* --- DYNAMIC ROLE BADGE --- */
const getRoleBadgeStyle = (role) => {
    const themes = {
        admin: { color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.4)' },
        business: { color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' },
        customer: { color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' }
    };
    const theme = themes[role] || themes.customer;
    return {
        fontSize: '9px',
        fontWeight: '900',
        padding: '4px 10px',
        borderRadius: '2px',
        display: 'inline-block',
        letterSpacing: '0.1em',
        color: theme.color,
        border: theme.border,
        backgroundColor: 'rgba(15, 23, 42, 0.5)'
    };
};

export default Sidebar;
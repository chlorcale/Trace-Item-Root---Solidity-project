import React, { useState } from 'react';

const LoginGate = ({ onLoginSuccess }) => {
    const [role, setRole] = useState('customer');
    const [region, setRegion] = useState('VN');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (role === 'admin' && password !== 'admin123') {
            setError("Xác thực không hợp lệ. Vui lòng kiểm tra lại mã truy cập quản trị.");
            return;
        }

        onLoginSuccess(role, region);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Brand Identity */}
                <div style={styles.header}>
                    <h1 style={styles.title}>IDENTITY & ACCESS MANAGEMENT</h1>
                    <p style={styles.subtitle}>Hệ thống xác thực truy xuất nguồn gốc liên chuỗi (Interchain)</p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Region Selection */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>GATEWAY HUB SELECTION</label>
                        <select 
                            value={region} 
                            onChange={(e) => setRegion(e.target.value)} 
                            style={styles.select}
                        >
                            <option value="VN">VIETNAM NETWORK (CÀ MAU HUB)</option>
                            <option value="AUS">AUSTRALIA NETWORK (SYDNEY HUB)</option>
                        </select>
                    </div>

                    {/* Role Selection */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>ACCESS PRIVILEGE LEVEL</label>
                        <div style={styles.roleGrid}>
                            {[
                                { id: 'customer', label: 'USER' },
                                { id: 'business', label: 'BUSINESS' },
                                { id: 'admin', label: 'ROOT ADMIN' }
                            ].map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => { setRole(r.id); setError(''); }}
                                    style={{
                                        ...styles.roleButton,
                                        ...(role === r.id ? styles.roleActive : {})
                                    }}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Admin Credential */}
                    {role === 'admin' && (
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>ADMINISTRATOR CREDENTIALS</label>
                            <input
                                type="password"
                                placeholder="ACCESS TOKEN"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" style={styles.submitBtn}>
                        ESTABLISH CONNECTION
                    </button>
                </form>

                {/* System Metadata */}
                <div style={styles.footer}>
                    <div style={styles.metaLine}>
                        <span style={styles.metaLabel}>INFRASTRUCTURE:</span> GANACHE_EV_CHAIN / COSMOS_SDK_V3
                    </div>
                    <div style={styles.metaLine}>
                        <span style={styles.metaLabel}>STATUS:</span> NODE_ACTIVE_STABLE
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- ENTERPRISE SLATE STYLING --- */
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a', // Deep Navy/Slate
        fontFamily: 'Inter, system-ui, sans-serif'
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '50px 40px',
        borderRadius: '2px', // Minimalist square corners
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '460px'
    },
    header: {
        marginBottom: '40px',
        borderLeft: '4px solid #1e293b',
        paddingLeft: '20px'
    },
    title: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#1e293b',
        margin: '0 0 8px 0',
        letterSpacing: '0.05em'
    },
    subtitle: {
        fontSize: '12px',
        color: '#64748b',
        margin: 0,
        fontWeight: '500'
    },
    fieldGroup: {
        marginBottom: '25px'
    },
    label: {
        display: 'block',
        fontSize: '10px',
        fontWeight: '800',
        color: '#94a3b8',
        marginBottom: '10px',
        letterSpacing: '0.1em'
    },
    select: {
        width: '100%',
        padding: '12px',
        borderRadius: '2px',
        border: '1px solid #e2e8f0',
        fontSize: '13px',
        fontWeight: '600',
        color: '#1e293b',
        outline: 'none',
        backgroundColor: '#f8fafc'
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '2px',
        border: '1px solid #e2e8f0',
        fontSize: '13px',
        boxSizing: 'border-box',
        outline: 'none',
        backgroundColor: '#f8fafc'
    },
    roleGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px'
    },
    roleButton: {
        padding: '12px 5px',
        borderRadius: '2px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: '700',
        color: '#64748b',
        transition: 'all 0.2s ease'
    },
    roleActive: {
        backgroundColor: '#1e293b',
        color: '#fff',
        borderColor: '#1e293b'
    },
    submitBtn: {
        width: '100%',
        padding: '16px',
        borderRadius: '2px',
        border: 'none',
        backgroundColor: '#1e293b',
        color: '#fff',
        fontSize: '13px',
        fontWeight: '800',
        cursor: 'pointer',
        marginTop: '10px',
        letterSpacing: '0.1em',
        transition: 'background 0.2s'
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        padding: '12px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '25px',
        borderLeft: '3px solid #dc2626'
    },
    footer: {
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #f1f5f9'
    },
    metaLine: {
        fontSize: '10px',
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: '4px',
        fontFamily: 'monospace'
    },
    metaLabel: {
        color: '#cbd5e1'
    }
};

export default LoginGate;
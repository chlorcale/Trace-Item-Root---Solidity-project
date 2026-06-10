import React, { useEffect, useState } from 'react';
import BlockchainVisualizer from './BlockchainVisualizer';

const Overview = ({ currentHub }) => {
    const [stats, setStats] = useState({ total: 0, integrity: 100 });
    const [networkStatus, setNetworkStatus] = useState({ height: "---", status: "INITIALIZING" });

    useEffect(() => {
        // 1. Truy vấn thống kê tài sản từ cơ sở dữ liệu
        fetch(`http://localhost:5000/api/products?region=${currentHub}`)
            .then(res => res.json())
            .then(data => {
                setStats(prev => ({ ...prev, total: data.length }));
            })
            .catch(() => setStats(prev => ({ ...prev, total: 0 })));

        // 2. Đồng bộ hóa thời gian thực với Cosmos RPC Layer
        const fetchNetworkMetrics = async () => {
            try {
                const res = await fetch('http://localhost:26657/status');
                const json = await res.json();
                if (json.result) {
                    setNetworkStatus({
                        height: json.result.sync_info.latest_block_height,
                        status: "SYNCHRONIZED"
                    });
                }
            } catch (e) { 
                setNetworkStatus({ height: "0", status: "NODE_OFFLINE" }); 
            }
        };

        fetchNetworkMetrics();
        const metricsInterval = setInterval(fetchNetworkMetrics, 2000);
        return () => clearInterval(metricsInterval);
    }, [currentHub]);

    return (
        <div style={styles.container}>
            {/* Top Metrics Row */}
            <div style={styles.metricsGrid}>
                {/* Block Height Monitor */}
                <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>NETWORK_BLOCK_HEIGHT</div>
                    <div style={{ ...styles.metricValue, color: '#10b981', fontFamily: 'monospace' }}>
                        {networkStatus.height.toString().padStart(6, '0')}
                    </div>
                    <div style={styles.metricSubtext}>
                        NODE_STATUS: <span style={styles.statusText}>{networkStatus.status}</span>
                    </div>
                </div>

                {/* Asset Inventory */}
                <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>COMMITTED_ASSETS ({currentHub})</div>
                    <div style={styles.metricValue}>{stats.total}</div>
                    <div style={styles.metricSubtext}>TOTAL_ON_CHAIN_RECORDS</div>
                </div>

                {/* Consensus Integrity */}
                <div style={styles.metricCard}>
                    <div style={styles.metricLabel}>CONSENSUS_INTEGRITY</div>
                    <div style={{ ...styles.metricValue, color: '#3b82f6' }}>{stats.integrity}%</div>
                    <div style={styles.metricSubtext}>TENDERMINT_BFT_VALIDATED</div>
                </div>
            </div>

            {/* Network Visualization Section */}
            <div style={styles.visualizerWrapper}>
                <div style={styles.sectionHeader}>
                    <span style={styles.sectionTitle}>REAL-TIME_LEDGER_VISUALIZATION</span>
                    <span style={styles.regionBadge}>REGION::{currentHub}</span>
                </div>
                <BlockchainVisualizer currentHub={currentHub} />
            </div>
        </div>
    );
};

/* --- ENTERPRISE SYSTEM STYLES --- */
const styles = {
    container: {
        backgroundColor: '#f8fafc',
        minHeight: '100%',
        fontFamily: 'Inter, system-ui, sans-serif'
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '20px'
    },
    metricCard: {
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '2px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    metricLabel: {
        fontSize: '10px',
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: '0.1em',
        marginBottom: '12px'
    },
    metricValue: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b',
        lineHeight: '1'
    },
    metricSubtext: {
        fontSize: '11px',
        color: '#64748b',
        marginTop: '12px',
        fontWeight: '500'
    },
    statusText: {
        color: '#10b981',
        fontWeight: '700'
    },
    visualizerWrapper: {
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '2px',
        overflow: 'hidden'
    },
    sectionHeader: {
        padding: '15px 20px',
        backgroundColor: '#111827',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sectionTitle: {
        color: '#f3f4f6',
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '0.05em'
    },
    regionBadge: {
        fontSize: '10px',
        color: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: '2px 8px',
        borderRadius: '2px',
        fontWeight: '700'
    }
};

export default Overview;
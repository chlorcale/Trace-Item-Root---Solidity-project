import React, { useEffect, useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const BlockchainVisualizer = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const COSMOS_REST = "http://localhost:1317";

    const loadCosmosBlocks = useCallback(async () => {
        try {
            const resLatest = await fetch(`${COSMOS_REST}/cosmos/base/tendermint/v1beta1/blocks/latest`);
            const latestData = await resLatest.json();
            const currentHeight = parseInt(latestData.block.header.height);

            const latestBlocks = [];
            const fetchCount = Math.min(currentHeight, 6); // Giảm số lượng để giao diện thoáng hơn

            for (let i = 0; i < fetchCount; i++) {
                const height = currentHeight - i;
                const resBlock = await fetch(`${COSMOS_REST}/cosmos/base/tendermint/v1beta1/blocks/${height}`);
                const blockData = await resBlock.json();

                latestBlocks.unshift({
                    height: blockData.block.header.height,
                    hash: blockData.block_id.hash,
                    proposer: blockData.block.header.proposer_address,
                    timestamp: blockData.block.header.time,
                    txCount: blockData.block.data.txs ? blockData.block.data.txs.length : 0,
                    chainId: blockData.block.header.chain_id
                });
            }
            setBlocks(latestBlocks);
            setLoading(false);
        } catch (err) {
            console.error("Cosmos Visualizer Error:", err);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCosmosBlocks();
        const interval = setInterval(loadCosmosBlocks, 6000);
        return () => clearInterval(interval);
    }, [loadCosmosBlocks]);

    return (
        <div style={styles.container}>
            {/* Explorer Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={styles.title}>NETWORK EXPLORER</span>
                    <span style={styles.chainBadge}>{blocks[0]?.chainId || 'IDENTIFYING...'}</span>
                </div>
                <div style={styles.statusGroup}>
                    <div style={styles.pulseDot}></div>
                    <span style={styles.statusText}>LIVE MONITORING</span>
                </div>
            </div>

            <div style={styles.viewPort}>
                <TransformWrapper initialScale={0.8} centerOnInit={true}>
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            <div style={styles.toolbar}>
                                <button style={styles.toolBtn} onClick={() => zoomIn()}>+</button>
                                <button style={styles.toolBtn} onClick={() => zoomOut()}>-</button>
                                <button style={styles.toolBtn} onClick={() => resetTransform()}>RESET</button>
                            </div>

                            <TransformComponent wrapperStyle={styles.wrapper}>
                                {loading ? (
                                    <div style={styles.loadingState}>INITIALIZING CHAIN STRUCTURE...</div>
                                ) : (
                                    <svg width={blocks.length * 280 + 100} height="340" style={{ background: '#0a0e14' }}>
                                        {/* Block Connections */}
                                        {blocks.map((_, index) => {
                                            if (index === 0) return null;
                                            return (
                                                <g key={`link-${index}`}>
                                                    <line 
                                                        x1={(index - 1) * 260 + 230} y1="160" 
                                                        x2={index * 260 + 30} y2="160" 
                                                        stroke="#1f2937" strokeWidth="1" 
                                                    />
                                                    <circle cx={index * 260 + 30} cy="160" r="2" fill="#3b82f6" />
                                                </g>
                                            );
                                        })}

                                        {/* Block Rendering */}
                                        {blocks.map((block, index) => (
                                            <g key={block.height} transform={`translate(${index * 260 + 30}, 60)`}>
                                                {/* Main Block Body */}
                                                <rect 
                                                    width="220" height="180" rx="2" 
                                                    fill="#111827" 
                                                    stroke={index === blocks.length - 1 ? "#3b82f6" : "#1f2937"} 
                                                    strokeWidth="1" 
                                                />
                                                
                                                {/* Block Header Area */}
                                                <rect width="220" height="40" fill="#1f2937" rx="2" />
                                                <text x="12" y="25" fill="#f3f4f6" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">
                                                    BLOCK HEIGHT {block.height}
                                                </text>

                                                {/* Hash Information */}
                                                <text x="12" y="65" fill="#6b7280" fontSize="9" fontWeight="600">BLOCK HASH</text>
                                                <text x="12" y="82" fill="#3b82f6" fontSize="10" fontFamily="monospace">
                                                    {block.hash.slice(0, 28).toUpperCase()}...
                                                </text>

                                                {/* Proposer Information */}
                                                <text x="12" y="110" fill="#6b7280" fontSize="9" fontWeight="600">VALIDATOR PROPOSER</text>
                                                <text x="12" y="125" fill="#9ca3af" fontSize="10" fontFamily="monospace">
                                                    {block.proposer.toLowerCase()}
                                                </text>

                                                <line x1="12" y1="145" x2="208" y2="145" stroke="#1f2937" strokeWidth="1" />

                                                {/* Footer Metrics */}
                                                <text x="12" y="165" fill="#10b981" fontSize="10" fontWeight="700">TXS: {block.txCount}</text>
                                                <text x="140" y="165" fill="#6b7280" fontSize="9">
                                                    {new Date(block.timestamp).toLocaleTimeString([], { hour12: false })}
                                                </text>
                                            </g>
                                        ))}
                                    </svg>
                                )}
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            </div>
        </div>
    );
};

const styles = {
    container: { background: '#0a0e14', border: '1px solid #1f2937', borderRadius: '4px', overflow: 'hidden' },
    header: { 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '12px 20px', borderBottom: '1px solid #1f2937', background: '#111827' 
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
    title: { color: '#f3f4f6', fontSize: '12px', fontWeight: '800', letterSpacing: '0.1em' },
    chainBadge: { 
        fontSize: '10px', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', 
        padding: '2px 8px', borderRadius: '2px', border: '1px solid rgba(59, 130, 246, 0.2)', fontWeight: '600'
    },
    statusGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
    statusText: { color: '#6b7280', fontSize: '10px', fontWeight: '600' },
    pulseDot: { width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' },
    viewPort: { position: 'relative', background: '#0a0e14' },
    toolbar: { position: 'absolute', top: '15px', right: '15px', zIndex: 5, display: 'flex', gap: '6px' },
    toolBtn: { 
        background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', 
        fontSize: '10px', fontWeight: '700', padding: '4px 10px', cursor: 'pointer', borderRadius: '2px'
    },
    wrapper: { width: "100%", height: "360px" },
    loadingState: { 
        color: '#4b5563', height: '360px', display: 'flex', justifyContent: 'center', 
        alignItems: 'center', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' 
    }
};

export default BlockchainVisualizer;
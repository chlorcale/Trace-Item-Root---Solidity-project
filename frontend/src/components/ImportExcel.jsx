import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Database, RefreshCcw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductRow from './ProductRow';

// Giả định contract được truyền qua props hoặc từ context
const ImportExcel = ({ currentHub, userRole, contract }) => {
    const [cleanedData, setCleanedData] = useState([]);
    const [isCleaning, setIsCleaning] = useState(false);
    const [isMinting, setIsMinting] = useState(false); // Trạng thái riêng cho việc ghi chuỗi
    const [step, setStep] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [logs, setLogs] = useState([]);
    
    const itemsPerPage = 10;
    const fileInputRef = useRef(null);

    const totalPages = Math.ceil(cleanedData.length / itemsPerPage) || 1;
    const currentTableData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return cleanedData.slice(start, start + itemsPerPage);
    }, [cleanedData, currentPage]);

    if (userRole !== 'admin') {
        return <div style={styles.errorContainer}>SECURITY_ALERT::UNAUTHORIZED_ACCESS_DENIED</div>;
    }

    const processExcelData = (file) => {
        const reader = new FileReader();
        setStep(2);
        setIsCleaning(true);
        setLogs(["[SCAN]:: Phân tích cấu trúc file Excel...", "[MAPPING]:: Đang đồng bộ cấu trúc ORIGIN_HUB và ENTITY_OWNER..."]);

        reader.onload = (evt) => {
            const raw = XLSX.utils.sheet_to_json(XLSX.read(evt.target.result, { type: 'binary' }).Sheets[XLSX.read(evt.target.result, { type: 'binary' }).SheetNames[0]]);
            
            setTimeout(() => {
                const clean = (s) => String(s || "").replace(/[@_#!]/g, "").trim().toUpperCase();

                const grouped = raw.reduce((acc, row) => {
                    const code = row["Mã SP"];
                    if (!acc[code]) {
                        acc[code] = {
                            productCode: code,
                            name: clean(row["Tên sản phẩm"]),
                            manufacturer: clean(row["ENTITY_OWNER"]),
                            originHub: row["ORIGIN_HUB"] || "UNKNOWN_HUB",
                            category: row["ASSET_CATEGORY"] || "Thường",
                            // Thêm các trường cần thiết cho Smart Contract
                            productionDate: row["Ngày SX"] ? new Date(row["Ngày SX"]).getTime() : Math.floor(Date.now() / 1000),
                            pType: row["Loại SP"] === 'OCOP' ? 1 : (row["Loại SP"] === 'IntellectualProperty' ? 2 : 0),
                            certification: row["Chứng nhận"] || "VietGAP",
                            rawMaterialArea: row["Vùng nguyên liệu"] || "Cà Mau, VN",
                            history: []
                        };
                    }
                    acc[code].history.push({
                        description: clean(row["Mô tả bước"]),
                        detail: row["Chi tiết bước"] || "Dữ liệu nhật ký trống",
                        image: row["Link bằng chứng"] || ""
                    });
                    return acc;
                }, {});

                setCleanedData(Object.values(grouped));
                setLogs(prev => [...prev, "[CLEAN]:: Đã làm sạch nhiễu dữ liệu thành công.", "[DONE]:: Dữ liệu sẵn sàng chờ xét duyệt."]);
                setIsCleaning(false);
                setStep(3);
            }, 2000);
        };
        reader.readAsBinaryString(file);
    };

    // --- LOGIC BATCH MINT TỐI ƯU CHO COSMOS SDK ---
    const handleExecuteMint = async () => {
        if (!contract) return alert("Contract chưa được kết nối!");
        
        const CHUNK_SIZE = 50; // Chia nhỏ để tránh RPC Error và Gas Limit
        setIsMinting(true);
        setStep(2); // Quay lại màn hình log để theo dõi tiến độ
        setLogs(["[START]:: Bắt đầu quy trình Batch Mint Interchain..."]);

        for (let i = 0; i < cleanedData.length; i += CHUNK_SIZE) {
            const chunk = cleanedData.slice(i, i + CHUNK_SIZE);
            
            // Chuẩn bị dữ liệu mảng cho hàm Solidity batchMintWithLogs
            const params = {
                codes: chunk.map(p => p.productCode),
                names: chunk.map(p => p.name),
                certs: chunk.map(p => p.certification),
                areas: chunk.map(p => p.rawMaterialArea),
                mNames: chunk.map(p => p.manufacturer),
                prodDates: chunk.map(p => p.productionDate),
                pTypes: chunk.map(p => p.pType),
                // Lấy log đầu tiên làm log khởi tạo cho mỗi sản phẩm
                logDescs: chunk.map(p => p.history[0]?.description || "KHOI_TAO"),
                logDetails: chunk.map(p => p.history[0]?.detail || "Root entry"),
                logImgs: chunk.map(p => p.history[0]?.image || "")
            };

            try {
                setLogs(prev => [...prev, `[SENDING]:: Đang gửi đợt ${Math.floor(i/CHUNK_SIZE) + 1}...`]);
                
                const tx = await contract.batchMintWithLogs(
                    params.codes, params.names, params.certs, params.areas, params.mNames,
                    params.prodDates, params.pTypes, params.logDescs, params.logDetails, params.logImgs
                );

                setLogs(prev => [...prev, `[WAITING]:: Đang đợi xác thực trên mạng Cosmos...`]);
                await tx.wait();
                
                setLogs(prev => [...prev, `[SUCCESS]:: Đã Mint thành công ${chunk.length} sản phẩm.`]);
            } catch (err) {
                setLogs(prev => [...prev, `[FATAL]:: Lỗi tại đợt ${i}: ${err.message}`]);
                setIsMinting(false);
                return; // Dừng nếu có lỗi nghiêm trọng
            }
        }

        setLogs(prev => [...prev, "[COMPLETED]:: Tất cả dữ liệu đã được ghi vào Blockchain.", "[INFO]:: Admin có thể tải báo cáo Ledger ngay bây giờ."]);
        setIsMinting(false);
        setStep(3);
    };

    const handleUpdateProduct = (code, updatedItem) => {
        setCleanedData(prev => prev.map(p => p.productCode === code ? updatedItem : p));
    };

    const handleDeleteProduct = (code) => {
        if(window.confirm(`Loại bỏ #${code}?`)) {
            setCleanedData(prev => prev.filter(p => p.productCode !== code));
        }
    };

    const exportToExcel = () => {
        const exportList = cleanedData.map(p => ({
            "ASSET_ID": `#${p.productCode.split('_').pop()}`,
            "PRODUCT_NAME": p.name,
            "ENTITY_OWNER": p.manufacturer,
            "ORIGIN_HUB": p.originHub,
            "ASSET_CATEGORY": p.category,
            "TOTAL_STEPS": p.history.length,
            "STATUS": "ON_CHAIN_VERIFIED"
        }));
        const ws = XLSX.utils.json_to_sheet(exportList);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        XLSX.writeFile(wb, `OnChain_Ledger_${currentHub}.xlsx`);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h3 style={styles.title}>BATCH_IMPORT_PIPELINE</h3>
                    <p style={styles.subtitle}>Giao thức Cosmos SDK Interchain Traceability</p>
                </div>
            </div>

            <div style={styles.contentBody}>
                {step === 1 && (
                    <div style={styles.uploadBox} onClick={() => fileInputRef.current.click()}>
                        <Database size={48} color="#94a3b8" />
                        <p style={styles.uploadText}>Nạp tệp Excel (300 dòng Ultra-Chaos)</p>
                        <input type="file" ref={fileInputRef} hidden onChange={(e) => processExcelData(e.target.files[0])} accept=".xlsx" />
                    </div>
                )}

                {step === 2 && (
                    <div style={styles.loadingArea}>
                        <RefreshCcw size={40} className="spin" color="#3b82f6" />
                        <h4 style={styles.loadingTitle}>{isMinting ? "MINTING_TO_BLOCKCHAIN" : "DATA_CLEANING"}</h4>
                        <div style={styles.logContainer}>
                            {logs.map((l, i) => <div key={i} style={styles.logLine}>{l}</div>)}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="fade-in">
                        <div style={styles.tableToolbar}>
                            <span>Hàng chờ: <b>{cleanedData.length}</b> tài sản</span>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button style={styles.btnExport} onClick={exportToExcel}>
                                    <Download size={14} /> DOWNLOAD_LEDGER
                                </button>
                                <button style={styles.btnMint} onClick={handleExecuteMint}>
                                    EXECUTE_INTERCHAIN_MINTING
                                </button>
                            </div>
                        </div>
                        
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>CODE_ID</th>
                                        <th style={styles.th}>ASSET_INFO</th>
                                        <th style={styles.th}>DIARY_LOGS</th>
                                        <th style={{...styles.th, textAlign:'center'}}>PROOF</th>
                                        <th style={{...styles.th, textAlign:'right', paddingRight: '20px'}}>MANAGE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTableData.map((item) => (
                                        <ProductRow 
                                            key={item.productCode} 
                                            item={item} 
                                            onUpdate={handleUpdateProduct}
                                            onDelete={handleDeleteProduct}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={styles.pagination}>
                            <span style={styles.pageLabel}>PAGE {currentPage} / {totalPages}</span>
                            <div style={styles.pageGroup}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={styles.pBtn}><ChevronLeft size={16}/></button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={styles.pBtn}><ChevronRight size={16}/></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '2px', padding: '30px', fontFamily: 'Inter, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' },
    title: { margin: 0, fontSize: '15px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.1em' },
    subtitle: { margin: '5px 0 0', fontSize: '11px', color: '#64748b' },
    uploadBox: { height: '250px', border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },
    uploadText: { fontSize: '13px', fontWeight: '700', color: '#475569', marginTop: '15px' },
    loadingArea: { textAlign: 'center', padding: '40px' },
    loadingTitle: { fontSize: '13px', fontWeight: '800', color: '#1e293b', margin: '20px 0' },
    logContainer: { backgroundColor: '#0f172a', padding: '20px', borderRadius: '4px', textAlign: 'left', display: 'inline-block', width: '90%', color: '#10b981', fontFamily: 'monospace', fontSize: '11px' },
    logLine: { marginBottom: '5px' },
    tableToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '12px', color: '#64748b' },
    tableWrapper: { border: '1px solid #f1f5f9', borderRadius: '2px', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' },
    th: { textAlign: 'left', padding: '15px', borderBottom: '2px solid #f1f5f9', color: '#475569', fontWeight: '800', fontSize: '10px' },
    pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px' },
    pageLabel: { fontSize: '11px', fontWeight: '900', color: '#94a3b8' },
    pBtn: { border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', padding: '6px 10px', borderRadius: '2px' },
    btnMint: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.05em' },
    btnExport: { backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', padding: '10px 16px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '2px' },
    errorContainer: { padding: '100px', textAlign: 'center', color: '#ef4444', fontWeight: '900', letterSpacing: '0.1em' }
};

export default ImportExcel;
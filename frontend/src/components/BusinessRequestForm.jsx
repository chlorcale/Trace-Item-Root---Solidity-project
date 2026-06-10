import React, { useState } from 'react';

const BusinessRequestForm = () => {
    const [formData, setFormData] = useState({
        bizName: '',
        productName: '',
        productCode: '',
        certification: 'VietGAP',
        area: '',
        pType: 0,
        region: 'VN'
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: 'info', message: 'Đang khởi tạo yêu cầu đăng ký sản phẩm...' });

        try {
            const response = await fetch('http://localhost:5000/api/requests/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus({ 
                    type: 'success', 
                    message: 'Yêu cầu đã được gửi. Hệ thống đang chờ phê duyệt từ quản trị viên trước khi thực hiện ghi chuỗi.' 
                });
                setFormData({ ...formData, productName: '', productCode: '', area: '' });
            } else {
                throw new Error("Không thể kết nối tới máy chủ tiếp nhận.");
            }
        } catch (error) {
            setStatus({ type: 'error', message: `Lỗi hệ thống: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            {/* Form Header */}
            <div style={headerStyle}>
                <h3 style={titleStyle}>ĐĂNG KÝ XÁC THỰC SẢN PHẨM ON-CHAIN</h3>
                <p style={subtitleStyle}>
                    Cung cấp thông tin sản phẩm để thực hiện quy trình kiểm duyệt và ghi danh vào hệ thống Blockchain liên chuỗi.
                </p>
            </div>

            {/* Notification Area */}
            {status.message && (
                <div style={getStatusStyle(status.type)}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={formGridStyle}>
                {/* Region Selection */}
                <div style={groupFullStyle}>
                    <label style={labelStyle}>Cổng Hub Tiếp nhận (Gateway Hub)</label>
                    <select 
                        style={inputStyle} 
                        value={formData.region}
                        onChange={e => setFormData({...formData, region: e.target.value})}
                    >
                        <option value="VN">CÀ MAU HUB (VIETNAM)</option>
                        <option value="AUS">SYDNEY HUB (AUSTRALIA)</option>
                    </select>
                </div>

                <div style={groupHalfStyle}>
                    <label style={labelStyle}>Pháp nhân Doanh nghiệp</label>
                    <input 
                        required
                        style={inputStyle}
                        placeholder="Tên doanh nghiệp đăng ký"
                        value={formData.bizName}
                        onChange={e => setFormData({...formData, bizName: e.target.value})}
                    />
                </div>

                <div style={groupHalfStyle}>
                    <label style={labelStyle}>Tên thương mại sản phẩm</label>
                    <input 
                        required
                        style={inputStyle}
                        placeholder="Tên sản phẩm hiển thị"
                        value={formData.productName}
                        onChange={e => setFormData({...formData, productName: e.target.value})}
                    />
                </div>

                <div style={groupHalfStyle}>
                    <label style={labelStyle}>Mã định danh định chuẩn (GTIN/Barcode)</label>
                    <input 
                        required
                        style={inputStyle}
                        placeholder="VD: 893..."
                        value={formData.productCode}
                        onChange={e => setFormData({...formData, productCode: e.target.value})}
                    />
                </div>

                <div style={groupHalfStyle}>
                    <label style={labelStyle}>Khu vực cung ứng / Canh tác</label>
                    <input 
                        required
                        style={inputStyle}
                        placeholder="Vùng nguyên liệu xác thực"
                        value={formData.area}
                        onChange={e => setFormData({...formData, area: e.target.value})}
                    />
                </div>

                <div style={groupFullStyle}>
                    <label style={labelStyle}>Phân loại Chứng nhận Hệ thống</label>
                    <select 
                        style={inputStyle}
                        onChange={e => setFormData({...formData, pType: parseInt(e.target.value)})}
                    >
                        <option value="0">TIÊU CHUẨN CƠ SỞ (STANDARD)</option>
                        <option value="1">CHỨNG NHẬN OCOP (OCOP CERTIFIED)</option>
                        <option value="2">BẢO HỘ SỞ HỮU TRÍ TUỆ (IP PROTECTED)</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={loading ? btnDisabledStyle : btnPrimaryStyle}
                >
                    {loading ? "ĐANG TRUYỀN TẢI DỮ LIỆU..." : "GỬI ĐỀ NGHỊ XÁC THỰC"}
                </button>
            </form>
        </div>
    );
};

/* --- ENTERPRISE STYLING --- */
const containerStyle = { 
    maxWidth: '700px', 
    margin: '40px auto', 
    padding: '35px', 
    backgroundColor: '#ffffff', 
    borderRadius: '4px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif'
};

const headerStyle = { borderBottom: '1px solid #e2e8f0', marginBottom: '30px', paddingBottom: '20px', textAlign: 'left' };
const titleStyle = { margin: 0, fontSize: '18px', fontWeight: '700', color: '#2d3748', letterSpacing: '0.05em' };
const subtitleStyle = { margin: '8px 0 0', fontSize: '13px', color: '#718096', lineHeight: '1.5' };

const formGridStyle = { display: 'flex', flexWrap: 'wrap', gap: '20px' };
const groupFullStyle = { width: '100%' };
const groupHalfStyle = { width: 'calc(50% - 10px)' };

const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #cbd5e0', borderRadius: '2px', fontSize: '14px', color: '#2d3748', boxSizing: 'border-box', outline: 'none' };

const getStatusStyle = (type) => {
    const themes = {
        error: { bg: '#fff5f5', border: '#feb2b2', text: '#c53030' },
        success: { bg: '#f0fff4', border: '#9ae6b4', text: '#2f855a' },
        info: { bg: '#ebf8ff', border: '#90cdf4', text: '#2b6cb0' }
    };
    const theme = themes[type] || themes.info;
    return {
        padding: '12px 16px', borderRadius: '2px', marginBottom: '25px', fontSize: '13px',
        backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text
    };
};

const btnPrimaryStyle = { width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#2d3748', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px', transition: 'background 0.2s' };
const btnDisabledStyle = { ...btnPrimaryStyle, backgroundColor: '#a0aec0', cursor: 'not-allowed' };

export default BusinessRequestForm;
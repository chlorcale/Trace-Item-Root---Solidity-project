import React from 'react';

const MapView = ({ currentHub }) => {
  // Tọa độ mẫu: Cà Mau (VN) và Sydney (AUS)
  const locations = {
    VN: { name: "Mũi Cà Mau, Việt Nam", mapQuery: "Mui+Ca+Mau,Vietnam", info: "Vùng tôm sinh thái ngập mặn." },
    AUS: { name: "Sydney, Australia", mapQuery: "Sydney+Fish+Market,Australia", info: "Trung tâm xuất nhập khẩu hải sản NSW." }
  };

  const current = locations[currentHub] || locations.VN;

  return (
    <div className="card fade-in">
      <h3>🗺️ Bản đồ vùng nguyên liệu ({currentHub})</h3>
      <div className="map-container" style={{ borderRadius: '15px', overflow: 'hidden', border: '1px solid #ddd' }}>
        <iframe 
          title="Bản đồ"
          width="100%" height="400" style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${current.mapQuery}`}
          // Lưu ý: Nếu không có API Key, có thể dùng link nhúng thủ công bên dưới để demo
          // src={`https://maps.google.com/maps?q=${current.mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
        ></iframe>
      </div>
      <div style={{ marginTop: '15px', padding: '10px', background: '#fdfaf6', borderRadius: '8px' }}>
        <p>📍 <b>Vị trí:</b> {current.name}</p>
        <p>🏭 <b>Đặc điểm:</b> {current.info}</p>
      </div>
    </div>
  );
};

export default MapView;
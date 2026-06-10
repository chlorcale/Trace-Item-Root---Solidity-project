import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import TruyXuatJSON from './contracts/TruyXuatNguonGoc.json';
import addresses from './contracts/addresses.json';

import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import ProductTable from './components/ProductTable'; 
import AdminApproval from './components/AdminApproval';
import BusinessRequestForm from './components/BusinessRequestForm';
import TraceView from './components/TraceView'; 
import RegisterBiz from './components/RegisterBiz';
import AddStep from './components/AddStep';
import MapView from './components/MapView';
import LoginGate from './components/LoginGate';
import ScanCode from './components/ScanCode';
import SydneyNode from './components/SydneyNode';
import ItemDetail from './components/ItemDetail';
import ImportExcel from './components/ImportExcel';

const HUB_CONFIG = {
  VN: { address: addresses.VN, name: "Cà Mau Hub (VN)" },
  AUS: { address: addresses.AUS, name: "Sydney Hub (AUS)" }
};

const Dashboard = ({ handleLogout }) => {
  const [userRole] = useState(localStorage.getItem('role') || ""); 
  const [currentHub, setCurrentHub] = useState(localStorage.getItem('region') || "VN");
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTraceId, setActiveTraceId] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  const isAdmin = userRole === 'admin';
  const isBiz = userRole === 'business';

  useEffect(() => {
    const checkOwner = async () => {
      if (!window.ethereum || userRole !== 'admin') return;
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const config = HUB_CONFIG[currentHub];
        const contract = new ethers.Contract(config.address, TruyXuatJSON.abi, provider);
        const ownerAddr = await contract.owner();
        const userAddr = await provider.getSigner().getAddress();
        setIsOwner(userAddr.toLowerCase() === ownerAddr.toLowerCase());
      } catch (e) { setIsOwner(false); }
    };
    checkOwner();
  }, [currentHub, userRole]);

  useEffect(() => {
    const pendingId = localStorage.getItem('pendingTraceId');
    const pendingHub = localStorage.getItem('pendingTraceHub');
    
    if (pendingId) {
        setActiveTraceId(pendingId); // Set ID sản phẩm
        setCurrentHub(pendingHub);   // Set đúng Hub (VN/AUS)
        setActiveTab('trace');       // Chuyển sang Tab Trace
        
        // Sau khi thực hiện xong thì xóa đi để không bị lặp lại khi F5
        localStorage.removeItem('pendingTraceId');
        localStorage.removeItem('pendingTraceHub');
    }
}, [setActiveTab, setActiveTraceId, setCurrentHub]);

  return (
    // Bọc toàn bộ Dashboard trong một Flex Container
    <div style={styles.dashboardWrapper}>
      
      {/* 1. Sidebar - Đã ghim cố định bên trái (280px) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} isOwner={isOwner} />

      {/* 2. Main Content - Vùng chứa nội dung chính */}
      <main style={styles.mainContainer}>
        
        {/* Top Header - Thanh trạng thái phía trên */}
        <header style={styles.topBar}>
          <div style={styles.hubGroup}>
            <span style={styles.networkTitle}>ACTIVE_NETWORK:</span>
            <select 
              value={currentHub} 
              onChange={(e) => setCurrentHub(e.target.value)} 
              style={styles.selectHub}
            >
              <option value="VN">VIETNAM_CA_MAU_HUB</option>
              <option value="AUS">AUSTRALIA_SYDNEY_HUB</option>
            </select>
          </div>

          <div style={styles.userControls}>
              <span style={styles.roleLabel}>SESSION::{userRole.toUpperCase()}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>TERMINATE_SESSION</button>
          </div>
        </header>

        {/* Content Body - Nơi hiển thị các trang con */}
        <section style={styles.contentBody}>
          {activeTab === 'overview' && <Overview currentHub={currentHub} />}
          {activeTab === 'products' && (
            <ProductTable currentHub={currentHub} onTrace={(id) => { setActiveTraceId(id); setActiveTab('trace'); }} />
          )}
          {activeTab === 'import-excel' && isAdmin && (
            <ImportExcel currentHub={currentHub} userRole={userRole} />
          )}
          {activeTab === 'scan' && <ScanCode setActiveTab={setActiveTab} setActiveTraceId={setActiveTraceId} currentHub={currentHub} />}
          {activeTab === 'register-biz' && <RegisterBiz currentHub={currentHub} />}
          {activeTab === 'biz-request' && <BusinessRequestForm currentHub={currentHub} />}
          {activeTab === 'admin-approval' && isAdmin && <AdminApproval currentHub={currentHub} />}
          {activeTab === 'add-step' && (isAdmin || isBiz) && <AddStep currentHub={currentHub} setActiveTab={setActiveTab} setActiveTraceId={setActiveTraceId} />}
          {activeTab === 'sydney-node' && <SydneyNode />}
          {activeTab === 'trace' && <TraceView externalId={activeTraceId} currentHub={currentHub} />}
          {activeTab === 'map' && <MapView currentHub={currentHub} />}
        </section>
      </main>
    </div>
  );
};

/* --- ENTERPRISE LAYOUT STYLES --- */
const styles = {
    dashboardWrapper: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
    },
    mainContainer: {
        // QUAN TRỌNG: Phải bằng đúng chiều rộng Sidebar đã thiết lập
        marginLeft: '280px', 
        flexGrow: 1,
        width: 'calc(100% - 280px)',
        display: 'flex',
        flexDirection: 'column'
    },
    topBar: {
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 40px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky', // Header cũng đứng yên khi cuộn
        top: 0,
        zIndex: 50
    },
    hubGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
    networkTitle: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em' },
    selectHub: { 
        padding: '8px 12px', borderRadius: '2px', border: '1px solid #e2e8f0', 
        fontSize: '12px', fontWeight: '700', color: '#1e293b', outline: 'none', backgroundColor: '#f8fafc' 
    },
    userControls: { display: 'flex', alignItems: 'center', gap: '25px' },
    roleLabel: { fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' },
    logoutBtn: { 
        padding: '8px 16px', border: '1px solid #e2e8f0', background: '#fff', 
        color: '#ef4444', fontSize: '10px', fontWeight: '800', cursor: 'pointer', borderRadius: '2px' 
    },
    contentBody: {
        padding: '40px',
        flexGrow: 1
    }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('role'));

  const handleLoginSuccess = (role, region) => {
    localStorage.setItem('role', role);
    localStorage.setItem('region', region);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Dashboard handleLogout={handleLogout} /> : <LoginGate onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/item/:region/:id" element={<ItemDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TruyXuatNguonGoc is Ownable {
    
    // Phân loại mạng lưới theo mô hình Cosmos (Vùng/Quốc gia)
    enum NetworkRegion { Vietnam, Australia }
    enum ProductType { Normal, OCOP, IntellectualProperty }

    struct Manufacturer {
        string name;
        string taxCode;
        bool isRegistered;
        address wallet;
    }

    struct Step {
        string description;  
        string detail;       
        string imageHash;    
        uint256 timestamp;
        address actor;
    }

    struct Product {
        uint256 id;
        string productCode;     
        string name;            
        string manufacturer;    
        string certification;   
        string rawMaterialArea; 
        uint256 productionDate; 
        uint256 activationDate; 
        address currentOwner;
        ProductType pType;      
        NetworkRegion region;   // Thuộc tính mới: Xác định vùng của Blockchain này
        Step[] history;
    }

    mapping(uint256 => Product) public products;
    mapping(address => Manufacturer) public manufacturers;
    uint256 public productCount;
    NetworkRegion public currentHubRegion; // Vùng cố định của Contract này

    // Sự kiện Mint có thêm ProductCode để Backend Off-chain bắt được chính xác
    event ProductMinted(uint256 id, string name, string manufacturer, string productCode, NetworkRegion region);
    event ManufacturerRegistered(address indexed wallet, string name);
    event StepRecorded(uint256 id, string description);

    // Khởi tạo mạng lưới (Khi Deploy sẽ chọn đây là mạng VN hay AUS)
    constructor(NetworkRegion _region) Ownable() {
        currentHubRegion = _region;
    }

    function registerManufacturer(string memory _name, string memory _taxCode) public {
        require(!manufacturers[msg.sender].isRegistered, "Da dang ky!");
        manufacturers[msg.sender] = Manufacturer(_name, _taxCode, true, msg.sender);
        emit ManufacturerRegistered(msg.sender, _name);
    }

    // Hàm Mint do ADMIN thực hiện (Sau khi duyệt Request từ Off-chain)
    function mintFromOffchain(
        string memory _code,
        string memory _name,
        string memory _cert,
        string memory _area,
        string memory _mName, // Tên doanh nghiệp lấy từ Request Database
        uint256 _prodDate,
        ProductType _pType
    ) public onlyOwner {
        productCount++;
        Product storage p = products[productCount];
        
        p.id = productCount;
        p.productCode = _code;
        p.name = _name;
        p.manufacturer = _mName; 
        p.certification = _cert;
        p.rawMaterialArea = _area;
        p.productionDate = _prodDate;
        p.activationDate = block.timestamp;
        p.currentOwner = msg.sender;
        p.pType = _pType;
        p.region = currentHubRegion; // Tự động gán vùng theo Hub

        emit ProductMinted(productCount, _name, _mName, _code, currentHubRegion);
    }

    function addProductionLog(uint256 _id, string memory _desc, string memory _detail, string memory _img) public onlyOwner {
        products[_id].history.push(Step({
            description: _desc,
            detail: _detail,
            imageHash: _img,
            timestamp: block.timestamp,
            actor: msg.sender
        }));
        emit StepRecorded(_id, _desc);
    }

    function getProductDetails(uint256 _id) public view returns (Product memory) {
        return products[_id];
    }

    function getProductHistory(uint256 _id) public view returns (Step[] memory) {
        return products[_id].history;
    }
}
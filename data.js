/**
 * M-Bro CRM v2.0 — Data Layer
 * Enterprise-centric model with Stakeholders, LA, and Product Rules
 */

// ===== ENTERPRISE STATUS (5-step pipeline) =====
const ENTERPRISE_STATUSES = ['Tiếp cận', 'Đánh giá nhu cầu', 'Đề xuất', 'Đàm phán', 'Chốt deal'];
const STATUS_MAP = {
    'Tiếp cận': 's-approach', 'Đánh giá nhu cầu': 's-assess',
    'Đề xuất': 's-propose', 'Đàm phán': 's-negotiate', 'Chốt deal': 's-closed',
    'Từ chối': 's-rejected', 'Ngừng theo dõi': 's-inactive',
};
const STATUS_COLORS = {
    'Tiếp cận': '#1B3B8E', 'Đánh giá nhu cầu': '#2E55B7',
    'Đề xuất': '#E5007D', 'Đàm phán': '#B8006A',
    'Chốt deal': '#1B3B8E',
    'Từ chối': '#94A3B8', 'Ngừng theo dõi': '#CBD5E1',
};

// ===== LA (Life Assured) STATUS =====
const LA_STATUSES = ['Chưa nộp', 'Đã nộp HSYCBH', 'Đang thẩm định', 'Cần bổ sung', 'Đã duyệt', 'Phát hành HĐ'];
const LA_STATUS_COLORS = {
    'Chưa nộp': '#94A3B8', 'Đã nộp HSYCBH': '#1B3B8E', 'Đang thẩm định': '#2E55B7',
    'Cần bổ sung': '#E5007D', 'Đã duyệt': '#4A6DC9', 'Phát hành HĐ': '#1B3B8E',
};

// ===== MOCK LEADS (Enterprises) =====
const MOCK_LEADS = [
    { id: 'KH001', company: 'Công ty CP Đầu tư ABC', taxCode: '0101234567', representative: 'Trần Văn Minh', position: 'Giám đốc nhân sự', phone: '0912345678', phone2: '0912345999', email: 'minh.tv@abc.vn', address: 'Tầng 12, Tòa Landmark, Q. Cầu Giấy, Hà Nội', industry: 'Công nghệ thông tin', employees: 150, revenue: '50-100 tỷ', foundedYear: 2015, website: 'abc-tech.vn', rating: 4, nextFollowUp: '2026-04-18', premiumEstimate: 450000000, contractValue: 0, assignedTo: 'Nguyễn Hải Đăng', status: 'Đánh giá nhu cầu', source: 'Giới thiệu', createdAt: '2026-04-08', notes: 'Khách quan tâm gói bảo hiểm nhóm cho nhân viên.' },
    { id: 'KH002', company: 'Tập đoàn XYZ Holdings', taxCode: '0107654321', representative: 'Nguyễn Thị Lan', position: 'Phó TGĐ', phone: '0987654321', phone2: '0287654000', email: 'lan.nt@xyzholdings.com.vn', address: '56 Nguyễn Huệ, Q.1, TP.HCM', industry: 'Bất động sản', employees: 500, revenue: '500-1000 tỷ', foundedYear: 2008, website: 'xyzholdings.com.vn', rating: 5, nextFollowUp: '2026-04-17', premiumEstimate: 1200000000, contractValue: 850000000, assignedTo: 'Lê Thị Hương', status: 'Đàm phán', source: 'Website', createdAt: '2026-04-05', notes: 'Đang thương lượng gói An Vui Trọn Đời cho ban lãnh đạo.' },
    { id: 'KH003', company: 'Công ty TNHH Sản xuất Hoàng Long', taxCode: '0102233445', representative: 'Phạm Hoàng Long', position: 'Tổng Giám đốc', phone: '0909123456', phone2: '', email: 'long.ph@hoanglong.vn', address: '99 Đại Cồ Việt, Q. Hai Bà Trưng, Hà Nội', industry: 'Sản xuất', employees: 320, revenue: '200-500 tỷ', foundedYear: 2003, website: 'hoanglong.vn', rating: 3, nextFollowUp: '2026-04-20', premiumEstimate: 800000000, contractValue: 0, assignedTo: 'Nguyễn Hải Đăng', status: 'Tiếp cận', source: 'Triển lãm', createdAt: '2026-04-09', notes: '' },
    { id: 'KH004', company: 'Ngân hàng TMCP Phát Triển', taxCode: '0103344556', representative: 'Lê Minh Đức', position: 'Giám đốc HCNS', phone: '0903456789', phone2: '02435678000', email: 'duc.lm@phattrienbank.vn', address: '180 Trần Hưng Đạo, Q. Hoàn Kiếm, Hà Nội', industry: 'Tài chính - Ngân hàng', employees: 2000, revenue: 'Trên 1000 tỷ', foundedYear: 1996, website: 'phattrienbank.vn', rating: 5, nextFollowUp: '', premiumEstimate: 2500000000, contractValue: 850000000, assignedTo: 'Lê Thị Hương', status: 'Chốt deal', source: 'Đối tác', createdAt: '2026-03-15', notes: 'Đã ký HĐ bảo hiểm nhóm 500 NV.' },
    { id: 'KH005', company: 'Công ty Vận tải Đông Á', taxCode: '0104455667', representative: 'Vũ Thị Hương', position: 'Trưởng phòng HC', phone: '0918765432', phone2: '', email: 'huong.vt@dongalogistics.vn', address: '27 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội', industry: 'Vận tải - Logistics', employees: 80, revenue: '20-50 tỷ', foundedYear: 2018, website: '', rating: 2, nextFollowUp: '2026-04-22', premiumEstimate: 200000000, contractValue: 0, assignedTo: 'Trần Minh Quân', status: 'Tiếp cận', source: 'Cold call', createdAt: '2026-04-07', notes: 'Đã gọi lần 1, hẹn gặp tuần sau.' },
    { id: 'KH006', company: 'Tập đoàn Giáo dục Sunrise', taxCode: '0105566778', representative: 'Đỗ Quang Huy', position: 'Chủ tịch HĐQT', phone: '0935678901', phone2: '0935678902', email: 'huy.dq@sunrise.edu.vn', address: '12 Lý Thường Kiệt, Q. Đống Đa, Hà Nội', industry: 'Giáo dục', employees: 250, revenue: '100-200 tỷ', foundedYear: 2012, website: 'sunrise.edu.vn', rating: 4, nextFollowUp: '2026-04-19', premiumEstimate: 600000000, contractValue: 320000000, assignedTo: 'Nguyễn Hải Đăng', status: 'Đề xuất', source: 'Giới thiệu', createdAt: '2026-04-02', notes: 'Hồ sơ đã nộp, chờ underwriter duyệt.' },
    { id: 'KH007', company: 'Công ty Dược phẩm MedCare', taxCode: '0106677889', representative: 'Trần Thị Mai', position: 'Giám đốc điều hành', phone: '0941234567', phone2: '', email: 'mai.tt@medcare.vn', address: '88 Lê Lợi, Q.1, TP.HCM', industry: 'Dược phẩm', employees: 120, revenue: '100-200 tỷ', foundedYear: 2010, website: 'medcare.vn', rating: 3, nextFollowUp: '', premiumEstimate: 350000000, contractValue: 0, assignedTo: 'Trần Minh Quân', status: 'Từ chối', source: 'Website', createdAt: '2026-03-20', notes: 'Đã có đối tác bảo hiểm khác.' },
    { id: 'KH008', company: 'Công ty XD Hòa Bình', taxCode: '0107788990', representative: 'Ngô Văn Thắng', position: 'Phó GĐ', phone: '0956789012', phone2: '0956789013', email: 'thang.nv@hoabinhxd.vn', address: '45 Phạm Hùng, Q. Nam Từ Liêm, Hà Nội', industry: 'Xây dựng', employees: 400, revenue: '200-500 tỷ', foundedYear: 2005, website: 'hoabinhxd.vn', rating: 4, nextFollowUp: '2026-04-21', premiumEstimate: 950000000, contractValue: 0, assignedTo: 'Lê Thị Hương', status: 'Đánh giá nhu cầu', source: 'Sự kiện', createdAt: '2026-04-06', notes: 'Quan tâm gói Phụ Nữ Tỏa Sáng cho nhân viên nữ.' },
    { id: 'KH009', company: 'Tổng công ty Du lịch Việt', taxCode: '0108899001', representative: 'Bùi Thị Ngọc', position: 'Trưởng ban nhân sự', phone: '0967890123', phone2: '', email: 'ngoc.bt@vietnamtourism.vn', address: '33 Hai Bà Trưng, Q.1, TP.HCM', industry: 'Du lịch - Dịch vụ', employees: 180, revenue: '50-100 tỷ', foundedYear: 2000, website: 'vietnamtourism.vn', rating: 3, nextFollowUp: '2026-04-23', premiumEstimate: 500000000, contractValue: 0, assignedTo: 'Trần Minh Quân', status: 'Tiếp cận', source: 'Referral', createdAt: '2026-04-10', notes: '' },
    { id: 'KH010', company: 'Công ty Thực phẩm Tươi Sạch', taxCode: '0109900112', representative: 'Hoàng Minh Tuấn', position: 'Giám đốc', phone: '0978901234', phone2: '', email: 'tuan.hm@tuoisach.vn', address: '10 Nguyễn Văn Linh, Q. Bình Chánh, TP.HCM', industry: 'Thực phẩm', employees: 90, revenue: '10-20 tỷ', foundedYear: 2020, website: '', rating: 1, nextFollowUp: '', premiumEstimate: 120000000, contractValue: 0, assignedTo: 'Nguyễn Hải Đăng', status: 'Ngừng theo dõi', source: 'Cold call', createdAt: '2026-02-28', notes: 'Doanh nghiệp nhỏ, chưa có nhu cầu.' },
];

// ===== STAKEHOLDERS (per enterprise) =====
const MOCK_STAKEHOLDERS = {
    'KH001': [
        { name: 'Trần Văn Minh', role: 'HR Manager', phone: '0912345678', email: 'minh.tv@abc.vn', isPrimary: true },
        { name: 'Lê Hồng Phúc', role: 'CFO', phone: '0912345000', email: 'phuc.lh@abc.vn', isPrimary: false },
    ],
    'KH002': [
        { name: 'Nguyễn Thị Lan', role: 'Phó TGĐ', phone: '0987654321', email: 'lan.nt@xyzholdings.com.vn', isPrimary: true },
        { name: 'Trần Minh Tuấn', role: 'CHRO', phone: '0987654000', email: 'tuan.tm@xyzholdings.com.vn', isPrimary: false },
        { name: 'Vũ Thế Anh', role: 'Người giới thiệu', phone: '0901234567', email: '', isPrimary: false },
    ],
    'KH004': [
        { name: 'Lê Minh Đức', role: 'GĐ HCNS', phone: '0903456789', email: 'duc.lm@phattrienbank.vn', isPrimary: true },
        { name: 'Nguyễn Hà My', role: 'Trưởng phòng NS', phone: '0903456000', email: 'my.nh@phattrienbank.vn', isPrimary: false },
        { name: 'Phạm Văn Bình', role: 'Phó TGĐ', phone: '0903400000', email: 'binh.pv@phattrienbank.vn', isPrimary: false },
    ],
    'KH006': [
        { name: 'Đỗ Quang Huy', role: 'Chủ tịch HĐQT', phone: '0935678901', email: 'huy.dq@sunrise.edu.vn', isPrimary: true },
        { name: 'Trần Thanh Hà', role: 'HR Director', phone: '0935678000', email: 'ha.tt@sunrise.edu.vn', isPrimary: false },
    ],
};

// ===== LA LIST (Life Assured per enterprise) =====
const MOCK_LA_LIST = {
    'KH004': [
        { id: 'LA001', name: 'Nguyễn Văn An', dob: '1985-03-12', position: 'Nhân viên', product: 'An Vui Trọn Đời', sumAssured: 500000000, premium: 1500000, status: 'Phát hành HĐ' },
        { id: 'LA002', name: 'Trần Thị Bích', dob: '1990-07-20', position: 'Trưởng phòng', product: 'Phụ Nữ Tỏa Sáng', sumAssured: 800000000, premium: 2000000, status: 'Phát hành HĐ' },
        { id: 'LA003', name: 'Lê Hoàng Cu', dob: '1988-11-05', position: 'Phó phòng', product: 'An Vui Trọn Đời', sumAssured: 500000000, premium: 1500000, status: 'Đã duyệt' },
        { id: 'LA004', name: 'Phạm Minh Đức', dob: '1992-01-30', position: 'Nhân viên', product: 'Sống Khỏe Vẹn Tròn', sumAssured: 300000000, premium: 1200000, status: 'Đang thẩm định' },
        { id: 'LA005', name: 'Vũ Thị Em', dob: '1995-09-15', position: 'Nhân viên', product: 'An Vui Trọn Đời', sumAssured: 500000000, premium: 1500000, status: 'Đã nộp HSYCBH' },
    ],
    'KH002': [
        { id: 'LA006', name: 'Hoàng Anh Tuấn', dob: '1980-05-22', position: 'Ban TGĐ', product: 'Đầu Tư Thông Thái', sumAssured: 2000000000, premium: 5000000, status: 'Đang thẩm định' },
        { id: 'LA007', name: 'Ngô Thanh Hương', dob: '1987-12-01', position: 'GĐ Kinh doanh', product: 'An Vui Trọn Đời', sumAssured: 1000000000, premium: 3000000, status: 'Chưa nộp' },
        { id: 'LA008', name: 'Bùi Đình Khoa', dob: '1983-08-14', position: 'GĐ Tài chính', product: 'An Vui Trọn Đời', sumAssured: 1000000000, premium: 3000000, status: 'Cần bổ sung' },
    ],
    'KH006': [
        { id: 'LA009', name: 'Nguyễn Thị Linh', dob: '1991-04-18', position: 'Giáo viên', product: 'Phụ Nữ Tỏa Sáng', sumAssured: 500000000, premium: 2000000, status: 'Đã nộp HSYCBH' },
        { id: 'LA010', name: 'Trần Đức Mạnh', dob: '1986-10-30', position: 'Trưởng bộ môn', product: 'An Vui Trọn Đời', sumAssured: 500000000, premium: 1500000, status: 'Chưa nộp' },
    ],
};

// ===== INTERACTIONS =====
const MOCK_INTERACTIONS = {
    'KH001': [
        { type: 'Gặp mặt', date: '2026-04-09', content: 'Gặp trực tiếp tại VP khách hàng. Trình bày gói An Vui Trọn Đời.', result: 'Quan tâm, yêu cầu báo giá chi tiết.' },
        { type: 'Email', date: '2026-04-08', content: 'Gửi email giới thiệu sản phẩm bảo hiểm nhóm.', result: 'Khách xác nhận đã nhận.' },
    ],
    'KH002': [
        { type: 'Gọi điện', date: '2026-04-06', content: 'Thảo luận về quyền lợi bổ sung và điều khoản thanh toán.', result: 'Đang cân nhắc, hẹn trả lời trong tuần.' },
        { type: 'Gặp mặt', date: '2026-04-03', content: 'Trình bày proposal tại VP tập đoàn. 3 bên tham dự.', result: 'Board đồng ý về nguyên tắc.' },
    ],
    'KH005': [
        { type: 'Gọi điện', date: '2026-04-07', content: 'Cold call giới thiệu dịch vụ bảo hiểm doanh nghiệp.', result: 'Có quan tâm, hẹn gặp tuần sau.' },
    ],
};

// ===== DOCUMENTS (Biểu mẫu) =====
const MOCK_DOCUMENTS = [
    { name: 'Biểu mẫu Yêu cầu Bảo hiểm Nhóm DN', category: 'form', type: 'PDF', updated: '2026-04-01' },
    { name: 'Biểu mẫu Kê khai Sức khỏe', category: 'form', type: 'PDF', updated: '2026-03-15' },
    { name: 'Hướng dẫn SP An Vui Trọn Đời', category: 'product', type: 'PDF', updated: '2026-04-05' },
    { name: 'Bảng quyền lợi Phụ Nữ Tỏa Sáng', category: 'product', type: 'PDF', updated: '2026-04-05' },
    { name: 'Bảng so sánh các gói BH Doanh nghiệp', category: 'product', type: 'XLSX', updated: '2026-03-20' },
    { name: 'Quy trình Phát hành HĐ Doanh nghiệp', category: 'process', type: 'PDF', updated: '2026-04-01' },
    { name: 'Quy trình Giải quyết Quyền lợi BH', category: 'process', type: 'PDF', updated: '2026-03-10' },
    { name: 'Hướng dẫn sử dụng M-Bro CRM', category: 'training', type: 'PDF', updated: '2026-04-08' },
    { name: 'Tài liệu đào tạo: Kỹ năng bán BH DN', category: 'training', type: 'PPTX', updated: '2026-03-28' },
    { name: 'Biểu mẫu Thay đổi thông tin HĐ', category: 'form', type: 'PDF', updated: '2026-02-15' },
];

// ===== PRODUCTS + RECOMMENDATION RULES =====
const PRODUCTS = [
    { id: 'P1', name: 'An Vui Trọn Đời', desc: 'Bảo vệ toàn diện + tích lũy đầu tư', basePremium: 1500000, tags: ['bảo vệ', 'tích lũy', 'toàn diện'] },
    { id: 'P2', name: 'Phụ Nữ Tỏa Sáng', desc: 'Giải pháp bảo hiểm dành riêng cho phụ nữ', basePremium: 2000000, tags: ['phụ nữ', 'sức khỏe', 'phúc lợi'] },
    { id: 'P3', name: 'Sống Khỏe Vẹn Tròn', desc: 'Bảo hiểm sức khỏe + bệnh hiểm nghèo', basePremium: 1200000, tags: ['sức khỏe', 'bệnh hiểm nghèo', 'y tế'] },
    { id: 'P4', name: 'Đầu Tư Thông Thái', desc: 'Bảo hiểm liên kết đầu tư linh hoạt', basePremium: 3000000, tags: ['đầu tư', 'ban lãnh đạo', 'cao cấp'] },
];

const PRODUCT_RULES = [
    { need: 'Bảo vệ toàn diện', target: 'Nhân viên', products: ['P1', 'P3'] },
    { need: 'Phúc lợi phụ nữ', target: 'HR/Phúc lợi', products: ['P2'] },
    { need: 'Sức khỏe & y tế', target: 'Nhân viên', products: ['P3'] },
    { need: 'Đầu tư & tích lũy', target: 'Ban lãnh đạo', products: ['P4', 'P1'] },
    { need: 'Gói toàn diện DN', target: 'Toàn bộ DN', products: ['P1', 'P2', 'P3'] },
];

// ===== SALES TEAM =====
const SALES_TEAM = [
    { name: 'Nguyễn Hải Đăng', role: 'Senior Sales', avatar: 'NHĐ' },
    { name: 'Lê Thị Hương', role: 'Sales Manager', avatar: 'LTH' },
    { name: 'Trần Minh Quân', role: 'Sales Executive', avatar: 'TMQ' },
];

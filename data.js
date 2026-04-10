/**
 * M-Bro CRM — Mock Data Layer
 * Realistic sample data for all modules
 */

const MOCK_LEADS = [
    { id: 'KH001', company: 'Công ty CP Đầu tư ABC', taxCode: '0101234567', representative: 'Trần Văn Minh', phone: '0912345678', email: 'minh.tv@abc.vn', address: 'Tầng 12, Tòa Landmark, Q. Cầu Giấy, Hà Nội', industry: 'Công nghệ thông tin', employees: 150, status: 'Quan tâm', source: 'Giới thiệu', createdAt: '2026-04-08', notes: 'Khách quan tâm gói bảo hiểm nhóm cho nhân viên.' },
    { id: 'KH002', company: 'Tập đoàn XYZ Holdings', taxCode: '0107654321', representative: 'Nguyễn Thị Lan', phone: '0987654321', email: 'lan.nt@xyzholdings.com.vn', address: '56 Nguyễn Huệ, Q.1, TP.HCM', industry: 'Bất động sản', employees: 500, status: 'Đang đàm phán', source: 'Website', createdAt: '2026-04-05', notes: 'Đang thương lượng gói An Vui Trọn Đời cho ban lãnh đạo.' },
    { id: 'KH003', company: 'Công ty TNHH Sản xuất Hoàng Long', taxCode: '0102233445', representative: 'Phạm Hoàng Long', phone: '0909123456', email: 'long.ph@hoanglong.vn', address: '99 Đại Cồ Việt, Q. Hai Bà Trưng, Hà Nội', industry: 'Sản xuất', employees: 320, status: 'Mới', source: 'Triển lãm', createdAt: '2026-04-09', notes: '' },
    { id: 'KH004', company: 'Ngân hàng TMCP Phát Triển', taxCode: '0103344556', representative: 'Lê Minh Đức', phone: '0903456789', email: 'duc.lm@phattrienbank.vn', address: '180 Trần Hưng Đạo, Q. Hoàn Kiếm, Hà Nội', industry: 'Tài chính - Ngân hàng', employees: 2000, status: 'Đã phát hành HĐ', source: 'Đối tác', createdAt: '2026-03-15', notes: 'Đã ký HĐ bảo hiểm nhóm 500 NV.' },
    { id: 'KH005', company: 'Công ty Vận tải Đông Á', taxCode: '0104455667', representative: 'Vũ Thị Hương', phone: '0918765432', email: 'huong.vt@dongalogistics.vn', address: '27 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội', industry: 'Vận tải - Logistics', employees: 80, status: 'Đang liên hệ', source: 'Cold call', createdAt: '2026-04-07', notes: 'Đã gọi lần 1, hẹn gặp tuần sau.' },
    { id: 'KH006', company: 'Tập đoàn Giáo dục Sunrise', taxCode: '0105566778', representative: 'Đỗ Quang Huy', phone: '0935678901', email: 'huy.dq@sunrise.edu.vn', address: '12 Lý Thường Kiệt, Q. Đống Đa, Hà Nội', industry: 'Giáo dục', employees: 250, status: 'Chờ duyệt', source: 'Giới thiệu', createdAt: '2026-04-02', notes: 'Hồ sơ đã nộp, chờ underwriter duyệt.' },
    { id: 'KH007', company: 'Công ty Dược phẩm MedCare', taxCode: '0106677889', representative: 'Trần Thị Mai', phone: '0941234567', email: 'mai.tt@medcare.vn', address: '88 Lê Lợi, Q.1, TP.HCM', industry: 'Dược phẩm', employees: 120, status: 'Từ chối', source: 'Website', createdAt: '2026-03-20', notes: 'Đã có đối tác bảo hiểm khác.' },
    { id: 'KH008', company: 'Công ty XD Hòa Bình', taxCode: '0107788990', representative: 'Ngô Văn Thắng', phone: '0956789012', email: 'thang.nv@hoabinhxd.vn', address: '45 Phạm Hùng, Q. Nam Từ Liêm, Hà Nội', industry: 'Xây dựng', employees: 400, status: 'Quan tâm', source: 'Sự kiện', createdAt: '2026-04-06', notes: 'Quan tâm gói Phụ Nữ Tỏa Sáng cho nhân viên nữ.' },
    { id: 'KH009', company: 'Tổng công ty Du lịch Việt', taxCode: '0108899001', representative: 'Bùi Thị Ngọc', phone: '0967890123', email: 'ngoc.bt@vietnamtourism.vn', address: '33 Hai Bà Trưng, Q.1, TP.HCM', industry: 'Du lịch - Dịch vụ', employees: 180, status: 'Mới', source: 'Referral', createdAt: '2026-04-10', notes: '' },
    { id: 'KH010', company: 'Công ty Thực phẩm Tươi Sạch', taxCode: '0109900112', representative: 'Hoàng Minh Tuấn', phone: '0978901234', email: 'tuan.hm@tuoisach.vn', address: '10 Nguyễn Văn Linh, Q. Bình Chánh, TP.HCM', industry: 'Thực phẩm', employees: 90, status: 'Ngừng theo dõi', source: 'Cold call', createdAt: '2026-02-28', notes: 'Doanh nghiệp nhỏ, chưa có nhu cầu.' },
];

const MOCK_INTERACTIONS = {
    'KH001': [
        { type: 'Gặp mặt', date: '2026-04-09', content: 'Gặp trực tiếp tại VP khách hàng. Trình bày gói An Vui Trọn Đời.', result: 'Quan tâm, yêu cầu báo giá chi tiết.' },
        { type: 'Email', date: '2026-04-08', content: 'Gửi email giới thiệu sản phẩm bảo hiểm nhóm.', result: 'Khách xác nhận đã nhận.' },
    ],
    'KH002': [
        { type: 'Gọi điện', date: '2026-04-06', content: 'Thảo luận về quyền lợi bổ sung và điều khoản thanh toán.', result: 'Đang cân nhắc, hẹn trả lời trong tuần.' },
        { type: 'Gặp mặt', date: '2026-04-03', content: 'Trình bày proposal tại VP tập đoàn. 3 bên tham dự.', result: 'Board đồng ý về nguyên tắc.' },
        { type: 'Email', date: '2026-04-01', content: 'Gửi tài liệu sản phẩm + bảng so sánh quyền lợi.', result: 'Đã chuyển cho bộ phận nhân sự review.' },
    ],
    'KH005': [
        { type: 'Gọi điện', date: '2026-04-07', content: 'Cold call giới thiệu dịch vụ bảo hiểm doanh nghiệp.', result: 'Có quan tâm, hẹn gặp tuần sau.' },
    ],
};

const MOCK_NEWS = [
    { id: 1, title: 'MB Life nhận bằng khen về đóng góp an sinh xã hội 2025', category: 'Nội bộ', date: '2026-04-09', excerpt: 'UBND Thành phố Hà Nội tặng bằng khen cho MB Life về thành tích đóng góp an sinh xã hội năm 2025.', color: '#0068B7' },
    { id: 2, title: 'Ra mắt sản phẩm "Phụ Nữ Tỏa Sáng" — Bảo vệ toàn diện cho phụ nữ hiện đại', category: 'Sản phẩm', date: '2026-04-05', excerpt: 'Gói giải pháp bảo hiểm mới kết hợp các quyền lợi ưu việt dành riêng cho phụ nữ.', color: '#E51937' },
    { id: 3, title: 'Hội nghị Tư vấn viên Xuất sắc Q1/2026', category: 'Sự kiện', date: '2026-04-01', excerpt: 'Vinh danh Top 50 tư vấn viên có thành tích bán hàng xuất sắc nhất quý 1 năm 2026.', color: '#22C55E' },
    { id: 4, title: 'Đào tạo: Kỹ năng tư vấn bảo hiểm doanh nghiệp nâng cao', category: 'Đào tạo', date: '2026-03-28', excerpt: 'Khóa đào tạo 2 ngày về kỹ năng tiếp cận và tư vấn cho khách hàng doanh nghiệp lớn.', color: '#F59E0B' },
    { id: 5, title: 'Cập nhật quy trình phát hành hợp đồng điện tử', category: 'Nội bộ', date: '2026-03-22', excerpt: 'Từ 01/04/2026, toàn bộ hợp đồng sẽ được phát hành dạng điện tử thông qua M-Bro CRM.', color: '#8B5CF6' },
    { id: 6, title: 'Chiến dịch "Bảo vệ gia đình Việt" — Q2/2026', category: 'Sản phẩm', date: '2026-03-18', excerpt: 'Chương trình ưu đãi phí bảo hiểm lên đến 20% cho các hợp đồng ký trong Q2/2026.', color: '#0891B2' },
];

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

const MOCK_CONTRACTS = [
    { id: 'HD001', leadId: 'KH004', company: 'Ngân hàng TMCP Phát Triển', product: 'An Vui Trọn Đời', premium: 850000000, status: 'Đã phát hành', effectiveDate: '2026-04-01', term: 5, insuredCount: 500, createdAt: '2026-03-25' },
    { id: 'HD002', leadId: 'KH006', company: 'Tập đoàn Giáo dục Sunrise', product: 'Phụ Nữ Tỏa Sáng', premium: 320000000, status: 'Chờ duyệt', effectiveDate: '2026-05-01', term: 3, insuredCount: 120, createdAt: '2026-04-02' },
];

const PRODUCTS = [
    { id: 'P1', name: 'An Vui Trọn Đời', desc: 'Bảo vệ toàn diện + tích lũy đầu tư', basePremium: 1500000 },
    { id: 'P2', name: 'Phụ Nữ Tỏa Sáng', desc: 'Giải pháp bảo hiểm dành riêng cho phụ nữ', basePremium: 2000000 },
    { id: 'P3', name: 'Sống Khỏe Vẹn Tròn', desc: 'Bảo hiểm sức khỏe + bệnh hiểm nghèo', basePremium: 1200000 },
    { id: 'P4', name: 'Đầu Tư Thông Thái', desc: 'Bảo hiểm liên kết đầu tư linh hoạt', basePremium: 3000000 },
];

const STATUS_MAP = {
    'Mới': 's-new',
    'Đang liên hệ': 's-contacting',
    'Quan tâm': 's-interested',
    'Đang đàm phán': 's-negotiating',
    'Chờ duyệt': 's-pending',
    'Đã phát hành HĐ': 's-issued',
    'Từ chối': 's-rejected',
    'Ngừng theo dõi': 's-inactive',
};

const STATUS_COLORS = {
    'Mới': '#3B82F6',
    'Đang liên hệ': '#6DD5F9',
    'Quan tâm': '#22C55E',
    'Đang đàm phán': '#F59E0B',
    'Chờ duyệt': '#8B5CF6',
    'Đã phát hành HĐ': '#059669',
    'Từ chối': '#EF4444',
    'Ngừng theo dõi': '#94A3B8',
};

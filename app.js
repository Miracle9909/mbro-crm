/**
 * M-Bro CRM v2.0 — Main Application Logic
 * Enterprise-centric: Stakeholders, LA/HSYCBH, Sales Pipeline, Product Suggestions
 */
(function () {
    'use strict';

    let leads = [];
    let currentLead = null;

    // ===== INIT =====
    function init() {
        const saved = localStorage.getItem('mbro_leads_v2');
        leads = saved ? JSON.parse(saved) : [...MOCK_LEADS];
        if (localStorage.getItem('mbro_loggedIn')) {
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            navigateTo('dashboard');
        }
    }
    init();

    function save() {
        localStorage.setItem('mbro_leads_v2', JSON.stringify(leads));
    }

    function fmt(n) {
        return new Intl.NumberFormat('vi-VN').format(n);
    }

    // ===== LOGIN =====
    function handleLogin(e) {
        e.preventDefault();
        localStorage.setItem('mbro_loggedIn', 'true');
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        navigateTo('dashboard');
        return false;
    }

    function handleLogout() {
        localStorage.removeItem('mbro_loggedIn');
        location.reload();
    }

    // ===== NAVIGATION =====
    const PAGE_TITLES = { dashboard: 'Trang chủ', leads: 'KHTN', 'lead-detail': 'Chi tiết KHTN', sales: 'Quản lý bán hàng', documents: 'Biểu mẫu' };

    function navigateTo(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');
        document.getElementById('pageTitle').textContent = PAGE_TITLES[page] || page;
        document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.toggle('active', n.dataset.page === page));
        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('active');
        // Render page content
        if (page === 'dashboard') updateDashboard();
        if (page === 'leads') renderLeadsTable();
        if (page === 'sales') renderSalesPage();
        if (page === 'documents') renderDocuments();
    }

    function toggleSidebar() {
        const sb = document.getElementById('sidebar');
        const ov = document.getElementById('sidebarOverlay');
        sb.classList.toggle('open');
        ov.classList.toggle('active');
    }

    // ===== DASHBOARD (Simplified) =====
    function updateDashboard() {
        updateWelcomeHero();
        updateLeadBadge();
        renderRecentLeads();
        // KPI
        document.getElementById('totalLeads').textContent = leads.length;
        document.getElementById('dealsClosed').textContent = leads.filter(l => l.status === 'Chốt deal').length;
        const totalPremium = leads.reduce((s, l) => s + (l.premiumEstimate || 0), 0);
        document.getElementById('monthRevenue').textContent = '₫' + fmt(totalPremium);
        // Agenda
        document.getElementById('agendaNew').textContent = leads.filter(l => l.status === 'Tiếp cận').length;
        document.getElementById('agendaFollowup').textContent = leads.filter(l => l.nextFollowUp).length;
        document.getElementById('agendaPipeline').textContent = leads.filter(l => l.status === 'Đàm phán').length;
    }

    function updateWelcomeHero() {
        const now = new Date();
        const h = now.getHours();
        let greeting = h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
        document.getElementById('welcomeGreeting').textContent = greeting + '! 👋';
        document.getElementById('welcomeDate').textContent =
            `${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][now.getDay()]}, ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    }

    function updateLeadBadge() {
        const badge = document.getElementById('leadBadge');
        const count = leads.filter(l => l.status === 'Tiếp cận' || l.status === 'Đánh giá nhu cầu').length;
        badge.textContent = count;
        badge.style.display = count ? '' : 'none';
    }

    function renderRecentLeads() {
        const tbody = document.querySelector('#recentLeadsTable tbody');
        const recent = [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
        tbody.innerHTML = recent.map(l => `<tr>
            <td>${l.id}</td><td>${l.company}</td><td>${l.representative}</td>
            <td><span class="status-badge ${STATUS_MAP[l.status] || ''}">${l.status}</span></td>
            <td>${formatDate(l.createdAt)}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="viewLead('${l.id}')">Xem</button></td>
        </tr>`).join('');
    }

    // ===== LEADS TABLE =====
    function renderLeadsTable(filtered) {
        const data = filtered || leads;
        const tbody = document.getElementById('leadsTableBody');
        tbody.innerHTML = data.map(l => `<tr>
            <td>${l.id}</td>
            <td><strong>${l.company}</strong></td>
            <td>${l.representative}</td>
            <td>${l.phone}</td>
            <td><span class="status-badge ${STATUS_MAP[l.status] || ''}">${l.status}</span></td>
            <td>${formatDate(l.createdAt)}</td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="viewLead('${l.id}')">Xem</button>
                <button class="btn btn-ghost btn-sm" onclick="deleteLead('${l.id}')" style="color:var(--mb-error)">Xóa</button>
            </td>
        </tr>`).join('');
        document.getElementById('leadsInfo').textContent = `Hiển thị ${data.length} KHTN`;
    }

    function filterLeads() {
        const q = document.getElementById('leadSearch').value.toLowerCase();
        const s = document.getElementById('leadStatusFilter').value;
        const filtered = leads.filter(l =>
            (!q || l.company.toLowerCase().includes(q) || l.representative.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)) &&
            (!s || l.status === s)
        );
        renderLeadsTable(filtered);
    }

    function deleteLead(id) {
        if (!confirm('Xóa doanh nghiệp này?')) return;
        leads = leads.filter(l => l.id !== id);
        save();
        renderLeadsTable();
        updateDashboard();
        showToast('Đã xóa doanh nghiệp');
    }

    // ===== LEAD DETAIL =====
    function viewLead(id) {
        currentLead = leads.find(l => l.id === id);
        if (!currentLead) return;
        navigateTo('lead-detail');

        document.getElementById('detailCompanyName').textContent = currentLead.company;
        const statusEl = document.getElementById('detailStatus');
        statusEl.textContent = currentLead.status;
        statusEl.className = 'status-badge ' + (STATUS_MAP[currentLead.status] || '');

        // Info grid
        const grid = document.getElementById('leadInfoGrid');
        const stars = '★'.repeat(currentLead.rating || 0) + '☆'.repeat(5 - (currentLead.rating || 0));
        grid.innerHTML = `
            <div class="info-item"><span class="info-label">MÃ KH</span><span class="info-value">${currentLead.id}</span></div>
            <div class="info-item"><span class="info-label">MÃ SỐ THUẾ</span><span class="info-value">${currentLead.taxCode}</span></div>
            <div class="info-item"><span class="info-label">NGƯỜI ĐẠI DIỆN</span><span class="info-value">${currentLead.representative}</span></div>
            <div class="info-item"><span class="info-label">CHỨC VỤ</span><span class="info-value">${currentLead.position || '—'}</span></div>
            <div class="info-item"><span class="info-label">ĐIỆN THOẠI</span><span class="info-value">${currentLead.phone}</span></div>
            <div class="info-item"><span class="info-label">LIÊN HỆ PHỤ</span><span class="info-value">${currentLead.phone2 || '—'}</span></div>
            <div class="info-item"><span class="info-label">EMAIL</span><span class="info-value">${currentLead.email}</span></div>
            <div class="info-item"><span class="info-label">WEBSITE</span><span class="info-value">${currentLead.website || '—'}</span></div>
            <div class="info-item"><span class="info-label">NGÀNH NGHỀ</span><span class="info-value">${currentLead.industry}</span></div>
            <div class="info-item"><span class="info-label">SỐ NHÂN VIÊN</span><span class="info-value">${currentLead.employees}</span></div>
            <div class="info-item"><span class="info-label">DOANH THU/NĂM</span><span class="info-value">${currentLead.revenue || '—'}</span></div>
            <div class="info-item"><span class="info-label">NĂM THÀNH LẬP</span><span class="info-value">${currentLead.foundedYear || '—'}</span></div>
            <div class="info-item"><span class="info-label">NGUỒN</span><span class="info-value">${currentLead.source}</span></div>
            <div class="info-item"><span class="info-label">NGƯỜI PHỤ TRÁCH</span><span class="info-value">${currentLead.assignedTo || '—'}</span></div>
            <div class="info-item"><span class="info-label">ĐÁNH GIÁ</span><span class="info-value" style="color:#F59E0B">${stars}</span></div>
            <div class="info-item"><span class="info-label">LỊCH FOLLOW-UP</span><span class="info-value" style="color:var(--mb-primary)">${currentLead.nextFollowUp ? formatDate(currentLead.nextFollowUp) : '—'}</span></div>
            <div class="info-item"><span class="info-label">PHÍ BH ƯỚC TÍNH</span><span class="info-value" style="color:var(--mb-success);font-weight:700">₫${fmt(currentLead.premiumEstimate || 0)}</span></div>
            <div class="info-item"><span class="info-label">GIÁ TRỊ HĐ</span><span class="info-value">${currentLead.contractValue ? '₫' + fmt(currentLead.contractValue) : '—'}</span></div>
            <div class="info-item" style="grid-column:1/-1"><span class="info-label">ĐỊA CHỈ</span><span class="info-value">${currentLead.address}</span></div>
        `;

        renderInteractions();
        renderStakeholders();
        renderLAList();
        renderSuggestions();
        renderPayment();

        // Reset to first tab
        switchDetailTab('info', document.querySelector('.detail-tabs .tab-btn'));
    }

    // ===== STAKEHOLDERS TAB =====
    function renderStakeholders() {
        if (!currentLead) return;
        const list = MOCK_STAKEHOLDERS[currentLead.id] || [];
        const container = document.getElementById('stakeholdersList');
        if (!list.length) {
            container.innerHTML = '<p style="color:var(--mb-muted);text-align:center;padding:40px">Chưa có stakeholder nào. Nhấn "+ Thêm stakeholder" để bắt đầu.</p>';
            return;
        }
        container.innerHTML = `<div class="stakeholder-grid">${list.map(s => `
            <div class="stakeholder-card ${s.isPrimary ? 'stakeholder-primary' : ''}">
                <div class="stakeholder-name">${s.name} ${s.isPrimary ? '<span style="color:var(--mb-primary);font-size:11px">(Chính)</span>' : ''}</div>
                <div class="stakeholder-role">${s.role}</div>
                <div class="stakeholder-contact">
                    <span>📞 ${s.phone}</span>
                    ${s.email ? `<span>✉️ ${s.email}</span>` : ''}
                </div>
            </div>
        `).join('')}</div>`;
    }

    function openAddStakeholder() {
        document.getElementById('modalTitle').textContent = 'Thêm Stakeholder';
        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="return saveStakeholder(event)">
                <div class="form-group"><label>Họ tên</label><input type="text" id="shName" required></div>
                <div class="form-group"><label>Vai trò</label><input type="text" id="shRole" placeholder="VD: HR Manager, CFO" required></div>
                <div class="form-group"><label>Điện thoại</label><input type="text" id="shPhone" required></div>
                <div class="form-group"><label>Email</label><input type="email" id="shEmail"></div>
                <div class="form-group"><label class="checkbox-label"><input type="checkbox" id="shPrimary"> Liên hệ chính</label></div>
                <button type="submit" class="btn btn-primary btn-full">Lưu</button>
            </form>`;
        document.getElementById('modalOverlay').classList.remove('hidden');
    }

    function saveStakeholder(e) {
        e.preventDefault();
        if (!currentLead) return false;
        if (!MOCK_STAKEHOLDERS[currentLead.id]) MOCK_STAKEHOLDERS[currentLead.id] = [];
        MOCK_STAKEHOLDERS[currentLead.id].push({
            name: document.getElementById('shName').value,
            role: document.getElementById('shRole').value,
            phone: document.getElementById('shPhone').value,
            email: document.getElementById('shEmail').value,
            isPrimary: document.getElementById('shPrimary').checked,
        });
        closeModal();
        renderStakeholders();
        showToast('Đã thêm stakeholder');
        return false;
    }

    // ===== LA LIST TAB =====
    function renderLAList() {
        if (!currentLead) return;
        const list = MOCK_LA_LIST[currentLead.id] || [];
        const container = document.getElementById('laListContent');
        if (!list.length) {
            container.innerHTML = `<p style="color:var(--mb-muted);text-align:center;padding:20px">Chưa có nhân viên/LA nào.</p>
                <div class="la-import-banner">📥 Import danh sách từ Excel để bắt đầu</div>`;
            return;
        }
        // Summary bar
        const statusCounts = {};
        list.forEach(la => { statusCounts[la.status] = (statusCounts[la.status] || 0) + 1; });
        const summaryHTML = Object.entries(statusCounts).map(([s, c]) =>
            `<span class="la-status" style="background:${LA_STATUS_COLORS[s]}20;color:${LA_STATUS_COLORS[s]}">${s}: ${c}</span>`
        ).join(' ');

        container.innerHTML = `
            <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">${summaryHTML}</div>
            <div class="table-responsive">
                <table class="data-table la-table">
                    <thead><tr><th>#</th><th>Họ tên</th><th>Ngày sinh</th><th>Chức vụ</th><th>Gói BH</th><th>STBH</th><th>Phí BH</th><th>Trạng thái</th></tr></thead>
                    <tbody>${list.map((la, i) => `<tr>
                        <td>${i + 1}</td><td><strong>${la.name}</strong></td>
                        <td>${formatDate(la.dob)}</td><td>${la.position}</td>
                        <td>${la.product}</td><td>₫${fmt(la.sumAssured)}</td><td>₫${fmt(la.premium)}/năm</td>
                        <td><span class="la-status" style="background:${LA_STATUS_COLORS[la.status]}20;color:${LA_STATUS_COLORS[la.status]}">${la.status}</span></td>
                    </tr>`).join('')}</tbody>
                </table>
            </div>`;
    }

    function openAddLA() {
        document.getElementById('modalTitle').textContent = 'Thêm người được bảo hiểm (LA)';
        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="return saveLA(event)">
                <div class="form-group"><label>Họ tên</label><input type="text" id="laName" required></div>
                <div class="form-group"><label>Ngày sinh</label><input type="date" id="laDob" required></div>
                <div class="form-group"><label>Chức vụ</label><input type="text" id="laPosition" required></div>
                <div class="form-group"><label>Gói BH</label><select id="laProduct">${PRODUCTS.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}</select></div>
                <div class="form-group"><label>Số tiền BH (VNĐ)</label><input type="number" id="laSumAssured" value="500000000"></div>
                <button type="submit" class="btn btn-primary btn-full">Lưu</button>
            </form>`;
        document.getElementById('modalOverlay').classList.remove('hidden');
    }

    function saveLA(e) {
        e.preventDefault();
        if (!currentLead) return false;
        if (!MOCK_LA_LIST[currentLead.id]) MOCK_LA_LIST[currentLead.id] = [];
        const product = PRODUCTS.find(p => p.name === document.getElementById('laProduct').value);
        MOCK_LA_LIST[currentLead.id].push({
            id: 'LA' + (Date.now() % 10000),
            name: document.getElementById('laName').value,
            dob: document.getElementById('laDob').value,
            position: document.getElementById('laPosition').value,
            product: product.name,
            sumAssured: parseInt(document.getElementById('laSumAssured').value),
            premium: product.basePremium,
            status: 'Chưa nộp',
        });
        closeModal();
        renderLAList();
        showToast('Đã thêm người được bảo hiểm');
        return false;
    }

    function simulateExcelImport() {
        if (!currentLead) return;
        if (!MOCK_LA_LIST[currentLead.id]) MOCK_LA_LIST[currentLead.id] = [];
        const names = ['Nguyễn Văn Phong', 'Trần Thị Hoa', 'Lê Đình Khôi', 'Phạm Thúy An', 'Vũ Quang Minh'];
        names.forEach((name, i) => {
            MOCK_LA_LIST[currentLead.id].push({
                id: 'LA' + (Date.now() % 10000 + i),
                name, dob: `199${i}-0${i + 1}-15`, position: 'Nhân viên',
                product: PRODUCTS[i % PRODUCTS.length].name,
                sumAssured: 500000000, premium: PRODUCTS[i % PRODUCTS.length].basePremium, status: 'Chưa nộp',
            });
        });
        renderLAList();
        showToast(`Đã import ${names.length} nhân viên từ Excel`, 'success');
    }

    // ===== PRODUCT SUGGESTION TAB =====
    let selectedNeeds = [];
    function renderSuggestions() {
        const container = document.getElementById('suggestContent');
        const needsList = PRODUCT_RULES.map(r => r.need);
        container.innerHTML = `
            <div class="suggest-wizard">
                <div class="suggest-section">
                    <h4>Nhu cầu bảo vệ của doanh nghiệp</h4>
                    <div class="suggest-options" id="needOptions">
                        ${needsList.map(n => `<button class="suggest-option" onclick="toggleNeed('${n}', this)">${n}</button>`).join('')}
                    </div>
                </div>
                <div class="suggest-results" id="suggestResults">
                    <p style="color:var(--mb-muted)">Chọn nhu cầu để xem gợi ý sản phẩm phù hợp</p>
                </div>
            </div>`;
    }

    function toggleNeed(need, el) {
        el.classList.toggle('active');
        if (selectedNeeds.includes(need)) {
            selectedNeeds = selectedNeeds.filter(n => n !== need);
        } else {
            selectedNeeds.push(need);
        }
        updateSuggestions();
    }

    function updateSuggestions() {
        const container = document.getElementById('suggestResults');
        if (!selectedNeeds.length) {
            container.innerHTML = '<p style="color:var(--mb-muted)">Chọn nhu cầu để xem gợi ý sản phẩm phù hợp</p>';
            return;
        }
        const matchedProductIds = new Set();
        selectedNeeds.forEach(need => {
            const rule = PRODUCT_RULES.find(r => r.need === need);
            if (rule) rule.products.forEach(pid => matchedProductIds.add(pid));
        });
        const matched = PRODUCTS.filter(p => matchedProductIds.has(p.id));
        const icons = { P1: '🛡️', P2: '💖', P3: '🏥', P4: '📈' };
        container.innerHTML = matched.map(p => `
            <div class="suggest-product-card">
                <div class="suggest-product-icon">${icons[p.id] || '📋'}</div>
                <div class="suggest-product-info">
                    <h4>${p.name}</h4>
                    <p>${p.desc}</p>
                </div>
                <div class="suggest-product-price">₫${fmt(p.basePremium)}/người/năm</div>
            </div>
        `).join('');
    }

    // ===== INTERACTIONS =====
    function renderInteractions() {
        if (!currentLead) return;
        const list = MOCK_INTERACTIONS[currentLead.id] || [];
        const container = document.getElementById('interactionTimeline');
        if (!list.length) {
            container.innerHTML = '<p style="color:var(--mb-muted);text-align:center;padding:40px">Chưa có lịch sử tương tác.</p>';
            return;
        }
        const icons = { 'Gặp mặt': '🤝', 'Gọi điện': '📞', 'Email': '✉️' };
        container.innerHTML = list.map(i => `
            <div class="timeline-entry">
                <div class="timeline-marker">${icons[i.type] || '📌'}</div>
                <div class="timeline-content">
                    <div class="timeline-header"><strong>${i.type}</strong><span class="timeline-date">${formatDate(i.date)}</span></div>
                    <p>${i.content}</p>
                    ${i.result ? `<p class="timeline-result"><em>→ ${i.result}</em></p>` : ''}
                </div>
            </div>
        `).join('');
    }

    function openAddInteraction() {
        document.getElementById('modalTitle').textContent = 'Thêm tương tác';
        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="return saveInteraction(event)">
                <div class="form-group"><label>Loại</label><select id="intType"><option>Gặp mặt</option><option>Gọi điện</option><option>Email</option></select></div>
                <div class="form-group"><label>Nội dung</label><textarea id="intContent" rows="3" required></textarea></div>
                <div class="form-group"><label>Kết quả</label><input type="text" id="intResult"></div>
                <button type="submit" class="btn btn-primary btn-full">Lưu</button>
            </form>`;
        document.getElementById('modalOverlay').classList.remove('hidden');
    }

    function saveInteraction(e) {
        e.preventDefault();
        if (!currentLead) return false;
        if (!MOCK_INTERACTIONS[currentLead.id]) MOCK_INTERACTIONS[currentLead.id] = [];
        MOCK_INTERACTIONS[currentLead.id].unshift({
            type: document.getElementById('intType').value,
            date: new Date().toISOString().split('T')[0],
            content: document.getElementById('intContent').value,
            result: document.getElementById('intResult').value,
        });
        closeModal();
        renderInteractions();
        showToast('Đã thêm tương tác');
        return false;
    }

    // ===== DETAIL TAB SWITCH =====
    function switchDetailTab(tab, btn) {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const pane = document.getElementById('tab-' + tab);
        if (pane) pane.classList.add('active');
        if (btn) btn.classList.add('active');
    }

    // ===== ADD/EDIT LEAD =====
    function openAddLead() {
        document.getElementById('modalTitle').textContent = 'Thêm doanh nghiệp';
        document.getElementById('modalBody').innerHTML = getLeadFormHTML({});
        document.getElementById('modalOverlay').classList.remove('hidden');
    }

    function openEditLead() {
        if (!currentLead) return;
        document.getElementById('modalTitle').textContent = 'Chỉnh sửa';
        document.getElementById('modalBody').innerHTML = getLeadFormHTML(currentLead);
        document.getElementById('modalOverlay').classList.remove('hidden');
    }

    function getLeadFormHTML(data) {
        const statusOptions = ENTERPRISE_STATUSES.concat(['Từ chối', 'Ngừng theo dõi']).map(s =>
            `<option value="${s}" ${data.status === s ? 'selected' : ''}>${s}</option>`
        ).join('');
        return `<form onsubmit="return saveLead(event, '${data.id || ''}')" style="max-height:70vh;overflow-y:auto">
            <h4 style="margin-bottom:12px;color:var(--mb-primary)">Thông tin doanh nghiệp</h4>
            <div class="form-group"><label>Tên DN</label><input type="text" id="fCompany" value="${data.company || ''}" required></div>
            <div class="form-group"><label>Mã số thuế</label><input type="text" id="fTaxCode" value="${data.taxCode || ''}"></div>
            <div class="form-group"><label>Ngành nghề</label><input type="text" id="fIndustry" value="${data.industry || ''}"></div>
            <div class="form-group"><label>Số nhân viên</label><input type="number" id="fEmployees" value="${data.employees || ''}"></div>
            <div class="form-group"><label>Doanh thu/năm</label><input type="text" id="fRevenue" value="${data.revenue || ''}"></div>
            <div class="form-group"><label>Năm thành lập</label><input type="number" id="fFounded" value="${data.foundedYear || ''}"></div>
            <div class="form-group"><label>Website</label><input type="text" id="fWebsite" value="${data.website || ''}"></div>
            <div class="form-group"><label>Địa chỉ</label><input type="text" id="fAddress" value="${data.address || ''}"></div>
            <h4 style="margin:16px 0 12px;color:var(--mb-primary)">Liên hệ</h4>
            <div class="form-group"><label>Người đại diện</label><input type="text" id="fRep" value="${data.representative || ''}" required></div>
            <div class="form-group"><label>Chức vụ</label><input type="text" id="fPosition" value="${data.position || ''}"></div>
            <div class="form-group"><label>Điện thoại</label><input type="text" id="fPhone" value="${data.phone || ''}" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="fEmail" value="${data.email || ''}"></div>
            <h4 style="margin:16px 0 12px;color:var(--mb-primary)">Quản lý</h4>
            <div class="form-group"><label>Trạng thái</label><select id="fStatus">${statusOptions}</select></div>
            <div class="form-group"><label>Nguồn</label><input type="text" id="fSource" value="${data.source || ''}"></div>
            <div class="form-group"><label>Người phụ trách</label><select id="fAssigned">${SALES_TEAM.map(s => `<option value="${s.name}" ${data.assignedTo === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
            <div class="form-group"><label>Phí BH ước tính (VNĐ)</label><input type="number" id="fPremium" value="${data.premiumEstimate || ''}"></div>
            <button type="submit" class="btn btn-primary btn-full" style="margin-top:16px">Lưu</button>
        </form>`;
    }

    function saveLead(e, editId) {
        e.preventDefault();
        const data = {
            company: document.getElementById('fCompany').value,
            taxCode: document.getElementById('fTaxCode').value,
            industry: document.getElementById('fIndustry').value,
            employees: parseInt(document.getElementById('fEmployees').value) || 0,
            revenue: document.getElementById('fRevenue').value,
            foundedYear: parseInt(document.getElementById('fFounded').value) || 0,
            website: document.getElementById('fWebsite').value,
            address: document.getElementById('fAddress').value,
            representative: document.getElementById('fRep').value,
            position: document.getElementById('fPosition').value,
            phone: document.getElementById('fPhone').value,
            email: document.getElementById('fEmail').value,
            status: document.getElementById('fStatus').value,
            source: document.getElementById('fSource').value,
            assignedTo: document.getElementById('fAssigned').value,
            premiumEstimate: parseInt(document.getElementById('fPremium').value) || 0,
        };
        if (editId) {
            const idx = leads.findIndex(l => l.id === editId);
            if (idx >= 0) leads[idx] = { ...leads[idx], ...data };
        } else {
            data.id = 'KH' + String(leads.length + 1).padStart(3, '0');
            data.createdAt = new Date().toISOString().split('T')[0];
            data.rating = 3; data.phone2 = ''; data.nextFollowUp = ''; data.contractValue = 0; data.notes = '';
            leads.push(data);
        }
        save();
        closeModal();
        if (editId && currentLead) viewLead(editId);
        else { navigateTo('leads'); }
        showToast(editId ? 'Đã cập nhật' : 'Đã thêm doanh nghiệp', 'success');
        return false;
    }

    // ===== STATUS UPDATE =====
    function openStatusUpdate() {
        if (!currentLead) return;
        document.getElementById('modalTitle').textContent = 'Cập nhật trạng thái';
        const allStatuses = ENTERPRISE_STATUSES.concat(['Từ chối', 'Ngừng theo dõi']);
        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="return saveStatus(event)">
                <p style="margin-bottom:16px">Chọn trạng thái mới cho <strong>${currentLead.company}</strong></p>
                <div style="display:flex;flex-direction:column;gap:8px">
                    ${allStatuses.map(s => `
                        <label class="radio-option" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border:2px solid ${currentLead.status === s ? STATUS_COLORS[s] || '#ddd' : '#E2E8F0'};border-radius:10px;cursor:pointer;transition:0.15s">
                            <input type="radio" name="newStatus" value="${s}" ${currentLead.status === s ? 'checked' : ''}>
                            <span class="status-badge ${STATUS_MAP[s] || ''}">${s}</span>
                        </label>
                    `).join('')}
                </div>
                <button type="submit" class="btn btn-primary btn-full" style="margin-top:16px">Cập nhật</button>
            </form>`;
        document.getElementById('modalOverlay').classList.remove('hidden');
    }

    function saveStatus(e) {
        e.preventDefault();
        const selected = document.querySelector('input[name="newStatus"]:checked');
        if (!selected || !currentLead) return false;
        currentLead.status = selected.value;
        save();
        closeModal();
        viewLead(currentLead.id);
        showToast('Đã cập nhật trạng thái', 'success');
        return false;
    }

    // ===== SALES MANAGEMENT PAGE =====
    function renderSalesPage() {
        renderPipelineKanban();
        renderSalesTimeline();
    }

    function renderPipelineKanban() {
        const kanban = document.getElementById('pipelineKanban');
        kanban.innerHTML = ENTERPRISE_STATUSES.map(status => {
            const items = leads.filter(l => l.status === status);
            const color = STATUS_COLORS[status];
            return `<div class="kanban-column">
                <div class="kanban-column-header">
                    <span class="kanban-column-title" style="color:${color}">${status}</span>
                    <span class="kanban-count">${items.length}</span>
                </div>
                ${items.length ? items.map(l => `
                    <div class="kanban-card" onclick="viewLead('${l.id}')">
                        <div class="kanban-card-title">${l.company}</div>
                        <div class="kanban-card-meta">
                            <span>👤 ${l.representative}</span>
                            <span>🏢 ${l.industry}</span>
                            <span>📞 ${l.assignedTo || 'Chưa giao'}</span>
                        </div>
                        ${l.premiumEstimate ? `<div class="kanban-card-amount">₫${fmt(l.premiumEstimate)}</div>` : ''}
                    </div>
                `).join('') : '<p style="color:var(--mb-muted);text-align:center;font-size:13px;padding:20px 0">Trống</p>'}
            </div>`;
        }).join('');
    }

    function renderSalesTimeline() {
        const container = document.getElementById('salesTimeline');
        const sorted = [...leads].filter(l => ENTERPRISE_STATUSES.includes(l.status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const statusIcons = { 'Tiếp cận': '🔍', 'Đánh giá nhu cầu': '📋', 'Đề xuất': '💡', 'Đàm phán': '🤝', 'Chốt deal': '✅' };
        container.innerHTML = sorted.map(l => `
            <div class="timeline-item">
                <div class="timeline-dot">${statusIcons[l.status] || '📌'}</div>
                <div class="timeline-body">
                    <h4>${l.company}</h4>
                    <p>${l.status} — ${l.assignedTo || 'Chưa giao'}</p>
                </div>
                <span class="timeline-date">${formatDate(l.createdAt)}</span>
            </div>
        `).join('');
    }

    function switchSalesView(view) {
        document.getElementById('salesPipelineView').style.display = view === 'pipeline' ? '' : 'none';
        document.getElementById('salesTimelineView').style.display = view === 'timeline' ? '' : 'none';
        document.getElementById('btnPipelineView').classList.toggle('active', view === 'pipeline');
        document.getElementById('btnTimelineView').classList.toggle('active', view === 'timeline');
    }

    // ===== PAYMENT MODULE =====
    function renderPayment() {
        if (!currentLead) return;
        const amount = currentLead.premiumEstimate || 0;
        document.getElementById('paymentContent').innerHTML = `
            <h3 style="margin-bottom:16px">Thanh toán phí bảo hiểm</h3>
            <div style="background:var(--mb-primary-light);padding:14px 20px;border-radius:var(--radius-sm);display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <span style="color:var(--mb-text-secondary)">Số tiền thanh toán</span>
                <strong style="color:var(--mb-primary);font-size:18px">₫${fmt(amount)}</strong>
            </div>
            <div class="payment-methods" id="paymentMethods">
                <div class="payment-method-card" onclick="selectPaymentMethod('bank', this)">
                    <span style="font-size:20px">🏦</span>
                    <div><strong>Chuyển khoản ngân hàng</strong><br><small style="color:var(--mb-muted)">Chuyển khoản qua MB Bank</small></div>
                </div>
                <div class="payment-method-card" onclick="selectPaymentMethod('qr', this)">
                    <span style="font-size:20px">📱</span>
                    <div><strong>QR Pay (VietQR)</strong><br><small style="color:var(--mb-muted)">Quét mã QR thanh toán</small></div>
                </div>
                <div class="payment-method-card" onclick="selectPaymentMethod('card', this)">
                    <span style="font-size:20px">💳</span>
                    <div><strong>Thẻ tín dụng / ghi nợ</strong><br><small style="color:var(--mb-muted)">Visa, Mastercard, JCB</small></div>
                </div>
            </div>
            <div id="paymentDetail"></div>`;
    }

    function selectPaymentMethod(method, el) {
        document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
        if (el) el.classList.add('selected');
        const detail = document.getElementById('paymentDetail');
        const amount = currentLead ? currentLead.premiumEstimate || 0 : 0;
        const ref = currentLead ? currentLead.id + '-' + Date.now().toString(36).toUpperCase() : 'REF';

        if (method === 'bank') {
            detail.innerHTML = `<div style="margin-top:16px;padding:20px;background:var(--mb-surface-container);border-radius:var(--radius-sm)">
                <h4 style="margin-bottom:12px">Thông tin chuyển khoản</h4>
                <p><strong>Ngân hàng:</strong> MB Bank (Ngân hàng TMCP Quân đội)</p>
                <p><strong>Số TK:</strong> 0123456789</p>
                <p><strong>Chủ TK:</strong> CTCP BẢO HIỂM NHÂN THỌ MB</p>
                <p><strong>Nội dung CK:</strong> ${ref}</p>
                <p><strong>Số tiền:</strong> ₫${fmt(amount)}</p>
                <button class="btn btn-primary" style="margin-top:16px" onclick="processPayment('bank')">Xác nhận đã chuyển khoản</button>
            </div>`;
        } else if (method === 'qr') {
            detail.innerHTML = `<div style="margin-top:16px;text-align:center">
                <h4>Quét mã QR để thanh toán</h4>
                <p style="color:var(--mb-muted);margin-bottom:16px">Mở app ngân hàng → Quét mã QR → Xác nhận thanh toán</p>
                <div style="display:inline-block;padding:16px;background:white;border-radius:var(--radius);box-shadow:var(--shadow-md)">${generateQRSVG(ref)}</div>
                <p style="color:var(--mb-primary);margin-top:8px;font-size:12px;font-weight:600">VIETQR — MB BANK</p>
                <button class="btn btn-primary" style="margin-top:16px" onclick="processPayment('qr')">Xác nhận thanh toán QR</button>
            </div>`;
        } else if (method === 'card') {
            detail.innerHTML = `<div style="margin-top:16px;padding:20px;background:var(--mb-surface-container);border-radius:var(--radius-sm);max-width:400px">
                <h4 style="margin-bottom:12px">Thông tin thẻ</h4>
                <div class="form-group"><label>Số thẻ</label><input type="text" placeholder="**** **** **** ****" maxlength="19"></div>
                <div style="display:flex;gap:12px">
                    <div class="form-group" style="flex:1"><label>MM/YY</label><input type="text" placeholder="12/28" maxlength="5"></div>
                    <div class="form-group" style="flex:1"><label>CVV</label><input type="text" placeholder="***" maxlength="3"></div>
                </div>
                <button class="btn btn-primary btn-full" onclick="processPayment('card')">Thanh toán ₫${fmt(amount)}</button>
            </div>`;
        }
    }

    function processPayment(method) {
        const detail = document.getElementById('paymentDetail');
        detail.innerHTML = '<div style="text-align:center;padding:40px"><div class="spinner"></div><p style="margin-top:12px;color:var(--mb-muted)">Đang xử lý thanh toán...</p></div>';
        setTimeout(() => {
            const methodNames = { bank: 'Chuyển khoản', qr: 'QR Pay', card: 'Thẻ tín dụng' };
            const amount = currentLead ? currentLead.premiumEstimate || 0 : 0;
            const now = new Date();
            detail.innerHTML = `<div style="text-align:center;padding:40px">
                <div style="font-size:48px;color:var(--mb-success)">✅</div>
                <h3 style="color:var(--mb-success);margin:12px 0">Thanh toán thành công!</h3>
                <p>Phương thức: <strong>${methodNames[method]}</strong></p>
                <p>Số tiền: <strong style="color:var(--mb-primary)">₫${fmt(amount)}</strong></p>
                <p style="color:var(--mb-muted);font-size:12px">Mã GD: ${currentLead?.id || ''}-${Date.now().toString(36).toUpperCase()}</p>
                <p style="color:var(--mb-muted);font-size:12px">Thời gian: ${now.toLocaleTimeString('vi-VN')} ${now.toLocaleDateString('vi-VN')}</p>
            </div>`;
            showToast('Thanh toán thành công!', 'success');
        }, 2000);
    }

    function generateQRSVG(ref) {
        const size = 200; const s = 8; const cells = Math.floor(size / s);
        let rects = '';
        let seed = 0;
        for (let c of ref) seed += c.charCodeAt(0);
        function drawFinder(x, y) {
            rects += `<rect x="${x * s}" y="${y * s}" width="${7 * s}" height="${7 * s}" fill="black"/>`;
            rects += `<rect x="${(x + 1) * s}" y="${(y + 1) * s}" width="${5 * s}" height="${5 * s}" fill="white"/>`;
            rects += `<rect x="${(x + 2) * s}" y="${(y + 2) * s}" width="${3 * s}" height="${3 * s}" fill="black"/>`;
        }
        drawFinder(0, 0); drawFinder(cells - 7, 0); drawFinder(0, cells - 7);
        for (let y = 0; y < cells; y++) {
            for (let x = 0; x < cells; x++) {
                if ((x < 8 && y < 8) || (x >= cells - 8 && y < 8) || (x < 8 && y >= cells - 8)) continue;
                seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                if (seed % 3 === 0) rects += `<rect x="${x * s}" y="${y * s}" width="${s}" height="${s}" fill="black"/>`;
            }
        }
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="white"/>${rects}</svg>`;
    }

    // ===== DOCUMENTS (Biểu mẫu) =====
    function renderDocuments(category) {
        const cat = category || 'all';
        const filtered = cat === 'all' ? MOCK_DOCUMENTS : MOCK_DOCUMENTS.filter(d => d.category === cat);
        const tbody = document.getElementById('docsTableBody');
        const typeIcons = { PDF: '📕', XLSX: '📊', PPTX: '📙', DOCX: '📘' };
        tbody.innerHTML = filtered.map(d => `<tr>
            <td>${typeIcons[d.type] || '📄'} ${d.name}</td>
            <td><span class="doc-type-badge">${d.type}</span></td>
            <td>${formatDate(d.updated)}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="showToast('Tải xuống: ${d.name}')">Tải xuống</button></td>
        </tr>`).join('');
    }

    function filterDocs(cat, btn) {
        document.querySelectorAll('.doc-cat-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        renderDocuments(cat);
    }

    // ===== MODAL =====
    function closeModal() {
        document.getElementById('modalOverlay').classList.add('hidden');
    }

    // ===== UTILITIES =====
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    function showToast(message, type) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast ' + (type || '');
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Expose globally
    window.handleLogin = handleLogin; window.handleLogout = handleLogout;
    window.navigateTo = navigateTo; window.toggleSidebar = toggleSidebar;
    window.viewLead = viewLead; window.filterLeads = filterLeads; window.deleteLead = deleteLead;
    window.openAddLead = openAddLead; window.openEditLead = openEditLead;
    window.saveLead = saveLead; window.openStatusUpdate = openStatusUpdate;
    window.saveStatus = saveStatus; window.switchDetailTab = switchDetailTab;
    window.openAddInteraction = openAddInteraction; window.saveInteraction = saveInteraction;
    window.openAddStakeholder = openAddStakeholder; window.saveStakeholder = saveStakeholder;
    window.openAddLA = openAddLA; window.saveLA = saveLA; window.simulateExcelImport = simulateExcelImport;
    window.toggleNeed = toggleNeed;
    window.selectPaymentMethod = selectPaymentMethod; window.processPayment = processPayment;
    window.renderPayment = renderPayment;
    window.filterDocs = filterDocs; window.switchSalesView = switchSalesView;
    window.showToast = showToast; window.closeModal = closeModal;

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

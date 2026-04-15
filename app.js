/**
 * M-Bro CRM — v2.0 Main Application Logic
 * Navigation, CRUD, Dashboard, Contract Wizard
 */
(function () {
    'use strict';

    let leads = [];
    let contracts = [];
    let currentLead = null;
    let wizardStep = 1;
    let wizardData = {};

    // ===== INIT =====
    function init() {
        const saved = localStorage.getItem('mbro_leads');
        leads = saved ? JSON.parse(saved) : [...MOCK_LEADS];
        const savedC = localStorage.getItem('mbro_contracts');
        contracts = savedC ? JSON.parse(savedC) : [...MOCK_CONTRACTS];
        updateDashboard();
        updateWelcomeHero();
        renderRecentLeads();
        renderDashNews();
        renderPipeline();
        renderLeadsTable();
        renderContracts();
        renderNews();
        renderDocuments();
        updateLeadBadge();
    }

    function save() {
        localStorage.setItem('mbro_leads', JSON.stringify(leads));
        localStorage.setItem('mbro_contracts', JSON.stringify(contracts));
    }

    function fmt(n) { return '₫' + Math.abs(n).toLocaleString('vi-VN'); }

    // ===== LOGIN =====
    window.handleLogin = function (e) {
        e.preventDefault();
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        init();
        return false;
    };

    window.handleLogout = function () {
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginPage').classList.remove('hidden');
    };

    // ===== NAVIGATION =====
    window.navigateTo = function (page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.remove('active'));
        const navItem = document.querySelector('.nav-item[data-page="' + page + '"]');
        if (navItem) navItem.classList.add('active');

        const titles = { dashboard: 'Trang chủ', leads: 'Khách hàng Tiềm năng', contracts: 'Hợp đồng', news: 'Tin tức & Sự kiện', documents: 'Tài liệu & Biểu mẫu', 'lead-detail': 'Chi tiết KHTN' };
        document.getElementById('pageTitle').textContent = titles[page] || '';
    };

    window.toggleSidebar = function () {
        document.getElementById('sidebar').classList.toggle('open');
    };

    // ===== DASHBOARD =====
    function updateDashboard() {
        document.getElementById('totalLeads').textContent = leads.length;
        const newCount = leads.filter(l => l.status === 'Mới').length;
        document.getElementById('newLeads').textContent = newCount;
        const pendingContracts = contracts.filter(c => c.status !== 'Đã phát hành').length;
        document.getElementById('activeContracts').textContent = pendingContracts;
        const rev = contracts.reduce((s, c) => s + c.premium, 0);
        document.getElementById('monthRevenue').textContent = fmt(rev);
        // Agenda counters
        const agNew = document.getElementById('agendaNew');
        if (agNew) agNew.textContent = newCount;
        const agContracts = document.getElementById('agendaContracts');
        if (agContracts) agContracts.textContent = pendingContracts;
        const agFollowup = document.getElementById('agendaFollowup');
        if (agFollowup) agFollowup.textContent = leads.filter(l => ['Đang liên hệ', 'Quan tâm', 'Đang đàm phán'].includes(l.status)).length;
    }

    function updateWelcomeHero() {
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'Xin chào';
        if (hour < 12) greeting = 'Chào buổi sáng';
        else if (hour < 18) greeting = 'Chào buổi chiều';
        else greeting = 'Chào buổi tối';
        const el = document.getElementById('welcomeGreeting');
        if (el) el.textContent = greeting + ', Tư vấn viên! 👋';
        const dateEl = document.getElementById('welcomeDate');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) + ' — Bạn có ' + leads.filter(l => l.status === 'Mới').length + ' KHTN mới cần xử lý';
    }

    function updateLeadBadge() {
        const newCount = leads.filter(l => l.status === 'Mới').length;
        document.getElementById('leadBadge').textContent = newCount;
    }

    function renderRecentLeads() {
        const tbody = document.querySelector('#recentLeadsTable tbody');
        const recent = [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
        tbody.innerHTML = recent.map(l => `
            <tr>
                <td><strong>${l.id}</strong></td>
                <td>${l.company}</td>
                <td>${l.representative}</td>
                <td><span class="status-badge ${STATUS_MAP[l.status]}">${l.status}</span></td>
                <td>${formatDate(l.createdAt)}</td>
                <td><button class="action-btn" onclick="viewLead('${l.id}')" title="Xem chi tiết">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button></td>
            </tr>
        `).join('');
    }

    function renderDashNews() {
        const container = document.getElementById('dashNewsList');
        container.innerHTML = MOCK_NEWS.slice(0, 4).map(n => `
            <div class="news-item">
                <div class="news-thumb" style="background: linear-gradient(135deg, ${n.color}22, ${n.color}44)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${n.color}" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                </div>
                <div class="news-item-body">
                    <div class="news-item-title">${n.title}</div>
                    <div class="news-item-meta"><span class="news-tag">${n.category}</span> ${formatDate(n.date)}</div>
                </div>
            </div>
        `).join('');
    }

    function renderPipeline() {
        const container = document.getElementById('pipelineChart');
        const counts = {};
        Object.keys(STATUS_COLORS).forEach(s => counts[s] = 0);
        leads.forEach(l => { if (counts[l.status] !== undefined) counts[l.status]++; });
        const total = leads.length || 1;

        let barHTML = '<div class="pipeline-bar">';
        let legendHTML = '<div class="pipeline-legend">';
        Object.entries(counts).forEach(([status, count]) => {
            if (count > 0) {
                barHTML += `<div class="pipeline-seg" style="flex:${count};background:${STATUS_COLORS[status]}" title="${status}: ${count}"></div>`;
            }
            legendHTML += `<div class="pipeline-legend-item"><span class="legend-dot" style="background:${STATUS_COLORS[status]}"></span>${status}: <strong>${count}</strong></div>`;
        });
        barHTML += '</div>';
        legendHTML += '</div>';
        container.innerHTML = barHTML + legendHTML;
    }

    // ===== LEADS TABLE =====
    function renderLeadsTable(filtered) {
        const data = filtered || leads;
        const tbody = document.getElementById('leadsTableBody');
        tbody.innerHTML = data.map(l => `
            <tr>
                <td><strong>${l.id}</strong></td>
                <td>${l.company}</td>
                <td>${l.representative}</td>
                <td>${l.phone}</td>
                <td><span class="status-badge ${STATUS_MAP[l.status]}">${l.status}</span></td>
                <td>${formatDate(l.createdAt)}</td>
                <td>
                    <button class="action-btn" onclick="viewLead('${l.id}')" title="Xem chi tiết">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="action-btn" onclick="deleteLead('${l.id}')" title="Xóa">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </td>
            </tr>
        `).join('');
        document.getElementById('leadsInfo').textContent = `Hiển thị ${data.length} / ${leads.length} KHTN`;
    }

    window.filterLeads = function () {
        const q = document.getElementById('leadSearch').value.toLowerCase();
        const status = document.getElementById('leadStatusFilter').value;
        let filtered = leads;
        if (q) filtered = filtered.filter(l => l.company.toLowerCase().includes(q) || l.representative.toLowerCase().includes(q) || l.id.toLowerCase().includes(q));
        if (status) filtered = filtered.filter(l => l.status === status);
        renderLeadsTable(filtered);
    };

    window.deleteLead = function (id) {
        if (!confirm('Bạn có chắc muốn xóa KHTN này?')) return;
        leads = leads.filter(l => l.id !== id);
        save();
        renderLeadsTable();
        updateDashboard();
        renderPipeline();
        renderRecentLeads();
        updateLeadBadge();
        showToast('Đã xóa KHTN thành công');
    };

    // ===== LEAD DETAIL =====
    window.viewLead = function (id) {
        currentLead = leads.find(l => l.id === id);
        if (!currentLead) return;

        document.getElementById('detailCompanyName').textContent = currentLead.company;
        const badge = document.getElementById('detailStatus');
        badge.textContent = currentLead.status;
        badge.className = 'status-badge ' + STATUS_MAP[currentLead.status];

        const grid = document.getElementById('leadInfoGrid');
        grid.innerHTML = `
            <div class="info-item"><label>Mã KH</label><span>${currentLead.id}</span></div>
            <div class="info-item"><label>Mã số thuế</label><span>${currentLead.taxCode}</span></div>
            <div class="info-item"><label>Người đại diện</label><span>${currentLead.representative}</span></div>
            <div class="info-item"><label>Điện thoại</label><span>${currentLead.phone}</span></div>
            <div class="info-item"><label>Email</label><span>${currentLead.email}</span></div>
            <div class="info-item"><label>Ngành nghề</label><span>${currentLead.industry}</span></div>
            <div class="info-item"><label>Số nhân viên</label><span>${currentLead.employees}</span></div>
            <div class="info-item"><label>Nguồn</label><span>${currentLead.source}</span></div>
            <div class="info-item" style="grid-column:1/-1"><label>Địa chỉ</label><span>${currentLead.address}</span></div>
        `;

        renderInteractions();
        renderProducts();
        document.getElementById('leadNotes').value = currentLead.notes || '';

        // Reset to first tab
        switchDetailTab('info', document.querySelector('.tab-btn'));
        navigateTo('lead-detail');
    };

    function renderInteractions() {
        const timeline = document.getElementById('interactionTimeline');
        const interactions = MOCK_INTERACTIONS[currentLead.id] || [];
        if (interactions.length === 0) {
            timeline.innerHTML = '<p style="color:var(--mb-muted);padding:16px">Chưa có lịch sử tương tác. Nhấn "+ Thêm tương tác" để bắt đầu.</p>';
            return;
        }
        timeline.innerHTML = interactions.map(i => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-type">${i.type}</span>
                        <span class="timeline-date">${formatDate(i.date)}</span>
                    </div>
                    <div class="timeline-text">${i.content}</div>
                    <div class="timeline-text" style="margin-top:4px;color:var(--mb-primary);font-weight:500">→ ${i.result}</div>
                </div>
            </div>
        `).join('');
    }

    function renderProducts() {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = PRODUCTS.map(p => `
            <div class="product-interest-card">
                <h4>${p.name}</h4>
                <p>${p.desc}</p>
                <p style="margin-top:8px;font-weight:600;color:var(--mb-primary)">Phí cơ bản: ${fmt(p.basePremium)}/người/năm</p>
            </div>
        `).join('');
    }

    window.switchDetailTab = function (tab, btn) {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
        btn.classList.add('active');
    };

    window.saveNotes = function () {
        if (!currentLead) return;
        currentLead.notes = document.getElementById('leadNotes').value;
        save();
    };

    // ===== ADD/EDIT LEAD =====
    window.openAddLead = function () {
        document.getElementById('modalTitle').textContent = 'Thêm KHTN Mới';
        document.getElementById('modalBody').innerHTML = getLeadFormHTML();
        document.getElementById('modalOverlay').classList.remove('hidden');
    };

    window.openEditLead = function () {
        if (!currentLead) return;
        document.getElementById('modalTitle').textContent = 'Chỉnh sửa KHTN';
        document.getElementById('modalBody').innerHTML = getLeadFormHTML(currentLead);
        document.getElementById('modalOverlay').classList.remove('hidden');
    };

    function getLeadFormHTML(data) {
        const d = data || {};
        return `
            <form onsubmit="return saveLead(event, '${d.id || ''}')">
                <div class="modal-form-row">
                    <div class="modal-form-group"><label>Tên doanh nghiệp *</label><input id="fCompany" value="${d.company || ''}" required></div>
                    <div class="modal-form-group"><label>Mã số thuế</label><input id="fTaxCode" value="${d.taxCode || ''}"></div>
                </div>
                <div class="modal-form-row">
                    <div class="modal-form-group"><label>Người đại diện *</label><input id="fRep" value="${d.representative || ''}" required></div>
                    <div class="modal-form-group"><label>Điện thoại *</label><input id="fPhone" value="${d.phone || ''}" required></div>
                </div>
                <div class="modal-form-row">
                    <div class="modal-form-group"><label>Email</label><input type="email" id="fEmail" value="${d.email || ''}"></div>
                    <div class="modal-form-group"><label>Ngành nghề</label><input id="fIndustry" value="${d.industry || ''}"></div>
                </div>
                <div class="modal-form-row">
                    <div class="modal-form-group"><label>Số nhân viên</label><input type="number" id="fEmployees" value="${d.employees || ''}"></div>
                    <div class="modal-form-group"><label>Nguồn</label>
                        <select id="fSource">
                            <option ${d.source === 'Website' ? 'selected' : ''}>Website</option>
                            <option ${d.source === 'Giới thiệu' ? 'selected' : ''}>Giới thiệu</option>
                            <option ${d.source === 'Cold call' ? 'selected' : ''}>Cold call</option>
                            <option ${d.source === 'Triển lãm' ? 'selected' : ''}>Triển lãm</option>
                            <option ${d.source === 'Sự kiện' ? 'selected' : ''}>Sự kiện</option>
                            <option ${d.source === 'Đối tác' ? 'selected' : ''}>Đối tác</option>
                            <option ${d.source === 'Referral' ? 'selected' : ''}>Referral</option>
                        </select>
                    </div>
                </div>
                <div class="modal-form-group"><label>Địa chỉ</label><input id="fAddress" value="${d.address || ''}"></div>
                <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:8px">
                    <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">${d.id ? 'Cập nhật' : 'Thêm mới'}</button>
                </div>
            </form>
        `;
    }

    window.saveLead = function (e, editId) {
        e.preventDefault();
        const data = {
            company: document.getElementById('fCompany').value,
            taxCode: document.getElementById('fTaxCode').value,
            representative: document.getElementById('fRep').value,
            phone: document.getElementById('fPhone').value,
            email: document.getElementById('fEmail').value,
            industry: document.getElementById('fIndustry').value,
            employees: parseInt(document.getElementById('fEmployees').value) || 0,
            source: document.getElementById('fSource').value,
            address: document.getElementById('fAddress').value,
        };

        if (editId) {
            const lead = leads.find(l => l.id === editId);
            Object.assign(lead, data);
            showToast('Đã cập nhật KHTN', 'success');
            if (currentLead && currentLead.id === editId) viewLead(editId);
        } else {
            const newId = 'KH' + String(leads.length + 1).padStart(3, '0');
            leads.push({ id: newId, ...data, status: 'Mới', createdAt: new Date().toISOString().split('T')[0], notes: '' });
            showToast('Đã thêm KHTN mới', 'success');
        }

        save();
        closeModal();
        renderLeadsTable();
        updateDashboard();
        updateWelcomeHero();
        renderPipeline();
        renderRecentLeads();
        updateLeadBadge();
        if (!editId) navigateTo('leads');
        return false;
    };

    // ===== STATUS UPDATE =====
    window.openStatusUpdate = function () {
        if (!currentLead) return;
        const statuses = Object.keys(STATUS_MAP);
        document.getElementById('modalTitle').textContent = 'Cập nhật trạng thái';
        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="return saveStatus(event)">
                <div class="modal-form-group">
                    <label>Trạng thái hiện tại</label>
                    <span class="status-badge ${STATUS_MAP[currentLead.status]}" style="display:inline-flex">${currentLead.status}</span>
                </div>
                <div class="modal-form-group">
                    <label>Trạng thái mới *</label>
                    <select id="fNewStatus" required>
                        ${statuses.map(s => `<option ${s === currentLead.status ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </div>
                <div class="modal-form-group">
                    <label>Lý do chuyển</label>
                    <textarea id="fStatusReason" rows="3" placeholder="Nhập lý do..."></textarea>
                </div>
                <div class="modal-form-group">
                    <label>Ngày liên hệ tiếp</label>
                    <input type="date" id="fFollowUp">
                </div>
                <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:8px">
                    <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        `;
        document.getElementById('modalOverlay').classList.remove('hidden');
    };

    window.saveStatus = function (e) {
        e.preventDefault();
        const newStatus = document.getElementById('fNewStatus').value;
        currentLead.status = newStatus;
        save();
        closeModal();
        viewLead(currentLead.id);
        renderLeadsTable();
        updateDashboard();
        renderPipeline();
        renderRecentLeads();
        updateLeadBadge();
        updateWelcomeHero();
        showToast('Đã cập nhật trạng thái', 'success');
        return false;
    };

    // ===== ADD INTERACTION =====
    window.openAddInteraction = function () {
        document.getElementById('modalTitle').textContent = 'Thêm Tương tác';
        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="return saveInteraction(event)">
                <div class="modal-form-row">
                    <div class="modal-form-group"><label>Loại *</label>
                        <select id="fIntType"><option>Gọi điện</option><option>Gặp mặt</option><option>Email</option><option>Khác</option></select>
                    </div>
                    <div class="modal-form-group"><label>Ngày *</label><input type="date" id="fIntDate" value="${new Date().toISOString().split('T')[0]}" required></div>
                </div>
                <div class="modal-form-group"><label>Nội dung *</label><textarea id="fIntContent" rows="3" required placeholder="Mô tả nội dung tương tác..."></textarea></div>
                <div class="modal-form-group"><label>Kết quả</label><input id="fIntResult" placeholder="Kết quả tương tác"></div>
                <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:8px">
                    <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
                    <button type="submit" class="btn btn-primary">Lưu</button>
                </div>
            </form>
        `;
        document.getElementById('modalOverlay').classList.remove('hidden');
    };

    window.saveInteraction = function (e) {
        e.preventDefault();
        const interaction = {
            type: document.getElementById('fIntType').value,
            date: document.getElementById('fIntDate').value,
            content: document.getElementById('fIntContent').value,
            result: document.getElementById('fIntResult').value,
        };
        if (!MOCK_INTERACTIONS[currentLead.id]) MOCK_INTERACTIONS[currentLead.id] = [];
        MOCK_INTERACTIONS[currentLead.id].unshift(interaction);
        closeModal();
        renderInteractions();
        showToast('Đã lưu tương tác', 'success');
        return false;
    };

    // ===== CONTRACTS =====
    function renderContracts() {
        const tbody = document.getElementById('contractsTableBody');
        tbody.innerHTML = contracts.map(c => `
            <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.company}</td>
                <td>${c.product}</td>
                <td>${fmt(c.premium)}</td>
                <td><span class="status-badge ${c.status === 'Đã phát hành' ? 's-issued' : c.status === 'Chờ duyệt' ? 's-pending' : 's-new'}">${c.status}</span></td>
                <td>${formatDate(c.createdAt)}</td>
                <td>
                    <button class="action-btn" title="Xem chi tiết">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.filterContracts = function () {
        const q = document.getElementById('contractSearch').value.toLowerCase();
        const filtered = contracts.filter(c => c.company.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.product.toLowerCase().includes(q));
        const tbody = document.getElementById('contractsTableBody');
        tbody.innerHTML = filtered.map(c => `
            <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.company}</td>
                <td>${c.product}</td>
                <td>${fmt(c.premium)}</td>
                <td><span class="status-badge ${c.status === 'Đã phát hành' ? 's-issued' : c.status === 'Chờ duyệt' ? 's-pending' : 's-new'}">${c.status}</span></td>
                <td>${formatDate(c.createdAt)}</td>
                <td><button class="action-btn" title="Xem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td>
            </tr>
        `).join('');
    };

    // ===== CONTRACT WIZARD =====
    window.openNewContract = function () {
        wizardStep = 1;
        wizardData = { leadId: '', product: '', insured: [] };
        updateWizardUI();
        document.getElementById('contractWizard').classList.remove('hidden');
    };

    window.closeContractWizard = function () {
        document.getElementById('contractWizard').classList.add('hidden');
    };

    window.wizardNextStep = function () {
        if (wizardStep === 1) {
            const sel = document.getElementById('wLeadSelect');
            if (sel && !sel.value) { showToast('Vui lòng chọn KHTN', 'error'); return; }
            if (sel) wizardData.leadId = sel.value;
        }
        if (wizardStep === 2) {
            const selected = document.querySelector('.product-card.selected');
            if (!selected) { showToast('Vui lòng chọn sản phẩm', 'error'); return; }
            wizardData.product = selected.dataset.name;
            wizardData.effectiveDate = document.getElementById('wEffDate')?.value || '';
            wizardData.term = document.getElementById('wTerm')?.value || '1';
            wizardData.insuredCount = document.getElementById('wInsuredCount')?.value || '1';
        }
        if (wizardStep === 4) {
            // Submit
            const lead = leads.find(l => l.id === wizardData.leadId);
            const product = PRODUCTS.find(p => p.name === wizardData.product);
            const premium = (product ? product.basePremium : 1500000) * parseInt(wizardData.insuredCount || 1);
            const newC = {
                id: 'HD' + String(contracts.length + 1).padStart(3, '0'),
                leadId: wizardData.leadId,
                company: lead ? lead.company : '',
                product: wizardData.product,
                premium: premium,
                status: 'Chờ duyệt',
                effectiveDate: wizardData.effectiveDate,
                term: parseInt(wizardData.term),
                insuredCount: parseInt(wizardData.insuredCount || 1),
                createdAt: new Date().toISOString().split('T')[0],
            };
            contracts.push(newC);
            save();
            closeContractWizard();
            renderContracts();
            updateDashboard();
            showToast('Đã tạo hợp đồng thành công!', 'success');
            return;
        }
        if (wizardStep < 4) { wizardStep++; updateWizardUI(); }
    };

    window.wizardPrevStep = function () {
        if (wizardStep > 1) { wizardStep--; updateWizardUI(); }
    };

    function updateWizardUI() {
        document.querySelectorAll('.wizard-step').forEach(s => {
            const n = parseInt(s.dataset.step);
            s.classList.toggle('active', n === wizardStep);
            s.classList.toggle('done', n < wizardStep);
        });
        document.getElementById('wizardPrev').style.display = wizardStep > 1 ? '' : 'none';
        document.getElementById('wizardNext').textContent = wizardStep === 4 ? 'Nộp hồ sơ' : 'Tiếp theo';

        const body = document.getElementById('wizardBody');
        if (wizardStep === 1) {
            body.innerHTML = `
                <div class="modal-form-group">
                    <label>Chọn KHTN Doanh nghiệp *</label>
                    <select id="wLeadSelect" style="width:100%;padding:10px;border:1.5px solid var(--mb-border);border-radius:var(--radius)">
                        <option value="">-- Chọn khách hàng --</option>
                        ${leads.filter(l => l.status !== 'Từ chối' && l.status !== 'Ngừng theo dõi').map(l => `<option value="${l.id}" ${wizardData.leadId === l.id ? 'selected' : ''}>${l.id} — ${l.company}</option>`).join('')}
                    </select>
                </div>
                <div id="wLeadPreview" style="margin-top:16px"></div>
            `;
            const sel = document.getElementById('wLeadSelect');
            sel.addEventListener('change', () => {
                const lead = leads.find(l => l.id === sel.value);
                const preview = document.getElementById('wLeadPreview');
                if (lead) {
                    preview.innerHTML = `
                        <div class="info-grid" style="background:var(--mb-bg);padding:16px;border-radius:var(--radius)">
                            <div class="info-item"><label>Doanh nghiệp</label><span>${lead.company}</span></div>
                            <div class="info-item"><label>MST</label><span>${lead.taxCode}</span></div>
                            <div class="info-item"><label>Người đại diện</label><span>${lead.representative}</span></div>
                            <div class="info-item"><label>SĐT</label><span>${lead.phone}</span></div>
                        </div>
                    `;
                } else preview.innerHTML = '';
            });
            if (wizardData.leadId) sel.dispatchEvent(new Event('change'));
        } else if (wizardStep === 2) {
            body.innerHTML = `
                <div class="modal-form-group"><label>Chọn sản phẩm bảo hiểm *</label></div>
                <div class="product-cards">
                    ${PRODUCTS.map(p => `
                        <div class="product-card ${wizardData.product === p.name ? 'selected' : ''}" data-name="${p.name}" onclick="selectProduct(this)">
                            <h4>${p.name}</h4>
                            <p>${p.desc}</p>
                            <p style="margin-top:8px;font-weight:600;color:var(--mb-primary)">${fmt(p.basePremium)}/người/năm</p>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-form-row" style="margin-top:16px">
                    <div class="modal-form-group"><label>Ngày hiệu lực</label><input type="date" id="wEffDate" value="${wizardData.effectiveDate || ''}"></div>
                    <div class="modal-form-group"><label>Thời hạn (năm)</label>
                        <select id="wTerm">${[1, 2, 3, 5, 10, 15, 20].map(y => `<option value="${y}" ${wizardData.term == y ? 'selected' : ''}>${y} năm</option>`).join('')}</select>
                    </div>
                </div>
                <div class="modal-form-group"><label>Số người tham gia bảo hiểm</label><input type="number" id="wInsuredCount" value="${wizardData.insuredCount || 1}" min="1"></div>
            `;
        } else if (wizardStep === 3) {
            const count = parseInt(wizardData.insuredCount || 1);
            let rows = '';
            for (let i = 0; i < Math.min(count, 5); i++) {
                rows += `<tr><td>${i + 1}</td><td><input placeholder="Họ tên" style="border:1px solid var(--mb-border);padding:6px;border-radius:4px;width:100%"></td><td><input placeholder="Số CCCD" style="border:1px solid var(--mb-border);padding:6px;border-radius:4px;width:100%"></td><td><input type="date" style="border:1px solid var(--mb-border);padding:6px;border-radius:4px"></td></tr>`;
            }
            if (count > 5) rows += `<tr><td colspan="4" style="text-align:center;color:var(--mb-muted);padding:12px">... và ${count - 5} người khác (import từ Excel)</td></tr>`;
            body.innerHTML = `
                <p style="margin-bottom:12px;color:var(--mb-text-secondary)">Nhập thông tin Người được Bảo hiểm (${count} người)</p>
                <table class="data-table">
                    <thead><tr><th>#</th><th>Họ tên</th><th>Số CCCD</th><th>Ngày sinh</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <button class="btn btn-ghost btn-sm" style="margin-top:12px">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Import từ Excel
                </button>
            `;
        } else if (wizardStep === 4) {
            const lead = leads.find(l => l.id === wizardData.leadId);
            const product = PRODUCTS.find(p => p.name === wizardData.product);
            const premium = (product ? product.basePremium : 0) * parseInt(wizardData.insuredCount || 1);
            body.innerHTML = `
                <h4 style="margin-bottom:16px;color:var(--mb-primary)">Xác nhận thông tin Hợp đồng</h4>
                <div class="info-grid" style="background:var(--mb-bg);padding:16px;border-radius:var(--radius)">
                    <div class="info-item"><label>Doanh nghiệp</label><span>${lead ? lead.company : '—'}</span></div>
                    <div class="info-item"><label>MST</label><span>${lead ? lead.taxCode : '—'}</span></div>
                    <div class="info-item"><label>Sản phẩm</label><span>${wizardData.product}</span></div>
                    <div class="info-item"><label>Thời hạn</label><span>${wizardData.term} năm</span></div>
                    <div class="info-item"><label>Số NĐBH</label><span>${wizardData.insuredCount} người</span></div>
                    <div class="info-item"><label>Ngày hiệu lực</label><span>${wizardData.effectiveDate || '—'}</span></div>
                    <div class="info-item" style="grid-column:1/-1"><label>TỔNG PHÍ BẢO HIỂM</label><span style="font-size:20px;color:var(--mb-primary);font-weight:700">${fmt(premium)}</span></div>
                </div>
                <p style="margin-top:16px;color:var(--mb-text-secondary);font-size:13px">Nhấn "Nộp hồ sơ" để gửi cho bộ phận Underwriting duyệt.</p>
            `;
        }
    }

    window.selectProduct = function (el) {
        document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        wizardData.product = el.dataset.name;
    };

    // ===== NEWS =====
    function renderNews(filter) {
        const data = filter ? MOCK_NEWS.filter(n => n.category === filter) : MOCK_NEWS;
        const featuredContainer = document.getElementById('newsFeatured');
        const grid = document.getElementById('newsGrid');

        if (data.length === 0) {
            if (featuredContainer) featuredContainer.innerHTML = '';
            grid.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg><h4>Không có tin tức</h4><p>Chưa có bài viết nào trong danh mục này</p></div>';
            return;
        }

        // Featured hero (first item)
        const featured = data[0];
        if (featuredContainer) {
            featuredContainer.innerHTML = `
                <div class="news-featured-hero">
                    <div class="news-featured-img" style="background:linear-gradient(135deg, ${featured.color}, ${featured.color}CC)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                    </div>
                    <div class="news-featured-body">
                        <span class="news-tag">${featured.category}</span>
                        <h3>${featured.title}</h3>
                        <p>${featured.excerpt}</p>
                        <span class="news-date">${formatDate(featured.date)}</span>
                    </div>
                </div>
            `;
        }

        // Remaining cards
        const remaining = data.slice(1);
        grid.innerHTML = remaining.map(n => `
            <div class="news-card-item">
                <div class="news-card-img" style="background:linear-gradient(135deg, ${n.color}, ${n.color}CC)">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                </div>
                <div class="news-card-body">
                    <h4>${n.title}</h4>
                    <p>${n.excerpt}</p>
                    <div class="news-card-footer">
                        <span class="news-tag">${n.category}</span>
                        <span style="font-size:12px;color:var(--mb-muted)">${formatDate(n.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.filterNewsBy = function (category, btn) {
        document.querySelectorAll('#newsFilterPills .doc-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderNews(category || null);
    };

    // ===== DOCUMENTS =====
    function renderDocuments(category) {
        const data = category && category !== 'all' ? MOCK_DOCUMENTS.filter(d => d.category === category) : MOCK_DOCUMENTS;
        const tbody = document.getElementById('docsTableBody');
        const catLabels = { form: 'Biểu mẫu', product: 'Sản phẩm', process: 'Quy trình', training: 'Đào tạo' };
        tbody.innerHTML = data.map(d => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${d.type === 'PDF' ? 'var(--mb-accent)' : d.type === 'XLSX' ? 'var(--mb-success)' : 'var(--mb-primary)'}" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span style="font-weight:500">${d.name}</span>
                    </div>
                </td>
                <td><span class="news-tag" style="background:${d.type === 'PDF' ? 'var(--mb-accent-light)' : d.type === 'XLSX' ? '#DCFCE7' : 'var(--mb-primary-light)'};color:${d.type === 'PDF' ? 'var(--mb-accent)' : d.type === 'XLSX' ? 'var(--mb-success)' : 'var(--mb-primary)'}">${d.type}</span></td>
                <td style="color:var(--mb-muted)">${formatDate(d.updated)}</td>
                <td><button class="doc-download-btn" onclick="showToast('Đang tải ${d.name}...')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Tải về
                </button></td>
            </tr>
        `).join('');
    }

    window.filterDocs = function (cat, btn) {
        document.querySelectorAll('.doc-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDocuments(cat);
    };

    // ===== MODAL =====
    window.closeModal = function () {
        document.getElementById('modalOverlay').classList.add('hidden');
    };

    // ===== UTILITIES =====
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function showToast(message, type) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast' + (type ? ' ' + type : '');
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    window.showToast = showToast;

    // Keyboard
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && document.getElementById('chatInput') === document.activeElement) return;
        if (e.key === 'Escape') {
            closeModal();
            closeContractWizard();
        }
    });
})();

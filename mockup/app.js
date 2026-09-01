// Set current date on load
document.addEventListener('DOMContentLoaded', () => {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('es-ES', options);
    }
    
    setupNavigation();
});

// Setup navigation click handlers
function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Get view ID from data-view or nav text
            let viewId = this.getAttribute('data-view');
            if (!viewId) {
                const navText = this.querySelector('span:not(.material-symbols-outlined)').textContent.trim().toLowerCase();
                if (navText.includes('dashboard')) viewId = 'view-dashboard';
                else if (navText.includes('membresía')) viewId = 'view-membresia';
                else if (navText.includes('evangelismo')) viewId = 'view-evangelismo';
                else if (navText.includes('consolidación') || navText.includes('discipulado')) viewId = 'view-consolidacion-discipulado';
                else if (navText.includes('agenda')) viewId = 'view-agenda';
                else if (navText.includes('reportes')) viewId = 'view-reportes';
                else if (navText.includes('configuración')) viewId = 'view-configuracion';
                else viewId = 'view-dashboard';
            }
            
            showView(viewId);
        });
    });
}

// Function to switch view directly programmatically
function switchViewDirect(viewId) {
    // Map legacy view names to unified view
    if (viewId === 'view-consolidacion' || viewId === 'view-discipulado') {
        viewId = 'view-consolidacion-discipulado';
    }
    
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(nav => {
        const attr = nav.getAttribute('data-view');
        if (attr === viewId) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });
    
    showView(viewId);
}

// Show target view section
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
        targetView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Subtab switcher
function switchSubTab(btnElement, targetSubTabId) {
    const tabBar = btnElement.closest('.tab-bar');
    if (tabBar) {
        tabBar.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
        btnElement.classList.add('active');
    }
    
    const card = btnElement.closest('.card');
    if (card) {
        card.querySelectorAll('.subtab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });
        
        const targetContent = card.querySelector('#' + targetSubTabId);
        if (targetContent) {
            targetContent.style.display = 'block';
            targetContent.classList.add('active');
        }
    }
}

// Dropdowns and Notifications
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

function clearNotifications(event) {
    if(event) event.preventDefault();
    const list = document.querySelector('.notification-list');
    if (list) {
        list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--texto-suave);">No tienes notificaciones pendientes</div>';
    }
    const badge = document.querySelector('.notification-btn .badge');
    if (badge) badge.style.display = 'none';
}

function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close dropdowns on outside click
document.addEventListener('click', (event) => {
    const notifDropdown = document.getElementById('notificationsDropdown');
    const notificationBtn = document.querySelector('.notification-btn');
    if (notifDropdown && notificationBtn && !notifDropdown.contains(event.target) && !notificationBtn.contains(event.target)) {
        notifDropdown.classList.remove('active');
    }
    
    const actionDropdown = document.getElementById('newActionDropdown');
    const actionBtn = document.querySelector('.dropdown-container .primary-button');
    if (actionDropdown && actionBtn && !actionDropdown.contains(event.target) && !actionBtn.contains(event.target)) {
        actionDropdown.classList.remove('active');
    }
});

// Modal Utilities
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Open Consolidation Modal with preselected contact
function openModalAssignWithContact(contactName) {
    const select = document.getElementById('assignNewContactSelect');
    if (select) {
        let found = false;
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value.includes(contactName) || select.options[i].text.includes(contactName)) {
                select.selectedIndex = i;
                found = true;
                break;
            }
        }
        if (!found) {
            const opt = document.createElement('option');
            opt.value = contactName;
            opt.text = contactName;
            opt.selected = true;
            select.add(opt);
        }
    }
    openModal('modalAssignConsolidator');
}

// Member Table Filter
function filterMemberTable() {
    const searchVal = document.getElementById('memberSearch').value.toLowerCase();
    const ministryVal = document.getElementById('memberMinistryFilter').value.toLowerCase();
    const statusVal = document.getElementById('memberStatusFilter').value.toLowerCase();
    
    const table = document.getElementById('tableMembers');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const ministryText = row.children[3] ? row.children[3].textContent.toLowerCase() : '';
        const statusText = row.children[5] ? row.children[5].textContent.toLowerCase() : '';
        
        const matchesSearch = text.includes(searchVal);
        const matchesMinistry = !ministryVal || ministryText.includes(ministryVal);
        const matchesStatus = !statusVal || statusText.includes(statusVal);
        
        if (matchesSearch && matchesMinistry && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter Evangelism Pipeline by Ministry
function filterEvangelismPipeline() {
    const selectedMinistry = document.getElementById('evangelismMinistryFilter').value;
    const cards = document.querySelectorAll('.pipeline-card');
    
    cards.forEach(card => {
        const ministry = card.getAttribute('data-ministry');
        if (!selectedMinistry || ministry === selectedMinistry) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Global Search
function filterGlobalSearch(query) {
    const q = query.toLowerCase();
    if (!q) return;
    console.log('Buscando globalmente:', q);
}

// Form Handlers

// 1. Save Pastoral Visit
function handleSavePastoralVisit(event) {
    event.preventDefault();
    const member = document.getElementById('visitMemberSelect').value;
    const type = document.getElementById('visitTypeSelect').value;
    const pastor = document.getElementById('visitPastorInput').value;
    const date = document.getElementById('visitDateInput').value;
    const notes = document.getElementById('visitNotesInput').value;
    
    if (!member || !pastor) return;
    
    const table = document.getElementById('tableDashboardVisits');
    if (table) {
        const tbody = table.querySelector('tbody');
        const memberName = member.split(' (')[0];
        const initials = memberName.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase();
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <div class="person-cell">
                    <div class="avatar-small" style="background-color:#ffe8cc; color:#d9480f;">${initials}</div>
                    <div>
                        <strong>${memberName}</strong>
                        <span>${member.includes('Inactivo') ? 'Inactivo' : 'Miembro'}</span>
                    </div>
                </div>
            </td>
            <td>${type}</td>
            <td>${date}</td>
            <td><span class="status warning">Programado</span></td>
            <td>
                <button class="action-btn" title="Ver Notas" onclick="alert('Notas: ${notes || 'Sin observaciones'}')"><span class="material-symbols-outlined">notes</span></button>
            </td>
        `;
        tbody.prepend(newRow);
    }
    
    const notifList = document.querySelector('.notification-list');
    if (notifList) {
        const notifItem = document.createElement('div');
        notifItem.className = 'notification-item info';
        notifItem.innerHTML = `
            <span class="material-symbols-outlined icon">how_to_reg</span>
            <div class="text">
                <p><strong>Visita Pastoral:</strong> ${type} a ${member.split(' (')[0]} por ${pastor}</p>
                <span>${date}</span>
            </div>
        `;
        notifList.prepend(notifItem);
    }
    
    closeModal('modalAddPastoralVisit');
    event.target.reset();
    switchViewDirect('view-dashboard');
    alert(`¡Visita pastoral a "${member.split(' (')[0]}" registrada con éxito!`);
}

// 2. Save Assignment of Consolidator / Discipulador
function handleSaveAssignConsolidator(event) {
    event.preventDefault();
    const contactName = document.getElementById('assignNewContactSelect').value;
    const consolidatorName = document.getElementById('assignConsolidatorSelect').value;
    const nextDate = document.getElementById('assignNextDate').value;
    
    if (!contactName || !consolidatorName) return;
    
    const table = document.getElementById('tableConsolidation');
    if (table) {
        const tbody = table.querySelector('tbody');
        const cleanName = contactName.split(' (')[0];
        const initials = cleanName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <div class="person-cell">
                    <div class="avatar-small" style="background-color:#ffd8a8; color:#d9480f;">${initials}</div>
                    <div>
                        <strong>${cleanName}</strong>
                        <span>Nuevo Creyente</span>
                    </div>
                </div>
            </td>
            <td>${consolidatorName}</td>
            <td>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: 10%;"></div>
                </div>
                <small>Lección 1 de 4 (0%)</small>
            </td>
            <td>${nextDate}</td>
            <td><span class="status warning">Iniciando</span></td>
            <td>
                <button class="action-btn" title="Registrar Avance" onclick="alert('Registrando avance de lección para ${cleanName}')"><span class="material-symbols-outlined">check_circle</span></button>
                <button class="action-btn" title="Visita Pastoral" onclick="openModal('modalAddPastoralVisit')"><span class="material-symbols-outlined">how_to_reg</span></button>
            </td>
        `;
        tbody.prepend(newRow);
        
        const kpi = document.getElementById('kpiActiveConsolidations');
        if (kpi) {
            const currentVal = parseInt(kpi.textContent) || 15;
            kpi.textContent = currentVal + 1;
        }
    }
    
    closeModal('modalAssignConsolidator');
    event.target.reset();
    switchViewDirect('view-consolidacion-discipulado');
    alert(`¡${contactName.split(' (')[0]} asignado a ${consolidatorName} en Consolidación y Discipulado!`);
}

// 3. Save Member
function handleSaveMember(event) {
    event.preventDefault();
    const name = document.getElementById('newMemName').value;
    const ci = document.getElementById('newMemCi').value;
    const phone = document.getElementById('newMemPhone').value;
    const ministry = document.getElementById('newMemMinistry').value;
    
    if (!name || !ci || !phone) return;
    
    const table = document.getElementById('tableMembers');
    if (table) {
        const tbody = table.querySelector('tbody');
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <div class="person-cell">
                    <div class="avatar-small" style="background-color:#d0ebff; color:#1864ab;">${initials}</div>
                    <div>
                        <strong>${name}</strong>
                        <span>Nuevo Miembro</span>
                    </div>
                </div>
            </td>
            <td>${ci}</td>
            <td>${phone}<br><small style="color:var(--texto-suave)">registrado hoy</small></td>
            <td><span class="tag">${ministry}</span></td>
            <td><span class="status warning">Pendiente</span></td>
            <td><span class="status success">Activo</span></td>
            <td>
                <button class="action-btn" title="Ver Ficha" onclick="showMemberCard('${name}', 'Nuevo Miembro', '${ci}', '${phone}', 'sin_correo@ejemplo.org', '${ministry}', 'Pendiente', 'Activo')"><span class="material-symbols-outlined">visibility</span></button>
                <button class="action-btn" title="Visita Pastoral" onclick="openModal('modalAddPastoralVisit')"><span class="material-symbols-outlined">how_to_reg</span></button>
            </td>
        `;
        tbody.prepend(newRow);
    }
    
    closeModal('modalAddMember');
    event.target.reset();
    switchViewDirect('view-membresia');
    alert(`¡Miembro "${name}" registrado con éxito!`);
}

// 4. Save Contact in Evangelism by Ministry
function handleSaveContact(event) {
    event.preventDefault();
    const name = document.getElementById('newContactName').value;
    const phone = document.getElementById('newContactPhone').value;
    const ministry = document.getElementById('newContactMinistry').value || 'General';
    const place = document.getElementById('newContactPlace').value || 'Evangelismo';
    
    if (!name) return;
    
    const col = document.getElementById('col-captados');
    if (col) {
        const card = document.createElement('div');
        card.className = 'pipeline-card';
        card.setAttribute('data-ministry', ministry);
        card.innerHTML = `
            <strong>${name}</strong>
            <p>${place} • Tel: ${phone}</p>
            <div class="flex-between">
                <span class="badge-tag">Min. ${ministry}</span>
                <button class="action-btn compact" title="Asignar a Discipulado" onclick="openModalAssignWithContact('${name}')"><span class="material-symbols-outlined" style="font-size:16px;">handshake</span></button>
            </div>
        `;
        col.prepend(card);
    }
    
    closeModal('modalAddContact');
    event.target.reset();
    switchViewDirect('view-evangelismo');
    alert(`¡Contacto "${name}" registrado en Evangelismo (${ministry})!`);
}

// 5. Save New Discipleship Group
function toggleDiscLocationInput(type) {
    const input = document.getElementById('newDiscLocationDetail');
    if (input) {
        if (type === 'iglesia') {
            input.value = 'En la Iglesia (Templo Principal / Salones)';
        } else {
            input.value = 'En casa de Fam. Pérez (Sector Centro)';
        }
    }
}

function handleSaveDiscipleship(event) {
    event.preventDefault();
    const name = document.getElementById('newDiscName').value;
    const location = document.getElementById('newDiscLocationDetail').value || 'En la Iglesia';
    const leader = document.getElementById('newDiscLeader').value;
    const schedule = document.getElementById('newDiscSchedule').value;
    
    if (!name || !leader) return;
    
    const grid = document.getElementById('gridDiscipleshipGroups');
    if (grid) {
        const isChurch = location.toLowerCase().includes('iglesia');
        const iconName = isChurch ? 'church' : 'home';
        
        const card = document.createElement('div');
        card.className = 'group-card';
        card.innerHTML = `
            <div class="group-header">
                <span class="material-symbols-outlined icon">${iconName}</span>
                <div>
                    <h4>${name}</h4>
                    <span>Lugar: ${location}</span>
                </div>
            </div>
            <div class="group-body">
                <p><strong>Líder:</strong> ${leader}</p>
                <p><strong>Horario:</strong> ${schedule}</p>
                <p><strong>Integrantes:</strong> 1 persona (Nuevo)</p>
            </div>
            <div class="group-footer">
                <button class="secondary-button" onclick="alert('Ver integrantes de ${name}')">Ver Integrantes</button>
            </div>
        `;
        grid.prepend(card);
        
        const kpi = document.getElementById('kpiDiscipleshipCount');
        if (kpi) {
            const val = parseInt(kpi.textContent) || 24;
            kpi.textContent = val + 1;
        }
    }
    
    closeModal('modalAddDiscipleship');
    event.target.reset();
    switchViewDirect('view-consolidacion-discipulado');
    alert(`¡Nuevo Grupo de Discipulado "${name}" creado exitosamente!`);
}

// 6. Save Event
function handleSaveEvent(event) {
    event.preventDefault();
    const title = document.getElementById('newEventTitle').value;
    const date = document.getElementById('newEventDate').value;
    const place = document.getElementById('newEventPlace').value || 'Templo Principal';
    
    if (!title) return;
    
    const container = document.querySelector('.events-container');
    if (container) {
        const item = document.createElement('div');
        item.className = 'event-card-item';
        item.innerHTML = `
            <div class="event-badge bg-vivid">NUEVO</div>
            <div class="event-info">
                <h4>${title}</h4>
                <p><span class="material-symbols-outlined text-icon">schedule</span> ${date} • ${place}</p>
                <p><span class="material-symbols-outlined text-icon">person</span> Resp: Liderazgo</p>
            </div>
        `;
        container.prepend(item);
    }
    
    closeModal('modalAddEvent');
    event.target.reset();
    switchViewDirect('view-agenda');
    alert(`¡Evento "${title}" creado en la agenda!`);
}

// Show detailed member card modal
function showMemberCard(name, role, ci, phone, email, ministry, baptism, status) {
    const detailsContainer = document.getElementById('memberCardDetails');
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div class="avatar" style="width: 64px; height: 64px; font-size: 1.5rem; margin: 0 auto 12px;">${name.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
                <h2 style="font-size: 1.3rem; color: var(--azul-negro);">${name}</h2>
                <p style="color: var(--texto-suave); font-size: 0.9rem;">${role}</p>
            </div>
            <div style="background-color: var(--gris-claro); padding: 16px; border-radius: 12px; font-size: 0.9rem;">
                <p style="margin-bottom: 8px;"><strong>C.I.:</strong> ${ci}</p>
                <p style="margin-bottom: 8px;"><strong>Teléfono:</strong> ${phone}</p>
                <p style="margin-bottom: 8px;"><strong>Correo electrónico:</strong> ${email}</p>
                <p style="margin-bottom: 8px;"><strong>Ministerio principal:</strong> ${ministry}</p>
                <p style="margin-bottom: 8px;"><strong>Estado Bautismal:</strong> ${baptism}</p>
                <p><strong>Estado en el Padrón:</strong> ${status}</p>
            </div>
        `;
    }
    openModal('modalMemberCard');
}

/**
 * APSAN, Lda - Sistema de Gestão Hospitalar
 * Departamento de Acompanhamento Hospitalar
 * JavaScript Principal
 */

// ============================================
// DADOS MOCK (Simulação de Base de Dados)
// ============================================
let pacientes = [
    {
        id: 1,
        processo: "APS-2026-001",
        nome: "Maria da Conceição Santos",
        nascimento: "1985-03-15",
        idade: 41,
        genero: "F",
        telefone: "+244 923 456 789",
        email: "maria.santos@email.com",
        morada: "Rua Principal, nº 123, Luanda",
        bi: "0065432LA042",
        nif: "1234567890",
        sangue: "O+",
        estadoCivil: "casado",
        alergias: "Alergia a penicilina",
        emergenciaNome: "João Santos",
        emergenciaTelefone: "+244 923 000 000",
        emergenciaParentesco: "conjuge",
        estado: "internado",
        dataRegisto: "2026-07-15"
    },
    {
        id: 2,
        processo: "APS-2026-002",
        nome: "Carlos Mendes Ferreira",
        nascimento: "1972-11-22",
        idade: 53,
        genero: "M",
        telefone: "+244 912 345 678",
        email: "carlos.mendes@email.com",
        morada: "Avenida Revolução, nº 45, Luanda",
        bi: "0051234LA039",
        nif: "0987654321",
        sangue: "A+",
        estadoCivil: "casado",
        alergias: "Nenhuma conhecida",
        emergenciaNome: "Ana Mendes",
        emergenciaTelefone: "+244 912 111 222",
        emergenciaParentesco: "conjuge",
        estado: "internado",
        dataRegisto: "2026-07-14"
    },
    {
        id: 3,
        processo: "APS-2026-003",
        nome: "Ana Paula Domingos",
        nascimento: "1990-06-08",
        idade: 36,
        genero: "F",
        telefone: "+244 934 567 890",
        email: "ana.domingos@email.com",
        morada: "Rua das Flores, nº 78, Luanda",
        bi: "0078901LA045",
        nif: "1122334455",
        sangue: "B+",
        estadoCivil: "solteiro",
        alergias: "Alergia a látex",
        emergenciaNome: "Pedro Domingos",
        emergenciaTelefone: "+244 934 999 888",
        emergenciaParentesco: "irmao",
        estado: "ambulatorio",
        dataRegisto: "2026-07-16"
    },
    {
        id: 4,
        processo: "APS-2026-004",
        nome: "João Manuel Kiala",
        nascimento: "1965-01-30",
        idade: 61,
        genero: "M",
        telefone: "+244 945 678 901",
        email: "joao.kiala@email.com",
        morada: "Bairro Popular, Casa 12, Luanda",
        bi: "0045678LA036",
        nif: "5566778899",
        sangue: "O-",
        estadoCivil: "viuvo",
        alergias: "Hipertensão, Diabetes tipo 2",
        emergenciaNome: "Maria Kiala",
        emergenciaTelefone: "+244 945 222 333",
        emergenciaParentesco: "filho",
        estado: "internado",
        dataRegisto: "2026-07-13"
    },
    {
        id: 5,
        processo: "APS-2026-005",
        nome: "Luciana Ferreira Pinto",
        nascimento: "1995-09-12",
        idade: 30,
        genero: "F",
        telefone: "+244 956 789 012",
        email: "luciana.pinto@email.com",
        morada: "Condomínio Nova Vida, Bloco B, Luanda",
        bi: "0089012LA048",
        nif: "9988776655",
        sangue: "AB+",
        estadoCivil: "solteiro",
        alergias: "Nenhuma",
        emergenciaNome: "Fernando Pinto",
        emergenciaTelefone: "+244 956 444 555",
        emergenciaParentesco: "pai",
        estado: "alta",
        dataRegisto: "2026-07-10"
    }
];

let currentEditingId = null;

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderPacientes();
    renderCalendar();
    
    // Verificar se há dados salvos no localStorage
    const savedPacientes = localStorage.getItem('apsan_pacientes');
    if (savedPacientes) {
        pacientes = JSON.parse(savedPacientes);
        renderPacientes();
    }
});

// ============================================
// FUNÇÕES DE NAVEGAÇÃO
// ============================================
function login() {
    const department = document.getElementById('department-select').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!department) {
        showToast('Por favor, selecione um departamento!', 'error');
        return;
    }

    if (!username || !password) {
        showToast('Por favor, preencha todos os campos!', 'error');
        return;
    }

    // Simular autenticação
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    showToast(`Bem-vindo ao Departamento de Acompanhamento Hospitalar!`);
}

function logout() {
    if (confirm('Tem certeza que deseja terminar a sessão?')) {
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
        showToast('Sessão terminada com sucesso!');
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

function showSection(sectionId) {
    // Atualizar menu ativo
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Atualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'pacientes': 'Registo de Pacientes',
        'consultas': 'Consultas',
        'internamentos': 'Internamentos',
        'relatorios': 'Relatórios',
        'configuracoes': 'Configurações'
    };
    document.getElementById('page-title').textContent = titles[sectionId];

    // Mostrar seção
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('section-' + sectionId).classList.add('active');
}

// ============================================
// DATA E HORA
// ============================================
function updateDateTime() {
    const now = new Date();
    
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };

    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('pt-PT', dateOptions);
    document.getElementById('current-time').textContent = 
        now.toLocaleTimeString('pt-PT', timeOptions);
}

// ============================================
// PACIENTES - CRUD
// ============================================
function renderPacientes(filter = 'todos') {
    const tbody = document.getElementById('pacientes-tbody');
    tbody.innerHTML = '';

    let filteredPacientes = pacientes;
    if (filter !== 'todos') {
        filteredPacientes = pacientes.filter(p => p.estado === filter);
    }

    filteredPacientes.forEach(paciente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${paciente.processo}</strong></td>
            <td>${paciente.nome}</td>
            <td>${paciente.idade} anos</td>
            <td>${paciente.genero === 'M' ? 'Masculino' : paciente.genero === 'F' ? 'Feminino' : 'Outro'}</td>
            <td>${paciente.telefone}</td>
            <td><span class="status-badge ${paciente.estado}">${getStatusLabel(paciente.estado)}</span></td>
            <td>${formatDate(paciente.dataRegisto)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action view" onclick="viewPaciente(${paciente.id})" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" onclick="editPaciente(${paciente.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="confirmDeletePaciente(${paciente.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusLabel(status) {
    const labels = {
        'internado': 'Internado',
        'ambulatorio': 'Ambulatório',
        'alta': 'Alta Médica',
        'urgente': 'Urgente'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
}

function filterPacientes(filter) {
    // Atualizar tabs
    document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    renderPacientes(filter);
}

function searchPacientes() {
    const searchTerm = document.getElementById('search-pacientes').value.toLowerCase();
    const tbody = document.getElementById('pacientes-tbody');
    const rows = tbody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// ============================================
// MODAIS
// ============================================
function openModal(modalId) {
    document.getElementById('modal-' + modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById('modal-' + modalId).classList.remove('active');
    document.body.style.overflow = '';
    currentEditingId = null;
}

// Fechar modal ao pressionar ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// ============================================
// CRUD PACIENTES
// ============================================
function savePaciente() {
    const form = document.getElementById('form-paciente');
    
    // Validação básica
    const nome = document.getElementById('pac-nome').value;
    const processo = document.getElementById('pac-processo').value;
    const nascimento = document.getElementById('pac-nascimento').value;
    const genero = document.getElementById('pac-genero').value;
    const telefone = document.getElementById('pac-telefone').value;

    if (!nome || !processo || !nascimento || !genero || !telefone) {
        showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }

    // Calcular idade
    const birthDate = new Date(nascimento);
    const today = new Date();
    let idade = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        idade--;
    }

    const novoPaciente = {
        id: Date.now(),
        processo: processo,
        nome: nome,
        nascimento: nascimento,
        idade: idade,
        genero: genero,
        telefone: telefone,
        email: document.getElementById('pac-email').value,
        morada: document.getElementById('pac-morada').value,
        bi: document.getElementById('pac-bi').value,
        nif: document.getElementById('pac-nif').value,
        sangue: document.getElementById('pac-sangue').value,
        estadoCivil: document.getElementById('pac-estado-civil').value,
        alergias: document.getElementById('pac-alergias').value,
        emergenciaNome: document.getElementById('pac-emergencia-nome').value,
        emergenciaTelefone: document.getElementById('pac-emergencia-telefone').value,
        emergenciaParentesco: document.getElementById('pac-emergencia-parentesco').value,
        estado: 'ambulatorio',
        dataRegisto: new Date().toISOString().split('T')[0]
    };

    pacientes.push(novoPaciente);
    saveToLocalStorage();
    
    // Limpar formulário
    form.reset();
    closeModal('novo-paciente');
    renderPacientes();
    showToast('Paciente registado com sucesso!');
}

function editPaciente(id) {
    currentEditingId = id;
    const paciente = pacientes.find(p => p.id === id);
    
    if (!paciente) {
        showToast('Paciente não encontrado!', 'error');
        return;
    }

    // Preencher formulário de edição
    const form = document.getElementById('form-editar-paciente');
    form.innerHTML = `
        <div class="form-section">
            <h4><i class="fas fa-id-card"></i> Dados Pessoais</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Nome Completo <span class="required">*</span></label>
                    <input type="text" id="edit-nome" value="${paciente.nome}" required>
                </div>
                <div class="form-group">
                    <label>Nº Processo <span class="required">*</span></label>
                    <input type="text" id="edit-processo" value="${paciente.processo}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Data de Nascimento <span class="required">*</span></label>
                    <input type="date" id="edit-nascimento" value="${paciente.nascimento}" required>
                </div>
                <div class="form-group">
                    <label>Género <span class="required">*</span></label>
                    <select id="edit-genero" required>
                        <option value="M" ${paciente.genero === 'M' ? 'selected' : ''}>Masculino</option>
                        <option value="F" ${paciente.genero === 'F' ? 'selected' : ''}>Feminino</option>
                        <option value="O" ${paciente.genero === 'O' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Nº Bilhete de Identidade</label>
                    <input type="text" id="edit-bi" value="${paciente.bi || ''}">
                </div>
                <div class="form-group">
                    <label>NIF</label>
                    <input type="text" id="edit-nif" value="${paciente.nif || ''}">
                </div>
            </div>
        </div>

        <div class="form-section">
            <h4><i class="fas fa-phone"></i> Contactos</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Telefone Principal <span class="required">*</span></label>
                    <input type="tel" id="edit-telefone" value="${paciente.telefone}" required>
                </div>
                <div class="form-group">
                    <label>Telefone Alternativo</label>
                    <input type="tel" id="edit-telefone-alt" value="${paciente.telefoneAlt || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="edit-email" value="${paciente.email || ''}">
                </div>
                <div class="form-group">
                    <label>Morada</label>
                    <input type="text" id="edit-morada" value="${paciente.morada || ''}">
                </div>
            </div>
        </div>

        <div class="form-section">
            <h4><i class="fas fa-heartbeat"></i> Dados Clínicos</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Tipo Sanguíneo</label>
                    <select id="edit-sangue">
                        <option value="">Desconhecido</option>
                        <option value="A+" ${paciente.sangue === 'A+' ? 'selected' : ''}>A+</option>
                        <option value="A-" ${paciente.sangue === 'A-' ? 'selected' : ''}>A-</option>
                        <option value="B+" ${paciente.sangue === 'B+' ? 'selected' : ''}>B+</option>
                        <option value="B-" ${paciente.sangue === 'B-' ? 'selected' : ''}>B-</option>
                        <option value="AB+" ${paciente.sangue === 'AB+' ? 'selected' : ''}>AB+</option>
                        <option value="AB-" ${paciente.sangue === 'AB-' ? 'selected' : ''}>AB-</option>
                        <option value="O+" ${paciente.sangue === 'O+' ? 'selected' : ''}>O+</option>
                        <option value="O-" ${paciente.sangue === 'O-' ? 'selected' : ''}>O-</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="edit-estado">
                        <option value="internado" ${paciente.estado === 'internado' ? 'selected' : ''}>Internado</option>
                        <option value="ambulatorio" ${paciente.estado === 'ambulatorio' ? 'selected' : ''}>Ambulatório</option>
                        <option value="alta" ${paciente.estado === 'alta' ? 'selected' : ''}>Alta Médica</option>
                        <option value="urgente" ${paciente.estado === 'urgente' ? 'selected' : ''}>Urgente</option>
                    </select>
                </div>
            </div>
            <div class="form-group full-width">
                <label>Alergias / Condições Especiais</label>
                <textarea id="edit-alergias" rows="3">${paciente.alergias || ''}</textarea>
            </div>
        </div>

        <div class="form-section">
            <h4><i class="fas fa-user-friends"></i> Contacto de Emergência</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Nome do Contacto</label>
                    <input type="text" id="edit-emergencia-nome" value="${paciente.emergenciaNome || ''}">
                </div>
                <div class="form-group">
                    <label>Telefone de Emergência</label>
                    <input type="tel" id="edit-emergencia-telefone" value="${paciente.emergenciaTelefone || ''}">
                </div>
            </div>
            <div class="form-group full-width">
                <label>Parentesco</label>
                <select id="edit-emergencia-parentesco">
                    <option value="">Selecione</option>
                    <option value="conjuge" ${paciente.emergenciaParentesco === 'conjuge' ? 'selected' : ''}>Cônjuge</option>
                    <option value="filho" ${paciente.emergenciaParentesco === 'filho' ? 'selected' : ''}>Filho(a)</option>
                    <option value="pai" ${paciente.emergenciaParentesco === 'pai' ? 'selected' : ''}>Pai/Mãe</option>
                    <option value="irmao" ${paciente.emergenciaParentesco === 'irmao' ? 'selected' : ''}>Irmão(ã)</option>
                    <option value="outro" ${paciente.emergenciaParentesco === 'outro' ? 'selected' : ''}>Outro</option>
                </select>
            </div>
        </div>
    `;

    openModal('editar-paciente');
}

function updatePaciente() {
    if (!currentEditingId) return;

    const paciente = pacientes.find(p => p.id === currentEditingId);
    if (!paciente) return;

    // Atualizar dados
    paciente.nome = document.getElementById('edit-nome').value;
    paciente.processo = document.getElementById('edit-processo').value;
    paciente.nascimento = document.getElementById('edit-nascimento').value;
    paciente.genero = document.getElementById('edit-genero').value;
    paciente.telefone = document.getElementById('edit-telefone').value;
    paciente.email = document.getElementById('edit-email').value;
    paciente.morada = document.getElementById('edit-morada').value;
    paciente.bi = document.getElementById('edit-bi').value;
    paciente.nif = document.getElementById('edit-nif').value;
    paciente.sangue = document.getElementById('edit-sangue').value;
    paciente.alergias = document.getElementById('edit-alergias').value;
    paciente.estado = document.getElementById('edit-estado').value;
    paciente.emergenciaNome = document.getElementById('edit-emergencia-nome').value;
    paciente.emergenciaTelefone = document.getElementById('edit-emergencia-telefone').value;
    paciente.emergenciaParentesco = document.getElementById('edit-emergencia-parentesco').value;

    // Recalcular idade
    const birthDate = new Date(paciente.nascimento);
    const today = new Date();
    let idade = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        idade--;
    }
    paciente.idade = idade;

    saveToLocalStorage();
    closeModal('editar-paciente');
    renderPacientes();
    showToast('Registo do paciente atualizado com sucesso!');
}

function confirmDeletePaciente(id) {
    if (confirm('Tem certeza que deseja eliminar este paciente? Esta ação não pode ser desfeita.')) {
        deletePacienteById(id);
    }
}

function deletePacienteById(id) {
    pacientes = pacientes.filter(p => p.id !== id);
    saveToLocalStorage();
    renderPacientes();
    showToast('Paciente eliminado com sucesso!');
}

function deletePaciente() {
    if (currentEditingId) {
        confirmDeletePaciente(currentEditingId);
        closeModal('editar-paciente');
    }
}

function viewPaciente(id) {
    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) return;

    alert(`
📋 FICHA DO PACIENTE
═══════════════════════════════════════

🆔 Nº Processo: ${paciente.processo}
👤 Nome: ${paciente.nome}
🎂 Data Nasc.: ${formatDate(paciente.nascimento)} (${paciente.idade} anos)
⚧ Género: ${paciente.genero === 'M' ? 'Masculino' : paciente.genero === 'F' ? 'Feminino' : 'Outro'}
🩸 Tipo Sanguíneo: ${paciente.sangue || 'Desconhecido'}

📞 Contactos:
   Tel: ${paciente.telefone}
   Email: ${paciente.email || 'N/A'}
   Morada: ${paciente.morada || 'N/A'}

🏥 Estado: ${getStatusLabel(paciente.estado)}
📅 Registado em: ${formatDate(paciente.dataRegisto)}

⚠️ Alergias: ${paciente.alergias || 'Nenhuma registrada'}

🚨 Emergência:
   Contacto: ${paciente.emergenciaNome || 'N/A'}
   Tel: ${paciente.emergenciaTelefone || 'N/A'}
   Parentesco: ${paciente.emergenciaParentesco || 'N/A'}
    `);
}

// ============================================
// LOCAL STORAGE
// ============================================
function saveToLocalStorage() {
    localStorage.setItem('apsan_pacientes', JSON.stringify(pacientes));
}

// ============================================
// UTILITÁRIOS
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('i');

    toastMessage.textContent = message;
    
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
        toastIcon.style.color = 'var(--danger)';
    } else {
        toastIcon.className = 'fas fa-check-circle';
        toastIcon.style.color = 'var(--success)';
    }

    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function exportData() {
    const dataStr = JSON.stringify(pacientes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apsan_pacientes_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Dados exportados com sucesso!');
}

function generateReport(type) {
    showToast(`A gerar relatório ${type}...`);
    setTimeout(() => {
        alert(`Relatório ${type} gerado com sucesso!\n\nEm produção, este relatório seria exportado em PDF/Excel.`);
    }, 1000);
}

function saveSettings() {
    showToast('Configurações guardadas com sucesso!');
}

// ============================================
// CALENDÁRIO
// ============================================
function renderCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Cabeçalho dos dias
    let html = '';
    daysOfWeek.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });

    // Dias do mês
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Dias vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day other-month"></div>`;
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate();
        const hasEvent = [5, 12, 15, 22, 28].includes(day); // Simulação de eventos
        const classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (hasEvent) classes.push('has-event');
        
        html += `<div class="${classes.join(' ')}">${day}</div>`;
    }

    calendarGrid.innerHTML = html;
}

// ============================================
// INICIALIZAÇÃO DE EVENTOS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar event listeners para fechar modais ao clicar fora
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
});

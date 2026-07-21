/**
 * APSAN, Lda - Sistema de Gestão Hospitalar
 * + Departamento de Tradução Oficial Juramentada
 * JavaScript Principal
 */

// ============================================
// CONFIGURAÇÃO DE DEPARTAMENTOS E CREDENCIAIS
// ============================================
const DEPARTAMENTOS = {
    acompanhamento: {
        nome: "Acompanhamento Hospitalar",
        username: "admin.apsan",
        password: "apsan2026",
        menu: "menu-acompanhamento",
        cor: "#2563eb",
        userName: "Dr. Silva",
        icon: "fa-user-md"
    },
    enfermagem: {
        nome: "Enfermagem",
        username: "enfermagem.apsan",
        password: "enf2026",
        menu: "menu-acompanhamento",
        cor: "#10b981",
        userName: "Enf. Maria",
        icon: "fa-user-nurse"
    },
    farmacia: {
        nome: "Farmácia",
        username: "farmacia.apsan",
        password: "farm2026",
        menu: "menu-acompanhamento",
        cor: "#f59e0b",
        userName: "Farm. Pedro",
        icon: "fa-pills"
    },
    traducao: {
        nome: "Tradução Oficial Juramentada",
        username: "traducao.apsan",
        password: "trad2026",
        menu: "menu-traducao",
        cor: "#7c3aed",
        userName: "Trad. Ana",
        icon: "fa-stamp"
    },
    administrativo: {
        nome: "Administrativo",
        username: "administrativo.apsan",
        password: "adm2026",
        menu: "menu-acompanhamento",
        cor: "#64748b",
        userName: "Adm. Carlos",
        icon: "fa-user-tie"
    },
    financeiro: {
        nome: "Financeiro",
        username: "financeiro.apsan",
        password: "fin2026",
        menu: "menu-acompanhamento",
        cor: "#059669",
        userName: "Fin. João",
        icon: "fa-chart-line"
    }
};

let currentDepartment = null;
let currentEditingId = null;

// ============================================
// DADOS - INICIAM VAZIOS
// ============================================
let pacientes = [];
let viagensMenores = [];
let documentosTraduzidos = [];
let clientesTraducao = [];

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderPacientes();
    renderCalendar();
    updateDepartmentTheme();
    
    // Carregar dados do localStorage se existirem
    const savedPacientes = localStorage.getItem('apsan_pacientes');
    if (savedPacientes) {
        pacientes = JSON.parse(savedPacientes);
        renderPacientes();
        updateStats();
    }
    
    const savedViagens = localStorage.getItem('apsan_viagens');
    if (savedViagens) {
        viagensMenores = JSON.parse(savedViagens);
    }
});

// ============================================
// LOGIN POR DEPARTAMENTO
// ============================================
function updateDepartmentTheme() {
    const dept = document.getElementById('department-select').value;
    const loginBtn = document.querySelector('.btn-login');
    
    if (dept && DEPARTAMENTOS[dept]) {
        loginBtn.style.background = DEPARTAMENTOS[dept].cor;
        // Preenche as credenciais sugeridas
        document.getElementById('username').value = DEPARTAMENTOS[dept].username;
        document.getElementById('password').value = '';
        document.getElementById('password').placeholder = 'Palavra-passe';
    }
}

function login() {
    const deptKey = document.getElementById('department-select').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!deptKey) {
        showToast('Por favor, selecione um departamento!', 'error');
        return;
    }

    if (!username || !password) {
        showToast('Por favor, preencha todos os campos!', 'error');
        return;
    }

    const dept = DEPARTAMENTOS[deptKey];
    
    // Validar credenciais
    if (username !== dept.username || password !== dept.password) {
        showToast('Credenciais incorretas! Verifique o utilizador e palavra-passe.', 'error');
        return;
    }

    currentDepartment = deptKey;

    // Configurar interface para o departamento
    configurarInterfaceDepartamento(dept);

    // Navegar para o dashboard correto
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');

    if (deptKey === 'traducao') {
        showSection('traducao-dashboard');
    } else {
        showSection('dashboard');
    }

    showToast(`Bem-vindo ao Departamento de ${dept.nome}!`);
}

function configurarInterfaceDepartamento(dept) {
    // Atualizar info do utilizador
    document.getElementById('user-name').textContent = dept.userName;
    document.getElementById('user-dept').textContent = dept.nome;
    
    // Atualizar avatar
    const avatar = document.querySelector('.user-avatar');
    avatar.innerHTML = `<i class="fas ${dept.icon}"></i>`;
    avatar.style.background = dept.cor + '20';
    avatar.style.color = dept.cor;

    // Mostrar/esconder menus
    document.querySelectorAll('.sidebar-nav ul').forEach(ul => {
        ul.style.display = 'none';
    });
    
    const menuAtivo = document.getElementById(dept.menu);
    if (menuAtivo) {
        menuAtivo.style.display = 'block';
    }

    // Atualizar breadcrumb
    document.getElementById('breadcrumb-text').textContent = `APSAN > ${dept.nome} > Dashboard`;
}

function logout() {
    if (confirm('Tem certeza que deseja terminar a sessão?')) {
        currentDepartment = null;
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
        
        // Resetar formulário de login
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('department-select').value = '';
        
        showToast('Sessão terminada com sucesso!');
    }
}

// ============================================
// NAVEGAÇÃO
// ============================================
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

function showSection(sectionId) {
    // Atualizar menu ativo
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Atualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'pacientes': 'Registo de Pacientes',
        'consultas': 'Consultas',
        'internamentos': 'Internamentos',
        'relatorios': 'Relatórios',
        'configuracoes': 'Configurações',
        'traducao-dashboard': 'Dashboard',
        'viagem-menores': 'Viagem para Menores',
        'traducao-documentos': 'Documentos Traduzidos',
        'traducao-clientes': 'Clientes'
    };
    
    const title = titles[sectionId] || sectionId;
    document.getElementById('page-title').textContent = title;

    // Atualizar breadcrumb
    if (currentDepartment && DEPARTAMENTOS[currentDepartment]) {
        const deptNome = DEPARTAMENTOS[currentDepartment].nome;
        document.getElementById('breadcrumb-text').textContent = `APSAN > ${deptNome} > ${title}`;
    }

    // Mostrar seção
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const section = document.getElementById('section-' + sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Atualizar stats se for dashboard
    if (sectionId === 'dashboard' || sectionId === 'traducao-dashboard') {
        updateStats();
    }
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

    const dateEl = document.getElementById('current-date');
    const timeEl = document.getElementById('current-time');
    
    if (dateEl) dateEl.textContent = now.toLocaleDateString('pt-PT', dateOptions);
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('pt-PT', timeOptions);
}

// ============================================
// PACIENTES - CRUD
// ============================================
function renderPacientes(filter = 'todos') {
    const tbody = document.getElementById('pacientes-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    let filteredPacientes = pacientes;
    if (filter !== 'todos') {
        filteredPacientes = pacientes.filter(p => p.estado === filter);
    }

    if (filteredPacientes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-inbox" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>
                Nenhum paciente registado. Clique em "Novo Paciente" para começar.
            </td>
        `;
        tbody.appendChild(tr);
        
        const pagination = document.getElementById('pagination-area');
        if (pagination) pagination.style.display = 'none';
        return;
    }

    const pagination = document.getElementById('pagination-area');
    if (pagination) pagination.style.display = 'flex';

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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
}

function filterPacientes(filter) {
    document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    renderPacientes(filter);
}

function searchPacientes() {
    const searchTerm = document.getElementById('search-pacientes').value.toLowerCase();
    const tbody = document.getElementById('pacientes-tbody');
    if (!tbody) return;
    
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
    const modal = document.getElementById('modal-' + modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById('modal-' + modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentEditingId = null;
}

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
    const nome = document.getElementById('pac-nome').value;
    const processo = document.getElementById('pac-processo').value;
    const nascimento = document.getElementById('pac-nascimento').value;
    const genero = document.getElementById('pac-genero').value;
    const telefone = document.getElementById('pac-telefone').value;

    if (!nome || !processo || !nascimento || !genero || !telefone) {
        showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }

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
        email: document.getElementById('pac-email')?.value || '',
        morada: document.getElementById('pac-morada')?.value || '',
        bi: document.getElementById('pac-bi')?.value || '',
        nif: document.getElementById('pac-nif')?.value || '',
        sangue: document.getElementById('pac-sangue')?.value || '',
        estadoCivil: document.getElementById('pac-estado-civil')?.value || '',
        alergias: document.getElementById('pac-alergias')?.value || '',
        emergenciaNome: document.getElementById('pac-emergencia-nome')?.value || '',
        emergenciaTelefone: document.getElementById('pac-emergencia-telefone')?.value || '',
        emergenciaParentesco: document.getElementById('pac-emergencia-parentesco')?.value || '',
        estado: 'ambulatorio',
        dataRegisto: new Date().toISOString().split('T')[0]
    };

    pacientes.push(novoPaciente);
    saveToLocalStorage();
    
    document.getElementById('form-paciente')?.reset();
    closeModal('novo-paciente');
    renderPacientes();
    updateStats();
    showToast('Paciente registado com sucesso!');
}

function editPaciente(id) {
    currentEditingId = id;
    const paciente = pacientes.find(p => p.id === id);
    
    if (!paciente) {
        showToast('Paciente não encontrado!', 'error');
        return;
    }

    const form = document.getElementById('form-editar-paciente');
    if (!form) return;
    
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

    paciente.nome = document.getElementById('edit-nome').value;
    paciente.processo = document.getElementById('edit-processo').value;
    paciente.nascimento = document.getElementById('edit-nascimento').value;
    paciente.genero = document.getElementById('edit-genero').value;
    paciente.telefone = document.getElementById('edit-telefone').value;
    paciente.email = document.getElementById('edit-email')?.value || '';
    paciente.morada = document.getElementById('edit-morada')?.value || '';
    paciente.bi = document.getElementById('edit-bi')?.value || '';
    paciente.nif = document.getElementById('edit-nif')?.value || '';
    paciente.sangue = document.getElementById('edit-sangue')?.value || '';
    paciente.alergias = document.getElementById('edit-alergias')?.value || '';
    paciente.estado = document.getElementById('edit-estado')?.value || 'ambulatorio';
    paciente.emergenciaNome = document.getElementById('edit-emergencia-nome')?.value || '';
    paciente.emergenciaTelefone = document.getElementById('edit-emergencia-telefone')?.value || '';
    paciente.emergenciaParentesco = document.getElementById('edit-emergencia-parentesco')?.value || '';

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
    updateStats();
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
    updateStats();
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
// VIAGEM PARA MENORES - NOTORIADO
// ============================================
function limparFormularioViagem() {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
        const inputs = document.querySelectorAll('#documento-viagem-menores input, #documento-viagem-menores textarea, #documento-viagem-menores select');
        inputs.forEach(input => {
            input.value = '';
        });
        showToast('Formulário limpo!');
    }
}

function salvarViagemMenores() {
    const dados = {
        id: Date.now(),
        notoriadoNumero: document.getElementById('notoriado-numero')?.value,
        notoriadoData: document.getElementById('notoriado-data')?.value,
        notoriadoLocal: document.getElementById('notoriado-local')?.value,
        notarioNome: document.getElementById('notario-nome')?.value,
        pai: {
            nome: document.getElementById('pai-nome')?.value,
            bi: document.getElementById('pai-bi')?.value,
            nascimento: document.getElementById('pai-nascimento')?.value,
            naturalidade: document.getElementById('pai-naturalidade')?.value,
            residencia: document.getElementById('pai-residencia')?.value,
            telefone: document.getElementById('pai-telefone')?.value,
            profissao: document.getElementById('pai-profissao')?.value
        },
        mae: {
            nome: document.getElementById('mae-nome')?.value,
            bi: document.getElementById('mae-bi')?.value,
            nascimento: document.getElementById('mae-nascimento')?.value,
            naturalidade: document.getElementById('mae-naturalidade')?.value,
            residencia: document.getElementById('mae-residencia')?.value,
            telefone: document.getElementById('mae-telefone')?.value,
            profissao: document.getElementById('mae-profissao')?.value
        },
        crianca: {
            nome: document.getElementById('crianca-nome')?.value,
            bi: document.getElementById('crianca-bi')?.value,
            nascimento: document.getElementById('crianca-nascimento')?.value,
            localNasc: document.getElementById('crianca-local-nasc')?.value,
            filiacaoPai: document.getElementById('crianca-filiacao-pai')?.value,
            filiacaoMae: document.getElementById('crianca-filiacao-mae')?.value,
            residencia: document.getElementById('crianca-residencia')?.value
        },
        viagem: {
            destino: document.getElementById('viagem-destino')?.value,
            finalidade: document.getElementById('viagem-finalidade')?.value,
            dataPartida: document.getElementById('viagem-data-partida')?.value,
            dataRegresso: document.getElementById('viagem-data-regresso')?.value,
            acompanhante: document.getElementById('viagem-acompanhante')?.value,
            parentesco: document.getElementById('viagem-parentesco')?.value,
            observacoes: document.getElementById('viagem-observacoes')?.value
        },
        assinaturas: {
            pai: document.getElementById('assinatura-pai')?.value,
            mae: document.getElementById('assinatura-mae')?.value,
            notario: document.getElementById('assinatura-notario')?.value
        },
        dataRegisto: new Date().toISOString()
    };

    // Validar campos obrigatórios
    if (!dados.pai.nome || !dados.mae.nome || !dados.crianca.nome) {
        showToast('Por favor, preencha pelo menos os nomes do Pai, Mãe e Criança!', 'error');
        return;
    }

    viagensMenores.push(dados);
    localStorage.setItem('apsan_viagens', JSON.stringify(viagensMenores));
    
    updateStats();
    showToast('Documento de viagem guardado com sucesso!');
}

function exportarViagemPDF() {
    // Verificar se há dados
    const paiNome = document.getElementById('pai-nome')?.value;
    if (!paiNome) {
        showToast('Preencha o formulário antes de exportar!', 'error');
        return;
    }

    // Guardar antes de exportar
    salvarViagemMenores();

    // Abrir janela de impressão (que permite salvar como PDF)
    window.print();
    
    showToast('A abrir pré-visualização para exportar PDF...');
}

// ============================================
// LOCAL STORAGE
// ============================================
function saveToLocalStorage() {
    localStorage.setItem('apsan_pacientes', JSON.stringify(pacientes));
}

// ============================================
// ESTATÍSTICAS
// ============================================
function updateStats() {
    // Stats Acompanhamento
    const statPacientes = document.getElementById('stat-pacientes');
    const statInternados = document.getElementById('stat-internados');
    
    if (statPacientes) statPacientes.textContent = pacientes.length;
    if (statInternados) statInternados.textContent = pacientes.filter(p => p.estado === 'internado').length;

    // Stats Tradução
    const statDocumentos = document.getElementById('stat-documentos');
    const statViagens = document.getElementById('stat-viagens');
    const statClientes = document.getElementById('stat-clientes');
    const statPendentes = document.getElementById('stat-pendentes');

    if (statDocumentos) statDocumentos.textContent = documentosTraduzidos.length;
    if (statViagens) statViagens.textContent = viagensMenores.length;
    if (statClientes) statClientes.textContent = clientesTraducao.length;
    if (statPendentes) statPendentes.textContent = '0';
}

// ============================================
// UTILITÁRIOS
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('i');

    if (!toast || !toastMessage) return;

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
    if (pacientes.length === 0) {
        showToast('Não há dados para exportar!', 'error');
        return;
    }
    
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
// FILE UPLOAD
// ============================================
function handleFileUpload(input, context) {
    const file = input.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showToast('Ficheiro muito grande! Máximo 10MB.', 'error');
        input.value = '';
        return;
    }

    const preview = document.getElementById('file-preview-' + context);
    const nameEl = document.getElementById('file-name-' + context);
    const sizeEl = document.getElementById('file-size-' + context);

    if (preview) preview.style.display = 'flex';
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatFileSize(file.size);

    showToast(`Ficheiro "${file.name}" carregado com sucesso!`);
}

function removeFile(context) {
    const input = document.getElementById('pac-historico');
    const preview = document.getElementById('file-preview-' + context);
    
    if (input) input.value = '';
    if (preview) preview.style.display = 'none';
    
    showToast('Ficheiro removido.');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    let html = '';
    daysOfWeek.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day other-month"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate();
        const hasEvent = [5, 12, 15, 22, 28].includes(day);
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
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
});

/**
 * APSAN, Lda - Sistema de Gestão
 * JavaScript Principal - VERSÃO CORRIGIDA v2.0
 * Departamentos: Acompanhamento Hospitalar, Tradução, Administrativo, Financeiro
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
        menu: "menu-administrativo",
        cor: "#64748b",
        userName: "Adm. Carlos",
        icon: "fa-user-tie"
    },
    financeiro: {
        nome: "Financeiro",
        username: "financeiro.apsan",
        password: "fin2026",
        menu: "menu-financeiro",
        cor: "#059669",
        userName: "Fin. João",
        icon: "fa-chart-line"
    }
};

let currentDepartment = null;
let currentEditingId = null;
let currentLang = 'pt';

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
    const dept = document.getElementById('department-select');
    if (!dept) return;
    const deptKey = dept.value;
    const loginBtn = document.querySelector('.btn-login');

    if (deptKey && DEPARTAMENTOS[deptKey]) {
        if (loginBtn) loginBtn.style.background = DEPARTAMENTOS[deptKey].cor;
        const userEl = document.getElementById('username');
        const passEl = document.getElementById('password');
        if (userEl) userEl.value = DEPARTAMENTOS[deptKey].username;
        if (passEl) {
            passEl.value = '';
            passEl.placeholder = 'Palavra-passe';
        }
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

    if (username !== dept.username || password !== dept.password) {
        showToast('Credenciais incorretas! Verifique o utilizador e palavra-passe.', 'error');
        return;
    }

    currentDepartment = deptKey;
    configurarInterfaceDepartamento(dept);

    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');

    // Redirecionar para o dashboard correto do departamento
    if (deptKey === 'traducao') {
        showSection('traducao-dashboard');
    } else if (deptKey === 'administrativo') {
        showSection('admin-dashboard');
    } else if (deptKey === 'financeiro') {
        showSection('fin-dashboard');
    } else {
        showSection('dashboard');
    }

    showToast('Bem-vindo ao Departamento de ' + dept.nome + '!');
}

function configurarInterfaceDepartamento(dept) {
    document.getElementById('user-name').textContent = dept.userName;
    document.getElementById('user-dept').textContent = dept.nome;

    const avatar = document.querySelector('.user-avatar');
    avatar.innerHTML = '<i class="fas ' + dept.icon + '"></i>';
    avatar.style.background = dept.cor + '20';
    avatar.style.color = dept.cor;

    // Esconder TODOS os menus
    document.querySelectorAll('.sidebar-nav ul').forEach(function(ul) {
        ul.style.display = 'none';
    });

    // Mostrar apenas o menu do departamento atual
    const menuAtivo = document.getElementById(dept.menu);
    if (menuAtivo) {
        menuAtivo.style.display = 'block';
    }

    document.getElementById('breadcrumb-text').textContent = 'APSAN > ' + dept.nome + ' > Dashboard';
}

function logout() {
    if (confirm('Tem certeza que deseja terminar a sessão?')) {
        currentDepartment = null;
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');

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
    document.querySelectorAll('.sidebar-nav li').forEach(function(li) {
        li.classList.remove('active');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Mapeamento completo de títulos para todas as secções
    const titles = {
        // Acompanhamento Hospitalar
        'dashboard': 'Dashboard',
        'pacientes': 'Registo de Pacientes',
        'consultas': 'Consultas',
        'internamentos': 'Internamentos',
        'relatorios': 'Relatórios',
        // Tradução
        'traducao-dashboard': 'Dashboard',
        'viagem-menores': 'Viagem para Menores',
        'traducao-documentos': 'Documentos Traduzidos',
        'traducao-clientes': 'Clientes',
        // Administrativo
        'admin-dashboard': 'Dashboard',
        'admin-funcionarios': 'Funcionários',
        'admin-departamentos': 'Departamentos',
        'admin-documentos': 'Documentos Internos',
        'admin-relatorios': 'Relatórios Gerais',
        // Financeiro
        'fin-dashboard': 'Dashboard',
        'fin-faturacao': 'Faturação',
        'fin-pagamentos': 'Pagamentos',
        'fin-orcamento': 'Orçamento',
        'fin-relatorios': 'Relatórios Financeiros',
        // Comum
        'configuracoes': 'Configurações'
    };

    const title = titles[sectionId] || sectionId;
    document.getElementById('page-title').textContent = title;

    if (currentDepartment && DEPARTAMENTOS[currentDepartment]) {
        const deptNome = DEPARTAMENTOS[currentDepartment].nome;
        document.getElementById('breadcrumb-text').textContent = 'APSAN > ' + deptNome + ' > ' + title;
    }

    // Esconder TODAS as secções
    document.querySelectorAll('.content-section').forEach(function(section) {
        section.classList.remove('active');
    });

    // Mostrar a secção solicitada
    const section = document.getElementById('section-' + sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Atualizar estatísticas se for dashboard
    if (sectionId === 'dashboard' || sectionId === 'traducao-dashboard' || 
        sectionId === 'admin-dashboard' || sectionId === 'fin-dashboard') {
        updateStats();
    }
}

// ============================================
// TROCA DE IDIOMA
// ============================================
function switchLanguage(lang) {
    currentLang = lang;

    document.getElementById('tab-pt').classList.toggle('active', lang === 'pt');
    document.getElementById('tab-en').classList.toggle('active', lang === 'en');

    document.getElementById('doc-pt').style.display = lang === 'pt' ? 'block' : 'none';
    document.getElementById('doc-en').style.display = lang === 'en' ? 'block' : 'none';
}

// ============================================
// DATA E HORA
// ============================================
function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const dateEl = document.getElementById('current-date');
    const timeEl = document.getElementById('current-time');

    if (dateEl) dateEl.textContent = now.toLocaleDateString('pt-PT', dateOptions);
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('pt-PT', timeOptions);
}

// ============================================
// PACIENTES - CRUD
// ============================================
function renderPacientes(filter) {
    if (!filter) filter = 'todos';
    const tbody = document.getElementById('pacientes-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    let filteredPacientes = pacientes;
    if (filter !== 'todos') {
        filteredPacientes = pacientes.filter(function(p) { return p.estado === filter; });
    }

    if (filteredPacientes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;"><i class="fas fa-inbox" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>Nenhum paciente registado. Clique em "Novo Paciente" para começar.</td>';
        tbody.appendChild(tr);

        const pagination = document.getElementById('pagination-area');
        if (pagination) pagination.style.display = 'none';
        return;
    }

    const pagination = document.getElementById('pagination-area');
    if (pagination) pagination.style.display = 'flex';

    filteredPacientes.forEach(function(paciente) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + paciente.processo + '</strong></td><td>' + paciente.nome + '</td><td>' + paciente.idade + ' anos</td><td>' + (paciente.genero === 'M' ? 'Masculino' : paciente.genero === 'F' ? 'Feminino' : 'Outro') + '</td><td>' + paciente.telefone + '</td><td><span class="status-badge ' + paciente.estado + '">' + getStatusLabel(paciente.estado) + '</span></td><td>' + formatDate(paciente.dataRegisto) + '</td><td><div class="action-btns"><button class="btn-action view" onclick="viewPaciente(' + paciente.id + ')" title="Ver detalhes"><i class="fas fa-eye"></i></button><button class="btn-action edit" onclick="editPaciente(' + paciente.id + ')" title="Editar"><i class="fas fa-edit"></i></button><button class="btn-action delete" onclick="confirmDeletePaciente(' + paciente.id + ')" title="Eliminar"><i class="fas fa-trash"></i></button></div></td>';
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
    document.querySelectorAll('.filter-tabs .tab').forEach(function(tab) {
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

    Array.from(rows).forEach(function(row) {
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
        document.querySelectorAll('.modal.active').forEach(function(modal) {
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
        email: document.getElementById('pac-email') ? document.getElementById('pac-email').value : '',
        morada: document.getElementById('pac-morada') ? document.getElementById('pac-morada').value : '',
        bi: document.getElementById('pac-bi') ? document.getElementById('pac-bi').value : '',
        nif: document.getElementById('pac-nif') ? document.getElementById('pac-nif').value : '',
        sangue: document.getElementById('pac-sangue') ? document.getElementById('pac-sangue').value : '',
        estadoCivil: document.getElementById('pac-estado-civil') ? document.getElementById('pac-estado-civil').value : '',
        alergias: document.getElementById('pac-alergias') ? document.getElementById('pac-alergias').value : '',
        emergenciaNome: document.getElementById('pac-emergencia-nome') ? document.getElementById('pac-emergencia-nome').value : '',
        emergenciaTelefone: document.getElementById('pac-emergencia-telefone') ? document.getElementById('pac-emergencia-telefone').value : '',
        emergenciaParentesco: document.getElementById('pac-emergencia-parentesco') ? document.getElementById('pac-emergencia-parentesco').value : '',
        estado: 'ambulatorio',
        dataRegisto: new Date().toISOString().split('T')[0]
    };

    pacientes.push(novoPaciente);
    saveToLocalStorage();

    const form = document.getElementById('form-paciente');
    if (form) form.reset();
    closeModal('novo-paciente');
    renderPacientes();
    updateStats();
    showToast('Paciente registado com sucesso!');
}

function editPaciente(id) {
    currentEditingId = id;
    const paciente = pacientes.find(function(p) { return p.id === id; });

    if (!paciente) {
        showToast('Paciente não encontrado!', 'error');
        return;
    }

    const form = document.getElementById('form-editar-paciente');
    if (!form) return;

    form.innerHTML = '<div class="form-section"><h4><i class="fas fa-id-card"></i> Dados Pessoais</h4><div class="form-row"><div class="form-group"><label>Nome Completo <span class="required">*</span></label><input type="text" id="edit-nome" value="' + (paciente.nome || '') + '" required></div><div class="form-group"><label>Nº Processo <span class="required">*</span></label><input type="text" id="edit-processo" value="' + (paciente.processo || '') + '" required></div></div><div class="form-row"><div class="form-group"><label>Data de Nascimento <span class="required">*</span></label><input type="date" id="edit-nascimento" value="' + (paciente.nascimento || '') + '" required></div><div class="form-group"><label>Género <span class="required">*</span></label><select id="edit-genero" required><option value="M" ' + (paciente.genero === 'M' ? 'selected' : '') + '>Masculino</option><option value="F" ' + (paciente.genero === 'F' ? 'selected' : '') + '>Feminino</option><option value="O" ' + (paciente.genero === 'O' ? 'selected' : '') + '>Outro</option></select></div></div><div class="form-row"><div class="form-group"><label>Nº Bilhete de Identidade</label><input type="text" id="edit-bi" value="' + (paciente.bi || '') + '"></div><div class="form-group"><label>NIF</label><input type="text" id="edit-nif" value="' + (paciente.nif || '') + '"></div></div></div><div class="form-section"><h4><i class="fas fa-phone"></i> Contactos</h4><div class="form-row"><div class="form-group"><label>Telefone Principal <span class="required">*</span></label><input type="tel" id="edit-telefone" value="' + (paciente.telefone || '') + '" required></div><div class="form-group"><label>Telefone Alternativo</label><input type="tel" id="edit-telefone-alt" value="' + (paciente.telefoneAlt || '') + '"></div></div><div class="form-row"><div class="form-group"><label>Email</label><input type="email" id="edit-email" value="' + (paciente.email || '') + '"></div><div class="form-group"><label>Morada</label><input type="text" id="edit-morada" value="' + (paciente.morada || '') + '"></div></div></div><div class="form-section"><h4><i class="fas fa-heartbeat"></i> Dados Clínicos</h4><div class="form-row"><div class="form-group"><label>Tipo Sanguíneo</label><select id="edit-sangue"><option value="">Desconhecido</option><option value="A+" ' + (paciente.sangue === 'A+' ? 'selected' : '') + '>A+</option><option value="A-" ' + (paciente.sangue === 'A-' ? 'selected' : '') + '>A-</option><option value="B+" ' + (paciente.sangue === 'B+' ? 'selected' : '') + '>B+</option><option value="B-" ' + (paciente.sangue === 'B-' ? 'selected' : '') + '>B-</option><option value="AB+" ' + (paciente.sangue === 'AB+' ? 'selected' : '') + '>AB+</option><option value="AB-" ' + (paciente.sangue === 'AB-' ? 'selected' : '') + '>AB-</option><option value="O+" ' + (paciente.sangue === 'O+' ? 'selected' : '') + '>O+</option><option value="O-" ' + (paciente.sangue === 'O-' ? 'selected' : '') + '>O-</option></select></div><div class="form-group"><label>Estado</label><select id="edit-estado"><option value="internado" ' + (paciente.estado === 'internado' ? 'selected' : '') + '>Internado</option><option value="ambulatorio" ' + (paciente.estado === 'ambulatorio' ? 'selected' : '') + '>Ambulatório</option><option value="alta" ' + (paciente.estado === 'alta' ? 'selected' : '') + '>Alta Médica</option><option value="urgente" ' + (paciente.estado === 'urgente' ? 'selected' : '') + '>Urgente</option></select></div></div><div class="form-group full-width"><label>Alergias / Condições Especiais</label><textarea id="edit-alergias" rows="3">' + (paciente.alergias || '') + '</textarea></div></div><div class="form-section"><h4><i class="fas fa-user-friends"></i> Contacto de Emergência</h4><div class="form-row"><div class="form-group"><label>Nome do Contacto</label><input type="text" id="edit-emergencia-nome" value="' + (paciente.emergenciaNome || '') + '"></div><div class="form-group"><label>Telefone de Emergência</label><input type="tel" id="edit-emergencia-telefone" value="' + (paciente.emergenciaTelefone || '') + '"></div></div><div class="form-group full-width"><label>Parentesco</label><select id="edit-emergencia-parentesco"><option value="">Selecione</option><option value="conjuge" ' + (paciente.emergenciaParentesco === 'conjuge' ? 'selected' : '') + '>Cônjuge</option><option value="filho" ' + (paciente.emergenciaParentesco === 'filho' ? 'selected' : '') + '>Filho(a)</option><option value="pai" ' + (paciente.emergenciaParentesco === 'pai' ? 'selected' : '') + '>Pai/Mãe</option><option value="irmao" ' + (paciente.emergenciaParentesco === 'irmao' ? 'selected' : '') + '>Irmão(ã)</option><option value="outro" ' + (paciente.emergenciaParentesco === 'outro' ? 'selected' : '') + '>Outro</option></select></div></div>';

    openModal('editar-paciente');
}

function updatePaciente() {
    if (!currentEditingId) return;

    const paciente = pacientes.find(function(p) { return p.id === currentEditingId; });
    if (!paciente) return;

    paciente.nome = document.getElementById('edit-nome').value;
    paciente.processo = document.getElementById('edit-processo').value;
    paciente.nascimento = document.getElementById('edit-nascimento').value;
    paciente.genero = document.getElementById('edit-genero').value;
    paciente.telefone = document.getElementById('edit-telefone').value;
    paciente.email = document.getElementById('edit-email') ? document.getElementById('edit-email').value : '';
    paciente.morada = document.getElementById('edit-morada') ? document.getElementById('edit-morada').value : '';
    paciente.bi = document.getElementById('edit-bi') ? document.getElementById('edit-bi').value : '';
    paciente.nif = document.getElementById('edit-nif') ? document.getElementById('edit-nif').value : '';
    paciente.sangue = document.getElementById('edit-sangue') ? document.getElementById('edit-sangue').value : '';
    paciente.alergias = document.getElementById('edit-alergias') ? document.getElementById('edit-alergias').value : '';
    paciente.estado = document.getElementById('edit-estado') ? document.getElementById('edit-estado').value : 'ambulatorio';
    paciente.emergenciaNome = document.getElementById('edit-emergencia-nome') ? document.getElementById('edit-emergencia-nome').value : '';
    paciente.emergenciaTelefone = document.getElementById('edit-emergencia-telefone') ? document.getElementById('edit-emergencia-telefone').value : '';
    paciente.emergenciaParentesco = document.getElementById('edit-emergencia-parentesco') ? document.getElementById('edit-emergencia-parentesco').value : '';

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
    pacientes = pacientes.filter(function(p) { return p.id !== id; });
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
    const paciente = pacientes.find(function(p) { return p.id === id; });
    if (!paciente) return;

    alert('\n📋 FICHA DO PACIENTE\n═══════════════════════════════════════\n\n🆔 Nº Processo: ' + paciente.processo + '\n👤 Nome: ' + paciente.nome + '\n🎂 Data Nasc.: ' + formatDate(paciente.nascimento) + ' (' + paciente.idade + ' anos)\n⚧ Género: ' + (paciente.genero === 'M' ? 'Masculino' : paciente.genero === 'F' ? 'Feminino' : 'Outro') + '\n🩸 Tipo Sanguíneo: ' + (paciente.sangue || 'Desconhecido') + '\n\n📞 Contactos:\n   Tel: ' + paciente.telefone + '\n   Email: ' + (paciente.email || 'N/A') + '\n   Morada: ' + (paciente.morada || 'N/A') + '\n\n🏥 Estado: ' + getStatusLabel(paciente.estado) + '\n📅 Registado em: ' + formatDate(paciente.dataRegisto) + '\n\n⚠️ Alergias: ' + (paciente.alergias || 'Nenhuma registrada') + '\n\n🚨 Emergência:\n   Contacto: ' + (paciente.emergenciaNome || 'N/A') + '\n   Tel: ' + (paciente.emergenciaTelefone || 'N/A') + '\n   Parentesco: ' + (paciente.emergenciaParentesco || 'N/A') + '\n    ');
}

// ============================================
// VIAGEM PARA MENORES - NOTORIADO
// ============================================

function getFieldValue(id) {
    const prefix = currentLang === 'pt' ? 'pt-' : 'en-';
    const el = document.getElementById(prefix + id);
    return el ? el.value.trim() : '';
}

function validarCampoObrigatorio(id, nomeCampo) {
    const prefix = currentLang === 'pt' ? 'pt-' : 'en-';
    const el = document.getElementById(prefix + id);
    if (!el) {
        console.warn('⚠️ Campo "' + prefix + id + '" não encontrado no HTML.');
        return false;
    }
    if (!el.value.trim()) {
        el.classList.add('campo-erro');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var removerErro = function() {
            el.classList.remove('campo-erro');
            el.removeEventListener('input', removerErro);
        };
        el.addEventListener('input', removerErro);
        showToast('Campo obrigatório em falta: ' + nomeCampo, 'error');
        el.focus();
        return false;
    }
    el.classList.remove('campo-erro');
    return true;
}

function limparFormularioViagem() {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
        const prefix = currentLang === 'pt' ? 'pt-' : 'en-';
        const inputs = document.querySelectorAll('[id^="' + prefix + '"]');
        inputs.forEach(function(input) {
            input.value = '';
            input.classList.remove('campo-erro');
        });
        showToast('Formulário limpo!');
    }
}

function salvarViagemMenores() {
    var camposPT = [
        { id: 'pai-nome', nome: 'Nome do Pai' },
        { id: 'pai-bi', nome: 'BI do Pai' },
        { id: 'pai-nascimento', nome: 'Data de Nascimento do Pai' },
        { id: 'mae-nome', nome: 'Nome da Mãe' },
        { id: 'mae-bi', nome: 'BI da Mãe' },
        { id: 'mae-nascimento', nome: 'Data de Nascimento da Mãe' },
        { id: 'crianca-nome', nome: 'Nome da Criança' },
        { id: 'crianca-nascimento', nome: 'Data de Nascimento da Criança' },
        { id: 'viagem-destino', nome: 'Destino da Viagem' },
        { id: 'viagem-data-partida', nome: 'Data de Partida' }
    ];

    var camposEN = [
        { id: 'pai-nome', nome: "Father's Name" },
        { id: 'pai-bi', nome: "Father's ID" },
        { id: 'pai-nascimento', nome: "Father's Birth Date" },
        { id: 'mae-nome', nome: "Mother's Name" },
        { id: 'mae-bi', nome: "Mother's ID" },
        { id: 'mae-nascimento', nome: "Mother's Birth Date" },
        { id: 'crianca-nome', nome: "Child's Name" },
        { id: 'crianca-nascimento', nome: "Child's Birth Date" },
        { id: 'viagem-destino', nome: 'Travel Destination' },
        { id: 'viagem-data-partida', nome: 'Departure Date' }
    ];

    var camposObrigatorios = currentLang === 'pt' ? camposPT : camposEN;

    for (var i = 0; i < camposObrigatorios.length; i++) {
        if (!validarCampoObrigatorio(camposObrigatorios[i].id, camposObrigatorios[i].nome)) {
            return false;
        }
    }

    var dados = {
        id: Date.now(),
        idioma: currentLang,
        notoriado: {
            numero: getFieldValue('notoriado-numero'),
            data: getFieldValue('notoriado-data'),
            local: getFieldValue('notoriado-local'),
            notario: getFieldValue('notario-nome')
        },
        pai: {
            nome: getFieldValue('pai-nome'),
            bi: getFieldValue('pai-bi'),
            nascimento: getFieldValue('pai-nascimento'),
            naturalidade: getFieldValue('pai-naturalidade'),
            residencia: getFieldValue('pai-residencia'),
            telefone: getFieldValue('pai-telefone'),
            profissao: getFieldValue('pai-profissao')
        },
        mae: {
            nome: getFieldValue('mae-nome'),
            bi: getFieldValue('mae-bi'),
            nascimento: getFieldValue('mae-nascimento'),
            naturalidade: getFieldValue('mae-naturalidade'),
            residencia: getFieldValue('mae-residencia'),
            telefone: getFieldValue('mae-telefone'),
            profissao: getFieldValue('mae-profissao')
        },
        crianca: {
            nome: getFieldValue('crianca-nome'),
            bi: getFieldValue('crianca-bi'),
            nascimento: getFieldValue('crianca-nascimento'),
            localNasc: getFieldValue('crianca-local-nasc'),
            filiacaoPai: getFieldValue('crianca-filiacao-pai'),
            filiacaoMae: getFieldValue('crianca-filiacao-mae'),
            residencia: getFieldValue('crianca-residencia')
        },
        viagem: {
            destino: getFieldValue('viagem-destino'),
            finalidade: getFieldValue('viagem-finalidade'),
            dataPartida: getFieldValue('viagem-data-partida'),
            dataRegresso: getFieldValue('viagem-data-regresso'),
            acompanhante: getFieldValue('viagem-acompanhante'),
            parentesco: getFieldValue('viagem-parentesco'),
            observacoes: getFieldValue('viagem-observacoes')
        },
        assinaturas: {
            pai: getFieldValue('assinatura-pai'),
            mae: getFieldValue('assinatura-mae'),
            notario: getFieldValue('assinatura-notario')
        },
        dataRegisto: new Date().toISOString()
    };

    viagensMenores.push(dados);
    localStorage.setItem('apsan_viagens', JSON.stringify(viagensMenores));

    updateStats();
    var msg = currentLang === 'pt' ? 'Documento de viagem guardado com sucesso!' : 'Travel document saved successfully!';
    showToast(msg);
    console.log('Viagem guardada:', dados);
    return true;
}

function exportarViagemPDF() {
    var sucesso = salvarViagemMenores();
    if (!sucesso) {
        return;
    }
    window.print();
    var msg = currentLang === 'pt' ? 'A abrir pré-visualização para exportar PDF...' : 'Opening print preview for PDF export...';
    showToast(msg);
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
    var statPacientes = document.getElementById('stat-pacientes');
    var statInternados = document.getElementById('stat-internados');

    if (statPacientes) statPacientes.textContent = pacientes.length;
    if (statInternados) statInternados.textContent = pacientes.filter(function(p) { return p.estado === 'internado'; }).length;

    var statDocumentos = document.getElementById('stat-documentos');
    var statViagens = document.getElementById('stat-viagens');
    var statClientes = document.getElementById('stat-clientes');
    var statPendentes = document.getElementById('stat-pendentes');

    if (statDocumentos) statDocumentos.textContent = documentosTraduzidos.length;
    if (statViagens) statViagens.textContent = viagensMenores.length;
    if (statClientes) statClientes.textContent = clientesTraducao.length;
    if (statPendentes) statPendentes.textContent = '0';
}

// ============================================
// UTILITÁRIOS
// ============================================
function showToast(message, type) {
    if (!type) type = 'success';
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

    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

function exportData() {
    if (pacientes.length === 0) {
        showToast('Não há dados para exportar!', 'error');
        return;
    }

    var dataStr = JSON.stringify(pacientes, null, 2);
    var dataBlob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(dataBlob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'apsan_pacientes_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Dados exportados com sucesso!');
}

function exportFuncionarios() {
    showToast('Funcionalidade de exportação de funcionários em desenvolvimento!');
}

function generateReport(type) {
    showToast('A gerar relatório ' + type + '...');
    setTimeout(function() {
        alert('Relatório ' + type + ' gerado com sucesso!\n\nEm produção, este relatório seria exportado em PDF/Excel.');
    }, 1000);
}

function saveSettings() {
    showToast('Configurações guardadas com sucesso!');
}

// ============================================
// FILE UPLOAD
// ============================================
function handleFileUpload(input, context) {
    var file = input.files[0];
    if (!file) return;

    var maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showToast('Ficheiro muito grande! Máximo 10MB.', 'error');
        input.value = '';
        return;
    }

    var preview = document.getElementById('file-preview-' + context);
    var nameEl = document.getElementById('file-name-' + context);
    var sizeEl = document.getElementById('file-size-' + context);

    if (preview) preview.style.display = 'flex';
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatFileSize(file.size);

    showToast('Ficheiro "' + file.name + '" carregado com sucesso!');
}

function removeFile(context) {
    var input = document.getElementById('pac-historico');
    var preview = document.getElementById('file-preview-' + context);

    if (input) input.value = '';
    if (preview) preview.style.display = 'none';

    showToast('Ficheiro removido.');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// CALENDÁRIO
// ============================================
function renderCalendar() {
    var calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    var daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    var today = new Date();
    var currentMonth = today.getMonth();
    var currentYear = today.getFullYear();

    var html = '';
    daysOfWeek.forEach(function(day) {
        html += '<div class="calendar-day-header">' + day + '</div>';
    });

    var firstDay = new Date(currentYear, currentMonth, 1).getDay();
    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (var i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day other-month"></div>';
    }

    for (var day = 1; day <= daysInMonth; day++) {
        var isToday = day === today.getDate();
        var hasEvent = [5, 12, 15, 22, 28].indexOf(day) !== -1;
        var classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (hasEvent) classes.push('has-event');

        html += '<div class="' + classes.join(' ') + '">' + day + '</div>';
    }

    calendarGrid.innerHTML = html;
}

// ============================================
// INICIALIZAÇÃO DE EVENTOS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function() {
            document.querySelectorAll('.modal.active').forEach(function(modal) {
                modal.classList.remove('active');
            });
        });
    });
});

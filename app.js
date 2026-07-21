/**
 * APSAN, Lda - Sistema de Gestão v2.1
 * JavaScript Principal - Sincronização automática + Exportação limpa
 */

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
    setupSyncListeners();

    const savedPacientes = localStorage.getItem('apsan_pacientes');
    if (savedPacientes) { pacientes = JSON.parse(savedPacientes); renderPacientes(); updateStats(); }
    const savedViagens = localStorage.getItem('apsan_viagens');
    if (savedViagens) { viagensMenores = JSON.parse(savedViagens); }
});

// ============================================
// SINCRONIZAÇÃO AUTOMÁTICA DOS CAMPOS
// ============================================
function setupSyncListeners() {
    // PT - sincronizar campos da declaração
    var camposPT = ['pt-pai-nome', 'pt-mae-nome', 'pt-crianca-nome', 'pt-viagem-destino', 'pt-viagem-acompanhante', 'pt-viagem-data-partida', 'pt-viagem-data-regresso'];
    camposPT.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', syncDeclaracaoPT);
    });

    // EN - sincronizar campos da declaração
    var camposEN = ['en-pai-nome', 'en-mae-nome', 'en-crianca-nome', 'en-viagem-destino', 'en-viagem-acompanhante', 'en-viagem-data-partida', 'en-viagem-data-regresso'];
    camposEN.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', syncDeclaracaoEN);
    });
}

function syncDeclaracaoPT() {
    var crianca = document.getElementById('pt-crianca-nome');
    var destino = document.getElementById('pt-viagem-destino');
    var acomp = document.getElementById('pt-viagem-acompanhante');
    var partida = document.getElementById('pt-viagem-data-partida');
    var regresso = document.getElementById('pt-viagem-data-regresso');
    var pai = document.getElementById('pt-pai-nome');
    var mae = document.getElementById('pt-mae-nome');

    var syncCrianca = document.getElementById('sync-pt-crianca-nome');
    var syncDestino = document.getElementById('sync-pt-destino');
    var syncAcomp = document.getElementById('sync-pt-acompanhante');
    var syncPartida = document.getElementById('sync-pt-data-inicio');
    var syncRegresso = document.getElementById('sync-pt-data-fim');
    var syncPai = document.getElementById('sync-pt-ass-pai');
    var syncMae = document.getElementById('sync-pt-ass-mae');

    if (syncCrianca && crianca) syncCrianca.textContent = crianca.value || '____________________';
    if (syncDestino && destino) syncDestino.textContent = destino.value || '____________________';
    if (syncAcomp && acomp) syncAcomp.textContent = acomp.value || '____________________';
    if (syncPartida && partida) syncPartida.textContent = formatDatePT(partida.value) || '____________________';
    if (syncRegresso && regresso) syncRegresso.textContent = formatDatePT(regresso.value) || '____________________';
    if (syncPai && pai) syncPai.textContent = pai.value || '';
    if (syncMae && mae) syncMae.textContent = mae.value || '';
}

function syncDeclaracaoEN() {
    var crianca = document.getElementById('en-crianca-nome');
    var destino = document.getElementById('en-viagem-destino');
    var acomp = document.getElementById('en-viagem-acompanhante');
    var partida = document.getElementById('en-viagem-data-partida');
    var regresso = document.getElementById('en-viagem-data-regresso');
    var pai = document.getElementById('en-pai-nome');
    var mae = document.getElementById('en-mae-nome');

    var syncCrianca = document.getElementById('sync-en-crianca-nome');
    var syncDestino = document.getElementById('sync-en-destino');
    var syncAcomp = document.getElementById('sync-en-acompanhante');
    var syncPartida = document.getElementById('sync-en-data-inicio');
    var syncRegresso = document.getElementById('sync-en-data-fim');
    var syncPai = document.getElementById('sync-en-ass-pai');
    var syncMae = document.getElementById('sync-en-ass-mae');

    if (syncCrianca && crianca) syncCrianca.textContent = crianca.value || '____________________';
    if (syncDestino && destino) syncDestino.textContent = destino.value || '____________________';
    if (syncAcomp && acomp) syncAcomp.textContent = acomp.value || '____________________';
    if (syncPartida && partida) syncPartida.textContent = formatDatePT(partida.value) || '____________________';
    if (syncRegresso && regresso) syncRegresso.textContent = formatDatePT(regresso.value) || '____________________';
    if (syncPai && pai) syncPai.textContent = pai.value || '';
    if (syncMae && mae) syncMae.textContent = mae.value || '';
}

function formatDatePT(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return d.getDate() + ' de ' + getMonthNamePT(d.getMonth()) + ' de ' + d.getFullYear();
}

function getMonthNamePT(month) {
    var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[month];
}

// ============================================
// LOGIN
// ============================================
function updateDepartmentTheme() {
    var dept = document.getElementById('department-select');
    if (!dept) return;
    var deptKey = dept.value;
    var loginBtn = document.querySelector('.btn-login');
    if (deptKey && DEPARTAMENTOS[deptKey]) {
        if (loginBtn) loginBtn.style.background = DEPARTAMENTOS[deptKey].cor;
        var userEl = document.getElementById('username');
        var passEl = document.getElementById('password');
        if (userEl) userEl.value = DEPARTAMENTOS[deptKey].username;
        if (passEl) { passEl.value = ''; passEl.placeholder = 'Palavra-passe'; }
    }
}

function login() {
    var deptKey = document.getElementById('department-select').value;
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;

    if (!deptKey) { showToast('Por favor, selecione um departamento!', 'error'); return; }
    if (!username || !password) { showToast('Por favor, preencha todos os campos!', 'error'); return; }

    var dept = DEPARTAMENTOS[deptKey];
    if (username !== dept.username || password !== dept.password) {
        showToast('Credenciais incorretas! Verifique o utilizador e palavra-passe.', 'error');
        return;
    }

    currentDepartment = deptKey;
    configurarInterfaceDepartamento(dept);
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');

    if (deptKey === 'traducao') showSection('traducao-dashboard');
    else if (deptKey === 'administrativo') showSection('admin-dashboard');
    else if (deptKey === 'financeiro') showSection('fin-dashboard');
    else showSection('dashboard');

    showToast('Bem-vindo ao Departamento de ' + dept.nome + '!');
}

function configurarInterfaceDepartamento(dept) {
    document.getElementById('user-name').textContent = dept.userName;
    document.getElementById('user-dept').textContent = dept.nome;
    var avatar = document.querySelector('.user-avatar');
    avatar.innerHTML = '<i class="fas ' + dept.icon + '"></i>';
    avatar.style.background = dept.cor + '20';
    avatar.style.color = dept.cor;
    document.querySelectorAll('.sidebar-nav ul').forEach(function(ul) { ul.style.display = 'none'; });
    var menuAtivo = document.getElementById(dept.menu);
    if (menuAtivo) menuAtivo.style.display = 'block';
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
    document.querySelectorAll('.sidebar-nav li').forEach(function(li) { li.classList.remove('active'); });
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    var titles = {
        'dashboard': 'Dashboard', 'pacientes': 'Registo de Pacientes', 'consultas': 'Consultas',
        'internamentos': 'Internamentos', 'relatorios': 'Relatórios',
        'traducao-dashboard': 'Dashboard', 'viagem-menores': 'Viagem para Menores',
        'traducao-documentos': 'Documentos Traduzidos', 'traducao-clientes': 'Clientes',
        'admin-dashboard': 'Dashboard', 'admin-funcionarios': 'Funcionários',
        'admin-departamentos': 'Departamentos', 'admin-documentos': 'Documentos Internos',
        'admin-relatorios': 'Relatórios Gerais',
        'fin-dashboard': 'Dashboard', 'fin-faturacao': 'Faturação', 'fin-pagamentos': 'Pagamentos',
        'fin-orcamento': 'Orçamento', 'fin-relatorios': 'Relatórios Financeiros',
        'configuracoes': 'Configurações'
    };

    var title = titles[sectionId] || sectionId;
    document.getElementById('page-title').textContent = title;
    if (currentDepartment && DEPARTAMENTOS[currentDepartment]) {
        document.getElementById('breadcrumb-text').textContent = 'APSAN > ' + DEPARTAMENTOS[currentDepartment].nome + ' > ' + title;
    }

    document.querySelectorAll('.content-section').forEach(function(s) { s.classList.remove('active'); });
    var section = document.getElementById('section-' + sectionId);
    if (section) section.classList.add('active');

    if (sectionId === 'dashboard' || sectionId === 'traducao-dashboard' || sectionId === 'admin-dashboard' || sectionId === 'fin-dashboard') {
        updateStats();
    }
}

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
    var now = new Date();
    var dateEl = document.getElementById('current-date');
    var timeEl = document.getElementById('current-time');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ============================================
// PACIENTES - CRUD
// ============================================
function renderPacientes(filter) {
    if (!filter) filter = 'todos';
    var tbody = document.getElementById('pacientes-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var filtered = pacientes;
    if (filter !== 'todos') filtered = pacientes.filter(function(p) { return p.estado === filter; });

    if (filtered.length === 0) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;"><i class="fas fa-inbox" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>Nenhum paciente registado. Clique em "Novo Paciente" para começar.</td>';
        tbody.appendChild(tr);
        var pag = document.getElementById('pagination-area');
        if (pag) pag.style.display = 'none';
        return;
    }
    var pag = document.getElementById('pagination-area');
    if (pag) pag.style.display = 'flex';

    filtered.forEach(function(p) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + p.processo + '</strong></td><td>' + p.nome + '</td><td>' + p.idade + ' anos</td><td>' + (p.genero === 'M' ? 'Masculino' : p.genero === 'F' ? 'Feminino' : 'Outro') + '</td><td>' + p.telefone + '</td><td><span class="status-badge ' + p.estado + '">' + getStatusLabel(p.estado) + '</span></td><td>' + formatDate(p.dataRegisto) + '</td><td><div class="action-btns"><button class="btn-action view" onclick="viewPaciente(' + p.id + ')" title="Ver"><i class="fas fa-eye"></i></button><button class="btn-action edit" onclick="editPaciente(' + p.id + ')" title="Editar"><i class="fas fa-edit"></i></button><button class="btn-action delete" onclick="confirmDeletePaciente(' + p.id + ')" title="Eliminar"><i class="fas fa-trash"></i></button></div></td>';
        tbody.appendChild(tr);
    });
}

function getStatusLabel(s) {
    var labels = { 'internado': 'Internado', 'ambulatorio': 'Ambulatório', 'alta': 'Alta Médica', 'urgente': 'Urgente' };
    return labels[s] || s;
}

function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-PT');
}

function filterPacientes(filter) {
    document.querySelectorAll('.filter-tabs .tab').forEach(function(t) { t.classList.remove('active'); });
    if (event && event.target) event.target.classList.add('active');
    renderPacientes(filter);
}

function searchPacientes() {
    var term = document.getElementById('search-pacientes').value.toLowerCase();
    var tbody = document.getElementById('pacientes-tbody');
    if (!tbody) return;
    Array.from(tbody.getElementsByTagName('tr')).forEach(function(row) {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
}

// ============================================
// MODAIS
// ============================================
function openModal(id) {
    var m = document.getElementById('modal-' + id);
    if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    var m = document.getElementById('modal-' + id);
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
    currentEditingId = null;
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') document.querySelectorAll('.modal.active').forEach(function(m) { m.classList.remove('active'); });
});

// ============================================
// CRUD PACIENTES
// ============================================
function savePaciente() {
    var nome = document.getElementById('pac-nome').value;
    var processo = document.getElementById('pac-processo').value;
    var nascimento = document.getElementById('pac-nascimento').value;
    var genero = document.getElementById('pac-genero').value;
    var telefone = document.getElementById('pac-telefone').value;

    if (!nome || !processo || !nascimento || !genero || !telefone) {
        showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }

    var birthDate = new Date(nascimento);
    var today = new Date();
    var idade = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) idade--;

    pacientes.push({
        id: Date.now(), processo: processo, nome: nome, nascimento: nascimento, idade: idade,
        genero: genero, telefone: telefone,
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
        estado: 'ambulatorio', dataRegisto: new Date().toISOString().split('T')[0]
    });
    saveToLocalStorage();
    var form = document.getElementById('form-paciente');
    if (form) form.reset();
    closeModal('novo-paciente');
    renderPacientes(); updateStats();
    showToast('Paciente registado com sucesso!');
}

function editPaciente(id) {
    currentEditingId = id;
    var p = pacientes.find(function(x) { return x.id === id; });
    if (!p) { showToast('Paciente não encontrado!', 'error'); return; }
    var form = document.getElementById('form-editar-paciente');
    if (!form) return;
    form.innerHTML = '<div class="form-section"><h4><i class="fas fa-id-card"></i> Dados Pessoais</h4><div class="form-row"><div class="form-group"><label>Nome Completo <span class="required">*</span></label><input type="text" id="edit-nome" value="' + (p.nome || '') + '" required></div><div class="form-group"><label>Nº Processo <span class="required">*</span></label><input type="text" id="edit-processo" value="' + (p.processo || '') + '" required></div></div><div class="form-row"><div class="form-group"><label>Data de Nascimento <span class="required">*</span></label><input type="date" id="edit-nascimento" value="' + (p.nascimento || '') + '" required></div><div class="form-group"><label>Género <span class="required">*</span></label><select id="edit-genero" required><option value="M" ' + (p.genero === 'M' ? 'selected' : '') + '>Masculino</option><option value="F" ' + (p.genero === 'F' ? 'selected' : '') + '>Feminino</option><option value="O" ' + (p.genero === 'O' ? 'selected' : '') + '>Outro</option></select></div></div><div class="form-row"><div class="form-group"><label>Nº BI</label><input type="text" id="edit-bi" value="' + (p.bi || '') + '"></div><div class="form-group"><label>NIF</label><input type="text" id="edit-nif" value="' + (p.nif || '') + '"></div></div></div><div class="form-section"><h4><i class="fas fa-phone"></i> Contactos</h4><div class="form-row"><div class="form-group"><label>Telefone <span class="required">*</span></label><input type="tel" id="edit-telefone" value="' + (p.telefone || '') + '" required></div><div class="form-group"><label>Email</label><input type="email" id="edit-email" value="' + (p.email || '') + '"></div></div><div class="form-row"><div class="form-group"><label>Morada</label><input type="text" id="edit-morada" value="' + (p.morada || '') + '"></div></div></div><div class="form-section"><h4><i class="fas fa-heartbeat"></i> Dados Clínicos</h4><div class="form-row"><div class="form-group"><label>Tipo Sanguíneo</label><select id="edit-sangue"><option value="">Desconhecido</option><option value="A+" ' + (p.sangue === 'A+' ? 'selected' : '') + '>A+</option><option value="A-" ' + (p.sangue === 'A-' ? 'selected' : '') + '>A-</option><option value="B+" ' + (p.sangue === 'B+' ? 'selected' : '') + '>B+</option><option value="B-" ' + (p.sangue === 'B-' ? 'selected' : '') + '>B-</option><option value="AB+" ' + (p.sangue === 'AB+' ? 'selected' : '') + '>AB+</option><option value="AB-" ' + (p.sangue === 'AB-' ? 'selected' : '') + '>AB-</option><option value="O+" ' + (p.sangue === 'O+' ? 'selected' : '') + '>O+</option><option value="O-" ' + (p.sangue === 'O-' ? 'selected' : '') + '>O-</option></select></div><div class="form-group"><label>Estado</label><select id="edit-estado"><option value="internado" ' + (p.estado === 'internado' ? 'selected' : '') + '>Internado</option><option value="ambulatorio" ' + (p.estado === 'ambulatorio' ? 'selected' : '') + '>Ambulatório</option><option value="alta" ' + (p.estado === 'alta' ? 'selected' : '') + '>Alta Médica</option><option value="urgente" ' + (p.estado === 'urgente' ? 'selected' : '') + '>Urgente</option></select></div></div><div class="form-group full-width"><label>Alergias</label><textarea id="edit-alergias" rows="3">' + (p.alergias || '') + '</textarea></div></div><div class="form-section"><h4><i class="fas fa-user-friends"></i> Emergência</h4><div class="form-row"><div class="form-group"><label>Nome</label><input type="text" id="edit-emergencia-nome" value="' + (p.emergenciaNome || '') + '"></div><div class="form-group"><label>Telefone</label><input type="tel" id="edit-emergencia-telefone" value="' + (p.emergenciaTelefone || '') + '"></div></div><div class="form-group full-width"><label>Parentesco</label><select id="edit-emergencia-parentesco"><option value="">Selecione</option><option value="conjuge" ' + (p.emergenciaParentesco === 'conjuge' ? 'selected' : '') + '>Cônjuge</option><option value="filho" ' + (p.emergenciaParentesco === 'filho' ? 'selected' : '') + '>Filho(a)</option><option value="pai" ' + (p.emergenciaParentesco === 'pai' ? 'selected' : '') + '>Pai/Mãe</option><option value="irmao" ' + (p.emergenciaParentesco === 'irmao' ? 'selected' : '') + '>Irmão(ã)</option><option value="outro" ' + (p.emergenciaParentesco === 'outro' ? 'selected' : '') + '>Outro</option></select></div></div>';
    openModal('editar-paciente');
}

function updatePaciente() {
    if (!currentEditingId) return;
    var p = pacientes.find(function(x) { return x.id === currentEditingId; });
    if (!p) return;
    p.nome = document.getElementById('edit-nome').value;
    p.processo = document.getElementById('edit-processo').value;
    p.nascimento = document.getElementById('edit-nascimento').value;
    p.genero = document.getElementById('edit-genero').value;
    p.telefone = document.getElementById('edit-telefone').value;
    p.email = document.getElementById('edit-email') ? document.getElementById('edit-email').value : '';
    p.morada = document.getElementById('edit-morada') ? document.getElementById('edit-morada').value : '';
    p.bi = document.getElementById('edit-bi') ? document.getElementById('edit-bi').value : '';
    p.nif = document.getElementById('edit-nif') ? document.getElementById('edit-nif').value : '';
    p.sangue = document.getElementById('edit-sangue') ? document.getElementById('edit-sangue').value : '';
    p.alergias = document.getElementById('edit-alergias') ? document.getElementById('edit-alergias').value : '';
    p.estado = document.getElementById('edit-estado') ? document.getElementById('edit-estado').value : 'ambulatorio';
    p.emergenciaNome = document.getElementById('edit-emergencia-nome') ? document.getElementById('edit-emergencia-nome').value : '';
    p.emergenciaTelefone = document.getElementById('edit-emergencia-telefone') ? document.getElementById('edit-emergencia-telefone').value : '';
    p.emergenciaParentesco = document.getElementById('edit-emergencia-parentesco') ? document.getElementById('edit-emergencia-parentesco').value : '';

    var birthDate = new Date(p.nascimento);
    var today = new Date();
    var idade = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) idade--;
    p.idade = idade;

    saveToLocalStorage();
    closeModal('editar-paciente');
    renderPacientes(); updateStats();
    showToast('Registo atualizado com sucesso!');
}

function confirmDeletePaciente(id) {
    if (confirm('Tem certeza que deseja eliminar este paciente?')) deletePacienteById(id);
}
function deletePacienteById(id) {
    pacientes = pacientes.filter(function(p) { return p.id !== id; });
    saveToLocalStorage(); renderPacientes(); updateStats();
    showToast('Paciente eliminado com sucesso!');
}
function deletePaciente() {
    if (currentEditingId) { confirmDeletePaciente(currentEditingId); closeModal('editar-paciente'); }
}
function viewPaciente(id) {
    var p = pacientes.find(function(x) { return x.id === id; });
    if (!p) return;
    alert('\n📋 FICHA DO PACIENTE\n═══════════════════════\n\n🆔 Processo: ' + p.processo + '\n👤 Nome: ' + p.nome + '\n🎂 Nasc.: ' + formatDate(p.nascimento) + ' (' + p.idade + ' anos)\n⚧ Género: ' + (p.genero === 'M' ? 'Masculino' : p.genero === 'F' ? 'Feminino' : 'Outro') + '\n🩸 Sangue: ' + (p.sangue || 'Desconhecido') + '\n\n📞 Tel: ' + p.telefone + '\n📧 Email: ' + (p.email || 'N/A') + '\n🏠 Morada: ' + (p.morada || 'N/A') + '\n\n🏥 Estado: ' + getStatusLabel(p.estado) + '\n📅 Registo: ' + formatDate(p.dataRegisto) + '\n\n⚠️ Alergias: ' + (p.alergias || 'Nenhuma') + '\n\n🚨 Emergência: ' + (p.emergenciaNome || 'N/A') + ' | ' + (p.emergenciaTelefone || 'N/A') + '\n');
}

// ============================================
// VIAGEM PARA MENORES
// ============================================
function getFieldValue(id) {
    var prefix = currentLang === 'pt' ? 'pt-' : 'en-';
    var el = document.getElementById(prefix + id);
    return el ? el.value.trim() : '';
}

function validarCampoObrigatorio(id, nomeCampo) {
    var prefix = currentLang === 'pt' ? 'pt-' : 'en-';
    var el = document.getElementById(prefix + id);
    if (!el) { console.warn('Campo "' + prefix + id + '" não encontrado.'); return false; }
    if (!el.value.trim()) {
        el.classList.add('campo-erro');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var remover = function() { el.classList.remove('campo-erro'); el.removeEventListener('input', remover); };
        el.addEventListener('input', remover);
        showToast('Campo obrigatório: ' + nomeCampo, 'error');
        el.focus();
        return false;
    }
    el.classList.remove('campo-erro');
    return true;
}

function limparFormularioViagem() {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
        var prefix = currentLang === 'pt' ? 'pt-' : 'en-';
        document.querySelectorAll('[id^="' + prefix + '"]').forEach(function(input) {
            input.value = ''; input.classList.remove('campo-erro');
        });
        // Limpar também os campos sincronizados
        if (currentLang === 'pt') {
            document.getElementById('sync-pt-crianca-nome').textContent = '____________________';
            document.getElementById('sync-pt-destino').textContent = '____________________';
            document.getElementById('sync-pt-acompanhante').textContent = '____________________';
            document.getElementById('sync-pt-data-inicio').textContent = '____________________';
            document.getElementById('sync-pt-data-fim').textContent = '____________________';
            document.getElementById('sync-pt-ass-pai').textContent = '';
            document.getElementById('sync-pt-ass-mae').textContent = '';
        } else {
            document.getElementById('sync-en-crianca-nome').textContent = '____________________';
            document.getElementById('sync-en-destino').textContent = '____________________';
            document.getElementById('sync-en-acompanhante').textContent = '____________________';
            document.getElementById('sync-en-data-inicio').textContent = '____________________';
            document.getElementById('sync-en-data-fim').textContent = '____________________';
            document.getElementById('sync-en-ass-pai').textContent = '';
            document.getElementById('sync-en-ass-mae').textContent = '';
        }
        showToast('Formulário limpo!');
    }
}

function salvarViagemMenores() {
    var campos = currentLang === 'pt' ? [
        { id: 'pai-nome', nome: 'Nome do Pai' }, { id: 'pai-bi', nome: 'BI do Pai' },
        { id: 'pai-nascimento', nome: 'Data Nasc. do Pai' }, { id: 'mae-nome', nome: 'Nome da Mãe' },
        { id: 'mae-bi', nome: 'BI da Mãe' }, { id: 'mae-nascimento', nome: 'Data Nasc. da Mãe' },
        { id: 'crianca-nome', nome: 'Nome da Criança' }, { id: 'crianca-nascimento', nome: 'Data Nasc. da Criança' },
        { id: 'viagem-destino', nome: 'Destino' }, { id: 'viagem-data-partida', nome: 'Data de Partida' }
    ] : [
        { id: 'pai-nome', nome: "Father's Name" }, { id: 'pai-bi', nome: "Father's ID" },
        { id: 'pai-nascimento', nome: "Father's Birth Date" }, { id: 'mae-nome', nome: "Mother's Name" },
        { id: 'mae-bi', nome: "Mother's ID" }, { id: 'mae-nascimento', nome: "Mother's Birth Date" },
        { id: 'crianca-nome', nome: "Child's Name" }, { id: 'crianca-nascimento', nome: "Child's Birth Date" },
        { id: 'viagem-destino', nome: 'Destination' }, { id: 'viagem-data-partida', nome: 'Departure Date' }
    ];

    for (var i = 0; i < campos.length; i++) {
        if (!validarCampoObrigatorio(campos[i].id, campos[i].nome)) return false;
    }

    var dados = {
        id: Date.now(), idioma: currentLang,
        notoriado: { numero: getFieldValue('notoriado-numero'), data: getFieldValue('notoriado-data'), local: getFieldValue('notoriado-local'), notario: getFieldValue('notario-nome') },
        pai: { nome: getFieldValue('pai-nome'), bi: getFieldValue('pai-bi'), nascimento: getFieldValue('pai-nascimento'), naturalidade: getFieldValue('pai-naturalidade'), residencia: getFieldValue('pai-residencia'), telefone: getFieldValue('pai-telefone'), profissao: getFieldValue('pai-profissao') },
        mae: { nome: getFieldValue('mae-nome'), bi: getFieldValue('mae-bi'), nascimento: getFieldValue('mae-nascimento'), naturalidade: getFieldValue('mae-naturalidade'), residencia: getFieldValue('mae-residencia'), telefone: getFieldValue('mae-telefone'), profissao: getFieldValue('mae-profissao') },
        crianca: { nome: getFieldValue('crianca-nome'), bi: getFieldValue('crianca-bi'), nascimento: getFieldValue('crianca-nascimento'), localNasc: getFieldValue('crianca-local-nasc'), residencia: getFieldValue('crianca-residencia') },
        viagem: { destino: getFieldValue('viagem-destino'), finalidade: getFieldValue('viagem-finalidade'), dataPartida: getFieldValue('viagem-data-partida'), dataRegresso: getFieldValue('viagem-data-regresso'), acompanhante: getFieldValue('viagem-acompanhante'), parentesco: getFieldValue('viagem-parentesco'), observacoes: getFieldValue('viagem-observacoes') },
        assinaturas: { pai: getFieldValue('assinatura-pai'), mae: getFieldValue('assinatura-mae'), notario: getFieldValue('assinatura-notario') },
        dataRegisto: new Date().toISOString()
    };

    viagensMenores.push(dados);
    localStorage.setItem('apsan_viagens', JSON.stringify(viagensMenores));
    updateStats();
    showToast(currentLang === 'pt' ? 'Documento guardado com sucesso!' : 'Document saved successfully!');
    return true;
}

function exportarViagemPDF() {
    if (!salvarViagemMenores()) return;
    // Antes de imprimir, garantir que apenas o documento ativo é visível
    var docAtivo = currentLang === 'pt' ? 'doc-pt' : 'doc-en';
    var docOutro = currentLang === 'pt' ? 'doc-en' : 'doc-pt';
    var outro = document.getElementById(docOutro);
    if (outro) outro.style.display = 'none';
    window.print();
    // Restaurar após impressão
    setTimeout(function() {
        if (outro) outro.style.display = 'none';
        document.getElementById(docAtivo).style.display = 'block';
    }, 1000);
    showToast(currentLang === 'pt' ? 'A preparar documento para impressão...' : 'Preparing document for printing...');
}

// ============================================
// LOCAL STORAGE + ESTATÍSTICAS + UTILITÁRIOS
// ============================================
function saveToLocalStorage() {
    localStorage.setItem('apsan_pacientes', JSON.stringify(pacientes));
}

function updateStats() {
    var sp = document.getElementById('stat-pacientes');
    var si = document.getElementById('stat-internados');
    if (sp) sp.textContent = pacientes.length;
    if (si) si.textContent = pacientes.filter(function(p) { return p.estado === 'internado'; }).length;
    var sd = document.getElementById('stat-documentos');
    var sv = document.getElementById('stat-viagens');
    var sc = document.getElementById('stat-clientes');
    var spe = document.getElementById('stat-pendentes');
    if (sd) sd.textContent = documentosTraduzidos.length;
    if (sv) sv.textContent = viagensMenores.length;
    if (sc) sc.textContent = clientesTraducao.length;
    if (spe) spe.textContent = '0';
}

function showToast(message, type) {
    if (!type) type = 'success';
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toast-message');
    var toastIcon = toast.querySelector('i');
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    if (type === 'error') { toastIcon.className = 'fas fa-exclamation-circle'; toastIcon.style.color = 'var(--danger)'; }
    else { toastIcon.className = 'fas fa-check-circle'; toastIcon.style.color = 'var(--success)'; }
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

function exportData() {
    if (pacientes.length === 0) { showToast('Não há dados para exportar!', 'error'); return; }
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
    showToast('Exportação de funcionários em desenvolvimento!');
}

function generateReport(type) {
    showToast('A gerar relatório ' + type + '...');
    setTimeout(function() {
        alert('Relatório ' + type + ' gerado!\n\nEm produção, seria exportado em PDF/Excel.');
    }, 1000);
}

function saveSettings() {
    showToast('Configurações guardadas com sucesso!');
}

// ============================================
// CALENDÁRIO
// ============================================
function renderCalendar() {
    var grid = document.querySelector('.calendar-grid');
    if (!grid) return;
    var daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    var today = new Date();
    var currentMonth = today.getMonth();
    var currentYear = today.getFullYear();
    var html = '';
    daysOfWeek.forEach(function(day) { html += '<div class="calendar-day-header">' + day + '</div>'; });
    var firstDay = new Date(currentYear, currentMonth, 1).getDay();
    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (var i = 0; i < firstDay; i++) html += '<div class="calendar-day other-month"></div>';
    for (var day = 1; day <= daysInMonth; day++) {
        var isToday = day === today.getDate();
        var hasEvent = [5, 12, 15, 22, 28].indexOf(day) !== -1;
        var classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (hasEvent) classes.push('has-event');
        html += '<div class="' + classes.join(' ') + '">' + day + '</div>';
    }
    grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function() {
            document.querySelectorAll('.modal.active').forEach(function(m) { m.classList.remove('active'); });
        });
    });
});

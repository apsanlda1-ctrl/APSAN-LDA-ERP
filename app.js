/**
 * APSAN, Lda - Sistema de Gestão Hospitalar
 * JavaScript Principal - Correção de inicialização e login
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

// dados
let pacientes = [];
let viagensMenores = [];
let documentosTraduzidos = [];
let clientesTraducao = [];

// linguagem atual para os documentos de tradução (pt/en)
let currentLang = 'pt';

// ============================================
// HELPERS (pegar elemento por id com fallback pt-/en-)
// ============================================
function elId(baseId) {
    const prefixed = `${currentLang}-${baseId}`;
    return document.getElementById(prefixed) || document.getElementById(baseId) || null;
}

// ============================================
// FUNÇÕES INICIAIS E SEGUROS
// ============================================
function safeQuery(selector) {
    try {
        return document.querySelector(selector);
    } catch (e) {
        return null;
    }
}

function updateDepartmentTheme() {
    const deptSelect = document.getElementById('department-select');
    if (!deptSelect) return;
    const dept = deptSelect.value;
    const loginBtn = safeQuery('.btn-login');
    
    if (dept && DEPARTAMENTOS[dept]) {
        if (loginBtn) {
            loginBtn.style.background = DEPARTAMENTOS[dept].cor;
        }
        // Preenche as credenciais sugeridas se os campos existirem
        const userEl = document.getElementById('username');
        const passEl = document.getElementById('password');
        if (userEl) userEl.value = DEPARTAMENTOS[dept].username;
        if (passEl) {
            passEl.value = '';
            passEl.placeholder = 'Palavra-passe';
        }
    } else {
        // reset styling se nenhum departamento selecionado
        if (loginBtn) loginBtn.style.background = '';
    }
}

function login() {
    const deptSelect = document.getElementById('department-select');
    if (!deptSelect) {
        showToast('Elemento de departamento não encontrado!', 'error');
        return;
    }
    const deptKey = deptSelect.value;
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const username = usernameEl ? usernameEl.value.trim() : '';
    const password = passwordEl ? passwordEl.value : '';

    if (!deptKey) {
        showToast('Por favor, selecione um departamento!', 'error');
        return;
    }

    if (!username || !password) {
        showToast('Por favor, preencha todos os campos!', 'error');
        return;
    }

    const dept = DEPARTAMENTOS[deptKey];
    if (!dept) {
        showToast('Departamento inválido!', 'error');
        return;
    }
    
    // Validar credenciais
    if (username !== dept.username || password !== dept.password) {
        showToast('Credenciais incorretas! Verifique o utilizador e palavra-passe.', 'error');
        return;
    }

    currentDepartment = deptKey;

    // Configurar interface para o departamento
    configurarInterfaceDepartamento(dept);

    // Navegar para o dashboard correto
    const loginScreen = document.getElementById('login-screen');
    const dashScreen = document.getElementById('dashboard-screen');
    if (loginScreen) loginScreen.classList.remove('active');
    if (dashScreen) dashScreen.classList.add('active');

    if (deptKey === 'traducao') {
        showSection('traducao-dashboard');
    } else {
        showSection('dashboard');
    }

    showToast(`Bem-vindo ao Departamento de ${dept.nome}!`);
}

function configurarInterfaceDepartamento(dept) {
    const userNameEl = document.getElementById('user-name');
    const userDeptEl = document.getElementById('user-dept');
    const avatar = document.querySelector('.user-avatar');

    if (userNameEl) userNameEl.textContent = dept.userName;
    if (userDeptEl) userDeptEl.textContent = dept.nome;
    if (avatar) {
        avatar.innerHTML = `<i class="fas ${dept.icon}"></i>`;
        avatar.style.background = dept.cor + '20';
        avatar.style.color = dept.cor;
    }

    // Mostrar/esconder menus
    document.querySelectorAll('.sidebar-nav ul').forEach(ul => {
        ul.style.display = 'none';
    });
    
    const menuAtivo = document.getElementById(dept.menu);
    if (menuAtivo) {
        menuAtivo.style.display = 'block';
    }

    const breadcrumb = document.getElementById('breadcrumb-text');
    if (breadcrumb) breadcrumb.textContent = `APSAN > ${dept.nome} > Dashboard`;
}

function logout() {
    if (confirm('Tem certeza que deseja terminar a sessão?')) {
        currentDepartment = null;
        const dashScreen = document.getElementById('dashboard-screen');
        const loginScreen = document.getElementById('login-screen');
        if (dashScreen) dashScreen.classList.remove('active');
        if (loginScreen) loginScreen.classList.add('active');
        
        const userEl = document.getElementById('username');
        const passEl = document.getElementById('password');
        const deptEl = document.getElementById('department-select');
        if (userEl) userEl.value = '';
        if (passEl) passEl.value = '';
        if (deptEl) deptEl.value = '';
        
        showToast('Sessão terminada com sucesso!');
    }
}

// ============================================
// OUTRAS FUNÇÕES (resumidas/iguais ao original)
// ============================================
// Aqui incluímos as funções principais de pacientes, CRUD, calendar,
// mas removi duplicações e mantive o comportamento. Para brevidade
// mostro apenas as funções que costumam causar problemas de inicialização
// e as funções de viagem (PT/EN) — o restante do seu código original
// pode ser colado abaixo se preferir o ficheiro completo.

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

/* --- Funções de Pacientes (mantenha ou cole a sua versão completa aqui) --- */
function renderPacientes(filter = 'todos') {
    // implemente conforme o seu ficheiro original ou cole aqui
}

/* --- Estatísticas e LocalStorage simplificadas --- */
function saveToLocalStorage() {
    try {
        localStorage.setItem('apsan_pacientes', JSON.stringify(pacientes));
    } catch (e) {
        console.error('Erro ao gravar localStorage', e);
    }
}
function updateStats() {
    const statPacientes = document.getElementById('stat-pacientes');
    const statInternados = document.getElementById('stat-internados');
    if (statPacientes) statPacientes.textContent = pacientes.length || 0;
    if (statInternados) statInternados.textContent = (pacientes.filter ? pacientes.filter(p => p.estado === 'internado').length : 0);
    const statViagens = document.getElementById('stat-viagens');
    if (statViagens) statViagens.textContent = viagensMenores.length || 0;
}

/* --- Toast --- */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast ? toast.querySelector('i') : null;
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    if (type === 'error') {
        if (toastIcon) {
            toastIcon.className = 'fas fa-exclamation-circle';
            toastIcon.style.color = 'var(--danger)';
        }
        toast.classList.add('error');
    } else {
        if (toastIcon) {
            toastIcon.className = 'fas fa-check-circle';
            toastIcon.style.color = 'var(--success)';
        }
        toast.classList.remove('error');
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// VIAGEM PARA MENORES - PT/EN (seguro)
// ============================================
function switchLanguage(lang) {
    currentLang = (lang === 'en') ? 'en' : 'pt';
    const docPt = document.getElementById('doc-pt');
    const docEn = document.getElementById('doc-en');
    if (docPt && docEn) {
        docPt.style.display = currentLang === 'pt' ? 'block' : 'none';
        docEn.style.display = currentLang === 'en' ? 'block' : 'none';
    }
    const tabPt = document.getElementById('tab-pt');
    const tabEn = document.getElementById('tab-en');
    if (tabPt && tabEn) {
        tabPt.classList.toggle('active', currentLang === 'pt');
        tabEn.classList.toggle('active', currentLang === 'en');
    }
}

function limparFormularioViagem() {
    if (!confirm('Tem certeza que deseja limpar todos os campos?')) return;
    const container = document.getElementById(currentLang === 'pt' ? 'doc-pt' : 'doc-en');
    if (!container) return;
    const inputs = container.querySelectorAll('input, textarea, select');
    inputs.forEach(i => { if (i.type === 'checkbox' || i.type === 'radio') i.checked = false; else i.value = ''; });
    showToast('Formulário limpo!');
}

function salvarViagemMenores() {
    const dados = {
        id: Date.now(),
        notoriadoNumero: elId('notoriado-numero')?.value || '',
        pai: { nome: elId('pai-nome')?.value || '' },
        mae: { nome: elId('mae-nome')?.value || '' },
        crianca: { nome: elId('crianca-nome')?.value || '' },
        viagem: { destino: elId('viagem-destino')?.value || '' },
        assinaturas: { pai: elId('assinatura-pai')?.value || '' },
        dataRegisto: new Date().toISOString()
    };
    if (!dados.pai.nome || !dados.mae.nome || !dados.crianca.nome) {
        showToast('Por favor, preencha pelo menos os nomes do Pai, Mãe e Criança!', 'error');
        return;
    }
    viagensMenores.push(dados);
    try { localStorage.setItem('apsan_viagens', JSON.stringify(viagensMenores)); } catch (e) { console.error(e); }
    updateStats();
    showToast('Documento de viagem guardado com sucesso!');
}

function exportarViagemPDF() {
    if (!elId('pai-nome')?.value) {
        showToast('Preencha o formulário antes de exportar!', 'error');
        return;
    }
    salvarViagemMenores();
    window.print();
    showToast('A abrir pré-visualização para exportar PDF...');
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializações seguras
    try {
        updateDateTime();
        setInterval(updateDateTime, 1000);
        updateDepartmentTheme();
        switchLanguage('pt');
        // carregar localStorage se existir
        const savedPacientes = localStorage.getItem('apsan_pacientes');
        if (savedPacientes) pacientes = JSON.parse(savedPacientes);
        const savedViagens = localStorage.getItem('apsan_viagens');
        if (savedViagens) viagensMenores = JSON.parse(savedViagens);
        updateStats();
    } catch (err) {
        console.error('Erro durante inicialização:', err);
    }
});

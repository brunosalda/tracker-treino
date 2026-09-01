import { supabase } from '../lib/supabase-client.js';
import { setCurrentAccessToken } from '../lib/storage.js';

let onAuthenticatedCallback = null;
let appInitialized = false;

// Link de CONVITE (type=invite no hash): o Supabase autentica direto, mas o
// usuário ainda não tem senha — antes de liberar o app, forçamos a tela
// "Defina sua senha de acesso" (mesma do fluxo de recuperação).
let fluxoConvite = (window.location.hash || '').includes('type=invite');

function mostrarForm(nome) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('auth-' + nome).classList.add('active');
}
function mostrarFormLogin() { mostrarForm('login'); }
function mostrarFormEsqueciSenha() { mostrarForm('forgot'); }

function setStatus(elId, msg, tipo) {
  const el = document.getElementById(elId);
  el.textContent = msg || '';
  el.className = 'auth-status' + (tipo ? ' ' + tipo : '');
}

async function fazerLogin() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  if (!email || !password) { setStatus('auth-login-status', 'Preencha email e senha.', 'err'); return; }
  setStatus('auth-login-status', 'Entrando...', '');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setStatus('auth-login-status', 'Email ou senha incorretos.', 'err');
    return;
  }
  setStatus('auth-login-status', '', '');
}

async function enviarRecuperacaoSenha() {
  const email = document.getElementById('auth-forgot-email').value.trim();
  if (!email) { setStatus('auth-forgot-status', 'Digite seu email.', 'err'); return; }
  setStatus('auth-forgot-status', 'Enviando...', '');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/app' });
  if (error) {
    setStatus('auth-forgot-status', 'Não consegui enviar o link. Tente de novo em alguns minutos.', 'err');
    return;
  }
  setStatus('auth-forgot-status', 'Se esse email tiver conta, um link de recuperação foi enviado. Confira sua caixa de entrada (e spam).', 'ok');
}

async function salvarNovaSenha() {
  const p1 = document.getElementById('auth-newpass-1').value;
  const p2 = document.getElementById('auth-newpass-2').value;
  if (p1.length < 8) { setStatus('auth-newpass-status', 'A senha precisa ter pelo menos 8 caracteres.', 'err'); return; }
  if (p1 !== p2) { setStatus('auth-newpass-status', 'As senhas não coincidem.', 'err'); return; }
  setStatus('auth-newpass-status', 'Salvando...', '');
  const { error } = await supabase.auth.updateUser({ password: p1 });
  if (error) {
    setStatus('auth-newpass-status', 'Erro ao salvar: ' + error.message, 'err');
    return;
  }
  document.getElementById('auth-newpass-1').value = '';
  document.getElementById('auth-newpass-2').value = '';
  setStatus('auth-newpass-status', '', '');
  fecharAlterarSenha();
  if (fluxoConvite) {
    // senha definida — libera o app (o onAuthStateChange USER_UPDATED cuida do resto)
    fluxoConvite = false;
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-root').style.display = '';
    if (!appInitialized) { appInitialized = true; onAuthenticatedCallback(); }
  }
}

function abrirAlterarSenha() {
  document.getElementById('senha-overlay').classList.add('active');
}
function fecharAlterarSenha() {
  document.getElementById('senha-overlay').classList.remove('active');
  document.getElementById('senha-nova-1').value = '';
  document.getElementById('senha-nova-2').value = '';
  setStatus('senha-status', '', '');
}
async function salvarSenhaConta() {
  const p1 = document.getElementById('senha-nova-1').value;
  const p2 = document.getElementById('senha-nova-2').value;
  if (p1.length < 8) { setStatus('senha-status', 'A senha precisa ter pelo menos 8 caracteres.', 'err'); return; }
  if (p1 !== p2) { setStatus('senha-status', 'As senhas não coincidem.', 'err'); return; }
  setStatus('senha-status', 'Salvando...', '');
  const { error } = await supabase.auth.updateUser({ password: p1 });
  if (error) {
    setStatus('senha-status', 'Erro ao salvar: ' + error.message, 'err');
    return;
  }
  setStatus('senha-status', 'Senha atualizada.', 'ok');
  setTimeout(fecharAlterarSenha, 1200);
}

async function sair() {
  await supabase.auth.signOut();
}

export function initAuthGate(onAuthenticated) {
  onAuthenticatedCallback = onAuthenticated;

  supabase.auth.onAuthStateChange((event, session) => {
    setCurrentAccessToken(session ? session.access_token : null);
    const authScreen = document.getElementById('auth-screen');
    const appRoot = document.getElementById('app-root');

    if (event === 'PASSWORD_RECOVERY') {
      appRoot.style.display = 'none';
      authScreen.classList.remove('hidden');
      mostrarForm('newpass');
      return;
    }

    // convite aceito: sessão existe mas a senha ainda não foi definida
    if (session && fluxoConvite) {
      appRoot.style.display = 'none';
      authScreen.classList.remove('hidden');
      mostrarForm('newpass');
      return;
    }

    if (session) {
      authScreen.classList.add('hidden');
      appRoot.style.display = '';
      const emailEl = document.getElementById('account-email');
      if (emailEl) emailEl.textContent = session.user.email;
      if (!appInitialized) {
        appInitialized = true;
        onAuthenticatedCallback();
      }
    } else {
      appRoot.style.display = 'none';
      authScreen.classList.remove('hidden');
      mostrarForm('login');
    }
  });
}

window.fazerLogin = fazerLogin;
window.mostrarFormLogin = mostrarFormLogin;
window.mostrarFormEsqueciSenha = mostrarFormEsqueciSenha;
window.enviarRecuperacaoSenha = enviarRecuperacaoSenha;
window.salvarNovaSenha = salvarNovaSenha;
window.abrirAlterarSenha = abrirAlterarSenha;
window.fecharAlterarSenha = fecharAlterarSenha;
window.salvarSenhaConta = salvarSenhaConta;
window.sair = sair;

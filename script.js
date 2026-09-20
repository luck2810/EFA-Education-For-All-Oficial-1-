// ============================================================
// EFA - Education For All
// script.js
// ============================================================

// ---------- Estado geral ----------
var AULAS = [];            // aulas aprovadas (catálogo público)
var TODAS_AULAS = [];      // todas as aulas (uso do administrador)
var MINHAS_AULAS = [];     // aulas enviadas pelo usuário logado
var TRANSACOES = [];       // histórico de EFA Coins do usuário logado
var idsDesbloqueadas = {}; // aulas desbloqueadas pelo usuário logado
var DEFICIENCIAS = [];     // deficiências ativas (catálogo e formulários)
var MATERIAS = [];         // matérias ativas
var TODAS_DEFICIENCIAS = []; // todas as deficiências (uso do administrador)
var TODAS_MATERIAS = [];     // todas as matérias (uso do administrador)
var DENUNCIAS = [];        // denúncias pendentes (uso do administrador)
var MINHAS_SOLICITACOES = [];
var MINHAS_SOLICITACOES_ESTRUTURA = [];
var TODAS_SOLICITACOES = [];
var TODOS_USUARIOS = [];
var TODAS_SOLICITACOES_ESTRUTURA = [];
var usuarioAtual = null;
var saldoMoedas = 0;
var premiumAtivo = false;
var passeEspecialAtual = false;
var emailAutenticadoAtual = "";
var aulaEmEdicao = null;         // id da aula em edição no painel
var minhaAulaEmEdicao = null;    // id da aula do usuário em edição
var deficienciaEmEdicao = null;  // id da deficiência em edição
var materiaEmEdicao = null;       // id da matéria em edição
var firebasePronto = false;
var ouvintesUsuario = [];
var ouvintesEstrutura = [];

// Aulas iniciais: reserva caso o banco esteja inacessível (sem internet ou sem Firebase).
var AULAS_INICIAIS = [
  {
    titulo: "5 Táticas de Estudo Eficazes para TDAH",
    perfil: "tdah",
    etiqueta: "TDAH",
    youtube: "https://www.youtube.com/watch?v=iMH4kO9LJsM&t=61s",
    documento: "https://docs.google.com/document/d/1SxZzmbnRP9-r6FMbAdbI2r5VTKv1KOfYq5-WPYtrtAw/edit?usp=sharing",
    descricao: "Aprenda como aplicar anotações estratégicas, mapas visuais, resumos focados e revisões cronometradas no mesmo dia para potencializar sua retenção mental."
  },
  {
    titulo: "Conjuntos Numéricos e Diagramas de Venn",
    perfil: "neurotipico",
    etiqueta: "Neurotípico",
    youtube: "https://www.youtube.com/watch?v=qEDnZzzks7Q&t=10s",
    documento: "https://docs.google.com/document/d/1dyfrQekORiMvm3RppXgJPtPokkNRC2H_UdSXXE4gnFI/edit?usp=sharing",
    descricao: "Aprenda a mapear e resolver intersecções e agrupamentos de dados utilizando a técnica de diagramas lógicos de dentro para fora."
  },
  {
    titulo: "Geografia: Espaço Geográfico e Paisagem",
    perfil: "tea",
    etiqueta: "TEA",
    youtube: "https://www.youtube.com/watch?v=fskgtecHtEE&t=41s",
    documento: "https://docs.google.com/document/d/1pQaQkteQqyAAzRRZmxqGPiPrqcl3ijUc4OV1Tuwt3Rk/edit?usp=sharing",
    descricao: "Compreenda a contínua relação entre a natureza e a modificação humana através do desenvolvimento técnico e estrutural do meio."
  },
  {
    titulo: "A Divisão dos Continentes do Mundo",
    perfil: "baixa-visao",
    etiqueta: "Baixa visão",
    youtube: "https://www.youtube.com/watch?v=oY5_i3emLxE&t=181s",
    documento: "https://docs.google.com/document/d/1FK4jgqEcDHPJtnyHTeO9Niuaixib5BBjnE4Fhz65qus/edit?usp=sharing",
    descricao: "Estudo simplificado e mapeamento dos blocos continentais do planeta utilizando critérios físicos, geográficos e culturais básicos."
  },
  {
    titulo: "Introdução ao Tempo Cronológico e Histórico",
    perfil: "dislexia",
    etiqueta: "Dislexia",
    youtube: "https://youtube.com",
    documento: "https://docs.google.com/document/d/1uF2qxDQcN6eo-dTZ7m0_2IUaU7PEeepBv4UqwVOLhqg/edit?usp=sharing",
    descricao: "Compreensão estruturada e linear da contagem do tempo para facilitar o entendimento dos períodos históricos sem sobrecarga de termos técnicos."
  },
  {
    titulo: "Língua Portuguesa: O que é Verbo?",
    perfil: "tdah",
    etiqueta: "TDAH",
    youtube: "https://youtube.com",
    documento: "https://docs.google.com/document/d/1ZC9UNWBJk5EAnA6EtTl52MLuddcoTYvywoAC7tQ00i0/edit?usp=sharing",
    descricao: "Entenda as estruturas de ação, estado e fenômenos da natureza de forma dinâmica dividida em pequenos blocos isolados."
  }
];

// ---------- Acessibilidade ----------
var tamanhoFonte = 16;

function alterarTamanhoFonte(delta) {
  var novo = tamanhoFonte + delta;
  if (novo < 12 || novo > 24) return;
  tamanhoFonte = novo;
  document.documentElement.style.fontSize = tamanhoFonte + "px";
}

function alternarDislexia(botao) {
  var ativo = document.body.classList.toggle("fonte-dislexia");
  if (botao) botao.setAttribute("aria-pressed", ativo ? "true" : "false");
}

function alternarFoco(botao) {
  var ativo = document.body.classList.toggle("modo-foco-ativo");
  if (botao) {
    botao.textContent = ativo ? "Desativar Modo Foco" : "Ativar Modo Foco";
    botao.setAttribute("aria-pressed", ativo ? "true" : "false");
  }
}

function alternarTema() {
  var escuro = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("tema", escuro ? "dark" : "light");
  } catch (erro) {
    console.warn("Não foi possível salvar o tema.", erro);
  }
}

// ---------- Login com Google (Firebase) ----------
// Configuração do projeto Firebase "EFA - Education For All" (App Web já criado).
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyBQS4OtaZEqhLzqBRNW6Rj3kq5geJw5_MA",
  authDomain: "efa-education-for-all-92554.firebaseapp.com",
  projectId: "efa-education-for-all-92554",
  storageBucket: "efa-education-for-all-92554.firebasestorage.app",
  messagingSenderId: "622612088359",
  appId: "1:622612088359:web:6c8ad1b5cb9908531ef002",
  measurementId: "G-ZZ3DJTQ627"
};

var PRECO_PREMIUM = 5;
var DIAS_PREMIUM = 30;
var CHAVE_PIX_EFA = "164.251.299-05";
var WHATSAPP_ADMIN_PREMIUM = "554198466045";
var MENSAGEM_WHATSAPP_PREMIUM = "Olá! Quero adquirir o Premium do EFA. Vou enviar o comprovante do Pix por aqui.";

function iniciarFirebase() {
  var botao = document.getElementById("btn-google");
  if (typeof firebase === "undefined" || !FIREBASE_CONFIG.apiKey) {
    console.error("Firebase não está disponível ou não foi configurado.");
    if (botao) botao.disabled = true;
    return false;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    firebase.auth().onAuthStateChanged(mostrarUsuario);
    firebasePronto = true;
    return true;
  } catch (erro) {
    console.error("Erro ao inicializar Firebase:", erro);
    return false;
  }
}

// Registra no console o código e a mensagem reais do erro de login.
function registrarErroLogin(contexto, erro) {
  console.error("[" + contexto + "] Falha no login com Google.");
  console.error("Código do erro (erro.code):", erro && erro.code ? erro.code : "(sem código)");
  console.error("Mensagem do erro (erro.message):", erro && erro.message ? erro.message : "(sem mensagem)");
}

function mensagemDeErro(erro) {
  var codigo = erro && erro.code ? erro.code : "";
  var host = window.location.hostname;
  if (codigo === "auth/unauthorized-domain") {
    return "Este site ainda não está autorizado no Firebase.\n\nDomínio atual: " + host + "\n\nNo console do Firebase, abra Authentication > Settings > Authorized domains, clique em Add domain e adicione: " + host + " (somente o domínio, sem caminho). Depois tente entrar novamente.";
  }
  if (codigo === "auth/web-storage-unsupported") {
    return "O navegador está bloqueando os dados de sessão (cookies/armazenamento). Ative os cookies para este site e tente novamente.";
  }
  if (codigo === "auth/popup-blocked") {
    return "O pop-up foi bloqueado pelo navegador. Permita pop-ups para este site e tente novamente.";
  }
  if (codigo === "auth/popup-closed-by-user" || codigo === "auth/cancelled-popup-request") {
    return "Login cancelado.";
  }
  if (codigo === "auth/operation-not-allowed") {
    return "O login com Google não está ativado no Firebase. Vá em Authentication > Sign-in method e ative Google.";
  }
  if (codigo === "auth/network-request-failed") {
    return "Problema de conexão. Verifique sua internet.";
  }
  if (codigo === "auth/invalid-api-key" || codigo === "auth/configuration-not-found") {
    return "A configuração do Firebase está incorreta.";
  }
  if (codigo === "auth/internal-error") {
    return "O Firebase apresentou um erro interno. Tente novamente.";
  }
  return "Não foi possível entrar com o Google. Código do erro: " + (codigo || "desconhecido");
}

function entrarComGoogle() {
  if (!firebasePronto) {
    alert("Login indisponível: o Firebase não foi inicializado.");
    return Promise.reject(new Error("Firebase não inicializado."));
  }
  var provedor = new firebase.auth.GoogleAuthProvider();
  provedor.setCustomParameters({ prompt: "select_account" });
  var noCelular = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  var tentativa = noCelular
    ? firebase.auth().signInWithRedirect(provedor)
    : firebase.auth().signInWithPopup(provedor);
  return tentativa.catch(function (erro) {
    registrarErroLogin("loginComGoogle", erro);
    if (erro && (erro.code === "auth/popup-blocked" || erro.code === "auth/operation-not-supported-in-this-environment")) {
      return firebase.auth().signInWithRedirect(provedor);
    }
    if (erro && erro.code !== "auth/popup-closed-by-user" && erro.code !== "auth/cancelled-popup-request") {
      alert(mensagemDeErro(erro));
    }
    return null;
  });
}

function aoClicarBotaoGoogle() {
  if (!firebasePronto) {
    alert("Login indisponível: o Firebase não foi inicializado.");
    return;
  }
  var usuario = firebase.auth().currentUser;
  if (usuario) {
    firebase.auth().signOut().then(function () {
      return entrarComGoogle();
    }).catch(function (erro) {
      registrarErroLogin("trocarDeConta", erro);
      alert(mensagemDeErro(erro));
    });
  } else {
    entrarComGoogle();
  }
}

function mostrarUsuario(usuario) {
  var usuarioReal = usuario && usuario.uid ? usuario : (typeof firebase !== "undefined" && firebase.auth ? firebase.auth().currentUser : null);
  console.info("AUTH:", {
    email: usuarioReal ? usuarioReal.email : null,
    uid: usuarioReal ? usuarioReal.uid : null
  });

  var botao = document.getElementById("btn-google");
  var info = document.getElementById("info-usuario");
  var btnSair = document.getElementById("btn-sair");

  if (!usuarioReal) {
    usuarioAtual = null;
    emailAutenticadoAtual = "";
    atualizarAcessoPainelAdmin(false);
    if (info) {
      info.textContent = "";
      info.hidden = true;
    }
    if (botao) botao.textContent = "Entrar com Google";
    if (btnSair) btnSair.hidden = true;
    configurarSessao(null);
    return;
  }

  console.info("Diagnóstico completo do usuário:", {
    existe: !!usuarioReal,
    tipo: typeof usuarioReal,
    email: usuarioReal.email || "",
    uid: usuarioReal.uid || "",
    nome: usuarioReal.displayName || "",
    providerData: usuarioReal.providerData || [],
    chaves: Object.keys(usuarioReal)
  });

  var nome = usuarioReal.displayName || usuarioReal.email || "Usuário";
  if (info) {
    info.textContent = "Olá, " + nome;
    info.hidden = false;
  }
  if (botao) botao.textContent = "Trocar conta";
  if (btnSair) btnSair.hidden = false;

  atualizarEmailSolicitacaoPremium(usuarioReal);
  confirmarUsuarioFirebase(usuarioReal);
  configurarSessao(usuarioReal);
}

function confirmarUsuarioFirebase(usuario) {
  if (!usuario || !usuario.uid) return Promise.resolve(null);

  var usuarioAtualizado = firebase && firebase.auth ? firebase.auth().currentUser || usuario : usuario;
  if (!usuarioAtualizado || !usuarioAtualizado.uid) return Promise.resolve(null);

  var carregarUsuario = usuarioAtualizado.reload && typeof usuarioAtualizado.reload === "function"
    ? usuarioAtualizado.reload().then(function () {
      return firebase && firebase.auth ? firebase.auth().currentUser || usuarioAtualizado : usuarioAtualizado;
    })
    : Promise.resolve(usuarioAtualizado);

  return carregarUsuario.then(function (usuarioFinal) {
    if (!usuarioFinal || !usuarioFinal.uid) return null;
    var emailAtualizado = obterEmailAutenticado(usuarioFinal);
    if (emailAtualizado) {
      emailAutenticadoAtual = emailAtualizado.trim().toLowerCase();
      aplicarEmailAutenticado(usuarioFinal, emailAtualizado);
      return usuarioFinal;
    }
    if (typeof usuarioFinal.getIdTokenResult !== "function") {
      var admin = ehAdministrador(usuarioFinal);
      atualizarAcessoPainelAdmin(admin);
      return usuarioFinal;
    }
    return usuarioFinal.getIdTokenResult(true).then(function (resultado) {
      var emailToken = resultado && resultado.claims
        ? String(resultado.claims.email || resultado.claims.email_address || "").trim().toLowerCase()
        : "";
      console.info("Usuário Firebase após reload/token:", {
        email: emailToken || "(vazio)",
        uid: usuarioFinal.uid || "(sem UID)",
        claims: resultado && resultado.claims ? Object.keys(resultado.claims) : []
      });
      if (emailToken) {
        emailAutenticadoAtual = emailToken;
        aplicarEmailAutenticado(usuarioFinal, emailToken);
      } else {
        var admin = ehAdministrador(usuarioFinal);
        atualizarAcessoPainelAdmin(admin);
      }
      return usuarioFinal;
    });
  }).catch(function (erro) {
    console.warn("Não foi possível atualizar o usuário Firebase:", erro);
    return null;
  });
}

function aplicarEmailAutenticado(usuario, email) {
  if (!usuario || !usuario.uid) {
    atualizarAcessoPainelAdmin(false);
    return;
  }
  emailAutenticadoAtual = String(email || "").trim().toLowerCase();
  console.info("E-mail autenticado resolvido:", emailAutenticadoAtual || "(vazio)");
  var admin = ehAdministrador(usuario);
  atualizarAcessoPainelAdmin(admin);
  atualizarEmailSolicitacaoPremium(usuario);
}

function atualizarEmailSolicitacaoPremium(usuario) {
  var campoEmail = document.getElementById("campo-premium-email");
  if (!campoEmail) return;
  campoEmail.value = usuario && usuario.email ? usuario.email : "";
  campoEmail.disabled = false;
  campoEmail.readOnly = false;
}

function configurarPremiumPublico() {
  var instrucoes = document.getElementById("instrucoes-pix");
  var botaoPix = document.getElementById("btn-copiar-pix");
  var botaoWhatsApp = document.getElementById("btn-whatsapp-premium");
  var botaoSolicitar = document.getElementById("btn-solicitar-premium");
  var formularioSolicitacao = document.getElementById("form-solicitar-premium");
  var feedback = document.getElementById("feedback-premium");
  if (instrucoes) {
    instrucoes.textContent = "Plano Premium: R$ " + PRECO_PREMIUM.toFixed(2).replace(".", ",") +
      " por " + DIAS_PREMIUM + " dias. Chave Pix: " + (CHAVE_PIX_EFA || "não cadastrada");
  }
  if (botaoPix) {
    botaoPix.disabled = !CHAVE_PIX_EFA;
    botaoPix.addEventListener("click", function () {
      if (!CHAVE_PIX_EFA) return;
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        if (feedback) feedback.textContent = "Copie a chave Pix exibida acima manualmente.";
        return;
      }
      navigator.clipboard.writeText(CHAVE_PIX_EFA).then(function () {
        if (feedback) feedback.textContent = "Chave Pix copiada. Envie o comprovante pelo WhatsApp.";
      }).catch(function () {
        if (feedback) feedback.textContent = "Não foi possível copiar automaticamente. Copie a chave exibida acima.";
      });
    });
  }
  if (botaoWhatsApp) {
    botaoWhatsApp.disabled = !WHATSAPP_ADMIN_PREMIUM;
    botaoWhatsApp.addEventListener("click", function () {
      if (!WHATSAPP_ADMIN_PREMIUM) return;
      var url = "https://wa.me/" + WHATSAPP_ADMIN_PREMIUM + "?text=" + encodeURIComponent(MENSAGEM_WHATSAPP_PREMIUM);
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }
  if (botaoSolicitar) {
    botaoSolicitar.addEventListener("click", function () {
      if (!usuarioAtual) {
        alert("Entre com o Google para solicitar o Premium.");
        return;
      }
      var campoNome = document.getElementById("campo-premium-nome");
      var campoEmail = document.getElementById("campo-premium-email");
      if (campoNome) campoNome.value = usuarioAtual.displayName || "";
      atualizarEmailSolicitacaoPremium(usuarioAtual);
      if (formularioSolicitacao) formularioSolicitacao.hidden = !formularioSolicitacao.hidden;
    });
  }
  if (formularioSolicitacao) formularioSolicitacao.addEventListener("submit", criarSolicitacaoPremium);
}

// ---------- Administrador e utilitários ----------
// Para tornar outro e-mail administrador, adicione-o nesta lista E nas regras do Firestore.
var ADMIN_EMAILS = [
  "administrador.efa@gmail.com"
];
var ADMIN_UIDS = [
  "N30w5z3U2mXPQjpIbsp9jwTq96q1"
];

// Rótulos legados dos perfis antigos (mantidos para exibir aulas criadas antes
// do sistema de deficiências; não são usados nos formulários novos).
var ETIQUETAS = {
  tdah: "TDAH",
  tea: "TEA",
  dislexia: "Dislexia",
  "baixa-visao": "Baixa visão",
  neurotipico: "Neurotípico"
};

// Sugestões de deficiências/condições para cadastro em lote pelo administrador.
// Cadastradas via botão no painel, nas coleções já existentes (deficiencias/materias).
var MATERIAS_COMUNS = ["Matemática", "Português", "História", "Geografia", "Ciências", "Inglês"];
var MATERIAS_DISLEXIA = ["Português", "Inglês", "História"];

var DEFICIENCIAS_SUGERIDAS = [
  { nome: "Cegueira", descricao: "Deficiência visual total. Materiais em áudio, leitores de tela e descrições faladas.", materias: MATERIAS_COMUNS },
  { nome: "Baixa visão", descricao: "Deficiência visual parcial. Ampliação de textos, alto contraste e recursos visuais ampliados.", materias: MATERIAS_COMUNS },
  { nome: "Surdez", descricao: "Deficiência auditiva total. Legendas, vídeos em Libras e materiais visuais.", materias: MATERIAS_COMUNS },
  { nome: "Perda auditiva", descricao: "Deficiência auditiva parcial. Legendas, transcrições e apoio visual.", materias: MATERIAS_COMUNS },
  { nome: "Paralisia cerebral", descricao: "Deficiência física. Ritmo adaptado, navegação simplificada e apoios visuais.", materias: MATERIAS_COMUNS },
  { nome: "Lesão medular", descricao: "Deficiência física. Materiais acessíveis com ritmo adaptado.", materias: MATERIAS_COMUNS },
  { nome: "Amputação", descricao: "Deficiência física. Adaptações de interação e materiais simplificados.", materias: MATERIAS_COMUNS },
  { nome: "Distrofias musculares", descricao: "Deficiência física. Conteúdos em pequenos blocos com ritmo adaptado.", materias: MATERIAS_COMUNS },
  { nome: "Deficiência intelectual", descricao: "Conteúdos simplificados, passo a passo e linguagem objetiva.", materias: MATERIAS_COMUNS },
  { nome: "Transtorno do Espectro Autista (TEA)", descricao: "Estruturas previsíveis, instruções claras e organização visual.", materias: MATERIAS_COMUNS },
  { nome: "Dislexia", descricao: "Fonte amigável, áudio de apoio e linguagem direta.", materias: MATERIAS_DISLEXIA },
  { nome: "Discalculia", descricao: "Recursos concretos e visuais para números e operações.", materias: MATERIAS_COMUNS },
  { nome: "Disgrafia", descricao: "Atividades com menos escrita e mais recursos visuais e orais.", materias: MATERIAS_COMUNS },
  { nome: "TDAH", descricao: "Transtorno do Déficit de Atenção com Hiperatividade. Blocos curtos e cronometrados.", materias: MATERIAS_COMUNS },
  { nome: "Deficiência múltipla", descricao: "Associação de duas ou mais deficiências. Adaptações combinadas.", materias: MATERIAS_COMUNS }
];

function obterDadosUsuarioAutenticado(usuario) {
  var usuarioFirebase = usuario;
  if ((!usuarioFirebase || !usuarioFirebase.email) && typeof firebase !== "undefined" && firebase.auth) {
    usuarioFirebase = firebase.auth().currentUser || usuarioFirebase;
  }
  if (!usuarioFirebase) {
    return { email: "", uid: "" };
  }

  var email = String(usuarioFirebase.email || "").trim().toLowerCase();
  if (!email) {
    var provedores = Array.isArray(usuarioFirebase.providerData) ? usuarioFirebase.providerData : [];
    for (var i = 0; i < provedores.length; i++) {
      email = String(provedores[i].email || "").trim().toLowerCase();
      if (email) break;
    }
  }

  var uid = String(usuarioFirebase.uid || "").trim();
  return { email: email, uid: uid };
}

function ehAdministrador(usuario) {
  if (!usuario || !usuario.uid) {
    console.info("ADMIN:", false, { motivo: "usuário inexistente ou sem UID" });
    return false;
  }

  var email = String(usuario.email || "").trim().toLowerCase();
  if (!email && Array.isArray(usuario.providerData)) {
    for (var i = 0; i < usuario.providerData.length; i++) {
      email = String(usuario.providerData[i].email || "").trim().toLowerCase();
      if (email) break;
    }
  }

  var uid = String(usuario.uid || "").trim();
  var reconhecidoPorEmail = email === "administrador.efa@gmail.com";
  var reconhecidoPorUid = uid === "N30w5z3U2mXPQjpIbsp9jwTq96q1";
  var reconhecido = reconhecidoPorEmail || reconhecidoPorUid;

  console.info("ADMIN:", reconhecido, {
    email: email || "(vazio)",
    uid: uid || "(sem UID)",
    reconhecidoPorEmail: reconhecidoPorEmail,
    reconhecidoPorUid: reconhecidoPorUid
  });

  return reconhecido;
}

function obterEmailAutenticado(usuario) {
  return obterDadosUsuarioAutenticado(usuario).email;
}

function normalizar(texto) {
  return (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizarNomeEstrutura(nome) {
  return String(nome || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function nomeEstruturaValido(nome) {
  var valor = String(nome || "").trim().replace(/\s+/g, " ");
  if (!valor || valor.length > 200) return false;
  if (!/[\p{L}\p{N}]/u.test(valor)) return false;
  return valor;
}

function ehProfessorEspecial() {
  return !!(usuarioAtual && passeEspecialAtual);
}

function adicionarOpcaoSolicitar(select, texto) {
  if (!select || ehAdministrador(usuarioAtual) || ehProfessorEspecial()) return;
  var opcao = document.createElement("option");
  opcao.value = "__solicitar__";
  opcao.textContent = texto;
  select.appendChild(opcao);
}

function atualizarEstadoSolicitacoesEstrutura() {
  var deficiencia = document.getElementById("campo-criar-deficiencia");
  var materia = document.getElementById("campo-criar-materia");
  if (deficiencia) adicionarOpcaoSolicitar(deficiencia, "➕ Adicionar nova deficiência");
  if (materia) adicionarOpcaoSolicitar(materia, "➕ Adicionar nova matéria");
}

function formatarData(carimbo) {
  if (!carimbo || !carimbo.toDate) return "data indisponível";
  try {
    return carimbo.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (erro) {
    return "data indisponível";
  }
}

function paraDenuncia(doc) {
  var dados = doc.data();
  return {
    id: doc.id,
    aulaId: dados.aulaId || "",
    aulaTitulo: dados.aulaTitulo || "",
    denunciadorId: dados.denunciadorId || "",
    denunciadorNome: dados.denunciadorNome || "",
    motivo: dados.motivo || "",
    status: dados.status || "pendente",
    criadoEm: dados.criadoEm || null
  };
}

function paraSolicitacao(doc) {
  var dados = doc.data();
  return {
    id: doc.id,
    userId: dados.userId || "",
    userEmail: dados.userEmail || "",
    userName: dados.userName || "",
    plano: dados.plano || "premium_30_dias",
    valor: Number(dados.valor || 0),
    status: dados.status || "pendente",
    criadoEm: dados.criadoEm || null,
    atualizadoEm: dados.atualizadoEm || null,
    analisadoPor: dados.analisadoPor || "",
    analisadoEm: dados.analisadoEm || null,
    motivoRecusa: dados.motivoRecusa || "",
    observacaoUsuario: dados.observacaoUsuario || "",
    identificadorTransacao: dados.identificadorTransacao || ""
  };
}

function paraAula(doc) {
  var dados = doc.data();
  return {
    id: doc.id,
    titulo: dados.titulo || "",
    descricao: dados.descricao || "",
    perfil: dados.perfil || "",
    etiqueta: dados.etiqueta || "",
    deficienciaId: dados.deficienciaId || "",
    deficienciaNome: dados.deficienciaNome || "",
    materiaId: dados.materiaId || "",
    materiaNome: dados.materiaNome || "",
    youtube: dados.youtube || "",
    documento: dados.documento || "",
    autorId: dados.autorId || "",
    autorNome: dados.autorNome || "",
    status: dados.status || "pendente",
    aprovadoEm: dados.aprovadoEm || null,
    aprovadoPor: dados.aprovadoPor || "",
    rejeitadoEm: dados.rejeitadoEm || null,
    rejeitadoPor: dados.rejeitadoPor || "",
    motivoRejeicao: dados.motivoRejeicao || "",
    criadoEm: dados.criadoEm || null
  };
}

function paraDeficiencia(doc) {
  var dados = doc.data();
  return {
    id: doc.id,
    nome: dados.nome || "",
    descricao: dados.descricao || "",
    ativa: dados.ativa !== false,
    status: dados.status || (dados.ativa === false ? "pendente" : "aprovada"),
    criadoPor: dados.criadoPor || "",
    criadoPorNome: dados.criadoPorNome || "",
    motivoRejeicao: dados.motivoRejeicao || "",
    ordem: Number(dados.ordem || 0),
    criadoEm: dados.criadoEm || null
  };
}

// Uma matéria pode estar vinculada a uma ou mais deficiências.
// Registros antigos (campo único deficienciaId) são lidos como um vínculo só,
// sem precisar de migração: nada é apagado nem duplicado.
function paraMateria(doc) {
  var dados = doc.data();
  var ids = Array.isArray(dados.deficienciaIds) ? dados.deficienciaIds.slice() : [];
  if (dados.deficienciaId && ids.indexOf(dados.deficienciaId) === -1) {
    ids.push(dados.deficienciaId);
  }
  return {
    id: doc.id,
    nome: dados.nome || "",
    deficienciaIds: ids,
    ativa: dados.ativa !== false,
    status: dados.status || (dados.ativa === false ? "pendente" : "aprovada"),
    criadoPor: dados.criadoPor || "",
    criadoPorNome: dados.criadoPorNome || "",
    motivoRejeicao: dados.motivoRejeicao || "",
    ordem: Number(dados.ordem || 0),
    criadoEm: dados.criadoEm || null
  };
}

function paraUsuario(doc) {
  var dados = doc.data();
  return {
    id: doc.id,
    nome: dados.nome || "Usuário",
    email: dados.email || "",
    passeEspecial: dados.passeEspecial === true,
    criadoEm: dados.criadoEm || null
  };
}

function paraSolicitacaoEstrutura(doc) {
  var dados = doc.data();
  return {
    id: doc.id,
    tipo: dados.tipo || "",
    nome: dados.nome || "",
    descricao: dados.descricao || "",
    deficienciaIds: Array.isArray(dados.deficienciaIds) ? dados.deficienciaIds.slice() : [],
    status: dados.status || "pendente",
    criadoPor: dados.criadoPor || "",
    criadoPorNome: dados.criadoPorNome || "Usuário",
    criadoPorEmail: dados.criadoPorEmail || "",
    motivoRejeicao: dados.motivoRejeicao || "",
    criadoEm: dados.criadoEm || null
  };
}

function ordenarPorData(aulas) {
  aulas.sort(function (a, b) {
    var ta = a.criadoEm && a.criadoEm.toMillis ? a.criadoEm.toMillis() : 0;
    var tb = b.criadoEm && b.criadoEm.toMillis ? b.criadoEm.toMillis() : 0;
    return tb - ta;
  });
  return aulas;
}

function ordenarPorOrdem(lista) {
  lista.sort(function (a, b) { return a.ordem - b.ordem; });
  return lista;
}

function nomeDaDeficiencia(id) {
  var fonte = TODAS_DEFICIENCIAS.length ? TODAS_DEFICIENCIAS : DEFICIENCIAS;
  for (var i = 0; i < fonte.length; i++) {
    if (fonte[i].id === id) return fonte[i].nome;
  }
  return "";
}

function nomeDaMateria(id) {
  var fonte = TODAS_MATERIAS.length ? TODAS_MATERIAS : MATERIAS;
  for (var i = 0; i < fonte.length; i++) {
    if (fonte[i].id === id) return fonte[i].nome;
  }
  return "";
}

function encerrarOuvintesUsuario() {
  while (ouvintesUsuario.length) {
    try {
      ouvintesUsuario.pop()();
    } catch (erro) {
      console.warn("Erro ao encerrar listener:", erro);
    }
  }
}

function atualizarAcessoPainelAdmin(admin) {
  var painel = document.getElementById("painel-admin");
  var linkPainel = document.getElementById("link-painel");
  if (painel) {
    painel.hidden = !admin;
    painel.style.display = admin ? "" : "none";
  }
  if (linkPainel) linkPainel.hidden = !admin;
}

// ---------- Sessão do usuário ----------
function configurarSessao(usuario) {
  encerrarOuvintesUsuario();
  usuarioAtual = usuario;
  if (!usuario) {
    emailAutenticadoAtual = "";
    atualizarAcessoPainelAdmin(false);
    console.info("Sessão EFA: logout/sem usuário");
    atualizarPainelUsuario();
    renderizarAulas();
    return;
  }

  saldoMoedas = 0;
  premiumAtivo = false;
  idsDesbloqueadas = {};
  MINHAS_AULAS = [];
  TRANSACOES = [];
  MINHAS_SOLICITACOES = [];
  MINHAS_SOLICITACOES_ESTRUTURA = [];
  TODAS_SOLICITACOES = [];
  TODOS_USUARIOS = [];
  TODAS_SOLICITACOES_ESTRUTURA = [];
  passeEspecialAtual = false;
  TODAS_AULAS = [];
  TODAS_DEFICIENCIAS = [];
  TODAS_MATERIAS = [];
  DENUNCIAS = [];

  var logado = !!usuario;
  var areaUsuario = document.getElementById("area-usuario");
  var linkCriar = document.getElementById("link-criar");
  if (areaUsuario) areaUsuario.hidden = !logado;
  if (linkCriar) linkCriar.hidden = !logado;

  var admin = ehAdministrador(usuario);
  atualizarAcessoPainelAdmin(admin);

  console.info("Sessão EFA:", {
    emailAutenticado: obterEmailAutenticado(usuario) || "não disponível",
    administradorReconhecido: admin,
    painelEncontrado: !!document.getElementById("painel-admin")
  });

  atualizarPainelUsuario();
  renderizarAulas();
  if (!logado || !firebasePronto || typeof firebase.firestore !== "function") return;

  var banco = firebase.firestore();

  // Perfil do usuário (moedas e Premium) — criado na primeira visita com 0 Coins
  var refUsuario = banco.collection("usuarios").doc(usuario.uid);
  ouvintesUsuario.push(refUsuario.onSnapshot(function (doc) {
    if (!doc.exists) {
      refUsuario.set({
        nome: usuario.displayName || usuario.email,
        email: usuario.email,
        moedas: 0,
        premium: false,
        passeEspecial: false,
        premiumAte: null,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(function (erro) {
        console.error("Erro ao criar perfil:", erro);
      });
      return;
    }
    var dados = doc.data();
    passeEspecialAtual = dados.passeEspecial === true;
    saldoMoedas = Number(dados.moedas || 0);
    premiumAtivo = !!(dados.premium && dados.premiumAte && dados.premiumAte.toMillis && dados.premiumAte.toMillis() > Date.now());
    atualizarPainelUsuario();
    atualizarSelects();
    renderizarAulas();
  }, function (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }));

  // Aulas enviadas pelo usuário (qualquer status)
  ouvintesUsuario.push(banco.collection("aulas").where("autorId", "==", usuario.uid).onSnapshot(function (instantaneo) {
    MINHAS_AULAS = ordenarPorData(instantaneo.docs.map(paraAula));
    renderizarMinhasAulas();
  }, function (erro) {
    console.error("Erro ao carregar suas aulas:", erro);
  }));

  // Histórico de EFA Coins
  ouvintesUsuario.push(banco.collection("transacoes").where("usuarioId", "==", usuario.uid).onSnapshot(function (instantaneo) {
    TRANSACOES = ordenarPorData(instantaneo.docs.map(function (doc) {
      var dados = doc.data();
      return {
        tipo: dados.tipo || "ganho",
        quantidade: dados.quantidade || 0,
        motivo: dados.motivo || "",
        criadoEm: dados.criadoEm || null
      };
    }));
    renderizarTransacoes();
  }, function (erro) {
    console.error("Erro ao carregar transações:", erro);
  }));

  // Aulas desbloqueadas pelo usuário (acesso permanente)
  ouvintesUsuario.push(banco.collection("aulasDesbloqueadas").where("usuarioId", "==", usuario.uid).onSnapshot(function (instantaneo) {
    idsDesbloqueadas = {};
    instantaneo.forEach(function (doc) {
      var dados = doc.data();
      if (dados.aulaId) idsDesbloqueadas[dados.aulaId] = true;
    });
    renderizarAulas();
  }, function (erro) {
    console.error("Erro ao carregar aulas desbloqueadas:", erro);
  }));

  ouvintesUsuario.push(banco.collection("solicitacoes_pagamento").where("userId", "==", usuario.uid).onSnapshot(function (instantaneo) {
    MINHAS_SOLICITACOES = ordenarPorData(instantaneo.docs.map(paraSolicitacao));
    renderizarMinhasSolicitacoes();
  }, function (erro) {
    console.error("Erro ao carregar solicitações Premium:", erro);
  }));

  function atualizarSolicitacoesEstruturaDoUsuario() {
    return Promise.all([
      banco.collection("deficiencias").where("criadoPor", "==", usuario.uid).get(),
      banco.collection("materias").where("criadoPor", "==", usuario.uid).get()
    ]).then(function (resultados) {
      MINHAS_SOLICITACOES_ESTRUTURA = resultados[0].docs.map(paraSolicitacaoEstrutura)
        .concat(resultados[1].docs.map(paraSolicitacaoEstrutura));
      renderizarMinhasSolicitacoesEstrutura();
    });
  }
  ouvintesUsuario.push(banco.collection("deficiencias").where("criadoPor", "==", usuario.uid).onSnapshot(function () {
    atualizarSolicitacoesEstruturaDoUsuario().catch(function (erro) { console.error("Erro ao carregar solicitações próprias:", erro); });
  }));
  ouvintesUsuario.push(banco.collection("materias").where("criadoPor", "==", usuario.uid).onSnapshot(function () {
    atualizarSolicitacoesEstruturaDoUsuario().catch(function (erro) { console.error("Erro ao carregar solicitações próprias:", erro); });
  }));

  // Administrador: todas as aulas, deficiências e matérias
  if (admin) {
    ouvintesUsuario.push(banco.collection("aulas").onSnapshot(function (instantaneo) {
      TODAS_AULAS = ordenarPorData(instantaneo.docs.map(paraAula));
      renderizarPendentes();
      renderizarListaAdmin();
      atualizarResumoAdmin();
    }, function (erro) {
      console.error("Erro ao carregar aulas do administrador:", erro);
      mostrarErroLista("lista-pendentes", "Erro ao carregar as aulas. Verifique as regras do Firestore.");
    }));

    ouvintesUsuario.push(banco.collection("deficiencias").onSnapshot(function (instantaneo) {
      TODAS_DEFICIENCIAS = ordenarPorOrdem(instantaneo.docs.map(paraDeficiencia));
      renderizarDeficiencias();
      renderizarMaterias();
      atualizarResumoAdmin();
    }, function (erro) {
      console.error("Erro ao carregar deficiências:", erro);
      mostrarErroLista("lista-deficiencias", "Erro ao carregar as deficiências. Verifique as regras do Firestore.");
    }));

    ouvintesUsuario.push(banco.collection("materias").onSnapshot(function (instantaneo) {
      TODAS_MATERIAS = ordenarPorOrdem(instantaneo.docs.map(paraMateria));
      renderizarMaterias();
      atualizarResumoAdmin();
    }, function (erro) {
      console.error("Erro ao carregar matérias:", erro);
      mostrarErroLista("lista-materias", "Erro ao carregar as matérias. Verifique as regras do Firestore.");
    }));

    ouvintesUsuario.push(banco.collection("denuncias").where("status", "==", "pendente").onSnapshot(function (instantaneo) {
      DENUNCIAS = ordenarPorData(instantaneo.docs.map(paraDenuncia));
      renderizarDenuncias();
      atualizarResumoAdmin();
    }, function (erro) {
      console.error("Erro ao carregar denúncias:", erro);
      mostrarErroLista("lista-denuncias", "Erro ao carregar denúncias. Verifique as regras do Firestore.");
    }));

    ouvintesUsuario.push(banco.collection("solicitacoes_pagamento").onSnapshot(function (instantaneo) {
      TODAS_SOLICITACOES = ordenarPorData(instantaneo.docs.map(paraSolicitacao));
      renderizarPagamentosAdmin();
    }, function (erro) {
      console.error("Erro ao carregar solicitações administrativas:", erro);
      mostrarErroLista("lista-pagamentos-admin", "Erro ao carregar solicitações. Verifique as regras do Firestore.");
    }));
    ouvintesUsuario.push(banco.collection("usuarios").onSnapshot(function (instantaneo) {
      TODOS_USUARIOS = instantaneo.docs.map(paraUsuario);
      renderizarUsuariosAdmin();
    }, function (erro) {
      console.error("Erro ao carregar usuários administrativos:", erro);
      mostrarErroLista("lista-usuarios-admin", "Erro ao carregar usuários. Verifique as regras do Firestore.");
    }));

    ouvintesUsuario.push(banco.collection("deficiencias").where("status", "==", "pendente").onSnapshot(function (instantaneo) {
      var solicitacoesDeficiencia = instantaneo.docs.map(paraSolicitacaoEstrutura);
      banco.collection("materias").where("status", "==", "pendente").get().then(function (materias) {
        TODAS_SOLICITACOES_ESTRUTURA = solicitacoesDeficiencia.concat(materias.docs.map(paraSolicitacaoEstrutura));
        renderizarSolicitacoesEstruturaAdmin();
      }).catch(function (erro) {
        console.error("Erro ao carregar solicitações de matérias:", erro);
      });
    }, function (erro) {
      console.error("Erro ao carregar solicitações de deficiências:", erro);
      mostrarErroLista("lista-solicitacoes-estrutura-admin", "Erro ao carregar solicitações. Verifique as regras do Firestore.");
    }));
    ouvintesUsuario.push(banco.collection("materias").where("status", "==", "pendente").onSnapshot(function (instantaneo) {
      var solicitacoesMateria = instantaneo.docs.map(paraSolicitacaoEstrutura);
      banco.collection("deficiencias").where("status", "==", "pendente").get().then(function (deficiencias) {
        TODAS_SOLICITACOES_ESTRUTURA = deficiencias.docs.map(paraSolicitacaoEstrutura).concat(solicitacoesMateria);
        renderizarSolicitacoesEstruturaAdmin();
      });
    }));
    garantirOpcoesIniciais();
  }
}

// ---------- Estrutura pública: deficiências e matérias ativas ----------
function carregarEstruturaPublica() {
  if (!firebasePronto || typeof firebase.firestore !== "function") return;
  var banco = firebase.firestore();
  ouvintesEstrutura.push(banco.collection("deficiencias").where("ativa", "==", true).onSnapshot(function (instantaneo) {
    DEFICIENCIAS = ordenarPorOrdem(instantaneo.docs.map(paraDeficiencia));
    atualizarSelects();
    renderizarAulas();
  }, function (erro) {
    console.error("Erro ao carregar deficiências ativas:", erro);
  }));
  ouvintesEstrutura.push(banco.collection("materias").where("ativa", "==", true).onSnapshot(function (instantaneo) {
    MATERIAS = ordenarPorOrdem(instantaneo.docs.map(paraMateria));
    atualizarSelects();
    renderizarAulas();
  }, function (erro) {
    console.error("Erro ao carregar matérias ativas:", erro);
  }));
}

// ---------- Seleções dinâmicas (deficiência → matéria) ----------
function popularDeficiencias(select, textoPadrao, lista, valorAtual) {
  if (!select) return;
  var anterior = valorAtual !== undefined ? valorAtual : select.value;
  select.innerHTML = "";
  var padrao = document.createElement("option");
  padrao.value = "";
  padrao.textContent = textoPadrao;
  select.appendChild(padrao);
  lista.forEach(function (deficiencia) {
    var opcao = document.createElement("option");
    opcao.value = deficiencia.id;
    opcao.textContent = deficiencia.nome;
    select.appendChild(opcao);
  });
  var existe = Array.prototype.some.call(select.options, function (op) { return op.value === anterior; });
  select.value = existe ? anterior : "";
}

function popularMaterias(select, deficienciaId, textoPadrao, lista, valorAtual) {
  if (!select) return;
  var anterior = valorAtual !== undefined ? valorAtual : select.value;
  select.innerHTML = "";
  var padrao = document.createElement("option");
  padrao.value = "";
  padrao.textContent = textoPadrao;
  select.appendChild(padrao);
  lista.forEach(function (materia) {
    if (deficienciaId && materia.deficienciaIds.indexOf(deficienciaId) === -1) return;
    var opcao = document.createElement("option");
    opcao.value = materia.id;
    opcao.textContent = materia.nome;
    select.appendChild(opcao);
  });
  var existe = Array.prototype.some.call(select.options, function (op) { return op.value === anterior; });
  select.value = existe ? anterior : "";
}

// ---------- Vínculos de deficiências no formulário de matérias (uma ou mais) ----------
function montarGrupoDeficiencias(lista) {
  var grupo = document.getElementById("grupo-materia-deficiencias");
  if (!grupo) return;
  var marcadas = obterDeficienciasSelecionadas();
  grupo.innerHTML = "";
  if (!lista.length) {
    var vazio = document.createElement("p");
    vazio.className = "item-meta";
    vazio.textContent = "Nenhuma deficiência cadastrada ainda.";
    grupo.appendChild(vazio);
    return;
  }
  lista.forEach(function (deficiencia) {
    var rotulo = document.createElement("label");
    var caixa = document.createElement("input");
    caixa.type = "checkbox";
    caixa.value = deficiencia.id;
    caixa.checked = marcadas.indexOf(deficiencia.id) !== -1;
    rotulo.appendChild(caixa);
    rotulo.appendChild(document.createTextNode(" " + deficiencia.nome));
    grupo.appendChild(rotulo);
  });
}

function obterDeficienciasSelecionadas() {
  var selecionadas = [];
  var grupo = document.getElementById("grupo-materia-deficiencias");
  if (!grupo) return selecionadas;
  Array.prototype.forEach.call(grupo.querySelectorAll('input[type="checkbox"]:checked'), function (caixa) {
    selecionadas.push(caixa.value);
  });
  return selecionadas;
}

function marcarDeficienciasSelecionadas(ids) {
  var grupo = document.getElementById("grupo-materia-deficiencias");
  if (!grupo) return;
  Array.prototype.forEach.call(grupo.querySelectorAll('input[type="checkbox"]'), function (caixa) {
    caixa.checked = ids.indexOf(caixa.value) !== -1;
  });
}

function atualizarSelects() {
  var admin = ehAdministrador(usuarioAtual);
  var listaDeficiencias = admin && TODAS_DEFICIENCIAS.length ? TODAS_DEFICIENCIAS : DEFICIENCIAS;
  var listaMaterias = admin && TODAS_MATERIAS.length ? TODAS_MATERIAS : MATERIAS;

  var filtroDeficiencia = document.getElementById("filtro-deficiencia");
  popularDeficiencias(filtroDeficiencia, "Todas as deficiências", DEFICIENCIAS);
  popularMaterias(document.getElementById("filtro-materia"), filtroDeficiencia ? filtroDeficiencia.value : "", "Todas as matérias", MATERIAS);

  popularDeficiencias(document.getElementById("campo-criar-deficiencia"), "Selecione a deficiência", DEFICIENCIAS);
  popularMaterias(document.getElementById("campo-criar-materia"), document.getElementById("campo-criar-deficiencia").value, "Selecione a matéria", MATERIAS);
  atualizarEstadoSolicitacoesEstrutura();

  popularDeficiencias(document.getElementById("campo-deficiencia"), "Selecione a deficiência", listaDeficiencias);
  popularMaterias(document.getElementById("campo-materia"), document.getElementById("campo-deficiencia").value, "Selecione a matéria", listaMaterias);

  montarGrupoDeficiencias(listaDeficiencias);
  popularDeficiencias(document.getElementById("select-deficiencia-materias"), "Todas as deficiências", listaDeficiencias);
}

// ---------- Catálogo (apenas aulas aprovadas) ----------
function carregarCatalogo() {
  if (!firebasePronto || typeof firebase.firestore !== "function") {
    AULAS = AULAS_INICIAIS.map(function (aula) {
      aula.semBloqueio = true;
      return aula;
    });
    renderizarAulas();
    return;
  }
  firebase.firestore().collection("aulas").where("status", "==", "aprovada").onSnapshot(function (instantaneo) {
    AULAS = ordenarPorData(instantaneo.docs.map(paraAula));
    renderizarAulas();
  }, function (erro) {
    console.error("Erro ao carregar catálogo:", erro);
    if (!AULAS.length) {
      AULAS = AULAS_INICIAIS.map(function (aula) {
        aula.semBloqueio = true;
        return aula;
      });
    }
    renderizarAulas();
  });
}

// ---------- Acesso à aula ----------
// Ordem de acesso: 1) aulas offline (reserva) 2) a própria aula do criador (grátis)
// 3) Premium 4) aulas já desbloqueadas com Coins. Caso contrário, cobra 1 Coin.
function ehMinhaAula(aula) {
  return !!(usuarioAtual && aula.autorId && aula.autorId === usuarioAtual.uid);
}

function aulaAcessivel(aula) {
  if (aula.semBloqueio) return true;
  if (ehMinhaAula(aula)) return true;
  return premiumAtivo || idsDesbloqueadas[aula.id] === true;
}

function criarBotaoDesbloquear(aula) {
  var botao = document.createElement("button");
  botao.type = "button";
  botao.className = "btn-acesso desbloquear";
  botao.textContent = "🔓 Desbloquear (🟡 1 Coin)";
  botao.setAttribute("aria-label", "Desbloquear aula " + aula.titulo + " por 1 EFA Coin");
  botao.addEventListener("click", function () { desbloquearAula(aula); });
  return botao;
}

// ---------- Card da aula ----------
function criarCard(aula) {
  var card = document.createElement("article");
  card.className = "card-aula";

  var titulo = document.createElement("h3");
  titulo.textContent = aula.titulo;

  var etiquetaDeficiencia = aula.deficienciaNome || aula.etiqueta || ETIQUETAS[aula.perfil] || "Geral";
  var etiqueta = document.createElement("span");
  etiqueta.className = "tag-perfil";
  etiqueta.textContent = etiquetaDeficiencia;
  card.appendChild(titulo);
  card.appendChild(etiqueta);

  if (aula.materiaNome) {
    var seloMateria = document.createElement("span");
    seloMateria.className = "tag-materia";
    seloMateria.textContent = aula.materiaNome;
    card.appendChild(seloMateria);
  }

  if (ehMinhaAula(aula)) {
    var seloAutor = document.createElement("span");
    seloAutor.className = "badge-sua-aula";
    seloAutor.textContent = "✍️ Sua aula";
    card.appendChild(seloAutor);
  }

  var descricao = document.createElement("p");
  descricao.textContent = aula.descricao;
  card.appendChild(descricao);

  var acoes = document.createElement("div");
  acoes.className = "acoes-adicionais";

  if (aulaAcessivel(aula)) {
    var linkVideo = document.createElement("a");
    linkVideo.className = "btn-acesso";
    linkVideo.href = aula.youtube;
    linkVideo.target = "_blank";
    linkVideo.rel = "noopener noreferrer";
    linkVideo.textContent = "🎥 Assistir aula";

    var linkDoc = document.createElement("a");
    linkDoc.className = "btn-acesso desbloquear";
    linkDoc.href = aula.documento;
    linkDoc.target = "_blank";
    linkDoc.rel = "noopener noreferrer";
    linkDoc.textContent = "📄 Material adaptado";

    acoes.appendChild(linkVideo);
    acoes.appendChild(linkDoc);
  } else {
    acoes.appendChild(criarBotaoDesbloquear(aula));
  }

  if (usuarioAtual && !ehMinhaAula(aula)) {
    var botaoDenunciar = document.createElement("button");
    botaoDenunciar.type = "button";
    botaoDenunciar.className = "btn-mini";
    botaoDenunciar.textContent = "⚑ Denunciar";
    botaoDenunciar.setAttribute("aria-label", "Denunciar aula " + aula.titulo);
    botaoDenunciar.addEventListener("click", function () { denunciarAula(aula); });
    acoes.appendChild(botaoDenunciar);
  }

  card.appendChild(acoes);
  return card;
}

function denunciarAula(aula) {
  if (!usuarioAtual || !firebasePronto) {
    alert("Entre com o Google para denunciar uma aula.");
    return;
  }
  var motivo = window.prompt("Informe o motivo da denúncia:");
  if (!motivo || !motivo.trim()) return;
  var idDenuncia = usuarioAtual.uid + "_" + aula.id;
  var banco = firebase.firestore();
  var referencia = banco.collection("denuncias").doc(idDenuncia);
  banco.collection("denuncias")
    .where("denunciadorId", "==", usuarioAtual.uid)
    .get().then(function (resultado) {
    var duplicada = resultado.docs.some(function (documento) {
      return documento.data().aulaId === aula.id;
    });
    if (duplicada) {
      alert("Você já denunciou esta aula.");
      return;
    }
    return referencia.set({
      aulaId: aula.id,
      aulaTitulo: aula.titulo,
      denunciadorId: usuarioAtual.uid,
      denunciadorNome: usuarioAtual.displayName || usuarioAtual.email || "Usuário",
      motivo: motivo.trim(),
      status: "pendente",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      return true;
    });
  }).then(function (resultado) {
    if (resultado) alert("Denúncia enviada para análise.");
  }).catch(function (erro) {
    console.error("Erro ao denunciar aula:", erro);
    alert(erro && erro.code === "permission-denied"
      ? "Você não tem permissão para denunciar esta aula."
      : "Não foi possível enviar a denúncia.");
  });
}

// ---------- Renderizar catálogo (busca + deficiência + matéria juntas) ----------
function renderizarAulas() {
  var campoBusca = document.getElementById("campo-busca");
  var filtroDeficiencia = document.getElementById("filtro-deficiencia");
  var filtroMateria = document.getElementById("filtro-materia");
  var grid = document.getElementById("grid-aulas");
  var aviso = document.getElementById("sem-resultados");
  if (!grid) return;

  var termo = normalizar((campoBusca ? campoBusca.value : "").trim());
  var deficienciaId = filtroDeficiencia ? filtroDeficiencia.value : "";
  var materiaId = filtroMateria ? filtroMateria.value : "";

  grid.innerHTML = "";

  var visiveis = AULAS.filter(function (aula) {
    var texto = normalizar(aula.titulo) + " " + normalizar(aula.descricao);
    var encontrouTexto = !termo || texto.indexOf(termo) !== -1;
    var deficienciaSelecionada = nomeDaDeficiencia(deficienciaId);
    var encontrouDeficiencia = !deficienciaId || aula.deficienciaId === deficienciaId ||
      (!aula.deficienciaId && normalizar(aula.etiqueta || ETIQUETAS[aula.perfil]) === normalizar(deficienciaSelecionada));
    var encontrouMateria = !materiaId || aula.materiaId === materiaId;
    return encontrouTexto && encontrouDeficiencia && encontrouMateria;
  });

  visiveis.forEach(function (aula) {
    grid.appendChild(criarCard(aula));
  });

  if (aviso) aviso.hidden = visiveis.length !== 0;
}

// ---------- Desbloquear aula (custo: 1 EFA Coin) ----------
function desbloquearAula(aula) {
  if (!usuarioAtual) {
    alert("Entre com o Google para desbloquear aulas.");
    return;
  }
  // O criador da aula nunca é cobrado (verificação de verdade, não só no botão)
  if (ehMinhaAula(aula)) return;
  if (premiumAtivo || idsDesbloqueadas[aula.id]) return;
  if (saldoMoedas < 1) {
    alert("Você precisa de 1 EFA Coin para desbloquear esta aula. Envie uma aula e, quando ela for aprovada, você recebe 🟡 1 Coin.");
    return;
  }
  var banco = firebase.firestore();
  var lote = banco.batch();
  lote.update(banco.collection("usuarios").doc(usuarioAtual.uid), {
    moedas: firebase.firestore.FieldValue.increment(-1)
  });
  lote.set(banco.collection("transacoes").doc(), {
    usuarioId: usuarioAtual.uid,
    tipo: "gasto",
    quantidade: 1,
    motivo: "Desbloqueio da aula: " + aula.titulo,
    aulaId: aula.id,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
  lote.set(banco.collection("aulasDesbloqueadas").doc(), {
    usuarioId: usuarioAtual.uid,
    aulaId: aula.id,
    desbloqueadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
  lote.commit().then(function () {
    alert("✅ Aula desbloqueada! Bom estudo.");
  }).catch(function (erro) {
    console.error("Erro ao desbloquear aula:", erro);
    alert(erro && erro.code === "permission-denied"
      ? "Permissão negada pelo Firestore. Confira as regras de segurança."
      : "Não foi possível desbloquear a aula. Tente novamente.");
  });
}

// ---------- Enviar aula para análise ----------
function enviarAulaAnalise(evento) {
  evento.preventDefault();
  if (!usuarioAtual) {
    alert("Entre com o Google para enviar aulas.");
    return;
  }
  if (!firebasePronto || typeof firebase.firestore !== "function") {
    alert("O Firebase não está disponível.");
    return;
  }

  var campoTitulo = document.getElementById("campo-criar-titulo");
  var campoDescricao = document.getElementById("campo-criar-descricao");
  var campoDeficiencia = document.getElementById("campo-criar-deficiencia");
  var campoMateria = document.getElementById("campo-criar-materia");
  var campoYoutube = document.getElementById("campo-criar-youtube");
  var campoDocumento = document.getElementById("campo-criar-documento");
  if (!campoTitulo || !campoDescricao || !campoDeficiencia || !campoMateria || !campoYoutube || !campoDocumento) {
    alert("Não foi possível localizar os campos do formulário.");
    return;
  }

  if (!DEFICIENCIAS.length) {
    alert("Nenhuma deficiência cadastrada ainda. Aguarde o administrador cadastrar as deficiências e matérias.");
    return;
  }

  var deficienciaId = campoDeficiencia.value;
  var materiaId = campoMateria.value;
  if (!deficienciaId || !materiaId) {
    alert("Selecione a deficiência e a matéria da aula.");
    return;
  }

  var dados = {
    titulo: campoTitulo.value.trim(),
    descricao: campoDescricao.value.trim(),
    deficienciaId: deficienciaId,
    deficienciaNome: nomeDaDeficiencia(deficienciaId),
    materiaId: materiaId,
    materiaNome: nomeDaMateria(materiaId),
    etiqueta: nomeDaDeficiencia(deficienciaId),
    youtube: campoYoutube.value.trim(),
    documento: campoDocumento.value.trim(),
    autorId: usuarioAtual.uid,
    autorNome: usuarioAtual.displayName || usuarioAtual.email,
    status: ehAdministrador(usuarioAtual) || ehProfessorEspecial() ? "aprovada" : "pendente",
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (dados.status === "aprovada") {
    dados.aprovadoEm = firebase.firestore.FieldValue.serverTimestamp();
    dados.aprovadoPor = usuarioAtual.uid;
  }

  if (!dados.titulo || !dados.descricao || !dados.youtube || !dados.documento) {
    alert("Preencha todos os campos da aula.");
    return;
  }

  var botaoEnviar = evento.submitter;
  if (botaoEnviar) botaoEnviar.disabled = true;

  firebase.firestore().collection("aulas")
    .where("autorId", "==", usuarioAtual.uid)
    .get().then(function (resultado) {
    var duplicada = resultado.docs.some(function (documento) {
      if (documento.id === minhaAulaEmEdicao) return false;
      var existente = documento.data();
      return normalizar(existente.titulo) === normalizar(dados.titulo);
    });
    if (duplicada) {
      throw { code: "duplicate-submission" };
    }
    if (minhaAulaEmEdicao) {
      var dadosEdicao = {
        titulo: dados.titulo,
        descricao: dados.descricao,
        deficienciaId: dados.deficienciaId,
        deficienciaNome: dados.deficienciaNome,
        materiaId: dados.materiaId,
        materiaNome: dados.materiaNome,
        etiqueta: dados.etiqueta,
        youtube: dados.youtube,
        documento: dados.documento,
        status: dados.status,
        motivoRejeicao: ""
      };
      return firebase.firestore().collection("aulas").doc(minhaAulaEmEdicao).update(dadosEdicao);
    }
    return firebase.firestore().collection("aulas").add(dados);
  }).then(function () {
    var feedback = document.getElementById("feedback-criar");
    if (feedback) {
      feedback.textContent = dados.status === "aprovada"
        ? "✅ Aula criada e aprovada diretamente."
        : "✅ Aula enviada para análise! Você receberá 🟡 1 EFA Coin quando ela for aprovada.";
    }
    var formulario = document.getElementById("form-criar-aula");
    if (formulario) formulario.reset();
    minhaAulaEmEdicao = null;
    if (botaoEnviar) botaoEnviar.textContent = "📤 Enviar para análise";
    atualizarSelects();
  }).catch(function (erro) {
    console.error("Erro ao enviar aula:", erro);
    alert(erro && erro.code === "duplicate-submission"
      ? "Você já enviou uma aula com este título."
      : erro && erro.code === "permission-denied"
      ? "Permissão negada pelo Firestore. Confira as regras de segurança."
      : "Não foi possível enviar a aula. " + (erro && erro.message ? "Detalhe: " + erro.message : "Tente novamente."));
  }).finally(function () {
    if (botaoEnviar) botaoEnviar.disabled = false;
  });
}

// ---------- Selos de status ----------
function criarBadgeStatus(status) {
  var badge = document.createElement("span");
  var texto = status === "aprovada" ? "✅ Aprovada" : (status === "recusada" ? "❌ Recusada" : "⏳ Pendente");
  badge.className = "status-badge " + status;
  badge.textContent = texto;
  return badge;
}

function criarBadgeAtiva(ativa) {
  var badge = document.createElement("span");
  badge.className = "status-badge " + (ativa ? "aprovada" : "recusada");
  badge.textContent = ativa ? "✅ Ativa" : "⛔ Inativa";
  return badge;
}

// ---------- Minhas aulas ----------
function renderizarMinhasAulas() {
  var lista = document.getElementById("lista-minhas");
  var aviso = document.getElementById("minhas-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  MINHAS_AULAS.forEach(function (aula) {
    var item = document.createElement("li");
    item.className = "item-admin";

    var cabecalho = document.createElement("div");
    cabecalho.className = "item-admin-cabecalho";

    var titulo = document.createElement("strong");
    titulo.textContent = aula.titulo;

    var etiqueta = document.createElement("span");
    etiqueta.className = "tag-perfil";
    etiqueta.textContent = aula.deficienciaNome || aula.etiqueta || ETIQUETAS[aula.perfil] || "Geral";

    cabecalho.appendChild(titulo);
    cabecalho.appendChild(etiqueta);
    if (aula.materiaNome) {
      var seloMateria = document.createElement("span");
      seloMateria.className = "tag-materia";
      seloMateria.textContent = aula.materiaNome;
      cabecalho.appendChild(seloMateria);
    }
    cabecalho.appendChild(criarBadgeStatus(aula.status));

    item.appendChild(cabecalho);
    if (aula.status === "recusada" && aula.motivoRejeicao) {
      var motivo = document.createElement("p");
      motivo.className = "item-meta";
      motivo.textContent = "Motivo da rejeição: " + aula.motivoRejeicao;
      item.appendChild(motivo);
    }
    var acoes = document.createElement("div");
    acoes.className = "item-admin-acoes";
    var editar = document.createElement("button");
    editar.type = "button";
    editar.className = "btn-mini";
    editar.textContent = "✏️ Editar";
    editar.addEventListener("click", function () { iniciarEdicaoMinhaAula(aula); });
    acoes.appendChild(editar);
    item.appendChild(acoes);
    lista.appendChild(item);
  });
  if (aviso) aviso.hidden = MINHAS_AULAS.length !== 0;
}

function iniciarEdicaoMinhaAula(aula) {
  minhaAulaEmEdicao = aula.id;
  var campos = {
    titulo: document.getElementById("campo-criar-titulo"),
    descricao: document.getElementById("campo-criar-descricao"),
    deficiencia: document.getElementById("campo-criar-deficiencia"),
    materia: document.getElementById("campo-criar-materia"),
    youtube: document.getElementById("campo-criar-youtube"),
    documento: document.getElementById("campo-criar-documento")
  };
  if (!campos.titulo || !campos.descricao) return;
  campos.titulo.value = aula.titulo;
  campos.descricao.value = aula.descricao;
  campos.youtube.value = aula.youtube;
  campos.documento.value = aula.documento;
  atualizarSelects();
  campos.deficiencia.value = aula.deficienciaId || "";
  popularMaterias(campos.materia, campos.deficiencia.value, "Selecione a matéria", MATERIAS);
  campos.materia.value = aula.materiaId || "";
  var botao = document.getElementById("btn-enviar-aula");
  if (botao) botao.textContent = ehProfessorEspecial() ? "💾 Salvar aula aprovada" : "💾 Salvar e reenviar para análise";
  document.getElementById("form-criar-aula").scrollIntoView({ behavior: "smooth" });
}

// ---------- Transações ----------
function renderizarTransacoes() {
  var lista = document.getElementById("lista-transacoes");
  var aviso = document.getElementById("transacoes-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  TRANSACOES.forEach(function (transacao) {
    var item = document.createElement("li");
    item.className = "item-transacao";
    var sinal = transacao.tipo === "ganho" ? "+" : "-";
    item.textContent = "🟡 " + sinal + transacao.quantidade + " · " + transacao.motivo + " · " + formatarData(transacao.criadoEm);
    lista.appendChild(item);
  });
  if (aviso) aviso.hidden = TRANSACOES.length !== 0;
}

// ---------- Painel do usuário ----------
function atualizarPainelUsuario() {
  var badge = document.getElementById("badge-moedas");
  var saldo = document.getElementById("saldo-usuario");
  var statusPremium = document.getElementById("status-premium");
  if (badge) {
    badge.textContent = "🟡 " + saldoMoedas;
    badge.hidden = !usuarioAtual;
  }
  if (saldo) {
    saldo.textContent = "Seu saldo: 🟡 " + saldoMoedas + " EFA Coin" + (saldoMoedas === 1 ? "" : "s");
  }
  if (statusPremium) {
    statusPremium.textContent = premiumAtivo
      ? "⭐ Premium ativo. Todas as aulas liberadas, sem gastar Coins."
      : "Plano gratuito: desbloqueie aulas com 🟡 1 Coin cada. Aulas criadas por você são sempre gratuitas.";
  }
}

function criarSolicitacaoPremium(evento) {
  evento.preventDefault();
  if (!usuarioAtual || !firebasePronto) {
    alert("Entre com o Google antes de solicitar o Premium.");
    return;
  }
  var campoNome = document.getElementById("campo-premium-nome");
  var campoEmail = document.getElementById("campo-premium-email");
  var campoObservacao = document.getElementById("campo-premium-observacao");
  var campoTransacao = document.getElementById("campo-premium-transacao");
  var botao = document.getElementById("btn-enviar-solicitacao");
  var feedback = document.getElementById("feedback-premium");
  if (!campoNome || !campoEmail || !campoObservacao || !campoTransacao) return;
  var emailInformado = campoEmail.value.trim().toLowerCase();
  if (!emailInformado || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInformado)) {
    campoEmail.setCustomValidity("Informe um e-mail válido.");
    campoEmail.reportValidity();
    return;
  }
  campoEmail.setCustomValidity("");
  if (botao) botao.disabled = true;

  var banco = firebase.firestore();
  banco.collection("solicitacoes_pagamento")
    .where("userId", "==", usuarioAtual.uid)
    .get()
    .then(function (resultado) {
      var existePendente = resultado.docs.some(function (documento) {
        return documento.data().status === "pendente";
      });
      if (existePendente) {
        throw { code: "pending-payment-request" };
      }
      return banco.collection("solicitacoes_pagamento").add({
        userId: usuarioAtual.uid,
        userEmail: emailInformado,
        userName: campoNome.value.trim(),
        plano: "premium_30_dias",
        valor: PRECO_PREMIUM,
        chavePix: CHAVE_PIX_EFA,
        status: "pendente",
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        analisadoPor: "",
        analisadoEm: null,
        motivoRecusa: "",
        observacaoUsuario: campoObservacao.value.trim(),
        identificadorTransacao: campoTransacao.value.trim()
      });
    })
    .then(function () {
      var formulario = document.getElementById("form-solicitar-premium");
      if (formulario) formulario.reset();
      if (feedback) feedback.textContent = "Solicitação enviada. Aguarde a conferência do administrador.";
    })
    .catch(function (erro) {
      if (erro && erro.code === "pending-payment-request") {
        if (feedback) feedback.textContent = "Já existe uma solicitação pendente para sua conta.";
        return;
      }
      console.error("Erro ao criar solicitação Premium:", erro);
      if (feedback) feedback.textContent = "Não foi possível enviar a solicitação. Tente novamente.";
    })
    .finally(function () {
      if (botao) botao.disabled = false;
    });
}

function textoStatusSolicitacao(status) {
  return status === "aprovada" ? "Aprovada" : status === "recusada" ? "Recusada" : status === "cancelada" ? "Cancelada" : "Pendente";
}

function renderizarMinhasSolicitacoes() {
  var lista = document.getElementById("lista-solicitacoes-premium");
  var vazio = document.getElementById("solicitacoes-premium-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  MINHAS_SOLICITACOES.forEach(function (solicitacao) {
    var item = document.createElement("li");
    item.className = "item-admin";
    var titulo = document.createElement("strong");
    titulo.textContent = solicitacao.plano + " · R$ " + solicitacao.valor.toFixed(2).replace(".", ",");
    item.appendChild(titulo);
    var meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = "Status: " + textoStatusSolicitacao(solicitacao.status) + " · " + formatarData(solicitacao.criadoEm);
    item.appendChild(meta);
    if (solicitacao.status === "recusada" && solicitacao.motivoRecusa) {
      var motivo = document.createElement("p");
      motivo.textContent = "Motivo: " + solicitacao.motivoRecusa;
      item.appendChild(motivo);
    }
    lista.appendChild(item);
  });
  if (vazio) vazio.hidden = MINHAS_SOLICITACOES.length !== 0;
}

function renderizarMinhasSolicitacoesEstrutura() {
  var lista = document.getElementById("lista-minhas-solicitacoes-estrutura");
  var vazio = document.getElementById("minhas-solicitacoes-estrutura-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  MINHAS_SOLICITACOES_ESTRUTURA.forEach(function (solicitacao) {
    var item = document.createElement("li");
    item.className = "item-admin";
    var titulo = document.createElement("strong");
    titulo.textContent = (solicitacao.tipo === "materia" ? "Matéria: " : "Deficiência: ") + solicitacao.nome;
    item.appendChild(titulo);
    var status = document.createElement("p");
    status.className = "item-meta";
    status.textContent = "Status: " + textoStatusSolicitacao(solicitacao.status) + " · " + formatarData(solicitacao.criadoEm);
    item.appendChild(status);
    if (solicitacao.motivoRejeicao) {
      var motivo = document.createElement("p");
      motivo.textContent = "Motivo da rejeição: " + solicitacao.motivoRejeicao;
      item.appendChild(motivo);
    }
    lista.appendChild(item);
  });
  if (vazio) vazio.hidden = MINHAS_SOLICITACOES_ESTRUTURA.length !== 0;
}

function atualizarResumoAdmin() {
  if (!ehAdministrador(usuarioAtual)) return;
  var totais = {
    pendente: 0,
    aprovada: 0,
    recusada: 0
  };
  TODAS_AULAS.forEach(function (aula) {
    if (Object.prototype.hasOwnProperty.call(totais, aula.status)) totais[aula.status]++;
  });
  var valores = {
    "total-aulas-pendentes": totais.pendente,
    "total-aulas-aprovadas": totais.aprovada,
    "total-aulas-recusadas": totais.recusada,
    "total-denuncias-pendentes": DENUNCIAS.length,
    "total-materias": TODAS_MATERIAS.length,
    "total-deficiencias": TODAS_DEFICIENCIAS.length
  };
  Object.keys(valores).forEach(function (id) {
    var elemento = document.getElementById(id);
    if (elemento) elemento.textContent = String(valores[id]);
  });
}

// ---------- Painel do administrador: aulas pendentes ----------
function mostrarErroLista(idLista, mensagem) {
  var lista = document.getElementById(idLista);
  if (!lista) return;
  lista.innerHTML = "";
  var item = document.createElement("li");
  item.className = "item-admin";
  item.textContent = mensagem;
  lista.appendChild(item);
}

function mostrarDetalhesAula(aula) {
  var painel = document.getElementById("detalhes-aula-admin");
  var conteudo = document.getElementById("conteudo-detalhes-aula");
  if (!painel || !conteudo) return;
  conteudo.innerHTML = "";
  [
    ["Título", aula.titulo],
    ["Autor", aula.autorNome || "desconhecido"],
    ["Matéria", aula.materiaNome || "não informada"],
    ["Deficiência", aula.deficienciaNome || aula.etiqueta || "não informada"],
    ["Descrição", aula.descricao],
    ["Status", aula.status],
    ["Enviada em", formatarData(aula.criadoEm)],
    ["Vídeo", aula.youtube || "não informado"],
    ["Material", aula.documento || "não informado"],
    ["Motivo da rejeição", aula.motivoRejeicao || "não informado"]
  ].forEach(function (item) {
    var paragrafo = document.createElement("p");
    var rotulo = document.createElement("strong");
    rotulo.textContent = item[0] + ": ";
    paragrafo.appendChild(rotulo);
    paragrafo.appendChild(document.createTextNode(item[1]));
    conteudo.appendChild(paragrafo);
  });
  painel.hidden = false;
  painel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fecharDetalhesAula() {
  var painel = document.getElementById("detalhes-aula-admin");
  if (painel) painel.hidden = true;
}

function renderizarPendentes() {
  var lista = document.getElementById("lista-pendentes");
  var aviso = document.getElementById("pendentes-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  var pendentes = TODAS_AULAS.filter(function (aula) { return aula.status === "pendente"; });
  pendentes.forEach(function (aula) {
    var item = document.createElement("li");
    item.className = "item-admin";

    var cabecalho = document.createElement("div");
    cabecalho.className = "item-admin-cabecalho";

    var titulo = document.createElement("strong");
    titulo.textContent = aula.titulo;

    var etiqueta = document.createElement("span");
    etiqueta.className = "tag-perfil";
    etiqueta.textContent = aula.deficienciaNome || aula.etiqueta || ETIQUETAS[aula.perfil] || "Geral";

    cabecalho.appendChild(titulo);
    cabecalho.appendChild(etiqueta);
    if (aula.materiaNome) {
      var seloMateria = document.createElement("span");
      seloMateria.className = "tag-materia";
      seloMateria.textContent = aula.materiaNome;
      cabecalho.appendChild(seloMateria);
    }
    cabecalho.appendChild(criarBadgeStatus(aula.status));
    item.appendChild(cabecalho);

    var autor = document.createElement("p");
    autor.className = "item-meta";
    autor.textContent = "👤 Autor: " + (aula.autorNome || "desconhecido") + " · 📅 Enviada em: " + formatarData(aula.criadoEm);
    item.appendChild(autor);

    var descricao = document.createElement("p");
    descricao.textContent = aula.descricao;
    item.appendChild(descricao);

    var links = document.createElement("p");
    links.className = "item-meta";
    var linkVideo = document.createElement("a");
    linkVideo.className = "link-acao";
    linkVideo.href = aula.youtube;
    linkVideo.target = "_blank";
    linkVideo.rel = "noopener noreferrer";
    linkVideo.textContent = "🎥 Ver vídeo";
    var linkDoc = document.createElement("a");
    linkDoc.className = "link-acao";
    linkDoc.href = aula.documento;
    linkDoc.target = "_blank";
    linkDoc.rel = "noopener noreferrer";
    linkDoc.textContent = "📄 Ver material";
    links.appendChild(linkVideo);
    links.appendChild(document.createTextNode(" · "));
    links.appendChild(linkDoc);
    item.appendChild(links);

    var acoes = document.createElement("div");
    acoes.className = "item-admin-acoes";
    var btnDetalhes = document.createElement("button");
    btnDetalhes.type = "button";
    btnDetalhes.className = "btn-mini";
    btnDetalhes.textContent = "👁 Detalhes";
    btnDetalhes.addEventListener("click", function () { mostrarDetalhesAula(aula); });
    var btnAprovar = document.createElement("button");
    btnAprovar.type = "button";
    btnAprovar.className = "btn-mini aprovar";
    btnAprovar.textContent = "✅ Aprovar";
    btnAprovar.setAttribute("aria-label", "Aprovar aula " + aula.titulo);
    btnAprovar.addEventListener("click", function () { aprovarAula(aula); });
    var btnRecusar = document.createElement("button");
    btnRecusar.type = "button";
    btnRecusar.className = "btn-mini excluir";
    btnRecusar.textContent = "❌ Recusar";
    btnRecusar.setAttribute("aria-label", "Recusar aula " + aula.titulo);
    btnRecusar.addEventListener("click", function () { recusarAula(aula); });
    acoes.appendChild(btnDetalhes);
    acoes.appendChild(btnAprovar);
    acoes.appendChild(btnRecusar);
    item.appendChild(acoes);

    lista.appendChild(item);
  });
  if (aviso) aviso.hidden = pendentes.length !== 0;
}

function aprovarAula(aula) {
  if (!confirm('Aprovar a aula "' + aula.titulo + '"? O autor receberá 🟡 1 EFA Coin.')) return;
  var banco = firebase.firestore();
  var lote = banco.batch();
  var administrador = firebase.auth().currentUser;
  lote.update(banco.collection("aulas").doc(aula.id), {
    status: "aprovada",
    aprovadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    aprovadoPor: administrador ? (administrador.email || administrador.uid) : ""
  });
  if (aula.autorId) {
    lote.update(banco.collection("usuarios").doc(aula.autorId), {
      moedas: firebase.firestore.FieldValue.increment(1)
    });
    lote.set(banco.collection("transacoes").doc(), {
      usuarioId: aula.autorId,
      tipo: "ganho",
      quantidade: 1,
      motivo: "Aula aprovada: " + aula.titulo,
      aulaId: aula.id,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  lote.commit().then(function () {
    alert("✅ Aula aprovada e publicada no catálogo! O autor recebeu 🟡 1 EFA Coin.");
  }).catch(function (erro) {
    console.error("Erro ao aprovar aula:", erro);
    alert("Não foi possível aprovar a aula. " + (erro && erro.message ? "Detalhe: " + erro.message : "Verifique as regras do Firestore."));
  });
}

function recusarAula(aula) {
  var motivo = window.prompt('Informe o motivo da rejeição da aula "' + aula.titulo + '":');
  if (!motivo || !motivo.trim()) return;
  if (!confirm('Rejeitar a aula "' + aula.titulo + '"? Ela permanecerá disponível para o autor consultar.')) return;
  var administrador = firebase.auth().currentUser;
  firebase.firestore().collection("aulas").doc(aula.id).update({
    status: "recusada",
    motivoRejeicao: motivo.trim(),
    rejeitadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    rejeitadoPor: administrador ? (administrador.email || administrador.uid) : ""
  }).then(function () {
    alert("❌ Aula recusada.");
  }).catch(function (erro) {
    console.error("Erro ao recusar aula:", erro);
    alert("Não foi possível recusar a aula. " + (erro && erro.message ? "Detalhe: " + erro.message : "Verifique as regras do Firestore."));
  });
}

function resolverDenuncia(denuncia) {
  if (!confirm("Marcar esta denúncia como resolvida?")) return;
  var administrador = firebase.auth().currentUser;
  firebase.firestore().collection("denuncias").doc(denuncia.id).update({
    status: "resolvida",
    resolvidaEm: firebase.firestore.FieldValue.serverTimestamp(),
    resolvidaPor: administrador ? (administrador.email || administrador.uid) : ""
  }).catch(function (erro) {
    console.error("Erro ao resolver denúncia:", erro);
    alert("Não foi possível resolver a denúncia. Verifique as regras do Firestore.");
  });
}

function renderizarDenuncias() {
  var lista = document.getElementById("lista-denuncias");
  var aviso = document.getElementById("denuncias-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  DENUNCIAS.forEach(function (denuncia) {
    var item = document.createElement("li");
    item.className = "item-admin";

    var titulo = document.createElement("strong");
    titulo.textContent = denuncia.aulaTitulo || "Aula sem título";
    item.appendChild(titulo);

    var dados = document.createElement("p");
    dados.className = "item-meta";
    dados.textContent = "👤 " + (denuncia.denunciadorNome || "Usuário") +
      " · 📅 " + formatarData(denuncia.criadoEm);
    item.appendChild(dados);

    var motivo = document.createElement("p");
    motivo.textContent = "Motivo: " + denuncia.motivo;
    item.appendChild(motivo);

    var acoes = document.createElement("div");
    acoes.className = "item-admin-acoes";
    var resolver = document.createElement("button");
    resolver.type = "button";
    resolver.className = "btn-mini aprovar";
    resolver.textContent = "✓ Marcar como resolvida";
    resolver.addEventListener("click", function () { resolverDenuncia(denuncia); });
    acoes.appendChild(resolver);
    item.appendChild(acoes);
    lista.appendChild(item);
  });
  if (aviso) aviso.hidden = DENUNCIAS.length !== 0;
}

function aprovarSolicitacaoPremium(solicitacao) {
  if (!confirm("Confirme que o pagamento apareceu no extrato antes de aprovar esta solicitação.")) return;
  var administrador = firebase.auth().currentUser;
  var banco = firebase.firestore();
  var referenciaSolicitacao = banco.collection("solicitacoes_pagamento").doc(solicitacao.id);
  var referenciaUsuario = banco.collection("usuarios").doc(solicitacao.userId);
  referenciaUsuario.get().then(function (usuarioDocumento) {
    if (!usuarioDocumento.exists) {
      alert("Usuário não encontrado. Peça para ele entrar no EFA usando o Google antes de liberar o Premium.");
      throw { code: "premium-user-not-found" };
    }
    var dadosUsuario = usuarioDocumento.data();
    var agora = new Date();
    var validadeAtual = dadosUsuario.premiumAte && dadosUsuario.premiumAte.toDate ? dadosUsuario.premiumAte.toDate() : null;
    var inicio = validadeAtual && validadeAtual.getTime() > agora.getTime() ? validadeAtual : agora;
    var vencimento = new Date(inicio.getTime() + DIAS_PREMIUM * 24 * 60 * 60 * 1000);
    var lote = banco.batch();
    lote.update(referenciaSolicitacao, {
      status: "aprovada",
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      analisadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      analisadoPor: administrador ? (administrador.email || administrador.uid) : ""
    });
    lote.update(referenciaUsuario, {
      premium: true,
      premiumStatus: "ativo",
      premiumStartedAt: firebase.firestore.Timestamp.fromDate(inicio),
      premiumExpiresAt: firebase.firestore.Timestamp.fromDate(vencimento),
      premiumAte: firebase.firestore.Timestamp.fromDate(vencimento),
      premiumDays: DIAS_PREMIUM,
      premiumActivatedBy: administrador ? (administrador.email || administrador.uid) : "",
      premiumUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return lote.commit();
  }).then(function () {
    alert("Pagamento aprovado e Premium liberado por " + DIAS_PREMIUM + " dias.");
  }).catch(function (erro) {
    if (erro && erro.code === "premium-user-not-found") return;
    console.error("Erro ao aprovar pagamento:", erro);
    alert("Não foi possível aprovar o pagamento. Verifique as regras do Firestore.");
  });
}

function recusarSolicitacaoPremium(solicitacao) {
  var motivo = window.prompt("Informe o motivo da recusa:");
  if (!motivo || !motivo.trim()) return;
  var administrador = firebase.auth().currentUser;
  firebase.firestore().collection("solicitacoes_pagamento").doc(solicitacao.id).update({
    status: "recusada",
    motivoRecusa: motivo.trim(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    analisadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    analisadoPor: administrador ? (administrador.email || administrador.uid) : ""
  }).then(function () {
    alert("Solicitação recusada.");
  }).catch(function (erro) {
    console.error("Erro ao recusar pagamento:", erro);
    alert("Não foi possível recusar a solicitação. Verifique as regras do Firestore.");
  });
}

function renderizarPagamentosAdmin() {
  var lista = document.getElementById("lista-pagamentos-admin");
  var vazio = document.getElementById("pagamentos-admin-vazio");
  var filtro = document.getElementById("filtro-pagamentos-admin");
  if (!lista) return;
  var statusFiltro = filtro ? filtro.value : "pendente";
  var solicitacoes = TODAS_SOLICITACOES.filter(function (item) {
    return !statusFiltro || item.status === statusFiltro;
  });
  lista.innerHTML = "";
  solicitacoes.forEach(function (solicitacao) {
    var item = document.createElement("li");
    item.className = "item-admin";
    var titulo = document.createElement("strong");
    titulo.textContent = solicitacao.userName + " · " + solicitacao.userEmail;
    item.appendChild(titulo);
    var dados = document.createElement("p");
    dados.className = "item-meta";
    dados.textContent = solicitacao.plano + " · R$ " + solicitacao.valor.toFixed(2).replace(".", ",") +
      " · " + textoStatusSolicitacao(solicitacao.status) + " · " + formatarData(solicitacao.criadoEm);
    item.appendChild(dados);
    if (solicitacao.observacaoUsuario) {
      var observacao = document.createElement("p");
      observacao.textContent = "Observação: " + solicitacao.observacaoUsuario;
      item.appendChild(observacao);
    }
    if (solicitacao.identificadorTransacao) {
      var transacao = document.createElement("p");
      transacao.className = "item-meta";
      transacao.textContent = "Transação: " + solicitacao.identificadorTransacao;
      item.appendChild(transacao);
    }
    if (solicitacao.motivoRecusa) {
      var recusa = document.createElement("p");
      recusa.textContent = "Motivo da recusa: " + solicitacao.motivoRecusa;
      item.appendChild(recusa);
    }
    if (solicitacao.status === "pendente") {
      var acoes = document.createElement("div");
      acoes.className = "item-admin-acoes";
      var aprovar = document.createElement("button");
      aprovar.type = "button";
      aprovar.className = "btn-mini aprovar";
      aprovar.textContent = "Aprovar após conferir";
      aprovar.addEventListener("click", function () { aprovarSolicitacaoPremium(solicitacao); });
      var recusar = document.createElement("button");
      recusar.type = "button";
      recusar.className = "btn-mini excluir";
      recusar.textContent = "Recusar";
      recusar.addEventListener("click", function () { recusarSolicitacaoPremium(solicitacao); });
      acoes.appendChild(aprovar);
      acoes.appendChild(recusar);
      item.appendChild(acoes);
    }
    lista.appendChild(item);
  });
  if (vazio) vazio.hidden = solicitacoes.length !== 0;
}

// ---------- Painel do administrador: adicionar/editar aula ----------
function iniciarEdicao(aula) {
  aulaEmEdicao = aula.id;
  document.getElementById("campo-titulo").value = aula.titulo;
  document.getElementById("campo-descricao").value = aula.descricao;
  document.getElementById("campo-youtube").value = aula.youtube;
  document.getElementById("campo-documento").value = aula.documento;

  atualizarSelects();

  var campoDeficiencia = document.getElementById("campo-deficiencia");
  var campoMateria = document.getElementById("campo-materia");
  if (aula.deficienciaId) {
    var temOpcao = Array.prototype.some.call(campoDeficiencia.options, function (op) { return op.value === aula.deficienciaId; });
    if (!temOpcao) {
      var opcao = document.createElement("option");
      opcao.value = aula.deficienciaId;
      opcao.textContent = aula.deficienciaNome || "(deficiência removida)";
      campoDeficiencia.appendChild(opcao);
    }
    campoDeficiencia.value = aula.deficienciaId;
  }
  popularMaterias(campoMateria, campoDeficiencia.value, "Selecione a matéria", TODAS_MATERIAS.length ? TODAS_MATERIAS : MATERIAS);
  if (aula.materiaId) {
    var temMateria = Array.prototype.some.call(campoMateria.options, function (op) { return op.value === aula.materiaId; });
    if (!temMateria) {
      var opcaoMateria = document.createElement("option");
      opcaoMateria.value = aula.materiaId;
      opcaoMateria.textContent = aula.materiaNome || "(matéria removida)";
      campoMateria.appendChild(opcaoMateria);
    }
    campoMateria.value = aula.materiaId;
  }

  document.getElementById("btn-salvar-aula").textContent = "💾 Salvar alterações";
  document.getElementById("btn-cancelar-edicao").hidden = false;
  document.getElementById("form-aula").scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicao() {
  aulaEmEdicao = null;
  document.getElementById("form-aula").reset();
  document.getElementById("btn-salvar-aula").textContent = "➕ Adicionar aula";
  document.getElementById("btn-cancelar-edicao").hidden = true;
  atualizarSelects();
}

function salvarAula(evento) {
  evento.preventDefault();
  var campoTitulo = document.getElementById("campo-titulo");
  var campoDescricao = document.getElementById("campo-descricao");
  var campoDeficiencia = document.getElementById("campo-deficiencia");
  var campoMateria = document.getElementById("campo-materia");
  var campoYoutube = document.getElementById("campo-youtube");
  var campoDocumento = document.getElementById("campo-documento");
  if (!campoTitulo || !campoDescricao || !campoDeficiencia || !campoMateria || !campoYoutube || !campoDocumento) {
    alert("Não foi possível localizar os campos da aula.");
    return;
  }

  var deficienciaId = campoDeficiencia.value;
  var materiaId = campoMateria.value;
  if (!deficienciaId || !materiaId) {
    alert("Selecione a deficiência e a matéria da aula.");
    return;
  }

  var dados = {
    titulo: campoTitulo.value.trim(),
    descricao: campoDescricao.value.trim(),
    deficienciaId: deficienciaId,
    deficienciaNome: nomeDaDeficiencia(deficienciaId),
    materiaId: materiaId,
    materiaNome: nomeDaMateria(materiaId),
    etiqueta: nomeDaDeficiencia(deficienciaId),
    youtube: campoYoutube.value.trim(),
    documento: campoDocumento.value.trim()
  };

  if (!dados.titulo || !dados.descricao || !dados.youtube || !dados.documento) {
    alert("Preencha todos os campos da aula.");
    return;
  }

  var banco = firebase.firestore();
  var operacao;
  if (aulaEmEdicao) {
    // Edição: preserva status e autor
    operacao = banco.collection("aulas").doc(aulaEmEdicao).set(dados, { merge: true });
  } else {
    // Aula criada pelo administrador entra já aprovada (ele é o revisor)
    var usuario = firebase.auth().currentUser;
    dados.autorId = usuario ? usuario.uid : "";
    dados.autorNome = usuario ? (usuario.displayName || usuario.email) : "";
    dados.status = "aprovada";
    dados.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
    operacao = banco.collection("aulas").add(dados);
  }
  operacao.then(function () {
    cancelarEdicao();
  }).catch(function (erro) {
    console.error("Erro ao salvar aula:", erro);
    alert("Não foi possível salvar a aula. " + (erro && erro.message ? "Detalhe: " + erro.message : "Verifique as regras do Firestore."));
  });
}

function excluirAula(aula) {
  if (!confirm("Tem certeza que deseja excluir esta aula? (" + aula.titulo + ")")) return;
  firebase.firestore().collection("aulas").doc(aula.id).delete().catch(function (erro) {
    console.error("Erro ao excluir aula:", erro);
    alert("Não foi possível excluir a aula. " + (erro && erro.message ? "Detalhe: " + erro.message : "Verifique as regras do Firestore."));
  });
}

function renderizarListaAdmin() {
  var lista = document.getElementById("lista-admin");
  var aviso = document.getElementById("admin-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  var campoBusca = document.getElementById("busca-admin");
  var termo = campoBusca ? normalizar(campoBusca.value.trim()) : "";
  var visiveis = TODAS_AULAS.filter(function (aula) {
    var texto = normalizar(aula.titulo) + " " + normalizar(aula.descricao);
    return !termo || texto.indexOf(termo) !== -1;
  });
  visiveis.forEach(function (aula) {
    var item = document.createElement("li");
    item.className = "item-admin";

    var cabecalho = document.createElement("div");
    cabecalho.className = "item-admin-cabecalho";

    var titulo = document.createElement("strong");
    titulo.textContent = aula.titulo;

    var etiqueta = document.createElement("span");
    etiqueta.className = "tag-perfil";
    etiqueta.textContent = aula.deficienciaNome || aula.etiqueta || ETIQUETAS[aula.perfil] || "Geral";

    cabecalho.appendChild(titulo);
    cabecalho.appendChild(etiqueta);
    if (aula.materiaNome) {
      var seloMateria = document.createElement("span");
      seloMateria.className = "tag-materia";
      seloMateria.textContent = aula.materiaNome;
      cabecalho.appendChild(seloMateria);
    }
    cabecalho.appendChild(criarBadgeStatus(aula.status));
    item.appendChild(cabecalho);

    var acoes = document.createElement("div");
    acoes.className = "item-admin-acoes";
    var btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn-mini";
    btnEditar.textContent = "✏️ Editar";
    btnEditar.setAttribute("aria-label", "Editar aula " + aula.titulo);
    btnEditar.addEventListener("click", function () { iniciarEdicao(aula); });
    var btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "btn-mini excluir";
    btnExcluir.textContent = "🗑️ Excluir";
    btnExcluir.setAttribute("aria-label", "Excluir aula " + aula.titulo);
    btnExcluir.addEventListener("click", function () { excluirAula(aula); });
    acoes.appendChild(btnEditar);
    acoes.appendChild(btnExcluir);
    item.appendChild(acoes);
    lista.appendChild(item);
  });
  if (aviso) aviso.hidden = visiveis.length !== 0;
}

// ---------- Painel do administrador: deficiências ----------
function salvarDeficiencia(evento) {
  evento.preventDefault();
  if (!ehAdministrador(usuarioAtual)) return;
  var campoNome = document.getElementById("campo-deficiencia-nome");
  var campoDescricao = document.getElementById("campo-deficiencia-descricao");
  var campoAtiva = document.getElementById("campo-deficiencia-ativa");
  var campoOrdem = document.getElementById("campo-deficiencia-ordem");
  if (!campoNome || !campoDescricao || !campoAtiva || !campoOrdem) {
    alert("Não foi possível localizar os campos da deficiência.");
    return;
  }

  var nome = campoNome.value.trim();
  if (!nome) {
    alert("Informe o nome da deficiência.");
    return;
  }

  var ordem = parseInt(campoOrdem.value, 10);
  if (isNaN(ordem)) ordem = TODAS_DEFICIENCIAS.length + 1;

  var dados = {
    nome: nome,
    descricao: campoDescricao.value.trim(),
    ativa: campoAtiva.checked,
    status: "aprovada",
    criadoPor: usuarioAtual.uid,
    ordem: ordem
  };

  var banco = firebase.firestore();
  var operacao = banco.collection("deficiencias").get().then(function (resultado) {
    var duplicada = resultado.docs.some(function (documento) {
      return documento.id !== deficienciaEmEdicao && normalizarNomeEstrutura(documento.data().nome) === normalizarNomeEstrutura(nome);
    });
    if (duplicada) throw { code: "duplicate-structure" };
    return deficienciaEmEdicao
      ? banco.collection("deficiencias").doc(deficienciaEmEdicao).set(dados, { merge: true })
      : banco.collection("deficiencias").add(Object.assign({}, dados, { criadoEm: firebase.firestore.FieldValue.serverTimestamp() }));
  });

  operacao.then(function () {
    cancelarEdicaoDeficiencia();
    alert("✅ Deficiência salva.");
  }).catch(function (erro) {
    if (erro && erro.code === "duplicate-structure") {
      alert("Já existe uma deficiência com esse nome.");
      return;
    }
    console.error("Erro ao salvar deficiência:", erro);
    alert("Não foi possível salvar a deficiência. " + (erro && erro.message ? "Detalhe: " + erro.message : "Tente novamente."));
  });
}

function iniciarEdicaoDeficiencia(deficiencia) {
  deficienciaEmEdicao = deficiencia.id;
  document.getElementById("campo-deficiencia-nome").value = deficiencia.nome;
  document.getElementById("campo-deficiencia-descricao").value = deficiencia.descricao;
  document.getElementById("campo-deficiencia-ativa").checked = deficiencia.ativa;
  document.getElementById("campo-deficiencia-ordem").value = deficiencia.ordem;
  document.getElementById("btn-salvar-deficiencia").textContent = "💾 Salvar alterações";
  document.getElementById("btn-cancelar-deficiencia").hidden = false;
}

function cancelarEdicaoDeficiencia() {
  deficienciaEmEdicao = null;
  document.getElementById("form-deficiencia").reset();
  document.getElementById("campo-deficiencia-ativa").checked = true;
  document.getElementById("btn-salvar-deficiencia").textContent = "➕ Adicionar deficiência";
  document.getElementById("btn-cancelar-deficiencia").hidden = true;
}

function excluirDeficiencia(deficiencia) {
  if (!ehAdministrador(usuarioAtual)) return;
  var vinculadas = TODAS_MATERIAS.filter(function (materia) {
    return materia.deficienciaIds.indexOf(deficiencia.id) !== -1;
  });
  var soDesta = vinculadas.filter(function (materia) {
    return materia.deficienciaIds.length <= 1;
  });
  if (soDesta.length) {
    alert(soDesta.length + " matéria(s) estão vinculada(s) somente a esta deficiência (ex.: " + soDesta[0].nome + "). Vincule-as a outra deficiência ou exclua-as antes de excluir a deficiência.");
    return;
  }
  if (!confirm('Excluir a deficiência "' + deficiencia.nome + '"? As matérias compartilhadas manterão o vínculo com as outras deficiências e as aulas já criadas manterão o nome salvo.')) return;
  var banco = firebase.firestore();
  return banco.collection("aulas").where("deficienciaId", "==", deficiencia.id).get().then(function (aulas) {
    if (!aulas.empty) {
      return banco.collection("deficiencias").doc(deficiencia.id).update({ ativa: false, status: "aprovada" }).then(function () {
        alert("A deficiência está sendo usada por aulas e foi desativada para novos cadastros.");
      });
    }
    var lote = banco.batch();
    vinculadas.forEach(function (materia) {
      var restantes = materia.deficienciaIds.filter(function (id) { return id !== deficiencia.id; });
      lote.update(banco.collection("materias").doc(materia.id), {
        deficienciaIds: restantes,
        deficienciaId: restantes[0] || ""
      });
    });
    lote.delete(banco.collection("deficiencias").doc(deficiencia.id));
    return lote.commit();
  }).then(function () {
    cancelarEdicaoDeficiencia();
  }).catch(function (erro) {
    console.error("Erro ao excluir deficiência:", erro);
    alert("Não foi possível excluir a deficiência. " + (erro && erro.message ? "Detalhe: " + erro.message : "Verifique as regras do Firestore."));
  });
}

// Cadastra em lote as deficiências sugeridas nas coleções já existentes,
// pulando tudo que já estiver cadastrado (sem duplicar documentos).
function cadastrarDeficienciasSugeridas() {
  if (!firebasePronto || typeof firebase.firestore !== "function") {
    alert("O Firebase não está disponível.");
    return;
  }
  var banco = firebase.firestore();
  var lote = banco.batch();
  var novasDeficiencias = 0;
  var novasMaterias = 0;

  DEFICIENCIAS_SUGERIDAS.forEach(function (sugerida) {
    var existente = TODAS_DEFICIENCIAS.filter(function (deficiencia) {
      var a = normalizar(deficiencia.nome);
      var b = normalizar(sugerida.nome);
      return a === b || a.indexOf(b) !== -1 || b.indexOf(a) !== -1;
    })[0];

    var deficienciaId;
    if (existente) {
      deficienciaId = existente.id;
    } else {
      var refNova = banco.collection("deficiencias").doc();
      deficienciaId = refNova.id;
      lote.set(refNova, {
        nome: sugerida.nome,
        descricao: sugerida.descricao,
        ativa: true,
        status: "aprovada",
        criadoPor: usuarioAtual.uid,
        ordem: TODAS_DEFICIENCIAS.length + novasDeficiencias + 1,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      novasDeficiencias++;
    }

    sugerida.materias.forEach(function (nomeMateria, indice) {
      var jaExiste = TODAS_MATERIAS.some(function (materia) {
        return materia.deficienciaIds.indexOf(deficienciaId) !== -1 && normalizar(materia.nome) === normalizar(nomeMateria);
      });
      if (jaExiste) return;
      lote.set(banco.collection("materias").doc(), {
        nome: nomeMateria,
        deficienciaId: deficienciaId,
        deficienciaIds: [deficienciaId],
        ativa: true,
        status: "aprovada",
        criadoPor: usuarioAtual.uid,
        ordem: indice + 1,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      novasMaterias++;
    });
  });

  if (!novasDeficiencias && !novasMaterias) {
    alert("Todas as deficiências sugeridas já estão cadastradas. Nada foi duplicado.");
    return;
  }
  if (!confirm("Cadastrar " + novasDeficiencias + " nova(s) deficiência(s) e " + novasMaterias + " matéria(s)? O que já existe não será duplicado e você poderá editar ou desativar tudo pelo painel.")) return;

  lote.commit().then(function () {
    alert("✅ Cadastro concluído: " + novasDeficiencias + " deficiência(s) e " + novasMaterias + " matéria(s). Elas já aparecem no catálogo e no formulário de criação de aula.");
  }).catch(function (erro) {
    console.error("Erro ao cadastrar deficiências sugeridas:", erro);
    alert("Não foi possível cadastrar as sugestões. " + (erro && erro.message ? "Detalhe: " + erro.message : "Verifique as regras do Firestore e tente novamente."));
  });
}

function solicitarEstrutura(tipo, nome, dadosExtras, feedbackId) {
  if (!usuarioAtual || !firebasePronto) {
    alert("Entre com o Google antes de adicionar uma opção.");
    return Promise.reject({ code: "not-authenticated" });
  }
  var nomeValido = nomeEstruturaValido(nome);
  if (!nomeValido) {
    alert("Informe um nome válido, com até 200 caracteres e conteúdo significativo.");
    return Promise.reject({ code: "invalid-name" });
  }

  var colecao = tipo === "materia" ? "materias" : "deficiencias";
  var banco = firebase.firestore();
  var nomeNormalizado = normalizarNomeEstrutura(nomeValido);
  var feedback = document.getElementById(feedbackId);
  return banco.collection(colecao).get().then(function (resultado) {
    var existente = resultado.docs.some(function (doc) {
      return normalizarNomeEstrutura(doc.data().nome) === nomeNormalizado;
    });
    if (existente) {
      throw { code: "duplicate-structure" };
    }
    var especial = ehProfessorEspecial() || ehAdministrador(usuarioAtual);
    var dados = Object.assign({
      tipo: tipo,
      nome: nomeValido,
      status: especial ? "aprovada" : "pendente",
      ativa: especial,
      criadoPor: usuarioAtual.uid,
      criadoPorNome: usuarioAtual.displayName || usuarioAtual.email || "Usuário",
      criadoPorEmail: usuarioAtual.email || "",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      motivoRejeicao: "",
      ordem: 0
    }, dadosExtras || {});
    return banco.collection(colecao).add(dados);
  }).then(function () {
    if (feedback) feedback.textContent = ehProfessorEspecial() ? "✅ Opção adicionada e aprovada." : "✅ Solicitação enviada para análise.";
  }).catch(function (erro) {
    if (erro && erro.code === "duplicate-structure") {
      if (feedback) feedback.textContent = tipo === "materia" ? "Essa matéria já está cadastrada." : "Essa deficiência já está cadastrada.";
      return;
    }
    if (erro && (erro.code === "invalid-name" || erro.code === "not-authenticated")) return;
    console.error("Erro ao solicitar estrutura:", erro);
    if (feedback) feedback.textContent = "Não foi possível salvar a solicitação. Tente novamente.";
  });
}

function solicitarDeficiencia(evento) {
  evento.preventDefault();
  var campo = document.getElementById("campo-solicitar-deficiencia-nome");
  if (!campo) return;
  solicitarEstrutura("deficiencia", campo.value, { descricao: "" }, "feedback-solicitar-deficiencia").then(function () {
    campo.value = "";
    fecharSolicitacaoEstrutura("deficiencia");
  });
}

function solicitarMateria(evento) {
  evento.preventDefault();
  var campo = document.getElementById("campo-solicitar-materia-nome");
  var deficiencia = document.getElementById("campo-criar-deficiencia");
  if (!campo) return;
  var ids = deficiencia && deficiencia.value && deficiencia.value !== "__solicitar__" ? [deficiencia.value] : [];
  if (!ids.length) {
    alert("Selecione primeiro a deficiência vinculada à matéria.");
    return;
  }
  solicitarEstrutura("materia", campo.value, {
    deficienciaIds: ids,
    deficienciaId: ids[0]
  }, "feedback-solicitar-materia").then(function () {
    campo.value = "";
    fecharSolicitacaoEstrutura("materia");
  });
}

function fecharSolicitacaoEstrutura(tipo) {
  var form = document.getElementById("form-solicitar-" + tipo);
  if (form) form.hidden = true;
  var select = document.getElementById("campo-criar-" + tipo);
  if (select) select.value = "";
  if (tipo === "deficiencia") {
    popularMaterias(document.getElementById("campo-criar-materia"), "", "Selecione a matéria", MATERIAS);
  }
  atualizarEstadoSolicitacoesEstrutura();
}

function garantirOpcoesIniciais() {
  if (!ehAdministrador(usuarioAtual) || !firebasePronto) return;
  var banco = firebase.firestore();
  var nomesDeficiencias = ["TDAH", "Dislexia", "Transtorno do Espectro Autista (TEA)", "Baixa visão"];
  var nomesMaterias = ["Matemática", "Português", "Ciências", "História"];
  banco.collection("deficiencias").get().then(function (resultado) {
    var existentes = resultado.docs.map(function (doc) { return { id: doc.id, nome: doc.data().nome }; });
    var lote = banco.batch();
    var ids = [];
    nomesDeficiencias.forEach(function (nome, indice) {
      var existente = existentes.filter(function (item) { return normalizarNomeEstrutura(item.nome) === normalizarNomeEstrutura(nome); })[0];
      if (existente) {
        ids.push(existente.id);
        return;
      }
      var ref = banco.collection("deficiencias").doc();
      ids.push(ref.id);
      lote.set(ref, {
        nome: nome,
        descricao: "",
        ativa: true,
        status: "aprovada",
        criadoPor: usuarioAtual.uid,
        ordem: indice + 1,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    return lote.commit().then(function () { return ids; });
  }).then(function (idsDeficiencias) {
    return banco.collection("materias").get().then(function (resultado) {
      var existentes = resultado.docs.map(function (doc) { return { id: doc.id, nome: doc.data().nome }; });
      var lote = banco.batch();
      nomesMaterias.forEach(function (nome, indice) {
        var existe = existentes.some(function (item) { return normalizarNomeEstrutura(item.nome) === normalizarNomeEstrutura(nome); });
        if (existe) return;
        var ref = banco.collection("materias").doc();
        lote.set(ref, {
          nome: nome,
          deficienciaIds: idsDeficiencias,
          deficienciaId: idsDeficiencias[0] || "",
          ativa: true,
          status: "aprovada",
          criadoPor: usuarioAtual.uid,
          ordem: indice + 1,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      return lote.commit();
    });
  }).catch(function (erro) {
    console.error("Erro ao garantir opções iniciais:", erro);
  });
}

function alterarPasseEspecial(usuario, ativado) {
  if (!ehAdministrador(usuarioAtual)) return;
  firebase.firestore().collection("usuarios").doc(usuario.id).update({
    passeEspecial: !!ativado,
    passeEspecialAtualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    passeEspecialAtualizadoPor: usuarioAtual.uid
  }).catch(function (erro) {
    console.error("Erro ao alterar Passe Especial:", erro);
    alert("Não foi possível alterar o Passe Especial. Verifique as regras do Firestore.");
  });
}

function renderizarUsuariosAdmin() {
  var lista = document.getElementById("lista-usuarios-admin");
  var aviso = document.getElementById("usuarios-admin-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  TODOS_USUARIOS.forEach(function (usuario) {
    var item = document.createElement("li");
    item.className = "item-admin";
    var titulo = document.createElement("strong");
    titulo.textContent = usuario.nome;
    item.appendChild(titulo);
    var email = document.createElement("p");
    email.className = "item-meta";
    email.textContent = "E-mail: " + (usuario.email || "não informado") + " · UID: " + usuario.id;
    item.appendChild(email);
    var label = document.createElement("label");
    label.className = "campo-linha";
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = usuario.passeEspecial;
    checkbox.addEventListener("change", function () { alterarPasseEspecial(usuario, checkbox.checked); });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" Passe Especial"));
    item.appendChild(label);
    lista.appendChild(item);
  });
  if (aviso) aviso.hidden = TODOS_USUARIOS.length !== 0;
}

function atualizarSolicitacaoEstrutura(solicitacao, aprovar) {
  if (!ehAdministrador(usuarioAtual)) return;
  var motivo = "";
  if (!aprovar) {
    motivo = window.prompt("Informe o motivo da rejeição:");
    if (!motivo || !motivo.trim()) return;
  }
  var colecao = solicitacao.tipo === "materia" ? "materias" : "deficiencias";
  var administrador = firebase.auth().currentUser;
  firebase.firestore().collection(colecao).doc(solicitacao.id).update({
    status: aprovar ? "aprovada" : "recusada",
    ativa: !!aprovar,
    motivoRejeicao: aprovar ? "" : motivo.trim(),
    analisadoPor: administrador ? administrador.uid : "",
    analisadoEm: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function () {
    alert(aprovar ? "Solicitação aprovada." : "Solicitação rejeitada.");
  }).catch(function (erro) {
    console.error("Erro ao atualizar solicitação de estrutura:", erro);
    alert("Não foi possível atualizar a solicitação. Verifique as regras do Firestore.");
  });
}

function renderizarSolicitacoesEstruturaAdmin() {
  var lista = document.getElementById("lista-solicitacoes-estrutura-admin");
  var aviso = document.getElementById("solicitacoes-estrutura-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  var pendentes = TODAS_SOLICITACOES_ESTRUTURA.filter(function (item) { return item.status === "pendente"; });
  pendentes.forEach(function (solicitacao) {
    var item = document.createElement("li");
    item.className = "item-admin";
    var titulo = document.createElement("strong");
    titulo.textContent = (solicitacao.tipo === "materia" ? "Matéria: " : "Deficiência: ") + solicitacao.nome;
    item.appendChild(titulo);
    var meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = "Solicitado por: " + solicitacao.criadoPorNome + " · " + (solicitacao.criadoPorEmail || "e-mail não informado") + " · " + formatarData(solicitacao.criadoEm);
    item.appendChild(meta);
    var acoes = document.createElement("div");
    acoes.className = "item-admin-acoes";
    var aprovar = document.createElement("button");
    aprovar.type = "button";
    aprovar.className = "btn-mini aprovar";
    aprovar.textContent = "Aprovar";
    aprovar.addEventListener("click", function () { atualizarSolicitacaoEstrutura(solicitacao, true); });
    var rejeitar = document.createElement("button");
    rejeitar.type = "button";
    rejeitar.className = "btn-mini excluir";
    rejeitar.textContent = "Rejeitar";
    rejeitar.addEventListener("click", function () { atualizarSolicitacaoEstrutura(solicitacao, false); });
    acoes.appendChild(aprovar);
    acoes.appendChild(rejeitar);
    item.appendChild(acoes);
    lista.appendChild(item);
  });
  if (aviso) aviso.hidden = pendentes.length !== 0;
}

function renderizarDeficiencias() {
  var lista = document.getElementById("lista-deficiencias");
  var aviso = document.getElementById("deficiencias-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  TODAS_DEFICIENCIAS.forEach(function (deficiencia) {
    var item = document.createElement("li");
    item.className = "item-admin";

    var cabecalho = document.createElement("div");
    cabecalho.className = "item-admin-cabecalho";

    var titulo = document.createElement("strong");
    titulo.textContent = deficiencia.nome;
    cabecalho.appendChild(titulo);
    cabecalho.appendChild(criarBadgeAtiva(deficiencia.ativa));

    var ordem = document.createElement("span");
    ordem.className = "item-meta";
    ordem.textContent = "Ordem: " + deficiencia.ordem;
    cabecalho.appendChild(ordem);
    item.appendChild(cabecalho);

    if (deficiencia.descricao) {
      var descricao = document.createElement("p");
      descricao.className = "item-meta";
      descricao.textContent = deficiencia.descricao;
      item.appendChild(descricao);
    }

    var acoes = document.createElement("div");
    acoes.className = "item-admin-acoes";
    var btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn-mini";
    btnEditar.textContent = "✏️ Editar";
    btnEditar.setAttribute("aria-label", "Editar deficiência " + deficiencia.nome);
    btnEditar.addEventListener("click", function () { iniciarEdicaoDeficiencia(deficiencia); });
    var btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "btn-mini excluir";
    btnExcluir.textContent = "🗑️ Excluir";
    btnExcluir.setAttribute("aria-label", "Excluir deficiência " + deficiencia.nome);
    btnExcluir.addEventListener("click", function () { excluirDeficiencia(deficiencia); });
    acoes.appendChild(btnEditar);
    acoes.appendChild(btnExcluir);
    item.appendChild(acoes);

    lista.appendChild(item);
  });
  if (aviso) aviso.hidden = TODAS_DEFICIENCIAS.length !== 0;
}

// ---------- Painel do administrador: matérias ----------
function salvarMateria(evento) {
  evento.preventDefault();
  if (!ehAdministrador(usuarioAtual)) return;
  var campoNome = document.getElementById("campo-materia-nome");
  var campoAtiva = document.getElementById("campo-materia-ativa");
  var campoOrdem = document.getElementById("campo-materia-ordem");
  if (!campoNome || !campoAtiva || !campoOrdem) {
    alert("Não foi possível localizar os campos da matéria.");
    return;
  }

  var nome = campoNome.value.trim();
  var deficienciaIds = obterDeficienciasSelecionadas();
  if (!nome) {
    alert("Informe o nome da matéria.");
    return;
  }
  if (!deficienciaIds.length) {
    alert("Vincule a matéria a pelo menos uma deficiência.");
    return;
  }

  var ordem = parseInt(campoOrdem.value, 10);
  if (isNaN(ordem)) {
    ordem = TODAS_MATERIAS.length + 1;
  }

  var dados = {
    nome: nome,
    deficienciaIds: deficienciaIds,
    deficienciaId: deficienciaIds[0],
    ativa: campoAtiva.checked,
    status: "aprovada",
    criadoPor: usuarioAtual.uid,
    ordem: ordem
  };

  var banco = firebase.firestore();
  var operacao = banco.collection("materias").get().then(function (resultado) {
    var duplicada = resultado.docs.some(function (documento) {
      var existente = documento.data();
      var ids = Array.isArray(existente.deficienciaIds) ? existente.deficienciaIds : (existente.deficienciaId ? [existente.deficienciaId] : []);
      return documento.id !== materiaEmEdicao
        && normalizarNomeEstrutura(existente.nome) === normalizarNomeEstrutura(nome)
        && deficienciaIds.some(function (id) { return ids.indexOf(id) !== -1; });
    });
    if (duplicada) throw { code: "duplicate-structure" };
    return materiaEmEdicao
      ? banco.collection("materias").doc(materiaEmEdicao).set(dados, { merge: true })
      : banco.collection("materias").add(Object.assign({}, dados, { criadoEm: firebase.firestore.FieldValue.serverTimestamp() }));
  });

  operacao.then(function () {
    cancelarEdicaoMateria();
    alert("✅ Matéria salva.");
  }).catch(function (erro) {
    if (erro && erro.code === "duplicate-structure") {
      alert("Já existe uma matéria com esse nome em uma das deficiências selecionadas.");
      return;
    }
    console.error("Erro ao salvar matéria:", erro);
    alert("Não foi possível salvar a matéria. " + (erro && erro.message ? "Detalhe: " + erro.message : "Tente novamente."));
  });
}

function iniciarEdicaoMateria(materia) {
  materiaEmEdicao = materia.id;
  document.getElementById("campo-materia-nome").value = materia.nome;
  document.getElementById("campo-materia-ativa").checked = materia.ativa;
  document.getElementById("campo-materia-ordem").value = materia.ordem;
  atualizarSelects();
  marcarDeficienciasSelecionadas(materia.deficienciaIds);
  document.getElementById("btn-salvar-materia").textContent = "💾 Salvar alterações";
  document.getElementById("btn-cancelar-materia").hidden = false;
}

function cancelarEdicaoMateria() {
  materiaEmEdicao = null;
  document.getElementById("form-materia").reset();
  document.getElementById("campo-materia-ativa").checked = true;
  document.getElementById("btn-salvar-materia").textContent = "➕ Adicionar matéria";
  document.getElementById("btn-cancelar-materia").hidden = true;
  atualizarSelects();
  marcarDeficienciasSelecionadas([]);
}

function excluirMateria(materia) {
  if (!ehAdministrador(usuarioAtual)) return;
  if (!confirm('Excluir a matéria "' + materia.nome + '"? As aulas já criadas manterão o nome salvo.')) return;
  var banco = firebase.firestore();
  banco.collection("aulas").where("materiaId", "==", materia.id).get().then(function (aulas) {
    if (!aulas.empty) {
      return banco.collection("materias").doc(materia.id).update({ ativa: false, status: "aprovada" }).then(function () {
        alert("A matéria está sendo usada por aulas e foi desativada para novos cadastros.");
      });
    }
    return banco.collection("materias").doc(materia.id).delete();
  }).then(function () {
    cancelarEdicaoMateria();
  }).catch(function (erro) {
    console.error("Erro ao excluir matéria:", erro);
    alert("Não foi possível excluir a matéria. " + (erro && erro.message ? "Detalhe: " + erro.message : "Tente novamente."));
  });
}

function renderizarMaterias() {
  var lista = document.getElementById("lista-materias");
  var aviso = document.getElementById("materias-vazio");
  var filtro = document.getElementById("select-deficiencia-materias");
  if (!lista) return;
  lista.innerHTML = "";
  var deficienciaFiltro = filtro ? filtro.value : "";
  var visiveis = TODAS_MATERIAS.filter(function (materia) {
    return !deficienciaFiltro || materia.deficienciaIds.indexOf(deficienciaFiltro) !== -1;
  });
  visiveis.forEach(function (materia) {
    var item = document.createElement("li");
    item.className = "item-admin";

    var cabecalho = document.createElement("div");
    cabecalho.className = "item-admin-cabecalho";

    var titulo = document.createElement("strong");
    titulo.textContent = materia.nome;
    cabecalho.appendChild(titulo);
    cabecalho.appendChild(criarBadgeAtiva(materia.ativa));
    item.appendChild(cabecalho);

    var nomes = materia.deficienciaIds.map(nomeDaDeficiencia).filter(Boolean).join(", ");
    var meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = "Deficiências: " + (nomes || "(removida)") + " · Ordem: " + materia.ordem;
    item.appendChild(meta);

    var acoes = document.createElement("div");
    acoes.className = "item-admin-acoes";
    var btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn-mini";
    btnEditar.textContent = "✏️ Editar";
    btnEditar.setAttribute("aria-label", "Editar matéria " + materia.nome);
    btnEditar.addEventListener("click", function () { iniciarEdicaoMateria(materia); });
    var btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "btn-mini excluir";
    btnExcluir.textContent = "🗑️ Excluir";
    btnExcluir.setAttribute("aria-label", "Excluir matéria " + materia.nome);
    btnExcluir.addEventListener("click", function () { excluirMateria(materia); });
    acoes.appendChild(btnEditar);
    acoes.appendChild(btnExcluir);
    item.appendChild(acoes);

    lista.appendChild(item);
  });
  if (aviso) aviso.hidden = visiveis.length !== 0;
}

// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", function () {
  try {
    if (localStorage.getItem("tema") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (erro) {
    console.warn("Não foi possível carregar o tema.", erro);
  }

  var btnDiminuir = document.getElementById("btn-diminuir");
  if (btnDiminuir) btnDiminuir.addEventListener("click", function () { alterarTamanhoFonte(-2); });
  var btnAumentar = document.getElementById("btn-aumentar");
  if (btnAumentar) btnAumentar.addEventListener("click", function () { alterarTamanhoFonte(2); });
  var btnDislexia = document.getElementById("btn-dislexia");
  if (btnDislexia) btnDislexia.addEventListener("click", function () { alternarDislexia(this); });
  var btnFoco = document.getElementById("btn-foco");
  if (btnFoco) btnFoco.addEventListener("click", function () { alternarFoco(this); });
  var btnTema = document.getElementById("btn-tema");
  if (btnTema) btnTema.addEventListener("click", alternarTema);
  configurarPremiumPublico();

  // Firebase
  if (iniciarFirebase()) {
    firebase.auth().getRedirectResult().then(function (resultado) {
      if (resultado && resultado.user) {
        console.info("Retorno do redirecionamento concluído. Usuário:", resultado.user.email);
      }
    }).catch(function (erro) {
      registrarErroLogin("getRedirectResult (retorno do redirecionamento)", erro);
      if (erro && erro.code !== "auth/popup-closed-by-user" && erro.code !== "auth/cancelled-popup-request" && erro.code !== "auth/no-auth-event") {
        alert(mensagemDeErro(erro));
      }
    });
  }

  var btnGoogle = document.getElementById("btn-google");
  if (btnGoogle) btnGoogle.addEventListener("click", aoClicarBotaoGoogle);
  var btnSair = document.getElementById("btn-sair");
  if (btnSair) {
    btnSair.addEventListener("click", function () {
      if (firebasePronto) {
        firebase.auth().signOut().catch(function (erro) {
          console.error("Erro ao sair:", erro);
        });
      }
    });
  }

  var btnFecharDetalhes = document.getElementById("btn-fechar-detalhes");
  if (btnFecharDetalhes) btnFecharDetalhes.addEventListener("click", fecharDetalhesAula);
  Array.prototype.forEach.call(document.querySelectorAll(".aba-admin"), function (aba) {
    aba.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".aba-admin"), function (item) {
        item.classList.remove("ativa");
      });
      aba.classList.add("ativa");
    });
  });

  // Busca e filtros do catálogo (deficiência → matéria → aulas)
  var campoBusca = document.getElementById("campo-busca");
  if (campoBusca) campoBusca.addEventListener("input", renderizarAulas);
  var filtroDeficiencia = document.getElementById("filtro-deficiencia");
  if (filtroDeficiencia) {
    filtroDeficiencia.addEventListener("change", function () {
      popularMaterias(document.getElementById("filtro-materia"), filtroDeficiencia.value, "Todas as matérias", MATERIAS);
      renderizarAulas();
    });
  }
  var filtroMateria = document.getElementById("filtro-materia");
  if (filtroMateria) filtroMateria.addEventListener("change", renderizarAulas);

  // Banco de dados
  carregarCatalogo();
  carregarEstruturaPublica();

  // Criar aula (usuário)
  var formCriar = document.getElementById("form-criar-aula");
  if (formCriar) formCriar.addEventListener("submit", enviarAulaAnalise);
  var campoCriarDeficiencia = document.getElementById("campo-criar-deficiencia");
  if (campoCriarDeficiencia) {
    campoCriarDeficiencia.addEventListener("change", function () {
      if (campoCriarDeficiencia.value === "__solicitar__") {
        campoCriarDeficiencia.value = "";
        var formularioDeficiencia = document.getElementById("form-solicitar-deficiencia");
        if (formularioDeficiencia) {
          formularioDeficiencia.hidden = false;
          document.getElementById("campo-solicitar-deficiencia-nome").focus();
        }
        return;
      }
      popularMaterias(document.getElementById("campo-criar-materia"), campoCriarDeficiencia.value, "Selecione a matéria", MATERIAS);
      atualizarEstadoSolicitacoesEstrutura();
    });
  }
  var campoCriarMateria = document.getElementById("campo-criar-materia");
  if (campoCriarMateria) {
    campoCriarMateria.addEventListener("change", function () {
      if (campoCriarMateria.value !== "__solicitar__") return;
      campoCriarMateria.value = "";
      var formularioMateria = document.getElementById("form-solicitar-materia");
      if (formularioMateria) {
        formularioMateria.hidden = false;
        document.getElementById("campo-solicitar-materia-nome").focus();
      }
    });
  }
  var formSolicitarDeficiencia = document.getElementById("form-solicitar-deficiencia");
  if (formSolicitarDeficiencia) formSolicitarDeficiencia.addEventListener("submit", solicitarDeficiencia);
  var formSolicitarMateria = document.getElementById("form-solicitar-materia");
  if (formSolicitarMateria) formSolicitarMateria.addEventListener("submit", solicitarMateria);
  var btnSolicitarDeficiencia = document.getElementById("btn-solicitar-deficiencia");
  if (btnSolicitarDeficiencia) btnSolicitarDeficiencia.addEventListener("click", function () {
    var formulario = document.getElementById("form-solicitar-deficiencia");
    if (formulario) {
      formulario.hidden = false;
      document.getElementById("campo-solicitar-deficiencia-nome").focus();
    }
  });
  var btnSolicitarMateria = document.getElementById("btn-solicitar-materia");
  if (btnSolicitarMateria) btnSolicitarMateria.addEventListener("click", function () {
    var formulario = document.getElementById("form-solicitar-materia");
    if (formulario) {
      formulario.hidden = false;
      document.getElementById("campo-solicitar-materia-nome").focus();
    }
  });
  var btnCancelarSolicitarDeficiencia = document.getElementById("btn-cancelar-solicitar-deficiencia");
  if (btnCancelarSolicitarDeficiencia) btnCancelarSolicitarDeficiencia.addEventListener("click", function () { fecharSolicitacaoEstrutura("deficiencia"); });
  var btnCancelarSolicitarMateria = document.getElementById("btn-cancelar-solicitar-materia");
  if (btnCancelarSolicitarMateria) btnCancelarSolicitarMateria.addEventListener("click", function () { fecharSolicitacaoEstrutura("materia"); });

  // Painel do administrador: aulas
  var formAula = document.getElementById("form-aula");
  if (formAula) formAula.addEventListener("submit", salvarAula);
  var btnCancelar = document.getElementById("btn-cancelar-edicao");
  if (btnCancelar) btnCancelar.addEventListener("click", cancelarEdicao);
  var campoDeficienciaAula = document.getElementById("campo-deficiencia");
  if (campoDeficienciaAula) {
    campoDeficienciaAula.addEventListener("change", function () {
      popularMaterias(document.getElementById("campo-materia"), campoDeficienciaAula.value, "Selecione a matéria", TODAS_MATERIAS.length ? TODAS_MATERIAS : MATERIAS);
    });
  }
  var buscaAdmin = document.getElementById("busca-admin");
  if (buscaAdmin) buscaAdmin.addEventListener("input", renderizarListaAdmin);

  // Painel do administrador: deficiências
  var formDeficiencia = document.getElementById("form-deficiencia");
  if (formDeficiencia) formDeficiencia.addEventListener("submit", salvarDeficiencia);
  var btnSugeridas = document.getElementById("btn-cadastrar-sugeridas");
  if (btnSugeridas) btnSugeridas.addEventListener("click", cadastrarDeficienciasSugeridas);
  var btnCancelarDeficiencia = document.getElementById("btn-cancelar-deficiencia");
  if (btnCancelarDeficiencia) btnCancelarDeficiencia.addEventListener("click", cancelarEdicaoDeficiencia);

  // Painel do administrador: matérias
  var formMateria = document.getElementById("form-materia");
  if (formMateria) formMateria.addEventListener("submit", salvarMateria);
  var btnCancelarMateria = document.getElementById("btn-cancelar-materia");
  if (btnCancelarMateria) btnCancelarMateria.addEventListener("click", cancelarEdicaoMateria);
  var selectDeficienciaMaterias = document.getElementById("select-deficiencia-materias");
  if (selectDeficienciaMaterias) selectDeficienciaMaterias.addEventListener("change", renderizarMaterias);
  var filtroPagamentos = document.getElementById("filtro-pagamentos-admin");
  if (filtroPagamentos) filtroPagamentos.addEventListener("change", renderizarPagamentosAdmin);

  // Renderização inicial
  renderizarAulas();
  renderizarMinhasAulas();
  renderizarTransacoes();
  renderizarPendentes();
  renderizarListaAdmin();
  renderizarDeficiencias();
  renderizarMaterias();
  renderizarDenuncias();
  renderizarMinhasSolicitacoes();
  renderizarPagamentosAdmin();
  atualizarResumoAdmin();
});

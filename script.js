// EducaAcessível — script.js
// Acessibilidade, login com Google (Firebase), banco de dados (Firestore),
// painel administrativo, busca e filtro do catálogo.

var AULAS = [];

// Aulas iniciais: usadas para popular o banco na primeira visita do administrador
// e como reserva caso o banco esteja inacessível.
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
  botao.setAttribute("aria-pressed", ativo ? "true" : "false");
}

function alternarFoco(botao) {
  var ativo = document.body.classList.toggle("modo-foco-ativo");
  botao.textContent = ativo ? "Desativar Modo Foco" : "Ativar Modo Foco";
  botao.setAttribute("aria-pressed", ativo ? "true" : "false");
}

function alternarTema() {
  var escuro = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("tema", escuro ? "dark" : "light");
  } catch (erro) {}
}

// ---------- Login com Google (Firebase) ----------
// Configuracao do projeto Firebase "EFA - Education For All" (App Web ja criado).
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyCqxlREb8FG0LjG3KrgjWPg_lSVI6Dzdgk",
  authDomain: "efa-education-for-all.firebaseapp.com",
  projectId: "efa-education-for-all",
  storageBucket: "efa-education-for-all.firebasestorage.app",
  messagingSenderId: "953168018936",
  appId: "1:953168018936:web:13b2bb55e55385bb332a0d",
  measurementId: "G-RQHCZETXCV"
};

var firebasePronto = false;

function iniciarFirebase() {
  var botao = document.getElementById("btn-google");
  if (typeof firebase === "undefined" || !FIREBASE_CONFIG.apiKey) {
    console.error("Firebase nao configurado: preencha FIREBASE_CONFIG no comeco do script.js.");
    if (botao) botao.disabled = true;
    return false;
  }
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  firebase.auth().onAuthStateChanged(mostrarUsuario);
  firebasePronto = true;
  return true;
}

function mensagemDeErro(erro) {
  var codigo = erro && erro.code ? erro.code : "";
  if (codigo === "auth/popup-blocked") {
    return "O pop-up foi bloqueado pelo navegador. Permita pop-ups para este site e tente novamente.";
  }
  if (codigo === "auth/popup-closed-by-user" || codigo === "auth/cancelled-popup-request") {
    return "Login cancelado.";
  }
  if (codigo === "auth/unauthorized-domain") {
    return "Este dominio nao esta autorizado no Firebase. Adicione o endereco do site em Authentication > Settings > Authorized domains.";
  }
  if (codigo === "auth/operation-not-allowed") {
    return "O login com Google nao esta ativado no projeto Firebase (Authentication > Sign-in method).";
  }
  if (codigo === "auth/network-request-failed") {
    return "Problema de conexao. Verifique sua internet e tente novamente.";
  }
  if (codigo === "auth/invalid-api-key" || codigo === "auth/configuration-not-found") {
    return "Configuracao do Firebase incorreta. Confira a apiKey e o appId no script.js.";
  }
  return "Nao foi possivel entrar com o Google. Tente novamente.";
}

function entrarComGoogle() {
  var provedor = new firebase.auth.GoogleAuthProvider();
  provedor.setCustomParameters({ prompt: "select_account" });
  // Em celular/tablet o pop-up costuma ser bloqueado: usa redirecionamento
  var noCelular = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  var tentativa = noCelular
    ? firebase.auth().signInWithRedirect(provedor)
    : firebase.auth().signInWithPopup(provedor);
  return tentativa.catch(function (erro) {
    console.error("Erro no login com Google:", erro);
    if (erro && (erro.code === "auth/popup-blocked" || erro.code === "auth/operation-not-supported-in-this-environment")) {
      return firebase.auth().signInWithRedirect(provedor);
    }
    if (erro && erro.code !== "auth/popup-closed-by-user" && erro.code !== "auth/cancelled-popup-request") {
      alert(mensagemDeErro(erro));
    }
  });
}

function aoClicarBotaoGoogle() {
  if (!firebasePronto) {
    alert("Login indisponivel: configure o FIREBASE_CONFIG no script.js.");
    return;
  }
  var usuario = firebase.auth().currentUser;
  if (usuario) {
    // Trocar conta: encerra a sessao atual e abre o seletor de contas Google
    firebase.auth().signOut().then(entrarComGoogle).catch(function (erro) {
      console.error("Erro ao trocar de conta:", erro);
      alert(mensagemDeErro(erro));
    });
  } else {
    entrarComGoogle();
  }
}

function mostrarUsuario(usuario) {
  var botao = document.getElementById("btn-google");
  var info = document.getElementById("info-usuario");
  var btnSair = document.getElementById("btn-sair");
  if (usuario) {
    var nome = usuario.displayName || usuario.email || "Usuario";
    info.textContent = "Olá, " + nome;
    info.hidden = false;
    botao.textContent = "Trocar conta";
    btnSair.hidden = false;
  } else {
    info.textContent = "";
    info.hidden = true;
    botao.textContent = "Entrar com Google";
    btnSair.hidden = true;
  }
  // O painel administrativo so aparece para administradores
  var ehAdmin = ehAdministrador(usuario);
  var painel = document.getElementById("painel-admin");
  var linkPainel = document.getElementById("link-painel");
  if (painel) painel.hidden = !ehAdmin;
  if (linkPainel) linkPainel.hidden = !ehAdmin;
}

// ---------- Firestore e Painel Administrativo ----------
// Para tornar outro e-mail administrador, adicione-o nesta lista E nas regras do Firestore.
var ADMIN_EMAILS = [
  "efa.eduacation.for.all@gmail.com"
];

var ETIQUETAS = {
  tdah: "TDAH",
  tea: "TEA",
  dislexia: "Dislexia",
  "baixa-visao": "Baixa visão",
  neurotipico: "Neurotípico"
};

var aulaEmEdicao = null; // id da aula em edicao (null = adicionando nova)

function ehAdministrador(usuario) {
  return !!(usuario && usuario.email && ADMIN_EMAILS.indexOf(usuario.email.toLowerCase()) !== -1);
}

// Carrega as aulas do Firestore em tempo real: adicionar, editar ou excluir
// em um dispositivo atualiza o catalogo em todos automaticamente.
function carregarAulas() {
  if (!firebasePronto || typeof firebase.firestore !== "function") {
    console.warn("Banco indisponivel: exibindo aulas iniciais.");
    AULAS = AULAS_INICIAIS;
    renderizarAulas();
    return;
  }
  var banco = firebase.firestore();
  banco.collection("aulas").orderBy("criadoEm", "desc").onSnapshot(function (instantaneo) {
    if (instantaneo.empty) {
      // Primeira visita: o administrador popula o banco com as aulas iniciais
      if (ehAdministrador(firebase.auth().currentUser)) {
        var lote = banco.batch();
        AULAS_INICIAIS.forEach(function (aula) {
          lote.set(banco.collection("aulas").doc(), {
            titulo: aula.titulo,
            descricao: aula.descricao,
            perfil: aula.perfil,
            etiqueta: ETIQUETAS[aula.perfil] || aula.etiqueta,
            youtube: aula.youtube,
            documento: aula.documento,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
          });
        });
        lote.commit().catch(function (erro) {
          console.error("Erro ao popular o banco de dados:", erro);
        });
      }
      AULAS = AULAS_INICIAIS;
      renderizarAulas();
      renderizarListaAdmin();
      return;
    }
    AULAS = [];
    instantaneo.forEach(function (doc) {
      var dados = doc.data();
      AULAS.push({
        id: doc.id,
        titulo: dados.titulo || "",
        descricao: dados.descricao || "",
        perfil: dados.perfil || "neurotipico",
        etiqueta: dados.etiqueta || ETIQUETAS[dados.perfil] || "Neurotípico",
        youtube: dados.youtube || "",
        documento: dados.documento || ""
      });
    });
    renderizarAulas();
    renderizarListaAdmin();
  }, function (erro) {
    console.error("Erro ao carregar aulas do banco de dados:", erro);
    if (!AULAS.length) {
      AULAS = AULAS_INICIAIS;
    }
    renderizarAulas();
  });
}

function mostrarFeedbackAdmin(mensagem) {
  var feedback = document.getElementById("feedback-admin");
  if (feedback) feedback.textContent = mensagem;
}

function iniciarEdicao(aula) {
  aulaEmEdicao = aula.id;
  document.getElementById("campo-titulo").value = aula.titulo;
  document.getElementById("campo-descricao").value = aula.descricao;
  document.getElementById("campo-perfil").value = aula.perfil;
  document.getElementById("campo-youtube").value = aula.youtube;
  document.getElementById("campo-documento").value = aula.documento;
  document.getElementById("btn-salvar-aula").textContent = "💾 Salvar alterações";
  document.getElementById("btn-cancelar-edicao").hidden = false;
  document.getElementById("form-aula").scrollIntoView({ behavior: "smooth" });
  mostrarFeedbackAdmin("Editando: " + aula.titulo);
}

function cancelarEdicao() {
  aulaEmEdicao = null;
  document.getElementById("form-aula").reset();
  document.getElementById("btn-salvar-aula").textContent = "➕ Adicionar aula";
  document.getElementById("btn-cancelar-edicao").hidden = true;
  mostrarFeedbackAdmin("");
}

function salvarAula(evento) {
  evento.preventDefault();
  var dados = {
    titulo: document.getElementById("campo-titulo").value.trim(),
    descricao: document.getElementById("campo-descricao").value.trim(),
    perfil: document.getElementById("campo-perfil").value,
    youtube: document.getElementById("campo-youtube").value.trim(),
    documento: document.getElementById("campo-documento").value.trim()
  };
  if (!dados.titulo || !dados.descricao || !dados.youtube || !dados.documento) return;
  dados.etiqueta = ETIQUETAS[dados.perfil] || "Neurotípico";
  var banco = firebase.firestore();
  var operacao;
  if (aulaEmEdicao) {
    operacao = banco.collection("aulas").doc(aulaEmEdicao).set(dados, { merge: true });
  } else {
    dados.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
    operacao = banco.collection("aulas").add(dados);
  }
  operacao.then(function () {
    mostrarFeedbackAdmin(aulaEmEdicao ? "Aula atualizada com sucesso." : "Aula adicionada com sucesso.");
    cancelarEdicao();
  }).catch(function (erro) {
    console.error("Erro ao salvar aula:", erro);
    mostrarFeedbackAdmin("");
    alert(erro && erro.code === "permission-denied"
      ? "Permissão negada: confira as regras do Firestore e o e-mail administrador."
      : "Não foi possível salvar a aula. Tente novamente.");
  });
}

function excluirAula(aula) {
  var resposta = confirm("Tem certeza que deseja excluir esta aula? (" + aula.titulo + ")");
  if (!resposta) return;
  firebase.firestore().collection("aulas").doc(aula.id).delete().then(function () {
    mostrarFeedbackAdmin("Aula excluída com sucesso.");
  }).catch(function (erro) {
    console.error("Erro ao excluir aula:", erro);
    alert(erro && erro.code === "permission-denied"
      ? "Permissão negada: confira as regras do Firestore e o e-mail administrador."
      : "Não foi possível excluir a aula. Tente novamente.");
  });
}

function renderizarListaAdmin() {
  var lista = document.getElementById("lista-admin");
  var aviso = document.getElementById("admin-vazio");
  if (!lista) return;
  lista.innerHTML = "";
  var termo = normalizar((document.getElementById("busca-admin").value || "").trim());
  var visiveis = AULAS.filter(function (aula) {
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
    etiqueta.textContent = aula.etiqueta;

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
    cabecalho.appendChild(titulo);
    cabecalho.appendChild(etiqueta);
    cabecalho.appendChild(acoes);
    item.appendChild(cabecalho);
    lista.appendChild(item);
  });
  aviso.hidden = visiveis.length !== 0;
}

// ---------- Catalogo ----------
function normalizar(texto) {
  return (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function criarCard(aula) {
  var card = document.createElement("article");
  card.className = "card-aula";

  var titulo = document.createElement("h3");
  titulo.textContent = aula.titulo;

  var etiqueta = document.createElement("span");
  etiqueta.className = "tag-perfil";
  etiqueta.textContent = aula.etiqueta;

  var descricao = document.createElement("p");
  descricao.textContent = aula.descricao;

  var acoes = document.createElement("div");
  acoes.className = "acoes-adicionais";

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
  card.appendChild(titulo);
  card.appendChild(etiqueta);
  card.appendChild(descricao);
  card.appendChild(acoes);
  return card;
}

function renderizarAulas() {
  var termo = normalizar(document.getElementById("campo-busca").value.trim());
  var perfil = document.getElementById("filtro-perfil").value;
  var grid = document.getElementById("grid-aulas");
  var aviso = document.getElementById("sem-resultados");
  grid.innerHTML = "";

  var visiveis = AULAS.filter(function (aula) {
    var texto = normalizar(aula.titulo) + " " + normalizar(aula.descricao);
    var encontrouTexto = !termo || texto.indexOf(termo) !== -1;
    var encontrouPerfil = perfil === "todos" || aula.perfil === perfil;
    return encontrouTexto && encontrouPerfil;
  });

  visiveis.forEach(function (aula) {
    grid.appendChild(criarCard(aula));
  });

  aviso.hidden = visiveis.length !== 0;
}

// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", function () {
  try {
    if (localStorage.getItem("tema") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (erro) {}

  document.getElementById("btn-diminuir").addEventListener("click", function () {
    alterarTamanhoFonte(-2);
  });
  document.getElementById("btn-aumentar").addEventListener("click", function () {
    alterarTamanhoFonte(2);
  });
  document.getElementById("btn-dislexia").addEventListener("click", function () {
    alternarDislexia(this);
  });
  document.getElementById("btn-foco").addEventListener("click", function () {
    alternarFoco(this);
  });
  document.getElementById("btn-tema").addEventListener("click", alternarTema);

  // Login com Google (Firebase)
  if (iniciarFirebase()) {
    firebase.auth().getRedirectResult().catch(function (erro) {
      console.error("Erro no retorno do login:", erro);
    });
  }
  document.getElementById("btn-google").addEventListener("click", aoClicarBotaoGoogle);
  document.getElementById("btn-sair").addEventListener("click", function () {
    if (firebasePronto) {
      firebase.auth().signOut().catch(function (erro) {
        console.error("Erro ao sair:", erro);
      });
    }
  });

  document.getElementById("campo-busca").addEventListener("input", renderizarAulas);
  document.getElementById("filtro-perfil").addEventListener("change", renderizarAulas);

  // Banco de dados (Firestore) e painel administrativo
  carregarAulas();
  document.getElementById("form-aula").addEventListener("submit", salvarAula);
  document.getElementById("btn-cancelar-edicao").addEventListener("click", cancelarEdicao);
  document.getElementById("busca-admin").addEventListener("input", renderizarListaAdmin);

  renderizarAulas();
});

// EducaAcessível — script.js
// Acessibilidade, login com Google (Firebase), banco de dados (Firestore),
// criação de aulas, análise do administrador, EFA Coins, desbloqueio e Premium.

// ---------- Estado geral ----------
var AULAS = [];        // aulas aprovadas (catálogo público)
var TODAS_AULAS = [];  // todas as aulas (uso do administrador)
var MINHAS_AULAS = []; // aulas enviadas pelo usuário logado
var TRANSACOES = [];   // histórico de EFA Coins do usuário logado
var idsDesbloqueadas = {};
var usuarioAtual = null;
var saldoMoedas = 0;
var premiumAtivo = false;
var aulaEmEdicao = null;
var firebasePronto = false;
var ouvintesUsuario = [];

// ---------- Aulas iniciais ----------
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

  botao.setAttribute(
    "aria-pressed",
    ativo ? "true" : "false"
  );
}

function alternarFoco(botao) {
  var ativo = document.body.classList.toggle("modo-foco-ativo");

  botao.textContent = ativo
    ? "Desativar Modo Foco"
    : "Ativar Modo Foco";

  botao.setAttribute(
    "aria-pressed",
    ativo ? "true" : "false"
  );
}

function alternarTema() {
  var escuro = document.documentElement.classList.toggle("dark");

  try {
    localStorage.setItem(
      "tema",
      escuro ? "dark" : "light"
    );
  } catch (erro) {}
}

// ---------- Login com Google ----------
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyCqxlREb8FG0LjG3KrgjWPg_lSVI6Dzdgk",
  authDomain: "efa-education-for-all.firebaseapp.com",
  projectId: "efa-education-for-all",
  storageBucket: "efa-education-for-all.firebasestorage.app",
  messagingSenderId: "953168018936",
  appId: "1:953168018936:web:13b2bb55e55385bb332a0d",
  measurementId: "G-RQHCZETXCV"
};

function iniciarFirebase() {
  var botao = document.getElementById("btn-google");

  if (
    typeof firebase === "undefined" ||
    !FIREBASE_CONFIG.apiKey
  ) {
    console.error(
      "Firebase nao configurado."
    );

    if (botao) {
      botao.disabled = true;
    }

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
  var codigo = erro && erro.code
    ? erro.code
    : "";

  if (codigo === "auth/popup-blocked") {
    return "O pop-up foi bloqueado pelo navegador. Permita pop-ups para este site e tente novamente.";
  }

  if (
    codigo === "auth/popup-closed-by-user" ||
    codigo === "auth/cancelled-popup-request"
  ) {
    return "Login cancelado.";
  }

  if (codigo === "auth/unauthorized-domain") {
    return "Este dominio nao esta autorizado no Firebase. Adicione o endereco do site em Authentication > Settings > Authorized domains.";
  }

  if (codigo === "auth/operation-not-allowed") {
    return "O login com Google nao esta ativado no projeto Firebase.";
  }

  if (codigo === "auth/network-request-failed") {
    return "Problema de conexao. Verifique sua internet e tente novamente.";
  }

  if (
    codigo === "auth/invalid-api-key" ||
    codigo === "auth/configuration-not-found"
  ) {
    return "Configuracao do Firebase incorreta. Confira a apiKey e o appId no script.js.";
  }

  return "Nao foi possivel entrar com o Google. Tente novamente.";
}

function entrarComGoogle() {
  var provedor =
    new firebase.auth.GoogleAuthProvider();

  provedor.setCustomParameters({
    prompt: "select_account"
  });

  var noCelular =
    /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent
    );

  var tentativa = noCelular
    ? firebase.auth().signInWithRedirect(provedor)
    : firebase.auth().signInWithPopup(provedor);

  return tentativa.catch(function (erro) {
    console.error(
      "Erro no login com Google:",
      erro
    );

    if (
      erro &&
      (
        erro.code === "auth/popup-blocked" ||
        erro.code ===
          "auth/operation-not-supported-in-this-environment"
      )
    ) {
      return firebase.auth()
        .signInWithRedirect(provedor);
    }

    if (
      erro &&
      erro.code !==
        "auth/popup-closed-by-user" &&
      erro.code !==
        "auth/cancelled-popup-request"
    ) {
      alert(mensagemDeErro(erro));
    }
  });
}

function aoClicarBotaoGoogle() {
  if (!firebasePronto) {
    alert(
      "Login indisponivel: configure o FIREBASE_CONFIG no script.js."
    );

    return;
  }

  var usuario =
    firebase.auth().currentUser;

  if (usuario) {
    firebase.auth()
      .signOut()
      .then(entrarComGoogle)
      .catch(function (erro) {
        console.error(
          "Erro ao trocar de conta:",
          erro
        );

        alert(
          mensagemDeErro(erro)
        );
      });
  } else {
    entrarComGoogle();
  }
}

function mostrarUsuario(usuario) {
  var botao =
    document.getElementById("btn-google");

  var info =
    document.getElementById("info-usuario");

  var btnSair =
    document.getElementById("btn-sair");

  if (usuario) {
    var nome =
      usuario.displayName ||
      usuario.email ||
      "Usuario";

    info.textContent =
      "Olá, " + nome;

    info.hidden = false;

    botao.textContent =
      "Trocar conta";

    btnSair.hidden = false;
  } else {
    info.textContent = "";
    info.hidden = true;

    botao.textContent =
      "Entrar com Google";

    btnSair.hidden = true;
  }

  configurarSessao(usuario);
}

// ---------- Sessão ----------
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

function ehAdministrador(usuario) {
  return !!(
    usuario &&
    usuario.email &&
    ADMIN_EMAILS.indexOf(
      usuario.email.toLowerCase()
    ) !== -1
  );
}

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatarData(carimbo) {
  if (
    !carimbo ||
    !carimbo.toDate
  ) {
    return "data indisponível";
  }

  try {
    return carimbo
      .toDate()
      .toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }
      );
  } catch (erro) {
    return "data indisponível";
  }
}

function paraAula(doc) {
  var dados = doc.data();

  return {
    id: doc.id,
    titulo: dados.titulo || "",
    descricao: dados.descricao || "",
    perfil:
      dados.perfil || "neurotipico",
    etiqueta:
      dados.etiqueta ||
      ETIQUETAS[dados.perfil] ||
      "Neurotípico",
    youtube: dados.youtube || "",
    documento: dados.documento || "",
    autorId: dados.autorId || "",
    autorNome: dados.autorNome || "",
    status:
      dados.status || "pendente",
    criadoEm:
      dados.criadoEm || null
  };
}

function ordenarPorData(aulas) {
  aulas.sort(function (a, b) {
    var ta =
      a.criadoEm &&
      a.criadoEm.toMillis
        ? a.criadoEm.toMillis()
        : 0;

    var tb =
      b.criadoEm &&
      b.criadoEm.toMillis
        ? b.criadoEm.toMillis()
        : 0;

    return tb - ta;
  });

  return aulas;
}

function encerrarOuvintesUsuario() {
  while (ouvintesUsuario.length) {
    try {
      ouvintesUsuario.pop()();
    } catch (erro) {}
  }
  }
function configurarSessao(usuario) {
  encerrarOuvintesUsuario();

  usuarioAtual = usuario;
  saldoMoedas = 0;
  premiumAtivo = false;
  idsDesbloqueadas = {};
  MINHAS_AULAS = [];
  TRANSACOES = [];
  TODAS_AULAS = [];

  var logado = !!usuario;

  var areaUsuario =
    document.getElementById("area-usuario");

  var linkCriar =
    document.getElementById("link-criar");

  if (areaUsuario) {
    areaUsuario.hidden = !logado;
  }

  if (linkCriar) {
    linkCriar.hidden = !logado;
  }

  var admin =
    ehAdministrador(usuario);

  var painel =
    document.getElementById("painel-admin");

  var linkPainel =
    document.getElementById("link-painel");

  if (painel) {
    painel.hidden = !admin;
  }

  if (linkPainel) {
    linkPainel.hidden = !admin;
  }

  atualizarPainelUsuario();
  renderizarAulas();

  if (
    !logado ||
    !firebasePronto ||
    typeof firebase.firestore !== "function"
  ) {
    return;
  }

  var banco =
    firebase.firestore();

  var refUsuario =
    banco
      .collection("usuarios")
      .doc(usuario.uid);

  ouvintesUsuario.push(
    refUsuario.onSnapshot(
      function (doc) {
        if (!doc.exists) {
          refUsuario.set({
            nome:
              usuario.displayName ||
              usuario.email,

            email:
              usuario.email,

            moedas: 0,

            premium: false,

            premiumAte: null,

            criadoEm:
              firebase.firestore
                .FieldValue
                .serverTimestamp()
          }).catch(function (erro) {
            console.error(
              "Erro ao criar perfil do usuario:",
              erro
            );
          });

          return;
        }

        var dados =
          doc.data();

        saldoMoedas =
          dados.moedas || 0;

        premiumAtivo =
          !!(
            dados.premium &&
            dados.premiumAte &&
            dados.premiumAte.toMillis &&
            dados.premiumAte.toMillis() >
              Date.now()
          );

        atualizarPainelUsuario();
        renderizarAulas();
      },
      function (erro) {
        console.error(
          "Erro ao carregar perfil:",
          erro
        );
      }
    )
  );

  ouvintesUsuario.push(
    banco
      .collection("aulas")
      .where(
        "autorId",
        "==",
        usuario.uid
      )
      .onSnapshot(
        function (instantaneo) {
          MINHAS_AULAS =
            ordenarPorData(
              instantaneo.docs.map(
                paraAula
              )
            );

          renderizarMinhasAulas();
        },
        function (erro) {
          console.error(
            "Erro ao carregar suas aulas:",
            erro
          );
        }
      )
  );

  ouvintesUsuario.push(
    banco
      .collection("transacoes")
      .where(
        "usuarioId",
        "==",
        usuario.uid
      )
      .onSnapshot(
        function (instantaneo) {
          TRANSACOES =
            ordenarPorData(
              instantaneo.docs.map(
                function (doc) {
                  var dados =
                    doc.data();

                  return {
                    tipo:
                      dados.tipo ||
                      "ganho",

                    quantidade:
                      dados.quantidade ||
                      0,

                    motivo:
                      dados.motivo ||
                      "",

                    criadoEm:
                      dados.criadoEm ||
                      null
                  };
                }
              )
            );

          renderizarTransacoes();
        },
        function (erro) {
          console.error(
            "Erro ao carregar transacoes:",
            erro
          );
        }
      )
  );

  ouvintesUsuario.push(
    banco
      .collection("aulasDesbloqueadas")
      .where(
        "usuarioId",
        "==",
        usuario.uid
      )
      .onSnapshot(
        function (instantaneo) {
          idsDesbloqueadas = {};

          instantaneo.forEach(
            function (doc) {
              idsDesbloqueadas[
                doc.data().aulaId
              ] = true;
            }
          );

          renderizarAulas();
        },
        function (erro) {
          console.error(
            "Erro ao carregar aulas desbloqueadas:",
            erro
          );
        }
      )
  );

  if (admin) {
    ouvintesUsuario.push(
      banco
        .collection("aulas")
        .onSnapshot(
          function (instantaneo) {
            TODAS_AULAS =
              ordenarPorData(
                instantaneo.docs.map(
                  paraAula
                )
              );

            renderizarPendentes();
            renderizarListaAdmin();
          },
          function (erro) {
            console.error(
              "Erro ao carregar aulas (admin):",
              erro
            );
          }
        )
    );
  }
}

// ---------- Catálogo ----------
function carregarCatalogo() {
  if (
    !firebasePronto ||
    typeof firebase.firestore !== "function"
  ) {
    AULAS =
      AULAS_INICIAIS.map(
        function (aula) {
          aula.semBloqueio = true;
          return aula;
        }
      );

    renderizarAulas();
    return;
  }

  firebase.firestore()
    .collection("aulas")
    .where(
      "status",
      "==",
      "aprovada"
    )
    .onSnapshot(
      function (instantaneo) {
        AULAS =
          ordenarPorData(
            instantaneo.docs.map(
              paraAula
            )
          );

        renderizarAulas();
      },
      function (erro) {
        console.error(
          "Erro ao carregar o catalogo:",
          erro
        );

        if (!AULAS.length) {
          AULAS =
            AULAS_INICIAIS.map(
              function (aula) {
                aula.semBloqueio = true;
                return aula;
              }
            );
        }

        renderizarAulas();
      }
    );
}

function aulaAcessivel(aula) {
  if (aula.semBloqueio) {
    return true;
  }

  return (
    premiumAtivo ||
    idsDesbloqueadas[aula.id] === true
  );
}

function criarBotaoDesbloquear(aula) {
  var botao =
    document.createElement("button");

  botao.type = "button";

  botao.className =
    "btn-acesso desbloquear";

  botao.textContent =
    "🔓 Desbloquear (🪙 1 Coin)";

  botao.setAttribute(
    "aria-label",
    "Desbloquear aula " +
      aula.titulo +
      " por 1 EFA Coin"
  );

  botao.addEventListener(
    "click",
    function () {
      desbloquearAula(aula);
    }
  );

  return botao;
}

function criarCard(aula) {
  var card =
    document.createElement("article");

  card.className =
    "card-aula";

  var titulo =
    document.createElement("h3");

  titulo.textContent =
    aula.titulo;

  var etiqueta =
    document.createElement("span");

  etiqueta.className =
    "tag-perfil";

  etiqueta.textContent =
    aula.etiqueta;

  var descricao =
    document.createElement("p");

  descricao.textContent =
    aula.descricao;

  var acoes =
    document.createElement("div");

  acoes.className =
    "acoes-adicionais";

  if (aulaAcessivel(aula)) {
    var linkVideo =
      document.createElement("a");

    linkVideo.className =
      "btn-acesso";

    linkVideo.href =
      aula.youtube;

    linkVideo.target =
      "_blank";

    linkVideo.rel =
      "noopener noreferrer";

    linkVideo.textContent =
      "🎥 Assistir aula";

    var linkDoc =
      document.createElement("a");

    linkDoc.className =
      "btn-acesso desbloquear";

    linkDoc.href =
      aula.documento;

    linkDoc.target =
      "_blank";

    linkDoc.rel =
      "noopener noreferrer";

    linkDoc.textContent =
      "📄 Material adaptado";

    acoes.appendChild(
      linkVideo
    );

    acoes.appendChild(
      linkDoc
    );
  } else {
    acoes.appendChild(
      criarBotaoDesbloquear(aula)
    );
  }

  card.appendChild(titulo);
  card.appendChild(etiqueta);
  card.appendChild(descricao);
  card.appendChild(acoes);

  return card;
}

function renderizarAulas() {
  var campoBusca =
    document.getElementById(
      "campo-busca"
    );

  var filtroPerfil =
    document.getElementById(
      "filtro-perfil"
    );

  var grid =
    document.getElementById(
      "grid-aulas"
    );

  var aviso =
    document.getElementById(
      "sem-resultados"
    );

  if (!campoBusca || !filtroPerfil || !grid) {
    return;
  }

  var termo =
    normalizar(
      (campoBusca.value || "").trim()
    );

  var perfil =
    filtroPerfil.value;

  grid.innerHTML = "";

  var visiveis =
    AULAS.filter(
      function (aula) {
        var texto =
          normalizar(aula.titulo) +
          " " +
          normalizar(aula.descricao);

        var encontrouTexto =
          !termo ||
          texto.indexOf(termo) !== -1;

        var encontrouPerfil =
          perfil === "todos" ||
          aula.perfil === perfil;

        return (
          encontrouTexto &&
          encontrouPerfil
        );
      }
    );

  visiveis.forEach(
    function (aula) {
      grid.appendChild(
        criarCard(aula)
      );
    }
  );

  if (aviso) {
    aviso.hidden =
      visiveis.length !== 0;
  }
}

// ---------- Desbloqueio ----------
function desbloquearAula(aula) {
  if (!usuarioAtual) {
    alert(
      "Entre com o Google para desbloquear aulas."
    );

    return;
  }

  if (
    premiumAtivo ||
    idsDesbloqueadas[aula.id]
  ) {
    return;
  }

  if (saldoMoedas < 1) {
    alert(
      "Você precisa de 1 EFA Coin para desbloquear esta aula. Envie uma aula e, quando ela for aprovada, você recebe 🪙 1 Coin."
    );

    return;
  }

  var banco =
    firebase.firestore();

  var lote =
    banco.batch();

  lote.update(
    banco
      .collection("usuarios")
      .doc(usuarioAtual.uid),
    {
      moedas:
        firebase.firestore
          .FieldValue
          .increment(-1)
    }
  );

  lote.set(
    banco
      .collection("transacoes")
      .doc(),
    {
      usuarioId:
        usuarioAtual.uid,

      tipo: "gasto",

      quantidade: 1,

      motivo:
        "Desbloqueio da aula: " +
        aula.titulo,

      aulaId:
        aula.id,

      criadoEm:
        firebase.firestore
          .FieldValue
          .serverTimestamp()
    }
  );

  lote.set(
    banco
      .collection("aulasDesbloqueadas")
      .doc(),
    {
      usuarioId:
        usuarioAtual.uid,

      aulaId:
        aula.id,

      desbloqueadoEm:
        firebase.firestore
          .FieldValue
          .serverTimestamp()
    }
  );

  lote.commit()
    .then(function () {
      alert(
        "✅ Aula desbloqueada! Bom estudo."
      );
    })
    .catch(function (erro) {
      console.error(
        "Erro ao desbloquear aula:",
        erro
      );

      alert(
        erro &&
        erro.code ===
          "permission-denied"
          ? "Permissão negada: confira as regras do Firestore."
          : "Não foi possível desbloquear a aula. Tente novamente."
      );
    });
}

// ---------- Criar aula ----------
function enviarAulaAnalise(evento) {
  evento.preventDefault();

  if (!usuarioAtual) {
    alert(
      "Entre com o Google para enviar aulas."
    );

    return;
  }

  var dados = {
    titulo:
      document.getElementById(
        "campo-criar-titulo"
      ).value.trim(),

    descricao:
      document.getElementById(
        "campo-criar-descricao"
      ).value.trim(),

    perfil:
      document.getElementById(
        "campo-criar-perfil"
      ).value,

    youtube:
      document.getElementById(
        "campo-criar-youtube"
      ).value.trim(),

    documento:
      document.getElementById(
        "campo-criar-documento"
      ).value.trim()
  };

  if (
    !dados.titulo ||
    !dados.descricao ||
    !dados.youtube ||
    !dados.documento
  ) {
    return;
  }

  dados.etiqueta =
    ETIQUETAS[dados.perfil] ||
    "Neurotípico";

  dados.autorId =
    usuarioAtual.uid;

  dados.autorNome =
    usuarioAtual.displayName ||
    usuarioAtual.email;

  dados.status =
    "pendente";

  dados.criadoEm =
    firebase.firestore
      .FieldValue
      .serverTimestamp();

  firebase.firestore()
    .collection("aulas")
    .add(dados)
    .then(function () {
      document.getElementById(
        "feedback-criar"
      ).textContent =
        "✅ Aula enviada para análise! Você receberá 🪙 1 EFA Coin quando ela for aprovada.";

      document.getElementById(
        "form-criar-aula"
      ).reset();
    })
    .catch(function (erro) {
      console.error(
        "Erro ao enviar aula:",
        erro
      );

      alert(
        "Não foi possível enviar a aula. Tente novamente."
      );
    });
    }// ---------- Área do usuário ----------

function atualizarPainelUsuario() {
  var moedas =
    document.getElementById("saldo-moedas");

  if (moedas) {
    moedas.textContent =
      saldoMoedas + " 🪙 EFA Coins";
  }

  var premium =
    document.getElementById("status-premium");

  if (premium) {
    premium.textContent =
      premiumAtivo
        ? "⭐ Premium ativo"
        : "Premium não ativo";
  }
}

function renderizarMinhasAulas() {
  var lista =
    document.getElementById(
      "lista-minhas-aulas"
    );

  if (!lista) return;

  lista.innerHTML = "";

  if (!usuarioAtual) {
    return;
  }

  if (!MINHAS_AULAS.length) {
    var vazio =
      document.createElement("p");

    vazio.textContent =
      "Você ainda não enviou nenhuma aula.";

    lista.appendChild(vazio);

    return;
  }

  MINHAS_AULAS.forEach(
    function (aula) {
      var item =
        document.createElement("article");

      item.className =
        "item-minha-aula";

      var titulo =
        document.createElement("h3");

      titulo.textContent =
        aula.titulo;

      var status =
        document.createElement("span");

      status.className =
        "status-aula " +
        aula.status;

      if (aula.status === "aprovada") {
        status.textContent =
          "✅ Aprovada";
      } else if (
        aula.status === "recusada"
      ) {
        status.textContent =
          "❌ Recusada";
      } else {
        status.textContent =
          "⏳ Em análise";
      }

      item.appendChild(titulo);
      item.appendChild(status);

      lista.appendChild(item);
    }
  );
}

function renderizarTransacoes() {
  var lista =
    document.getElementById(
      "lista-transacoes"
    );

  if (!lista) return;

  lista.innerHTML = "";

  if (!TRANSACOES.length) {
    var vazio =
      document.createElement("p");

    vazio.textContent =
      "Nenhuma movimentação de Coins ainda.";

    lista.appendChild(vazio);

    return;
  }

  TRANSACOES.forEach(
    function (transacao) {
      var item =
        document.createElement("li");

      var sinal =
        transacao.tipo === "gasto"
          ? "-"
          : "+";

      item.textContent =
        sinal +
        transacao.quantidade +
        " 🪙 " +
        (transacao.motivo || "");

      lista.appendChild(item);
    }
  );
}

// ---------- Administração ----------

function renderizarPendentes() {
  var lista =
    document.getElementById(
      "lista-aulas-pendentes"
    );

  if (!lista) return;

  lista.innerHTML = "";

  var pendentes =
    TODAS_AULAS.filter(
      function (aula) {
        return aula.status === "pendente";
      }
    );

  if (!pendentes.length) {
    var vazio =
      document.createElement("p");

    vazio.textContent =
      "Nenhuma aula aguardando análise.";

    lista.appendChild(vazio);

    return;
  }

  pendentes.forEach(
    function (aula) {
      var item =
        document.createElement("article");

      item.className =
        "item-pendente";

      var titulo =
        document.createElement("h3");

      titulo.textContent =
        aula.titulo;

      var descricao =
        document.createElement("p");

      descricao.textContent =
        aula.descricao;

      var autor =
        document.createElement("p");

      autor.textContent =
        "Autor: " +
        (aula.autorNome || "Não informado");

      var botoes =
        document.createElement("div");

      botoes.className =
        "acoes-admin";

      var aprovar =
        document.createElement("button");

      aprovar.type = "button";

      aprovar.textContent =
        "✅ Aprovar";

      aprovar.addEventListener(
        "click",
        function () {
          aprovarAula(aula);
        }
      );

      var recusar =
        document.createElement("button");

      recusar.type = "button";

      recusar.textContent =
        "❌ Recusar";

      recusar.addEventListener(
        "click",
        function () {
          recusarAula(aula);
        }
      );

      botoes.appendChild(aprovar);
      botoes.appendChild(recusar);

      item.appendChild(titulo);
      item.appendChild(descricao);
      item.appendChild(autor);
      item.appendChild(botoes);

      lista.appendChild(item);
    }
  );
}

function renderizarListaAdmin() {
  var lista =
    document.getElementById(
      "lista-todas-aulas"
    );

  if (!lista) return;

  lista.innerHTML = "";

  TODAS_AULAS.forEach(
    function (aula) {
      var item =
        document.createElement("li");

      item.textContent =
        aula.titulo +
        " | " +
        aula.status;

      lista.appendChild(item);
    }
  );
}

// ---------- Aprovação ----------

function aprovarAula(aula) {
  if (
    !confirm(
      'Aprovar a aula "' +
      aula.titulo +
      '"? O autor receberá 🪙 1 EFA Coin.'
    )
  ) {
    return;
  }

  var banco =
    firebase.firestore();

  var lote =
    banco.batch();

  lote.update(
    banco
      .collection("aulas")
      .doc(aula.id),
    {
      status: "aprovada"
    }
  );

  if (aula.autorId) {
    lote.update(
      banco
        .collection("usuarios")
        .doc(aula.autorId),
      {
        moedas:
          firebase.firestore
            .FieldValue
            .increment(1)
      }
    );

    lote.set(
      banco
        .collection("transacoes")
        .doc(),
      {
        usuarioId:
          aula.autorId,

        tipo: "ganho",

        quantidade: 1,

        motivo:
          "Aula aprovada: " +
          aula.titulo,

        aulaId:
          aula.id,

        criadoEm:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      }
    );
  }

  lote.commit()
    .then(function () {
      alert(
        "✅ Aula aprovada e publicada no catálogo! O autor recebeu 🪙 1 EFA Coin."
      );
    })
    .catch(function (erro) {
      console.error(
        "Erro ao aprovar aula:",
        erro
      );

      alert(
        "Não foi possível aprovar a aula. Tente novamente."
      );
    });
}

function recusarAula(aula) {
  if (
    !confirm(
      'Recusar a aula "' +
      aula.titulo +
      '"? Ela não aparecerá no catálogo e o autor não receberá Coins.'
    )
  ) {
    return;
  }

  firebase.firestore()
    .collection("aulas")
    .doc(aula.id)
    .update({
      status: "recusada"
    })
    .then(function () {
      alert(
        "❌ Aula recusada."
      );
    })
    .catch(function (erro) {
      console.error(
        "Erro ao recusar aula:",
        erro
      );

      alert(
        "Não foi possível recusar a aula. Tente novamente."
      );
    });
}

// ---------- Criar aula pelo administrador ----------

function criarAulaAdmin(evento) {
  evento.preventDefault();

  if (
    !usuarioAtual ||
    !ehAdministrador(usuarioAtual)
  ) {
    alert(
      "Apenas o administrador pode usar esta função."
    );

    return;
  }

  var titulo =
    document.getElementById(
      "admin-titulo"
    ).value.trim();

  var descricao =
    document.getElementById(
      "admin-descricao"
    ).value.trim();

  var perfil =
    document.getElementById(
      "admin-perfil"
    ).value;

  var youtube =
    document.getElementById(
      "admin-youtube"
    ).value.trim();

  var documento =
    document.getElementById(
      "admin-documento"
    ).value.trim();

  if (
    !titulo ||
    !descricao ||
    !youtube ||
    !documento
  ) {
    alert(
      "Preencha todos os campos."
    );

    return;
  }

  firebase.firestore()
    .collection("aulas")
    .add({
      titulo: titulo,
      descricao: descricao,
      perfil: perfil,
      etiqueta:
        ETIQUETAS[perfil] ||
        "Neurotípico",
      youtube: youtube,
      documento: documento,
      autorId:
        usuarioAtual.uid,
      autorNome:
        usuarioAtual.displayName ||
        usuarioAtual.email,
      status: "aprovada",
      criadoEm:
        firebase.firestore
          .FieldValue
          .serverTimestamp()
    })
    .then(function () {
      alert(
        "✅ Aula criada e publicada."
      );

      var formulario =
        document.getElementById(
          "form-admin-aula"
        );

      if (formulario) {
        formulario.reset();
      }
    })
    .catch(function (erro) {
      console.error(
        "Erro ao criar aula:",
        erro
      );

      alert(
        "Não foi possível criar a aula."
      );
    });
}

// ---------- Filtros ----------

function configurarFiltros() {
  var busca =
    document.getElementById(
      "campo-busca"
    );

  var filtro =
    document.getElementById(
      "filtro-perfil"
    );

  if (busca) {
    busca.addEventListener(
      "input",
      renderizarAulas
    );
  }

  if (filtro) {
    filtro.addEventListener(
      "change",
      renderizarAulas
    );
  }
}

// ---------- Formulários ----------

function configurarFormularios() {
  var formulario =
    document.getElementById(
      "form-criar-aula"
    );

  if (formulario) {
    formulario.addEventListener(
      "submit",
      enviarAulaAnalise
    );
  }

  var formularioAdmin =
    document.getElementById(
      "form-admin-aula"
    );

  if (formularioAdmin) {
    formularioAdmin.addEventListener(
      "submit",
      criarAulaAdmin
    );
  }
}

// ---------- Botões ----------

function configurarBotoes() {
  var google =
    document.getElementById(
      "btn-google"
    );

  if (google) {
    google.addEventListener(
      "click",
      aoClicarBotaoGoogle
    );
  }

  var sair =
    document.getElementById(
      "btn-sair"
    );

  if (sair) {
    sair.addEventListener(
      "click",
      function () {
        firebase.auth()
          .signOut()
          .catch(function (erro) {
            console.error(
              "Erro ao sair:",
              erro
            );
          });
      }
    );
  }

  var aumentar =
    document.getElementById(
      "aumentar-fonte"
    );

  if (aumentar) {
    aumentar.addEventListener(
      "click",
      function () {
        alterarTamanhoFonte(1);
      }
    );
  }

  var diminuir =
    document.getElementById(
      "diminuir-fonte"
    );

  if (diminuir) {
    diminuir.addEventListener(
      "click",
      function () {
        alterarTamanhoFonte(-1);
      }
    );
  }

  var tema =
    document.getElementById(
      "btn-tema"
    );

  if (tema) {
    tema.addEventListener(
      "click",
      alternarTema
    );
  }

  var dislexia =
    document.getElementById(
      "btn-dislexia"
    );

  if (dislexia) {
    dislexia.addEventListener(
      "click",
      function () {
        alternarDislexia(dislexia);
      }
    );
  }

  var foco =
    document.getElementById(
      "btn-foco"
    );

  if (foco) {
    foco.addEventListener(
      "click",
      function () {
        alternarFoco(foco);
      }
    );
  }
}

// ---------- Inicialização ----------

document.addEventListener(
  "DOMContentLoaded",
  function () {
    try {
      var temaSalvo =
        localStorage.getItem(
          "tema"
        );

      if (temaSalvo === "dark") {
        document.documentElement
          .classList.add("dark");
      }
    } catch (erro) {}

    configurarBotoes();
    configurarFiltros();
    configurarFormularios();

    iniciarFirebase();
    carregarCatalogo();
  }
);

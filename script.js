// ============================================================
// EFA - Education For All
// script.js
// ============================================================

// ---------- Estado geral ----------

var AULAS = [];
var TODAS_AULAS = [];
var MINHAS_AULAS = [];
var TRANSACOES = [];
var idsDesbloqueadas = {};

var usuarioAtual = null;
var saldoMoedas = 0;
var premiumAtivo = false;
var aulaEmEdicao = null;
var firebasePronto = false;
var ouvintesUsuario = [];


// ============================================================
// AULAS INICIAIS
// ============================================================

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


// ============================================================
// ACESSIBILIDADE
// ============================================================

var tamanhoFonte = 16;

function alterarTamanhoFonte(delta) {
  var novo = tamanhoFonte + delta;

  if (novo < 12 || novo > 24) {
    return;
  }

  tamanhoFonte = novo;
  document.documentElement.style.fontSize = tamanhoFonte + "px";
}

function alternarDislexia(botao) {
  var ativo = document.body.classList.toggle("fonte-dislexia");

  if (botao) {
    botao.setAttribute(
      "aria-pressed",
      ativo ? "true" : "false"
    );
  }
}

function alternarFoco(botao) {
  var ativo = document.body.classList.toggle("modo-foco-ativo");

  if (botao) {
    botao.textContent = ativo
      ? "Desativar Modo Foco"
      : "Ativar Modo Foco";

    botao.setAttribute(
      "aria-pressed",
      ativo ? "true" : "false"
    );
  }
}

function alternarTema() {
  var escuro =
    document.documentElement.classList.toggle("dark");

  try {
    localStorage.setItem(
      "tema",
      escuro ? "dark" : "light"
    );
  } catch (erro) {
    console.warn("Não foi possível salvar o tema.", erro);
  }
}


// ============================================================
// FIREBASE
// ============================================================

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
      "Firebase não está disponível ou não foi configurado."
    );

    if (botao) {
      botao.disabled = true;
    }

    return false;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    firebase.auth().onAuthStateChanged(mostrarUsuario);

    firebasePronto = true;

    return true;

  } catch (erro) {
    console.error(
      "Erro ao inicializar Firebase:",
      erro
    );

    return false;
  }
}


// ============================================================
// ERROS DO LOGIN
// ============================================================

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
    return "Este domínio não está autorizado no Firebase. Adicione o endereço do site em Authentication > Settings > Authorized domains.";
  }

  if (codigo === "auth/operation-not-allowed") {
    return "O login com Google não está ativado no Firebase. Vá em Authentication > Sign-in method e ative Google.";
  }

  if (codigo === "auth/network-request-failed") {
    return "Problema de conexão. Verifique sua internet.";
  }

  if (
    codigo === "auth/invalid-api-key" ||
    codigo === "auth/configuration-not-found"
  ) {
    return "A configuração do Firebase está incorreta.";
  }

  if (codigo === "auth/internal-error") {
    return "O Firebase apresentou um erro interno. Tente novamente.";
  }

  return "Não foi possível entrar com o Google.";
}


// ============================================================
// LOGIN GOOGLE
// ============================================================

function entrarComGoogle() {
  if (!firebasePronto) {
    alert(
      "O Firebase ainda não está pronto."
    );
    return Promise.reject(
      new Error("Firebase não inicializado.")
    );
  }

  var provedor =
    new firebase.auth.GoogleAuthProvider();

  provedor.setCustomParameters({
    prompt: "select_account"
  });

  var noCelular =
    /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent
    );

  var tentativa;

  if (noCelular) {
    tentativa =
      firebase.auth().signInWithRedirect(provedor);
  } else {
    tentativa =
      firebase.auth().signInWithPopup(provedor);
  }

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

    return null;
  });
}

function aoClicarBotaoGoogle() {
  if (!firebasePronto) {
    alert(
      "Login indisponível: o Firebase não foi inicializado."
    );
    return;
  }

  var usuario =
    firebase.auth().currentUser;

  if (usuario) {

    firebase.auth()
      .signOut()
      .then(function () {
        return entrarComGoogle();
      })
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


// ============================================================
// MOSTRAR USUÁRIO
// ============================================================

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
      "Usuário";

    if (info) {
      info.textContent =
        "Olá, " + nome;

      info.hidden = false;
    }

    if (botao) {
      botao.textContent =
        "Trocar conta";
    }

    if (btnSair) {
      btnSair.hidden = false;
    }

  } else {

    if (info) {
      info.textContent = "";
      info.hidden = true;
    }

    if (botao) {
      botao.textContent =
        "Entrar com Google";
    }

    if (btnSair) {
      btnSair.hidden = true;
    }
  }

  configurarSessao(usuario);
}


// ============================================================
// ADMINISTRADOR
// ============================================================

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
  if (
    !usuario ||
    !usuario.email
  ) {
    return false;
  }

  return (
    ADMIN_EMAILS.indexOf(
      usuario.email.toLowerCase()
    ) !== -1
  );
}


// ============================================================
// UTILITÁRIOS
// ============================================================

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
    status: dados.status || "pendente",
    criadoEm: dados.criadoEm || null
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
  while (
    ouvintesUsuario.length
  ) {
    try {
      ouvintesUsuario.pop()();
    } catch (erro) {
      console.warn(
        "Erro ao encerrar listener:",
        erro
      );
    }
  }
}


// ============================================================
// SESSÃO DO USUÁRIO
// ============================================================

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
    document.getElementById(
      "area-usuario"
    );

  var linkCriar =
    document.getElementById(
      "link-criar"
    );

  if (areaUsuario) {
    areaUsuario.hidden = !logado;
  }

  if (linkCriar) {
    linkCriar.hidden = !logado;
  }

  var admin =
    ehAdministrador(usuario);

  var painel =
    document.getElementById(
      "painel-admin"
    );

  var linkPainel =
    document.getElementById(
      "link-painel"
    );

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
    typeof firebase.firestore !==
    "function"
  ) {
    return;
  }

  var banco =
    firebase.firestore();


  // ----------------------------------------------------------
  // PERFIL
  // ----------------------------------------------------------

  var refUsuario =
    banco
      .collection("usuarios")
      .doc(usuario.uid);

  var listenerPerfil =
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
              "Erro ao criar perfil:",
              erro
            );
          });

          return;
        }

        var dados =
          doc.data();

        saldoMoedas =
          Number(dados.moedas || 0);

        premiumAtivo =
          !!(
            dados.premium &&
            dados.premiumAte &&
            dados.premiumAte.toMillis &&
            dados.premiumAte.toMillis()
              > Date.now()
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
    );

  ouvintesUsuario.push(
    listenerPerfil
  );


  // ----------------------------------------------------------
  // MINHAS AULAS
  // ----------------------------------------------------------

  var listenerMinhasAulas =
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
      );

  ouvintesUsuario.push(
    listenerMinhasAulas
  );


  // ----------------------------------------------------------
  // TRANSAÇÕES
  // ----------------------------------------------------------

  var listenerTransacoes =
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
            "Erro ao carregar transações:",
            erro
          );
        }
      );

  ouvintesUsuario.push(
    listenerTransacoes
  );


  // ----------------------------------------------------------
  // AULAS DESBLOQUEADAS
  // ----------------------------------------------------------

  var listenerDesbloqueadas =
    banco
      .collection(
        "aulasDesbloqueadas"
      )
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

              var dados =
                doc.data();

              if (dados.aulaId) {
                idsDesbloqueadas[
                  dados.aulaId
                ] = true;
              }
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
      );

  ouvintesUsuario.push(
    listenerDesbloqueadas
  );


  // ----------------------------------------------------------
  // ADMINISTRADOR
  // ----------------------------------------------------------

  if (admin) {

    var listenerAdmin =
      banco
        .collection("aulas")
        .onSnapshot(
          function (instantaneo) {

            console.log(
              "Aulas encontradas pelo administrador:",
              instantaneo.size
            );

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
              "ERRO AO CARREGAR AULAS DO ADMIN:",
              erro
            );

            var lista =
              document.getElementById(
                "lista-pendentes"
              );

            var aviso =
              document.getElementById(
                "pendentes-vazio"
              );

            if (lista) {

              lista.innerHTML = "";

              var item =
                document.createElement(
                  "li"
                );

              item.className =
                "item-admin";

              item.textContent =
                "Erro ao carregar as aulas pendentes. Verifique as regras do Firestore e a conta administradora.";

              lista.appendChild(
                item
              );
            }

            if (aviso) {
              aviso.hidden = true;
            }
          }
        );

    ouvintesUsuario.push(
      listenerAdmin
    );
  }
}


// ============================================================
// CATÁLOGO
// ============================================================

function carregarCatalogo() {

  if (
    !firebasePronto ||
    typeof firebase.firestore !==
    "function"
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
          "Erro ao carregar catálogo:",
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


// ============================================================
// ACESSO À AULA
// ============================================================

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
    document.createElement(
      "button"
    );

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


// ============================================================
// CARD DA AULA
// ============================================================

function criarCard(aula) {

  var card =
    document.createElement(
      "article"
    );

  card.className =
    "card-aula";

  var titulo =
    document.createElement(
      "h3"
    );

  titulo.textContent =
    aula.titulo;

  var etiqueta =
    document.createElement(
      "span"
    );

  etiqueta.className =
    "tag-perfil";

  etiqueta.textContent =
    aula.etiqueta;

  var descricao =
    document.createElement(
      "p"
    );

  descricao.textContent =
    aula.descricao;

  var acoes =
    document.createElement(
      "div"
    );

  acoes.className =
    "acoes-adicionais";


  if (aulaAcessivel(aula)) {

    var linkVideo =
      document.createElement(
        "a"
      );

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
      document.createElement(
        "a"
      );

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
      criarBotaoDesbloquear(
        aula
      )
    );
  }


  card.appendChild(titulo);
  card.appendChild(etiqueta);
  card.appendChild(descricao);
  card.appendChild(acoes);

  return card;
}


// ============================================================
// RENDERIZAR CATÁLOGO
// ============================================================

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

  if (
    !grid ||
    !campoBusca ||
    !filtroPerfil
  ) {
    return;
  }

  var termo =
    normalizar(
      campoBusca.value.trim()
    );

  var perfil =
    filtroPerfil.value;

  grid.innerHTML = "";

  var visiveis =
    AULAS.filter(
      function (aula) {

        var texto =
          normalizar(
            aula.titulo
          ) +
          " " +
          normalizar(
            aula.descricao
          );

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


// ============================================================
// DESBLOQUEAR AULA
// ============================================================

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
      .collection(
        "aulasDesbloqueadas"
      )
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

      if (
        erro &&
        erro.code ===
        "permission-denied"
      ) {

        alert(
          "Permissão negada pelo Firestore. Confira as regras do Firestore."
        );

      } else {

        alert(
          "Não foi possível desbloquear a aula. Tente novamente."
        );
      }
    });
}


// ============================================================
// ENVIAR AULA PARA ANÁLISE
// ============================================================

function enviarAulaAnalise(evento) {

  evento.preventDefault();

  if (!usuarioAtual) {

    alert(
      "Entre com o Google para enviar aulas."
    );

    return;
  }

  if (
    !firebasePronto ||
    typeof firebase.firestore !==
    "function"
  ) {

    alert(
      "O Firebase não está disponível."
    );

    return;
  }


  var titulo =
    document.getElementById(
      "campo-criar-titulo"
    );

  var descricao =
    document.getElementById(
      "campo-criar-descricao"
    );

  var perfil =
    document.getElementById(
      "campo-criar-perfil"
    );

  var youtube =
    document.getElementById(
      "campo-criar-youtube"
    );

  var documento =
    document.getElementById(
      "campo-criar-documento"
    );


  if (
    !titulo ||
    !descricao ||
    !perfil ||
    !youtube ||
    !documento
  ) {

    alert(
      "Não foi possível localizar os campos do formulário."
    );

    return;
  }


  var dados = {

    titulo:
      titulo.value.trim(),

    descricao:
      descricao.value.trim(),

    perfil:
      perfil.value,

    youtube:
      youtube.value.trim(),

    documento:
      documento.value.trim(),

    etiqueta:
      ETIQUETAS[perfil.value] ||
      "Neurotípico",

    autorId:
      usuarioAtual.uid,

    autorNome:
      usuarioAtual.displayName ||
      usuarioAtual.email,

    status:
      "pendente",

    criadoEm:
      firebase.firestore
        .FieldValue
        .serverTimestamp()
  };


  if (
    !dados.titulo ||
    !dados.descricao ||
    !dados.youtube ||
    !dados.documento
  ) {

    alert(
      "Preencha todos os campos da aula."
    );

    return;
  }


  var botaoEnviar =
    evento.submitter;

  if (botaoEnviar) {
    botaoEnviar.disabled = true;
  }


  firebase.firestore()
    .collection("aulas")
    .add(dados)
    .then(function () {

      var feedback =
        document.getElementById(
          "feedback-criar"
        );

      if (feedback) {

        feedback.textContent =
          "✅ Aula enviada para análise! Você receberá 🪙 1 EFA Coin quando ela for aprovada.";
      }

      var formulario =
        document.getElementById(
          "form-criar-aula"
        );

      if (formulario) {
        formulario.reset();
      }

    })
    .catch(function (erro) {

      console.error(
        "Erro ao enviar aula:",
        erro
      );

      if (
        erro &&
        erro.code ===
        "permission-denied"
      ) {

        alert(
          "Permissão negada pelo Firestore. Confira as regras de segurança."
        );

      } else if (
        erro &&
        erro.message
      ) {

        alert(
          "Não foi possível enviar a aula.\n\nDetalhe: " +
          erro.message
        );

      } else {

        alert(
          "Não foi possível enviar a aula. Tente novamente."
        );
      }

    })
    .finally(function () {

      if (botaoEnviar) {
        botaoEnviar.disabled = false;
      }
    });
}


// ============================================================
// STATUS
// ============================================================

function criarBadgeStatus(status) {

  var badge =
    document.createElement(
      "span"
    );

  var texto =
    status === "aprovada"
      ? "✅ Aprovada"
      : status === "recusada"
        ? "❌ Recusada"
        : "⏳ Pendente";

  badge.className =
    "status-badge " +
    status;

  badge.textContent =
    texto;

  return badge;
}


// ============================================================
// MINHAS AULAS
// ============================================================

function renderizarMinhasAulas() {

  var lista =
    document.getElementById(
      "lista-minhas"
    );

  var aviso =
    document.getElementById(
      "minhas-vazio"
    );

  if (!lista) {
    return;
  }

  lista.innerHTML = "";

  MINHAS_AULAS.forEach(
    function (aula) {

      var item =
        document.createElement(
          "li"
        );

      item.className =
        "item-admin";


      var cabecalho =
        document.createElement(
          "div"
        );

      cabecalho.className =
        "item-admin-cabecalho";


      var titulo =
        document.createElement(
          "strong"
        );

      titulo.textContent =
        aula.titulo;


      var etiqueta =
        document.createElement(
          "span"
        );

      etiqueta.className =
        "tag-perfil";

      etiqueta.textContent =
        aula.etiqueta;


      cabecalho.appendChild(
        titulo
      );

      cabecalho.appendChild(
        etiqueta
      );

      cabecalho.appendChild(
        criarBadgeStatus(
          aula.status
        )
      );


      item.appendChild(
        cabecalho
      );

      lista.appendChild(
        item
      );
    }
  );

  if (aviso) {
    aviso.hidden =
      MINHAS_AULAS.length !== 0;
  }
}


// ============================================================
// TRANSAÇÕES
// ============================================================

function renderizarTransacoes() {

  var lista =
    document.getElementById(
      "lista-transacoes"
    );

  var aviso =
    document.getElementById(
      "transacoes-vazio"
    );

  if (!lista) {
    return;
  }

  lista.innerHTML = "";

  TRANSACOES.forEach(
    function (transacao) {

      var item =
        document.createElement(
          "li"
        );

      item.className =
        "item-transacao";

      var sinal =
        transacao.tipo === "ganho"
          ? "+"
          : "-";

      item.textContent =
        "🪙 " +
        sinal +
        transacao.quantidade +
        " · " +
        transacao.motivo +
        " · " +
        formatarData(
          transacao.criadoEm
        );

      lista.appendChild(
        item
      );
    }
  );

  if (aviso) {
    aviso.hidden =
      TRANSACOES.length !== 0;
  }
}


// ============================================================
// PAINEL DO USUÁRIO
// ============================================================

function atualizarPainelUsuario() {

  var badge =
    document.getElementById(
      "badge-moedas"
    );

  var saldo =
    document.getElementById(
      "saldo-usuario"
    );

  var statusPremium =
    document.getElementById(
      "status-premium"
    );


  if (badge) {

    badge.textContent =
      "🪙 " +
      saldoMoedas;

    badge.hidden =
      !usuarioAtual;
  }


  if (saldo) {

    saldo.textContent =
      "Seu saldo: 🪙 " +
      saldoMoedas +
      " EFA Coin" +
      (
        saldoMoedas === 1
          ? ""
          : "s"
      );
  }


  if (statusPremium) {

    statusPremium.textContent =
      premiumAtivo
        ? "⭐ Premium ativo. Todas as aulas liberadas, sem gastar Coins."
        : "Plano gratuito: desbloqueie aulas com 🪙 1 Coin cada.";
  }
}


// ============================================================
// PAINEL ADMINISTRATIVO
// ============================================================

function renderizarPendentes() {

  var lista =
    document.getElementById(
      "lista-pendentes"
    );

  var aviso =
    document.getElementById(
      "pendentes-vazio"
    );

  if (!lista) {
    return;
  }

  lista.innerHTML = "";

  var pendentes =
    TODAS_AULAS.filter(
      function (aula) {
        return aula.status ===
          "pendente";
      }
    );


  pendentes.forEach(
    function (aula) {

      var item =
        document.createElement(
          "li"
        );

      item.className =
        "item-admin";


      var cabecalho =
        document.createElement(
          "div"
        );

      cabecalho.className =
        "item-admin-cabecalho";


      var titulo =
        document.createElement(
          "strong"
        );

      titulo.textContent =
        aula.titulo;


      var etiqueta =
        document.createElement(
          "span"
        );

      etiqueta.className =
        "tag-perfil";

      etiqueta.textContent =
        aula.etiqueta;


      cabecalho.appendChild(
        titulo
      );

      cabecalho.appendChild(
        etiqueta
      );

      cabecalho.appendChild(
        criarBadgeStatus(
          aula.status
        )
      );


      item.appendChild(
        cabecalho
      );


      var autor =
        document.createElement(
          "p"
        );

      autor.className =
        "item-meta";

      autor.textContent =
        "👤 Autor: " +
        (
          aula.autorNome ||
          "desconhecido"
        ) +
        " · 📅 Enviada em: " +
        formatarData(
          aula.criadoEm
        );

      item.appendChild(
        autor
      );


      var descricao =
        document.createElement(
          "p"
        );

      descricao.textContent =
        aula.descricao;

      item.appendChild(
        descricao
      );


      var links =
        document.createElement(
          "p"
        );

      links.className =
        "item-meta";


      var linkVideo =
        document.createElement(
          "a"
        );

      linkVideo.className =
        "link-acao";

      linkVideo.href =
        aula.youtube;

      linkVideo.target =
        "_blank";

      linkVideo.rel =
        "noopener noreferrer";

      linkVideo.textContent =
        "🎥 Ver vídeo";


      var linkDoc =
        document.createElement(
          "a"
        );

      linkDoc.className =
        "link-acao";

      linkDoc.href =
        aula.documento;

      linkDoc.target =
        "_blank";

      linkDoc.rel =
        "noopener noreferrer";

      linkDoc.textContent =
        "📄 Ver material";


      links.appendChild(
        linkVideo
      );

      links.appendChild(
        document.createTextNode(
          " · "
        )
      );

      links.appendChild(
        linkDoc
      );

      item.appendChild(
        links
      );


      var acoes =
        document.createElement(
          "div"
        );

      acoes.className =
        "item-admin-acoes";


      var btnAprovar =
        document.createElement(
          "button"
        );

      btnAprovar.type =
        "button";

      btnAprovar.className =
        "btn-mini aprovar";

      btnAprovar.textContent =
        "✅ Aprovar";

      btnAprovar.setAttribute(
        "aria-label",
        "Aprovar aula " +
        aula.titulo
      );

      btnAprovar.addEventListener(
        "click",
        function () {
          aprovarAula(aula);
        }
      );


      var btnRecusar =
        document.createElement(
          "button"
        );

      btnRecusar.type =
        "button";

      btnRecusar.className =
        "btn-mini excluir";

      btnRecusar.textContent =
        "❌ Recusar";

      btnRecusar.setAttribute(
        "aria-label",
        "Recusar aula " +
        aula.titulo
      );

      btnRecusar.addEventListener(
        "click",
        function () {
          recusarAula(aula);
        }
      );


      acoes.appendChild(
        btnAprovar
      );

      acoes.appendChild(
        btnRecusar
      );

      item.appendChild(
        acoes
      );


      lista.appendChild(
        item
      );
    }
  );


  if (aviso) {
    aviso.hidden =
      pendentes.length !== 0;
  }
}


// ============================================================
// APROVAR AULA
// ============================================================

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
        "Não foi possível aprovar a aula.\n\n" +
        (
          erro && erro.message
            ? erro.message
            : "Verifique as regras do Firestore."
        )
      );
    });
}


// ============================================================
// RECUSAR AULA
// ============================================================

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
        "Não foi possível recusar a aula.\n\n" +
        (
          erro && erro.message
            ? erro.message
            : "Verifique as regras do Firestore."
        )
      );
    });
}


// ============================================================
// EDIÇÃO DE AULA
// ============================================================

function iniciarEdicao(aula) {

  aulaEmEdicao =
    aula.id;


  var campoTitulo =
    document.getElementById(
      "campo-titulo"
    );

  var campoDescricao =
    document.getElementById(
      "campo-descricao"
    );

  var campoPerfil =
    document.getElementById(
      "campo-perfil"
    );

  var campoYoutube =
    document.getElementById(
      "campo-youtube"
    );

  var campoDocumento =
    document.getElementById(
      "campo-documento"
    );


  if (campoTitulo) {
    campoTitulo.value =
      aula.titulo;
  }

  if (campoDescricao) {
    campoDescricao.value =
      aula.descricao;
  }

  if (campoPerfil) {
    campoPerfil.value =
      aula.perfil;
  }

  if (campoYoutube) {
    campoYoutube.value =
      aula.youtube;
  }

  if (campoDocumento) {
    campoDocumento.value =
      aula.documento;
  }


  var botaoSalvar =
    document.getElementById(
      "btn-salvar-aula"
    );

  var botaoCancelar =
    document.getElementById(
      "btn-cancelar-edicao"
    );


  if (botaoSalvar) {
    botaoSalvar.textContent =
      "💾 Salvar alterações";
  }

  if (botaoCancelar) {
    botaoCancelar.hidden =
      false;
  }


  var formulario =
    document.getElementById(
      "form-aula"
    );

  if (formulario) {
    formulario.scrollIntoView({
      behavior: "smooth"
    });
  }
}


function cancelarEdicao() {

  aulaEmEdicao =
    null;


  var formulario =
    document.getElementById(
      "form-aula"
    );

  var botaoSalvar =
    document.getElementById(
      "btn-salvar-aula"
    );

  var botaoCancelar =
    document.getElementById(
      "btn-cancelar-edicao"
    );


  if (formulario) {
    formulario.reset();
  }

  if (botaoSalvar) {
    botaoSalvar.textContent =
      "➕ Adicionar aula";
  }

  if (botaoCancelar) {
    botaoCancelar.hidden =
      true;
  }
}


// ============================================================
// SALVAR AULA DO ADMIN
// ============================================================

function salvarAula(evento) {

  evento.preventDefault();


  var campoTitulo =
    document.getElementById(
      "campo-titulo"
    );

  var campoDescricao =
    document.getElementById(
      "campo-descricao"
    );

  var campoPerfil =
    document.getElementById(
      "campo-perfil"
    );

  var campoYoutube =
    document.getElementById(
      "campo-youtube"
    );

  var campoDocumento =
    document.getElementById(
      "campo-documento"
    );


  if (
    !campoTitulo ||
    !campoDescricao ||
    !campoPerfil ||
    !campoYoutube ||
    !campoDocumento
  ) {

    alert(
      "Não foi possível localizar os campos da aula."
    );

    return;
  }


  var dados = {

    titulo:
      campoTitulo.value.trim(),

    descricao:
      campoDescricao.value.trim(),

    perfil:
      campoPerfil.value,

    youtube:
      campoYoutube.value.trim(),

    documento:
      campoDocumento.value.trim(),

    etiqueta:
      ETIQUETAS[campoPerfil.value] ||
      "Neurotípico"
  };


  if (
    !dados.titulo ||
    !dados.descricao ||
    !dados.youtube ||
    !dados.documento
  ) {

    alert(
      "Preencha todos os campos da aula."
    );

    return;
  }


  var banco =
    firebase.firestore();

  var operacao;


  if (aulaEmEdicao) {

    operacao =
      banco
        .collection("aulas")
        .doc(aulaEmEdicao)
        .set(
          dados,
          {
            merge: true
          }
        );

  } else {

    var usuario =
      firebase.auth()
        .currentUser;


    dados.autorId =
      usuario
        ? usuario.uid
        : "";

    dados.autorNome =
      usuario
        ? (
          usuario.displayName ||
          usuario.email
        )
        : "";

    dados.status =
      "aprovada";

    dados.criadoEm =
      firebase.firestore
        .FieldValue
        .serverTimestamp();


    operacao =
      banco
        .collection("aulas")
        .add(dados);
  }


  operacao
    .then(function () {

      cancelarEdicao();

    })
    .catch(function (erro) {

      console.error(
        "Erro ao salvar aula:",
        erro
      );

      alert(
        "Não foi possível salvar a aula.\n\n" +
        (
          erro && erro.message
            ? erro.message
            : "Verifique as regras do Firestore."
        )
      );
    });
}


// ============================================================
// EXCLUIR AULA
// ============================================================

function excluirAula(aula) {

  if (
    !confirm(
      "Tem certeza que deseja excluir esta aula? (" +
      aula.titulo +
      ")"
    )
  ) {
    return;
  }


  firebase.firestore()
    .collection("aulas")
    .doc(aula.id)
    .delete()
    .then(function () {

      console.log(
        "Aula excluída:",
        aula.id
      );
    })
    .catch(function (erro) {

      console.error(
        "Erro ao excluir aula:",
        erro
      );

      alert(
        "Não foi possível excluir a aula.\n\n" +
        (
          erro && erro.message
            ? erro.message
            : "Verifique as regras do Firestore."
        )
      );
    });
}


// ============================================================
// LISTA ADMINISTRATIVA
// ============================================================

function renderizarListaAdmin() {

  var lista =
    document.getElementById(
      "lista-admin"
    );

  var aviso =
    document.getElementById(
      "admin-vazio"
    );

  if (!lista) {
    return;
  }


  lista.innerHTML = "";


  var campoBusca =
    document.getElementById(
      "busca-admin"
    );

  var termo =
    campoBusca
      ? normalizar(
        campoBusca.value.trim()
      )
      : "";


  var visiveis =
    TODAS_AULAS.filter(
      function (aula) {

        var texto =
          normalizar(
            aula.titulo
          ) +
          " " +
          normalizar(
            aula.descricao
          );

        return (
          !termo ||
          texto.indexOf(termo) !== -1
        );
      }
    );


  visiveis.forEach(
    function (aula) {

      var item =
        document.createElement(
          "li"
        );

      item.className =
        "item-admin";


      var cabecalho =
        document.createElement(
          "div"
        );

      cabecalho.className =
        "item-admin-cabecalho";


      var titulo =
        document.createElement(
          "strong"
        );

      titulo.textContent =
        aula.titulo;


      var etiqueta =
        document.createElement(
          "span"
        );

      etiqueta.className =
        "tag-perfil";

      etiqueta.textContent =
        aula.etiqueta;


      cabecalho.appendChild(
        titulo
      );

      cabecalho.appendChild(
        etiqueta
      );

      cabecalho.appendChild(
        criarBadgeStatus(
          aula.status
        )
      );


      item.appendChild(
        cabecalho
      );


      var acoes =
        document.createElement(
          "div"
        );

      acoes.className =
        "item-admin-acoes";


      var btnEditar =
        document.createElement(
          "button"
        );

      btnEditar.type =
        "button";

      btnEditar.className =
        "btn-mini";

      btnEditar.textContent =
        "✏️ Editar";

      btnEditar.setAttribute(
        "aria-label",
        "Editar aula " +
        aula.titulo
      );

      btnEditar.addEventListener(
        "click",
        function () {
          iniciarEdicao(aula);
        }
      );


      var btnExcluir =
        document.createElement(
          "button"
        );

      btnExcluir.type =
        "button";

      btnExcluir.className =
        "btn-mini excluir";

      btnExcluir.textContent =
        "🗑️ Excluir";

      btnExcluir.setAttribute(
        "aria-label",
        "Excluir aula " +
        aula.titulo
      );

      btnExcluir.addEventListener(
        "click",
        function () {
          excluirAula(aula);
        }
      );


      acoes.appendChild(
        btnEditar
      );

      acoes.appendChild(
        btnExcluir
      );

      item.appendChild(
        acoes
      );

      lista.appendChild(
        item
      );
    }
  );


  if (aviso) {
    aviso.hidden =
      visiveis.length !== 0;
  }
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    // --------------------------------------------------------
    // Tema
    // --------------------------------------------------------

    try {

      if (
        localStorage.getItem(
          "tema"
        ) === "dark"
      ) {

        document.documentElement
          .classList
          .add("dark");
      }

    } catch (erro) {

      console.warn(
        "Não foi possível carregar o tema.",
        erro
      );
    }


    // --------------------------------------------------------
    // Acessibilidade
    // --------------------------------------------------------

    var btnDiminuir =
      document.getElementById(
        "btn-diminuir"
      );

    if (btnDiminuir) {
      btnDiminuir.addEventListener(
        "click",
        function () {
          alterarTamanhoFonte(-2);
        }
      );
    }


    var btnAumentar =
      document.getElementById(
        "btn-aumentar"
      );

    if (btnAumentar) {
      btnAumentar.addEventListener(
        "click",
        function () {
          alterarTamanhoFonte(2);
        }
      );
    }


    var btnDislexia =
      document.getElementById(
        "btn-dislexia"
      );

    if (btnDislexia) {
      btnDislexia.addEventListener(
        "click",
        function () {
          alternarDislexia(this);
        }
      );
    }


    var btnFoco =
      document.getElementById(
        "btn-foco"
      );

    if (btnFoco) {
      btnFoco.addEventListener(
        "click",
        function () {
          alternarFoco(this);
        }
      );
    }


    var btnTema =
      document.getElementById(
        "btn-tema"
      );

    if (btnTema) {
      btnTema.addEventListener(
        "click",
        alternarTema
      );
    }


    // --------------------------------------------------------
    // Firebase
    // --------------------------------------------------------

    if (iniciarFirebase()) {

      firebase.auth()
        .getRedirectResult()
        .catch(function (erro) {

          console.error(
            "Erro no retorno do login:",
            erro
          );
        });
    }


    // --------------------------------------------------------
    // Login
    // --------------------------------------------------------

    var btnGoogle =
      document.getElementById(
        "btn-google"
      );

    if (btnGoogle) {
      btnGoogle.addEventListener(
        "click",
        aoClicarBotaoGoogle
      );
    }


    var btnSair =
      document.getElementById(
        "btn-sair"
      );

    if (btnSair) {

      btnSair.addEventListener(
        "click",
        function () {

          if (firebasePronto) {

            firebase.auth()
              .signOut()
              .catch(function (erro) {

                console.error(
                  "Erro ao sair:",
                  erro
                );
              });
          }
        }
      );
    }


    // --------------------------------------------------------
    // Busca
    // --------------------------------------------------------

    var campoBusca =
      document.getElementById(
        "campo-busca"
      );

    if (campoBusca) {

      campoBusca.addEventListener(
        "input",
        renderizarAulas
      );
    }


    var filtroPerfil =
      document.getElementById(
        "filtro-perfil"
      );

    if (filtroPerfil) {

      filtroPerfil.addEventListener(
        "change",
        renderizarAulas
      );
    }


    // --------------------------------------------------------
    // Catálogo
    // --------------------------------------------------------

    carregarCatalogo();


    // --------------------------------------------------------
    // Formulário de criação de aula
    // --------------------------------------------------------

    var formCriar =
      document.getElementById(
        "form-criar-aula"
      );

    if (formCriar) {

      formCriar.addEventListener(
        "submit",
        enviarAulaAnalise
      );
    }


    // --------------------------------------------------------
    // Formulário administrativo
    // --------------------------------------------------------

    var formAula =
      document.getElementById(
        "form-aula"
      );

    if (formAula) {

      formAula.addEventListener(
        "submit",
        salvarAula
      );
    }


    var btnCancelar =
      document.getElementById(
        "btn-cancelar-edicao"
      );

    if (btnCancelar) {

      btnCancelar.addEventListener(
        "click",
        cancelarEdicao
      );
    }


    var buscaAdmin =
      document.getElementById(
        "busca-admin"
      );

    if (buscaAdmin) {

      buscaAdmin.addEventListener(
        "input",
        renderizarListaAdmin
      );
    }


    // --------------------------------------------------------
    // Renderização inicial
    // --------------------------------------------------------

    renderizarAulas();
    renderizarMinhasAulas();
    renderizarTransacoes();
    renderizarPendentes();
    renderizarListaAdmin();

  }
);

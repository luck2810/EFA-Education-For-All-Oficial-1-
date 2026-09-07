// EducaAcessível — script.js
// Funcionalidades de acessibilidade, busca, filtro e login.

// ---------- Aulas ----------
var AULAS = [
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
  } catch (erro) {
    console.error("Erro ao salvar tema:", erro);
  }
}


// ---------- Firebase ----------

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

  if (typeof firebase === "undefined") {
    console.error(
      "Firebase não foi carregado. Verifique os scripts do Firebase no HTML."
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

    console.log("Firebase iniciado com sucesso.");

    return true;

  } catch (erro) {

    console.error("Erro ao iniciar Firebase:", erro);

    if (botao) {
      botao.disabled = true;
    }

    return false;
  }
}


// ---------- Mensagens de erro ----------

function mensagemDeErro(erro) {

  var codigo = erro && erro.code ? erro.code : "";

  if (codigo === "auth/popup-blocked") {
    return "O pop-up foi bloqueado pelo navegador.";
  }

  if (
    codigo === "auth/popup-closed-by-user" ||
    codigo === "auth/cancelled-popup-request"
  ) {
    return "Login cancelado.";
  }

  if (codigo === "auth/unauthorized-domain") {
    return "Este domínio não está autorizado no Firebase.";
  }

  if (codigo === "auth/operation-not-allowed") {
    return "O login com Google não está ativado no Firebase.";
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

  return "Não foi possível entrar com o Google.";
}


// ---------- Login Google ----------

function entrarComGoogle() {

  if (!firebasePronto) {
    alert("Firebase ainda não foi iniciado.");
    return;
  }

  var provedor = new firebase.auth.GoogleAuthProvider();

  provedor.setCustomParameters({
    prompt: "select_account"
  });


  // Detecta celular
  var noCelular =
    /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent
    );


  var tentativa;

  if (noCelular) {

    // Melhor opção para celular
    tentativa = firebase
      .auth()
      .signInWithRedirect(provedor);

  } else {

    // Computador
    tentativa = firebase
      .auth()
      .signInWithPopup(provedor);
  }


  return tentativa.catch(function (erro) {

    console.error("Erro no login Google:", erro);

    alert(mensagemDeErro(erro));

  });
}


// ---------- Botão Google ----------

function aoClicarBotaoGoogle() {

  if (!firebasePronto) {

    alert(
      "O Firebase não está disponível. Verifique a configuração."
    );

    return;
  }


  var usuario = firebase.auth().currentUser;


  // Se já está logado, troca de conta
  if (usuario) {

    firebase
      .auth()
      .signOut()
      .then(function () {

        entrarComGoogle();

      })
      .catch(function (erro) {

        console.error("Erro ao trocar conta:", erro);

        alert(mensagemDeErro(erro));

      });

  } else {

    entrarComGoogle();

  }
}


// ---------- Mostrar usuário ----------

function mostrarUsuario(usuario) {

  var botao = document.getElementById("btn-google");
  var info = document.getElementById("info-usuario");
  var btnSair = document.getElementById("btn-sair");


  if (usuario) {

    var nome =
      usuario.displayName ||
      usuario.email ||
      "Usuário";


    if (info) {
      info.textContent = "Olá, " + nome;
      info.hidden = false;
    }


    if (botao) {
      botao.textContent = "Trocar conta";
    }


    if (btnSair) {
      btnSair.hidden = false;
    }


    console.log("Usuário logado:", usuario.email);

  } else {

    if (info) {
      info.textContent = "";
      info.hidden = true;
    }


    if (botao) {
      botao.textContent = "Entrar com Google";
    }


    if (btnSair) {
      btnSair.hidden = true;
    }

  }
}


// ---------- Catálogo ----------

function normalizar(texto) {

  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

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


// ---------- Busca e filtro ----------

function renderizarAulas() {

  var campoBusca = document.getElementById("campo-busca");
  var filtroPerfil = document.getElementById("filtro-perfil");
  var grid = document.getElementById("grid-aulas");
  var aviso = document.getElementById("sem-resultados");


  if (!campoBusca || !filtroPerfil || !grid) {
    return;
  }


  var termo = normalizar(
    campoBusca.value.trim()
  );

  var perfil = filtroPerfil.value;


  grid.innerHTML = "";


  var visiveis = AULAS.filter(function (aula) {

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


    return encontrouTexto && encontrouPerfil;

  });


  visiveis.forEach(function (aula) {

    grid.appendChild(
      criarCard(aula)
    );

  });


  if (aviso) {
    aviso.hidden = visiveis.length !== 0;
  }

}


// ---------- Inicialização ----------

document.addEventListener(
  "DOMContentLoaded",
  function () {

    // Tema salvo
    try {

      if (
        localStorage.getItem("tema") === "dark"
      ) {

        document.documentElement.classList.add("dark");

      }

    } catch (erro) {
      console.error("Erro ao carregar tema:", erro);
    }


    // Botões de acessibilidade

    var btnDiminuir =
      document.getElementById("btn-diminuir");

    var btnAumentar =
      document.getElementById("btn-aumentar");

    var btnDislexia =
      document.getElementById("btn-dislexia");

    var btnFoco =
      document.getElementById("btn-foco");

    var btnTema =
      document.getElementById("btn-tema");


    if (btnDiminuir) {

      btnDiminuir.addEventListener(
        "click",
        function () {
          alterarTamanhoFonte(-2);
        }
      );

    }


    if (btnAumentar) {

      btnAumentar.addEventListener(
        "click",
        function () {
          alterarTamanhoFonte(2);
        }
      );

    }


    if (btnDislexia) {

      btnDislexia.addEventListener(
        "click",
        function () {
          alternarDislexia(this);
        }
      );

    }


    if (btnFoco) {

      btnFoco.addEventListener(
        "click",
        function () {
          alternarFoco(this);
        }
      );

    }


    if (btnTema) {

      btnTema.addEventListener(
        "click",
        alternarTema
      );

    }


    // Inicia Firebase

    if (iniciarFirebase()) {

      firebase
        .auth()
        .getRedirectResult()
        .catch(function (erro) {

          console.error(
            "Erro no retorno do login:",
            erro
          );

          if (
            erro.code !==
            "auth/popup-closed-by-user"
          ) {
            alert(mensagemDeErro(erro));
          }

        });

    }


    // Botão Google

    var btnGoogle =
      document.getElementById("btn-google");


    if (btnGoogle) {

      btnGoogle.addEventListener(
        "click",
        aoClicarBotaoGoogle
      );

    }


    // Botão sair

    var btnSair =
      document.getElementById("btn-sair");


    if (btnSair) {

      btnSair.addEventListener(
        "click",
        function () {

          if (firebasePronto) {

            firebase
              .auth()
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


    // Busca

    var campoBusca =
      document.getElementById("campo-busca");

    var filtroPerfil =
      document.getElementById("filtro-perfil");


    if (campoBusca) {

      campoBusca.addEventListener(
        "input",
        renderizarAulas
      );

    }


    if (filtroPerfil) {

      filtroPerfil.addEventListener(
        "change",
        renderizarAulas
      );

    }


    // Renderiza catálogo
    renderizarAulas();

  }
);

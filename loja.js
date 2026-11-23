const cartas = {
  charizard: { nome: "Charizard", tipo: "Fogo", dex: 6, numero: 4, centavos: 19990, descricao: "As asas abertas e a chama na cauda anunciam o último estágio de Charmander. Na carta clássica, Charizard aparece entre labaredas." },
  blastoise: { nome: "Blastoise", tipo: "Água", dex: 9, numero: 2, centavos: 80000, descricao: "Os dois canhões no casco são a marca de Blastoise, a evolução final de Squirtle. Veja sua ilustração original do Base Set." },
  venusaur: { nome: "Venusaur", tipo: "Planta", dex: 3, numero: 15, centavos: 90000, descricao: "Carta holográfica Venusaur do Base Set. A peça apresentada na loja vem em case de acrílico com graduação PSA 10 (Gem Mint)." },
  pikachu: { nome: "Pikachu", tipo: "Elétrico", dex: 25, numero: 58, centavos: 8990, descricao: "O parceiro de Ash também tem seu lugar no fichário. Esta é a versão de Pikachu ilustrada para a coleção Base Set." }
};
const moeda = centavos => (centavos / 100).toLocaleString("pt-BR", {style: "currency", currency: "BRL"});
const chave = "pokeshop.carrinho.v1";
function lerCarrinho() {
  try {
    const salvo = JSON.parse(localStorage.getItem(chave)) || {};
    return Object.fromEntries(Object.entries(salvo).filter(([id, quantidade]) =>
      Object.hasOwn(cartas, id) && Number.isInteger(quantidade) && quantidade > 0 && quantidade <= 99));
  } catch {
    return {};
  }
}
let carrinho = lerCarrinho();
function atualizarContador() {
  document.querySelector("[data-count]").textContent = Object.values(carrinho).reduce((a,b) => a+b, 0);
}
function alterar(id, passo) {
  const proximo = {...carrinho};
  const quantidade = Math.min(99, (proximo[id] || 0) + passo);
  if (quantidade > 0) proximo[id] = quantidade;
  else delete proximo[id];
  try {
    localStorage.setItem(chave, JSON.stringify(proximo));
  } catch {
    alert("Seu navegador não conseguiu salvar o carrinho.");
    return false;
  }
  carrinho = proximo;
  atualizarContador();
  return true;
}
atualizarContador();
document.querySelectorAll("[data-filter]").forEach(botao => {
  botao.addEventListener("click", () => {
    const tipo = botao.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => item.setAttribute("aria-pressed", String(item === botao)));
    let total = 0;
    document.querySelectorAll("[data-type]").forEach(item => {
      item.hidden = tipo !== "Todas" && tipo !== item.dataset.type;
      if (!item.hidden) total++;
    });
    document.querySelector("#results").textContent = total === 1 ? "1 carta encontrada." : total + " cartas encontradas.";
  });
});
const detalhe = document.querySelector("#detail");
if (detalhe) {
  const parametro = new URLSearchParams(location.search).get("carta");
  const id = Object.hasOwn(cartas, parametro) ? parametro : "venusaur";
  const carta = cartas[id];
  document.title = carta.nome + " | PokéShop";
  detalhe.innerHTML = `<div class="card-art t${carta.dex}"><img src="${id === "venusaur" ? "venusaur.png" : "art/card"+carta.numero+".webp"}" alt="Carta ${carta.nome} do Base Set"></div>
    <div><small class="section-label">BASE SET / ${carta.numero} DE 102</small><h1>${carta.nome}</h1><span class="type t${carta.dex}">${carta.tipo}</span>
    <p class="description">${carta.descricao}</p><strong>${moeda(carta.centavos)}</strong><button class="button primary" id="adicionar">Adicionar ao carrinho</button>
    <p role="status" id="feedback"></p><a href="Carrinho.html">Ver meu carrinho</a></div>`;
  detalhe.querySelector("button").addEventListener("click", () => {
    const feedback = document.querySelector("#feedback");
    if (carrinho[id] === 99) feedback.textContent = "Limite de 99 unidades por carta.";
    else if (alterar(id, 1)) feedback.textContent = carta.nome + " no carrinho · " + carrinho[id] + " un.";
  });
}
const itens = document.querySelector("#items");
function mostrarCarrinho() {
  if (!itens) return;
  const entradas = Object.entries(carrinho);
  if (!entradas.length) {
    itens.innerHTML = "<p>Seu carrinho está vazio. Explore as cartas de Kanto para escolher a primeira.</p>";
    return;
  }
  let total = 0;
  itens.innerHTML = entradas.map(([id, quantidade]) => {
    const carta = cartas[id];
    const subtotal = quantidade * carta.centavos;
    total += subtotal;
    return `<div class="row"><img src="art/${carta.dex}.webp" alt=""><a href="TelaProduto.html?carta=${id}">${carta.nome}</a>
      <div class="quantity"><button data-id="${id}" data-passo="-1" aria-label="Diminuir quantidade de ${carta.nome}">−</button>
      <span>${quantidade}</span><button data-id="${id}" data-passo="1" aria-label="Aumentar quantidade de ${carta.nome}" ${quantidade===99?"disabled":""}>+</button></div>
      <b>${moeda(subtotal)}</b></div>`;
  }).join("") + `<p class="total">Total · ${moeda(total)}</p><p>Compra demonstrativa. O pagamento estará disponível em uma etapa futura.</p>`;
}
mostrarCarrinho();
itens?.addEventListener("click", evento => {
  const botao = evento.target.closest("[data-passo]");
  if (botao && alterar(botao.dataset.id, Number(botao.dataset.passo))) {
    mostrarCarrinho();
    const proximo = itens.querySelector(`[data-id="${botao.dataset.id}"][data-passo="${botao.dataset.passo}"]:enabled`) || itens.querySelector("button") || document.querySelector(".secondary");
    proximo.focus();
  }
});
window.addEventListener("storage", evento => {
  if (evento.key === chave || evento.key === null) {
    carrinho = lerCarrinho();
    atualizarContador();
    mostrarCarrinho();
  }
});
const formulario = document.querySelector("[data-account]");
formulario?.addEventListener("submit", evento => {
  evento.preventDefault();
  const confirmar = document.querySelector("#confirmar");
  const mensagem = formulario.querySelector("[role=status]");
  if (confirmar && confirmar.value !== document.querySelector("#senha").value) {
    mensagem.textContent = "As senhas precisam ser iguais.";
    confirmar.focus();
    return;
  }
  formulario.reset();
  mensagem.textContent = "Formulário validado. O acesso à conta estará disponível quando o servidor da loja estiver integrado.";
});

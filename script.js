// ====================== ESTRUTURAS DE DADOS ======================
let animais = JSON.parse(localStorage.getItem('animais')) || [];
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let solicitacoes = JSON.parse(localStorage.getItem('solicitacoes')) || [];
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
let historico = JSON.parse(localStorage.getItem('historico')) || [];
let usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual')) || null;

let matrizOrganizacao = {
  'Cão': { 'Pequeno': [], 'Médio': [], 'Grande': [] },
  'Gato': { 'Pequeno': [], 'Médio': [], 'Grande': [] },
  'Coelho': { 'Pequeno': [], 'Médio': [], 'Grande': [] }
};

// ====================== FUNÇÕES AUXILIARES ======================
function salvarDados() {
  localStorage.setItem('animais', JSON.stringify(animais));
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('solicitacoes', JSON.stringify(solicitacoes));
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  localStorage.setItem('historico', JSON.stringify(historico));
  localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual));
}

function mostrarSecao(id) {
  document.querySelectorAll('.secao').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';

  if (id === 'galeria') renderizarGaleria();
  if (id === 'favoritos') renderizarFavoritos();
  if (id === 'solicitacoes') renderizarSolicitacoes();
  if (id === 'admin') renderizarAdmin();
  if (id === 'login') atualizarLogin();
}

function atualizarLogin() {
  const el = document.getElementById('usuarioLogado');
  el.textContent = usuarioAtual 
    ? `Logado como: ${usuarioAtual.nome} (${usuarioAtual.email})` 
    : 'Nenhum usuário logado';
}

// ====================== MÁSCARA DE TELEFONE ======================
document.addEventListener('DOMContentLoaded', () => {
  const telefoneInput = document.getElementById('telefoneUsuario');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', function (e) {
      let valor = e.target.value.replace(/\D/g, '');
      if (valor.length > 11) valor = valor.slice(0, 11);

      if (valor.length <= 10) {
        valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
      e.target.value = valor;
    });
  }
});

// ====================== CADASTRO DE USUÁRIO ======================
function cadastrarUsuario(e) {
  e.preventDefault();

  const nome = document.getElementById('nomeUsuario').value.trim();
  const email = document.getElementById('emailUsuario').value.trim().toLowerCase();
  const senha = document.getElementById('senhaUsuario').value;
  const confirma = document.getElementById('confirmaSenha').value;
  const telefone = document.getElementById('telefoneUsuario').value.trim();
  const msg = document.getElementById('mensagemCadastro');

  if (senha !== confirma) {
    msg.style.color = 'red';
    msg.textContent = 'Erro: As senhas não coincidem!';
    return;
  }

  if (usuarios.some(u => u.email === email)) {
    msg.style.color = 'red';
    msg.textContent = 'Erro: Este e-mail já está cadastrado!';
    return;
  }

  if (telefone.length < 14) {
    msg.style.color = 'red';
    msg.textContent = 'Erro: Telefone inválido!';
    return;
  }

  const novoUsuario = {
    id: Date.now(),
    nome,
    email,
    senha,
    telefone
  };

  usuarios.push(novoUsuario);
  salvarDados();

  msg.style.color = 'green';
  msg.textContent = 'Cadastro realizado com sucesso! Faça login.';
  e.target.reset();
}

// ====================== LOGIN ======================
function fazerLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const senha = document.getElementById('loginSenha').value;
  const msg = document.getElementById('mensagemLogin');

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    msg.style.color = 'red';
    msg.textContent = 'E-mail ou senha incorretos!';
    return;
  }

  usuarioAtual = usuario;
  salvarDados();
  atualizarLogin();

  msg.style.color = 'green';
  msg.textContent = `Bem-vindo(a), ${usuario.nome}!`;
  mostrarSecao('galeria');
}

// ====================== CADASTRO DE ANIMAIS ======================
function cadastrarAnimal(e) {
  e.preventDefault();
  const animal = {
    id: Date.now(),
    nome: document.getElementById('nomeAnimal').value,
    especie: document.getElementById('especieAnimal').value,
    porte: document.getElementById('porteAnimal').value,
    idade: parseInt(document.getElementById('idadeAnimal').value),
    descricao: document.getElementById('descricaoAnimal').value,
    foto: document.getElementById('fotoAnimal').value || '',
    status: 'disponivel',
    filaInteressados: []
  };

  animais.push(animal);

  if (matrizOrganizacao[animal.especie] && matrizOrganizacao[animal.especie][animal.porte]) {
    matrizOrganizacao[animal.especie][animal.porte].push(animal.id);
  }

  historico.push({
    acao: 'Cadastro',
    animal: animal.nome,
    data: new Date().toLocaleString('pt-BR')
  });

  salvarDados();
  e.target.reset();
  renderizarAdmin();
  renderizarGaleria();
  alert('Animal cadastrado com sucesso!');
}

// ====================== FILTROS E GALERIA ======================
function aplicarFiltros() {
  renderizarGaleria();
}

function renderizarGaleria() {
  const especie = document.getElementById('filtroEspecie').value;
  const porte = document.getElementById('filtroPorte').value;
  const idade = document.getElementById('filtroIdade').value;

  let filtrados = animais.filter(a => {
    if (especie && a.especie !== especie) return false;
    if (porte && a.porte !== porte) return false;
    if (idade === 'filhote' && a.idade > 1) return false;
    if (idade === 'adulto' && (a.idade < 1 || a.idade > 7)) return false;
    if (idade === 'idoso' && a.idade <= 7) return false;
    return true;
  });

  const container = document.getElementById('galeriaAnimais');
  container.innerHTML = '';

  if (filtrados.length === 0) {
    container.innerHTML = '<p>Nenhum animal encontrado com esses filtros.</p>';
    return;
  }

  filtrados.forEach(animal => {
    const div = document.createElement('div');
    div.innerHTML = `
      <hr>
      <h3>${animal.nome}</h3>
      <p><strong>Espécie:</strong> ${animal.especie} | <strong>Porte:</strong> ${animal.porte} | <strong>Idade:</strong> ${animal.idade} ano(s)</p>
      <p>${animal.descricao}</p>
      <p><strong>Status:</strong> ${animal.status === 'disponivel' ? 'Disponível' : 'Adotado'}</p>
      <p><strong>Fila de interessados:</strong> ${animal.filaInteressados.length} pessoa(s)</p>
      <button onclick="toggleFavorito(${animal.id})">
        ${favoritos.includes(animal.id) ? 'Remover dos Favoritos' : 'Favoritar'}
      </button>
      ${animal.status === 'disponivel' 
        ? `<button onclick="mostrarFormInteresse(${animal.id})">Tenho Interesse</button>`
        : `<p><em>Não aceita novas solicitações</em></p>`}
    `;
    container.appendChild(div);
  });
}

// ====================== FAVORITOS ======================
function toggleFavorito(id) {
  if (!usuarioAtual) return alert('Faça login primeiro!');
  const index = favoritos.indexOf(id);
  if (index === -1) favoritos.push(id);
  else favoritos.splice(index, 1);
  salvarDados();
  renderizarGaleria();
  renderizarFavoritos();
}

function renderizarFavoritos() {
  const container = document.getElementById('listaFavoritos');
  container.innerHTML = '';
  const favs = animais.filter(a => favoritos.includes(a.id));

  if (favs.length === 0) {
    container.innerHTML = '<p>Nenhum favorito ainda.</p>';
    return;
  }

  favs.forEach(animal => {
    const div = document.createElement('div');
    div.innerHTML = `
      <hr>
      <h3>${animal.nome}</h3>
      <p>${animal.especie} - ${animal.porte}</p>
      <button onclick="toggleFavorito(${animal.id})">Remover</button>
    `;
    container.appendChild(div);
  });
}

// ====================== SOLICITAÇÕES E FILA ======================
function mostrarFormInteresse(animalId) {
  if (!usuarioAtual) return alert('Faça login primeiro!');
  
  const animal = animais.find(a => a.id === animalId);
  if (!animal || animal.status === 'adotado') {
    return alert('Este animal já foi adotado e não aceita novas solicitações!');
  }

  if (animal.filaInteressados.some(i => i.email === usuarioAtual.email)) {
    return alert('Você já está na fila deste animal!');
  }

  animal.filaInteressados.push({
    nome: usuarioAtual.nome,
    email: usuarioAtual.email,
    telefone: usuarioAtual.telefone,
    data: new Date().toLocaleString('pt-BR')
  });

  const solicitacao = {
    id: Date.now(),
    animalId: animal.id,
    animalNome: animal.nome,
    usuario: usuarioAtual.nome,
    email: usuarioAtual.email,
    status: 'Em análise',
    data: new Date().toLocaleString('pt-BR')
  };
  solicitacoes.push(solicitacao);

  historico.push({
    acao: 'Nova solicitação',
    animal: animal.nome,
    usuario: usuarioAtual.nome,
    data: new Date().toLocaleString('pt-BR')
  });

  salvarDados();
  renderizarGaleria();
  alert(`Você entrou na fila do ${animal.nome}! Posição: ${animal.filaInteressados.length}`);
}

function renderizarSolicitacoes() {
  const container = document.getElementById('listaSolicitacoes');
  
  if (!usuarioAtual) {
    container.innerHTML = '<p>Faça login para ver suas solicitações.</p>';
    return;
  }

  const minhas = solicitacoes.filter(s => s.email === usuarioAtual.email);
  
  if (minhas.length === 0) {
    container.innerHTML = '<p>Nenhuma solicitação encontrada.</p>';
    return;
  }

  container.innerHTML = minhas.map(s => `
    <hr>
    <p><strong>${s.animalNome}</strong> - Status: ${s.status}<br>Data: ${s.data}</p>
  `).join('');
}

// ====================== ADMIN ======================
function marcarAdotado(id) {
  const animal = animais.find(a => a.id === id);
  if (!animal) return;

  animal.status = 'adotado';

  if (animal.filaInteressados.length > 0) {
    const primeiro = animal.filaInteressados[0];
    alert(`Animal marcado como adotado!\nPrimeiro da fila: ${primeiro.nome} (${primeiro.email}) - Tel: ${primeiro.telefone || 'não informado'}`);
  }

  historico.push({
    acao: 'Marcado como adotado',
    animal: animal.nome,
    data: new Date().toLocaleString('pt-BR')
  });

  salvarDados();
  renderizarAdmin();
  renderizarGaleria();
}

function renderizarAdmin() {
  const container = document.getElementById('listaAdmin');
  container.innerHTML = animais.map(a => `
    <hr>
    <p>
      <strong>${a.nome}</strong> (${a.especie} - ${a.porte}) - Status: ${a.status}
      ${a.status === 'disponivel' 
        ? `<button onclick="marcarAdotado(${a.id})">Marcar como Adotado</button>` 
        : ''}
    </p>
    <p>Fila: ${a.filaInteressados.map(i => i.nome).join(', ') || 'Vazia'}</p>
  `).join('');

  const hist = document.getElementById('historicoAlteracoes');
  hist.innerHTML = historico.slice().reverse().map(h => 
    `<p>${h.data} → ${h.acao}: ${h.animal}${h.usuario ? ' por ' + h.usuario : ''}</p>`
  ).join('') || '<p>Nenhuma alteração registrada.</p>';
}

// ====================== DADOS INICIAIS ======================
if (animais.length === 0) {
  animais = [
    { id: 1, nome: 'Thor', especie: 'Cão', porte: 'Grande', idade: 3, descricao: 'Brincalhão e protetor.', foto: '', status: 'disponivel', filaInteressados: [] },
    { id: 2, nome: 'Rex', especie: 'Cão', porte: 'Médio', idade: 5, descricao: 'Calmo e obediente.', foto: '', status: 'disponivel', filaInteressados: [] },
    { id: 3, nome: 'Bella', especie: 'Cão', porte: 'Pequeno', idade: 1, descricao: 'Muito carinhosa e ativa.', foto: '', status: 'disponivel', filaInteressados: [] },
    { id: 4, nome: 'Max', especie: 'Cão', porte: 'Grande', idade: 8, descricao: 'Idoso tranquilo e companheiro.', foto: '', status: 'disponivel', filaInteressados: [] },
    { id: 5, nome: 'Luna', especie: 'Gato', porte: 'Pequeno', idade: 2, descricao: 'Independente e curiosa.', foto: '', status: 'disponivel', filaInteressados: [] },
    { id: 6, nome: 'Mimi', especie: 'Gato', porte: 'Pequeno', idade: 0, descricao: 'Filhote brincalhona.', foto: '', status: 'disponivel', filaInteressados: [] },
    { id: 7, nome: 'Felix', especie: 'Gato', porte: 'Médio', idade: 4, descricao: 'Gosta de colo e de janelas.', foto: '', status: 'disponivel', filaInteressados: [] },
    { id: 8, nome: 'Nina', especie: 'Gato', porte: 'Pequeno', idade: 6, descricao: 'Tranquila e afetuosa.', foto: '', status: 'disponivel', filaInteressados: [] },
    { id: 9, nome: 'Pompom', especie: 'Coelho', porte: 'Pequeno', idade: 1, descricao: 'Coelho dócil e curioso.', foto: '', status: 'disponivel', filaInteressados: [] },
    { id: 10, nome: 'Mel', especie: 'Coelho', porte: 'Pequeno', idade: 3, descricao: 'Gosta de cenoura e de atenção.', foto: '', status: 'disponivel', filaInteressados: [] }
  ];
  salvarDados();
}

// Inicia na galeria
document.querySelectorAll('.secao').forEach(s => s.style.display = 'none');
mostrarSecao('galeria');
atualizarLogin();
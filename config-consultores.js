// config-consultores.js
(function (window) {
  const STORAGE_KEY = 'gpp_consultores_v1';

  const DEFAULTS = [
    "Rui Quelhas",
    "Manuel Oliveira",
    "João Sousa",
    "Francisco dos Santos",
    "Rosário Vasconcelos",
    "Armanda Meireles",
    "Audrey Lucas"
  ].map((nome, idx) => ({
    id: 'c' + (idx + 1),
    nome,
    ativo: true
  }));

  function safeParse(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Erro a ler consultores do storage', e);
      return null;
    }
  }

  function loadLista() {
    const stored = safeParse(localStorage.getItem(STORAGE_KEY));
    if (stored && Array.isArray(stored) && stored.length) {
      // segurança básica: garantir campos essenciais
      return stored.map((c, idx) => ({
        id: c.id || ('c' + (idx + 1)),
        nome: c.nome || '',
        ativo: c.ativo !== false
      })).filter(c => c.nome);
    }
    // se não houver nada em storage, devolve defaults
    return DEFAULTS.slice();
  }

  function saveLista(lista) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (e) {
      console.error('Erro a guardar consultores no storage', e);
    }
  }

  const API = {
    /** Devolve todos os consultores (ativos e inativos) */
    getTodos() {
      return loadLista();
    },
    /** Devolve apenas consultores ativos */
    getAtivos() {
      return loadLista().filter(c => c.ativo !== false);
    },
    /** Substitui a lista completa (usar com cuidado) */
    setTodos(lista) {
      if (!Array.isArray(lista)) return;
      saveLista(lista);
    },
    /** Adiciona um consultor simples, ativo, se ainda não existir com o mesmo nome */
    add(nome) {
      const clean = (nome || '').trim();
      if (!clean) return;

      const lista = loadLista();
      const jaExiste = lista.some(c => c.nome.toLowerCase() === clean.toLowerCase());
      if (jaExiste) return;

      const novo = {
        id: 'c' + (Date.now()),
        nome: clean,
        ativo: true
      };
      lista.push(novo);
      saveLista(lista);
      return novo;
    }
  };

  window.GPPConsultores = API;
})(window);

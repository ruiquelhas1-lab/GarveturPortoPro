(function () {
  const STORAGE_KEY = 'gpp_consultores_config_v1';

  // Lista de base (DEFAULT) – segurança / fallback
  const DEFAULT_CONSULTANTS = [
    { nome: "Rui Quelhas", ativo: true },
    { nome: "Manuel Oliveira", ativo: true },
    { nome: "João Sousa", ativo: true },
    { nome: "Francisco dos Santos", ativo: true },
    { nome: "Rosário Vasconcelos", ativo: true },
    { nome: "Armanda Meireles", ativo: true },
    { nome: "Audrey Lucas", ativo: true },
    { nome: "Dalila Cunha", ativo: true },
    { nome: "Outro", ativo: true }
  ];

  function normalizarLista(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
      .map(c => {
        if (!c) return null;
        const nome = (c.nome || c.name || '').trim();
        if (!nome) return null;
        return {
          nome,
          ativo: c.ativo !== false // tudo ativo por defeito, salvo se for explicitamente false
        };
      })
      .filter(Boolean);
  }

  function carregarDeStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const norm = normalizarLista(parsed);
      if (!norm.length) return null;
      return norm;
    } catch (e) {
      console.error('Erro a ler consultores do localStorage', e);
      return null;
    }
  }

  // 1) Tenta ler do storage
  const fromStorage = carregarDeStorage();

  // 2) Se não houver, usa DEFAULT
  const listaInterna = (fromStorage && fromStorage.length)
    ? fromStorage.slice()
    : normalizarLista(DEFAULT_CONSULTANTS);

  // Expor lista "crua" compatível com o que já existia
  window.CONSULTANTS_CONFIG = listaInterna;

  // API central para todos os módulos (Kanban, Tarefas, Angariações, Admin)
  window.GPPConsultores = {
    /**
     * Devolve cópia da lista completa (ativos + inativos)
     */
    getTodos: function () {
      return listaInterna.slice();
    },

    /**
     * Devolve apenas consultores ativos (para selects, filtros, etc.)
     */
    getAtivos: function () {
      return listaInterna.filter(c => c.ativo !== false);
    },

    /**
     * Guarda nova lista (normalizada) no localStorage e na lista interna.
     * Usado pela página consultores-admin.html
     */
    saveAll: function (novaLista) {
      const norm = normalizarLista(novaLista);
      if (!norm.length) {
        console.warn('Tentativa de guardar lista de consultores vazia – operação ignorada.');
        return false;
      }

      // Atualiza array interno mantendo a referência
      listaInterna.length = 0;
      norm.forEach(c => listaInterna.push(c));

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listaInterna));
      } catch (e) {
        console.error('Erro ao guardar consultores no localStorage', e);
        return false;
      }
      // Atualiza também o CONSULTANTS_CONFIG para compatibilidade
      window.CONSULTANTS_CONFIG = listaInterna;
      return true;
    },

    /**
     * Limpa o storage e volta à lista DEFAULT.
     */
    resetToDefault: function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Erro ao limpar consultores do localStorage', e);
      }

      const norm = normalizarLista(DEFAULT_CONSULTANTS);
      listaInterna.length = 0;
      norm.forEach(c => listaInterna.push(c));
      window.CONSULTANTS_CONFIG = listaInterna;
    }
  };
})();

// Garvetur Porto Pro — Configuração global de consultores (localStorage + default)
// Storage key: gpp_consultores_v1
(function(){
  const STORAGE_KEY = 'gpp_consultores_v1';

  // ✅ Lista base (fallback) — garante consultores em máquinas novas
  const DEFAULT_LIST = [
    { id:"c_rui",      nome:"Rui Quelhas",          ativo:true },
    { id:"c_manuel",   nome:"Manuel Oliveira",      ativo:true },
    { id:"c_joao",     nome:"João Sousa",           ativo:true },
    { id:"c_francisco",nome:"Francisco dos Santos", ativo:true },
    { id:"c_rosario",  nome:"Rosário Vasconcelos",  ativo:true },
    { id:"c_armanda",  nome:"Armanda Meireles",     ativo:true },
    { id:"c_audrey",   nome:"Audrey Lucas",         ativo:true },
    { id:"c_dalila",   nome:"Dalila Cunha",         ativo:true },
    { id:"c_outro",    nome:"Outro",                ativo:true }
  ];

  function safeParse(s){
    try{ return JSON.parse(s); }catch(e){ return null; }
  }

  function normalize(list){
    if(!Array.isArray(list)) return [];
    return list.map((c, idx)=>{
      if(typeof c === 'string'){
        return { id: 'c_'+idx+'_'+Date.now(), nome: c, ativo: true };
      }
      if(c && typeof c === 'object'){
        return {
          id: c.id || ('c_'+idx+'_'+Date.now()),
          nome: (c.nome || c.name || '').trim(),
          ativo: c.ativo !== false
        };
      }
      return null;
    }).filter(Boolean).filter(c=>c.nome);
  }

  function getAll(){
    const raw = safeParse(localStorage.getItem(STORAGE_KEY) || 'null');
    const norm = normalize(raw);
    // ✅ Se não houver nada no localStorage, cai para a lista base
    return norm.length ? norm : normalize(DEFAULT_LIST);
  }

  function saveAll(list){
    const norm = normalize(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(norm));
    return norm;
  }

  window.GPPConsultores = { getAll, saveAll };

  // Backward-compat (módulos antigos)
  window.CONSULTANTS_CONFIG = getAll();
})();

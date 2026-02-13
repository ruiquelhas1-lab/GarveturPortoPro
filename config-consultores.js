/* Garvetur Porto Pro — Configuração central de Consultores (v1.1.0)
   Modo distribuição: MOSTRAR APENAS o consultor titular da licença.

   Chaves locais relevantes:
   - gpp_license_key_v1       (chave simples da licença)
   - gpp_license_state_v1     (objeto com estado/licença)
   - gpp_consultor_nome_v1    (nome do titular vindo do endpoint)
   - gpp_consultores_v1       (lista consumida pelos módulos)
*/
(function(){
  'use strict';

  const STORAGE_KEY = 'gpp_consultores_v1';

  // Preferências/compatibilidade
  const LICENSE_KEY = 'gpp_license_key_v1';
  const LIC_STATE_KEY = 'gpp_license_state_v1';
  const CONSULTOR_NOME_KEY = 'gpp_consultor_nome_v1';

  // ✅ Mapeamento licença → consultor (titular)
  const LICENSE_MAP = {
    'GPP-PORTO-001': 'Manuel Oliveira',
    'GPP-PORTO-002': 'João Sousa',
    'GPP-PORTO-003': 'Francisco Santos',
    'GPP-PORTO-004': 'Rosário Costa',
    'GPP-PORTO-005': 'Dalila Cunha',
    'GPP-PORTO-006': 'Rui Quelhas'
  };

  // Forçar sempre 1 consultor (titular). Para futuro modo equipa, coloque false.
  const STRICT_SINGLE = true;

  function safeParse(raw){
    try{ return JSON.parse(raw); }catch(e){ return null; }
  }

  function readTrim(key){
    try{
      return String(localStorage.getItem(key) || '').trim();
    }catch(e){
      return '';
    }
  }

  function getLicenseKey(){
    // 1) chave direta (preferida)
    const direct = readTrim(LICENSE_KEY);
    if(direct) return direct.toUpperCase();

    // 2) fallback: tentar obter do estado (gpp_license_state_v1)
    try{
      const st = safeParse(localStorage.getItem(LIC_STATE_KEY) || '');
      const lk = st && st.license_key ? String(st.license_key).trim() : '';
      if(lk) return lk.toUpperCase();
    }catch(e){}

    return '';
  }

  function getConsultorNome(){
    const n = readTrim(CONSULTOR_NOME_KEY);
    return n ? n : '';
  }

  function uid(){
    return 'c_' + Date.now() + '_' + Math.floor(Math.random()*1000);
  }

  function normalizeList(list){
    if(!Array.isArray(list)) return [];
    return list.map((c, idx)=>{
      if(typeof c === 'string'){
        return { id: 'c_' + idx + '_' + Date.now(), nome: c, ativo: true };
      }
      if(c && typeof c === 'object'){
        return {
          id: c.id || ('c_' + idx + '_' + Date.now()),
          nome: (c.nome || c.name || '').trim(),
          ativo: c.ativo !== false,
          license: (c.license || '').trim()
        };
      }
      return null;
    }).filter(x => x && x.nome);
  }

  function defaultOwnerName(){
    // 1) prioridade máxima: nome vindo do endpoint/ativação
    const byKey = getConsultorNome();
    if(byKey) return byKey;

    // 2) senão, tentar via mapa licença → nome
    const lk = getLicenseKey();
    if(lk && LICENSE_MAP[lk]) return LICENSE_MAP[lk];

    // 3) fallback opcional: perfil antigo (caso exista)
    try{
      const p1 = safeParse(localStorage.getItem('gpp_profile_v1') || '');
      if(p1 && p1.nome) return String(p1.nome).trim();
    }catch(e){}

    return 'Consultor';
  }

  function buildSingleList(){
    const lk = getLicenseKey();
    const nome = defaultOwnerName();
    return [{
      id: 'lic_' + (lk || uid()),
      nome,
      ativo: true,
      license: lk || ''
    }];
  }

  function load(){
    if(STRICT_SINGLE){
      return buildSingleList();
    }

    // Caso futuro: modo equipa
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = safeParse(raw);
      const norm = normalizeList(parsed);
      if(norm.length) return norm;
    }catch(e){}
    return buildSingleList();
  }

  function saveAll(list){
    const norm = normalizeList(list);
    const finalList = STRICT_SINGLE ? buildSingleList() : (norm.length ? norm : buildSingleList());
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalList));
    }catch(e){}
    window.CONSULTANTS_CONFIG = finalList.slice();
    return finalList;
  }

  // Estado em memória
  let _list = load();

  // Persistir de imediato para garantir consistência entre módulos
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_list));
  }catch(e){}
  window.CONSULTANTS_CONFIG = _list.slice();

  // API pública
  window.GPPConsultores = {
    getAll: function(){ return _list.slice(); },
    getAtivos: function(){ return _list.filter(c => c && c.ativo); },
    saveAll: function(list){ _list = saveAll(list); return _list.slice(); },
    getOwnerName: function(){ return defaultOwnerName(); },
    getLicenseKey: function(){ return getLicenseKey(); },
    ensure: function(){
      _list = load();
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(_list)); }catch(e){}
      window.CONSULTANTS_CONFIG = _list.slice();
      return _list.slice();
    }
  };
})();

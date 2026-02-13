/* Garvetur Porto Pro — config-consultores.js (v1.2.0)
   Objetivo: garantir que a app mostra SEMPRE o nome do titular da licença (modo 1 consultor).

   Fontes (por ordem):
   1) gpp_consultor_nome_v1 (vindo do endpoint)
   2) LICENSE_MAP (licença -> nome)
   3) gpp_profile_v1.nome (fallback)
*/
(function(){
  'use strict';

  const STORAGE_KEY = 'gpp_consultores_v1';
  const LICENSE_KEY = 'gpp_license_key_v1';
  const LIC_STATE_KEY = 'gpp_license_state_v1';
  const CONSULTOR_NOME_KEY = 'gpp_consultor_nome_v1';

  // ✅ Licença → Titular
  const LICENSE_MAP = {
    'GPP-PORTO-001': 'Manuel Oliveira',
    'GPP-PORTO-002': 'João Sousa',
    'GPP-PORTO-003': 'Francisco Santos',
    'GPP-PORTO-004': 'Rosário Costa',
    'GPP-PORTO-005': 'Dalila Cunha',
    'GPP-PORTO-006': 'Rui Quelhas'
  };

  function safeParse(raw){
    try{ return JSON.parse(raw); }catch(e){ return null; }
  }
  function readTrim(key){
    try{ return String(localStorage.getItem(key)||'').trim(); }catch(e){ return ''; }
  }

  function getLicenseKey(){
    // 1) chave direta
    const direct = readTrim(LICENSE_KEY);
    if(direct) return direct.toUpperCase();

    // 2) fallback: estado
    const st = safeParse(readTrim(LIC_STATE_KEY));
    if(st && st.license_key) return String(st.license_key).trim().toUpperCase();

    return '';
  }

  function getOwnerName(){
    // 1) nome do endpoint
    const n = readTrim(CONSULTOR_NOME_KEY);
    if(n) return n;

    // 2) por licença
    const lk = getLicenseKey();
    if(lk && LICENSE_MAP[lk]) return LICENSE_MAP[lk];

    // 3) fallback: perfil antigo
    const p = safeParse(readTrim('gpp_profile_v1'));
    if(p && p.nome) return String(p.nome).trim();

    return 'Consultor';
  }

  function buildSingleList(){
    const lk = getLicenseKey();
    const nome = getOwnerName();
    return [{
      id: 'lic_' + (lk || Date.now()),
      nome,
      ativo: true,
      license: lk || ''
    }];
  }

  // Construir e publicar config global
  const list = buildSingleList();

  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }catch(e){}

  window.CONSULTANTS_CONFIG = list.slice();

  window.GPPConsultores = {
    getAll: function(){ return list.slice(); },
    getAtivos: function(){ return list.filter(c => c && c.ativo); },
    getOwnerName: function(){ return getOwnerName(); },
    getLicenseKey: function(){ return getLicenseKey(); }
  };
})();

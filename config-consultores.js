
/* Garvetur Porto Pro — config-consultores.js (v1.3.0)
   ✅ Modo DUAL:
   - ADMIN (Cockpit / GitHub master): mostra TODOS os consultores (não força "1 consultor")
   - LICENÇA (localhost:8000): força 1 consultor (titular da licença)

   Regras de modo:
   - Se location.hostname === 'localhost' e location.port === '8000'  -> MODO LICENÇA
   - Caso contrário -> MODO ADMIN

   Chaves:
   - gpp_consultores_v1        (lista equipa)
   - gpp_license_key_v1        (licença)
   - gpp_license_state_v1      (estado)
   - gpp_consultor_nome_v1     (nome titular - vindo do endpoint)
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

  // ✅ Lista total de consultores (ADMIN) — mantenha aqui o "master"
  const MASTER_CONSULTORES = [
    { id:'GPP-PORTO-001', nome:'Manuel Oliveira', ativo:true },
    { id:'GPP-PORTO-002', nome:'João Sousa', ativo:true },
    { id:'GPP-PORTO-003', nome:'Francisco Santos', ativo:true },
    { id:'GPP-PORTO-004', nome:'Rosário Costa', ativo:true },
    { id:'GPP-PORTO-005', nome:'Dalila Cunha', ativo:true },
    { id:'GPP-PORTO-006', nome:'Rui Quelhas', ativo:true }
  ];

  function safeParse(raw){ try{ return JSON.parse(raw); }catch(e){ return null; } }
  function readTrim(key){ try{ return String(localStorage.getItem(key)||'').trim(); }catch(e){ return ''; } }

  function isLicenseMode(){
    // MODO LICENÇA só no vosso ambiente: http://localhost:8000
    return (location.hostname === 'localhost' || location.hostname === '127.0.0.1') && String(location.port||'') === '8000';
  }

  function getLicenseKey(){
    const direct = readTrim(LICENSE_KEY);
    if(direct) return direct.toUpperCase();

    const st = safeParse(readTrim(LIC_STATE_KEY));
    if(st && st.license_key) return String(st.license_key).trim().toUpperCase();

    return '';
  }

  function getOwnerName(){
    // 1) nome vindo do endpoint
    const n = readTrim(CONSULTOR_NOME_KEY);
    if(n) return n;

    // 2) por licença
    const lk = getLicenseKey();
    if(lk && LICENSE_MAP[lk]) return LICENSE_MAP[lk];

    // 3) fallback
    return 'Consultor';
  }

  function normalizeTeam(list){
    if(!Array.isArray(list)) return [];
    return list.map((c, idx)=>{
      if(typeof c === 'string'){
        return { id:'c_'+idx+'_'+Date.now(), nome:c, ativo:true };
      }
      if(c && typeof c === 'object'){
        return {
          id: c.id || ('c_'+idx+'_'+Date.now()),
          nome: String(c.nome || c.name || '').trim(),
          ativo: c.ativo !== false,
          license: String(c.license || '').trim()
        };
      }
      return null;
    }).filter(x => x && x.nome);
  }

  function buildSingle(){
    const lk = getLicenseKey();
    return [{
      id: 'lic_' + (lk || Date.now()),
      nome: getOwnerName(),
      ativo: true,
      license: lk || ''
    }];
  }

  function loadAdminTeam(){
    // ADMIN: nunca “destruir” a lista se existir; apenas garantir mínimo
    const existing = safeParse(readTrim(STORAGE_KEY));
    const norm = normalizeTeam(existing);

    if(norm.length) return norm;

    // Se não existir nada, usa o master (e guarda)
    const seed = MASTER_CONSULTORES.map(c => ({...c}));
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); }catch(e){}
    return seed;
  }

  // ---- MAIN ----
  const LICENSE_MODE = isLicenseMode();
  const list = LICENSE_MODE ? buildSingle() : loadAdminTeam();

  // Em modo LICENÇA, garantimos que a lista fica sempre 1 consultor (titular)
  if(LICENSE_MODE){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }catch(e){}
  }

  // Config global (consumido pelos módulos)
  window.CONSULTANTS_CONFIG = list.slice();

  // API
  window.GPPConsultores = {
    mode: LICENSE_MODE ? 'LICENSE' : 'ADMIN',
    getAll: function(){ return list.slice(); },
    getAtivos: function(){ return list.filter(c => c && c.ativo); },
    getOwnerName: function(){ return getOwnerName(); },
    getLicenseKey: function(){ return getLicenseKey(); }
  };

})();

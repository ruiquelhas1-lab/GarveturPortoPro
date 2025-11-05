# Garvetur Porto Pro — Protótipo (GitHub Pages)

Este repositório publica uma **página única** (HTML) com um **Mapa Leaflet** e **lista lateral** que lê o GeoJSON público:

```
https://ruiquelhas1-lab.github.io/Mapa-Porto/data/empreendimentos.geojson
```

## 🚀 Publicar no GitHub Pages

1) **Criar repositório** novo (ex.: `GarveturPortoPro`).  
2) **Upload** do ficheiro `index.html` (deste pacote) para a **raiz** do repositório.  
3) Em **Settings → Pages**:  
   - Source: **Deploy from a branch**  
   - Branch: **main** (/**root**) → **Save**  
4) Abra o URL que o GitHub gera (ex.: `https://<utilizador>.github.io/GarveturPortoPro/`).

> Se preferir, pode manter o nome do repositório como quiser; o importante é que o ficheiro se chame **`index.html`** e esteja **na raiz**.

## 🧭 Utilização

- Campo **URL do GeoJSON** permite trocar a fonte (fica **memorizado** em `localStorage`).  
- **Recarregar**: volta a ler os dados e redesenha marcadores e lista.  
- **Filtros**: Todos / Em construção / Licenciado / Concluído.  
- **Pesquisar**: por nome, concelho ou promotor.  
- **Abrir no mapa**: foca o marcador escolhido.  
- **Abrir link**: abre a brochura/site do empreendimento.

## 📦 Dependências (CDN)

- Leaflet CSS/JS via **unpkg.com**  
- Tiles via **OpenStreetMap**

## ❗ Dicas / Erros comuns

- **Abrir localmente (file://)** pode pedir permissões de rede e causar “loop”.  
  Publique em **GitHub Pages** (recomendado) ou use um servidor local:
  ```bash
  python3 -m http.server 8000
  # depois abra: http://localhost:8000/index.html
  ```

- Se os pontos **não aparecerem**, verifique:
  - O URL do GeoJSON abre no browser (vê `{ "type": "FeatureCollection", ... }`).  
  - Filtro em **“Todos”** e pesquisa vazia.  
  - Forçar refresh (**Ctrl+F5** / **Cmd+Shift+R**).

---

© Garvetur Luxury Porto — Protótipo interno.

const pontos = [
      {nome:"Terminal São Paulo",     pessoas:5800, lat:-23.4965, lng:-47.4573, bairro:"Centro"},
      {nome:"Terminal Santo Antônio", pessoas:5200, lat:-23.5020, lng:-47.4420, bairro:"Santo Antônio"},
      {nome:"Terminal Sorocaba",      pessoas:4800, lat:-23.5010, lng:-47.4650, bairro:"Centro"},
      {nome:"Centro / Praça Álvares", pessoas:4100, lat:-23.5040, lng:-47.4590, bairro:"Centro"},
      {nome:"Shopping Iguatemi",      pessoas:3900, lat:-23.4830, lng:-47.4510, bairro:"Jd. Vergueiro"},
      {nome:"Pátio Shopping",         pessoas:3500, lat:-23.5060, lng:-47.4380, bairro:"Éden"},
      {nome:"FACENS",                 pessoas:2800, lat:-23.4900, lng:-47.4280, bairro:"Portal Paiquerê"},
      {nome:"Parque Campolim",        pessoas:2400, lat:-23.4750, lng:-47.4700, bairro:"Campolim"},
      {nome:"Vila Hortência",         pessoas:1900, lat:-23.5150, lng:-47.4430, bairro:"Vila Hortência"},
      {nome:"Éden",                   pessoas:1600, lat:-23.5080, lng:-47.4250, bairro:"Éden"},
      {nome:"Wanel Ville",            pessoas:1400, lat:-23.4870, lng:-47.4800, bairro:"Wanel Ville"},
      {nome:"Aparecidinha",           pessoas:1200, lat:-23.4680, lng:-47.4640, bairro:"Aparecidinha"},
    ];

    pontos.forEach(p => {
      p.energia  = parseFloat((p.pessoas * 0.0016).toFixed(2));
      p.co2      = parseFloat((p.energia * 0.233 * 30).toFixed(1));
      p.economia = Math.round(p.energia * 365 * 0.75);
      p.score    = Math.round((p.pessoas / 100) * 0.6 + p.energia * 10 * 0.4);
      p.viab     = p.pessoas >= 4000 ? "Alta" : p.pessoas >= 2500 ? "Média" : "Regular";
    });

    const ordenados = [...pontos].sort((a,b) => b.score - a.score);
    const maxScore  = ordenados[0].score;

    const totPessoas = pontos.reduce((s,p) => s + p.pessoas, 0);
    const totEnergia = pontos.reduce((s,p) => s + p.energia, 0).toFixed(1);
    const totCO2     = Math.round(pontos.reduce((s,p) => s + p.co2, 0));
    const totEcon    = pontos.reduce((s,p) => s + p.economia, 0);

    document.getElementById('metricas-gerais').innerHTML = `
      <div class="metrica"><div class="metrica-label">Pontos mapeados</div><div class="metrica-valor">${pontos.length}</div></div>
      <div class="metrica"><div class="metrica-label">Pessoas/dia</div><div class="metrica-valor">${totPessoas.toLocaleString('pt-BR')}</div></div>
      <div class="metrica"><div class="metrica-label">Energia total/dia</div><div class="metrica-valor">${totEnergia}<span class="metrica-unit"> kWh</span></div></div>
      <div class="metrica"><div class="metrica-label">CO₂ evitado/mês</div><div class="metrica-valor">${totCO2.toLocaleString('pt-BR')}<span class="metrica-unit"> kg</span></div></div>
      <div class="metrica"><div class="metrica-label">Economia anual</div><div class="metrica-valor">R$${totEcon.toLocaleString('pt-BR')}</div></div>
    `;

    function abrirAba(id, btn) {
      document.querySelectorAll('.sim-painel').forEach(p => p.classList.remove('ativo'));
      document.querySelectorAll('.sim-tab').forEach(t => t.classList.remove('ativo'));
      document.getElementById('painel-' + id).classList.add('ativo');
      btn.classList.add('ativo');
      if (id === 'mapa' && !mapaInit) iniciarMapa();
      if (id === 'dashboard' && !graficosInit) iniciarGraficos();
      if (id === 'ranking' && !rankingInit) iniciarRanking();
    }

    // ===================== MAPA =====================
    let mapaInit = false, markers = [], mapa;

    function iniciarMapa() {
      mapaInit = true;
      mapa = L.map('mapa').setView([-23.496, -47.458], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapa);

      const lista = document.getElementById('lista-pontos');

      pontos.forEach((p, idx) => {

        const cor = p.viab === 'Alta'
          ? '#7cc9a3'
          : p.viab === 'Média'
          ? '#EF9F27'
          : '#5b7480';

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${cor};border:2.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14,14],
          iconAnchor: [7,7]
        });

        const m = L.marker([p.lat, p.lng], {icon}).addTo(mapa);

        m.bindPopup(`
          <b style="font-size:13px">${p.nome}</b><br>
          <span style="font-size:12px;color:#555">${p.bairro}</span><br><br>
          <span style="font-size:12px"><b>${p.pessoas.toLocaleString('pt-BR')}</b> pessoas/dia</span><br>
          <span style="font-size:12px"><b>${p.energia} kWh</b>/dia estimados</span><br>
          <span style="font-size:12px"><b>${p.co2} kg</b> CO₂ evitado/mês</span><br>
          <span style="font-size:12px"><b>R$ ${p.economia.toLocaleString('pt-BR')}</b>/ano economizados</span>
        `);

        markers.push(m);

        const card = document.createElement('div');
        card.className = 'ponto-card';
        card.id = `pc-${idx}`;

        const badgeClass = p.viab === 'Alta'
          ? 'badge-alta'
          : p.viab === 'Média'
          ? 'badge-media'
          : 'badge-regular';

        card.innerHTML = `
          <div class="ponto-nome">${p.nome}</div>
          <div class="ponto-meta">${p.bairro} · ${p.pessoas.toLocaleString('pt-BR')} pess./dia</div>
          <div class="ponto-meta">${p.energia} kWh/dia</div>
          <span class="badge-viab ${badgeClass}">Viabilidade ${p.viab}</span>
        `;

        card.onclick = () => {
          document.querySelectorAll('.ponto-card').forEach(c => c.classList.remove('selecionado'));
          card.classList.add('selecionado');
          mapa.setView([p.lat, p.lng], 15);
          markers[idx].openPopup();
        };

        lista.appendChild(card);
      });
    }

    window.addEventListener('load', () => iniciarMapa());

    // GRÁFICOS
    let graficosInit = false;

    function iniciarGraficos() {

      graficosInit = true;

      const labels = ordenados.map(p =>
        p.nome.length > 16
          ? p.nome.slice(0,14)+'…'
          : p.nome
      );

      const optsBase = (cor) => ({
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'rgba(255,255,255,0.4)',
              font: { size: 10 }
            },
            grid: {
              display: false
            }
          },
          y: {
            ticks: {
              color: 'rgba(255,255,255,0.4)',
              font: { size: 10 }
            },
            grid: {
              color: 'rgba(255,255,255,0.05)'
            }
          }
        }
      });

      new Chart(document.getElementById('graficoEnergia'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: ordenados.map(p => p.energia),
            backgroundColor: '#7cc9a3',
            borderRadius: 4
          }]
        },
        options: optsBase('#7cc9a3')
      });

      new Chart(document.getElementById('graficoFluxo'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: ordenados.map(p => p.pessoas),
            backgroundColor: '#6bb6e8',
            borderRadius: 4
          }]
        },
        options: optsBase('#6bb6e8')
      });

      new Chart(document.getElementById('graficoCO2'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: ordenados.map(p => p.co2),
            backgroundColor: '#EF9F27',
            borderRadius: 4
          }]
        },
        options: optsBase('#EF9F27')
      });

      new Chart(document.getElementById('graficoEcon'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: ordenados.map(p => p.economia),
            backgroundColor: '#5b7480',
            borderRadius: 4
          }]
        },
        options: optsBase('#5b7480')
      });
    }

    let rankingInit = false;

    function iniciarRanking() {
      rankingInit = true;

      const tbody = document.getElementById('corpo-ranking');

      ordenados.forEach((p, i) => {

        const rClass = i === 0
          ? 'r1'
          : i === 1
          ? 'r2'
          : i === 2
          ? 'r3'
          : '';

        const bClass = p.viab === 'Alta'
          ? 'badge-alta'
          : p.viab === 'Média'
          ? 'badge-media'
          : 'badge-regular';

        const pct = Math.round((p.score / maxScore) * 100);

        tbody.innerHTML += `
          <tr>
            <td><span class="rank-num ${rClass}">${i+1}</span></td>

            <td>
              <strong style="color:#fff">${p.nome}</strong><br>
              <span style="font-size:11px;color:rgba(255,255,255,0.4)">
                ${p.bairro}
              </span>
            </td>

            <td>${p.pessoas.toLocaleString('pt-BR')}</td>
            <td>${p.energia} kWh</td>
            <td>${p.co2} kg</td>

            <td>
              <span class="badge-viab ${bClass}">
                Viab. ${p.viab}
              </span>
            </td>

            <td>
              <div style="font-size:12px;font-weight:600;color:#7cc9a3;margin-bottom:4px">
                ${p.score}
              </div>

              <div class="barra-wrap">
                <div class="barra" style="width:${pct}%"></div>
              </div>
            </td>
          </tr>
        `;
      });
    }
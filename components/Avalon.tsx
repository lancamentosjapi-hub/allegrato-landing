'use client';

/**
 * Avalon Residencial — porte 1:1 de "Avalon.html" (HTML standalone) para React.
 * CSS em app/avalon/avalon.css, assets em public/avalon.
 *
 * Comportamentos portados do <script> do fonte: menu mobile, abas de planta
 * (o data-p aponta o painel, não a posição da aba), reveal on scroll e o
 * formulário que abre o WhatsApp com a mensagem pronta.
 */

import React, { useRef, useState } from 'react';
import { parseStyle, useReveal, waHref } from '@/lib/dc-runtime';

const WHATSAPP = '5511926143393';
const EMP = 'Avalon Residencial';
const FONE_FORMATADO =
  '+' + WHATSAPP.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '$1 $2 $3-$4');
const waLink = (msg: string) => waHref(WHATSAPP, msg);
const waFloatHref = waLink(`Olá! Tenho interesse no ${EMP} em Jundiaí.`);

export default function Avalon() {
  const [navOpen, setNavOpen] = useState(false);
  const [planta, setPlanta] = useState(0);
  const [sent, setSent] = useState(false);
  const nomeRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const interesseRef = useRef<HTMLSelectElement>(null);

  useReveal('[data-reveal]', 'in', 0.15);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = nomeRef.current?.value.trim() || '';
    const tel = telRef.current?.value.trim() || '';
    const interesse = interesseRef.current?.value || '';
    window.open(
      waLink(`Olá! Meu nome é ${nome}. ${interesse}. Meu WhatsApp: ${tel}.`),
      '_blank',
      'noopener',
    );
    setSent(true);
  };

  return (
    <>
      <header>
        <nav className="wrap">
          <a href="#topo" className="logo">
            <img style={parseStyle('height:56px;width:auto;border-radius:6px')} src="/avalon/a002.png" alt="Avalon Residencial" />
          </a>
          <div className={'navlinks' + (navOpen ? ' open' : '')} id="nav" onClick={() => setNavOpen(false)}>
            <a href="#residencial">
              O Residencial
            </a>
            <a href="#diferenciais">
              Diferenciais
            </a>
            <a href="#plantas">
              Plantas
            </a>
            <a href="#lazer">
              Lazer
            </a>
            <a href="#localizacao">
              Localização
            </a>
            <a href="#contato" className="btn btn-copper">
              Fale conosco
            </a>
          </div>
          <button type="button" className="burger" aria-label="Menu" aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)}>
            ☰
          </button>
        </nav>
      </header>
      {/* HERO */}
      <section style={parseStyle('padding:0')} className="hero" id="topo">
        <div className="wrap">
          <div className="hero-inner" data-reveal>
            <p className="eyebrow">
              Avalon Residencial · F A Oliva · Jundiaí/SP
            </p>
            <h1>
              Encontre o
              <br />
              seu{' '}
              <em>
                lugar
              </em>
              .
            </h1>
            <p className="hero-sub">
              Apartamentos de 78,5 e 108 m², 2 e 3 dormitórios com suíte, com 19 áreas de lazer e piscina coberta e aquecida — um refúgio urbano planejado com a excelência F A Oliva.
            </p>
            <div className="chips">
              <span className="chip">
                2 e 3 dorms com suíte
              </span>
              <span className="chip">
                19 áreas de lazer
              </span>
              <span className="chip">
                Piscina aquecida
              </span>
              <span className="chip">
                Box privativo na garagem
              </span>
              <span className="chip">
                Vila Hortolândia · Jundiaí
              </span>
            </div>
            <div className="hero-cta">
              <a href="#contato" className="btn btn-copper">
                Quero saber mais
              </a>
              <a href="#plantas" className="btn btn-ghost">
                Ver plantas
              </a>
            </div>
          </div>
        </div>
        <p className="hero-note">
          Perspectiva artística, meramente ilustrativa. *Incluso box na garagem, com áreas de 3 a 5 m². Consulte o Memorial Descritivo.
        </p>
      </section>
      {/* STATS */}
      <section className="stats">
        <div className="wrap">
          <div className="stat">
            <b>
              216
            </b>
            <span>
              Unidades · 4 torres
            </span>
          </div>
          <div className="stat">
            <b>
              78,5–146 m²
            </b>
            <span>
              Metragens
            </span>
          </div>
          <div className="stat">
            <b>
              19
            </b>
            <span>
              Áreas de lazer
            </span>
          </div>
          <div className="stat">
            <b>
              359
            </b>
            <span>
              Vagas
            </span>
          </div>
        </div>
      </section>
      {/* SOBRE */}
      <section className="sobre" id="residencial">
        <div className="wrap grid2">
          <div data-reveal>
            <p className="eyebrow">
              O Residencial
            </p>
            <p className="sel">
              2 e 3 dorms · todos com suíte · Jundiaí/SP
            </p>
            <h2 style={parseStyle('margin-top:8px')}>
              Conforto e exclusividade: o lugar que você buscava para chamar de lar.
            </h2>
            <p className="lead">
              O Avalon Residencial foi desenvolvido com cuidado em cada detalhe, convidando você e sua família a desfrutar de um refúgio urbano planejado com a excelência F A Oliva. Localização privilegiada, sofisticação e qualidade de vida — uma nova referência em Jundiaí.
            </p>
            <ul className="difflist">
              <li>
                <span className="ar">
                  →
                </span>
                <span>
                  <b>
                    Personalização flexível
                  </b>
                  {' '}— sala ampliada ou 1, 2 ou 3 suítes (blocos 1 e 4).
                </span>
              </li>
              <li>
                <span className="ar">
                  →
                </span>
                <span>
                  <b>
                    Box privativo na garagem
                  </b>
                  {' '}para armazenamento, com 3 a 5 m².
                </span>
              </li>
              <li>
                <span className="ar">
                  →
                </span>
                <span>
                  <b>
                    Espaço gourmet na varanda
                  </b>
                  {' '}com infraestrutura para churrasqueira.
                </span>
              </li>
              <li>
                <span className="ar">
                  →
                </span>
                <span>
                  <b>
                    Lazer completo
                  </b>
                  {' '}— 19 áreas, com piscina coberta e aquecida.
                </span>
              </li>
            </ul>
          </div>
          <div data-reveal>
            <img style={parseStyle('width:100%;border-radius:16px;box-shadow:0 20px 46px rgba(43,38,34,.3)')} src="/avalon/a001.jpg" alt="Fachada do Avalon Residencial ao entardecer" />
          </div>
        </div>
      </section>
      {/* DIFERENCIAIS */}
      <section className="dif" id="diferenciais">
        <div className="wrap">
          <div style={parseStyle('max-width:60ch')} data-reveal>
            <p className="eyebrow">
              Diferenciais dos apartamentos
            </p>
            <h2>
              Detalhes construtivos pensados para o seu conforto.
            </h2>
          </div>
          <div className="dif-grid">
            <div className="dif-card" data-reveal>
              <div className="ic">
                🍳
              </div>
              <h3>
                Preparado para cozinha ilha
              </h3>
              <p>
                Infraestrutura com tubulação seca para ilha com fogão de indução e depurador.¹
              </p>
            </div>
            <div className="dif-card" data-reveal>
              <div className="ic">
                ❄️
              </div>
              <h3>
                Varanda técnica
              </h3>
              <p>
                Varanda técnica para instalação das condensadoras de ar-condicionado.²
              </p>
            </div>
            <div className="dif-card" data-reveal>
              <div className="ic">
                🔥
              </div>
              <h3>
                Espaço gourmet na varanda
              </h3>
              <p>
                Infraestrutura para churrasqueira a carvão, com pontos de água e esgoto.
              </p>
            </div>
            <div className="dif-card" data-reveal>
              <div className="ic">
                🚿
              </div>
              <h3>
                Aquecimento a gás
              </h3>
              <p>
                Água aquecida a gás para a torneira da cozinha e chuveiros.³
              </p>
            </div>
            <div className="dif-card" data-reveal>
              <div className="ic">
                🛋️
              </div>
              <h3>
                Opção de sala ampliada
              </h3>
              <p>
                Possibilidade de alteração na planta para até 3 suítes.⁵
              </p>
            </div>
            <div className="dif-card" data-reveal>
              <div className="ic">
                🧰
              </div>
              <h3>
                Box privativo na garagem
              </h3>
              <p>
                Box privativo para armazenamento adicional, com metragens de 3 a 5 m².⁶
              </p>
            </div>
          </div>
          <p className="foot-notes">
            Também: Sistema VDI (tubulação seca para dados), tubulação flexível de água Pex/Pert, banheiros com nicho embutido, varanda com piso nivelado e integração com a área interna, janelas tipo persiana com Blackout e possibilidade de ar-condicionado cassete ou split na sala e nos quartos. 1 a 6 — Consulte o Memorial Descritivo para condições e limitações técnicas.
          </p>
        </div>
      </section>
      {/* PLANTAS */}
      <section className="plantas" id="plantas">
        <div className="wrap">
          <div style={parseStyle('max-width:60ch')} data-reveal>
            <p className="eyebrow">
              Plantas & Opções de unidade
            </p>
            <h2>
              Escolha a planta da sua vida.
            </h2>
            <p className="lead">
              De 78,5 m² a 146 m², com opções de personalização. Todas com box privativo na garagem. Clique nas abas para conhecer cada opção.
            </p>
          </div>
          <div className="tabs" id="tabs">
            <button type="button" className={'tab' + (planta === 0 ? ' active' : '')} data-p="0" onClick={() => setPlanta(0)}>
              78,5 m² · 2 dorms
            </button>
            <button type="button" className={'tab' + (planta === 1 ? ' active' : '')} data-p="1" onClick={() => setPlanta(1)}>
              108 m² · 2 suítes
            </button>
            <button type="button" className={'tab' + (planta === 2 ? ' active' : '')} data-p="2" onClick={() => setPlanta(2)}>
              108 m² · 3 suítes
            </button>
            <button type="button" className={'tab' + (planta === 3 ? ' active' : '')} data-p="3" onClick={() => setPlanta(3)}>
              Garden 106 m²
            </button>
            <button type="button" className={'tab' + (planta === 4 ? ' active' : '')} data-p="4" onClick={() => setPlanta(4)}>
              Garden 146 m²
            </button>
          </div>
          <div className={'planta-panel' + (planta === 0 ? ' active' : '')}>
            <img className="planta-img" src="/avalon/a003.jpg" alt="Planta 78,5 m² · 2 dormitórios" />
            <div className="planta-meta">
              <p className="tname">
                Opção de unidade
              </p>
              <p className="tsize">
                78,5 m²
              </p>
              <ul>
                <li>
                  2 dormitórios, sendo 1 suíte
                </li>
                <li>
                  1 vaga · box privativo
                </li>
                <li>
                  Varanda técnica
                </li>
                <li>
                  Sala de estar e jantar integradas
                </li>
              </ul>
              <a href="#contato" className="btn btn-copper">
                Quero esta planta
              </a>
            </div>
          </div>
          <div className={'planta-panel' + (planta === 1 ? ' active' : '')}>
            <img className="planta-img" src="/avalon/a004.jpg" alt="Planta 108 m² · 2 suítes" />
            <div className="planta-meta">
              <p className="tname">
                Opção de unidade · 105 m²
              </p>
              <p className="tsize">
                108 m²
              </p>
              <ul>
                <li>
                  2 suítes · 2 vagas · box privativo
                </li>
                <li>
                  Varanda técnica e varanda gourmet
                </li>
                <li>
                  Living amplo integrado
                </li>
                <li>
                  Personalização disponível
                </li>
              </ul>
              <a href="#contato" className="btn btn-copper">
                Quero esta planta
              </a>
            </div>
          </div>
          <div className={'planta-panel' + (planta === 2 ? ' active' : '')}>
            <img className="planta-img" src="/avalon/a005.jpg" alt="Planta 108 m² · 3 suítes" />
            <div className="planta-meta">
              <p className="tname">
                Opção de unidade · 105 m²
              </p>
              <p className="tsize">
                108 m²
              </p>
              <ul>
                <li>
                  3 suítes · 2 vagas · box privativo
                </li>
                <li>
                  Personalização para até 3 suítes⁵
                </li>
                <li>
                  Varanda gourmet
                </li>
                <li>
                  Blocos 1 e 4
                </li>
              </ul>
              <a href="#contato" className="btn btn-copper">
                Quero esta planta
              </a>
            </div>
          </div>
          <div className={'planta-panel' + (planta === 3 ? ' active' : '')}>
            <img className="planta-img" src="/avalon/a006.jpg" alt="Unidade Garden 106 m²" />
            <div className="planta-meta">
              <p className="tname">
                Unidade Garden · Blocos 2 e 3
              </p>
              <p className="tsize">
                106 m²
              </p>
              <ul>
                <li>
                  2 dormitórios · 1 vaga · box privativo
                </li>
                <li>
                  Área descoberta privativa: 28,30 m²
                </li>
                <li>
                  Térreo com jardim
                </li>
                <li>
                  103,8 m² de área privativa
                </li>
              </ul>
              <a href="#contato" className="btn btn-copper">
                Quero esta planta
              </a>
            </div>
          </div>
          <div className={'planta-panel' + (planta === 4 ? ' active' : '')}>
            <img className="planta-img" src="/avalon/a007.jpg" alt="Unidade Garden 146 m²" />
            <div className="planta-meta">
              <p className="tname">
                Unidade Garden · Bloco 1
              </p>
              <p className="tsize">
                146 m²
              </p>
              <ul>
                <li>
                  2 suítes · 2 vagas · box privativo
                </li>
                <li>
                  Área descoberta privativa: 38,10 m²
                </li>
                <li>
                  A maior planta do Avalon
                </li>
                <li>
                  143,1 m² de área privativa
                </li>
              </ul>
              <a href="#contato" className="btn btn-copper">
                Quero esta planta
              </a>
            </div>
          </div>
          <p className="disc">
            Ilustrações artísticas, meramente ilustrativas. Móveis, utensílios e itens de decoração não fazem parte do Memorial Descritivo. Metragens de 105 m² e 75,5 m² de área privativa; 78,5 m² e 108 m² já incluem o box na garagem (3 a 5 m²). Consulte o Memorial Descritivo.
          </p>
        </div>
      </section>
      {/* LAZER */}
      <section className="lazer" id="lazer">
        <div className="wrap">
          <div style={parseStyle('max-width:60ch')} data-reveal>
            <p className="eyebrow">
              Lazer completo · 19 áreas
            </p>
            <h2>
              Tudo o que a sua família precisa, sem sair de casa.
            </h2>
          </div>
          <div className="lazer-grid">
            <div style={parseStyle("background-image:url('/avalon/a008.jpg')")} className="lz big">
              <span>
                Piscina coberta e aquecida
              </span>
            </div>
            <div style={parseStyle("background-image:url('/avalon/a009.jpg')")} className="lz">
              <span>
                Beach Tennis
              </span>
            </div>
            <div style={parseStyle("background-image:url('/avalon/a010.jpg')")} className="lz">
              <span>
                Quadra recreativa
              </span>
            </div>
            <div style={parseStyle("background-image:url('/avalon/a011.jpg')")} className="lz">
              <span>
                Academia
              </span>
            </div>
            <div style={parseStyle("background-image:url('/avalon/a012.jpg')")} className="lz">
              <span>
                Churrasqueira Gourmet
              </span>
            </div>
            <div style={parseStyle("background-image:url('/avalon/a013.jpg')")} className="lz">
              <span>
                Salão de festas
              </span>
            </div>
            <div style={parseStyle("background-image:url('/avalon/a014.jpg')")} className="lz">
              <span>
                Coworking
              </span>
            </div>
            <div style={parseStyle("background-image:url('/avalon/a015.jpg')")} className="lz">
              <span>
                Brinquedoteca
              </span>
            </div>
            <div style={parseStyle("background-image:url('/avalon/a016.jpg')")} className="lz">
              <span>
                Redário
              </span>
            </div>
            <div style={parseStyle("background-image:url('/avalon/a017.jpg')")} className="lz big">
              <span>
                Espaço Pet
              </span>
            </div>
          </div>
          <div className="lazer-list">
            <p>
              Salão de festas
            </p>
            <p>
              Salão de jogos
            </p>
            <p>
              Lounge externo
            </p>
            <p>
              Churrasqueira Bar com chopeira
            </p>
            <p>
              Churrasqueira Gourmet com forno de pizza
            </p>
            <p>
              Quadra recreativa
            </p>
            <p>
              Lounge de entrada
            </p>
            <p>
              Piscina adulto coberta e aquecida
            </p>
            <p>
              Piscina infantil coberta e aquecida
            </p>
            <p>
              Solarium descoberto
            </p>
            <p>
              Playground
            </p>
            <p>
              Academia
            </p>
            <p>
              Brinquedoteca
            </p>
            <p>
              Coworking
            </p>
            <p>
              Espaço Pet
            </p>
            <p>
              Beach Tennis
            </p>
            <p>
              Redário
            </p>
            <p>
              Praça Avalon
            </p>
          </div>
        </div>
      </section>
      {/* LOCALIZACAO */}
      <section className="loc" id="localizacao">
        <div className="wrap">
          <div style={parseStyle('max-width:60ch;margin-bottom:40px')} data-reveal>
            <p className="eyebrow">
              Localização
            </p>
            <h2>
              No coração de Jundiaí, perto de tudo.
            </h2>
            <p className="lead">
              O Avalon Residencial está em uma região com fácil acesso às principais avenidas e rodovias da cidade, cercado de comércios, serviços e conveniências — um endereço com grande potencial de valorização.
            </p>
          </div>
          <div className="loc-grid">
            <div data-reveal>
              <p className="addr">
                📍 Rua Maria José Maia de Toledo — Vila Hortolândia, Jundiaí/SP
              </p>
              <ul className="poi">
                <li>
                  Rodovia Anhanguera
                </li>
                <li>
                  Avenida 9 de Julho
                </li>
                <li>
                  Av. Prefeito Luiz Latorre
                </li>
                <li>
                  Av. Antônio Frederico Ozanan
                </li>
                <li>
                  Rua Itirapina
                </li>
              </ul>
              <a style={parseStyle('margin-top:26px')} href="https://www.google.com/maps/search/?api=1&query=Rua+Maria+Jose+Maia+de+Toledo,+Vila+Hortolandia,+Jundiai" target="_blank" rel="noopener" className="btn btn-dark">
                Ver no Google Maps →
              </a>
            </div>
            <div data-reveal>
              <img style={parseStyle('width:100%;border-radius:16px;box-shadow:0 16px 34px rgba(43,38,34,.22)')} src="/avalon/a018.jpg" alt="Vista aérea de Jundiaí, região do Avalon Residencial" />
            </div>
          </div>
        </div>
      </section>
      {/* CONSTRUTORA */}
      <section className="constr">
        <div className="wrap grid2">
          <div data-reveal>
            <p className="eyebrow">
              Quem constrói
            </p>
            <h2>
              F A Oliva: mais de 70 anos construindo confiança para morar bem.
            </h2>
            <p className="lead">
              Fundada em 1955, a F A Oliva é hoje uma das principais incorporadoras do interior de São Paulo. São mais de 9,5 mil unidades residenciais entregues em Jundiaí e outras cinco cidades da região — uma marca sólida, reconhecida pela qualidade dos produtos e pela entrega garantida de seus empreendimentos.
            </p>
            <blockquote className="quote">
              "Confiança para morar bem."
              <cite>
                F A Oliva — Incorporadora e Construtora
              </cite>
            </blockquote>
          </div>
          <div data-reveal>
            <div className="constr-stats">
              <div>
                <b>
                  71 anos
                </b>
                <span>
                  de história · desde 1955
                </span>
              </div>
              <div>
                <b>
                  +9,5 mil
                </b>
                <span>
                  unidades residenciais
                </span>
              </div>
              <div>
                <b>
                  +50
                </b>
                <span>
                  empreendimentos entregues
                </span>
              </div>
            </div>
            <img style={parseStyle('width:100%;border-radius:16px;margin-top:30px;box-shadow:0 16px 34px rgba(43,38,34,.18)')} src="/avalon/a018.jpg" alt="Vista aérea da região do Avalon Residencial, da F A Oliva" />
          </div>
        </div>
      </section>
      {/* FICHA TECNICA */}
      <section className="ficha">
        <div className="wrap">
          <div style={parseStyle('max-width:60ch')} data-reveal>
            <p className="eyebrow">
              Ficha técnica
            </p>
            <h2>
              216 unidades. 4 torres. Um bairro dentro do condomínio.
            </h2>
          </div>
          <div className="ficha-grid">
            <div className="ficha-card" data-reveal>
              <h3>
                O empreendimento
              </h3>
              <ul>
                <li>
                  Bloco 1: Térreo + 14 pavimentos tipo
                </li>
                <li>
                  Bloco 2: Térreo + 13 pavimentos tipo
                </li>
                <li>
                  Bloco 3: Térreo + 12 pavimentos tipo
                </li>
                <li>
                  Bloco 4: Térreo + 12 pavimentos tipo
                </li>
                <li>
                  2 elevadores por torre
                </li>
                <li>
                  4 apartamentos por pavimento
                </li>
              </ul>
            </div>
            <div className="ficha-card" data-reveal>
              <h3>
                As unidades
              </h3>
              <ul>
                <li>
                  106 un. de 105 m² · 3 dorms com suíte
                </li>
                <li>
                  100 un. de 75,5 m² · 2 dorms com suíte
                </li>
                <li>
                  2 Garden de 143,1 m² · Bloco 1
                </li>
                <li>
                  8 Garden de 103,8 m² · Blocos 2 e 3
                </li>
                <li>
                  Total: 216 unidades
                </li>
              </ul>
            </div>
            <div className="ficha-card" data-reveal>
              <h3>
                Vagas
              </h3>
              <ul>
                <li>
                  294 cobertas + 40 descobertas (moradores)
                </li>
                <li>
                  11 descobertas para visitantes
                </li>
                <li>
                  7 vagas PcD (3 cobertas + 4 descobertas)
                </li>
                <li>
                  3 de embarque e desembarque
                </li>
                <li>
                  4 de carga e descarga
                </li>
                <li>
                  Total: 359 vagas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* CONTATO */}
      <section className="contato" id="contato">
        <div className="wrap contato-grid">
          <div data-reveal>
            <p className="eyebrow">
              Não perca tempo
            </p>
            <h2>
              Fale comigo agora mesmo.
            </h2>
            <p className="lead">
              Preencha e receba a tabela de valores, plantas e condições atualizadas direto no seu WhatsApp. Atendimento rápido, sem compromisso.
            </p>
            <ul className="benef">
              <li>
                Tabela de valores e condições atualizadas
              </li>
              <li>
                Plantas e opções de personalização
              </li>
              <li>
                Resposta rápida pelo WhatsApp
              </li>
            </ul>
          </div>
          <div data-reveal>
            <div className="form-card">
              <div id="formView" style={sent ? { display: 'none' } : undefined}>
                <h3>
                  Receba mais informações
                </h3>
                <p className="sm">
                  Um consultor entra em contato com você.
                </p>
                <form id="leadForm" onSubmit={onSubmit}>
                  <div className="field">
                    <label>
                      Nome
                    </label>
                    <input ref={nomeRef} type="text" id="nome" placeholder="Seu nome" required />
                  </div>
                  <div className="field">
                    <label>
                      WhatsApp com DDD
                    </label>
                    <input ref={telRef} type="tel" id="tel" placeholder="(11) 90000-0000" required />
                  </div>
                  <div className="field">
                    <label>
                      Tenho interesse em
                    </label>
                    <select ref={interesseRef} id="interesse">
                      <option>
                        Tenho interesse no Avalon Residencial
                      </option>
                      <option>
                        Quero a planta de 78,5 m²
                      </option>
                      <option>
                        Quero a planta de 108 m²
                      </option>
                      <option>
                        Quero uma unidade Garden
                      </option>
                      <option>
                        Quero a tabela de valores
                      </option>
                      <option>
                        Quero agendar uma visita
                      </option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-copper">
                    Quero receber informações →
                  </button>
                  <p className="consent">
                    Ao enviar, você concorda em ser contatado sobre o Avalon Residencial, inclusive por WhatsApp. CRECI [INSERIR CRECI].
                  </p>
                </form>
              </div>
              <div className={'ok-msg' + (sent ? ' show' : '')} id="okMsg">
                <p className="big">
                  ✓ Recebido!
                </p>
                <p className="sm">
                  Abrimos o seu WhatsApp com a mensagem pronta — é só enviar. Nossa equipe responde em instantes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div className="foot-logo">
              <img style={parseStyle('height:70px;width:auto;border-radius:8px')} src="/avalon/a002.png" alt="Avalon Residencial" />
            </div>
            <div style={parseStyle('text-align:right')}>
              <p style={parseStyle('color:#fff;font-weight:600')}>
                Realização: F A Oliva
              </p>
              <p>
                Rua Maria José Maia de Toledo · Vila Hortolândia · Jundiaí/SP
              </p>
              <p>
                WhatsApp:{' '}
                <span id="footWa">{FONE_FORMATADO}</span>
              </p>
            </div>
          </div>
          <p className="legal">
            Perspectivas artísticas, meramente ilustrativas. Móveis, utensílios e itens de decoração não fazem parte do Memorial Descritivo. *Incluso box na garagem, com áreas de 3 a 5 m². Áreas privativas de 105 m² e 75,5 m²; unidades Garden de 143,1 m² e 103,8 m². Empreendimento sujeito a aprovação e registro de incorporação — [INSERIR DADOS DE INCORPORAÇÃO / Nº DE REGISTRO]. Realização: F A Oliva. CRECI [INSERIR]. Consulte o Memorial Descritivo.
          </p>
        </div>
      </footer>
      <a className="wa-float" id="waFloat" href={waFloatHref} target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.489-.917zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.017-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z">
          </path>
        </svg>
        {' '}Falar no WhatsApp{' '}
      </a>
    </>
  );
}

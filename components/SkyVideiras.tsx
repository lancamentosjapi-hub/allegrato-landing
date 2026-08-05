'use client';

/**
 * SKY Videiras — porte 1:1 de "SKY-Videiras.html" (HTML standalone) para React.
 * CSS em app/sky-videiras/sky-videiras.css, assets em public/sky-videiras.
 *
 * Comportamentos portados do <script> do fonte: menu mobile, abas de planta
 * (o data-p aponta o painel, não a posição da aba), reveal on scroll e o
 * formulário que abre o WhatsApp com a mensagem pronta.
 */

import React, { useRef, useState } from 'react';
import { parseStyle, useReveal, waHref } from '@/lib/dc-runtime';

const WHATSAPP = '5511926143393';
const EMP = 'SKY Videiras';
const FONE_FORMATADO =
  '+' + WHATSAPP.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '$1 $2 $3-$4');
const waLink = (msg: string) => waHref(WHATSAPP, msg);
const waFloatHref = waLink(`Olá! Tenho interesse no ${EMP} em Jundiaí.`);

export default function SkyVideiras() {
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
            <img style={parseStyle('height:48px;width:auto;filter:brightness(0) invert(1)')} src="/sky-videiras/a002.png" alt="SKY Videiras" />
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
            <a href="#contato" className="btn btn-gold">
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
              SEBEL Empreendimentos · Chegamos a Jundiaí
            </p>
            <h1>
              No horizonte
              <br />
              da sua{' '}
              <em>
                vida
              </em>
              .
            </h1>
            <p className="hero-sub">
              Apartamentos de 2 e 3 dormitórios, todos com suíte, de 56,96 m² a 83,31 m², com lazer completo no rooftop e vista para a Serra do Japi — no bairro mais desejado de Jundiaí.
            </p>
            <div className="chips">
              <span className="chip">
                Obras iniciadas
              </span>
              <span className="chip">
                Todos com suíte
              </span>
              <span className="chip">
                Lazer no rooftop
              </span>
              <span className="chip">
                Vaga demarcada
              </span>
              <span className="chip">
                Quintas das Videiras · SP
              </span>
            </div>
            <div className="hero-cta">
              <a href="#contato" className="btn btn-gold">
                Quero saber mais
              </a>
              <a href="#plantas" className="btn btn-ghost">
                Ver plantas
              </a>
            </div>
          </div>
        </div>
        <p className="hero-note">
          Perspectiva artística, preliminar, meramente ilustrativa. As áreas comuns serão entregues equipadas e decoradas conforme Memorial Descritivo.
        </p>
      </section>
      {/* STATS */}
      <section className="stats">
        <div className="wrap">
          <div className="stat">
            <b>
              5
            </b>
            <span>
              Plantas únicas
            </span>
          </div>
          <div className="stat">
            <b>
              56–83 m²
            </b>
            <span>
              Metragens
            </span>
          </div>
          <div className="stat">
            <b>
              2 e 3
            </b>
            <span>
              Dorms · c/ suíte
            </span>
          </div>
          <div className="stat">
            <b>
              Rooftop
            </b>
            <span>
              Lazer no topo
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
              Exclusividade, segurança e lazer de bom gosto — no melhor endereço da cidade.
            </h2>
            <p className="lead">
              O SKY Videiras é a forma carinhosa que a SEBEL Empreendimentos encontrou para dizer "olá, Jundiaí, chegamos!". São cinco plantas únicas, pensadas para quem busca viver bem no bairro Quintas das Videiras — um dos mais desejados e de maior valorização da região.
            </p>
            <ul className="difflist">
              <li>
                <span className="ar">
                  →
                </span>
                <span>
                  <b>
                    Todos os apartamentos com suíte
                  </b>
                  {' '}— conforto pensado para a família.
                </span>
              </li>
              <li>
                <span className="ar">
                  →
                </span>
                <span>
                  <b>
                    Lazer completo no rooftop
                  </b>
                  {' '}— a Serra do Japi para sempre no topo da sua vida.
                </span>
              </li>
              <li>
                <span className="ar">
                  →
                </span>
                <span>
                  <b>
                    Vaga demarcada
                  </b>
                  {' '}com infraestrutura seca para carregamento de carro elétrico.
                </span>
              </li>
              <li>
                <span className="ar">
                  →
                </span>
                <span>
                  <b>
                    Alvenaria estrutural
                  </b>
                  {' '}e acabamento com padrão de entrega SEBEL.
                </span>
              </li>
            </ul>
          </div>
          <div style={parseStyle('position:relative')} data-reveal>
            <div className="badge-round">
              Obras
              <br />
              iniciadas!
            </div>
            <img style={parseStyle('width:100%;border-radius:16px;box-shadow:0 20px 46px rgba(14,42,68,.28)')} src="/sky-videiras/a003.jpg" alt="Fachada do SKY Videiras ao entardecer" />
          </div>
        </div>
      </section>
      {/* DIFERENCIAIS */}
      <section className="dif" id="diferenciais">
        <div className="wrap">
          <div style={parseStyle('max-width:60ch')} data-reveal>
            <p className="eyebrow">
              Diferenciais do apartamento
            </p>
            <h2>
              Detalhes construtivos que fazem a diferença no dia a dia.
            </h2>
          </div>
          <div className="dif-grid">
            <div className="dif-card" data-reveal>
              <div className="ic">
                ❄️
              </div>
              <h3>
                Pronto para ar-condicionado
              </h3>
              <p>
                Infraestrutura seca para ar-condicionado e ponto elétrico na varanda já preparado.
              </p>
            </div>
            <div className="dif-card" data-reveal>
              <div className="ic">
                🔌
              </div>
              <h3>
                Vaga para carro elétrico
              </h3>
              <p>
                Vaga demarcada com infraestrutura seca para abastecimento de veículo elétrico.
              </p>
            </div>
            <div className="dif-card" data-reveal>
              <div className="ic">
                🧱
              </div>
              <h3>
                Piso e revestimento
              </h3>
              <p>
                Contrapiso em toda a unidade, com piso cerâmico na cozinha, banheiros e varanda; paredes em gesso e cerâmica nas áreas hidráulicas.
              </p>
            </div>
            <div className="dif-card" data-reveal>
              <div className="ic">
                🛋️
              </div>
              <h3>
                Lazer equipado e decorado
              </h3>
              <p>
                Áreas de lazer entregues equipadas e decoradas de acordo com o Memorial Descritivo.
              </p>
            </div>
          </div>
          <p className="foot-notes">
            Ponto elétrico na varanda preparado para ar-condicionado. Carga elétrica e eletrodutos preparados para receber infraestrutura que deve ser contratada por conta do cliente. Tipo de alvenaria: estrutural.
          </p>
        </div>
      </section>
      {/* PLANTAS */}
      <section className="plantas" id="plantas">
        <div className="wrap">
          <div style={parseStyle('max-width:60ch')} data-reveal>
            <p className="eyebrow">
              Plantas & Ambientes
            </p>
            <h2>
              Cinco plantas únicas para escolher a sua.
            </h2>
            <p className="lead">
              Living, cozinha e quartos pensados para o seu jeito de viver. Clique nas abas para conhecer cada tipologia.
            </p>
          </div>
          <div className="tabs" id="tabs">
            <button type="button" className={'tab' + (planta === 0 ? ' active' : '')} data-p="0" onClick={() => setPlanta(0)}>
              Tipo A · 56,96 m²
            </button>
            <button type="button" className={'tab' + (planta === 4 ? ' active' : '')} data-p="4" onClick={() => setPlanta(4)}>
              Tipo B · 83,31 m²
            </button>
            <button type="button" className={'tab' + (planta === 2 ? ' active' : '')} data-p="2" onClick={() => setPlanta(2)}>
              Tipo C · 72,63 m²
            </button>
            <button type="button" className={'tab' + (planta === 3 ? ' active' : '')} data-p="3" onClick={() => setPlanta(3)}>
              Tipo C ampliado · 72,63 m²
            </button>
            <button type="button" className={'tab' + (planta === 1 ? ' active' : '')} data-p="1" onClick={() => setPlanta(1)}>
              Tipo D · 71,91 m²
            </button>
          </div>
          <div className={'planta-panel' + (planta === 0 ? ' active' : '')}>
            <img className="planta-img" src="/sky-videiras/a004.jpg" alt="Planta Tipo A 56,96 m²" />
            <div className="planta-meta">
              <p className="tname">
                Tipo A
              </p>
              <p className="tsize">
                56,96 m²
              </p>
              <ul>
                <li>
                  2 dormitórios, sendo 1 suíte
                </li>
                <li>
                  Living integrado à cozinha
                </li>
                <li>
                  Varanda com ponto preparado
                </li>
                <li>
                  Vaga demarcada
                </li>
              </ul>
              <a href="#contato" className="btn btn-gold">
                Quero esta planta
              </a>
            </div>
          </div>
          <div className={'planta-panel' + (planta === 1 ? ' active' : '')}>
            <img className="planta-img" src="/sky-videiras/a005.jpg" alt="Planta Tipo D 71,91 m²" />
            <div className="planta-meta">
              <p className="tname">
                Tipo D
              </p>
              <p className="tsize">
                71,91 m²
              </p>
              <ul>
                <li>
                  2 dormitórios, sendo 1 suíte
                </li>
                <li>
                  Living ampliado
                </li>
                <li>
                  Cozinha e área de serviço integradas
                </li>
                <li>
                  Varanda
                </li>
              </ul>
              <a href="#contato" className="btn btn-gold">
                Quero esta planta
              </a>
            </div>
          </div>
          <div className={'planta-panel' + (planta === 2 ? ' active' : '')}>
            <img className="planta-img" src="/sky-videiras/a006.jpg" alt="Planta Tipo C 72,63 m²" />
            <div className="planta-meta">
              <p className="tname">
                Tipo C
              </p>
              <p className="tsize">
                72,63 m²
              </p>
              <ul>
                <li>
                  2 dormitórios, sendo 1 suíte
                </li>
                <li>
                  Setorização inteligente
                </li>
                <li>
                  Varanda integrada
                </li>
                <li>
                  Vaga demarcada
                </li>
              </ul>
              <a href="#contato" className="btn btn-gold">
                Quero esta planta
              </a>
            </div>
          </div>
          <div className={'planta-panel' + (planta === 3 ? ' active' : '')}>
            <img className="planta-img" src="/sky-videiras/a007.jpg" alt="Planta Tipo C ampliado 72,63 m²" />
            <div className="planta-meta">
              <p className="tname">
                Tipo C · sala ampliada
              </p>
              <p className="tsize">
                72,63 m²
              </p>
              <ul>
                <li>
                  Opção de living ampliado
                </li>
                <li>
                  2 dormitórios, sendo 1 suíte
                </li>
                <li>
                  Mais espaço social
                </li>
                <li>
                  Varanda
                </li>
              </ul>
              <a href="#contato" className="btn btn-gold">
                Quero esta planta
              </a>
            </div>
          </div>
          <div className={'planta-panel' + (planta === 4 ? ' active' : '')}>
            <img className="planta-img" src="/sky-videiras/a008.jpg" alt="Planta Tipo B 83,31 m²" />
            <div className="planta-meta">
              <p className="tname">
                Tipo B · a maior
              </p>
              <p className="tsize">
                83,31 m²
              </p>
              <ul>
                <li>
                  3 dormitórios, sendo 1 suíte
                </li>
                <li>
                  Living amplo integrado à varanda
                </li>
                <li>
                  Cozinha espaçosa
                </li>
                <li>
                  Vaga demarcada
                </li>
              </ul>
              <a href="#contato" className="btn btn-gold">
                Quero esta planta
              </a>
            </div>
          </div>
          <p className="disc">
            Ilustrações artísticas, preliminares e meramente ilustrativas. Móveis, utensílios e itens de decoração não fazem parte do Memorial Descritivo. Metragens conforme boletário. Configuração de dormitórios sujeita a confirmação no Memorial Descritivo.
          </p>
        </div>
      </section>
      {/* LAZER */}
      <section className="lazer" id="lazer">
        <div className="wrap">
          <div style={parseStyle('max-width:60ch')} data-reveal>
            <p className="eyebrow">
              Lazer no rooftop
            </p>
            <h2>
              A Serra do Japi para sempre, no topo da sua vida.
            </h2>
            <p className="lead">
              Do sol da manhã ao happy hour no fim da tarde: um rooftop completo, entregue equipado e decorado.
            </p>
          </div>
          <div className="lazer-grid">
            <div style={parseStyle("background-image:url('/sky-videiras/a009.jpg')")} className="lz big">
              <span>
                Piscina adulto & infantil
              </span>
            </div>
            <div style={parseStyle("background-image:url('/sky-videiras/a001.jpg')")} className="lz">
              <span>
                Solarium
              </span>
            </div>
            <div style={parseStyle("background-image:url('/sky-videiras/a010.jpg')")} className="lz">
              <span>
                Fire Place
              </span>
            </div>
            <div style={parseStyle("background-image:url('/sky-videiras/a011.jpg')")} className="lz">
              <span>
                Salão de festas
              </span>
            </div>
            <div style={parseStyle("background-image:url('/sky-videiras/a012.jpg')")} className="lz">
              <span>
                Espaço gourmet
              </span>
            </div>
            <div style={parseStyle("background-image:url('/sky-videiras/a013.jpg')")} className="lz">
              <span>
                Playground
              </span>
            </div>
            <div style={parseStyle("background-image:url('/sky-videiras/a014.jpg')")} className="lz">
              <span>
                Pet Place
              </span>
            </div>
            <div style={parseStyle("background-image:url('/sky-videiras/a015.jpg')")} className="lz big">
              <span>
                Ambientes decorados
              </span>
            </div>
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
              No bairro mais desejado de Jundiaí.
            </h2>
            <p className="lead">
              O Quintas das Videiras é hoje um dos bairros de maior valorização da região: seguro, de topografia inspiradora e com fácil acesso a todas as comodidades da cidade.
            </p>
          </div>
          <div className="loc-grid">
            <div data-reveal>
              <p className="addr">
                📍 R. Profa. Adelaíde Pontes Laureano, 360 — Jd. Quintas das Videiras, Jundiaí/SP
              </p>
              <ul className="poi">
                <li>
                  <span>
                    Obafarm
                  </span>
                  <b>
                    5 min
                  </b>
                </li>
                <li>
                  <span>
                    Drogasil
                  </span>
                  <b>
                    5 min
                  </b>
                </li>
                <li>
                  <span>
                    Escola Maple Bear
                  </span>
                  <b>
                    5 min
                  </b>
                </li>
                <li>
                  <span>
                    Rod. Anhanguera → SP
                  </span>
                  <b>
                    5 min
                  </b>
                </li>
                <li>
                  <span>
                    Colégio Domus Sapiens
                  </span>
                  <b>
                    7 min
                  </b>
                </li>
                <li>
                  <span>
                    Av. Nove de Julho
                  </span>
                  <b>
                    7 min
                  </b>
                </li>
                <li>
                  <span>
                    Supermercado Carrefour
                  </span>
                  <b>
                    8 min
                  </b>
                </li>
                <li>
                  <span>
                    Unimed
                  </span>
                  <b>
                    8 min
                  </b>
                </li>
                <li>
                  <span>
                    Parque da Uva
                  </span>
                  <b>
                    8 min
                  </b>
                </li>
                <li>
                  <span>
                    Centro de Jundiaí
                  </span>
                  <b>
                    10 min
                  </b>
                </li>
                <li>
                  <span>
                    Entrada de Campinas
                  </span>
                  <b>
                    30 min
                  </b>
                </li>
                <li>
                  <span>
                    Marginais de São Paulo
                  </span>
                  <b>
                    40 min
                  </b>
                </li>
              </ul>
              <a style={parseStyle('margin-top:26px')} href="https://www.google.com/maps/search/?api=1&query=R.+Profa.+Adelaide+Pontes+Laureano,+360,+Jundiai" target="_blank" rel="noopener" className="btn btn-dark">
                Ver no Google Maps →
              </a>
            </div>
            <div data-reveal>
              <iframe className="map-embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=R.%20Profa.%20Adela%C3%ADde%20Pontes%20Laureano%2C%20360%2C%20Jundia%C3%AD%20SP&output=embed">
              </iframe>
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
              SEBEL Empreendimentos: história que se faz também no presente.
            </h2>
            <p className="lead">
              Na estrada desde os anos 80, a SEBEL atua com força no estado de São Paulo — do tradicional Edifício Maison Rodin a conjuntos habitacionais com mais de 600 unidades. Agora, chega a Jundiaí com o SKY Videiras.
            </p>
            <blockquote className="quote">
              "Eu acredito que duas coisas são fundamentais: Responsabilidade e Qualidade."
              <cite>
                João Carlos Custódio — Engenheiro e CEO, SEBEL Empreendimentos
              </cite>
            </blockquote>
          </div>
          <div data-reveal>
            <div className="constr-stats">
              <div>
                <b>
                  100.000 m²
                </b>
                <span>
                  de obras entregues
                </span>
              </div>
              <div>
                <b>
                  +30.000 m²
                </b>
                <span>
                  áreas próprias
                </span>
              </div>
              <div>
                <b>
                  +1.500
                </b>
                <span>
                  unidades habitacionais
                </span>
              </div>
              <div>
                <b>
                  40+ anos
                </b>
                <span>
                  de estrada
                </span>
              </div>
            </div>
            <img style={parseStyle('width:100%;border-radius:16px;margin-top:30px;box-shadow:0 16px 34px rgba(0,0,0,.3)')} src="/sky-videiras/a016.jpg" alt="Serra do Japi ao entardecer, vista do SKY Videiras" />
          </div>
        </div>
      </section>
      {/* CONTATO */}
      <section className="contato" id="contato">
        <div className="wrap contato-grid">
          <div data-reveal>
            <p className="eyebrow">
              Antecipe-se
            </p>
            <h2>
              Fale conosco agora mesmo.
            </h2>
            <p className="lead">
              Preencha e receba a tabela de unidades, plantas e condições atualizadas direto no seu WhatsApp. Atendimento rápido, sem compromisso.
            </p>
            <ul className="benef">
              <li>
                Tabela de valores e condições atualizadas
              </li>
              <li>
                Plantas das 5 tipologias
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
                        Tenho interesse no SKY Videiras
                      </option>
                      <option>
                        Quero a planta Tipo A (56,96 m²)
                      </option>
                      <option>
                        Quero a planta Tipo B (83,31 m²)
                      </option>
                      <option>
                        Quero a tabela de unidades
                      </option>
                      <option>
                        Quero agendar uma visita
                      </option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-gold">
                    Quero receber informações →
                  </button>
                  <p className="consent">
                    Ao enviar, você concorda em ser contatado sobre o SKY Videiras, inclusive por WhatsApp. CRECI [INSERIR CRECI].
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
              <img style={parseStyle('height:58px;width:auto;filter:brightness(0) invert(1)')} src="/sky-videiras/a002.png" alt="SKY Videiras" />
            </div>
            <div style={parseStyle('text-align:right')}>
              <p style={parseStyle('color:#fff;font-weight:600')}>
                SEBEL Empreendimentos
              </p>
              <p>
                R. Profa. Adelaíde Pontes Laureano, 360 · Jd. Quintas das Videiras · Jundiaí/SP
              </p>
              <p>
                WhatsApp:{' '}
                <span id="footWa">{FONE_FORMATADO}</span>
              </p>
            </div>
          </div>
          <p className="legal">
            Perspectivas artísticas, preliminares e meramente ilustrativas. As áreas comuns serão entregues equipadas e decoradas conforme Memorial Descritivo. Móveis, utensílios e itens de decoração são meramente ilustrativos. Metragens conforme boletário. Empreendimento sujeito a aprovação e registro de incorporação — [INSERIR DADOS DE INCORPORAÇÃO / Nº DE REGISTRO]. Realização: SEBEL Empreendimentos. CRECI [INSERIR].
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

'use client';

/**
 * AtendimentoChat — painel de chat do Atendimento Rápido.
 *
 * Aberto pelo botão flutuante "Atendimento" já existente (LotusHome/LotusBusca),
 * renderizado dentro do container fixo do widget, acima da fileira de FABs.
 * Toda a comunicação passa por lib/chat.ts → /api/chat → LIA. Este componente
 * não conhece endpoint, chave nem lógica de atendimento.
 *
 * Histórico persiste em sessionStorage durante a sessão da aba; o id da
 * conversa é o que dá memória à LIA (mesmo id ⇒ ela continua a conversa).
 */

import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  loadConversation,
  newConversation,
  newMessage,
  saveConversation,
  sendMessage as requestReply,
  MAX_MESSAGE_CHARS,
  type ChatAttachment,
  type ChatMessage,
  type ChatReply,
  type Conversation,
} from '@/lib/chat';

const SUGGESTIONS = [
  'Quero encontrar um imóvel',
  'Tenho dúvidas sobre um imóvel',
  'Quero falar com um corretor',
];

/** Intervalo entre bolhas da mesma resposta — dá ritmo de conversa. */
const BUBBLE_GAP_MS = 700;

/* Paleta do portal (mesmos tokens dos componentes Lotus*) */
const INK = '#15241c';
const GREEN = '#1d3a2c';
const CREAM = '#f7f2e8';
const SAND = '#ece2cf';
const GOLD = '#b18a4a';
const SAGE = '#8aa593';

const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null; // modo privado/iframe sem storage, chat segue só em memória
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function AtendimentoChat({ onClose }: { onClose: () => void }) {
  const [conv, setConv] = useState<Conversation>(() => {
    const s = storage();
    return (s && loadConversation(s)) || newConversation();
  });
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Id da conversa vigente: uma resposta que chega depois de "Nova conversa"
  // pertence à conversa antiga e é descartada.
  const convIdRef = useRef(conv.id);
  convIdRef.current = conv.id;
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const s = storage();
    if (s) saveConversation(s, conv);
  }, [conv]);

  // Autoscroll para a última mensagem (e para o indicador de digitação)
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conv.messages, pending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function appendMessage(msg: ChatMessage) {
    setConv((c) => ({ ...c, messages: [...c.messages, msg] }));
  }

  function markStatus(id: string, status: ChatMessage['status']) {
    setConv((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === id ? { ...m, status } : m)),
    }));
  }

  /** Publica as bolhas da resposta uma a uma; anexos vão na última. */
  async function appendReply(reply: ChatReply, conversationId: string) {
    for (let i = 0; i < reply.bubbles.length; i++) {
      if (i > 0) await sleep(BUBBLE_GAP_MS);
      if (convIdRef.current !== conversationId) return;
      const isLast = i === reply.bubbles.length - 1;
      const msg = newMessage('assistant', reply.bubbles[i]);
      appendMessage(isLast && reply.attachments.length ? { ...msg, attachments: reply.attachments } : msg);
    }
  }

  async function deliver(msg: ChatMessage) {
    const conversationId = convIdRef.current;
    setPending(true);
    setError(null);
    markStatus(msg.id, 'sending');
    try {
      const reply = await requestReply(msg.content, conversationId);
      if (convIdRef.current !== conversationId) return;
      markStatus(msg.id, 'sent');
      await appendReply(reply, conversationId);
    } catch (e) {
      if (convIdRef.current !== conversationId) return;
      markStatus(msg.id, 'error');
      setError(e instanceof Error ? e.message : 'Não foi possível enviar sua mensagem.');
    } finally {
      if (convIdRef.current === conversationId) setPending(false);
    }
  }

  function send(raw: string) {
    const text = raw.trim();
    if (!text || pending) return;
    const userMsg = newMessage('user', text.slice(0, MAX_MESSAGE_CHARS));
    appendMessage(userMsg);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    void deliver(userMsg);
  }

  function startNewConversation() {
    const fresh = newConversation();
    convIdRef.current = fresh.id; // descarta resposta em voo da conversa anterior
    setConv(fresh);
    setInput('');
    setError(null);
    setPending(false);
    inputRef.current?.focus();
  }

  const last = conv.messages[conv.messages.length - 1];
  const lastFailed = last?.role === 'user' && last.status === 'error';
  const empty = conv.messages.length === 0;

  return (
    <div
      role="dialog"
      aria-label="Atendimento Lotus, chat"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      style={{
        boxSizing: 'border-box',
        width: 'min(380px, calc(100vw - 44px))',
        height: 'min(560px, calc(100dvh - 130px))',
        minHeight: 260,
        display: 'flex',
        flexDirection: 'column',
        background: CREAM,
        borderRadius: 20,
        boxShadow: '0 30px 70px -24px rgba(21,36,28,.5)',
        overflow: 'hidden',
        border: '1px solid rgba(21,36,28,.08)',
      }}
    >
      <style>{`
        @keyframes lchat-dot { 0%,80%,100%{opacity:.25;transform:translateY(0)} 40%{opacity:1;transform:translateY(-3px)} }
        .lchat-log::-webkit-scrollbar { width: 6px; }
        .lchat-log::-webkit-scrollbar-thumb { background: rgba(21,36,28,.18); border-radius: 3px; }
        .lchat-input::placeholder { color: rgba(21,36,28,.4); }
      `}</style>

      {/* Cabeçalho */}
      <div style={{ background: GREEN, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3f6249', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4C19 9 19 15 16 20 13 15 13 9 16 4Z" fill="#cdab6e" /><path d="M25 9C21 11 17.8 14 16 20 20.5 19 23.8 15.6 25 9Z" fill={SAGE} /></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: CREAM }}>Lia · Atendimento Lotus</div>
          <div style={{ fontSize: 12, color: SAGE, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: SAGE, display: 'inline-block' }} aria-hidden="true"></span>
            Assistente virtual · online
          </div>
        </div>
        {!empty && (
          <button
            onClick={startNewConversation}
            aria-label="Nova conversa"
            title="Nova conversa"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,242,232,.75)', padding: 6, display: 'flex' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></svg>
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="Fechar atendimento"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,242,232,.75)', fontSize: 24, lineHeight: 1, padding: '2px 6px' }}
        >
          ×
        </button>
      </div>

      {/* Mensagens */}
      <div
        ref={logRef}
        className="lchat-log"
        role="log"
        aria-live="polite"
        aria-label="Mensagens da conversa"
        style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {empty && (
          <>
            <Bubble role="assistant" content={'Olá! 👋 Como podemos ajudar?'} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    boxSizing: 'border-box',
                    textAlign: 'left',
                    background: SAND,
                    border: '1px solid rgba(21,36,28,.1)',
                    borderRadius: 12,
                    padding: '11px 14px',
                    fontSize: 14,
                    color: GREEN,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
        {conv.messages.map((m) => (
          <Bubble
            key={m.id}
            role={m.role}
            content={m.content}
            error={m.status === 'error'}
            attachments={m.attachments}
          />
        ))}
        {pending && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ background: SAND, borderRadius: '14px 14px 14px 4px', padding: '12px 14px', display: 'flex', gap: 5 }} aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#3f6249', animation: `lchat-dot 1.2s ${i * 0.18}s infinite` }}></span>
              ))}
            </div>
            <span style={{ fontSize: 12.5, color: 'rgba(21,36,28,.55)' }}>Lia está digitando…</span>
          </div>
        )}
        {error && !pending && (
          <div
            role="status"
            style={{ alignSelf: 'flex-start', maxWidth: '90%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#8a3b2e', lineHeight: 1.4 }}
          >
            {error}
            {lastFailed && (
              <button
                onClick={() => void deliver(last)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: GREEN, fontWeight: 600, fontSize: 12.5, textDecoration: 'underline', padding: 0, fontFamily: 'inherit' }}
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}
      </div>

      {/* Campo de mensagem */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px', borderTop: '1px solid rgba(21,36,28,.1)', background: CREAM, flexShrink: 0 }}
      >
        <textarea
          ref={inputRef}
          className="lchat-input"
          value={input}
          maxLength={MAX_MESSAGE_CHARS}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder={pending ? 'Aguardando a Lia responder…' : 'Escreva sua mensagem…'}
          aria-label="Escreva sua mensagem"
          style={{
            boxSizing: 'border-box',
            flex: 1,
            resize: 'none',
            border: '1px solid rgba(21,36,28,.15)',
            borderRadius: 12,
            background: '#fff',
            padding: '10px 12px',
            fontSize: 14,
            lineHeight: 1.4,
            color: INK,
            fontFamily: 'inherit',
            outline: 'none',
            maxHeight: 96,
            overflowY: 'auto',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || pending}
          aria-label="Enviar mensagem"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            background: input.trim() && !pending ? GOLD : 'rgba(21,36,28,.15)',
            cursor: input.trim() && !pending ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background .2s',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={input.trim() && !pending ? INK : 'rgba(21,36,28,.4)'} aria-hidden="true"><path d="M3 20.5 22 12 3 3.5V10l13 2-13 2v6.5Z" /></svg>
        </button>
      </form>
    </div>
  );
}

function Bubble({
  role,
  content,
  error,
  attachments,
}: {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
  attachments?: ChatAttachment[];
}) {
  const isUser = role === 'user';
  return (
    <div
      style={{
        boxSizing: 'border-box',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '84%',
        background: isUser ? GREEN : SAND,
        color: isUser ? CREAM : INK,
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        padding: '10px 13px',
        fontSize: 14,
        lineHeight: 1.45,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        opacity: error ? 0.65 : 1,
      }}
    >
      <span style={srOnly}>{isUser ? 'Você:' : 'Lia:'}</span>
      {content}
      {attachments?.map((a) => (
        // ponytail: <img> puro — URLs vêm da LIA (host arbitrário) e next/image
        // exigiria remotePatterns para cada domínio novo do empreendimento.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={a.url}
          src={a.url}
          alt="Foto do empreendimento"
          loading="lazy"
          style={{ display: 'block', width: '100%', borderRadius: 10, marginTop: 8 }}
        />
      ))}
    </div>
  );
}

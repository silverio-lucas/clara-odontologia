"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, CircleCheck, Clock3, HeartHandshake, Menu, ScanLine, ShieldCheck, Smile, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const treatments = [
  { name: "Saúde e prevenção", subtitle: "O cuidado começa no dia a dia.", description: "Avaliação, limpeza e acompanhamento para cuidar do que faz o seu sorriso ser seu.", icon: ShieldCheck, tag: "CUIDAR" },
  { name: "Estética dental", subtitle: "Naturalmente, você.", description: "Clareamento e planejamento estético com atenção à harmonia e à individualidade do seu sorriso.", icon: Sparkles, tag: "RENOVAR" },
  { name: "Alinhadores", subtitle: "Uma nova direção para o seu sorriso.", description: "Planejamento ortodôntico individualizado, com acompanhamento em cada etapa do tratamento.", icon: Smile, tag: "ALINHAR" },
  { name: "Implantes", subtitle: "Volte a sorrir com confiança.", description: "Um plano de reabilitação pensado para as suas necessidades, da avaliação ao acompanhamento.", icon: ScanLine, tag: "RECOMEÇAR" },
];
const timeSlots = ["09:00", "10:30", "14:00", "15:30"];
const careOptions = ["Primeira avaliação", ...treatments.map(t => t.name)];
const faqs = [
  { question: "Como funciona a primeira consulta?", answer: "Começamos com uma conversa sobre você: suas expectativas, sua rotina e o que gostaria de cuidar. Depois da avaliação, explicamos as possibilidades e construímos juntos os próximos passos." },
  { question: "Ainda não sei de qual tratamento preciso.", answer: "Tudo bem. Selecione “Primeira avaliação” na agenda. Esse é o momento de tirar dúvidas e entender qual cuidado faz sentido para você, sem precisar escolher um tratamento antes." },
  { question: "Tenho receio de ir ao dentista. E agora?", answer: "Conte isso na sua primeira conversa. Na Clara, a proposta é explicar cada etapa, ouvir suas dúvidas e respeitar o seu ritmo. Você pode conversar sobre o que deixa a experiência mais confortável." },
  { question: "Posso testar o agendamento neste site?", answer: "Sim. Escolha o tipo de cuidado, um dia e um horário para experimentar o fluxo. Esta é uma clínica fictícia: a agenda é demonstrativa, não coleta dados pessoais e não reserva consultas reais." },
];

type VisitDay = { value: string; weekday: string; day: string; month: string; full: string };
function nextWeekdays(): VisitDay[] {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (name: string) => parts.find(p => p.type === name)!.value;
  const date = new Date(`${part("year")}-${part("month")}-${part("day")}T12:00:00Z`);
  const result: VisitDay[] = [];
  while (result.length < 10) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6) continue;
    result.push({ value: date.toISOString().slice(0, 10), weekday: date.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" }).replace(".", ""), day: String(date.getUTCDate()).padStart(2, "0"), month: date.toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" }).replace(".", ""), full: date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) });
  }
  return result;
}
type ModelContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown }, options: { signal: AbortSignal }) => void | Promise<void> };

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const [care, setCare] = useState("Primeira avaliação");
  const [days, setDays] = useState<VisitDay[]>([]);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [week, setWeek] = useState(0);
  const returnFocus = useRef<HTMLElement | null>(null);
  const startBooking = useCallback((service = "Primeira avaliação") => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDays(nextWeekdays()); setCare(service); setDay(""); setTime(""); setWeek(0); setComplete(false); setMenuOpen(false); setBookingOpen(true);
  }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "start_demo_dental_booking", title: "Abrir agenda demonstrativa da Clara",
        description: "Abre a agenda fictícia da Clara e seleciona um tipo de cuidado. Não agenda consultas, não envia mensagens e não coleta dados pessoais. O visitante escolhe o dia e o horário na interface.",
        inputSchema: { type: "object", properties: { care: { type: "string", enum: careOptions } }, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Informe um objeto com o tipo de cuidado opcional.");
          const data = input as Record<string, unknown>;
          if (Object.keys(data).some(key => key !== "care")) throw new Error("Parâmetro não reconhecido.");
          const selectedCare = data.care ?? "Primeira avaliação";
          if (typeof selectedCare !== "string" || !careOptions.includes(selectedCare)) throw new Error("Tipo de cuidado inválido.");
          flushSync(() => startBooking(selectedCare));
          return { status: "demo_booking_open", care: selectedCare, realBookingCreated: false };
        },
      }, { signal: lifecycle.signal })).catch(error => console.warn("Clara: ferramenta de agenda indisponível.", error));
    } catch (error) { console.warn("Clara: ferramenta de agenda indisponível.", error); }
    return () => lifecycle.abort();
  }, [startBooking]);
  const selectedDay = days.find(d => d.value === day);
  const closeMenu = () => setMenuOpen(false);

  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="site-header"><div className="header-inner shell">
      <a href="#inicio" className="wordmark" aria-label="Clara Odontologia — início" onClick={closeMenu}><span>clara<span className="brand-period">.</span></span><small>ODONTOLOGIA</small></a>
      <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Navegação principal" id="navigation">
        <a href="#a-clinica" onClick={closeMenu}>A clínica</a><a href="#tratamentos" onClick={closeMenu}>Tratamentos</a><a href="#primeira-visita" onClick={closeMenu}>Sua primeira visita</a>
        <Button className="mobile-booking pill" onClick={() => startBooking()}>Agendar uma visita <ArrowUpRight aria-hidden="true" /></Button>
      </nav>
      <Button className="header-booking pill pill-outline" onClick={() => startBooking()}>Agendar uma visita <ArrowUpRight aria-hidden="true" /></Button>
      <button className="menu-toggle" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-controls="navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </div></header>
    <main id="conteudo">
      <section className="hero shell" id="inicio" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> CUIDADO QUE VAI ALÉM DO SORRISO</p>
          <h1 id="hero-title">Seu sorriso,<br />com mais<br /><em>leveza.</em></h1>
          <p className="hero-description">Odontologia com escuta, cuidado e naturalidade.<br className="desktop-break" /> Para você se sentir bem em cada detalhe.</p>
          <Button className="pill primary-cta" onClick={() => startBooking()}>Vamos cuidar do seu sorriso <ArrowUpRight aria-hidden="true" /></Button>
          <div className="hero-note"><HeartHandshake size={21} strokeWidth={1.4} aria-hidden="true" /><span>Primeiro, a gente escuta. Depois, cuida.</span></div>
        </div>
        <div className="hero-visual">
          <div className="portrait-wrap"><img src="/images/clara-smile.webp" width={1122} height={1402} fetchPriority="high" alt="Mulher sorrindo de forma natural, em uma fotografia ilustrativa da Clara" className="hero-photo" /></div>
          <div className="portrait-caption"><span>Mais do que um sorriso bonito.</span><strong>Um sorriso que é seu.</strong><span className="caption-star" aria-hidden="true">✳</span></div>
          <span className="image-side-note">NATURAL EM CADA DETALHE</span>
        </div>
        <a href="#tratamentos" className="hero-discover">Conheça o jeito Clara de cuidar <ArrowDown size={16} aria-hidden="true" /></a>
      </section>
      <div className="care-strip"><div className="shell strip-inner"><span><HeartHandshake aria-hidden="true" /> Escuta de verdade</span><span><ScanLine aria-hidden="true" /> Planejamento individual</span><span><Sparkles aria-hidden="true" /> Beleza com naturalidade</span></div></div>
      <section className="treatments-section section-pad shell" id="tratamentos" aria-labelledby="treatments-title">
        <div className="section-heading"><div><p className="eyebrow">UM CUIDADO PARA CADA MOMENTO</p><h2 id="treatments-title">Seu sorriso é único.<br />O cuidado <em>também.</em></h2></div><p>Da prevenção à transformação, cada plano<br className="desktop-break" /> começa com o que importa: você.</p></div>
        <div className="treatments-grid">{treatments.map((treatment, i) => <article className="treatment" key={treatment.name}>
          <div className="treatment-top"><span className="treatment-index">0{i + 1} / {treatment.tag}</span><treatment.icon size={29} strokeWidth={1.25} aria-hidden="true" /></div>
          <h3>{treatment.name}</h3><p className="treatment-subtitle">{treatment.subtitle}</p><p className="treatment-description">{treatment.description}</p>
          <button type="button" className="text-link" onClick={() => startBooking(treatment.name)} aria-label={`Agendar avaliação de ${treatment.name.toLowerCase()}`}>Quero saber mais <ArrowUpRight size={18} aria-hidden="true" /></button>
        </article>)}</div>
      </section>
      <section className="clinic-section" id="a-clinica" aria-labelledby="clinic-title"><div className="shell clinic-grid">
        <div className="clinic-image"><img src="/images/clara-clinic.webp" alt="Ambiente ilustrativo da clínica, com luz natural, equipamentos odontológicos e acabamento em madeira" width={1536} height={1024} loading="lazy" /><span className="image-label">UM RESPIRO NA SUA ROTINA</span></div>
        <div className="clinic-copy"><p className="eyebrow">BEM-VINDO À CLARA</p><h2 id="clinic-title">Pode chegar.<br />Pode <em>ficar à vontade.</em></h2><p>Acreditamos que cuidar do sorriso começa muito antes de sentar na cadeira. Começa no acolhimento, na conversa e na confiança de estar em boas mãos.</p><p>Um ambiente tranquilo, tempo para ouvir e clareza em cada etapa. Aqui, o cuidado acompanha o seu ritmo.</p><div className="clinic-signature"><span className="signature-line" /><span>O jeito Clara de cuidar.</span></div></div>
      </div></section>
      <section className="visit-section section-pad shell" id="primeira-visita" aria-labelledby="visit-title"><div className="section-heading"><div><p className="eyebrow">SEM PRESSA. SEM MISTÉRIO.</p><h2 id="visit-title">Tudo começa com<br />uma boa <em>conversa.</em></h2></div><Button className="pill pill-outline" onClick={() => startBooking()}>Marcar minha primeira visita <ArrowUpRight aria-hidden="true" /></Button></div>
        <div className="visit-steps">{[
          { n: "01", title: "Um momento para você", text: "Escolha o melhor dia para a sua visita. O primeiro passo pode ser simples assim." },
          { n: "02", title: "A gente se conhece", text: "Conte o que procura. Vamos ouvir, avaliar e conversar sobre as possibilidades." },
          { n: "03", title: "O cuidado ganha forma", text: "Você entende cada etapa do seu plano e decide os próximos passos com tranquilidade." },
        ].map(s => <article key={s.n}><span className="step-number">{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></article>)}</div>
      </section>
      <section className="faq-section shell" aria-labelledby="faq-title"><div><p className="eyebrow">PODE PERGUNTAR</p><h2 id="faq-title">Antes de<br /><em>vir.</em></h2><p>Um pouco mais de clareza<br />para o seu primeiro passo.</p></div><Accordion type="single" collapsible className="faq-list">{faqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger>{faq.question}</AccordionTrigger><AccordionContent>{faq.answer}</AccordionContent></AccordionItem>)}</Accordion></section>
      <section className="closing-section" aria-labelledby="closing-title"><div className="shell closing-inner"><p className="eyebrow">O PRÓXIMO SORRISO PODE SER O SEU</p><h2 id="closing-title">Sinta-se bem.<br /><em>Sorria do seu jeito.</em></h2><Button className="pill pill-lime" onClick={() => startBooking()}>Agendar minha primeira visita <ArrowUpRight aria-hidden="true" /></Button><span className="closing-note"><CalendarDays size={16} aria-hidden="true" /> Um bom começo cabe na sua agenda.</span></div></section>
    </main>
    <footer className="site-footer shell"><div className="footer-main"><a href="#inicio" className="wordmark" aria-label="Clara Odontologia — voltar ao início"><span>clara<span className="brand-period">.</span></span><small>ODONTOLOGIA</small></a><p>Cuidar de você.<br />Faz parte do nosso sorriso.</p><a className="back-to-top" href="#inicio">Voltar ao início <ArrowUpRight size={18} aria-hidden="true" /></a></div><div className="footer-bottom"><span>Clara Odontologia · Projeto conceitual</span><span>Clínica fictícia. Imagens ilustrativas. Agendamento demonstrativo.</span></div></footer>
    <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
      <DialogContent className="booking-dialog" showCloseButton={false} onCloseAutoFocus={event => { event.preventDefault(); (returnFocus.current?.getClientRects().length ? returnFocus.current : document.querySelector<HTMLElement>(".menu-toggle"))?.focus(); }}>
        <DialogClose className="modal-close" aria-label="Fechar agenda"><X size={21} /></DialogClose>
        <DialogHeader><p className="eyebrow modal-eyebrow">CLARA · AGENDA DEMONSTRATIVA</p><DialogTitle>{complete ? "Um primeiro passo, com leveza." : "Um momento para você."}</DialogTitle><DialogDescription>{complete ? "Você experimentou o agendamento da Clara." : "Explore a experiência. Não é preciso informar dados pessoais."}</DialogDescription></DialogHeader>
        {complete ? <div className="booking-success" aria-live="polite"><div className="success-icon"><CircleCheck size={30} strokeWidth={1.4} /></div><h3>Sua escolha ficou assim</h3><dl><div><dt>Cuidado</dt><dd>{care}</dd></div><div><dt>Dia</dt><dd>{selectedDay?.full}</dd></div><div><dt>Horário</dt><dd>{time} · horário de Brasília</dd></div></dl><p className="demo-message"><Check size={18} aria-hidden="true" /> Simulação concluída. Nenhuma consulta foi agendada e nenhum dado foi enviado.</p><Button className="pill" onClick={() => setBookingOpen(false)}>Voltar para a Clara <ArrowRight aria-hidden="true" /></Button><button className="reset-booking" type="button" onClick={() => { setComplete(false); setDay(""); setTime(""); }}>Experimentar outro horário</button></div> : <form className="booking-form" onSubmit={event => { event.preventDefault(); if (day && time && selectedDay && timeSlots.includes(time)) setComplete(true); }}>
          <div className="booking-field"><label id="care-label">Qual cuidado você procura?</label><Select value={care} onValueChange={setCare}><SelectTrigger className="care-select" aria-labelledby="care-label"><SelectValue /></SelectTrigger><SelectContent position="popper">{careOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
          <fieldset><legend>Escolha um dia</legend><div className="calendar-navigation"><span>Próximos dias · agenda fictícia</span><div><button type="button" aria-label="Ver os cinco dias anteriores" disabled={week === 0} onClick={() => setWeek(0)}><ChevronLeft size={17} /></button><button type="button" aria-label="Ver os próximos cinco dias" disabled={week === 1} onClick={() => setWeek(1)}><ChevronRight size={17} /></button></div></div><RadioGroup value={day} onValueChange={value => { setDay(value); setTime(""); }} className="day-options" aria-label="Dia da visita">{days.slice(week * 5, week * 5 + 5).map(d => <label key={d.value} className={`day-option ${day === d.value ? "selected" : ""}`}><RadioGroupItem className="option-radio" value={d.value} aria-label={d.full} /><span className="day-weekday">{d.weekday}</span><strong>{d.day}</strong><span>{d.month}</span></label>)}</RadioGroup></fieldset>
          <fieldset disabled={!day}><legend>Qual horário fica melhor?</legend>{!day && <p className="field-hint">Selecione um dia para escolher o horário.</p>}<RadioGroup value={time} onValueChange={setTime} className="time-options" aria-label="Horário da visita" disabled={!day}>{timeSlots.map(slot => <label key={slot} className={`time-option ${time === slot ? "selected" : ""} ${!day ? "disabled" : ""}`}><RadioGroupItem className="option-radio" value={slot} aria-label={slot} /><Clock3 size={15} aria-hidden="true" /><span>{slot}</span></label>)}</RadioGroup><p className="timezone-note">Horários de Brasília</p></fieldset>
          <Button className="pill booking-submit" type="submit" disabled={!day || !time}>Simular agendamento <ArrowRight aria-hidden="true" /></Button><p className="booking-disclaimer">Esta é uma demonstração. Nenhuma consulta real será agendada.</p>
        </form>}
      </DialogContent>
    </Dialog>
  </>;
}

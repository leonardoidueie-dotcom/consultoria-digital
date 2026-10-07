import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";

const NAV = [
  { href: "#laboratorio", label: "Laboratório" },
  { href: "#servicos", label: "Serviços" },
  { href: "#metodo", label: "Método" },
  { href: "#contato", label: "Contato" },
] as const;

const RAIL = [
  { id: "laboratorio", n: "01", label: "Laboratório" },
  { id: "servicos", n: "02", label: "Serviços" },
  { id: "metodo", n: "03", label: "Método" },
  { id: "contato", n: "04", label: "Contato" },
] as const;

const PILLARS = [
  {
    id: "estrategia",
    title: "Estratégia",
    text: "Primeiro o problema que custa tempo e dinheiro. Ferramenta só entra depois que o caminho está desenhado.",
    proof: "O teste de horas, aqui embaixo, é esse passo: medir antes de prometer.",
  },
  {
    id: "inovacao",
    title: "Inovação",
    text: "Não é moda. É tirar a ponte humana entre sistemas que não se falam e colocar o fluxo para rodar sozinho.",
    proof: "O comparador manual × automático mostra onde o pedido morre hoje.",
  },
  {
    id: "resultados",
    title: "Resultados",
    text: "O que a empresa aponta na segunda-feira: hora devolvida, lead que não se perde, tela que o dono entende.",
    proof: "O raio-x devolve um caminho — automação, site, sistema ou projeto completo.",
  },
] as const;

const SERVICES = [
  {
    n: "01",
    title: "Automação",
    need: "Automação" as const,
    text: "Rotina de planilha e mensagem vira fluxo, com alerta e um lugar para ver o que está rodando.",
  },
  {
    n: "02",
    title: "Websites",
    need: "Website" as const,
    text: "Presença com a mesma régua do trabalho: estrutura, texto e uma base que a empresa evolui.",
  },
  {
    n: "03",
    title: "Sistemas",
    need: "Sistema" as const,
    text: "Painel, cadastro e regra do negócio. O sistema segue a empresa, não o contrário.",
  },
  {
    n: "04",
    title: "Projeto completo",
    need: "Projeto completo" as const,
    text: "Diagnóstico, escopo numa página e entrega operando — com dono dos dois lados.",
  },
] as const;

const STEPS = [
  { n: "01", title: "Medir", text: "Onde o tempo, o dinheiro e o erro se acumulam." },
  { n: "02", title: "Desenhar", text: "O que entra, o que sai, o que automatiza, o que continua humano." },
  { n: "03", title: "Construir", text: "Interface e sistema no mesmo padrão." },
  { n: "04", title: "Operar", text: "No ar, ensinado, com caminho para a próxima evolução." },
] as const;

const FLOW = ["Lead entra", "Alguém confere", "Time é avisado", "Fica registrado"] as const;

const CONSOLE = [
  "diagnóstico · 14 etapas manuais no comercial",
  "arquitetura · 4 automações, 1 painel",
  "construção · fluxo e interface juntos",
  "operação · nada depende de lembrar",
] as const;

const NEEDS = ["Automação", "Website", "Sistema", "Projeto completo"] as const;
type Need = (typeof NEEDS)[number];

type Draft = {
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
  necessidade: Need;
  mensagem: string;
};

const EMPTY: Draft = {
  nome: "",
  empresa: "",
  email: "",
  whatsapp: "",
  necessidade: "Automação",
  mensagem: "",
};

const DRAFT_KEY = "cd-briefing-draft";
const SENT_KEY = "cd-briefing-sent";

const fieldClass =
  "min-h-12 w-full rounded-lg border border-cyan/30 bg-ink px-4 text-base text-snow transition-[border-color] duration-200 placeholder:text-muted focus:border-cyan";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function briefingText(d: Draft) {
  return [
    "Briefing — Consultoria Digital",
    "",
    `Nome: ${d.nome.trim()}`,
    `Empresa: ${d.empresa.trim()}`,
    `E-mail: ${d.email.trim()}`,
    `WhatsApp: ${d.whatsapp.trim() || "—"}`,
    `Necessidade: ${d.necessidade}`,
    "",
    d.mensagem.trim(),
  ].join("\n");
}

function validate(d: Draft) {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (d.nome.trim().length < 2) errors.nome = "Diga como podemos chamar você.";
  if (d.empresa.trim().length < 2) errors.empresa = "Qual é a empresa?";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) errors.email = "Precisamos de um e-mail válido.";
  const digits = d.whatsapp.replace(/\D/g, "");
  if (d.whatsapp.trim() && digits.length < 10) errors.whatsapp = "WhatsApp incompleto — ou deixe em branco.";
  if (d.mensagem.trim().length < 20) errors.mensagem = "Conte o problema em pelo menos uma frase inteira.";
  return errors;
}

function readStore<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const SCRUB_FRAMES = 48;

function scrubSrc(index: number) {
  const n = String(Math.min(SCRUB_FRAMES, Math.max(1, index))).padStart(2, "0");
  return `/brand/scrub/f${n}.jpg`;
}

function ScrubFilm() {
  const stageRef = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const shown = useRef(0);
  const [index, setIndex] = useState(1);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const apply = () => setMobile(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    for (let frame = 1; frame <= SCRUB_FRAMES; frame += 1) {
      const image = new Image();
      image.src = scrubSrc(frame);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    const tick = () => {
      if (window.matchMedia("(max-width: 1023px)").matches) onScroll();
      shown.current += (target.current - shown.current) * (window.matchMedia("(max-width: 1023px)").matches ? 0.62 : 0.28);
      const next = 1 + Math.round(shown.current * (SCRUB_FRAMES - 1));
      setIndex((current) => (current === next ? current : next));
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const top = stage.getBoundingClientRect().top;
      const travel = Math.max(stage.offsetHeight - window.innerHeight, 1);
      const passed = window.innerHeight * 0.55 - top;
      target.current = Math.min(1, Math.max(0, passed / travel));
    };
    const onMove = (event: PointerEvent) => {
      if (window.matchMedia("(max-width: 1023px)").matches) return;
      target.current = Math.min(1, Math.max(0, event.clientX / (window.innerWidth || 1)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    onScroll();
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [mobile]);

  return (
    <div ref={stageRef} className={mobile ? "relative h-[180vh]" : undefined}>
      <figure className={mobile ? "sticky top-16 z-10 flex min-h-[calc(100svh-4.5rem)] flex-col bg-ink" : undefined}>
        <img
          src={scrubSrc(index)}
          alt="Figura no gelo com um pinguim. No celular, role a tela para ele andar."
          width={840}
          height={734}
          className={mobile ? "mx-auto h-auto max-h-[36vh] w-full object-contain" : "h-auto w-full bg-ink object-contain"}
        />
        <div className="mt-3 flex items-center gap-3">
          <p className="text-xs font-medium tracking-widest text-cyan uppercase">{mobile ? "Role para a frente" : "Mova o cursor"}</p>
          <div className="h-px flex-1 bg-snow/20">
            <div className="h-px bg-cyan" style={{ width: `${Math.round(((index - 1) / (SCRUB_FRAMES - 1)) * 100)}%` }} />
          </div>
        </div>
        {mobile ? <WalkTest index={index} /> : null}
      </figure>
    </div>
  );
}

function WalkTest({ index }: { index: number }) {
  const progress = (index - 1) / (SCRUB_FRAMES - 1);
  const answered = progress >= 0.4;
  const done = progress >= 0.75;

  return (
    <div className="mt-3 flex flex-1 flex-col justify-center gap-3">
      <p className="text-sm text-muted">{answered ? "Agora o sistema responde." : "Antes: alguém tinha que responder na mão."}</p>
      <p className="max-w-[92%] rounded-2xl bg-[#12304f] px-4 py-3 text-snow">Cliente: Quero um orçamento.</p>
      {answered ? (
        <p className="ml-auto max-w-[92%] rounded-2xl bg-cyan px-4 py-3 font-semibold text-ink">
          {done ? "Sistema: Pronto. Segue o orçamento." : "Sistema: Um instante."}
        </p>
      ) : null}
      <p className="text-2xl leading-display font-bold tracking-tight">
        {done ? "Pronto. Ninguém precisou digitar." : answered ? "Olha a resposta entrando." : "Role a tela. A resposta aparece sozinha."}
      </p>
    </div>
  );
}

function LiveConsole() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCount(CONSOLE.length);
      return;
    }
    const id = window.setInterval(() => {
      setCount((current) => (current >= CONSOLE.length ? 1 : current + 1));
    }, 1100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="shadow-border rounded-2xl bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-cyan/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-cyan" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
          </span>
          <p className="text-xs font-medium tracking-widest text-cyan uppercase">Operação ao vivo</p>
        </div>
        <img src="/brand/mark.png" alt="" width={28} height={28} className="h-7 w-7" />
      </div>
      <ol className="mt-4 flex min-h-36 flex-col gap-3 text-sm" aria-live="polite">
        {CONSOLE.slice(0, count).map((line) => (
          <li key={line} className="text-snow">
            <span className="text-cyan">{">"} </span>
            {line}
          </li>
        ))}
      </ol>
    </div>
  );
}

function MarginLab() {
  const [messages, setMessages] = useState(20);
  const [minutes, setMinutes] = useState(15);
  const [ticket, setTicket] = useState(200);
  const month = messages * 22;
  const loss = Math.min(0.55, Math.max(0.08, (minutes - 3) / 50));
  const lost = month * loss;
  const recovered = Math.max(0, (lost - month * 0.08) * ticket);
  const left = lost * ticket;
  const hoursBack = ((month * minutes) / 60) * 0.65;

  return (
    <article className="shadow-border rounded-2xl bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-widest text-cyan uppercase">A conta da empresa</p>
      <h3 className="mt-2 font-semibold tracking-tight text-3xl leading-display">Quanto a demora tira do caixa</h3>
      <p className="mt-2 text-sm text-pretty text-muted">
        Arraste com os números da operação. 22 dias úteis. Quanto mais a resposta demora, mais pedido esfria. Com o sistema, a resposta sai na hora e essa perda cai para 8 em cada 100.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Dial label="Mensagens por dia" value={messages} min={5} max={80} suffix="" onChange={setMessages} />
          <Dial label="Minutos até responder" value={minutes} min={1} max={60} suffix=" min" onChange={setMinutes} />
          <Dial label="Valor de um pedido" value={ticket} min={50} max={2000} suffix="" prefix="R$ " onChange={setTicket} />
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-ink p-5">
          <div>
            <p className="text-sm text-muted">Se continuar assim, por mês</p>
            <p className="font-semibold tracking-tight text-4xl text-snow tabular-nums">{brl.format(left)}</p>
            <p className="mt-1 text-sm text-muted">{Math.round(lost)} pedidos esfriam</p>
          </div>
          <div className="border-t border-cyan/20 pt-4">
            <p className="text-sm text-muted">Se o sistema responde na hora</p>
            <p className="font-semibold tracking-tight text-4xl text-cyan tabular-nums">{brl.format(recovered)}</p>
            <p className="mt-1 text-sm text-muted">{Math.round(hoursBack)} horas voltam para vender</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-pretty">
        Em 12 meses, ficar parado deixa {brl.format(left * 12)} na mesa. Quem muda recolhe cerca de {brl.format(recovered * 12)}. Quem responde primeiro fica com o pedido. Quem espera, perde a renda para quem já mudou.
      </p>
    </article>
  );
}

function SampleLab() {
  const [auto, setAuto] = useState(false);
  const rows = [
    {
      title: "Orçamento",
      off: "O cliente pediu às 9h. Alguém só viu às 16h. Ele já fechou com outro.",
      on: "O cliente pediu às 9h. Em um minuto recebeu o caminho do orçamento.",
    },
    {
      title: "Cliente sumido",
      off: "Pediu ontem. Ninguém chamou. O interesse esfriou.",
      on: "No dia seguinte o sistema chama: seu orçamento segue valendo.",
    },
    {
      title: "Crescimento",
      off: "Para atender mais, a empresa precisa contratar.",
      on: "O mesmo time atende mais. A parte repetida não ocupa a mão de ninguém.",
    },
  ];

  return (
    <article className="shadow-border rounded-2xl bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-widest text-cyan uppercase">Três situações</p>
      <h3 className="mt-2 font-semibold tracking-tight text-3xl leading-display">O mesmo dia, com e sem o sistema</h3>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" className={auto ? "press h-12 rounded-full border border-cyan/40 px-5 text-sm font-medium" : "press h-12 rounded-full bg-cyan px-5 text-sm font-medium text-ink"} onClick={() => setAuto(false)}>
          Sem sistema
        </button>
        <button type="button" className={auto ? "press h-12 rounded-full bg-cyan px-5 text-sm font-medium text-ink" : "press h-12 rounded-full border border-cyan/40 px-5 text-sm font-medium"} onClick={() => setAuto(true)}>
          Com o sistema
        </button>
      </div>
      <ul className="mt-5 grid gap-3">
        {rows.map((row) => (
          <li key={row.title} className="rounded-xl bg-ink px-4 py-4">
            <p className="text-xs font-medium tracking-widest text-cyan uppercase">{row.title}</p>
            <p className="mt-2 text-pretty">{auto ? row.on : row.off}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function HoursLab() {
  const [people, setPeople] = useState(4);
  const [minutes, setMinutes] = useState(12);
  const [times, setTimes] = useState(8);
  const [rate, setRate] = useState(45);

  const hours = (people * minutes * times * 22) / 60;
  const cost = hours * rate;
  const back = hours * 0.7;

  return (
    <article className="shadow-border rounded-2xl bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-widest text-cyan uppercase">Teste 01 · Horas</p>
      <h3 className="mt-2 font-semibold tracking-tight text-3xl leading-display">Quanto a rotina custa por mês</h3>
      <p className="mt-2 text-sm text-pretty text-muted">
        Arraste. O número é a conta, não um slogan. 22 dias úteis, 70% do tempo de volta quando o fluxo deixa de ser manual.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Dial label="Pessoas nessa rotina" value={people} min={1} max={20} suffix="" onChange={setPeople} />
          <Dial label="Minutos por ciclo" value={minutes} min={2} max={60} suffix=" min" onChange={setMinutes} />
          <Dial label="Vezes por dia" value={times} min={1} max={30} suffix="×" onChange={setTimes} />
          <Dial label="Valor da hora" value={rate} min={20} max={200} suffix="" prefix="R$ " onChange={setRate} />
        </div>
        <div className="flex flex-col justify-between rounded-xl bg-ink p-5">
          <p className="text-sm text-muted">Custo mensal dessa rotina</p>
          <p className="font-semibold tracking-tight text-5xl text-cyan tabular-nums">{brl.format(cost)}</p>
          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-cyan/20 pt-4 text-sm">
            <div>
              <dt className="text-muted">Horas no mês</dt>
              <dd className="text-xl font-medium tabular-nums">{hours.toFixed(0)} h</dd>
            </div>
            <div>
              <dt className="text-muted">Horas que voltam</dt>
              <dd className="text-xl font-medium text-cyan tabular-nums">{back.toFixed(0)} h</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}

function Dial({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
  prefix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix: string;
  prefix?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-medium text-cyan tabular-nums">
          {prefix}
          {value}
          {suffix}
        </span>
      </span>
      <input
        id={id}
        className="dial"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function FlowLab() {
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [cursor, setCursor] = useState(-1);
  const [lost, setLost] = useState(false);
  const running = cursor >= 0 && cursor < 4;

  useEffect(() => {
    if (!running) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduce ? 0 : mode === "auto" ? 260 : 680;
    const id = window.setTimeout(() => {
      if (mode === "manual" && cursor === 1) {
        setLost(true);
        setCursor(4);
        return;
      }
      setCursor((current) => current + 1);
    }, delay);
    return () => window.clearTimeout(id);
  }, [cursor, mode, running]);

  function run(next: "manual" | "auto") {
    setMode(next);
    setLost(false);
    setCursor(0);
  }

  const verdict =
    cursor < 0
      ? "Escolha um modo e rode o mesmo lead."
      : lost
        ? "Parou na conferência. O lead não virou aviso nem registro."
        : cursor >= 4
          ? "Quatro etapas, um fluxo. Ninguém precisou lembrar."
          : "Em andamento.";

  return (
    <article className="shadow-border rounded-2xl bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-widest text-cyan uppercase">Teste 02 · Fluxo</p>
      <h3 className="mt-2 font-semibold tracking-tight text-3xl leading-display">O mesmo lead, dois jeitos</h3>
      <p className="mt-2 text-sm text-pretty text-muted">
        No manual, alguém tem que lembrar. No automático, o caminho não depende de memória.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="press h-12 rounded-full bg-cyan px-5 text-sm font-medium text-ink disabled:opacity-60"
          disabled={running}
          onClick={() => run("manual")}
        >
          Rodar manual
        </button>
        <button
          type="button"
          className="press h-12 rounded-full border border-cyan/40 px-5 text-sm font-medium text-snow disabled:opacity-60"
          disabled={running}
          onClick={() => run("auto")}
        >
          Rodar automático
        </button>
      </div>
      <ol className="mt-6 grid gap-3 sm:grid-cols-4">
        {FLOW.map((label, index) => {
          const failed = lost && index === 1;
          const skipped = lost && index > 1;
          const done = !lost && cursor > index;
          const active = cursor === index && cursor < 4;
          const tone = failed ? "border-snow/40 text-snow" : done || active ? "border-cyan text-cyan" : "border-cyan/20 text-muted";
          const state = failed ? "Perdido" : skipped ? "Não chegou" : done ? "Ok" : active ? "Agora" : "Espera";
          return (
            <li key={label} className={`rounded-xl border bg-ink px-3 py-4 ${tone}`}>
              <p className="text-xs tracking-widest uppercase">{state}</p>
              <p className="mt-2 text-sm font-medium text-snow">{label}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm text-pretty" aria-live="polite">
        {verdict}
      </p>
    </article>
  );
}

function ReadingLab({ onUse }: { onUse: (need: Need, note: string) => void }) {
  const [where, setWhere] = useState<Need | null>(null);
  const [volume, setVolume] = useState<"as vezes" | "todo dia" | null>(null);
  const [tools, setTools] = useState<"uma" | "varias" | null>(null);
  const ready = where && volume && tools;

  const text = ready
    ? [
        where === "Automação"
          ? "O ganho está em tirar a rotina da mão do time."
          : where === "Website"
            ? "A presença precisa sustentar a reputação que a entrega já tem."
            : where === "Sistema"
              ? "Falta uma tela em que o dono veja o que está parado."
              : "Não é uma peça só. É diagnóstico, sistema e presença no mesmo projeto.",
        volume === "todo dia" ? "Acontece todo dia — o custo já é estrutural." : "Ainda dá para corrigir antes de virar o jeito da empresa.",
        tools === "varias"
          ? "Antes de ferramenta nova, as que já existem precisam se falar."
          : "Dá para começar em cima do que já está em uso.",
      ].join(" ")
    : "Responda as três. O caminho aparece aqui.";

  return (
    <article className="shadow-border rounded-2xl bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-widest text-cyan uppercase">Teste 03 · Raio-x</p>
      <h3 className="mt-2 font-semibold tracking-tight text-3xl leading-display">Três respostas, um caminho</h3>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Choice
          legend="Onde dói"
          value={where}
          options={NEEDS.map((need) => ({ id: need, label: need }))}
          onChange={setWhere}
        />
        <Choice
          legend="Com que frequência"
          value={volume}
          options={[
            { id: "as vezes" as const, label: "Às vezes" },
            { id: "todo dia" as const, label: "Todo dia" },
          ]}
          onChange={setVolume}
        />
        <Choice
          legend="Ferramentas"
          value={tools}
          options={[
            { id: "uma" as const, label: "Uma" },
            { id: "varias" as const, label: "Várias, sem falar" },
          ]}
          onChange={setTools}
        />
      </div>
      <div className="mt-6 rounded-xl bg-ink p-5">
        <p className="text-xs font-medium tracking-widest text-cyan uppercase">{ready ? where : "Aguardando"}</p>
        <p className="mt-2 text-pretty">{text}</p>
        <button
          type="button"
          className="press mt-4 h-12 rounded-full bg-cyan px-5 text-sm font-medium text-ink disabled:opacity-40"
          disabled={!ready || !where}
          onClick={() => ready && where && onUse(where, text)}
        >
          Levar este raio-x para o briefing
        </button>
      </div>
    </article>
  );
}

function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T | null;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const legendId = useId();
  return (
    <fieldset>
      <legend id={legendId} className="mb-2 text-sm font-medium">
        {legend}
      </legend>
      <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby={legendId}>
        {options.map((option) => {
          const checked = value === option.id;
          return (
            <label key={option.id} className="cursor-pointer">
              <input
                type="radio"
                className="peer sr-only"
                name={legendId}
                checked={checked}
                onChange={() => onChange(option.id)}
              />
              <span className="flex min-h-11 items-center rounded-lg border border-cyan/25 px-3 text-sm peer-checked:border-cyan peer-checked:bg-cyan peer-checked:text-ink">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function HomePage() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("laboratorio");
  const [pillar, setPillar] = useState<(typeof PILLARS)[number]["id"]>("estrategia");
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [sent, setSent] = useState<Draft | null>(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const formId = useId();
  const currentPillar = PILLARS.find((item) => item.id === pillar) ?? PILLARS[0];

  useEffect(() => {
    const saved = readStore<Draft>(SENT_KEY);
    if (saved) setSent(saved);
    else {
      const pending = readStore<Draft>(DRAFT_KEY);
      if (pending) {
        setDraft({
          ...EMPTY,
          ...pending,
          necessidade: NEEDS.includes(pending.necessidade) ? pending.necessidade : "Automação",
        });
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || sent) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, ready, sent]);

  useEffect(() => {
    const nodes = RAIL.map((item) => document.getElementById(item.id)).filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target.id) setActive(hit.target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.2, 0.5] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const preview = useMemo(() => briefingText(sent ?? draft), [draft, sent]);

  function chooseNeed(need: Need, note?: string) {
    setDraft((current) => ({
      ...current,
      necessidade: need,
      mensagem: note && current.mensagem.trim().length < 20 ? note : current.mensagem,
    }));
    setSent(null);
    localStorage.removeItem(SENT_KEY);
  }

  function useReading(need: Need, note: string) {
    chooseNeed(need, note);
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const clean: Draft = {
      ...draft,
      nome: draft.nome.trim(),
      empresa: draft.empresa.trim(),
      email: draft.email.trim(),
      whatsapp: draft.whatsapp.trim(),
      mensagem: draft.mensagem.trim(),
    };
    localStorage.setItem(SENT_KEY, JSON.stringify(clean));
    localStorage.removeItem(DRAFT_KEY);
    setSent(clean);
    setCopied(false);
  }

  async function copyBriefing() {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-snow">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-surface focus:px-4 focus:py-3"
      >
        Ir para o conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-cyan/20 bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
          <a href="#topo" className="flex min-h-11 items-center gap-3">
            <img src="/brand/mark.png" alt="" width={36} height={36} className="h-9 w-9" />
            <span className="text-sm font-medium tracking-wide">Consultoria Digital</span>
          </a>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Seções">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-muted transition-colors duration-200 hover:text-cyan">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#laboratorio" className="press hidden h-11 items-center rounded-full bg-cyan px-5 text-sm font-medium text-ink sm:inline-flex">
              Testar agora
            </a>
            <button
              type="button"
              className="press h-11 px-1 text-sm font-medium lg:hidden"
              aria-expanded={menu}
              aria-controls="menu-mobile"
              onClick={() => setMenu((value) => !value)}
            >
              {menu ? "Fechar" : "Menu"}
            </button>
          </div>
        </div>
        {menu ? (
          <nav id="menu-mobile" aria-label="Seções" className="border-t border-cyan/20 px-5 py-3 lg:hidden">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="flex min-h-12 items-center" onClick={() => setMenu(false)}>
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      <nav className="rail fixed top-1/2 left-8 z-30 -translate-y-1/2" aria-label="Nesta página">
        <ol className="flex flex-col gap-3">
          {RAIL.map((item) => {
            const on = active === item.id;
            return (
              <li key={item.id}>
                <a href={`#${item.id}`} className={on ? "text-cyan" : "text-muted hover:text-snow"} aria-current={on ? "true" : undefined}>
                  <span className="font-serif">{item.n}</span>
                  <span className="ml-2 text-sm">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <main id="conteudo">
        <section id="topo" className="relative bg-ink">
          <div className="mx-auto max-w-5xl px-5 pt-10">
            <p className="text-xs font-medium tracking-widest text-cyan uppercase">Consultoria Digital</p>
            <h1 className="mt-3 max-w-xl text-4xl leading-display font-bold tracking-tight text-balance sm:text-5xl">
              Estratégia. Inovação. <span className="text-cyan">Resultados.</span>
            </h1>
            <p className="mt-4 max-w-md text-pretty text-muted">
              Automação, websites e sistemas sob medida. No celular, role a tela e ele anda para a frente.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#laboratorio" className="press inline-flex h-12 items-center justify-center rounded-full bg-cyan px-6 text-sm font-medium text-ink">
                Abrir o laboratório
              </a>
              <a
                href="#contato"
                className="press inline-flex h-12 items-center justify-center rounded-full border border-cyan/40 px-6 text-sm font-medium text-snow"
              >
                Falar do projeto
              </a>
            </div>
          </div>
          <div className="mx-auto max-w-5xl px-5 pt-4">
            <ScrubFilm />
          </div>
        </section>

        <section className="border-t border-cyan/20" aria-labelledby="pilares">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <h2 id="pilares" className="sr-only">
              Estratégia, inovação e resultados
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {PILLARS.map((item) => {
                const on = pillar === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    className={
                      on
                        ? "rounded-2xl bg-cyan px-5 py-5 text-left text-ink"
                        : "rounded-2xl border border-cyan/25 bg-surface px-5 py-5 text-left text-snow transition-colors duration-200 hover:border-cyan"
                    }
                    onClick={() => setPillar(item.id)}
                  >
                    <span className="font-semibold tracking-tight text-3xl">{item.title}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl border border-cyan/20 bg-surface px-5 py-5">
              <p className="text-pretty">{currentPillar.text}</p>
              <p className="mt-2 text-sm text-pretty text-cyan">{currentPillar.proof}</p>
            </div>
          </div>
        </section>

        <section id="laboratorio" className="border-t border-cyan/20">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-14">
            <div className="grid items-start gap-5 lg:grid-cols-2">
              <div className="max-w-2xl">
                <p className="text-xs font-medium tracking-widest text-cyan uppercase">Laboratório</p>
                <h2 className="mt-2 font-semibold tracking-tight text-4xl leading-display text-balance sm:text-5xl">Teste aqui. O resultado aparece na hora.</h2>
              </div>
              <LiveConsole />
            </div>
            <MarginLab />
            <SampleLab />
            <HoursLab />
            <FlowLab />
            <ReadingLab onUse={useReading} />
          </div>
        </section>

        <section id="servicos" className="border-t border-cyan/20">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <p className="text-xs font-medium tracking-widest text-cyan uppercase">Serviços</p>
            <h2 className="mt-2 max-w-xl font-semibold tracking-tight text-4xl leading-display text-balance">O que a Consultoria Digital constrói.</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {SERVICES.map((service) => (
                <li key={service.n}>
                  <button
                    type="button"
                    className="flex h-full w-full flex-col rounded-2xl border border-cyan/25 bg-surface p-5 text-left transition-colors duration-200 hover:border-cyan"
                    onClick={() => {
                      chooseNeed(service.need);
                      document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="font-semibold tracking-tight text-cyan">{service.n}</span>
                    <span className="mt-3 font-semibold tracking-tight text-3xl">{service.title}</span>
                    <span className="mt-2 text-sm text-pretty text-muted">{service.text}</span>
                    <span className="mt-4 text-sm font-medium text-cyan">Abrir briefing</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="metodo" className="border-t border-cyan/20">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <p className="text-xs font-medium tracking-widest text-cyan uppercase">Método</p>
            <h2 className="mt-2 font-semibold tracking-tight text-4xl leading-display">O desenho vem antes do código.</h2>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <li key={step.n} className="rounded-2xl bg-surface p-5">
                  <p className="font-semibold tracking-tight text-3xl text-cyan">{step.n}</p>
                  <h3 className="mt-4 text-lg font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm text-pretty text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="motivacao" className="border-t border-cyan/20" aria-labelledby="motivacao-title">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <p className="text-xs font-medium tracking-widest text-cyan uppercase">Motivação</p>
            <h2 id="motivacao-title" className="mt-2 max-w-3xl text-4xl leading-display font-bold tracking-tight text-balance">
              Como vamos sonhar pequeno se Deus é nosso sócio?
            </h2>
            <figure className="shadow-border mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-cyan/30">
              <img
                src="/brand/presenca-sonho.png"
                alt="Na neve, a frase: Como vamos sonhar pequeno se Deus é nosso sócio? Consultoria Digital."
                width={1024}
                height={1024}
                className="h-auto w-full"
              />
            </figure>
          </div>
        </section>

        <section id="contato" className="border-t border-cyan/20">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium tracking-widest text-cyan uppercase">Contato</p>
              <h2 className="mt-2 font-semibold tracking-tight text-4xl leading-display text-balance">Conte o problema. O escopo vem depois.</h2>
              <p className="mt-4 text-sm text-pretty text-muted">
                O briefing fica pronto para copiar ou abrir no e-mail. Se veio do raio-x, a leitura já entra na mensagem.
              </p>
            </div>
            <div className="lg:col-span-8">
              {sent ? (
                <div className="shadow-border rounded-2xl bg-surface p-5 sm:p-6">
                  <p className="text-xs font-medium tracking-widest text-cyan uppercase">Briefing pronto</p>
                  <h3 className="mt-2 font-semibold tracking-tight text-3xl">
                    {sent.empresa} · {sent.necessidade}
                  </h3>
                  <pre className="mt-4 max-h-56 overflow-auto rounded-xl bg-ink p-4 text-sm whitespace-pre-wrap text-snow">{preview}</pre>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button type="button" className="press h-12 rounded-full bg-cyan px-5 text-sm font-medium text-ink" onClick={() => void copyBriefing()}>
                      {copied ? "Copiado" : "Copiar briefing"}
                    </button>
                    <a
                      className="press inline-flex h-12 items-center justify-center rounded-full border border-cyan/40 px-5 text-sm font-medium"
                      href={`mailto:?subject=${encodeURIComponent(`Briefing — ${sent.empresa}`)}&body=${encodeURIComponent(preview)}`}
                    >
                      Abrir no e-mail
                    </a>
                    <button
                      type="button"
                      className="h-12 px-2 text-sm text-muted"
                      onClick={() => {
                        localStorage.removeItem(SENT_KEY);
                        setSent(null);
                        setCopied(false);
                      }}
                    >
                      Novo briefing
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="shadow-border rounded-2xl bg-surface p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Nome</span>
                      <input className={fieldClass} name="nome" autoComplete="name" value={draft.nome} aria-invalid={Boolean(errors.nome)} onChange={(event) => setDraft({ ...draft, nome: event.target.value })} />
                      {errors.nome ? <span className="mt-2 block text-sm text-cyan">{errors.nome}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Empresa</span>
                      <input className={fieldClass} name="empresa" autoComplete="organization" value={draft.empresa} aria-invalid={Boolean(errors.empresa)} onChange={(event) => setDraft({ ...draft, empresa: event.target.value })} />
                      {errors.empresa ? <span className="mt-2 block text-sm text-cyan">{errors.empresa}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">E-mail</span>
                      <input className={fieldClass} type="email" name="email" autoComplete="email" inputMode="email" value={draft.email} aria-invalid={Boolean(errors.email)} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
                      {errors.email ? <span className="mt-2 block text-sm text-cyan">{errors.email}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">WhatsApp</span>
                      <input className={fieldClass} type="tel" name="whatsapp" autoComplete="tel" inputMode="tel" placeholder="Opcional" value={draft.whatsapp} aria-invalid={Boolean(errors.whatsapp)} onChange={(event) => setDraft({ ...draft, whatsapp: event.target.value })} />
                      {errors.whatsapp ? <span className="mt-2 block text-sm text-cyan">{errors.whatsapp}</span> : null}
                    </label>
                  </div>
                  <fieldset className="mt-4">
                    <legend className="mb-2 text-sm font-medium" id={`${formId}-need`}>
                      O que a empresa precisa
                    </legend>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={`${formId}-need`}>
                      {NEEDS.map((need) => (
                        <label key={need} className="cursor-pointer">
                          <input type="radio" name="necessidade" className="peer sr-only" checked={draft.necessidade === need} onChange={() => chooseNeed(need)} />
                          <span className="inline-flex min-h-11 items-center rounded-full border border-cyan/30 px-4 text-sm peer-checked:border-cyan peer-checked:bg-cyan peer-checked:text-ink">
                            {need}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-medium">O problema</span>
                    <textarea
                      className={`${fieldClass} min-h-28 py-3`}
                      name="mensagem"
                      value={draft.mensagem}
                      aria-invalid={Boolean(errors.mensagem)}
                      placeholder="O que trava hoje, quem sofre com isso e o que já tentaram."
                      onChange={(event) => setDraft({ ...draft, mensagem: event.target.value })}
                    />
                    {errors.mensagem ? <span className="mt-2 block text-sm text-cyan">{errors.mensagem}</span> : null}
                  </label>
                  <button type="submit" className="press mt-5 h-12 rounded-full bg-cyan px-6 text-sm font-medium text-ink">
                    Preparar briefing
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-cyan/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <img src="/brand/mark.png" alt="" width={48} height={48} className="h-12 w-12" />
            <div>
              <p className="font-medium">Consultoria Digital</p>
              <p className="text-sm text-muted">Estratégia · Inovação · Resultados</p>
            </div>
          </div>
          <p className="text-sm text-muted">© {new Date().getFullYear()} Consultoria Digital</p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  MapPin,
  Building2,
  Dumbbell,
  Home,
  X,
  ShoppingBag,
  Star,
  Navigation,
  Loader2,
} from "lucide-react";

const MODALIDADES = [
  "Musculação",
  "Funcional",
  "Crossfit",
  "HIIT",
  "Pilates",
  "Yoga",
  "Corrida",
  "Natação",
  "Boxe",
  "Reabilitação",
  "Emagrecimento",
  "Hipertrofia",
];

interface Personal {
  id: string;
  nome: string;
  sobrenome: string;
  avatarUrl: string | null;
  modalidades: string | null;
  regioes: string | null;
  academias: string | null;
  valorAproximado: string | null;
  disponivelEmCasa: boolean;
  telefone: string | null;
  isWhatsapp: boolean;
  asaasCustomerId: string | null;
  rating: { media: number; total: number };
}

interface AcademiaProxima {
  id: string;
  nome: string;
  endereco: string;
  distanciaKm: number;
}

function parseJson(val: string | null): string[] {
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

function whatsappLink(phone: string, nome: string) {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  const msg = encodeURIComponent(
    `Olá, ${nome}! Encontrei seu perfil na plataforma Personal Agora e gostaria de saber mais sobre seus serviços.`
  );
  return `https://wa.me/${number}?text=${msg}`;
}

export default function BuscarPersonalPage() {
  const [personais, setPersonais] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(false);

  // Academias por perto
  const [academiasProximas, setAcademiasProximas] = useState<AcademiaProxima[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [geoAsked, setGeoAsked] = useState(false);
  const [showAllProximas, setShowAllProximas] = useState(false);

  // Filtros
  const [nome, setNome] = useState("");
  const [modalidadesSel, setModalidadesSel] = useState<string[]>([]);
  const [regiaoInput, setRegiaoInput] = useState("");
  const [regioesSel, setRegioesSel] = useState<string[]>([]);
  const [academiaInput, setAcademiaInput] = useState("");
  const [academiasSel, setAcademiasSel] = useState<string[]>([]);
  const [academiasDB, setAcademiasDB] = useState<{ id: string; nome: string }[]>([]);
  const [acadOpen, setAcadOpen] = useState(false);
  const acadRef = useRef<HTMLDivElement>(null);
  const [casa, setCasa] = useState(false);

  const nomeTimer = useRef<NodeJS.Timeout | null>(null);

  // Carregar academias do banco para sugestão
  useEffect(() => {
    fetch("/api/academias")
      .then((r) => r.json())
      .then((d) => setAcademiasDB(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Fechar dropdown academia
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (acadRef.current && !acadRef.current.contains(e.target as Node)) {
        setAcadOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Pedir localização automaticamente ao carregar
  useEffect(() => {
    buscarAcademiasProximas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buscarAcademiasProximas() {
    if (!navigator.geolocation) {
      setGeoError("Seu navegador não suporta geolocalização");
      setGeoAsked(true);
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    setGeoAsked(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/academias/proximas?lat=${latitude}&lng=${longitude}&raio=15`);
          const data: AcademiaProxima[] = await res.json();
          setAcademiasProximas(data);
        } catch {
          setGeoError("Erro ao buscar academias próximas");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoError("Localização não permitida");
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function buscarPersonaisDaAcademia(nomeAcademia: string) {
    setAcademiasSel([nomeAcademia]);
    setAcademiaInput("");
  }

  // Buscar personais sempre que filtros mudam
  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidadesSel, regioesSel, academiasSel, casa]);

  // Debounce no nome
  useEffect(() => {
    if (nomeTimer.current) clearTimeout(nomeTimer.current);
    nomeTimer.current = setTimeout(() => buscar(), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome]);

  async function buscar() {
    setLoading(true);
    const params = new URLSearchParams();
    if (nome) params.set("nome", nome);
    // Envia a 1ª modalidade selecionada (back filtra no banco, resto no JS)
    if (modalidadesSel[0]) params.set("modalidade", modalidadesSel[0]);
    if (regioesSel[0]) params.set("regiao", regioesSel[0]);
    if (academiasSel[0]) params.set("academia", academiasSel[0]);
    if (casa) params.set("casa", "1");

    try {
      const res = await fetch(`/api/personais?${params}`);
      let data: Personal[] = await res.json();

      // Filtro local para múltiplas seleções
      if (modalidadesSel.length > 1) {
        data = data.filter((p) => {
          const mods = parseJson(p.modalidades);
          return modalidadesSel.every((m) => mods.includes(m));
        });
      }
      if (regioesSel.length > 1) {
        data = data.filter((p) => {
          const regs = parseJson(p.regioes);
          const regsStr = regs.join(" ");
          return regioesSel.every((r) =>
            regsStr.toLowerCase().includes(r.toLowerCase())
          );
        });
      }
      if (academiasSel.length > 1) {
        data = data.filter((p) => {
          const acs = parseJson(p.academias);
          return academiasSel.every((a) =>
            acs.some((ac) => ac.toLowerCase().includes(a.toLowerCase()))
          );
        });
      }

      setPersonais(data);
    } catch {
      setPersonais([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleModalidade(m: string) {
    setModalidadesSel((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  function addRegiao() {
    const v = regiaoInput.trim();
    if (v && !regioesSel.includes(v)) setRegioesSel((p) => [...p, v]);
    setRegiaoInput("");
  }

  function addAcademia(nome: string) {
    if (!academiasSel.includes(nome)) setAcademiasSel((p) => [...p, nome]);
    setAcademiaInput("");
    setAcadOpen(false);
  }

  function clearAllFilters() {
    setNome("");
    setModalidadesSel([]);
    setRegioesSel([]);
    setAcademiasSel([]);
    setCasa(false);
    setRegiaoInput("");
    setAcademiaInput("");
  }

  const hasFilters =
    modalidadesSel.length > 0 ||
    regioesSel.length > 0 ||
    academiasSel.length > 0 ||
    casa;

  const filteredAcademias = academiasDB.filter(
    (a) =>
      academiaInput.length >= 1 &&
      a.nome.toLowerCase().includes(academiaInput.toLowerCase()) &&
      !academiasSel.includes(a.nome)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black italic tracking-tight">
          Encontre seu{" "}
          <span className="text-yellow-500">Personal Trainer</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Filtre por modalidade, região ou academia e entre em contato direto.
        </p>
      </div>

      {/* Academias por perto */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-yellow-500" /> Academias por perto
          </p>
          {geoAsked && !geoLoading && (
            <button
              onClick={buscarAcademiasProximas}
              className="text-xs text-yellow-500 hover:text-yellow-400 transition"
            >
              Atualizar localização
            </button>
          )}
        </div>

        {geoLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400 py-3">
            <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
            Buscando academias próximas...
          </div>
        ) : geoError ? (
          <div className="text-sm text-zinc-500 py-2">
            <p>{geoError}</p>
            {geoError === "Localização não permitida" && (
              <button
                onClick={buscarAcademiasProximas}
                className="mt-2 text-xs text-yellow-500 hover:text-yellow-400 underline"
              >
                Tentar novamente
              </button>
            )}
          </div>
        ) : academiasProximas.length > 0 ? (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(showAllProximas ? academiasProximas : academiasProximas.slice(0, 3)).map((a) => (
              <div
                key={a.id}
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 flex flex-col gap-2"
              >
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{a.nome}</p>
                    <p className="text-xs text-zinc-500 truncate">{a.endereco}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {a.distanciaKm} km
                  </span>
                  <button
                    onClick={() => buscarPersonaisDaAcademia(a.nome)}
                    className="text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-3 py-1.5 rounded-lg transition"
                  >
                    Ver personais
                  </button>
                </div>
              </div>
            ))}
          </div>
          {academiasProximas.length > 3 && (
            <button
              onClick={() => setShowAllProximas((p) => !p)}
              className="mt-3 text-xs text-yellow-500 hover:text-yellow-400 transition w-full text-center"
            >
              {showAllProximas ? "Ver menos" : `Ver mais (${academiasProximas.length - 3} academias)`}
            </button>
          )}
          </>
        ) : geoAsked ? (
          <p className="text-sm text-zinc-500 py-2">
            Nenhuma academia encontrada por perto (raio de 15 km).
          </p>
        ) : null}
      </div>

      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Buscar por nome do personal..."
          className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-500 transition"
        />
      </div>

      {/* Painel de filtros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
          {/* Modalidades */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" /> Modalidades
            </p>
            <div className="flex flex-wrap gap-2">
              {MODALIDADES.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleModalidade(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    modalidadesSel.includes(m)
                      ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {modalidadesSel.includes(m) && "✓ "}
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Região */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Região / Cidade
            </p>
            <div className="flex gap-2">
              <input
                value={regiaoInput}
                onChange={(e) => setRegiaoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRegiao()}
                placeholder="Ex: Alphaville, Moema, SP..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-500 transition"
              />
              <button
                onClick={addRegiao}
                disabled={!regiaoInput.trim()}
                className="px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition disabled:opacity-40"
              >
                +
              </button>
            </div>
            {regioesSel.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {regioesSel.map((r) => (
                  <span key={r} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">
                    {r}
                    <button onClick={() => setRegioesSel((p) => p.filter((x) => x !== r))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Academia */}
          <div ref={acadRef}>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Academia
            </p>
            <div className="relative">
              <input
                value={academiaInput}
                onChange={(e) => { setAcademiaInput(e.target.value); setAcadOpen(true); }}
                onFocus={() => setAcadOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && academiaInput.trim()) {
                    addAcademia(academiaInput.trim());
                  }
                }}
                placeholder="Buscar academia..."
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-500 transition"
              />
              {acadOpen && (filteredAcademias.length > 0 || academiaInput.trim().length >= 2) && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-40 overflow-y-auto shadow-xl">
                  {filteredAcademias.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => addAcademia(a.nome)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-zinc-700 transition"
                    >
                      {a.nome}
                    </button>
                  ))}
                  {academiaInput.trim().length >= 2 && !filteredAcademias.find(a => a.nome.toLowerCase() === academiaInput.toLowerCase()) && (
                    <button
                      onClick={() => addAcademia(academiaInput.trim())}
                      className="w-full text-left px-3 py-2.5 text-sm text-yellow-500 hover:bg-zinc-700 transition border-t border-zinc-700"
                    >
                      + Buscar &quot;{academiaInput}&quot;
                    </button>
                  )}
                </div>
              )}
            </div>
            {academiasSel.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {academiasSel.map((a) => (
                  <span key={a} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">
                    {a}
                    <button onClick={() => setAcademiasSel((p) => p.filter((x) => x !== a))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Disponível em casa */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setCasa((p) => !p)}
              className={`w-11 h-6 rounded-full transition relative ${casa ? "bg-yellow-500" : "bg-zinc-700"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${casa ? "left-5" : "left-0.5"}`} />
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Home className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-300">Disponível para aulas em casa</span>
            </div>
          </label>

          {/* Limpar filtros */}
          {hasFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-zinc-500 hover:text-red-400 transition flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Limpar todos os filtros
            </button>
          )}
        </div>

      {/* Resultados */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
          </div>
        ) : personais.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">Nenhum personal encontrado</p>
            <p className="text-zinc-600 text-sm mt-1">Tente ajustar os filtros</p>
            {hasFilters && (
              <button onClick={clearAllFilters} className="mt-4 text-sm text-yellow-500 hover:text-yellow-400 transition underline">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-500 mb-4">
              {personais.length} personal{personais.length !== 1 ? "s" : ""} encontrado{personais.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personais.map((p) => (
                <PersonalCard key={p.id} personal={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PersonalCard({ personal: p }: { personal: Personal }) {
  const modalidades = parseJson(p.modalidades);
  const regioes = parseJson(p.regioes);
  const academias = parseJson(p.academias);
  const initials = `${p.nome[0]}`.toUpperCase();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition group flex flex-col">
      {/* Foto */}
      <div className="relative w-full aspect-[4/3] bg-zinc-800 overflow-hidden">
        {p.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.avatarUrl}
            alt={p.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-2">
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/20 flex items-center justify-center">
              <span className="text-2xl font-black text-yellow-500">{initials}</span>
            </div>
            <p className="text-xs text-zinc-600">Sem foto de perfil</p>
          </div>
        )}
        {/* Preço no topo direito */}
        {p.valorAproximado && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold border border-yellow-500/30">
            R$ {p.valorAproximado}/hora aula
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Primeiro nome apenas */}
        <h3 className="font-bold text-white text-base leading-tight">
          {p.nome}
        </h3>

        {/* Avaliação */}
        {p.rating.total > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">{p.rating.media.toFixed(1)}</span>
            <span className="text-xs text-zinc-500">({p.rating.total})</span>
          </div>
        )}

        {/* Modalidades */}
        {modalidades.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {modalidades.slice(0, 4).map((m) => (
              <span
                key={m}
                className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20"
              >
                {m}
              </span>
            ))}
            {modalidades.length > 4 && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-xs border border-zinc-700">
                +{modalidades.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Regiões */}
        {regioes.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-zinc-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-600" />
            <span className="line-clamp-1">{regioes.slice(0, 2).join(", ")}{regioes.length > 2 ? ` +${regioes.length - 2}` : ""}</span>
          </div>
        )}

        {/* Academias */}
        {academias.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-zinc-400">
            <Building2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-600" />
            <span className="line-clamp-1">{academias.slice(0, 2).join(", ")}{academias.length > 2 ? ` +${academias.length - 2}` : ""}</span>
          </div>
        )}

        {/* Em casa badge */}
        {p.disponivelEmCasa && (
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <Home className="w-3.5 h-3.5" />
            <span>Disponível para aulas em casa</span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <a
            href={`/dashboard/aluno/contratar/${p.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-xl transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Contratar Aula
          </a>
        </div>
      </div>
    </div>
  );
}

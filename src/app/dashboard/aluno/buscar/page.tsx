"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  Globe,
  LocateFixed,
  Users,
} from "lucide-react";

/* ── constantes ── */
const MODALIDADES = [
  "Musculação", "Funcional", "Crossfit", "HIIT", "Pilates", "Yoga",
  "Corrida", "Natação", "Boxe", "Reabilitação", "Emagrecimento", "Hipertrofia",
];

const ESPECIALIDADES = [
  "Gestantes", "Idosos", "Kids", "PCD", "Atletas", "Pré/Pós-operatório",
  "Postura", "Flexibilidade", "Condicionamento",
];

/* ── interfaces ── */
interface Personal {
  id: string;
  nome: string;
  sobrenome: string;
  sexo: string | null;
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

interface UserData {
  cidade?: string;
  estado?: string;
}

/* ── helpers ── */
function parseJson(val: string | null): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

type SearchMode = "inicio" | "academia" | "regiao";
type SortOption = "relevancia" | "preco-asc" | "preco-desc" | "nome-az" | "nota";
type GeneroFilter = "" | "masculino" | "feminino";

/* ══════════════════════════════════════════════════════════════════ */
export default function BuscarPersonalPage() {
  /* ── modo de busca ── */
  const [mode, setMode] = useState<SearchMode>("inicio");

  /* ── dados do usuário ── */
  const [userData, setUserData] = useState<UserData>({});

  /* ── resultados ── */
  const [personais, setPersonais] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(false);

  /* ── geolocalização ── */
  const [academiasProximas, setAcademiasProximas] = useState<AcademiaProxima[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [geoPermissionGranted, setGeoPermissionGranted] = useState(false);
  const [showGeoPrompt, setShowGeoPrompt] = useState(false);
  const [showAllProximas, setShowAllProximas] = useState(false);

  /* ── filtros base ── */
  const [nome, setNome] = useState("");
  const [academiaInput, setAcademiaInput] = useState("");
  const [academiasSel, setAcademiasSel] = useState<string[]>([]);
  const [academiasDB, setAcademiasDB] = useState<{ id: string; nome: string }[]>([]);
  const [acadOpen, setAcadOpen] = useState(false);
  const acadRef = useRef<HTMLDivElement>(null);
  const [casa, setCasa] = useState(false);

  /* ── região ── */
  const [regiaoSource, setRegiaoSource] = useState<"cadastro" | "localizacao" | "manual">("cadastro");
  const [regiaoInput, setRegiaoInput] = useState("");
  const [regioesSel, setRegioesSel] = useState<string[]>([]);

  /* ── modalidades & especialidades ── */
  const [modalidadesSel, setModalidadesSel] = useState<string[]>([]);
  const [especialidadesSel, setEspecialidadesSel] = useState<string[]>([]);
  const [showModalidades, setShowModalidades] = useState(false);
  const [showEspecialidades, setShowEspecialidades] = useState(false);

  /* ── gênero & ordenação ── */
  const [generoFilter, setGeneroFilter] = useState<GeneroFilter>("");
  const [sortBy, setSortBy] = useState<SortOption>("relevancia");
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const nomeTimer = useRef<NodeJS.Timeout | null>(null);

  /* ── Carregar dados do usuário ── */
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d) setUserData({ cidade: d.cidade, estado: d.estado });
      })
      .catch(() => {});
  }, []);

  /* ── Carregar academias do banco ── */
  useEffect(() => {
    fetch("/api/academias")
      .then((r) => r.json())
      .then((d) => setAcademiasDB(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  /* ── Verificar se já deu permissão de localização antes ── */
  useEffect(() => {
    const granted = localStorage.getItem("geo_permission_granted");
    if (granted === "true") setGeoPermissionGranted(true);
  }, []);

  /* ── Fechar dropdowns ao clicar fora ── */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (acadRef.current && !acadRef.current.contains(e.target as Node)) setAcadOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Buscar personais quando filtros mudam ── */
  const buscar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (nome) params.set("nome", nome);
    if (modalidadesSel[0]) params.set("modalidade", modalidadesSel[0]);
    if (regioesSel[0]) params.set("regiao", regioesSel[0]);
    if (academiasSel[0]) params.set("academia", academiasSel[0]);
    if (casa) params.set("casa", "1");
    if (generoFilter) params.set("sexo", generoFilter);

    try {
      const res = await fetch(`/api/personais?${params}`);
      let data: Personal[] = await res.json();

      // Filtro local múltiplo
      if (modalidadesSel.length > 1) {
        data = data.filter((p) => {
          const mods = parseJson(p.modalidades);
          return modalidadesSel.every((m) => mods.includes(m));
        });
      }
      if (regioesSel.length > 1) {
        data = data.filter((p) => {
          const regs = parseJson(p.regioes).join(" ").toLowerCase();
          return regioesSel.every((r) => regs.includes(r.toLowerCase()));
        });
      }
      if (academiasSel.length > 1) {
        data = data.filter((p) => {
          const acs = parseJson(p.academias);
          return academiasSel.every((a) => acs.some((ac) => ac.toLowerCase().includes(a.toLowerCase())));
        });
      }
      // Filtro especialidades (local)
      if (especialidadesSel.length > 0) {
        data = data.filter((p) => {
          const mods = parseJson(p.modalidades).join(" ").toLowerCase();
          return especialidadesSel.every((e) => mods.includes(e.toLowerCase()));
        });
      }

      setPersonais(data);
    } catch {
      setPersonais([]);
    } finally {
      setLoading(false);
    }
  }, [nome, modalidadesSel, regioesSel, academiasSel, casa, generoFilter, especialidadesSel]);

  useEffect(() => {
    if (mode === "inicio") return;
    buscar();
  }, [modalidadesSel, regioesSel, academiasSel, casa, generoFilter, especialidadesSel, buscar, mode]);

  useEffect(() => {
    if (mode === "inicio") return;
    if (nomeTimer.current) clearTimeout(nomeTimer.current);
    nomeTimer.current = setTimeout(() => buscar(), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome]);

  /* ── Geolocalização ── */
  function requestGeo(callback?: () => void) {
    if (!navigator.geolocation) {
      setGeoError("Seu navegador não suporta geolocalização");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          localStorage.setItem("geo_permission_granted", "true");
          setGeoPermissionGranted(true);
          const res = await fetch(`/api/academias/proximas?lat=${latitude}&lng=${longitude}&raio=15`);
          const data: AcademiaProxima[] = await res.json();
          setAcademiasProximas(data);
          callback?.();
        } catch {
          setGeoError("Erro ao buscar academias");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoError("Localização não permitida. Verifique as permissões do seu navegador.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function handleAcademiaMode() {
    if (geoPermissionGranted) {
      setMode("academia");
      requestGeo();
    } else {
      setShowGeoPrompt(true);
    }
  }

  function confirmGeoPermission() {
    setShowGeoPrompt(false);
    setMode("academia");
    requestGeo();
  }

  function handleRegiaoMode() {
    setMode("regiao");
    if (userData.cidade) {
      setRegioesSel([userData.cidade]);
      setRegiaoSource("cadastro");
    }
  }

  function buscarPersonaisDaAcademia(nomeAcademia: string) {
    setAcademiasSel([nomeAcademia]);
    setAcademiaInput("");
  }

  function switchRegiaoSource(source: "cadastro" | "localizacao" | "manual") {
    setRegiaoSource(source);
    if (source === "cadastro" && userData.cidade) {
      setRegioesSel([userData.cidade]);
    } else if (source === "localizacao") {
      setRegioesSel([]);
      requestGeo();
    } else {
      setRegioesSel([]);
    }
  }

  /* ── helpers de filtro ── */
  function toggleModalidade(m: string) {
    setModalidadesSel((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  }
  function toggleEspecialidade(e: string) {
    setEspecialidadesSel((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  }
  function addRegiao() {
    const v = regiaoInput.trim();
    if (v && !regioesSel.includes(v)) setRegioesSel((p) => [...p, v]);
    setRegiaoInput("");
  }
  function addAcademia(n: string) {
    if (!academiasSel.includes(n)) setAcademiasSel((p) => [...p, n]);
    setAcademiaInput("");
    setAcadOpen(false);
  }
  function clearAllFilters() {
    setNome("");
    setModalidadesSel([]);
    setEspecialidadesSel([]);
    setRegioesSel([]);
    setAcademiasSel([]);
    setCasa(false);
    setGeneroFilter("");
    setSortBy("relevancia");
    setRegiaoInput("");
    setAcademiaInput("");
  }
  function voltarInicio() {
    clearAllFilters();
    setMode("inicio");
    setPersonais([]);
    setAcademiasProximas([]);
    setShowAllProximas(false);
  }

  const hasFilters = modalidadesSel.length > 0 || especialidadesSel.length > 0 || regioesSel.length > 0 || academiasSel.length > 0 || casa || generoFilter !== "";

  const filteredAcademias = academiasDB.filter(
    (a) => academiaInput.length >= 1 && a.nome.toLowerCase().includes(academiaInput.toLowerCase()) && !academiasSel.includes(a.nome)
  );

  /* ── Ordenação dos resultados ── */
  const sortedPersonais = [...personais].sort((a, b) => {
    switch (sortBy) {
      case "preco-asc": {
        const pa = parseFloat(a.valorAproximado || "999999");
        const pb = parseFloat(b.valorAproximado || "999999");
        return pa - pb;
      }
      case "preco-desc": {
        const pa = parseFloat(a.valorAproximado || "0");
        const pb = parseFloat(b.valorAproximado || "0");
        return pb - pa;
      }
      case "nome-az":
        return a.nome.localeCompare(b.nome, "pt-BR");
      case "nota":
        return b.rating.media - a.rating.media;
      default:
        return 0;
    }
  });

  const sortLabels: Record<SortOption, string> = {
    relevancia: "Relevância",
    "preco-asc": "Menor preço",
    "preco-desc": "Maior preço",
    "nome-az": "A → Z",
    nota: "Melhor avaliação",
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDERIZAÇÃO
  ═══════════════════════════════════════════════════════════════════ */

  /* ── TELA INICIAL ── */
  if (mode === "inicio") {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center gap-8 py-8 px-4">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tight">
            Buscar <span className="text-yellow-500">Personal</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
            Escolha como deseja encontrar o personal ideal para você.
          </p>
        </div>

        {/* Opções principais */}
        <div className="w-full space-y-3">
          <button
            onClick={handleAcademiaMode}
            className="w-full group relative bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-5 text-left transition-all duration-200 hover:bg-zinc-900/80"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 group-hover:bg-yellow-500/20 transition">
                <Building2 className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-yellow-500 transition">Buscar por Academia</h3>
                <p className="text-zinc-500 text-xs mt-0.5">Veja academias próximas e encontre personais que atuam nelas</p>
              </div>
            </div>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 group-hover:text-yellow-500 transition">
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </div>
          </button>

          <button
            onClick={handleRegiaoMode}
            className="w-full group relative bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-5 text-left transition-all duration-200 hover:bg-zinc-900/80"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 group-hover:bg-yellow-500/20 transition">
                <Globe className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-yellow-500 transition">Buscar por Região</h3>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {userData.cidade
                    ? `Personais na sua cidade (${userData.cidade}) e arredores`
                    : "Busque personais pela sua região ou cidade"}
                </p>
              </div>
            </div>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 group-hover:text-yellow-500 transition">
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </div>
          </button>
        </div>

        {/* Dica */}
        <p className="text-zinc-600 text-xs text-center">
          Após escolher, você poderá filtrar por modalidade, especialidade, gênero e muito mais.
        </p>
      </div>
    );
  }

  /* ── TELA DE BUSCA (academia ou região) ── */
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header com voltar */}
      <div className="flex items-center gap-3">
        <button
          onClick={voltarInicio}
          className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-yellow-500/50 hover:text-yellow-500 text-zinc-500 transition shrink-0"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
        <div>
          <h1 className="text-xl font-black italic tracking-tight">
            {mode === "academia" ? (
              <>Buscar por <span className="text-yellow-500">Academia</span></>
            ) : (
              <>Buscar por <span className="text-yellow-500">Região</span></>
            )}
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {mode === "academia"
              ? "Academias próximas a você"
              : "Personais disponíveis na sua região"}
          </p>
        </div>
      </div>

      {/* ─── MODO ACADEMIA ─── */}
      {mode === "academia" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-yellow-500" /> Academias por perto
            </p>
            <button
              onClick={() => requestGeo()}
              className="text-xs text-yellow-500 hover:text-yellow-400 transition flex items-center gap-1"
            >
              <LocateFixed className="w-3 h-3" /> Atualizar
            </button>
          </div>

          {geoLoading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400 py-6 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
              Buscando academias próximas...
            </div>
          ) : geoError ? (
            <div className="text-center py-6">
              <p className="text-sm text-zinc-400">{geoError}</p>
              <button onClick={() => requestGeo()} className="mt-2 text-xs text-yellow-500 hover:text-yellow-400 underline">
                Tentar novamente
              </button>
            </div>
          ) : academiasProximas.length > 0 ? (
            <>
              <div className="space-y-2">
                {(showAllProximas ? academiasProximas : academiasProximas.slice(0, 3)).map((a) => (
                  <div
                    key={a.id}
                    className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3 flex items-center gap-3 hover:border-yellow-500/30 transition group/card"
                  >
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{a.nome}</p>
                      <p className="text-xs text-zinc-500 truncate">{a.endereco}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-zinc-500 hidden sm:flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {a.distanciaKm} km
                      </span>
                      <button
                        onClick={() => buscarPersonaisDaAcademia(a.nome)}
                        className="text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
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
                  className="text-xs text-yellow-500 hover:text-yellow-400 transition w-full text-center py-1"
                >
                  {showAllProximas ? "Ver menos" : `Ver mais ${academiasProximas.length - 3} academias`}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500 text-center py-6">Nenhuma academia encontrada por perto (15 km).</p>
          )}

          {/* Busca manual por academia */}
          <div ref={acadRef} className="border-t border-zinc-800 pt-3">
            <p className="text-xs text-zinc-500 mb-2">Ou busque pelo nome:</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                value={academiaInput}
                onChange={(e) => { setAcademiaInput(e.target.value); setAcadOpen(true); }}
                onFocus={() => setAcadOpen(true)}
                onKeyDown={(e) => { if (e.key === "Enter" && academiaInput.trim()) addAcademia(academiaInput.trim()); }}
                placeholder="Buscar academia por nome..."
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-500 transition"
              />
              {acadOpen && (filteredAcademias.length > 0 || academiaInput.trim().length >= 2) && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-xl max-h-40 overflow-y-auto shadow-xl">
                  {filteredAcademias.map((a) => (
                    <button key={a.id} onClick={() => addAcademia(a.nome)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-zinc-700 transition flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" /> {a.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {academiasSel.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {academiasSel.map((a) => (
                  <span key={a} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">
                    <Building2 className="w-3 h-3" /> {a}
                    <button onClick={() => setAcademiasSel((p) => p.filter((x) => x !== a))} className="hover:text-red-400 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODO REGIÃO ─── */}
      {mode === "regiao" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
          {/* Tabs de fonte */}
          <div className="flex gap-1 bg-zinc-800 rounded-xl p-1">
            <button
              onClick={() => switchRegiaoSource("cadastro")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
                regiaoSource === "cadastro" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Meu endereço
            </button>
            <button
              onClick={() => switchRegiaoSource("localizacao")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
                regiaoSource === "localizacao" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              <LocateFixed className="w-3.5 h-3.5" /> Localização atual
            </button>
            <button
              onClick={() => switchRegiaoSource("manual")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
                regiaoSource === "manual" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Search className="w-3.5 h-3.5" /> Digitar
            </button>
          </div>

          {/* Info/Input da região */}
          {regiaoSource === "cadastro" && userData.cidade && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800/60 rounded-xl">
              <MapPin className="w-4 h-4 text-yellow-500 shrink-0" />
              <span className="text-sm text-white">{userData.cidade}{userData.estado ? `, ${userData.estado}` : ""}</span>
            </div>
          )}
          {regiaoSource === "cadastro" && !userData.cidade && (
            <p className="text-sm text-zinc-500 px-1">Você ainda não cadastrou seu endereço. Use outra opção.</p>
          )}
          {regiaoSource === "localizacao" && geoLoading && (
            <div className="flex items-center gap-2 text-sm text-zinc-400 py-3 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" /> Obtendo localização...
            </div>
          )}
          {regiaoSource === "manual" && (
            <div className="flex gap-2">
              <input
                value={regiaoInput}
                onChange={(e) => setRegiaoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRegiao()}
                placeholder="Digite cidade, bairro ou região..."
                className="flex-1 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-500 transition"
              />
              <button onClick={addRegiao} disabled={!regiaoInput.trim()}
                className="px-4 py-2.5 bg-yellow-500 text-black text-sm font-bold rounded-xl hover:bg-yellow-400 transition disabled:opacity-40">
                +
              </button>
            </div>
          )}

          {/* Chips de região */}
          {regioesSel.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {regioesSel.map((r) => (
                <span key={r} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">
                  <MapPin className="w-3 h-3" /> {r}
                  <button onClick={() => setRegioesSel((p) => p.filter((x) => x !== r))} className="hover:text-red-400 transition">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── BUSCA POR NOME (sempre visível) ─── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Buscar por nome do personal..."
          className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-yellow-500 transition"
        />
      </div>

      {/* ─── FILTROS COMPACTOS ─── */}
      <div className="flex flex-wrap gap-2">
        {/* Gênero */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button onClick={() => setGeneroFilter("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${generoFilter === "" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"}`}>
            <Users className="w-3 h-3" /> Todos
          </button>
          <button onClick={() => setGeneroFilter("masculino")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${generoFilter === "masculino" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"}`}>
            Homens
          </button>
          <button onClick={() => setGeneroFilter("feminino")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${generoFilter === "feminino" ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"}`}>
            Mulheres
          </button>
        </div>

        {/* Toggle em casa */}
        <button onClick={() => setCasa((p) => !p)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
            casa ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"}`}>
          <Home className="w-3 h-3" /> Em casa
        </button>

        {/* Modalidades dropdown */}
        <button onClick={() => setShowModalidades((p) => !p)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
            modalidadesSel.length > 0 ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"}`}>
          <Dumbbell className="w-3 h-3" />
          Modalidades {modalidadesSel.length > 0 && `(${modalidadesSel.length})`}
          <ChevronDown className={`w-3 h-3 transition ${showModalidades ? "rotate-180" : ""}`} />
        </button>

        {/* Especialidades dropdown */}
        <button onClick={() => setShowEspecialidades((p) => !p)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
            especialidadesSel.length > 0 ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"}`}>
          <SlidersHorizontal className="w-3 h-3" />
          Especialidades {especialidadesSel.length > 0 && `(${especialidadesSel.length})`}
          <ChevronDown className={`w-3 h-3 transition ${showEspecialidades ? "rotate-180" : ""}`} />
        </button>

        {/* Limpar tudo */}
        {hasFilters && (
          <button onClick={clearAllFilters}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 border border-zinc-800 hover:border-red-500/30 transition flex items-center gap-1">
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>

      {/* Modalidades expandido */}
      {showModalidades && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5" /> Modalidades
          </p>
          <div className="flex flex-wrap gap-2">
            {MODALIDADES.map((m) => (
              <button key={m} onClick={() => toggleModalidade(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  modalidadesSel.includes(m) ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"}`}>
                {modalidadesSel.includes(m) && "✓ "}{m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Especialidades expandido */}
      {showEspecialidades && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Especialidades
          </p>
          <div className="flex flex-wrap gap-2">
            {ESPECIALIDADES.map((e) => (
              <button key={e} onClick={() => toggleEspecialidade(e)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  especialidadesSel.includes(e) ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"}`}>
                {especialidadesSel.includes(e) && "✓ "}{e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── RESULTADOS ─── */}
      <div>
        {/* Toolbar de resultados */}
        {!loading && personais.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500">
              {personais.length} personal{personais.length !== 1 ? "is" : ""} encontrado{personais.length !== 1 ? "s" : ""}
            </p>
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setShowSort((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:border-zinc-600 transition"
              >
                <ArrowUpDown className="w-3 h-3" /> {sortLabels[sortBy]}
                <ChevronDown className={`w-3 h-3 transition ${showSort ? "rotate-180" : ""}`} />
              </button>
              {showSort && (
                <div className="absolute right-0 mt-1 w-44 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-20">
                  {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { setSortBy(key); setShowSort(false); }}
                      className={`w-full text-left px-3 py-2.5 text-xs transition ${
                        sortBy === key ? "bg-yellow-500/10 text-yellow-400" : "text-zinc-300 hover:bg-zinc-700"}`}
                    >
                      {sortLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
          </div>
        ) : personais.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">Nenhum personal encontrado</p>
            <p className="text-zinc-600 text-sm mt-1">Tente ajustar os filtros ou buscar de outra forma</p>
            {hasFilters && (
              <button onClick={clearAllFilters} className="mt-4 text-sm text-yellow-500 hover:text-yellow-400 transition underline">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPersonais.map((p) => (
              <PersonalCard key={p.id} personal={p} />
            ))}
          </div>
        )}
      </div>

      {/* ─── MODAL: Permissão de localização ─── */}
      {showGeoPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
                <Navigation className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Permitir localização</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Para encontrar academias próximas a você, precisamos acessar sua localização.
                Seus dados são usados apenas para essa busca e não são armazenados.
              </p>
            </div>
            <div className="p-4 border-t border-zinc-800 flex gap-2">
              <button
                onClick={() => setShowGeoPrompt(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
              >
                Agora não
              </button>
              <button
                onClick={confirmGeoPermission}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition"
              >
                Permitir localização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CARD DO PERSONAL
═══════════════════════════════════════════════════════════════════ */
function PersonalCard({ personal: p }: { personal: Personal }) {
  const modalidades = parseJson(p.modalidades);
  const regioes = parseJson(p.regioes);
  const academias = parseJson(p.academias);
  const initials = `${p.nome[0]}`.toUpperCase();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-lg hover:shadow-yellow-500/5 transition-all duration-300 group flex flex-col">
      {/* Foto */}
      <div className="relative w-full aspect-[4/3] bg-zinc-800 overflow-hidden">
        {p.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatarUrl} alt={p.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-2">
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/20 flex items-center justify-center">
              <span className="text-2xl font-black text-yellow-500">{initials}</span>
            </div>
          </div>
        )}
        {p.valorAproximado && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold border border-yellow-500/30">
            R$ {p.valorAproximado}/h
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <h3 className="font-bold text-white text-base leading-tight group-hover:text-yellow-500 transition">{p.nome}</h3>

        {p.rating.total > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">{p.rating.media.toFixed(1)}</span>
            <span className="text-xs text-zinc-500">({p.rating.total})</span>
          </div>
        )}

        {modalidades.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {modalidades.slice(0, 3).map((m) => (
              <span key={m} className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20">{m}</span>
            ))}
            {modalidades.length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-xs border border-zinc-700">+{modalidades.length - 3}</span>
            )}
          </div>
        )}

        {regioes.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-zinc-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-600" />
            <span className="line-clamp-1">{regioes.slice(0, 2).join(", ")}{regioes.length > 2 ? ` +${regioes.length - 2}` : ""}</span>
          </div>
        )}

        {academias.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-zinc-400">
            <Building2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-600" />
            <span className="line-clamp-1">{academias.slice(0, 2).join(", ")}{academias.length > 2 ? ` +${academias.length - 2}` : ""}</span>
          </div>
        )}

        {p.disponivelEmCasa && (
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <Home className="w-3.5 h-3.5" /> Disponível em casa
          </div>
        )}

        <div className="mt-auto pt-2">
          <a href={`/dashboard/aluno/contratar/${p.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20">
            <ShoppingBag className="w-4 h-4" /> Contratar Aula
          </a>
        </div>
      </div>
    </div>
  );
}

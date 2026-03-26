"use client";

import { useRef, useState } from "react";
import { MapPin, Search, Loader2, X } from "lucide-react";

export default function RegionSearchTest() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<{ description: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  function handleChange(value: string) {
    setSearch(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch { setSuggestions([]); }
      setLoading(false);
    }, 300);
  }

  function add(desc: string) {
    if (!selected.includes(desc)) setSelected((p) => [...p, desc]);
    setSearch(""); setOpen(false); setSuggestions([]);
  }

  function remove(desc: string) {
    setSelected((p) => p.filter((x) => x !== desc));
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-8 p-4 rounded-2xl border border-yellow-500/30 bg-zinc-900/60 backdrop-blur">
      <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest mb-3">🧪 Teste — Campo de Regiões</p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Digite um bairro, cidade ou CEP..."
          className="w-full bg-zinc-800 border border-zinc-700 focus:border-yellow-500 rounded-xl pl-10 pr-10 py-3 text-sm text-white outline-none transition"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500 animate-spin" />}
        {open && search.length >= 2 && !loading && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-xl max-h-52 overflow-y-auto shadow-xl">
            {suggestions.filter((s) => !selected.includes(s.description)).map((s) => (
              <button key={s.description} type="button" onClick={() => add(s.description)}
                className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 transition flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0" /> {s.description}
              </button>
            ))}
            {suggestions.filter((s) => !selected.includes(s.description)).length === 0 && (
              <p className="px-4 py-3 text-sm text-zinc-500 text-center">Nenhum local encontrado.</p>
            )}
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((r) => (
            <span key={r} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
              {r}
              <button type="button" onClick={() => remove(r)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

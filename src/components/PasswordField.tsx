"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, ShieldAlert, ShieldCheck, Shield } from "lucide-react";

/* ── Sequências comuns que bloqueamos ── */
const WEAK_PATTERNS = [
  /^(.)\1+$/,                       // aaaaaa
  /^(012|123|234|345|456|567|678|789|890)+/,  // 123456
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i, // abcdef
  /^(qwerty|asdfgh|zxcvbn)/i,
  /^(password|senha|1234567?8?9?0?)/i,
];

type Criteria = {
  label: string;
  met: boolean;
};

function evaluatePassword(pw: string): {
  score: number;          // 0-4
  level: "none" | "weak" | "medium" | "strong";
  criteria: Criteria[];
  blocked: boolean;
} {
  if (!pw) return { score: 0, level: "none", criteria: [], blocked: false };

  const blocked = WEAK_PATTERNS.some((p) => p.test(pw));

  const criteria: Criteria[] = [
    { label: "Pelo menos 6 caracteres", met: pw.length >= 6 },
    { label: "Uma letra maiúscula", met: /[A-Z]/.test(pw) },
    { label: "Uma letra minúscula", met: /[a-z]/.test(pw) },
    { label: "Um número", met: /\d/.test(pw) },
    { label: "Um caractere especial (!@#$...)", met: /[^A-Za-z0-9]/.test(pw) },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  let score = metCount;
  if (blocked) score = Math.min(score, 1);
  if (pw.length >= 10 && !blocked) score = Math.min(score + 1, 5);

  const level: "none" | "weak" | "medium" | "strong" =
    score <= 1 ? "weak" : score <= 3 ? "medium" : "strong";

  return { score: Math.min(score, 4), level, criteria, blocked };
}

const LEVEL_CONFIG = {
  none: { color: "bg-zinc-700", text: "", icon: Shield, emoji: "" },
  weak: { color: "bg-red-500", text: "Fraca", icon: ShieldAlert, emoji: "😬" },
  medium: { color: "bg-yellow-500", text: "Razoável", icon: Shield, emoji: "🤔" },
  strong: { color: "bg-green-500", text: "Forte", icon: ShieldCheck, emoji: "💪" },
};

const inputCls =
  "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition";
const labelCls = "block text-sm font-medium text-zinc-400 mb-1.5";
const errorCls = "text-red-400 text-xs mt-1";

interface Props {
  value: string;
  confirmValue: string;
  onChange: (v: string) => void;
  onConfirmChange: (v: string) => void;
  error?: string;
  confirmError?: string;
}

export default function PasswordField({
  value,
  confirmValue,
  onChange,
  onConfirmChange,
  error,
  confirmError,
}: Props) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);

  const eval_ = useMemo(() => evaluatePassword(value), [value]);
  const { level, criteria, blocked, score } = eval_;

  const config = LEVEL_CONFIG[level];
  const barWidth = value ? `${(score / 4) * 100}%` : "0%";

  return (
    <div className="space-y-4">
      {/* Senha */}
      <div>
        <label className={labelCls}>Senha</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!touched) setTouched(true);
            }}
            className={`${inputCls} pr-12`}
            placeholder="Crie sua senha"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
          >
            {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {error && <p className={errorCls}>{error}</p>}

        {/* Strength indicator - só mostra depois de digitar */}
        {touched && value.length > 0 && (
          <div className="mt-3 space-y-3">
            {/* Barra de progresso */}
            <div className="space-y-1.5">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${config.color}`}
                  style={{ width: barWidth }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${
                  level === "weak" ? "text-red-400" :
                  level === "medium" ? "text-yellow-400" :
                  level === "strong" ? "text-green-400" : "text-zinc-500"
                }`}>
                  {config.text && `${config.emoji} Senha ${config.text}`}
                </span>
              </div>
            </div>

            {/* Mensagem e critérios */}
            {level !== "strong" && (
              <div className={`p-3 rounded-lg border ${
                level === "weak"
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-yellow-500/5 border-yellow-500/20"
              }`}>
                <p className={`text-xs font-medium mb-2 ${
                  level === "weak" ? "text-red-400" : "text-yellow-400"
                }`}>
                  {blocked
                    ? "😰 Ops! Essa senha é muito fácil de adivinhar."
                    : level === "weak"
                    ? "😬 Ops, essa senha não parece ser muito segura..."
                    : "🤔 Quase lá! Sua senha pode ser mais forte."}
                </p>
                <ul className="space-y-1">
                  {criteria.filter((c) => !c.met).map((c) => (
                    <li key={c.label} className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {level === "strong" && (
              <div className="p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                <p className="text-xs font-medium text-green-400">
                  💪 Excelente! Sua senha está bem segura.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmar Senha */}
      <div>
        <label className={labelCls}>Confirmar Senha</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmValue}
            onChange={(e) => onConfirmChange(e.target.value)}
            className={`${inputCls} pr-12`}
            placeholder="Digite a senha novamente"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {confirmError && <p className={errorCls}>{confirmError}</p>}
        {!confirmError && confirmValue && confirmValue !== value && (
          <p className={errorCls}>As senhas não coincidem</p>
        )}
        {confirmValue && confirmValue === value && value.length > 0 && (
          <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Senhas coincidem
          </p>
        )}
      </div>
    </div>
  );
}

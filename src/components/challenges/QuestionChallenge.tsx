import { motion } from "framer-motion";
import { useState } from "react";
import { GameButton } from "@/components/ui/GameButton";

interface AnswerOptionProps {
  text: string;
  index: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
  selected?: boolean;
  result?: "correct" | "wrong" | null;
}

export function AnswerOption({
  text,
  index,
  onSelect,
  disabled,
  selected,
  result,
}: AnswerOptionProps) {
  const resultStyles =
    result === "correct"
      ? "border-emerald-400/60 bg-emerald-500/20"
      : result === "wrong"
        ? "border-red-400/60 bg-red-500/20"
        : selected
          ? "border-rose-400/60 bg-rose-500/15"
          : "border-white/15 hover:border-rose-300/40 hover:bg-white/5";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      onClick={() => onSelect(index)}
      className={`w-full text-left cozy-card rounded-2xl p-4 text-sm sm:text-base transition-colors ${resultStyles}`}
    >
      <span className="text-gold-warm font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
      {text}
    </motion.button>
  );
}

interface QuestionChallengeProps {
  question: string;
  answers: string[];
  correctAnswer: number;
  hint?: string;
  onCorrect: () => void;
  onWrong: () => void;
}

export function QuestionChallenge({
  question,
  answers,
  correctAnswer,
  hint,
  onCorrect,
  onWrong,
}: QuestionChallengeProps) {
  const handleSelect = (index: number) => {
    if (index === correctAnswer) onCorrect();
    else onWrong();
  };

  return (
    <div className="space-y-4">
      <p className="font-display font-semibold text-cream text-base">{question}</p>
      {hint && <p className="text-xs text-cream/50 italic">💡 {hint}</p>}
      <div className="space-y-2">
        {answers.map((answer, i) => (
          <AnswerOption key={i} text={answer} index={i} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}

interface MultipleChoiceChallengeProps {
  question: string;
  options: { text: string; correct: boolean }[];
  onCorrect: () => void;
  onWrong: () => void;
}

export function MultipleChoiceChallenge({
  question,
  options,
  onCorrect,
  onWrong,
}: MultipleChoiceChallengeProps) {
  const handleSelect = (index: number) => {
    if (options[index].correct) onCorrect();
    else onWrong();
  };

  return (
    <div className="space-y-4">
      <p className="font-display font-semibold text-cream">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <AnswerOption key={i} text={opt.text} index={i} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}

interface BossBattleProps {
  bossName: string;
  bossHp: number;
  damagePerHit: number;
  questions: { question: string; answers: string[]; correctAnswer: number }[];
  onDefeated: () => void;
  onCorrect: () => void;
  onWrong: () => void;
}

export function BossBattle({
  bossName,
  bossHp,
  damagePerHit,
  questions,
  onDefeated,
  onCorrect,
  onWrong,
}: BossBattleProps) {
  const [hp, setHp] = useState(bossHp);
  const [qIndex, setQIndex] = useState(0);
  const [defeated, setDefeated] = useState(false);

  const handleAnswer = (index: number) => {
    const q = questions[qIndex];
    if (index === q.correctAnswer) {
      onCorrect();
      const newHp = Math.max(0, hp - damagePerHit);
      setHp(newHp);
      if (newHp <= 0) {
        setDefeated(true);
        setTimeout(onDefeated, 1500);
      } else {
        setQIndex((i) => Math.min(i + 1, questions.length - 1));
      }
    } else {
      onWrong();
    }
  };

  if (defeated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 0] }}
          transition={{ duration: 1 }}
          className="text-6xl mb-4"
        >
          👻
        </motion.div>
        <p className="font-display text-xl text-gold-warm font-bold">Čuvar poražen!</p>
      </motion.div>
    );
  }

  const q = questions[qIndex];

  return (
    <div className="space-y-4">
      <div className="cozy-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-bold text-rose-300">{bossName}</span>
          <span className="text-xs text-cream/60">HP: {hp}/{bossHp}</span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 to-rose-400"
            animate={{ width: `${(hp / bossHp) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
      <p className="font-display font-semibold">{q.question}</p>
      <div className="space-y-2">
        {q.answers.map((a, i) => (
          <AnswerOption key={i} text={a} index={i} onSelect={handleAnswer} />
        ))}
      </div>
    </div>
  );
}

interface SecretCodeProps {
  hint: string;
  secretCode: string;
  onCorrect: () => void;
  onWrong: () => void;
}

export function SecretCodeChallenge({ hint, secretCode, onCorrect, onWrong }: SecretCodeProps) {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (code.trim() === secretCode) onCorrect();
    else {
      onWrong();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-cream/70">{hint}</p>
      <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}>
        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Unesi tajni kod..."
          className="w-full cozy-card rounded-2xl px-4 py-3 text-center text-lg font-display tracking-widest bg-transparent outline-none focus:border-gold-warm/50"
        />
      </motion.div>
      <GameButton onClick={submit} className="w-full">
        Otvori trezor 🔐
      </GameButton>
    </div>
  );
}

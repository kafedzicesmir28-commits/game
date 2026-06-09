import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import {
  BossBattle,
  MultipleChoiceChallenge,
  QuestionChallenge,
  SecretCodeChallenge,
} from "@/components/challenges/QuestionChallenge";
import { FutureQuestions } from "@/components/challenges/FutureQuestions";
import { HeartCollection } from "@/components/challenges/HeartCollection";
import { HiddenHearts } from "@/components/challenges/HiddenHearts";
import { MemoryPuzzle } from "@/components/challenges/MemoryPuzzle";
import { MemoryDetective } from "@/components/challenges/MemoryDetective";
import { ConversationReconstruct } from "@/components/challenges/ConversationReconstruct";
import { ImageJigsawPuzzle } from "@/components/challenges/ImageJigsawPuzzle";
import { CipherDecrypt } from "@/components/challenges/CipherDecrypt";
import { HeartRun } from "@/components/challenges/HeartRun";
import { getHeartRunConfig } from "@/types/heartRun";
import { GameButton } from "@/components/ui/GameButton";
import { KeyReward } from "@/components/ui/KeyReward";
import { StoryCard } from "@/components/ui/StoryCard";
import { getCipherLevel } from "@/types/cipher";
import {
  getLocation,
  getPhotosFromFolder,
  photoUrl,
  type LocationConfig,
} from "@/types/game";

interface LocationScreenProps {
  locationId: number;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: (keyName: string) => void;
  onOpenTreasure: () => void;
  playSfx: (name: "unlock" | "keyCollected" | "correct" | "treasure" | "wrong") => void;
}

export function LocationScreen({
  locationId,
  isCompleted,
  onClose,
  onComplete,
  onOpenTreasure,
  playSfx,
}: LocationScreenProps) {
  const location = getLocation(locationId);
  const [showKey, setShowKey] = useState(false);
  const [challengeDone, setChallengeDone] = useState(isCompleted);
  const [feedback, setFeedback] = useState<string | null>(null);

  const finishChallenge = useCallback(() => {
    if (!location || challengeDone) return;
    playSfx("keyCollected");
    setShowKey(true);
    setChallengeDone(true);
    setTimeout(() => {
      onComplete(location.keyName);
      playSfx("unlock");
    }, 2000);
  }, [location, challengeDone, onComplete, playSfx]);

  const handleCorrect = useCallback(() => {
    playSfx("correct");
    setFeedback("Tačno! 💕");
    setTimeout(() => setFeedback(null), 1500);
  }, [playSfx]);

  const handleWrong = useCallback(() => {
    playSfx("wrong");
    setFeedback("Nije baš to — pokušaj ponovo! 💭");
    setTimeout(() => setFeedback(null), 1500);
  }, [playSfx]);

  if (!location) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      className="fixed inset-0 z-40 game-gradient-bg flex flex-col safe-x"
    >
      <header className="flex items-center justify-between pt-3 pb-2 shrink-0 safe-top">
        <GameButton variant="ghost" size="sm" onClick={onClose}>
          ← Mapa
        </GameButton>
        <h2 className="font-display font-bold text-gold-warm text-sm sm:text-base text-center flex-1 px-2">
          {location.title}
        </h2>
        <div className="w-16" />
      </header>

      <div className="flex-1 overflow-y-auto pb-4 space-y-3 safe-bottom overscroll-contain">
        {location.challengeType !== "heart-run" && (
          <StoryCard title="Naša priča">{location.story}</StoryCard>
        )}
        {location.challengeType === "heart-run" && (
          <p className="text-xs text-cream/70 text-center px-1 leading-relaxed">{location.story}</p>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-rose-200"
            >
              {feedback}
            </motion.p>
          )}
        </AnimatePresence>

        {!challengeDone && (
          <div className={`cozy-card rounded-3xl ${location.challengeType === "heart-run" ? "p-3" : "p-4 sm:p-5"}`}>
            {location.challengeType !== "heart-run" && (
              <h3 className="font-display font-bold text-lavender mb-3 text-sm sm:text-base">✨ Izazov</h3>
            )}
            <ChallengeContent
              location={location}
              onCorrect={() => {
                handleCorrect();
              }}
              onWrong={handleWrong}
              onComplete={finishChallenge}
              onOpenTreasure={onOpenTreasure}
              playSfx={playSfx}
            />
          </div>
        )}

        <KeyReward keyName={location.keyName} visible={showKey} />

        {challengeDone && !showKey && (
          <div className="text-center py-4">
            <p className="text-gold-warm font-display">✓ Završeno</p>
            <GameButton variant="secondary" onClick={onClose} className="mt-4">
              Nazad na mapu
            </GameButton>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ChallengeContentProps {
  location: LocationConfig;
  onCorrect: () => void;
  onWrong: () => void;
  onComplete: () => void;
  onOpenTreasure: () => void;
  playSfx: (name: "unlock" | "keyCollected" | "correct" | "treasure" | "wrong") => void;
}

function ChallengeContent({
  location,
  onCorrect,
  onWrong,
  onComplete,
  onOpenTreasure,
  playSfx,
}: ChallengeContentProps) {
  switch (location.challengeType) {
    case "memory-detective": {
      const folder = location.photosFolder!;
      const photo = location.detectivePhoto ?? "01.jpg";
      return (
        <MemoryDetective
          imageSrc={photoUrl(folder, photo)}
          hotspots={location.detectiveHotspots ?? []}
          wrongClickMessage={location.wrongClickMessage ?? "Nema ništa ovdje… pokušaj ponovo ❤️"}
          onComplete={() => {
            onCorrect();
            onComplete();
          }}
        />
      );
    }

    case "conversation-reconstruct":
      return (
        <ConversationReconstruct
          messages={location.conversationMessages ?? []}
          hintText={location.conversationHint ?? location.hint}
          onComplete={() => {
            onCorrect();
            onComplete();
          }}
        />
      );

    case "image-jigsaw": {
      const folder = location.photosFolder!;
      const photo = location.jigsawPhoto ?? "01.jpg";
      return (
        <ImageJigsawPuzzle
          imageSrc={photoUrl(folder, photo)}
          grid={location.jigsawGrid ?? 5}
          romanticMessage={location.jigsawMessage ?? "Volim te 💕"}
          onSnap={onCorrect}
          onComplete={() => {
            onCorrect();
            onComplete();
          }}
        />
      );
    }

    case "heart-run": {
      const runConfig = getHeartRunConfig(location.id);
      if (!runConfig) return <p className="text-cream/60 text-sm">Konfiguracija igre nije pronađena.</p>;
      return (
        <HeartRun
          config={runConfig}
          onHit={onWrong}
          onCollect={onCorrect}
          onComplete={() => {
            onCorrect();
            onComplete();
          }}
        />
      );
    }

    case "cipher-decrypt": {
      const cipherLevel = getCipherLevel(location.id);
      if (!cipherLevel) return <p className="text-cream/60 text-sm">Konfiguracija šifre nije pronađena.</p>;
      return (
        <CipherDecrypt
          config={cipherLevel}
          onComplete={onComplete}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }

    case "question":
      return (
        <QuestionChallenge
          question={location.question!}
          answers={location.answers!}
          correctAnswer={location.correctAnswer!}
          hint={location.hint}
          onCorrect={() => {
            onCorrect();
            onComplete();
          }}
          onWrong={onWrong}
        />
      );

    case "multiple-choice":
      return (
        <MultipleChoiceChallenge
          question={location.question!}
          options={location.options!}
          onCorrect={() => {
            onCorrect();
            onComplete();
          }}
          onWrong={onWrong}
        />
      );

    case "boss":
      return (
        <BossBattle
          bossName={location.bossName!}
          bossHp={location.bossHp!}
          damagePerHit={location.damagePerHit!}
          questions={location.questions as { question: string; answers: string[]; correctAnswer: number }[]}
          onDefeated={onComplete}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );

    case "puzzle": {
      const folder = location.photosFolder!;
      const order = location.photoOrder!;
      const photos = getPhotosFromFolder(folder, order);
      const correctOrder = order.map((f) => photoUrl(folder, f));
      return (
        <MemoryPuzzle photos={photos} correctOrder={correctOrder} onComplete={onComplete} />
      );
    }

    case "code":
      return (
        <SecretCodeChallenge
          hint={location.codeHint!}
          secretCode={location.secretCode!}
          onCorrect={() => {
            onCorrect();
            onComplete();
          }}
          onWrong={onWrong}
        />
      );

    case "hearts": {
      const folder = location.photosFolder!;
      const photos = (location.photoOrder ?? ["01.jpg", "02.jpg", "03.jpg", "04.jpg"]).map((f) =>
        photoUrl(folder, f),
      );
      return (
        <HeartCollection
          photos={photos}
          messages={location.messages ?? []}
          heartsToCollect={location.heartsToCollect ?? 5}
          onComplete={onComplete}
        />
      );
    }

    case "future":
      return (
        <FutureQuestions
          questions={
            location.questions as { question: string; answers: string[]; correctAnswer: number }[]
          }
          onComplete={onComplete}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );

    case "hidden-hearts":
      return (
        <HiddenHearts heartsToFind={location.heartsToFind ?? 6} onComplete={onComplete} />
      );

    case "treasure":
      return (
        <TreasureChest
          onOpen={() => {
            playSfx("treasure");
            onOpenTreasure();
          }}
        />
      );

    default:
      return null;
  }
}

function TreasureChest({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);

  const open = () => {
    setOpening(true);
    setTimeout(onOpen, 1200);
  };

  return (
    <div className="flex flex-col items-center py-8">
      <motion.button
        onClick={open}
        disabled={opening}
        animate={opening ? { scale: [1, 1.2, 0.9], rotate: [0, -5, 5, 0] } : { y: [0, -4, 0] }}
        transition={opening ? { duration: 1 } : { duration: 2, repeat: Infinity }}
        className="text-7xl sm:text-8xl disabled:pointer-events-none"
      >
        {opening ? "✨" : "🎁"}
      </motion.button>
      <p className="mt-4 font-display text-gold-warm">
        {opening ? "Otvaranje..." : "Dodirni škrinju da otkriješ poklon"}
      </p>
    </div>
  );
}

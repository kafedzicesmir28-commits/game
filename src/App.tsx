import { AnimatePresence } from "framer-motion";
import { AchievementPopup } from "@/components/ui/AchievementPopup";
import { useAudio } from "@/hooks/useAudio";
import { useGameState } from "@/hooks/useGameState";
import { LoadingScreen } from "@/screens/LoadingScreen";
import { LocationScreen } from "@/screens/LocationScreen";
import { OpeningScene } from "@/screens/OpeningScene";
import { TreasureScreen } from "@/screens/TreasureScreen";
import { WorldMap } from "@/screens/WorldMap";

export default function App() {
  const game = useGameState();
  const { playSfx } = useAudio(game.save.musicEnabled, game.save.sfxEnabled);

  return (
    <>
      <AnimatePresence mode="wait">
        {game.phase === "loading" && <LoadingScreen key="loading" />}
        {game.phase === "opening" && (
          <OpeningScene key="opening" onStart={game.startAdventure} />
        )}
      </AnimatePresence>

      {(game.phase === "map" || game.phase === "location") && (
        <WorldMap
          save={game.save}
          progress={game.progress}
          onMove={game.moveCharacter}
          onSelectLocation={game.openLocation}
          onToggleMusic={game.toggleMusic}
          onToggleSfx={game.toggleSfx}
          musicEnabled={game.save.musicEnabled}
          sfxEnabled={game.save.sfxEnabled}
        />
      )}

      <AnimatePresence>
        {game.phase === "location" && game.activeLocationId && (
          <LocationScreen
            key={game.activeLocationId}
            locationId={game.activeLocationId}
            isCompleted={game.save.completedLocations.includes(game.activeLocationId)}
            onClose={game.closeLocation}
            onComplete={(keyName) => game.completeLocation(game.activeLocationId!, keyName)}
            onOpenTreasure={() => {
              game.completeLocation(10, "Blago srca");
              game.openTreasure();
            }}
            playSfx={playSfx}
          />
        )}
      </AnimatePresence>

      {game.phase === "treasure" && (
        <TreasureScreen
          onReturn={() => game.setPhase("map")}
          onReset={game.resetProgress}
        />
      )}

      <AchievementPopup
        title={game.achievement?.title ?? ""}
        description={game.achievement?.description ?? ""}
        visible={!!game.achievement}
      />
    </>
  );
}

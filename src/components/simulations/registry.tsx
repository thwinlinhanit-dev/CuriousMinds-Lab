"use client";
import React from "react";
import {
  ProjectileMotion, PendulumLab, CircuitBuilder, WaveSimulator,
  GravityOrbits, RampFriction, BalanceLevers, CollisionLab,
} from "./physics";
import { AtomBuilder, MoleculeBuilder3D, ReactionLab, PhExplorer, StatesOfMatter } from "./chemistry";
import { CellExplorer, EcosystemBuilder, GeneticsCreator, HumanBody, PlantGrowth } from "./biology";
import { SolarSystem3D, VolcanoSimulator, WeatherStation, RockCycle } from "./earthspace";
import {
  FractionVisualizer, GeometryPlayground, NumberLine, PatternExplorer,
  ProbabilityLab, GraphingTool, SymmetryStudio, FractalExplorer,
} from "./math";
import { PianoLab, BeatSequencer, ScaleExplorer, MelodyComposer, SoundWaveforms, EarTraining } from "./music";
import { DrawingCanvas, ColorLab, GeometricArt, PixelArt, Spirograph, Flipbook } from "./art";
import {
  BlockCoding, TurtleGraphics, PythonPlayground, AlgorithmVisualizer,
  LogicGates, BinaryExplorer, WebBuilder, AIPlayground,
} from "./cs";
import { WordExplorer, StoryWriter, PoetryLab, GrammarQuest } from "./language";
import { OpticsBench, MagnetLab, BuoyancyLab, PulleyWorkshop, HeatLab } from "./physics2";
import { PeriodicTable, MixSeparate, BatteryLab, PolymerLab } from "./chemistry2";
import { DinoDig, SensesLab, GermDefense, LifeCycleSpinner, NaturalSelection } from "./biology2";
import { MoonPhases, SeasonsSpinner, QuakeLab, WaterCycle, ConstellationStudio } from "./earthspace2";
import { TimesDojo, MoneyMarket, ClockWorkshop, Shapes3D, LogicPuzzles } from "./math2";
import { ChordStudio, RhythmReader, GenreMachine } from "./music2";
import { PerspectiveStudio, PrintmakingPress, Sculpture3D, ArtHistory } from "./art2";
import { InternetJourney, SecurityLab, RobotSimulator, GameDesigner, DatabaseDetective } from "./cs2";
import { SpellingBee, ReadingDetectives, TypeRacer, WorldLanguages } from "./language2";
import { PhetEmbed } from "./phet";
import { EmbedLab } from "./embed";
import { FlagQuiz, CapitalMatch } from "./geography";
import { GeogebraLab } from "./geogebra";

const REGISTRY: Record<string, React.ComponentType<{ moduleId: string }>> = {
  "projectile-motion": ProjectileMotion, "pendulum-lab": PendulumLab, "circuit-builder": CircuitBuilder,
  "wave-simulator": WaveSimulator, "gravity-orbits": GravityOrbits, "ramp-friction": RampFriction,
  "balance-levers": BalanceLevers, "collision-lab": CollisionLab,
  "atom-builder": AtomBuilder, "molecule-builder-3d": MoleculeBuilder3D, "reaction-lab": ReactionLab,
  "ph-explorer": PhExplorer, "states-of-matter": StatesOfMatter,
  "cell-explorer": CellExplorer, "ecosystem-builder": EcosystemBuilder, "genetics-creator": GeneticsCreator,
  "human-body": HumanBody, "plant-growth": PlantGrowth,
  "solar-system-3d": SolarSystem3D, "volcano-simulator": VolcanoSimulator, "weather-station": WeatherStation,
  "rock-cycle": RockCycle,
  "fraction-visualizer": FractionVisualizer, "geometry-playground": GeometryPlayground, "number-line": NumberLine,
  "pattern-explorer": PatternExplorer, "probability-lab": ProbabilityLab, "graphing-tool": GraphingTool,
  "symmetry-studio": SymmetryStudio, "fractal-explorer": FractalExplorer,
  "piano-lab": PianoLab, "beat-sequencer": BeatSequencer, "scale-explorer": ScaleExplorer,
  "melody-composer": MelodyComposer, "sound-waveforms": SoundWaveforms, "ear-training": EarTraining,
  "drawing-canvas": DrawingCanvas, "color-lab": ColorLab, "geometric-art": GeometricArt,
  "pixel-art": PixelArt, "spirograph": Spirograph, "flipbook": Flipbook,
  "block-coding": BlockCoding, "turtle-graphics": TurtleGraphics, "python-playground": PythonPlayground,
  "algorithm-visualizer": AlgorithmVisualizer, "logic-gates": LogicGates, "binary-explorer": BinaryExplorer,
  "web-builder": WebBuilder, "ai-playground": AIPlayground,
  "word-explorer": WordExplorer, "story-writer": StoryWriter, "poetry-lab": PoetryLab,
  "grammar-quest": GrammarQuest,
  "optics-bench": OpticsBench, "magnet-lab": MagnetLab, "buoyancy-lab": BuoyancyLab,
  "pulley-workshop": PulleyWorkshop, "heat-lab": HeatLab,
  "periodic-table": PeriodicTable, "mix-separate": MixSeparate, "battery-lab": BatteryLab,
  "polymer-lab": PolymerLab,
  "dino-dig": DinoDig, "senses-lab": SensesLab, "germ-defense": GermDefense,
  "lifecycle-spinner": LifeCycleSpinner, "natural-selection": NaturalSelection,
  "moon-phases": MoonPhases, "seasons-spinner": SeasonsSpinner, "quake-lab": QuakeLab,
  "water-cycle": WaterCycle, "constellation-studio": ConstellationStudio,
  "times-dojo": TimesDojo, "money-market": MoneyMarket, "clock-workshop": ClockWorkshop,
  "shapes-3d": Shapes3D, "logic-puzzles": LogicPuzzles,
  "chord-studio": ChordStudio, "rhythm-reader": RhythmReader, "genre-machine": GenreMachine,
  "perspective-studio": PerspectiveStudio, "printmaking-press": PrintmakingPress,
  "sculpture-3d": Sculpture3D, "art-history": ArtHistory,
  "internet-journey": InternetJourney, "security-lab": SecurityLab, "robot-simulator": RobotSimulator,
  "game-designer": GameDesigner, "database-detective": DatabaseDetective,
  "spelling-bee": SpellingBee, "reading-detectives": ReadingDetectives, "type-racer": TypeRacer,
  "world-languages": WorldLanguages,
  "phet-embed": PhetEmbed,
  "embed-lab": EmbedLab,
  "flag-quiz": FlagQuiz,
  "capital-match": CapitalMatch,
  "geogebra-lab": GeogebraLab,
};

export function SimulationRenderer({ type, moduleId }: { type: string; moduleId: string }) {
  const Comp = REGISTRY[type];
  if (!Comp) return <div className="p-8 text-center">🔧 Simulation "{type}" is being built. Check back soon!</div>;
  return <Comp moduleId={moduleId} />;
}

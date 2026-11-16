import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceStolen from '../AdvanceStolen';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';

/** The advances `victim` knows and `thief` doesn't, other than repeatable ones: what a Diplomat could steal. */
export const stealableAdvances = (
  thief: Player,
  victim: Player,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
): (typeof Advance)[] => {
  // Either without research (as a test may make them) has nothing to steal, rather than making the lookup throw.
  try {
    const thiefResearch = playerResearchRegistry.getByPlayer(thief);

    return playerResearchRegistry
      .getByPlayer(victim)
      .complete()
      .map((advance: Advance): typeof Advance => advance.sourceClass())
      .filter(
        (AdvanceType: typeof Advance): boolean =>
          !AdvanceType.repeatable && !thiefResearch.completed(AdvanceType)
      );
  } catch (e) {
    return [];
  }
};

export interface FirstStealableAdvanceOptions {
  playerResearchRegistry?: PlayerResearchRegistry;
  // Whether nothing can be taken between these two at all (Civ1: when either is the Barbarians). Asked after the draw,
  //  which is always made.
  refuses?: (thief: Player, victim: Player) => boolean;
}

/**
 * The advance `thief` takes from `victim` as the originals pick it: one draw for a start among `order`'s slots, then
 * the first advance, walking on from there and round, that `victim` knows and `thief` doesn't. `order` is the rule
 * set's table of advances (a `null` slot is never known); any other advance `thief` could take (another package's) is
 * walked after the table, in the order `victim` learnt it, though the start is drawn over the table only. So an
 * advance after a run `thief` already knows is likelier. `null` if there is nothing to take, or the pair `refuses`.
 */
export const firstStealableAdvance = (
  thief: Player,
  victim: Player,
  order: (typeof Advance | null)[],
  randomNumberGenerator: () => number,
  {
    playerResearchRegistry = playerResearchRegistryInstance,
    refuses = (): boolean => false,
  }: FirstStealableAdvanceOptions = {}
): typeof Advance | null => {
  const start = Math.floor(randomNumberGenerator() * order.length);

  if (refuses(thief, victim)) {
    return null;
  }

  const stealable = stealableAdvances(thief, victim, playerResearchRegistry),
    walk = [
      ...order,
      ...stealable.filter(
        (AdvanceType: typeof Advance): boolean => !order.includes(AdvanceType)
      ),
    ];

  for (let i = 0; i < walk.length; i++) {
    const AdvanceType = walk[(start + i) % walk.length];

    if (AdvanceType !== null && stealable.includes(AdvanceType)) {
      return AdvanceType;
    }
  }

  return null;
};

/** What the registries a theft changes are. */
export interface StealAdvanceDependencies {
  engine?: Engine;
  interactionRegistry?: InteractionRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  ruleRegistry?: RuleRegistry;
  turn?: Turn;
}

/**
 * `thief` takes `AdvanceType` from `victim`'s `city`: it learns the advance, the city is marked as robbed (an
 * `AdvanceStolen`, which a rule set may clear when the city changes hands) and `player:advance-stolen` is emitted.
 */
export const stealAdvance = (
  thief: Player,
  victim: Player,
  city: City,
  AdvanceType: typeof Advance,
  {
    engine = engineInstance,
    interactionRegistry = interactionRegistryInstance,
    playerResearchRegistry = playerResearchRegistryInstance,
    ruleRegistry = ruleRegistryInstance,
    turn = turnInstance,
  }: StealAdvanceDependencies = {}
): void => {
  playerResearchRegistry.getByPlayer(thief).addAdvance(AdvanceType);

  interactionRegistry.register(
    new AdvanceStolen(thief, victim, city, ruleRegistry, turn) as never
  );

  engine.emit('player:advance-stolen', thief, victim, AdvanceType, city);
};

export default stealAdvance;

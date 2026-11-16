import { Engine } from '@civ-clone/core-engine/Engine';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Advance from '@civ-clone/core-science/Advance';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
/** The advances `victim` knows and `thief` doesn't, other than repeatable ones: what a Diplomat could steal. */
export declare const stealableAdvances: (
  thief: Player,
  victim: Player,
  playerResearchRegistry?: PlayerResearchRegistry
) => (typeof Advance)[];
export interface FirstStealableAdvanceOptions {
  playerResearchRegistry?: PlayerResearchRegistry;
  refuses?: (thief: Player, victim: Player) => boolean;
}
/**
 * The advance `thief` takes from `victim` as the originals pick it: one draw for a start among `order`'s slots, then
 * the first advance, walking on from there and round, that `victim` knows and `thief` doesn't. `order` is the rule
 * set's table of advances (a `null` slot is never known); any other advance `thief` could take (another package's) is
 * walked after the table, in the order `victim` learnt it, though the start is drawn over the table only. So an
 * advance after a run `thief` already knows is likelier. `null` if there is nothing to take, or the pair `refuses`.
 */
export declare const firstStealableAdvance: (
  thief: Player,
  victim: Player,
  order: (typeof Advance | null)[],
  randomNumberGenerator: () => number,
  { playerResearchRegistry, refuses }?: FirstStealableAdvanceOptions
) => typeof Advance | null;
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
export declare const stealAdvance: (
  thief: Player,
  victim: Player,
  city: City,
  AdvanceType: typeof Advance,
  {
    engine,
    interactionRegistry,
    playerResearchRegistry,
    ruleRegistry,
    turn,
  }?: StealAdvanceDependencies
) => void;
export default stealAdvance;

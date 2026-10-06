import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
import StealTechnology from './StealTechnology';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
/** Stealing from a civilization the thief is at peace with, which ends the peace. */
export declare class SneakStealTechnology extends StealTechnology {
  private _enemy;
  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    city: City,
    enemy: Player,
    ruleRegistry?: RuleRegistry
  );
  enemy(): Player;
  forUnit(unit: Unit): Action;
}
export default SneakStealTechnology;

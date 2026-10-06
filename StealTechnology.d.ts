import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
/** A Diplomat steals an advance from `city()`'s owner. Which one, and whether there's anything to take, is up to the `TechnologyStolen` rules. The Diplomat is used up when something is stolen. */
export declare class StealTechnology extends Action {
  protected _city: City;
  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    city: City,
    ruleRegistry?: RuleRegistry
  );
  forUnit(unit: Unit): Action;
  perform(): void;
}
export default StealTechnology;

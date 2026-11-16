import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * A Diplomat steals an advance from `city()`'s owner. Which one, and whether there's anything to take, is up to the
 * `TechnologyStolen` rules, which are given the action, so they can read `chosenTarget()`.
 *
 * `perform(choice?)`, in order (base-unit-agent's seams; with none of their rules registered, only steps 3 and 4 do
 * anything, as before they existed):
 * 1. the Diplomat must survive a caught check (`AgentSurvives` with `CAUGHT_CHECK`), or it is destroyed;
 * 2. with no target chosen, the city's defenders may detect it (`MissionDetected`): it then loses its moves, and stays
 *    where it is;
 * 3. the `TechnologyStolen` rules; nothing stolen leaves the Diplomat where it is;
 * 4. `Moved`, then the Diplomat is used up unless it survives (`AgentSurvives`, `HARD` for a chosen target and
 *    `ORDINARY` otherwise).
 *
 * `choice` is one of `targets()` (the `MissionTargets` rules' answers), or its name. A choice that isn't among them is
 * ignored, so with no `MissionTargets` rules there's never a choice.
 */
export declare class StealTechnology extends Action {
  protected _city: City;
  private _chosenTarget;
  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    city: City,
    ruleRegistry?: RuleRegistry
  );
  forUnit(unit: Unit): Action;
  city(): City;
  /** The target chosen when this was performed, one of `targets()`; `undefined` when none was. */
  chosenTarget(): unknown;
  /** What the Diplomat may choose to steal: the `MissionTargets` rules' answers. Empty with no rules. */
  targets(): unknown[];
  perform(choice?: unknown): void;
}
export default StealTechnology;

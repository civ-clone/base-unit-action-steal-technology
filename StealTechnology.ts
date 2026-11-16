import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  CAUGHT_CHECK,
  HARD,
  ORDINARY,
} from '@civ-clone/base-unit-agent/lib/escape';
import {
  agentSurvives,
  chosenTarget,
  missionDetected,
  missionTargets,
} from '@civ-clone/base-unit-agent/lib/mission';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import TechnologyStolen from './Rules/TechnologyStolen';
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
export class StealTechnology extends Action {
  protected _city: City;
  // Declared, never initialised, so an action that was never given a choice has no field for it.
  private declare _chosenTarget: unknown;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    city: City,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super(from, to, unit, ruleRegistry);

    this._city = city;
  }

  // `Action.forUnit` rebuilds an action from `(from, to, unit, ruleRegistry)`, which would put the `RuleRegistry` where
  // the `City` goes.
  // Typed as `Action`: a subclass with a member of its own isn't assignable to it (civ-clone/web-renderer#21).
  forUnit(unit: Unit): Action {
    return new StealTechnology(
      this.from(),
      this.to(),
      unit,
      this._city,
      this.ruleRegistry()
    ) as unknown as Action;
  }

  city(): City {
    return this._city;
  }

  /** The target chosen when this was performed, one of `targets()`; `undefined` when none was. */
  chosenTarget(): unknown {
    return this._chosenTarget;
  }

  /** What the Diplomat may choose to steal: the `MissionTargets` rules' answers. Empty with no rules. */
  targets(): unknown[] {
    return missionTargets(
      this.unit(),
      this._city,
      this as unknown as Action,
      this.ruleRegistry()
    );
  }

  perform(choice?: unknown): void {
    const unit = this.unit(),
      mission = this as unknown as Action,
      ruleRegistry = this.ruleRegistry(),
      target =
        choice === undefined ? undefined : chosenTarget(choice, this.targets());

    if (target !== undefined) {
      this._chosenTarget = target;
    }

    if (!agentSurvives(unit, mission, CAUGHT_CHECK, ruleRegistry)) {
      ruleRegistry.process(Moved, unit, mission);

      unit.destroy();

      return;
    }

    if (
      target === undefined &&
      missionDetected(unit, this._city, mission, ruleRegistry)
    ) {
      unit.moves().set(0);

      return;
    }

    const results = ruleRegistry.process(
      TechnologyStolen,
      unit,
      this._city,
      this
    );

    // Nothing new to steal leaves the Diplomat where it is.
    if (!results.includes(true)) {
      return;
    }

    ruleRegistry.process(Moved, unit, mission);

    if (
      !agentSurvives(
        unit,
        mission,
        target === undefined ? ORDINARY : HARD,
        ruleRegistry
      )
    ) {
      unit.destroy();
    }
  }
}

export default StealTechnology;

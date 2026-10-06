import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import TechnologyStolen from './Rules/TechnologyStolen';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

/** A Diplomat steals an advance from `city()`'s owner. Which one, and whether there's anything to take, is up to the `TechnologyStolen` rules. The Diplomat is used up when something is stolen. */
export class StealTechnology extends Action {
  protected _city: City;

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

  perform(): void {
    const results = this.ruleRegistry().process(
      TechnologyStolen,
      this.unit(),
      this._city
    );

    // Nothing new to steal leaves the Diplomat where it is.
    if (!results.includes(true)) {
      return;
    }

    this.ruleRegistry().process(Moved, this.unit(), this as unknown as Action);

    this.unit().destroy();
  }
}

export default StealTechnology;

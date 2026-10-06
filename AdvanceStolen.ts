import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import City from '@civ-clone/core-city/City';
import Interaction from '@civ-clone/core-diplomacy/Interaction';
import Player from '@civ-clone/core-player/Player';

/**
 * A record that `thief()` stole an advance from `victim()` in `city()`, so a city can be robbed only once. What
 * clears it (v474.05: the city changing hands) is up to the ruleset.
 */
export class AdvanceStolen extends Interaction {
  private _city: City;
  private _thief: Player;
  private _victim: Player;

  constructor(
    thief: Player,
    victim: Player,
    city: City,
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    turn: Turn = turnInstance
  ) {
    super(thief, victim, ruleRegistry, turn);

    this._city = city;
    this._thief = thief;
    this._victim = victim;

    this.addKey('city', 'thief', 'victim');
  }

  city(): City {
    return this._city;
  }

  thief(): Player {
    return this._thief;
  }

  victim(): Player {
    return this._victim;
  }
}

export default AdvanceStolen;

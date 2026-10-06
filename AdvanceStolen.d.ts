import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import City from '@civ-clone/core-city/City';
import Interaction from '@civ-clone/core-diplomacy/Interaction';
import Player from '@civ-clone/core-player/Player';
/**
 * A record that `thief()` stole an advance from `victim()` in `city()`, so a city can be robbed only once. What
 * clears it (v474.05: the city changing hands) is up to the ruleset.
 */
export declare class AdvanceStolen extends Interaction {
  private _city;
  private _thief;
  private _victim;
  constructor(
    thief: Player,
    victim: Player,
    city: City,
    ruleRegistry?: RuleRegistry,
    turn?: Turn
  );
  city(): City;
  thief(): Player;
  victim(): Player;
}
export default AdvanceStolen;

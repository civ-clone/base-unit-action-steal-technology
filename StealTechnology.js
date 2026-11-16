"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StealTechnology = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const escape_1 = require("@civ-clone/base-unit-agent/lib/escape");
const mission_1 = require("@civ-clone/base-unit-agent/lib/mission");
const Action_1 = require("@civ-clone/core-unit/Action");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const TechnologyStolen_1 = require("./Rules/TechnologyStolen");
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
class StealTechnology extends Action_1.default {
    constructor(from, to, unit, city, ruleRegistry = RuleRegistry_1.instance) {
        super(from, to, unit, ruleRegistry);
        this._city = city;
    }
    // `Action.forUnit` rebuilds an action from `(from, to, unit, ruleRegistry)`, which would put the `RuleRegistry` where
    // the `City` goes.
    // Typed as `Action`: a subclass with a member of its own isn't assignable to it (civ-clone/web-renderer#21).
    forUnit(unit) {
        return new StealTechnology(this.from(), this.to(), unit, this._city, this.ruleRegistry());
    }
    city() {
        return this._city;
    }
    /** The target chosen when this was performed, one of `targets()`; `undefined` when none was. */
    chosenTarget() {
        return this._chosenTarget;
    }
    /** What the Diplomat may choose to steal: the `MissionTargets` rules' answers. Empty with no rules. */
    targets() {
        return (0, mission_1.missionTargets)(this.unit(), this._city, this, this.ruleRegistry());
    }
    perform(choice) {
        const unit = this.unit(), mission = this, ruleRegistry = this.ruleRegistry(), target = choice === undefined ? undefined : (0, mission_1.chosenTarget)(choice, this.targets());
        if (target !== undefined) {
            this._chosenTarget = target;
        }
        if (!(0, mission_1.agentSurvives)(unit, mission, escape_1.CAUGHT_CHECK, ruleRegistry)) {
            ruleRegistry.process(Moved_1.default, unit, mission);
            unit.destroy();
            return;
        }
        if (target === undefined &&
            (0, mission_1.missionDetected)(unit, this._city, mission, ruleRegistry)) {
            unit.moves().set(0);
            return;
        }
        const results = ruleRegistry.process(TechnologyStolen_1.default, unit, this._city, this);
        // Nothing new to steal leaves the Diplomat where it is.
        if (!results.includes(true)) {
            return;
        }
        ruleRegistry.process(Moved_1.default, unit, mission);
        if (!(0, mission_1.agentSurvives)(unit, mission, target === undefined ? escape_1.ORDINARY : escape_1.HARD, ruleRegistry)) {
            unit.destroy();
        }
    }
}
exports.StealTechnology = StealTechnology;
exports.default = StealTechnology;
//# sourceMappingURL=StealTechnology.js.map
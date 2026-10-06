"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StealTechnology = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Action_1 = require("@civ-clone/core-unit/Action");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const TechnologyStolen_1 = require("./Rules/TechnologyStolen");
/** A Diplomat steals an advance from `city()`'s owner. Which one, and whether there's anything to take, is up to the `TechnologyStolen` rules. The Diplomat is used up when something is stolen. */
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
    perform() {
        const results = this.ruleRegistry().process(TechnologyStolen_1.default, this.unit(), this._city);
        // Nothing new to steal leaves the Diplomat where it is.
        if (!results.includes(true)) {
            return;
        }
        this.ruleRegistry().process(Moved_1.default, this.unit(), this);
        this.unit().destroy();
    }
}
exports.StealTechnology = StealTechnology;
exports.default = StealTechnology;
//# sourceMappingURL=StealTechnology.js.map
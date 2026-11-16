import City from '@civ-clone/core-city/City';
import AgentSurvives from '@civ-clone/base-unit-agent/Rules/AgentSurvives';
import MissionDetected from '@civ-clone/base-unit-agent/Rules/MissionDetected';
import MissionTargets from '@civ-clone/base-unit-agent/Rules/MissionTargets';
import SneakStealTechnology from '../SneakStealTechnology';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import TechnologyStolen from '../Rules/TechnologyStolen';
import StealTechnology from '../StealTechnology';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import UnitAction from '@civ-clone/core-unit/Action';
import World from '@civ-clone/core-world/World';
import { EscapeMode } from '@civ-clone/base-unit-agent/lib/escape';
import { expect } from 'chai';

class Diplomat extends Unit {}

export const setUp = (answer: boolean | null) => {
  const ruleRegistry = new RuleRegistry(),
    tile = (x: number): Tile =>
      new Tile(x, 0, new Terrain(), null as unknown as World, ruleRegistry),
    player = new Player(),
    host = new Player(),
    from = tile(0),
    to = tile(1),
    city = { player: () => host, tile: () => to } as unknown as City,
    unit = new Diplomat(null, player, from, ruleRegistry),
    log: string[] = [],
    chosen: unknown[] = [];

  ruleRegistry.register(
    new Moved(
      new Effect((moved: Unit, action: UnitAction): void => {
        log.push(
          `moved ${moved === unit} ${action instanceof StealTechnology}`
        );
      })
    ),
    new Destroyed(
      new Effect((destroyed: Unit, by: Player | null): void => {
        log.push(`destroyed ${destroyed === unit} ${by}`);
      })
    )
  );

  if (answer !== null) {
    ruleRegistry.register(
      new TechnologyStolen(
        new Effect((by: Unit, at: City, action?: StealTechnology): boolean => {
          log.push(`stolen ${by === unit} ${at === city}`);
          chosen.push(action?.chosenTarget());

          return answer;
        })
      )
    );
  }

  const action = new StealTechnology(from, to, unit, city, ruleRegistry);

  return { action, chosen, city, from, log, ruleRegistry, to, unit };
};

describe('StealTechnology', (): void => {
  it('uses the Diplomat up once an advance is stolen: the rules, then `Moved`, then destroyed by no one', (): void => {
    const { action, log, unit } = setUp(true);

    action.perform();

    expect(log).to.deep.equal([
      'stolen true true',
      'moved true true',
      'destroyed true null',
    ]);
  });

  it('leaves the Diplomat where it is when nothing is stolen', (): void => {
    const refused = setUp(false),
      none = setUp(null);

    refused.action.perform();
    none.action.perform();

    expect(refused.log).to.deep.equal(['stolen true true']);
    expect(none.log).to.deep.equal([]);
  });

  it('rebuilds itself for another unit with the same city and rule registry', (): void => {
    const { action, city, ruleRegistry, unit } = setUp(true),
      other = new Diplomat(null, unit.player(), unit.tile(), ruleRegistry),
      rebuilt = action.forUnit(other) as unknown as StealTechnology;

    expect(rebuilt).to.instanceOf(StealTechnology);
    expect(rebuilt.unit()).to.equal(other);
    expect((rebuilt as unknown as { _city: City })._city).to.equal(city);
    expect(rebuilt.ruleRegistry()).to.equal(ruleRegistry);
  });

  describe('with `AgentSurvives` rules', (): void => {
    const survives = (
      set: ReturnType<typeof setUp>,
      answer: (mode: EscapeMode) => boolean
    ): void => {
      set.ruleRegistry.register(
        new AgentSurvives(
          new Effect((unit: Unit, mission: UnitAction, mode: EscapeMode) => {
            set.log.push(
              `asked ${unit === set.unit} ${mission === set.action} ${mode}`
            );

            return answer(mode);
          })
        )
      );
    };

    it('keeps a Diplomat that survives, after a caught check before the mission and an ordinary one after', (): void => {
      const set = setUp(true);

      survives(set, (): boolean => true);
      set.action.perform();

      expect(set.log).to.deep.equal([
        'asked true true -1',
        'stolen true true',
        'moved true true',
        'asked true true 0',
      ]);
    });

    it('destroys a Diplomat that is caught, before the mission', (): void => {
      const set = setUp(true);

      survives(set, (mode: EscapeMode): boolean => mode !== -1);
      set.action.perform();

      expect(set.log).to.deep.equal([
        'asked true true -1',
        'moved true true',
        'destroyed true null',
      ]);
    });

    it('destroys a Diplomat that does not escape, after the mission', (): void => {
      const set = setUp(true);

      survives(set, (mode: EscapeMode): boolean => mode === -1);
      set.action.perform();

      expect(set.log).to.deep.equal([
        'asked true true -1',
        'stolen true true',
        'moved true true',
        'asked true true 0',
        'destroyed true null',
      ]);
    });
  });

  describe('targets', (): void => {
    class Writing {}
    class Currency {}

    const withTargets = (set: ReturnType<typeof setUp>): void => {
      set.ruleRegistry.register(
        new MissionTargets(
          new Criterion(
            (unit: Unit, city: City, mission: UnitAction): boolean =>
              unit === set.unit && city === set.city && mission === set.action
          ),
          new Effect((): unknown[] => [Writing, Currency])
        )
      );
    };

    it('offers nothing with no `MissionTargets` rules, and ignores a choice', (): void => {
      const set = setUp(true);

      expect(set.action.targets()).to.deep.equal([]);

      set.action.perform('Writing');

      expect(set.action.chosenTarget()).to.undefined;
      expect(set.chosen).to.deep.equal([undefined]);
    });

    it("hands the rules the player's choice, by itself or its name", (): void => {
      const byName = setUp(true),
        byClass = setUp(true),
        unknown = setUp(true);

      [byName, byClass, unknown].forEach(withTargets);

      expect(byName.action.targets()).to.deep.equal([Writing, Currency]);

      byName.action.perform('Currency');
      byClass.action.perform(Writing);
      unknown.action.perform('Pottery');

      expect(byName.chosen).to.deep.equal([Currency]);
      expect(byClass.chosen).to.deep.equal([Writing]);
      expect(unknown.chosen).to.deep.equal([undefined]);
    });

    it('asks for a hard escape after a chosen theft, and is not detected', (): void => {
      const set = setUp(true),
        modes: number[] = [];

      withTargets(set);
      set.ruleRegistry.register(
        new MissionDetected(new Effect((): boolean => true)),
        new AgentSurvives(
          new Effect((unit: Unit, mission: UnitAction, mode: EscapeMode) => {
            modes.push(mode);

            return true;
          })
        )
      );
      set.action.perform('Writing');

      expect(modes).to.deep.equal([-1, 1]);
      expect(set.log).to.deep.equal(['stolen true true', 'moved true true']);
    });
  });

  describe('detection', (): void => {
    it("stops a theft the city's defenders detect: the thief loses its moves and stays", (): void => {
      const set = setUp(true),
        detected: [Unit, City, UnitAction][] = [];

      set.unit.moves().set(2);
      set.ruleRegistry.register(
        new MissionDetected(
          new Effect((unit: Unit, city: City, mission: UnitAction): boolean => {
            detected.push([unit, city, mission]);

            return true;
          })
        )
      );
      set.action.perform();

      expect(detected).to.deep.equal([[set.unit, set.city, set.action]]);
      expect(set.log).to.deep.equal([]);
      expect(set.unit.moves().value()).to.equal(0);
    });

    it('lets a theft through that no rule detects', (): void => {
      const set = setUp(true);

      set.ruleRegistry.register(
        new MissionDetected(new Effect((): boolean => false))
      );
      set.action.perform();

      expect(set.log).to.deep.equal([
        'stolen true true',
        'moved true true',
        'destroyed true null',
      ]);
    });
  });

  describe('SneakStealTechnology', (): void => {
    it('rebuilds itself with its enemy, and steals as a theft does', (): void => {
      const set = setUp(true),
        sneak = new SneakStealTechnology(
          set.from,
          set.to,
          set.unit,
          set.city,
          set.city.player(),
          set.ruleRegistry
        ),
        other = new Diplomat(
          null,
          set.unit.player(),
          set.from,
          set.ruleRegistry
        ),
        rebuilt = sneak.forUnit(other) as unknown as SneakStealTechnology;

      expect(rebuilt).to.instanceOf(SneakStealTechnology);
      expect(rebuilt.enemy()).to.equal(set.city.player());
      expect(rebuilt.city()).to.equal(set.city);

      sneak.perform();

      expect(set.log).to.deep.equal([
        'stolen true true',
        'moved true true',
        'destroyed true null',
      ]);
    });
  });
});

import stealAdvance, {
  firstStealableAdvance,
  stealableAdvances,
} from '../lib/stealAdvance';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import AdvanceStolen from '../AdvanceStolen';
import City from '@civ-clone/core-city/City';
import Engine from '@civ-clone/core-engine/Engine';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import { expect } from 'chai';

class Alphabet extends Advance {}
class Currency extends Advance {}
class Writing extends Advance {}
class Extra extends Advance {}
class Repeatable extends Advance {
  static readonly repeatable = true;
}

// A table of six slots: Alphabet, a never-known slot, Currency, two more never-known, Writing.
const order = [Alphabet, null, Currency, null, null, Writing];

// A roll that starts the walk at `index`.
const at = (index: number): number => (index + 0.5) / order.length;

const setUp = (
  thiefKnows: (typeof Advance)[],
  victimKnows: (typeof Advance)[]
) => {
  const ruleRegistry = new RuleRegistry(),
    playerResearchRegistry = new PlayerResearchRegistry(),
    thief = new Player(ruleRegistry),
    victim = new Player(ruleRegistry);

  [
    [thief, thiefKnows],
    [victim, victimKnows],
  ].forEach(([player, known]): void => {
    const research = new PlayerResearch(
      player as Player,
      new AdvanceRegistry(),
      ruleRegistry
    );

    (known as (typeof Advance)[]).forEach((AdvanceType) =>
      research.addAdvance(AdvanceType)
    );
    playerResearchRegistry.register(research);
  });

  return { playerResearchRegistry, ruleRegistry, thief, victim };
};

const steal = (
  set: ReturnType<typeof setUp>,
  rolls: number[],
  refuses?: (thief: Player, victim: Player) => boolean
): [typeof Advance | null, number[]] => {
  const draws: number[] = [];

  return [
    firstStealableAdvance(
      set.thief,
      set.victim,
      order,
      (): number => {
        const roll = rolls.shift() ?? 0;

        draws.push(roll);

        return roll;
      },
      { playerResearchRegistry: set.playerResearchRegistry, refuses }
    ),
    draws,
  ];
};

describe('stealableAdvances', (): void => {
  it('is what the victim knows and the thief does not, but nothing repeatable', (): void => {
    const set = setUp([Currency], [Alphabet, Currency, Repeatable]);

    expect(
      stealableAdvances(set.thief, set.victim, set.playerResearchRegistry)
    ).to.deep.equal([Alphabet]);
  });

  it('is nothing for a player without research', (): void => {
    const set = setUp([], [Alphabet]);

    expect(
      stealableAdvances(
        new Player(set.ruleRegistry),
        set.victim,
        set.playerResearchRegistry
      )
    ).to.deep.equal([]);
  });
});

describe('firstStealableAdvance', (): void => {
  it('walks on from a random start, round the end, to the first advance it can take', (): void => {
    const known = [Writing, Currency, Alphabet];

    expect(steal(setUp([], known), [at(1)])[0]).to.equal(Currency);
    expect(steal(setUp([], known), [at(3)])[0]).to.equal(Writing);
    expect(steal(setUp([], known), [at(5)])[0]).to.equal(Writing);
    expect(steal(setUp([Alphabet], known), [at(0)])[0]).to.equal(Currency);
  });

  it("walks another package's advances after the table, drawing the start over the table only", (): void => {
    const set = setUp([], [Extra, Alphabet]),
      [advance, draws] = steal(set, [at(1)]);

    expect(advance).to.equal(Extra);
    expect(draws).to.deep.equal([at(1)]);
  });

  it('draws once, even with nothing to take, or when the pair refuses', (): void => {
    const [none, noneDraws] = steal(setUp([Writing], [Writing]), [at(2), 0.9]),
      [refused, refusedDraws] = steal(
        setUp([], [Writing]),
        [at(2), 0.9],
        (): boolean => true
      );

    expect(none).to.null;
    expect(noneDraws).to.deep.equal([at(2)]);
    expect(refused).to.null;
    expect(refusedDraws).to.deep.equal([at(2)]);
  });
});

describe('stealAdvance', (): void => {
  it('teaches the thief the advance, marks the city robbed and says so', (): void => {
    const set = setUp([], [Writing]),
      engine = new Engine(),
      interactionRegistry = new InteractionRegistry(),
      city = {} as City,
      heard: unknown[][] = [];

    engine.on('player:advance-stolen', (...args: unknown[]): void => {
      heard.push(args);
    });

    stealAdvance(set.thief, set.victim, city, Writing, {
      engine,
      interactionRegistry,
      playerResearchRegistry: set.playerResearchRegistry,
      ruleRegistry: set.ruleRegistry,
      turn: new Turn(),
    });

    const [stolen] = interactionRegistry.entries();

    expect(set.playerResearchRegistry.getByPlayer(set.thief).completed(Writing))
      .to.true;
    expect(stolen).to.instanceOf(AdvanceStolen);
    expect((stolen as AdvanceStolen).city()).to.equal(city);
    expect((stolen as AdvanceStolen).thief()).to.equal(set.thief);
    expect((stolen as AdvanceStolen).victim()).to.equal(set.victim);
    expect(heard).to.deep.equal([[set.thief, set.victim, Writing, city]]);
  });
});

import { useEffect, useState } from 'react';
import { useReducedMotion } from '../useReducedMotion';

// A made-up story, written by two made-up people, to show what the app does in a few seconds.
const STORY = [
  { author: 'Lotte', text: 'Op zolder vond ik een koffer met mijn naam erop, in een handschrift dat ik niet kende.' },
  { author: 'Emre', text: 'Er zat één kaart in, van een stad waar ik nooit was geweest. Rond één straat stond een rode cirkel.' },
  { author: 'Lotte', text: 'Diezelfde avond kocht ik een treinticket.' },
];

const TYPE_SPEED_MS = 34;
const PAUSE_AFTER_PIECE_MS = 1100;
const PAUSE_BEFORE_RESTART_MS = 3400;

export function DemoBook() {
  const reduced = useReducedMotion();

  // How many pieces are finished, and how many letters of the next one are typed.
  const [done, setDone] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reduced) {
      return;
    }

    let next: () => void;
    let delay: number;

    if (done >= STORY.length) {
      next = () => {
        setDone(0);
        setTyped(0);
      };
      delay = PAUSE_BEFORE_RESTART_MS;
    } else if (typed < STORY[done].text.length) {
      next = () => setTyped(typed + 1);
      delay = TYPE_SPEED_MS;
    } else {
      next = () => {
        setDone(done + 1);
        setTyped(0);
      };
      delay = PAUSE_AFTER_PIECE_MS;
    }

    const timer = window.setTimeout(next, delay);
    return () => window.clearTimeout(timer);
  }, [reduced, done, typed]);

  const finished = reduced ? STORY.length : done;

  return (
    <figure className="demo-book" aria-label="Voorbeeld: Lotte en Emre schrijven om de beurt een verhaal.">
      <span className="ribbon demo-ribbon" aria-hidden="true" />
      <p className="demo-title">De koffer op zolder</p>

      <div aria-hidden="true">
        {STORY.map((piece, index) => {
          if (index > finished) {
            return null;
          }
          const writing = index === finished && !reduced;
          if (index === finished && (reduced || typed === 0)) {
            return null;
          }
          return (
            <div key={index} className="demo-piece">
              <span className="demo-author">{piece.author}</span>
              <p>
                {writing ? piece.text.slice(0, typed) : piece.text}
                {writing && <span className="caret" />}
              </p>
            </div>
          );
        })}
      </div>

      <figcaption className="demo-turn">
        <span className="writing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        {finished < STORY.length && typed > 0 && typed < STORY[finished].text.length
          ? `${STORY[finished].author} schrijft...`
          : `${STORY[finished < STORY.length && typed > 0 ? (finished + 1) % 2 : finished % 2].author} is aan de beurt`}
      </figcaption>
    </figure>
  );
}

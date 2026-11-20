import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DemoBook } from '../components/DemoBook';
import { Logo } from '../components/Logo';
import { ShelfDemo } from '../components/ShelfDemo';
import { usePageTitle } from '../usePageTitle';
import { wakeServer } from '../api/client';

// The first thing a visitor without an account sees.
export function LandingPage() {
  usePageTitle('Schrijf samen een boek, om de beurt');

  useEffect(() => {
    wakeServer();
  }, []);

  return (
    <div className="landing">
      <header className="landing-top">
        <Link to="/" className="brand">
          <Logo />
          <span>Write Together</span>
        </Link>
        <Link to="/login" className="landing-login">
          Inloggen
        </Link>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1>Schrijf samen een boek, om de beurt.</h1>
          <p>
            Met je partner, je zus of je beste vriend. Jij schrijft een paar zinnen, de ander gaat verder wanneer het
            past. Zo groeit er een verhaal dat jullie alleen samen konden bedenken.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="button">
              Start je eerste boek
            </Link>
            <Link to="/login" className="button button-quiet">
              Ik heb al een account
            </Link>
          </div>
        </div>

        <DemoBook />
      </section>

      <section className="steps" aria-labelledby="steps-heading">
        <h2 id="steps-heading">Zo werkt het</h2>
        <ol>
          <li>
            <h3>Start een boek</h3>
            <p>Kies een titel en een kleur, en schrijf het begin van het verhaal.</p>
          </li>
          <li>
            <h3>Nodig iemand uit</h3>
            <p>Je krijgt een link. Stuur hem via WhatsApp of mail naar wie je mee wil laten schrijven.</p>
          </li>
          <li>
            <h3>Schrijf om de beurt</h3>
            <p>Na elk stuk is de ander aan zet. Je krijgt een melding zodra jij weer aan de beurt bent.</p>
          </li>
        </ol>
      </section>

      <section className="showcase" aria-labelledby="showcase-heading">
        <div className="showcase-text">
          <h2 id="showcase-heading">Al je verhalen op één plank</h2>
          <p>
            Elk boek krijgt een plaats in je digitale boekenkast. Een rood leeslint toont welke boeken op jouw stuk
            wachten. Is een verhaal af, dan lees je het van begin tot einde terug.
          </p>
        </div>
        <ShelfDemo />
      </section>

      <section className="closing">
        <h2>Welk verhaal begin jij?</h2>
        <Link to="/register" className="button">
          Maak een gratis account
        </Link>
      </section>

      <footer className="landing-foot">
        <p>Write Together is gemaakt door Serkan Cadir.</p>
      </footer>
    </div>
  );
}

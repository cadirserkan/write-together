import { useEffect, useState } from 'react';
import { messageOf } from '../api/client';
import { enablePush, getPushState, PUSH_CHANGED, type PushState } from '../push';
import { BellIcon } from './BellIcon';

// Shown on a book page while the other writer is busy: the moment where a notification
// is most useful, so the best moment to ask for permission.
export function NotificationHint() {
  const [state, setState] = useState<PushState>('unavailable');
  const [justTurnedOn, setJustTurnedOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const check = () => {
      getPushState()
        .then(setState)
        .catch(() => setState('unavailable'));
    };
    check();
    window.addEventListener(PUSH_CHANGED, check);
    return () => window.removeEventListener(PUSH_CHANGED, check);
  }, []);

  async function turnOn() {
    setBusy(true);
    setError('');
    try {
      const next = await enablePush();
      setState(next);
      setJustTurnedOn(next === 'on');
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  if (justTurnedOn) {
    return (
      <p className="notify-hint notify-hint-on" role="status">
        <BellIcon />
        Meldingen staan aan. Je krijgt een bericht zodra jij aan de beurt bent.
      </p>
    );
  }

  if (state === 'needs-install') {
    return (
      <p className="notify-hint">
        <BellIcon />
        Wil je een melding als jij aan de beurt bent? Zet Write Together eerst op je beginscherm: tik op het
        deelicoon in Safari en kies "Zet op beginscherm".
      </p>
    );
  }

  if (state !== 'off') {
    return null;
  }

  return (
    <div className="notify-hint">
      <BellIcon />
      <p>Wil je weten wanneer jij weer aan de beurt bent?</p>
      <button type="button" className="button" onClick={() => void turnOn()} disabled={busy}>
        Meldingen aanzetten
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

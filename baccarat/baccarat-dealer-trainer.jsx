import { useState, useMemo, useRef, useEffect } from "react";

/* â”€â”€ Deck helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SUITS = ["â™ ", "â™¥", "â™¦", "â™£"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function buildShoe(decks = 8) {
  const shoe = [];
  for (let d = 0; d < decks; d++)
    for (const s of SUITS)
      for (const r of RANKS) shoe.push({ rank: r, suit: s });
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

const cardValue = (c) =>
  c.rank === "A" ? 1 : ["10", "J", "Q", "K"].includes(c.rank) ? 0 : parseInt(c.rank, 10);

const total = (cards) => cards.reduce((t, c) => t + cardValue(c), 0) % 10;

/* â”€â”€ Drawing rules (from the crib sheet) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function playerAction(pT, bT) {
  if (pT >= 8 || bT >= 8) return "natural";
  return pT <= 5 ? "draw" : "stand";
}

function bankerDraws(bT, playerDrew, p3) {
  if (!playerDrew) return bT <= 5; // no third card on Player hand â†’ Banker hits 0-5
  if (bT <= 2) return true;
  if (bT === 3) return p3 !== 8;
  if (bT === 4) return p3 >= 2 && p3 <= 7;
  if (bT === 5) return p3 >= 4 && p3 <= 7;
  if (bT === 6) return p3 >= 6 && p3 <= 7;
  return false; // 7 stands
}

/* â”€â”€ Card with 3D flip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PlayingCard({ card, faceUp, delay = 0, horizontal = false }) {
  const red = card.suit === "â™¥" || card.suit === "â™¦";
  return (
    <div className={`pcard3d ${horizontal ? "horizontal" : "dealt"}`}>
      <div className={`inner ${faceUp ? "up" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className="face back">
          <div className="backpat" />
        </div>
        <div className="face front">
          <span className={`corner ${red ? "red" : ""}`}>
            {card.rank}
            <em>{card.suit}</em>
          </span>
          <span className={`pip ${red ? "red" : ""}`}>{card.suit}</span>
          <span className={`corner flip ${red ? "red" : ""}`}>
            {card.rank}
            <em>{card.suit}</em>
          </span>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ Main app â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function BaccaratTrainer() {
  const [shoe, setShoe] = useState(() => buildShoe());
  const [player, setPlayer] = useState([]);
  const [banker, setBanker] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | reveal | qPlayer | qBanker | qWinner | result
  const [revealed, setRevealed] = useState({ player: false, banker: false });
  const [feedback, setFeedback] = useState(null); // {ok, text, next}
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [playerDrew, setPlayerDrew] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const pT = total(player);
  const bT = total(banker);

  function drawFrom(currentShoe, n) {
    let s = currentShoe.length < 20 ? buildShoe() : [...currentShoe];
    const cards = s.splice(0, n);
    return [cards, s];
  }

  function deal() {
    const [cards, rest] = drawFrom(shoe, 4);
    setPlayer([cards[0], cards[2]]);
    setBanker([cards[1], cards[3]]);
    setShoe(rest);
    setPlayerDrew(false);
    setFeedback(null);
    setRevealed({ player: false, banker: false });
    setPhase("reveal");

    // Cards land face down, then: Player reveals â†’ half-second pause â†’ Banker reveals
    later(() => setRevealed((r) => ({ ...r, player: true })), 800);
    later(() => setRevealed((r) => ({ ...r, banker: true })), 1900);
    later(() => setPhase("qPlayer"), 2700);
  }

  function gradeOk(next) {
    setScore((s) => s + 1);
    setFeedback({ ok: true });
    later(() => advanceTo(next), 900); // green flash, tiny pause, then move on
  }

  function gradeWrong(text) {
    setErrors((e) => e + 1);
    setFeedback((f) => ({ ok: false, text, n: (f?.n || 0) + 1 })); // red note, try again
  }

  /* Q1 â€” player hand */
  function answerPlayer(choice) {
    const correct = playerAction(pT, bT);
    if (choice === correct) {
      gradeOk(correct === "natural" ? "qWinner" : "qBanker");
      return;
    }
    let why;
    if (correct === "natural")
      why = "There's a natural on the table â€” a hand of 8 or 9 stands, and no third cards are drawn.";
    else if (choice === "natural") why = "Neither hand shows 8 or 9, so there's no natural.";
    else if (correct === "draw") why = `Player shows ${pT} â€” Player stands only on 6â€“7.`;
    else why = `Player shows ${pT} â€” Player draws only on 0â€“5.`;
    gradeWrong(why);
  }

  /* Q2 â€” banker hand */
  function answerBanker(choice) {
    const p3 = playerDrew ? cardValue(player[2]) : null;
    const shouldDraw = bankerDraws(bT, playerDrew, p3);
    if ((choice === "draw") === shouldDraw) {
      gradeOk("qWinner");
      return;
    }
    let why;
    if (!playerDrew)
      why = `Player stood pat, so Banker plays by the Player's rule â€” hit 0â€“5, stand 6â€“7. Banker has ${bT}.`;
    else if (bT <= 2) why = `Banker always hits 0â€“2, and Banker has ${bT}.`;
    else if (bT >= 7) why = "Banker always stands on 7.";
    else {
      const table = {
        3: "hits unless the Player's third card is 8",
        4: "hits when the Player's third card is 2â€“7",
        5: "hits when the Player's third card is 4â€“7",
        6: "hits when the Player's third card is 6â€“7",
      };
      why = `Banker has ${bT} and the Player's third card is worth ${p3} â€” on ${bT}, Banker ${table[bT]}.`;
    }
    gradeWrong(why);
  }

  /* Q3 â€” call the winner */
  function answerWinner(choice) {
    const winner = pT > bT ? "player" : bT > pT ? "banker" : "tie";
    if (choice === winner) {
      gradeOk("result");
      return;
    }
    gradeWrong(
      pT === bT
        ? `Player shows ${pT} and Banker has ${bT} â€” equal totals are a tie.`
        : `Player shows ${pT}, Banker has ${bT} â€” the hand closer to 9 wins.`
    );
  }

  /* Continue â€” apply the correct action and move on */
  function advanceTo(next) {
    if (next === "qBanker") {
      const correct = playerAction(pT, bT);
      if (correct === "draw") {
        const [cards, rest] = drawFrom(shoe, 1);
        setPlayer((p) => [...p, cards[0]]);
        setShoe(rest);
        setPlayerDrew(true);
      }
      setPhase("qBanker");
    } else if (next === "qWinner") {
      if (phase === "qBanker") {
        const p3 = playerDrew ? cardValue(player[2]) : null;
        if (bankerDraws(bT, playerDrew, p3)) {
          const [cards, rest] = drawFrom(shoe, 1);
          setBanker((b) => [...b, cards[0]]);
          setShoe(rest);
        }
      }
      setPhase("qWinner");
    } else {
      setPhase("result");
    }
    setFeedback(null);
  }

  const winner = pT > bT ? "Player wins" : bT > pT ? "Banker wins" : "Tie";

  const question = useMemo(() => {
    if (feedback?.ok) return null;
    if (phase === "qPlayer")
      return {
        prompt: "Both hands are face up. What's the call?",
        options: [
          { key: "natural", label: "Natural â€” both stand" },
          { key: "draw", label: "Player draws" },
          { key: "stand", label: "Player stands" },
        ],
        answer: answerPlayer,
      };
    if (phase === "qBanker")
      return {
        prompt: "Does the Banker take a card?",
        options: [
          { key: "draw", label: "Banker draws" },
          { key: "stand", label: "Banker stands" },
        ],
        answer: answerBanker,
      };
    if (phase === "qWinner")
      return {
        prompt: "Call the hand.",
        options: [
          { key: "player", label: "Player wins" },
          { key: "banker", label: "Banker wins" },
          { key: "tie", label: "Tie" },
        ],
        answer: answerWinner,
      };
    return null;
  }, [phase, feedback, pT, bT, playerDrew, player, banker]);

  return (
    <div className="table-room">
      <style>{css}</style>

      {/* Rail */}
      <header className="rail">
        <h1>
          Dealer School <span>Â· Baccarat</span>
        </h1>
        <div className="tallies">
          <div className="tally">
            <label>Score</label>
            <strong>{score}</strong>
          </div>
          <div className="tally err">
            <label>Errors</label>
            <strong>{errors}</strong>
          </div>
          <button className="rules-btn" onClick={() => setShowRules((v) => !v)}>
            {showRules ? "Hide sheet" : "House sheet"}
          </button>
        </div>
      </header>

      {/* Felt */}
      <main className="felt">
        {phase === "idle" ? (
          <div className="empty">
            <p>Fresh shoe on the table â€” {shoe.length} cards.</p>
            <p className="sub">
              You're the dealer. Each hand, make three calls: the Player hand, the Banker hand, then
              the winner. The table always plays out correctly, even if your call was wrong.
            </p>
            <button className="deal" onClick={deal}>
              Deal
            </button>
          </div>
        ) : (
          <div className="layout">
            {/* Banker â€” left side */}
            <section className="hand">
              <h2>Banker</h2>
              <div className="cards">
                <div className="third-slot">
                  {banker[2] && <PlayingCard card={banker[2]} faceUp horizontal />}
                </div>
                {banker.slice(0, 2).map((c, i) => (
                  <PlayingCard key={i} card={c} faceUp={revealed.banker} delay={i === 1 ? 140 : 0} />
                ))}
              </div>
              <p className={`call ${revealed.banker ? "shown" : ""}`}>
                Banker has <strong>{bT}</strong>
              </p>
            </section>

            {/* Player â€” right side */}
            <section className="hand">
              <h2>Player</h2>
              <div className="cards">
                {player.slice(0, 2).map((c, i) => (
                  <PlayingCard key={i} card={c} faceUp={revealed.player} delay={i === 1 ? 140 : 0} />
                ))}
                <div className="third-slot">
                  {player[2] && <PlayingCard card={player[2]} faceUp horizontal />}
                </div>
              </div>
              <p className={`call ${revealed.player ? "shown" : ""}`}>
                Player shows <strong>{pT}</strong>
              </p>
            </section>
          </div>
        )}
      </main>

      {/* Decision strip */}
      <footer className="strip">
        {phase === "reveal" ? (
          <p className="dealing">Dealingâ€¦</p>
        ) : feedback?.ok ? (
          <div className="feedback ok">
            <strong>Correct</strong>
          </div>
        ) : question ? (
          <div className="question">
            <p>{question.prompt}</p>
            <div className="options">
              {question.options.map((o) => (
                <button key={o.key} onClick={() => question.answer(o.key)}>
                  {o.label}
                </button>
              ))}
            </div>
            {feedback && !feedback.ok && (
              <div key={feedback.n} className="wrong-note">
                {feedback.text} Try again.
              </div>
            )}
          </div>
        ) : phase === "result" ? (
          <div className="result">
            <strong>{winner}</strong>
            <span>
              Player shows {pT} Â· Banker has {bT}
            </span>
            <button className="deal" onClick={deal}>
              Next hand
            </button>
          </div>
        ) : null}
      </footer>

      {/* Crib sheet */}
      {showRules && (
        <aside className="sheet" onClick={() => setShowRules(false)}>
          <div className="paper" onClick={(e) => e.stopPropagation()}>
            <h3>Third-card rules</h3>
            <p className="line">
              Cards count face value; 10s and face cards count 0; only the last digit of the total
              matters.
            </p>
            <p className="line">
              <b>Naturals:</b> either hand showing 8 or 9 on the first two cards â€” both stand.
            </p>
            <p className="line">
              <b>Player</b> hits on 0â€“5, stands on 6â€“7.
            </p>
            <p className="line">
              <b>Banker</b> hits on 0â€“2 no matter what.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Banker has</th>
                  <th>vs Player's 3rd card</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>3</td>
                  <td>hit â€” but don't hit on 8</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>hit on 2â€“7</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>hit on 4â€“7</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>hit on 6â€“7</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>always stand</td>
                </tr>
              </tbody>
            </table>
            <p className="line">
              <b>No third card on the Player hand?</b> Banker hits 0â€“5, stands 6â€“7.
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}

/* â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500&display=swap');

*{box-sizing:border-box;margin:0}
.table-room{
  min-height:100vh;display:flex;flex-direction:column;
  background:#1d1230;color:#f3ecda;
  font-family:'IBM Plex Sans',sans-serif;
}

/* rail */
.rail{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:14px 20px;background:#140b22;border-bottom:2px solid #c9a24b;
  flex-wrap:wrap;
}
.rail h1{font-family:'Fraunces',serif;font-weight:700;font-size:1.25rem;letter-spacing:.02em}
.rail h1 span{color:#c9a24b;font-weight:500}
.tallies{display:flex;align-items:center;gap:14px}
.tally{text-align:center;font-family:'IBM Plex Mono',monospace}
.tally label{display:block;font-size:.6rem;text-transform:uppercase;letter-spacing:.15em;color:#b3a6c8}
.tally strong{font-size:1.3rem}
.tally.err strong{color:#e08a7a}
.rules-btn{
  background:none;border:1px solid #c9a24b;color:#c9a24b;border-radius:4px;
  padding:7px 12px;font-family:'IBM Plex Mono',monospace;font-size:.72rem;cursor:pointer;
}
.rules-btn:hover,.rules-btn:focus-visible{background:#c9a24b;color:#140b22}

/* felt */
.felt{
  flex:1;display:flex;flex-direction:column;justify-content:center;
  padding:26px 12px;
  background:radial-gradient(ellipse at 50% 30%, #52307c 0%, #3a2059 70%, #1d1230 100%);
}
.layout{
  display:flex;justify-content:space-evenly;align-items:flex-start;gap:12px;
  width:100%;max-width:760px;margin:0 auto;
}
.hand{display:flex;flex-direction:column;align-items:center;gap:12px;flex:1}
.hand h2{
  font-family:'Fraunces',serif;font-size:.9rem;font-weight:500;
  text-transform:uppercase;letter-spacing:.35em;color:#d8cfae;
}
.cards{display:flex;align-items:center;gap:7px;min-height:90px}

/* reserved slot â€” third card lies sideways here; row never shifts */
.third-slot{position:relative;width:90px;height:64px;flex:none}
.pcard3d.horizontal{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%) rotate(90deg);
  animation:dealInH .35s ease-out;
}
@keyframes dealInH{
  from{transform:translate(-50%,-72%) rotate(76deg);opacity:0}
  to{transform:translate(-50%,-50%) rotate(90deg);opacity:1}
}

.call{
  font-family:'Fraunces',serif;font-size:1.02rem;color:#f3ecda;
  opacity:0;transform:translateY(6px);transition:opacity .4s ease,transform .4s ease;
}
.call strong{color:#c9a24b;font-size:1.15rem}
.call.shown{opacity:1;transform:none}

/* 3D flip cards */
.pcard3d{width:62px;height:88px;perspective:640px}
.pcard3d.dealt{animation:dealIn .35s ease-out}
@keyframes dealIn{from{transform:translateY(-26px) rotate(-4deg);opacity:0}to{transform:none;opacity:1}}
.inner{
  position:relative;width:100%;height:100%;
  transform-style:preserve-3d;
  transform:rotateY(180deg);
  transition:transform .55s cubic-bezier(.4,.1,.3,1);
}
.inner.up{transform:rotateY(0)}
.face{
  position:absolute;inset:0;border-radius:7px;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;
  box-shadow:0 3px 8px rgba(0,0,0,.45);
}
.face.front{
  background:#faf6ec;color:#1b1b18;
  display:flex;align-items:center;justify-content:center;
}
.face.back{
  transform:rotateY(180deg);
  background:#7c1f28;padding:6px;
}
.backpat{
  width:100%;height:100%;border-radius:4px;border:1px solid #c9a24b;
  background:
    repeating-linear-gradient(45deg, transparent 0 5px, rgba(201,162,75,.35) 5px 6px),
    repeating-linear-gradient(-45deg, transparent 0 5px, rgba(201,162,75,.35) 5px 6px);
}
@media (prefers-reduced-motion: reduce){
  .pcard3d.dealt,.pcard3d.horizontal{animation:none}
  .inner{transition:none}
  .call{transition:none}
}

.corner{
  position:absolute;top:5px;left:7px;font-family:'IBM Plex Mono',monospace;
  font-weight:600;font-size:.8rem;line-height:1;text-align:center;
}
.corner em{display:block;font-style:normal;font-size:.75rem}
.corner.flip{top:auto;left:auto;bottom:5px;right:7px;transform:rotate(180deg)}
.pip{font-size:1.7rem}
.red{color:#b33a3a}

.empty{text-align:center;max-width:440px;margin:0 auto}
.empty p{font-family:'Fraunces',serif;font-size:1.15rem}
.empty .sub{font-family:'IBM Plex Sans',sans-serif;font-size:.88rem;color:#c3b8d6;margin-top:10px}
.empty .deal{margin-top:22px}

/* strip */
.strip{padding:18px 20px 26px;background:#140b22;border-top:1px solid #3a2a55;min-height:130px}
.dealing{
  text-align:center;font-family:'Fraunces',serif;font-size:1rem;color:#b3a6c8;
  padding-top:16px;letter-spacing:.06em;
}
.question p{
  text-align:center;font-family:'Fraunces',serif;font-size:1.05rem;margin-bottom:14px;
}
.options{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.options button{
  background:#3a2059;color:#f3ecda;border:1px solid #5f4788;border-radius:8px;
  padding:13px 18px;font-family:'IBM Plex Sans',sans-serif;font-size:.95rem;cursor:pointer;
  min-width:140px;
}
.options button:hover,.options button:focus-visible{border-color:#c9a24b;background:#47306b}

.deal{
  background:#c9a24b;color:#1d1230;border:none;border-radius:8px;
  padding:13px 34px;font-family:'Fraunces',serif;font-weight:700;font-size:1rem;
  cursor:pointer;letter-spacing:.04em;
}
.deal:hover,.deal:focus-visible{background:#dcb75f}

.feedback{max-width:520px;margin:0 auto;text-align:center;border-radius:10px;padding:14px 16px}
.feedback.ok{animation:flashGreen .7s ease-out forwards}
@keyframes flashGreen{
  0%{background:rgba(110,200,140,.55)}
  100%{background:rgba(110,200,140,.14)}
}
.feedback.ok strong{font-family:'Fraunces',serif;font-size:1.1rem;color:#8fd0a5}

.wrong-note{
  max-width:520px;margin:14px auto 0;text-align:center;
  border-radius:10px;padding:11px 14px;font-size:.9rem;color:#f4ded8;
  background:rgba(224,110,95,.14);
  animation:flashRed .7s ease-out;
}
@keyframes flashRed{
  0%{background:rgba(224,110,95,.55)}
  100%{background:rgba(224,110,95,.14)}
}
@media (prefers-reduced-motion: reduce){
  .feedback.ok{animation:none;background:rgba(110,200,140,.14)}
  .wrong-note{animation:none}
}

.result{display:flex;flex-direction:column;align-items:center;gap:8px}
.result strong{font-family:'Fraunces',serif;font-size:1.4rem;color:#c9a24b}
.result span{font-family:'IBM Plex Mono',monospace;font-size:.85rem;color:#b3a6c8}
.result .deal{margin-top:8px}

/* crib sheet */
.sheet{
  position:fixed;inset:0;background:rgba(12,7,20,.65);
  display:flex;align-items:center;justify-content:center;padding:20px;z-index:10;
}
.paper{
  background:#f7f3e6;color:#1b1b18;max-width:380px;width:100%;
  padding:22px 24px;border-radius:2px;transform:rotate(-1.2deg);
  box-shadow:0 12px 30px rgba(0,0,0,.5);
  font-size:.88rem;line-height:1.5;
}
.paper h3{font-family:'Fraunces',serif;margin-bottom:10px;font-size:1.05rem}
.paper .line{margin:7px 0}
.paper table{width:100%;border-collapse:collapse;margin:10px 0;font-family:'IBM Plex Mono',monospace;font-size:.8rem}
.paper th,.paper td{border:1px solid #b9b19a;padding:5px 8px;text-align:left}
.paper th{background:#eae4d2;font-weight:600}

@media (max-width:480px){
  .pcard3d{width:46px;height:66px}
  .third-slot{width:68px;height:48px}
  .cards{gap:5px;min-height:68px}
  .pip{font-size:1.25rem}
  .corner{font-size:.65rem;top:3px;left:4px}
  .corner em{font-size:.6rem}
  .corner.flip{bottom:3px;right:4px}
  .options button{min-width:0;flex:1}
  .layout{gap:6px}
}
`;

/* Comply24 — gedeelde paginalogica. Geen externe afhankelijkheden. */

/* ──────────────────────────────────────────────────────────────────────────
   FORMULIEREN
   Dezelfde route als het pilotformulier op comply24.nl: Web3Forms.
   De access key hoort publiek in de pagina te staan; hij bepaalt alleen naar
   welke mailbox de inzending gaat. Een eigen key voor deze site maak je aan op
   web3forms.com en zet je hieronder.
   Endpoint leeghalen schakelt terug naar de e-mailroute: de knop opent dan de
   aanvraag in het mailprogramma van de bezoeker. Geen bevestiging zonder
   verzending, in beide gevallen.
   ────────────────────────────────────────────────────────────────────────── */
window.C24_FORM_ENDPOINT = 'https://api.web3forms.com/submit';
window.C24_FORM_KEY = '3cbf126f-1f09-4ea5-a633-d3ae9fe67d05';
window.C24_FORM_FROM = 'Comply24 — website';

(function () {
  'use strict';

  function DCLogic() {}
  DCLogic.prototype.setState = function () {};
  DCLogic.prototype.forceUpdate = function () {};

class Component extends DCLogic {
    constructor(props) {
      super(props);
      this._seen = {};
      this._timers = [];
      this._lang = null;
      this.setRoot = (el) => {
        if (el === this._root) return;
        this._root = el;
        this._boot();
      };
      this.tilt = (e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      };
      this.tiltOff = (e) => {
        e.currentTarget.style.setProperty('--mx', '0');
        e.currentTarget.style.setProperty('--my', '0');
      };
      this.toggleLang = () => {
        const cur = this._lang || this._lang0 || 'nl';
        this._applyLang(cur === 'nl' ? 'en' : 'nl');
      };
      this.toggleMenu = () => {
        if (this._root) this._root.classList.toggle('menu-open');
      };
      this.closeMenu = () => {
        if (this._root) this._root.classList.remove('menu-open');
      };
      this.xsel = (e) => {
        this._stopWalk();
        this._select(Number(e.currentTarget.getAttribute('data-i')));
      };
      this.xdir = (e) => {
        const btn = e.currentTarget;
        const dir = btn.getAttribute('data-dir');
        this._only(btn);
        this._xdir = dir;
        const xp = this._root && this._root.querySelector('.xp');
        if (xp) xp.classList.toggle('rev', dir === 'rev');
        this._stopWalk();
        this._select(dir === 'rev' ? 7 : 0);
      };
      this.baSet = (e) => {
        const btn = e.currentTarget;
        this._only(btn);
        const ba = this._root && this._root.querySelector('.ba');
        if (ba) ba.classList.toggle('after', btn.getAttribute('data-ba') === 'b');
      };
      this.tabSet = (e) => {
        const btn = e.currentTarget;
        this._only(btn);
        const tab = btn.getAttribute('data-tab');
        if (!this._root) return;
        Array.from(btn.parentElement.children).forEach((b) => {
          const on = b === btn;
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.setAttribute('tabindex', on ? '0' : '-1');
        });
        const scope = btn.closest('section') || this._root;
        Array.from(scope.querySelectorAll('[data-panel]')).forEach((p) => {
          const on = p.getAttribute('data-panel') === tab;
          p.classList.toggle('on', on);
          if (on) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
      };
      this.tabKey = (e) => {
        const d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1
          : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const bs = Array.from(e.currentTarget.parentElement.children);
        const next = bs[(bs.indexOf(e.currentTarget) + d + bs.length) % bs.length];
        next.focus();
        next.click();
      };
      this.replay = () => {
        if (this._root) {
          const ch = this._root.querySelector('.chain');
          if (ch) ch.classList.remove('done');
        }
        if (this._run) this._run();
      };
      this.go = (e) => {
        const a = e.currentTarget;
        e.preventDefault();
        this._go(a.getAttribute('data-go') || 'home', a.getAttribute('data-sec'));
      };
      this.chMod = (e) => {
        const btn = e.currentTarget;
        const on = !btn.classList.contains('on');
        btn.classList.toggle('on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        const ch = btn.closest('.chooser');
        if (!ch) return;
        ch.classList.toggle('m-' + btn.getAttribute('data-mod'), on);
        ch.classList.toggle('m-none', !ch.classList.contains('m-ri') && !ch.classList.contains('m-ct'));
        this._compo();
      };
      this.chSize = (e) => {
        const btn = e.currentTarget;
        this._only(btn);
        Array.from(btn.parentElement.children).forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        const ch = btn.closest('.chooser');
        if (!ch) return;
        ['compact', 'institution', 'group'].forEach((s) => ch.classList.toggle('s-' + s, s === btn.getAttribute('data-size')));
        this._compo();
      };
      this.sendForm = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fm = form.closest('.fm');
        if (!this._validate(form)) return;
        if (window.C24_FORM_ENDPOINT) {
          this._post(form, fm);
          return;
        }
        // Geen endpoint ingesteld: geen bevestiging voorwenden, wel een werkende route.
        const link = fm && fm.querySelector('.fm-mail');
        if (link) link.setAttribute('href', this._mailto(form));
        if (fm) fm.classList.add('sent');
        if (link) link.focus();
      };
    }
    _nl() {
      return ((this._root && this._root.className) || '').indexOf('l-en') === -1;
    }
    _validate(form) {
      const nl = this._nl();
      let bad = null;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), (el) => {
        const v = (el.value || '').trim();
        const ok = v !== '' && (el.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
        el.setAttribute('aria-invalid', ok ? 'false' : 'true');
        el.classList.toggle('bad', !ok);
        if (!ok && !bad) bad = el;
      });
      const box = form.querySelector('.fm-err');
      if (bad) {
        if (box) box.textContent = nl ? 'Vul de gemarkeerde velden in voordat u verstuurt.'
                                      : 'Please complete the highlighted fields before sending.';
        bad.focus();
        return false;
      }
      if (box) box.textContent = '';
      return true;
    }
    _mailto(form) {
      const nl = this._nl();
      const lines = [];
      Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), (el) => {
        const v = (el.value || '').trim();
        if (!v) return;
        const lab = el.closest('label');
        let name = el.getAttribute('name') || '';
        if (lab) {
          const sp = lab.querySelector(nl ? '.nl' : '.en');
          if (sp) name = sp.textContent.trim();
        }
        lines.push(name + ': ' + v);
      });
      const subj = form.getAttribute('data-subject') || 'Comply24';
      return 'mailto:info@comply24.nl?subject=' + encodeURIComponent(subj)
        + '&body=' + encodeURIComponent(lines.join('\n'));
    }
    _post(form, fm) {
      const nl = this._nl();
      const box = form.querySelector('.fm-err');
      const data = new FormData(form);
      const bot = form.querySelector('[name="botcheck"]');
      if (bot && bot.checked) return;                 // spamval: stilletjes niets doen
      if (window.C24_FORM_KEY) data.set('access_key', window.C24_FORM_KEY);
      if (window.C24_FORM_FROM) data.set('from_name', window.C24_FORM_FROM);
      data.set('subject', form.getAttribute('data-subject') || 'Comply24');
      data.set('language', nl ? 'nl' : 'en');
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.setAttribute('disabled', '');
      fetch(window.C24_FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then((r) => {
          if (!r.ok) throw new Error(r.status);
          if (fm) fm.classList.add('sent', 'ok');
        })
        .catch(() => {
          if (btn) btn.removeAttribute('disabled');
          if (box) box.textContent = nl ? 'Verzenden lukte niet. Probeer het nog eens of mail naar info@comply24.nl.'
                                        : 'Sending failed. Please try again or email info@comply24.nl.';
        });
    }
    _compo() {
      const root = this._root;
      if (!root) return;
      const ch = root.querySelector('.chooser');
      const inp = root.querySelector('#compo-in');
      if (!ch || !inp) return;
      const nl = (root.className || '').indexOf('l-en') === -1;
      const mods = [];
      if (ch.classList.contains('m-ri')) mods.push('Regulatory Intelligence');
      if (ch.classList.contains('m-ct')) mods.push('Control Testing');
      const sz = ch.classList.contains('s-compact') ? 'Compact'
        : ch.classList.contains('s-group') ? (nl ? 'Groep' : 'Group')
        : (nl ? 'Instelling' : 'Institution');
      inp.value = mods.length ? mods.join(' + ') + ' · ' + sz : '';
      root.classList.toggle('has-compo', mods.length > 0);
    }
    _go(page, sec) {
      const root = this._root;
      if (!root) return;
      const same = (this._page || 'home') === page;
      this._page = page;
      this._showPage();
      root.classList.remove('menu-open');
      const target = sec && sec !== 'top' ? root.querySelector('#' + sec) : null;
      const el = target || root;
      const jump = () => {
        el.scrollIntoView({ block: 'start', behavior: same ? 'smooth' : 'instant' });
        if (this._onScroll) this._onScroll();
      };
      if (same) jump();
      else requestAnimationFrame(jump);
    }
    _showPage() {
      const root = this._root;
      if (!root) return;
      const page = this._page || 'home';
      Array.from(root.querySelectorAll('.page')).forEach((p) => p.classList.toggle('on', p.getAttribute('data-page') === page));
      root.classList.toggle('sub', page !== 'home');
    }
    _only(btn) {
      Array.from(btn.parentElement.children).forEach((b) => b.classList.toggle('on', b === btn));
    }
    _applyLang(lang) {
      this._lang = lang;
      const root = this._root;
      if (!root) return;
      root.classList.toggle('l-nl', lang === 'nl');
      root.classList.toggle('l-en', lang === 'en');
      root.setAttribute('lang', lang);
    }
    _select(i) {
      const xp = this._root && this._root.querySelector('.xp');
      if (!xp) return;
      const rev = this._xdir === 'rev';
      Array.from(xp.querySelectorAll('.xn')).forEach((n, k) => {
        n.classList.toggle('sel', k === i);
        n.classList.toggle('lit', rev ? k > i : k < i);
      });
      Array.from(xp.querySelectorAll('.xrec')).forEach((r, k) => r.classList.toggle('on', k === i));
    }
    _stopWalk() {
      if (this._walk) clearInterval(this._walk);
      this._walk = 0;
      this._walked = true;
    }
    _startWalk() {
      if (this._walked) return;
      this._walked = true;
      let i = 0;
      this._walk = setInterval(() => {
        i += 1;
        if (i > 7) {
          clearInterval(this._walk);
          this._walk = 0;
          return;
        }
        this._select(i);
      }, 1000);
    }
    _chain() {
      const ch = this._root.querySelector('.chain');
      if (!ch) return;
      const nodes = Array.from(ch.querySelectorAll('.cn'));
      const edges = Array.from(ch.querySelectorAll('.ce'));
      const later = (fn, ms) => {
        this._timers.push(setTimeout(fn, ms));
      };
      const phase = (n) => {
        for (let k = 0; k < 6; k += 1) ch.classList.toggle('p-' + k, k === n);
      };
      const rest = [2, 3, 4, 5, 6, 7];
      const run = () => {
        this._timers.forEach((t) => clearTimeout(t));
        this._timers = [];
        nodes.forEach((n) => n.classList.remove('on', 'alert', 'ver'));
        edges.forEach((ed) => ed.classList.remove('hi'));
        phase(1);
        nodes.forEach((n, k) => later(() => {
          n.classList.add('on');
          if (edges[k]) edges[k].classList.add('hi');
        }, 300 + k * 260));
        later(() => {
          nodes[1].classList.remove('on');
          nodes[1].classList.add('ver');
          phase(2);
        }, 3600);
        rest.forEach((k, j) => later(() => {
          nodes[k].classList.remove('on');
          nodes[k].classList.add('alert');
        }, 4600 + j * 220));
        later(() => phase(3), 4800);
        later(() => phase(4), 7400);
        rest.forEach((k, j) => later(() => {
          nodes[k].classList.remove('alert');
          nodes[k].classList.add('on');
        }, 8400 + j * 220));
        later(() => {
          nodes[1].classList.remove('ver');
          nodes[1].classList.add('on');
          phase(5);
        }, 10000);
        later(() => ch.classList.add("done"), 11200);
      };
      this._run = run;
      later(run, 1800);
    }
    componentDidMount() {
      this._mounted = true;
      this._boot();
    }
    componentDidUpdate(prev) {
      if ((prev.lang || 'nl') !== (this._lang0 || 'nl')) this._lang = null;
      if ((prev.motion ?? true) !== (true ?? true) || (prev.lang || 'nl') !== (this._lang0 || 'nl')) this._boot();
    }
    componentWillUnmount() {
      this._mounted = false;
      this._teardown();
    }
    _teardown() {
      if (this._onScroll) {
        window.removeEventListener('scroll', this._onScroll, true);
        window.removeEventListener('resize', this._onScroll);
        this._onScroll = null;
      }
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
      if (this._io) this._io.disconnect();
      this._io = null;
      this._timers.forEach((t) => clearTimeout(t));
      this._timers = [];
      if (this._walk) clearInterval(this._walk);
      this._walk = 0;
      if (this._root) this._root.classList.remove('armed');
    }
    _boot() {
      this._teardown();
      const root = this._root;
      if (!root || !this._mounted) return;
      this._applyLang(this._lang || this._lang0 || 'nl');
      this._showPage();
      this._compo();
      const motion = true ?? true;
      const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      const live = motion && !reduce;
      const secs = Array.from(root.querySelectorAll('.sec'));
      const update = () => {
        this._raf = 0;
        const vh = window.innerHeight || 800;
        root.classList.toggle('scrolled', root.getBoundingClientRect().top < -8);
        if (!live) return;
        secs.forEach((s) => {
          const r = s.getBoundingClientRect();
          if (r.bottom < -300 || r.top > vh + 300) return;
          s.style.setProperty('--py', (r.top + r.height / 2 - vh / 2).toFixed(1) + 'px');
        });
      };
      this._onScroll = () => {
        if (!this._raf) this._raf = requestAnimationFrame(update);
      };
      window.addEventListener('scroll', this._onScroll, { passive: true, capture: true });
      window.addEventListener('resize', this._onScroll, { passive: true });
      update();
      if (!live || typeof IntersectionObserver !== 'function') return;
      this._chain();
      root.classList.add('armed');
      secs.forEach((s) => {
        if (this._seen[s.id]) s.classList.add('in');
      });
      this._io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('in');
          this._seen[en.target.id] = true;
          if (en.target.id === 'lineage') this._startWalk();
          if (this._io) this._io.unobserve(en.target);
        });
      }, { threshold: 0.12 });
      secs.forEach((s) => {
        if (!this._seen[s.id]) this._io.observe(s);
      });
    }
    renderVals() {
      const wash = Number(15 ?? 15);
      const motion = true ?? true;
      return {
        washAlpha: (wash / 100).toFixed(2),
        motionClass: motion ? '' : 'c24-still',
        langClass: 'l-' + (this._lang0 === 'en' ? 'en' : 'nl'),
        rootRef: this.setRoot,
        tilt: this.tilt,
        tiltOff: this.tiltOff,
        toggleLang: this.toggleLang,
        toggleMenu: this.toggleMenu,
        closeMenu: this.closeMenu,
        xsel: this.xsel,
        xdir: this.xdir,
        baSet: this.baSet,
        tabSet: this.tabSet,
        tabKey: this.tabKey,
        sendForm: this.sendForm,
        replay: this.replay,
        go: this.go,
        chMod: this.chMod,
        chSize: this.chSize
      };
    }
  
  }

  var root = document.querySelector('.c24');
  if (!root) return;

  var saved = 'nl';
  saved = root.classList.contains('l-en') ? 'en' : 'nl';   /* de taal staat vast in de URL */
  root.classList.toggle('l-nl', saved === 'nl');
  root.classList.toggle('l-en', saved === 'en');
  document.documentElement.setAttribute('lang', saved);

  var c = new Component();
  c._lang0 = saved;
  var vals = c.renderVals();

  Array.prototype.forEach.call(root.querySelectorAll('*'), function (el) {
    Array.prototype.forEach.call(el.attributes, function (at) {
      if (at.name.indexOf('data-on-') !== 0) return;
      var fn = vals[at.value];
      if (typeof fn === 'function') el.addEventListener(at.name.slice(8), fn);
    });
  });

  c.componentDidMount();
  if (typeof vals.rootRef === 'function') vals.rootRef(root);

  /* taalkeuze bewaren en de pagina-taal meegeven aan assistieve techniek */
  var obs = new MutationObserver(function () {
    var en = root.classList.contains('l-en');
    document.documentElement.setAttribute('lang', en ? 'en' : 'nl');

  });
  obs.observe(root, { attributes: true, attributeFilter: ['class'] });

  /* dropdown in het hoofdmenu */
  Array.prototype.forEach.call(root.querySelectorAll('.navitem.has-dd'), function (it) {
    var a = it.querySelector('.navlink');
    var close = function () { it.classList.remove('open'); a.setAttribute('aria-expanded', 'false'); };
    var open = function () { it.classList.add('open'); a.setAttribute('aria-expanded', 'true'); };
    it.addEventListener('mouseenter', open);
    it.addEventListener('mouseleave', close);
    it.addEventListener('focusin', open);
    it.addEventListener('focusout', function (e) {
      if (!it.contains(e.relatedTarget)) close();
    });
    a.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); var f = it.querySelector('.dd a'); if (f) f.focus(); }
      if (e.key === 'Escape') { close(); a.focus(); }
    });
    it.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); a.focus(); } });
  });
})();

/* ronde A: onderwerp van het contactformulier vooraf kiezen via ?s= */
(function () {
  'use strict';
  var map = { demo: 0, quickscan: 1, review: 2, prijslijst: 3, beveiliging: 4 };
  var m = /[?&]s=([a-z]+)/.exec(location.search);
  if (!m || !(m[1] in map)) return;
  var idx = map[m[1]];
  function go() {
    var sels = document.querySelectorAll('select[name^="subject-"]');
    for (var i = 0; i < sels.length; i++) {
      if (sels[i].options.length > idx) sels[i].selectedIndex = idx;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();

/* prijzen: calculator (maand/jaar, 1-25 gebruikers, staffel 11-20 -10%, 21+ maatwerk) */
(function () {
  'use strict';
  var box = document.querySelector('[data-pc]');
  if (!box) return;
  var en = document.querySelector('.c24.l-en') !== null;
  var sl = box.querySelector('[data-pc-sl]'), nEl = box.querySelector('[data-pc-n]'), nl = box.querySelector('[data-pc-nl]');
  var tot = box.querySelector('[data-pc-tot]'), avg = box.querySelector('[data-pc-avg]'), sv = box.querySelector('[data-pc-sv]');
  var svrow = box.querySelector('[data-pc-svrow]'), per = box.querySelector('[data-pc-per]'), unit = box.querySelector('[data-pc-unit]');
  var res = box.querySelector('[data-pc-res]'), cust = box.querySelector('[data-pc-cust]'), lines = box.querySelector('[data-pc-lines]');
  var bills = [].slice.call(box.querySelectorAll('[data-bill]'));
  var prods = [].slice.call(box.querySelectorAll('[data-prod]'));
  var pnote = box.querySelector('[data-pc-pnote]');
  var bill = 'm';
  var fmt = function (v) { return '€ ' + Math.round(v).toLocaleString(en ? 'en-GB' : 'nl-NL'); };
  var T = en
    ? { user: 'user', users: 'users', pm: 'Per month', py: 'Per year', tm: 'total per month', ty: 'total per year', m: '/ month', y: '/ year',
        a: 'at', disc: '−10%', note: 'More than 20 users? We draw up a tailored agreement for larger teams.',
        one: 'One product: € 150 per user per month.', bundle: 'Bundle: all three products for € 300 per user per month.', none: 'Choose at least one product.' }
    : { user: 'gebruiker', users: 'gebruikers', pm: 'Per maand', py: 'Per jaar', tm: 'totaal per maand', ty: 'totaal per jaar', m: '/ mnd', y: '/ jaar',
        a: 'à', disc: '−10%', note: 'Meer dan 20 gebruikers? Voor grotere teams stellen wij een maatwerkovereenkomst op.',
        one: 'Eén product: € 150 per gebruiker per maand.', bundle: 'Bundel: alle drie de producten voor € 300 per gebruiker per maand.', none: 'Kies minstens één product.' };
  function calc() {
    var n = parseInt(sl.value, 10);
    sl.style.setProperty('--p', ((n - 1) / 24 * 100) + '%');
    nEl.textContent = n;
    nl.textContent = n === 1 ? T.user : T.users;
    var k = prods.filter(function (b) { return b.classList.contains('on'); }).length;
    var single = k === 1;
    pnote.textContent = k === 0 ? T.none : (single ? T.one : T.bundle);
    var base = (bill === 'm' ? 300 : 3000) * (single ? 0.5 : 1), disc = (bill === 'm' ? 270 : 2700) * (single ? 0.5 : 1), suf = bill === 'm' ? T.m : T.y;
    per.textContent = bill === 'm' ? T.pm : T.py;
    unit.textContent = bill === 'm' ? T.tm : T.ty;
    lines.innerHTML = '';
    if (n > 20) {
      res.hidden = true; cust.hidden = false;
      lines.innerHTML = '<li class="note">' + T.note + '</li>';
      return;
    }
    res.hidden = false; cust.hidden = true;
    var a = Math.min(n, 10), b = Math.max(0, n - 10);
    var total = a * base + b * disc, saving = b * (base - disc);
    tot.textContent = fmt(total);
    avg.textContent = fmt(total / n);
    svrow.hidden = saving === 0;
    sv.textContent = fmt(saving);
    lines.innerHTML = '<li><span>' + a + ' × ' + (a === 1 ? T.user : T.users) + ' ' + T.a + ' ' + fmt(base) + ' ' + suf + '</span><b>' + fmt(a * base) + '</b></li>'
      + (b ? '<li class="disc"><span>' + b + ' × ' + (b === 1 ? T.user : T.users) + ' ' + T.a + ' ' + fmt(disc) + ' ' + suf + ' ' + T.disc + '</span><b>' + fmt(b * disc) + '</b></li>' : '');
  }
  sl.addEventListener('input', calc);
  prods.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var on = !btn.classList.contains('on');
      if (!on && prods.filter(function (b) { return b.classList.contains('on'); }).length === 1) return;
      btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      calc();
    });
  });
  bills.forEach(function (btn) {
    btn.addEventListener('click', function () {
      bill = btn.getAttribute('data-bill');
      bills.forEach(function (x) { var on = x === btn; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      calc();
    });
  });
  calc();
})();

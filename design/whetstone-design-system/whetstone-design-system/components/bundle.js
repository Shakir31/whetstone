/* @ds-bundle: {"format":4,"namespace":"Whetstone","components":[{"name":"Button"},{"name":"TextInput"},{"name":"TextArea"},{"name":"Panel"},{"name":"StatBar"},{"name":"LevelUp"},{"name":"SystemMessage"},{"name":"Nav"},{"name":"Tag"},{"name":"Divider"},{"name":"Surface"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(obj, keys) { var o = {}; for (var k in obj) if (keys.indexOf(k) < 0) o[k] = obj[k]; return o; }
  function clamp(n) { n = Number(n) || 0; return n < 0 ? 0 : n > 100 ? 100 : n; }

  /* ---------- Button ---------- */
  function Button(props) {
    var variant = props.variant || 'secondary';
    var rest = omit(props, ['variant', 'size', 'block', 'className', 'children']);
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('ws-btn', 'ws-btn--' + variant, props.size === 'sm' && 'ws-btn--sm', props.block && 'ws-btn--block', props.className)
    }), props.children);
  }

  /* ---------- TextInput ---------- */
  function TextInput(props) {
    var autoId = React.useId();
    var id = props.id || autoId;
    var hintId = props.hint ? id + '-hint' : undefined;
    var rest = omit(props, ['label', 'hint', 'error', 'id', 'className']);
    return h('div', { className: cx('ws-field', props.error && 'ws-field--error', props.className) },
      props.label && h('div', { className: 'ws-field__top' }, h('label', { htmlFor: id, className: 'ws-field__label ws-label' }, props.label)),
      h('input', Object.assign({ type: 'text' }, rest, { id: id, className: 'ws-input', 'aria-describedby': hintId, 'aria-invalid': props.error ? true : undefined })),
      props.hint && h('p', { id: hintId, className: 'ws-field__hint' }, props.hint));
  }

  /* ---------- TextArea ---------- */
  function TextArea(props) {
    var autoId = React.useId();
    var id = props.id || autoId;
    var initial = String(props.value != null ? props.value : props.defaultValue != null ? props.defaultValue : '');
    var st = React.useState(initial.length), count = st[0], setCount = st[1];
    var shown = props.value != null ? String(props.value).length : count;
    var max = props.maxLength;
    var hintId = props.hint ? id + '-hint' : undefined;
    var rest = omit(props, ['label', 'hint', 'error', 'id', 'className', 'showCount', 'onChange', 'maxLength']);
    function onChange(e) { setCount(e.target.value.length); if (props.onChange) props.onChange(e); }
    return h('div', { className: cx('ws-field', props.error && 'ws-field--error', props.className) },
      (props.label || props.showCount) && h('div', { className: 'ws-field__top' },
        props.label ? h('label', { htmlFor: id, className: 'ws-field__label ws-label' }, props.label) : h('span'),
        props.showCount && h('span', { className: cx('ws-field__count ws-micro', max && shown > max && 'ws-field__count--over'), 'aria-live': 'polite' }, max ? shown + ' / ' + max : shown + ' chars')),
      h('textarea', Object.assign({ rows: 8 }, rest, { id: id, className: 'ws-textarea', onChange: onChange, 'aria-describedby': hintId, 'aria-invalid': props.error ? true : undefined })),
      props.hint && h('p', { id: hintId, className: 'ws-field__hint' }, props.hint));
  }

  /* ---------- Panel ---------- */
  function Panel(props) {
    var worn = props.worn !== false;
    var Tag = props.as || 'section';
    var hasHead = props.title || props.eyebrow || props.actions;
    return h(Tag, { className: cx('ws-panel ws-grain', worn && 'ws-worn', props.className), 'aria-label': typeof props.title === 'string' ? props.title : undefined },
      hasHead && h('header', { className: 'ws-panel__head' },
        h('div', null,
          props.eyebrow && h('span', { className: 'ws-panel__eyebrow ws-micro' }, props.eyebrow),
          props.title && h('h2', { className: 'ws-heading' }, props.title)),
        props.actions && h('div', { className: 'ws-panel__actions' }, props.actions)),
      props.children);
  }

  /* ---------- StatBar ---------- */
  function StatBar(props) {
    var target = clamp(props.value);
    var animate = props.animate !== false;
    var st = React.useState(animate ? clamp(props.from != null ? props.from : 0) : target), w = st[0], setW = st[1];
    React.useEffect(function () {
      if (!animate) { setW(target); return; }
      var raf = requestAnimationFrame(function () { raf = requestAnimationFrame(function () { setW(target); }); });
      return function () { cancelAnimationFrame(raf); };
    }, [target, animate]);
    var next = props.level != null ? 'to Lv. ' + (Number(props.level) + 1) : null;
    return h('div', { className: cx('ws-stat', props.tone === 'iron' && 'ws-stat--iron', props.compact && 'ws-stat--compact', props.className) },
      h('span', { className: 'ws-stat__name ws-label' }, props.name),
      props.level != null && h('span', { className: 'ws-stat__lv ws-numeral' }, h('small', null, 'Lv.'), props.level),
      h('div', { className: 'ws-stat__track', role: 'progressbar', 'aria-label': props.name + ' progress to next level', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(target) },
        h('div', { className: cx('ws-stat__fill', w <= 0 && 'ws-stat__fill--zero'), style: { width: w + '%' } })),
      !props.compact && h('div', { className: 'ws-stat__foot ws-micro' },
        h('span', null, props.caption || next || ''),
        h('span', { className: 'ws-stat__pct' }, Math.round(target) + '%')));
  }

  /* ---------- LevelUp ---------- */
  function LevelUp(props) {
    var word = props.word || 'Level up';
    return h('div', { className: cx('ws-levelup', props.className), role: 'status', 'aria-live': 'polite' },
      h('div', { className: 'ws-levelup__band ws-grain', 'aria-hidden': true }),
      h('span', { className: 'ws-levelup__rule ws-levelup__rule--top', 'aria-hidden': true }),
      h('span', { className: 'ws-levelup__rule ws-levelup__rule--bottom', 'aria-hidden': true }),
      h('p', { className: 'ws-levelup__word ws-display' }, word),
      props.stat && h('div', { className: 'ws-levelup__line ws-label' },
        h('span', { className: 'ws-levelup__stat' }, props.stat),
        props.from != null && h('span', null, 'Lv. ' + props.from),
        props.from != null && h('span', { className: 'ws-levelup__arrow', 'aria-label': 'to' }, '→'),
        props.to != null && h('span', { className: 'ws-levelup__stat' }, 'Lv. ' + props.to)),
      props.note && h('p', { className: 'ws-levelup__note' }, props.note));
  }

  /* ---------- SystemMessage ---------- */
  function SystemMessage(props) {
    var kind = props.kind || 'notice';
    var who = props.label || (kind === 'warning' ? 'System · Warning' : kind === 'verdict' ? 'System · Verdict' : 'System');
    var awards = props.awards || [];
    return h('aside', { className: cx('ws-sys ws-grain', 'ws-sys--' + kind, props.className), role: kind === 'warning' ? 'alert' : 'note' },
      ['tl', 'tr', 'bl', 'br'].map(function (c) { return h('span', { key: c, className: 'ws-sys__corner ws-sys__corner--' + c, 'aria-hidden': true }); }),
      h('div', { className: 'ws-sys__head' },
        h('span', { className: 'ws-sys__sigil', 'aria-hidden': true }),
        h('span', { className: 'ws-sys__who ws-micro' }, who),
        props.meta && h('span', { className: 'ws-sys__meta ws-micro' }, props.meta)),
      props.title && h('h3', { className: 'ws-sys__title ws-heading' }, props.title),
      props.children && h('div', { className: 'ws-sys__body' }, props.children),
      props.verdict && h('p', { className: 'ws-sys__verdict' }, props.verdict),
      awards.length > 0 && h('ul', { className: 'ws-sys__awards' }, awards.map(function (a, i) {
        return h('li', { key: i, className: 'ws-sys__award' },
          h('span', { className: 'ws-sys__award-stat ws-label' }, a.stat),
          h('span', { className: 'ws-sys__leader', 'aria-hidden': true }),
          h('span', { className: cx('ws-sys__award-amt ws-label', !a.positive && a.positive !== undefined && 'ws-sys__award-amt--none') }, a.amount));
      })));
  }

  /* ---------- Nav ---------- */
  function icon(name) {
    var p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'square', strokeLinejoin: 'miter' };
    var kids = {
      journal: [h('path', Object.assign({ key: 1, d: 'M5 3h11l3 3v15H5z' }, p)), h('path', Object.assign({ key: 2, d: 'M8 9h8M8 13h8M8 17h5' }, p))],
      chronicle: [h('path', Object.assign({ key: 1, d: 'M4 5h16v15H4zM4 9h16' }, p)), h('path', Object.assign({ key: 2, d: 'M8 3v4M16 3v4M8 13h2M12 13h2M16 13h0.01M8 16h2M12 16h2' }, p))],
      stats: [h('path', Object.assign({ key: 1, d: 'M4 20h16' }, p)), h('path', Object.assign({ key: 2, d: 'M6 20v-6h3v6M10.5 20V9h3v11M15 20V4h3v16' }, p))],
      settings: [h('path', Object.assign({ key: 1, d: 'M4 7h9M17 7h3M4 17h3M11 17h9' }, p)), h('path', Object.assign({ key: 2, d: 'M13 5h4v4h-4zM7 15h4v4H7z' }, p))]
    }[name];
    return kids ? h('svg', { className: 'ws-nav__icon', viewBox: '0 0 24 24', 'aria-hidden': true }, kids) : null;
  }
  var DEFAULT_ITEMS = [
    { id: 'journal', label: 'Journal', icon: 'journal' },
    { id: 'chronicle', label: 'Chronicle', icon: 'chronicle' },
    { id: 'stats', label: 'Stats', icon: 'stats' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];
  function Nav(props) {
    var items = props.items || DEFAULT_ITEMS;
    var layout = props.layout || 'auto';
    return h('nav', { className: cx('ws-nav', 'ws-nav--' + layout, props.className), 'aria-label': 'Main' },
      h('div', { className: 'ws-nav__inner' },
        props.brand !== false && h('a', { className: 'ws-nav__brand', href: props.brandHref || '#' }, props.brand || 'Whetstone'),
        h('ul', { className: 'ws-nav__list' }, items.map(function (it) {
          var current = it.id === props.active;
          var inner = [icon(it.icon || it.id), h('span', { key: 'l' }, it.label)];
          var common = { className: 'ws-nav__link', 'aria-current': current ? 'page' : undefined };
          return h('li', { key: it.id, className: 'ws-nav__item' },
            it.href
              ? h.apply(null, ['a', Object.assign({ href: it.href }, common)].concat(inner))
              : h.apply(null, ['button', Object.assign({ type: 'button', onClick: function () { if (props.onNavigate) props.onNavigate(it.id); } }, common)].concat(inner)));
        }))));
  }

  /* ---------- Tag ---------- */
  function Tag(props) {
    return h('span', { className: cx('ws-tag', props.tone && props.tone !== 'neutral' && 'ws-tag--' + props.tone, props.className) }, props.children);
  }

  /* ---------- Divider ---------- */
  function Divider(props) {
    var v = props.variant || 'plain';
    if (v === 'ornament') return h('div', { className: cx('ws-divider ws-divider--ornament', props.className), role: 'separator' },
      props.label ? h('span', { className: 'ws-divider__label ws-micro' }, props.label) : h('span', { className: 'ws-divider__mark', 'aria-hidden': true }));
    return h('hr', { className: cx('ws-divider', v === 'heavy' && 'ws-divider--heavy', props.className) });
  }

  /* ---------- Surface ---------- */
  function Surface(props) {
    var Tag = props.as || 'div';
    return h(Tag, { className: cx('ws-surface', props.grain !== false && 'ws-grain', props.vignette !== false && 'ws-vignette', props.className), style: props.style }, props.children);
  }

  var api = { Button: Button, TextInput: TextInput, TextArea: TextArea, Panel: Panel, StatBar: StatBar, LevelUp: LevelUp, SystemMessage: SystemMessage, Nav: Nav, Tag: Tag, Divider: Divider, Surface: Surface };
  window.Whetstone = Object.assign(window.Whetstone || {}, api);
})();

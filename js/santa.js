// Santa in bauble style (day 24 only), ported from the prototype's santaSvg and bigSanta.
// Colours come from css/tokens.css (illustration tokens).

/** Small Santa riding the sleigh. (x, y) = where his boots stand; s = scale. */
export function santaSmall(x, y, s, wave) {
  const arm = wave
    ? '<path d="M18 -48 Q34 -52 30 -70" fill="none" stroke="var(--santa-red)" stroke-width="9" stroke-linecap="round"/><circle cx="30" cy="-73" r="5" fill="var(--character-white)"/>'
    : '<path d="M18 -46 Q28 -34 20 -26" fill="none" stroke="var(--santa-red)" stroke-width="9" stroke-linecap="round"/><circle cx="20" cy="-25" r="5" fill="var(--character-white)"/>';
  return `<g class="santa-small" transform="translate(${x} ${y}) scale(${s})" aria-hidden="true">
      <ellipse cx="0" cy="2" rx="22" ry="4" fill="var(--scene-shadow)" opacity=".14"/>
      <path d="M-8 -22 L-9 -2 M8 -22 L9 -2" stroke="var(--santa-berry)" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="-11" cy="0" rx="8" ry="4" fill="var(--character-ink)"/><ellipse cx="11" cy="0" rx="8" ry="4" fill="var(--character-ink)"/>
      <path d="M-18 -46 Q-28 -34 -20 -26" fill="none" stroke="var(--santa-red)" stroke-width="9" stroke-linecap="round"/><circle cx="-20" cy="-25" r="5" fill="var(--character-white)"/>
      ${arm}
      <circle cx="0" cy="-38" r="22" fill="var(--santa-red)"/>
      <rect x="-22" y="-34" width="44" height="6" fill="var(--elf-fir-deep)"/><rect x="-5" y="-35.5" width="10" height="9" rx="1.5" fill="none" stroke="var(--character-bell)" stroke-width="2"/>
      <path d="M-13 -62 Q0 -28 13 -62 Z" fill="var(--character-white)"/>
      <circle cx="0" cy="-68" r="11" fill="var(--character-skin)"/>
      <circle cx="-4" cy="-70" r="1.7" fill="var(--character-ink)"/><circle cx="4" cy="-70" r="1.7" fill="var(--character-ink)"/><circle cx="0" cy="-66" r="2.6" fill="var(--santa-nose)"/>
      <path d="M-12 -74 Q-4 -98 14 -92 L11 -76 Z" fill="var(--santa-red)"/><rect x="-13" y="-78" width="26" height="6" rx="3" fill="var(--character-white)"/><circle cx="15" cy="-92" r="4.5" fill="var(--character-white)"/>
    </g>`;
}

/** Big Santa for day 24: stands in front of the sleigh, cut off by the snow bank, waving. (cx, cy) = face centre, r = face radius. */
export function santaBig(cx, cy, r) {
  const W = 'var(--character-white)';
  const K = 'var(--character-ink)';
  return `<g aria-hidden="true">
      <circle cx="${cx}" cy="${cy + r * 2.48}" r="${r * 1.6}" fill="var(--santa-red)"/>
      <rect x="${cx - r * 1.6}" y="${cy + r * 2.22}" width="${r * 3.2}" height="${r * 0.26}" fill="var(--elf-fir-deep)"/>
      <path d="M${cx - r * 1.22} ${cy + r * 1.35} Q${cx - r * 1.83} ${cy + r * 0.48} ${cx - r * 1.43} ${cy - r * 0.22}" fill="none" stroke="var(--santa-red)" stroke-width="${r * 0.48}" stroke-linecap="round"/>
      <circle cx="${cx - r * 1.41}" cy="${cy - r * 0.35}" r="${r * 0.28}" fill="${W}"/>
      <path d="M${cx - r * 0.95} ${cy - r * 0.45} Q${cx - r * 0.6} ${cy - r * 2.1} ${cx + r * 0.9} ${cy - r * 1.75} Q${cx + r * 1.45} ${cy - r * 1.5} ${cx + r * 1.25} ${cy - r * 0.9} Q${cx + r * 0.9} ${cy - r * 1.2} ${cx + r * 0.95} ${cy - r * 0.45} Z" fill="var(--santa-red)"/>
      <circle cx="${cx + r * 1.3}" cy="${cy - r * 0.82}" r="${r * 0.22}" fill="${W}"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--character-skin)"/>
      <path d="M${cx - r * 1.05} ${cy - r * 0.05} Q${cx - r * 1.25} ${cy + r * 1.2} ${cx - r * 0.5} ${cy + r * 1.55} Q${cx} ${cy + r * 1.9} ${cx + r * 0.5} ${cy + r * 1.55} Q${cx + r * 1.25} ${cy + r * 1.2} ${cx + r * 1.05} ${cy - r * 0.05} Q${cx + r * 0.6} ${cy + r * 0.5} ${cx} ${cy + r * 0.42} Q${cx - r * 0.6} ${cy + r * 0.5} ${cx - r * 1.05} ${cy - r * 0.05} Z" fill="${W}"/>
      <rect x="${cx - r * 1.1}" y="${cy - r * 0.72}" width="${r * 2.2}" height="${r * 0.42}" rx="${r * 0.21}" fill="${W}"/>
      <path d="M${cx - r * 0.48} ${cy - r * 0.12} q${r * 0.16} ${-r * 0.18} ${r * 0.32} 0 M${cx + r * 0.16} ${cy - r * 0.12} q${r * 0.16} ${-r * 0.18} ${r * 0.32} 0" fill="none" stroke="${K}" stroke-width="${Math.max(2, r * 0.07)}" stroke-linecap="round"/>
      <ellipse cx="${cx - r * 0.58}" cy="${cy + r * 0.18}" rx="${r * 0.17}" ry="${r * 0.1}" fill="var(--character-cheek)" opacity=".8"/><ellipse cx="${cx + r * 0.58}" cy="${cy + r * 0.18}" rx="${r * 0.17}" ry="${r * 0.1}" fill="var(--character-cheek)" opacity=".8"/>
      <path d="M${cx - r * 0.55} ${cy + r * 0.38} Q${cx - r * 0.25} ${cy + r * 0.15} ${cx} ${cy + r * 0.32} Q${cx + r * 0.25} ${cy + r * 0.15} ${cx + r * 0.55} ${cy + r * 0.38} Q${cx + r * 0.25} ${cy + r * 0.48} ${cx} ${cy + r * 0.4} Q${cx - r * 0.25} ${cy + r * 0.48} ${cx - r * 0.55} ${cy + r * 0.38} Z" fill="${W}" stroke="var(--santa-moustache-line)" stroke-width="1"/>
      <circle cx="${cx}" cy="${cy + r * 0.18}" r="${r * 0.17}" fill="var(--santa-nose)"/>
      <path d="M${cx - r * 0.2} ${cy + r * 0.62} Q${cx} ${cy + r * 0.82} ${cx + r * 0.2} ${cy + r * 0.62}" fill="var(--santa-mouth)"/>
    </g>`;
}

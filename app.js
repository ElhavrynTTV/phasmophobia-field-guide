(() => {
  'use strict';
  const data = window.FIELD_GUIDE_DATA;
  if (!data) { document.getElementById('resultCount').textContent='Guide data could not be loaded.'; return; }
  const $ = id => document.getElementById(id);
  const views = {
    ghosts:['GHOST IDENTIFICATION','Ghost library','Browse all 30 ghosts from the master guide, including evidence, controlled tests, survival notes, and folklore.'],
    chapters:['FIELD MANUAL','All 19 chapters','The complete guide organized by topic. Read source text here, or open the formatted PDF for diagrams and tables.'],
    updates:['PATCH INTELLIGENCE','Updates & previews','Released October 2026 mechanics and seasonal context are distinct from the upcoming Resonance preview.'],
    saved:['PERSONAL FIELD NOTES','Saved ghosts','Your personal bookmarks stay in this browser; no account or payment is needed.']
  };
  const allEvidence=['DOTS','EMF 5','Freezing','Orbs','Spirit Box','UV','Writing'];
  let view='ghosts', query='', selected=new Set(), saved=new Set();
  try { saved=new Set(JSON.parse(localStorage.getItem('elhavryn-ghost-bookmarks') || '[]')); } catch(e) { /* local storage may be unavailable */ }
  const esc = s => String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const linkPage = page => data.sourceFile+'#page='+encodeURIComponent(page);
  const searchGhost = g => [g.name,g.origin,g.lore,g.pronunciation,...g.evidence,...Object.values(g.fields)].join(' ').toLowerCase();
  const searchSection = s => (s.title+' '+s.text).toLowerCase();
  function shorten(s,max=165){const t=(s||'').replace(/\s+/g,' ').trim();return t.length>max?t.slice(0,max).replace(/\s+\S*$/,'')+'…':t;}
  function pills(g){return g.evidence.map(v=>`<span class="evidence-pill">${esc(v)}</span>`).join('')+(g.forced?`<span class="evidence-pill special">${esc(g.name==='The Mimic'?'FAKE ORBS': 'FORCED EVIDENCE')}</span>`:'');}
  function ghostCard(g){
    const isSaved=saved.has(g.name);
    return `<article class="card"><div class="card-head"><span class="ghost-id">FILE ${String(g.number).padStart(2,'0')} / 30</span><span class="status">GHOST DOSSIER</span></div><h3>${esc(g.name)}</h3><div class="chips">${pills(g)}</div><div><span class="subtle-label">Zero-evidence identification</span><p>${esc(shorten(g.fields['0-evidence identification']||g.fields['Best controlled test']))}</p></div><div class="card-actions"><button class="read-btn" data-ghost="${esc(g.name)}" type="button">Open dossier →</button><button class="save-btn" type="button" data-save="${esc(g.name)}" aria-label="${isSaved?'Remove':'Save'} ${esc(g.name)}" aria-pressed="${isSaved}">${isSaved?'★':'☆'}</button></div></article>`;
  }
  function chapterCard(s){return `<article class="card"><div class="card-head"><span class="ghost-id">CHAPTER ${String(s.id).padStart(2,'0')} / 19</span><span class="status ${esc(s.status)}">${esc(s.status==='preview'?'NOT RELEASED':s.status==='seasonal'?'EVENT NOTES':'GUIDE')}</span></div><h3>${esc(s.title)}</h3><p class="chapter-note">Source pages ${s.page}${s.lastPage!==s.page?'–'+s.lastPage:''}</p><p>${esc(shorten(s.text,195))}</p><div class="card-actions"><button class="read-btn" data-chapter="${s.id}" type="button">Read chapter →</button></div></article>`;}
  function matchesGhost(g){const exact=data.ghosts.some(x=>x.name.toLowerCase()===query);const qMatch=!query||(exact?g.name.toLowerCase()===query:searchGhost(g).includes(query));const eMatch=[...selected].every(e=>g.evidence.includes(e)||(e==='Orbs'&&g.name==='The Mimic'));return qMatch&&eMatch;}
  function setView(next){view=next;document.querySelectorAll('.tab').forEach(btn=>{const active=btn.dataset.view===view;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});render();}
  function render(){
    const [kicker,title,description]=views[view];$('kicker').textContent=kicker;$('viewTitle').textContent=title;$('viewDescription').textContent=description;
    $('evidencePanel').hidden=!(view==='ghosts'||view==='saved');$('savedCount').textContent=String(saved.size);
    let arr=[];
    if(view==='ghosts')arr=data.ghosts.filter(matchesGhost);
    if(view==='saved')arr=data.ghosts.filter(g=>saved.has(g.name)&&matchesGhost(g));
    if(view==='chapters')arr=data.sections.filter(s=>!query||searchSection(s).includes(query));
    if(view==='updates')arr=data.sections.filter(s=>[15,18,19].includes(s.id)&&(!query||searchSection(s).includes(query)));
    $('resultCount').textContent=`${arr.length} ${view==='ghosts'||view==='saved'?'ghost dossier'+(arr.length===1?'':'s'):'chapter'+(arr.length===1?'':'s')} found`;
    $('results').innerHTML=arr.map(view==='ghosts'||view==='saved'?ghostCard:chapterCard).join('');$('empty').hidden=arr.length!==0;
    renderEvidence();
  }
  function renderEvidence(){
    $('evidenceButtons').innerHTML=allEvidence.map(e=>`<button type="button" class="chip" data-evidence="${esc(e)}" aria-pressed="${selected.has(e)}">${esc(e)}</button>`).join('');
  }
  function toggleSave(name){if(saved.has(name))saved.delete(name);else saved.add(name);try{localStorage.setItem('elhavryn-ghost-bookmarks',JSON.stringify([...saved]));}catch(e){}render();}
  function openReader(html,kicker){$('readerKicker').textContent=kicker;$('readerBody').innerHTML=html;$('reader').showModal();$('reader').scrollTop=0;}
  function openGhost(name){
    const g=data.ghosts.find(x=>x.name===name);if(!g)return;
    const fields=[['Core mechanics','Core mechanics'],['Ability / hidden mechanic','Special ability / hidden mechanic'],['Best controlled test','Best controlled test'],['0-evidence identification','Zero-evidence identification'],['Common confusion','Common confusion'],['Survival note','Survival note']];
    const body=`<h2>${esc(g.name)}</h2><div class="reader-tags">${pills(g)}</div><p class="summary"><strong>Source evidence:</strong> ${esc(g.evidence.join(' • '))}${g.forced?`<br><strong>Important exception:</strong> ${esc(g.forced)}`:''}</p>${g.pronunciation?`<h3>Pronunciation</h3><p>${esc(g.pronunciation)}</p>`:''}${g.origin?`<h3>Cultural origin</h3><p>${esc(g.origin)}</p>`:''}${fields.filter(([key])=>g.fields[key]).map(([key,label])=>`<h3>${esc(label)}</h3><p>${esc(g.fields[key])}</p>`).join('')}${g.lore?`<h3>Folklore & background</h3><p>${esc(g.lore)}</p><p class="caveat">Folklore is cultural context, not a gameplay identification rule.</p>`:''}<a class="source-anchor" target="_blank" rel="noopener" href="${esc(linkPage(g.page))}">See formatted PDF dossier, page ${g.page} ↗</a>`;
    openReader(body,'GHOST FILE '+String(g.number).padStart(2,'0'));
  }
  
  function formatChapterText(text) {
    const lines = text.replace(/\r/g, '').split('\n');
    const parts = [];
    let paragraph = '';
    let bullet = false;

    function finishParagraph() {
      if (!paragraph) return;
      parts.push(`<p>${bullet ? '• ' : ''}${esc(paragraph)}</p>`);
      paragraph = '';
      bullet = false;
    }

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        finishParagraph();
        continue;
      }

      if (/^[\uF0B7\u2022]/.test(line)) {
        finishParagraph();
        paragraph = line.replace(/^[\uF0B7\u2022]\s*/, '');
        bullet = true;
        continue;
      }

      const cells = line.split(/\s{3,}/).filter(Boolean);
      if (cells.length > 1) {
        finishParagraph();
        parts.push(`<p><strong>${esc(cells[0])}:</strong> ${esc(cells.slice(1).join(' | '))}</p>`);
        continue;
      }

      const heading = line.length < 65 &&
        /^[A-Z]/.test(line) &&
        !/[.?!:;]$/.test(line) &&
        !/^\d+[.)]\s/.test(line);

      if (heading) {
        finishParagraph();
        parts.push(`<h3>${esc(line)}</h3>`);
        continue;
      }

      paragraph += (paragraph ? ' ' : '') + line;
    }

    finishParagraph();
    return parts.join('');
  }

function chapterOneEvents() {
  const rows = [
    [
      "Front/exit door",
      "May close, but is not locked by a normal event.",
      "Locks at the beginning of the grace period."
    ],
    [
      "Room lights",
      "May switch, shatter, or flicker locally.",
      "Lights flicker near the ghost. Switches generally cannot be toggled during a hunt."
    ],
    [
      "Electronics",
      "Can interfere during a nearby manifestation.",
      "Interference follows the hunting ghost. Powered handheld equipment can reveal your location."
    ],
    [
      "Ghost appearance",
      "Often appears or approaches as a manifestation.",
      "Alternates visible and invisible blinking while actively searching for players."
    ],
    [
      "Your response",
      "Collect photos, video, or sound when safe.",
      "Survive first. Gather evidence afterward."
    ]
  ];

  return `
    <h3>Events vs. Hunts: Fast Checks</h3>
    <div class="hunt-compare">
      ${rows.map(([signal, event, hunt]) => `
        <section class="hunt-check">
          <h4>${esc(signal)}</h4>
          <div class="hunt-check-columns">
            <p><strong>Ghost Event</strong>${esc(event)}</p>
            <p><strong>Hunt</strong>${esc(hunt)}</p>
          </div>
        </section>
      `).join('')}
    </div>
  `;
}

function chapterOneSanity() {
  const rows = [
    [
      "Standard baseline",
      "Most ghosts can naturally begin hunting when average team sanity is at or below ~50%."
    ],
    [
      "Banshee",
      "Uses its selected target's sanity while that target is inside."
    ],
    [
      "Early hunters",
      "Demon ~70% plus rare any-sanity ability; Dayan 65% with a moving player nearby; Raiju 65% near active electronics; Mare 60% in darkness; Onryo ~60%; Gallu 60% enraged; Obambo 65% aggressive; young Thaye ~75%; Kormos can rise to 70% after same-room sprinting."
    ],
    [
      "Late hunters",
      "Shade ~35%; Deogen 40%; Mare 40% in a lit room; Dayan 45% with a still player nearby; Gallu 40% weakened; old Thaye can fall toward ~15%; calm Obambo 10%."
    ],
    [
      "Cursed hunts",
      "Cursed possessions can bypass ordinary sanity rules. After a cursed hunt, future hunts remain longer for that contract."
    ],
    [
      "Custom difficulty",
      "Starting sanity, evidence count, ghost speed, player speed, grace periods, and other settings can change standard assumptions."
    ]
  ];

  return `
    <h3>Sanity & Hunt Thresholds</h3>
    <div class="hunt-compare">
      ${rows.map(([title, description]) => `
        <section class="hunt-check">
          <h4>${esc(title)}</h4>
          <p>${esc(description)}</p>
        </section>
      `).join('')}
    </div>
  `;
}

function chapterOneDurations() {
  const rows = [
    ["Amateur (Low)", "15 s", "30 s", "40 s"],
    ["Intermediate (Medium)", "20 s", "40 s", "50 s"],
    [
      "Professional / Nightmare / Insanity (High)",
      "30 s", "50 s", "60 s"
    ],
    [
      "After first cursed hunt — subsequent hunts",
      "Add 20 s", "Add 20 s", "Add 20 s"
    ],
    [
      "Obambo aggressive-start hunt",
      "20% shorter", "20% shorter", "20% shorter"
    ]
  ];

  return `
    <h3>Hunt Duration</h3>
    <p class="chapter-note">
      Base duration by difficulty and map size.
    </p>
    <div class="hunt-compare">
      ${rows.map(([title, small, medium, large]) => `
        <section class="hunt-check">
          <h4>${esc(title)}</h4>
          <div class="duration-grid">
            ${[
              ["Small map", small],
              ["Medium map", medium],
              ["Large map", large]
            ].map(([label, value]) => `
              <div class="duration-cell">
                <strong>${esc(label)}</strong>
                <span>${esc(value)}</span>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
    <p class="summary">
      Obambo's aggressive-start hunt is 20% shorter than
      the otherwise applicable duration.
    </p>
    <p class="summary">
      NIGHTMARE / INSANITY: If kills extend hunts,
      a player death can add substantial time.
      Do not leave hiding simply because a hunt feels long.
    </p>
  `;
}

function chapterOneLayout(text) {
  const headings = [
    "Sanity & hunt thresholds",
    "How a hunt starts",
    "Hunt duration",
    "Ghost detection during hunts",
    "Events vs. hunts: fast checks"
  ];

  if (!headings.every(heading => text.includes(heading))) {
    return formatChapterText(text);
  }

  function between(start, end) {
    const from = text.indexOf(start) + start.length;
    const to = text.indexOf(end, from);
    return text.slice(from, to).trim();
  }

  const introduction = text.split(headings[0])[0];

  return `
    ${formatChapterText(introduction)}
    ${chapterOneSanity()}
    <h3>How a hunt starts</h3>
    ${formatChapterText(between(headings[1], headings[2]))}
    ${chapterOneDurations()}
    <h3>Ghost detection during hunts</h3>
    ${formatChapterText(between(headings[3], headings[4]))}
    ${chapterOneEvents()}
  `;
}

function chapterTwoLayout() {
  const evidence = [
    {
      name: "EMF Level 5",
      collect: "Check fresh EMF 2/3-eligible interactions. When EMF 5 is available, qualifying interactions have a 33% chance to show it.",
      warning: "Repeat tests on fresh interactions. Five-point jumps on the activity monitor are not proof. Hunts can cause interference."
    },
    {
      name: "DOTS Projector",
      collect: "Cover the ghost's active area with DOTS. The ghost can briefly enter a DOTS state, making its silhouette visible.",
      warning: "Goryo DOTS can only be seen through a video camera when no player is in the ghost's current room."
    },
    {
      name: "Ultraviolet (UV)",
      collect: "Check fresh door, window, light switch, keyboard and salt interactions for UV marks. Illuminate prints with UV before photographing them.",
      warning: "Obake may skip UV prints and can leave unusual prints. One missing print is not enough to exclude UV."
    },
    {
      name: "Freezing Temperatures",
      collect: "Use a thermometer. A reading of 0°C / 32°F or below confirms Freezing Temperatures.",
      warning: "Visible breath alone does not confirm Freezing. Hantu has forced Freezing on reduced-evidence settings."
    },
    {
      name: "Ghost Orbs",
      collect: "Use night vision to scan the favorite room. Check different camera angles and rooms when the favorite room may have changed.",
      warning: "The Mimic produces additional fake Ghost Orbs, even on true zero-evidence difficulty."
    },
    {
      name: "Ghost Writing",
      collect: "Open and place a writing book within the ghost's active range. Higher equipment tiers can improve writing success and coverage.",
      warning: "A thrown book without writing is meaningful only when Ghost Writing is not hidden by the difficulty settings."
    },
    {
      name: "Spirit Box",
      collect: "Be in the same room as the ghost, within the Spirit Box tier's range, with room lights off. Ask recognized questions or use text mode.",
      warning: "Deogen and Moroi have forced Spirit Box on reduced evidence. Deogen can produce a special heavy-breathing response."
    }
  ];

  const forced = [
    ["Goryo", "DOTS"],
    ["Hantu", "Freezing"],
    ["Moroi", "Spirit Box"],
    ["Obake", "Ultraviolet"],
    ["Deogen", "Spirit Box"]
  ];

  return `
    <p class="summary">
      <strong>NEGATIVE EVIDENCE RULE:</strong>
      On standard three-evidence settings, a properly
      tested negative can help exclude ghosts.
      On reduced-evidence settings, evidence may be
      intentionally hidden unless it is forced.
      On zero evidence, standard evidence is hidden.
      The Mimic's fake Orbs are the exception.
    </p>

    <h3>Seven Evidence Types</h3>

    <div class="hunt-compare">
      ${evidence.map(item => `
        <section class="hunt-check">
          <h4>${esc(item.name)}</h4>

          <div class="hunt-check-columns">
            <p>
              <strong>How to Collect</strong>
              ${esc(item.collect)}
            </p>

            <p>
              <strong>Important Traps</strong>
              ${esc(item.warning)}
            </p>
          </div>
        </section>
      `).join('')}
    </div>

    <h3>Forced & Special Evidence</h3>

    <p class="chapter-note">
      When at least one evidence type is enabled,
      these ghosts have guaranteed evidence:
    </p>

    <div class="hunt-compare">
      ${forced.map(([ghost, type]) => `
        <section class="hunt-check">
          <h4>${esc(ghost)}</h4>
          <p>
            <strong>Forced Evidence:</strong>
            ${esc(type)}
          </p>
        </section>
      `).join('')}
    </div>

    <section class="hunt-check">
      <h4>The Mimic — Special Rule</h4>

      <p>
        The Mimic always produces fake Ghost Orbs,
        including on true zero-evidence difficulty.
        These Orbs are an ability, not one of its
        three real evidence types.
      </p>

      <p>
        Its real evidences are Ultraviolet,
        Freezing Temperatures and Spirit Box.
        None is individually forced on
        reduced-evidence settings.
      </p>
    </section>
  `;
}

  function openChapter(id) {
    const s = data.sections.find(x => x.id === id);
    if (!s) return;

    const preview = s.id === 19
      ? '<p class="summary"><strong>PREVIEW ONLY:</strong> Announced content was not live in this edition.</p>'
      : '';

    const note = s.id === 4
      ? '<p class="summary">For individual ghost dossiers, use the Ghost Library.</p>'
      : '';

    const html = `
      <h2>${esc(s.title)}</h2>
      <p class="chapter-note">Chapter ${s.id} • Source pages ${s.page}–${s.lastPage}</p>
      ${preview}
      ${note}
     


${s.id === 1
  ? chapterOneLayout(s.text || '')
  : s.id === 2
    ? chapterTwoLayout()
    : formatChapterText(s.text || '')}



      <a class="source-anchor" target="_blank" rel="noopener"
         href="${esc(linkPage(s.page))}">
         Open original formatted PDF at page ${s.page} ↗
      </a>
    `;

    openReader(html, 'CHAPTER ' + String(s.id).padStart(2, '0'));
  }

  document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render();});
  $('clearSearch').addEventListener('click',()=>{$('search').value='';query='';render();$('search').focus();});
  $('clearEvidence').addEventListener('click',()=>{selected.clear();render();});
  $('evidenceButtons').addEventListener('click',e=>{const b=e.target.closest('[data-evidence]');if(!b)return;const ev=b.dataset.evidence;if(selected.has(ev))selected.delete(ev);else selected.add(ev);render();});
  $('results').addEventListener('click',e=>{const g=e.target.closest('[data-ghost]');const s=e.target.closest('[data-save]');const c=e.target.closest('[data-chapter]');if(g)openGhost(g.dataset.ghost);else if(s)toggleSave(s.dataset.save);else if(c)openChapter(Number(c.dataset.chapter));});
  $('closeReader').addEventListener('click',()=>$('reader').close());
  $('reader').addEventListener('click',e=>{if(e.target===$('reader'))$('reader').close();});
  render();
  // Offline cache is enabled once served on HTTPS or localhost, not from file://.
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
})();

/* Loads content published from the XAMPP CMS. Existing HTML stays as a fast fallback. */
(() => {
  'use strict';
  const api = new URL('api/content.php', document.currentScript.src).href;
  const staticContent = new URL('storage/content.json', document.currentScript.src).href;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
  const pageKey = ({index:'home','':'home','course':'course','news':'news','priest':'priest','funeral':'funeral','church-tour':'tour'})[page] || page;
  const attrPath = (value) => {
    const path = String(value || '').trim();
    return /^(https:\/\/|\/|#)/.test(path) || /^[a-zA-Z0-9._/-]+$/.test(path) ? path : '#';
  };
  const setText = (element, value) => { if (element && value != null) element.textContent = value; };
  const setIntro = (element, value) => {
    if (!element || value == null) return;
    element.replaceChildren(...String(value).split('\n').flatMap((part, index) => index ? [document.createElement('br'), document.createTextNode(part)] : [document.createTextNode(part)]));
  };
  const renderHero = (data) => {
    const hero = document.querySelector('.parish-hero'); const entry = data.heroes?.[pageKey];
    if (!hero || !entry) return;
    setText(hero.querySelector('.parish-eyebrow'), entry.eyebrow);
    setText(hero.querySelector('h1'), entry.title);
    setIntro(hero.querySelector('.parish-hero-intro'), entry.intro);
    const paragraphs = hero.querySelectorAll('.container > p');
    if (paragraphs.length > 1 && entry.description != null) setText(paragraphs[paragraphs.length - 1], entry.description);
    const button = hero.querySelector('.btn-primary');
    if (button) { button.href = attrPath(entry.buttonHref); if (entry.buttonText != null) button.textContent = entry.buttonText + ' ↗'; }
  };
  const renderSchedule = (locations) => {
    const root = document.querySelector('.schedule-grid'); if (!root || !Array.isArray(locations)) return;
    root.innerHTML = locations.map((location) => `<article class="schedule-card"><div class="schedule-header"><h3>${escapeHtml(location.name)}</h3><span class="location-tag">${escapeHtml(location.location)}</span></div><div class="schedule-body">${(location.groups || []).map((group) => `<div class="schedule-group"><h4>${escapeHtml(group.title)}</h4><ul>${(group.items || []).map((item) => `<li><span class="day">${escapeHtml(item.day)}</span><span class="time">${escapeHtml(item.time)} <span class="lang">(${escapeHtml(item.language)})</span></span></li>`).join('')}</ul></div>`).join('')}<div class="schedule-footer"><i class="fas fa-pray" aria-hidden="true"></i> ${escapeHtml(location.footer || '')}</div></div></article>`).join('');
  };
  const renderNotices = (months) => {
    const root = document.querySelector('.notices-container'); if (!root || !Array.isArray(months)) return;
    root.innerHTML = months.map((month, monthIndex) => `<details class="notice-month"${monthIndex === 0 ? ' open' : ''}><summary><span><span class="notice-month-label">${escapeHtml(month.month)}</span><span class="notice-month-year">${escapeHtml(month.year)}</span></span><span class="notice-month-meta">${(month.weeks || []).filter((week) => (week.notices || []).length).length} published week(s) <i class="fas fa-chevron-down" aria-hidden="true"></i></span></summary><div class="notice-month-content">${(month.weeks || []).map((week, weekIndex) => `<details class="notice-week${(week.notices || []).length ? '' : ' notice-week-empty'}"${monthIndex === 0 && weekIndex === 0 ? ' open' : ''}><summary><span><span class="notice-week-number">${escapeHtml(week.number)}</span><span class="notice-week-dates">${escapeHtml(week.dates)}</span></span><i class="fas fa-chevron-down" aria-hidden="true"></i></summary>${(week.notices || []).length ? `<div class="notice-list">${week.notices.map((notice) => `<article class="notice-item"><div class="notice-text"><h4>${escapeHtml(notice.title)}</h4><p>${escapeHtml(notice.body)}</p></div></article>`).join('')}</div>` : '<p class="notice-empty-message">Notices for this week will appear here when published.</p>'}</details>`).join('')}</div></details>`).join('');
  };
  const renderGallery = (items) => {
    const root = document.querySelector('.ig-grid'); if (!root || !Array.isArray(items)) return;
    root.innerHTML = items.map((item) => `<div class="ig-item"><img src="${escapeHtml(attrPath(item.image))}" alt="${escapeHtml(item.caption)}" class="gallery-img" loading="lazy"><div class="ig-overlay"><i class="fas fa-search-plus" aria-hidden="true"></i></div></div>`).join('');
    root.querySelectorAll('.ig-item').forEach((item) => item.addEventListener('click', () => {
      const modal = document.getElementById('imageModal'), expanded = document.getElementById('expandedImg'), caption = document.getElementById('caption');
      const image = item.querySelector('img'); if (!modal || !expanded || !image) return;
      modal.style.display = 'block'; expanded.src = image.src; expanded.alt = image.alt; if (caption) caption.textContent = image.alt; document.body.style.overflow = 'hidden';
    }));
  };
  const renderCourses = (items) => {
    const root = document.querySelector('main.page-content'); if (!root || !Array.isArray(items)) return;
    items.forEach((item, index) => {
      const id = String(item.id || '').replace(/[^a-zA-Z0-9_-]/g, ''); let section = id && document.getElementById(id);
      if (!section) { section = document.createElement('section'); section.className = `content-row fade-up${index % 2 ? ' bg-alternate' : ''}`; if (id) section.id = id; section.innerHTML = `<div class="container grid-2"><div class="row-image"><img loading="lazy"></div><div class="row-text"><i class="fas fa-book section-icon" aria-hidden="true"></i><h2></h2><p></p><ul class="requirement-list"></ul><div class="action-buttons"></div></div></div>`; root.append(section); }
      const img = section.querySelector('.row-image img'); if (img) { img.src = attrPath(item.image); img.alt = item.title || ''; }
      setText(section.querySelector('.row-text h2'), item.title); setText(section.querySelector('.row-text > p'), item.description);
      const list = section.querySelector('.requirement-list'); if (list) list.innerHTML = (item.requirements || []).map((text) => `<li><i class="fas fa-check" aria-hidden="true"></i> ${escapeHtml(text)}</li>`).join('');
      const links = section.querySelector('.action-buttons'); if (links) links.innerHTML = (item.links || []).map((link, linkIndex) => `<a class="${linkIndex ? 'btn-outline-dark' : 'btn-primary'}" href="${escapeHtml(attrPath(link.url))}"${/^https:\/\//.test(link.url || '') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(link.text)}</a>`).join('');
    });
    [...root.querySelectorAll('.content-row')].forEach((section) => { if (section.id && !items.some((item) => item.id === section.id)) section.hidden = true; });
  };
  const renderPriests = (items) => {
    const root = document.querySelector('.priest-directory .container'); if (!root || !Array.isArray(items)) return;
    root.innerHTML = items.map((priest) => `<article class="priest-card"><div class="priest-image"><img src="${escapeHtml(attrPath(priest.image))}" alt="${escapeHtml(priest.name)}" loading="lazy"></div><div class="priest-info"><span class="priest-role">${escapeHtml(priest.role)}</span><h3>${escapeHtml(priest.name)}</h3><ul class="priest-details"><li><span>Year of Birth:</span> ${escapeHtml(priest.birth)}</li><li><span>Year of Ordination:</span> ${escapeHtml(priest.ordination)}</li><li><span>Telephone:</span> ${escapeHtml(priest.telephone)}</li><li><span>Address:</span> ${escapeHtml(priest.address)}</li></ul></div></article>`).join('');
  };
  const renderTour = (data) => {
    const grid = document.querySelector('.tour-highlight-grid');
    if (grid && Array.isArray(data.tourHighlights)) data.tourHighlights.forEach((item) => {
      const id = String(item.id || '').replace(/[^a-zA-Z0-9_-]/g, ''); const article = document.getElementById(`highlight-${id}`); if (!article) return;
      const image = article.querySelector('img'); if (image) { image.src = attrPath(item.image); image.alt = item.title || ''; }
      setText(article.querySelector('.tour-card-number'), item.category); setText(article.querySelector('h3'), item.title); setText(article.querySelector('.tour-highlight-content > p'), item.description);
    });
    const timeline = document.querySelector('.tour-timeline');
    if (timeline && Array.isArray(data.tourHistory)) timeline.innerHTML = data.tourHistory.map((item) => `<li><span class="tour-timeline-label">${escapeHtml(item.label)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></li>`).join('');
  };
  const loadContent = fetch(api, {cache:'no-store'}).then((response) => {
    if (!response.ok) throw new Error('PHP content API is unavailable.');
    return response.json();
  }).catch(() => fetch(staticContent, {cache:'no-store'}).then((response) => {
    if (!response.ok) throw new Error('Static content file is unavailable.');
    return response.json();
  }));
  loadContent.then((data) => {
    if (!data) return;
    renderHero(data); renderSchedule(data.schedule); renderNotices(data.notices); renderGallery(data.gallery); renderCourses(data.courses); renderPriests(data.priests); renderTour(data);
    document.dispatchEvent(new CustomEvent('church-cms-content-loaded', {detail:data}));
  }).catch(() => { /* No CMS endpoint: retain the original HTML content. */ });
})();

const oldWorkshopLinks = {"podsumowanie":"warsztat-podsumowanie.html","podsumowanie-tytul":"warsztat-podsumowanie.html","pomoc-podsumowanie":"warsztat-podsumowanie.html","notatka-podsumowanie":"warsztat-podsumowanie.html","export-warsztat":"warsztat-zakres.html","notes-status":"warsztat-zakres.html","prompt-eksport":"warsztat-podsumowanie.html","przygotowanie":"warsztat-przygotowanie.html","warsztat-tytul":"warsztat-przygotowanie.html","dashboard":"warsztat-dashboard.html","dashboard-tytul":"warsztat-dashboard.html","warsztat-notatka":"warsztat-dashboard.html","warsztat-notatka-tekst":"warsztat-dashboard.html","warsztat-dashboard-prompt":"warsztat-dashboard.html","warsztat-dashboard-prompt-tekst":"warsztat-dashboard.html","warsztat-dashboard-krytyczny":"warsztat-dashboard.html","pomoc-dashboard":"warsztat-dashboard.html","notatka-dashboard":"warsztat-dashboard.html","zrodla":"warsztat-zrodla.html","zrodla-tytul":"warsztat-zrodla.html","pomoc-zrodla":"warsztat-zrodla.html","notatka-zrodla":"warsztat-zrodla.html","sponsor":"warsztat-sponsor.html","sponsor-tytul":"warsztat-sponsor.html","warsztat-decyzja":"warsztat-sponsor.html","warsztat-decyzja-tekst":"warsztat-sponsor.html","warsztat-stan":"warsztat-sponsor.html","warsztat-stan-tekst":"warsztat-sponsor.html","prompt-infografika":"warsztat-sponsor.html","pomoc-sponsor":"warsztat-sponsor.html","notatka-sponsor":"warsztat-sponsor.html","dostawca":"warsztat-dostawca.html","dostawca-tytul":"warsztat-dostawca.html","warsztat-zmiana":"warsztat-dostawca.html","warsztat-zmiana-tekst":"warsztat-dostawca.html","warsztat-dostawca":"warsztat-dostawca.html","warsztat-dostawca-tekst":"warsztat-dostawca.html","pomoc-dostawca":"warsztat-dostawca.html","notatka-dostawca":"warsztat-dostawca.html","zakres":"warsztat-zakres.html","zakres-tytul":"warsztat-zakres.html","warsztat-brief":"warsztat-zakres.html","warsztat-brief-tekst":"warsztat-zakres.html","warsztat-hr":"warsztat-zakres.html","warsztat-hr-tekst":"warsztat-zakres.html","warsztat-operacje":"warsztat-zakres.html","warsztat-operacje-tekst":"warsztat-zakres.html","warsztat-it":"warsztat-zakres.html","warsztat-it-tekst":"warsztat-zakres.html","pomoc-zakres":"warsztat-zakres.html","prompt-zakres":"warsztat-zakres.html","notatka-zakres":"warsztat-zakres.html"};
if (location.pathname.endsWith('/warsztat.html')) {
  const target = oldWorkshopLinks[location.hash.slice(1)];
  if (target) location.replace(target + location.hash);
}

const copyStatus = document.querySelector('.copy-status');
let statusTimeout;

function showCopyStatus(message) {
  clearTimeout(statusTimeout);
  copyStatus.textContent = message;
  statusTimeout = setTimeout(() => { copyStatus.textContent = ''; }, 6000);
}

document.querySelectorAll('[data-copy]').forEach(button => { button.hidden = false; });

const mobileIndex = document.querySelector('.index ol');
const currentModule = mobileIndex?.querySelector('[aria-current="page"]');
if (currentModule && window.matchMedia('(max-width: 760px)').matches) {
  mobileIndex.scrollLeft += currentModule.getBoundingClientRect().left
    - mobileIndex.getBoundingClientRect().left - 8;
}

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;

  const source = document.getElementById(button.dataset.copy);
  try {
    await navigator.clipboard.writeText(source.textContent);
    showCopyStatus('Skopiowano do schowka.');
  } catch {
    const preview = source.parentElement;
    const panel = preview.closest('.source-panel');
    if (panel) panel.open = true;

    const manualCopy = document.createElement('textarea');
    manualCopy.className = 'manual-copy';
    manualCopy.readOnly = true;
    manualCopy.value = source.textContent;
    manualCopy.setAttribute('aria-label', preview.getAttribute('aria-label'));
    preview.before(manualCopy);
    preview.hidden = true;
    manualCopy.addEventListener('blur', () => {
      preview.hidden = false;
      manualCopy.remove();
    }, { once: true });
    manualCopy.focus({ preventScroll: true });
    manualCopy.select();
    manualCopy.scrollIntoView({ block: 'nearest' });
    showCopyStatus('Tekst zaznaczony. Użyj polecenia Kopiuj albo skrótu Ctrl+C lub ⌘C.');
  }
});

function revealLinkTarget() {
  const id = window.location.hash.slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;

  let disclosure = target.closest('details');
  if (!disclosure) return;
  while (disclosure) {
    disclosure.open = true;
    disclosure = disclosure.parentElement.closest('details');
  }
  if (target.matches('details')) target.firstElementChild.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start' });
}

window.addEventListener('hashchange', revealLinkTarget);
revealLinkTarget();

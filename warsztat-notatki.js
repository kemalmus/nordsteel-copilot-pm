const noteFields = [...document.querySelectorAll('[data-workshop-note]')];
const notesStatus = document.getElementById('notes-status');
const storageKey = 'nordsteel-warsztat-notatki-v1';
let storage = null;
let temporaryStorage = false;
let savedNotes = {};

try {
  storage = window.localStorage;
  savedNotes = JSON.parse(storage.getItem(storageKey) || '{}');
  storage.setItem(storageKey, JSON.stringify(savedNotes));
} catch {
  try {
    storage = window.sessionStorage;
    savedNotes = JSON.parse(storage.getItem(storageKey) || '{}');
    storage.setItem(storageKey, JSON.stringify(savedNotes));
    temporaryStorage = true;
  } catch {
    storage = null;
    savedNotes = {};
  }
}

for (const field of noteFields) {
  field.value = typeof savedNotes[field.dataset.workshopNote] === 'string'
    ? savedNotes[field.dataset.workshopNote]
    : '';
}

function currentNotes() {
  let existing = savedNotes;
  try {
    if (storage) existing = JSON.parse(storage.getItem(storageKey) || '{}');
  } catch {
    storage = null;
  }
  return { ...existing, ...Object.fromEntries(noteFields.map(field => [field.dataset.workshopNote, field.value])) };
}

function warnSaveProblem(message) {
  const backup = document.querySelector('.notes-backup');
  if (backup) backup.hidden = false;
  if (notesStatus) notesStatus.textContent = message;
  for (const field of noteFields) {
    let warning = field.parentElement.querySelector('.save-error');
    if (!warning) {
      warning = document.createElement('p');
      warning.className = 'save-error';
      warning.setAttribute('role', 'alert');
      field.after(warning);
    }
    warning.textContent = message;
  }
}

function saveNotes() {
  savedNotes = currentNotes();
  try {
    if (!storage) throw new Error('Storage unavailable');
    storage.setItem(storageKey, JSON.stringify(savedNotes));
  } catch {
    storage = null;
    warnSaveProblem('Automatyczny zapis jest niedostępny. Przed przejściem dalej skopiuj notatki lub pobierz je w pliku JSON.');
  }
}

if (!storage) {
  warnSaveProblem('Automatyczny zapis jest niedostępny. Przed przejściem dalej skopiuj notatki lub pobierz je w pliku JSON.');
} else if (temporaryStorage) {
  warnSaveProblem('Notatki są zapisywane tylko w tej karcie. Pobierz plik JSON przed jej zamknięciem.');
}
noteFields.forEach(field => field.addEventListener('input', saveNotes));

const exportButton = document.getElementById('export-warsztat');
if (exportButton) exportButton.addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  notesStatus.textContent = 'Przygotowuję plik…';
  try {
    if (!window.materialyWarsztatu) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'warsztat-materialy.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      });
    }
    const exportData = {
      wersja: 1,
      utworzono: new Date().toISOString(),
      notatki: currentNotes(),
      materialy: window.materialyWarsztatu,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nordsteel-materialy-i-notatki.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    notesStatus.textContent = 'Plik JSON został przygotowany. Sprawdź folder Pobrane.';
  } catch {
    notesStatus.textContent = 'Nie udało się przygotować pliku. Spróbuj ponownie lub skopiuj swoje notatki do osobnego pliku.';
  } finally {
    button.disabled = false;
  }
});

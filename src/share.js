// 1. Pulls plant details from the page and cleans the text, returning empty if information is missing.
const el = (id) => document.getElementById(id)?.textContent?.trim() || '';

async function sharePlant(e) {
  // 3. Remembers exactly which button was clicked so the code knows where to display the "Copied!" message later.
  const btn = e.currentTarget;
  const common = el('common-name') || 'Unknown Plant';

  // 2. Takes those pieces and joins them into a clean sentence.
  const text = [
    `${common}${el('latin-name') ? ` (${el('latin-name')})` : ''}`,
    el('confidence') ? `${el('confidence')} confidence` : '',
    el('stat-status'),
    el('stat-edible') ? `Edible: ${el('stat-edible')}` : ''
  ].filter(Boolean).join(' — ');

  // 4. Boxes up your text and the website link to send out.
  const data = { title: `GreenScan: ${common}`, text, url: location.href };

  try {
    // 5. Tries to open the phone's "Share Menu" (like for Texting or Apps).
    if (navigator.share) await navigator.share(data);
    else throw 0;
  } catch (err) {
    // 6. If sharing fails, it saves the text to your clipboard instead.
    if (err.name === 'AbortError') return; // Don't do anything if the user just hit 'Cancel'.
    navigator.clipboard.writeText(text).then(() => {

      // 7. Swaps the button text to "Copied!" for 2 seconds to show it worked.
      const old = btn.innerHTML;
      btn.innerText = 'Copied!';
      setTimeout(() => btn.innerHTML = old, 2000);
    });
  }
}

// 8. Finds the share button on your page and waits for you to click it.
document.getElementById('share-btn')?.addEventListener('click', sharePlant);
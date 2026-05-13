function getShareData() {
  const commonName = document.getElementById('common-name')?.textContent || 'Unknown Plant';
  const latinName = document.getElementById('latin-name')?.textContent || '';
  const score = document.getElementById('confidence')?.textContent || '';
  const status = document.getElementById('stat-status')?.textContent || '';
  const edible = document.getElementById('stat-edible')?.textContent || '';

  const shareText = `${commonName}${latinName ? ` (${latinName})` : ''}${score ? ` — ${score} confidence` : ''}${status ? ` — ${status}` : ''}${edible ? ` — Edible: ${edible}` : ''}`;

  return {
    title: `GreenScan: ${commonName}`,
    text: shareText,
    url: window.location.href
  };
}

async function sharePlant() {
  const shareBtn = document.getElementById('share-btn');
  const shareData = getShareData();

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        fallbackCopyToClipboard(shareBtn, shareData.text);
      }
    }
  } else {
    fallbackCopyToClipboard(shareBtn, shareData.text);
  }
}

async function fallbackCopyToClipboard(btn, text) {
  try {
    await navigator.clipboard.writeText(text);
    showCopyFeedback(btn, 'Copied!');
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback(btn, 'Copied!');
    } catch (e) {
      showCopyFeedback(btn, 'Copy failed');
    }
    document.body.removeChild(textarea);
  }
}

function showCopyFeedback(btn, message) {
  const originalHTML = btn.innerHTML;
  const originalWidth = btn.style.width;
  btn.innerHTML = `<span style="font-size:11px;font-weight:700;">${message}</span>`;
  btn.style.width = 'auto';
  btn.style.minWidth = '48px';
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.style.width = originalWidth;
    btn.style.minWidth = '';
  }, 2000);
}

function initShareButton() {
  const btn = document.getElementById('share-btn');
  if (!btn) return;
  btn.addEventListener('click', sharePlant);
}

if (document.getElementById('share-btn')) {
  initShareButton();
}

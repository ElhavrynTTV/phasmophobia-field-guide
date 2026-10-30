
(() => {
  'use strict';

  const form = document.getElementById('feedbackForm');
  if (!form) return;

  const status = document.getElementById('feedbackStatus');
  const preview = document.getElementById('feedbackPreview');

  function prepareReport() {
    if (!form.reportValidity()) return null;

    const data = new FormData(form);
    const type = String(data.get('type') || '').trim();
    const summary = String(data.get('title') || '').trim();
    const details = String(data.get('details') || '').trim();
    const area = String(data.get('area') || '').trim();
    const device = String(data.get('device') || '').trim();

    const title = `[${type}] ${summary}`;

    const body = [
      'Report type: ' + type,
      'Guide area: ' + (area || 'Not specified'),
      'Device: ' + (device || 'Not specified'),
      '',
      'Details:',
      details,
      '',
      'Submitted by a community tester.'
    ].join('\n');

    return { title, body, text: title + '\n\n' + body };
  }

  document.getElementById('copyFeedback')
    .addEventListener('click', async () => {
      const report = prepareReport();
      if (!report) return;

      try {
        await navigator.clipboard.writeText(report.text);
        status.textContent =
          'Report copied! Paste it into your message to Elhavryn. It has not been sent automatically.';
        preview.hidden = true;
      } catch (error) {
        preview.hidden = false;
        preview.value = report.text;
        preview.focus();
        preview.select();
        status.textContent =
          'Select and copy the report below, then share it with Elhavryn.';
      }
    });

  document.getElementById('openIssue')
    .addEventListener('click', () => {
      const report = prepareReport();
      if (!report) return;

      const url =
        'https://github.com/ElhavrynTTV/phasmophobia-field-guide/issues/new'
        + '?title=' + encodeURIComponent(report.title)
        + '&body=' + encodeURIComponent(report.body);

      status.textContent =
        'GitHub will open. Sign in and submit the issue there to send your report.';

      window.open(url, '_blank', 'noopener,noreferrer');
    });
})();

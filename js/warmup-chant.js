(function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBeat(text) {
    if (!text) return '·';
    return escapeHtml(text).replace(/\[([a-z]+)\]/gi, '<em class="silent">$1</em>');
  }

  function renderTables(data) {
    const cadenceBody = document.getElementById('cadence-body');
    if (cadenceBody) {
      cadenceBody.innerHTML = data.cadence.map(([leader, group]) => `
        <tr>
          <td class="beat-leader">${formatBeat(leader)}</td>
          <td class="beat-group">${formatBeat(group)}</td>
        </tr>
      `).join('');
    }

    const footworkBody = document.getElementById('footwork-body');
    if (footworkBody) {
      footworkBody.innerHTML = data.footwork.map((row) => {
        const cells = row.map((cell, idx) => {
          const isEmpty = !cell;
          const cls = isEmpty
            ? 'is-empty'
            : (idx < 2 ? 'beat-leader' : 'beat-group');
          return `<td class="${cls}">${formatBeat(cell)}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
    }
  }

  fetch('data/warmup-chant.json', { cache: 'no-cache' })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(renderTables)
    .catch((err) => {
      console.error('Failed to load data/warmup-chant.json:', err);
    });
})();

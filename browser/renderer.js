window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('address');
  const loadBtn = document.getElementById('loadBtn');
  const iframe = document.getElementById('contentFrame');

  function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  loadBtn.addEventListener('click', async () => {
    const addr = input.value;
    iframe.srcdoc = '<p>Yükleniyor deligöt...</p>';

    try {
      let raw = await window.kenutsAPI.fetchHTML(addr);

      // decode’le ki HTML gibi işlensin
      const decoded = decodeHTML(raw);

      iframe.srcdoc = decoded;

      console.log("Gelen HTML (decoded):", decoded);
    } catch (e) {
      console.error(e);
      iframe.srcdoc = `<p style="color:red;">HATA: ${e}</p>`;
    }
  });
});

// Renders the latest downloads for each product by reading versions.json
// (recorded by the release workflows) and the public GitHub Releases API.
// No build step, no auth — the repo and its release assets are public.

const REPO = "salesvex-inc/gpunet-releases";
const API = `https://api.github.com/repos/${REPO}/releases`;

// Friendly OS label from an asset filename. Updater manifests and signatures
// are filtered out of the visible list.
const HIDDEN = /(latest\.json|\.sig$)/i;

function osLabel(name) {
  const n = name.toLowerCase();
  if (/\.(dmg|app\.tar\.gz)$|darwin|apple|universal/.test(n)) return "macOS";
  if (/\.(msi|exe)$|windows|pc-windows/.test(n)) return "Windows";
  if (/\.(appimage|deb|rpm)$|linux|unknown-linux/.test(n)) return "Linux";
  return "Download";
}

function assetCard(asset) {
  const a = document.createElement("a");
  a.className = "dl";
  a.href = asset.browser_download_url;
  a.rel = "noopener";
  a.innerHTML = `<span class="os">${osLabel(asset.name)}</span><span class="file">${asset.name}</span>`;
  return a;
}

async function loadReleases() {
  let releases = [];
  try {
    const res = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
    if (res.ok) releases = await res.json();
  } catch {
    /* offline / rate-limited — fall back to versions.json links below */
  }

  const latestFor = (prefix) =>
    releases.find((r) => !r.draft && (r.tag_name || "").startsWith(prefix));

  renderProduct("desktop", latestFor("desktop-v"));
  renderProduct("node", latestFor("node-v"));
}

function renderProduct(key, release) {
  const box = document.querySelector(`[data-downloads="${key}"]`);
  const badge = document.querySelector(`[data-version="${key}"]`);
  if (!box) return;

  if (!release) {
    box.innerHTML = `<p class="empty">No published release yet. Check back soon.</p>`;
    if (badge) badge.textContent = "unreleased";
    return;
  }

  if (badge) badge.textContent = release.tag_name;

  const assets = (release.assets || []).filter((a) => !HIDDEN.test(a.name));
  box.innerHTML = "";
  if (!assets.length) {
    const a = document.createElement("a");
    a.className = "dl";
    a.href = release.html_url;
    a.innerHTML = `<span class="os">View release</span><span class="file">${release.tag_name}</span>`;
    box.appendChild(a);
    return;
  }
  for (const asset of assets) box.appendChild(assetCard(asset));
}

loadReleases();

# GPUNet Releases

Public **release & update distribution hub** for the GPUNet Node products:

| Product | Source | Tagged with | Delivered as |
| --- | --- | --- | --- |
| **GPUNet Node** (desktop app, Tauri v2) | `storiplus-gpu-net/node-gui` | `desktop-vX.Y.Z` | Signed installers + `latest.json` updater manifest |
| **gpunet** (node CLI / daemon, Rust) | `storiplus-gpu-net/node-client` | `node-vX.Y.Z` | Per-platform binaries |

This repository is **public on purpose**: the Tauri auto-updater fetches the
update manifest and signed bundles over unauthenticated HTTPS, so the release
assets must be publicly reachable. The product **source stays private** in
`salesvex-inc/storiplus-gpu-net`; only built, signed artifacts are published here.

## How updates flow

```
 tag desktop-vX.Y.Z  ──►  GitHub Actions (this repo)
                          ├─ checkout private source (storiplus-gpu-net) via GPUNET_SRC_TOKEN
                          ├─ tauri build + minisign sign (TAURI_SIGNING_PRIVATE_KEY)
                          └─ create GitHub Release  ─►  bundles + latest.json
                                                         │
 Desktop app (io.gpunet.node) updater endpoint ─────────┘
   https://github.com/salesvex-inc/gpunet-releases/releases/latest/download/latest.json
```

The desktop app never talks to the private source repo. It polls the **public
release manifest** at the URL above, verifies the minisign signature against the
embedded public key, and self-updates.

## Channels

| Channel | Tag pattern | Manifest |
| --- | --- | --- |
| `stable` | `desktop-vX.Y.Z` | `releases/latest/download/latest.json` |
| `beta` | `desktop-vX.Y.Z-beta.N` | `releases/download/desktop-beta/latest.json` |

## Cutting a release

```bash
# Desktop app — build + sign + publish (checks out private source internally)
gh workflow run release-desktop.yml -R salesvex-inc/gpunet-releases -f version=X.Y.Z
#   or push a tag: git tag desktop-vX.Y.Z && git push origin desktop-vX.Y.Z

# Node CLI binary
gh workflow run release-node.yml -R salesvex-inc/gpunet-releases -f version=X.Y.Z
```

Current published versions are tracked in [`versions.json`](versions.json) and
surfaced on the [releases page](https://salesvex-inc.github.io/gpunet-releases/).

## Required repository secrets

| Secret | Purpose |
| --- | --- |
| `GPUNET_SRC_TOKEN` | PAT (read access to `salesvex-inc/storiplus-gpu-net`) so CI can check out the private source |
| `TAURI_SIGNING_PRIVATE_KEY` | minisign private key string used to sign updater bundles |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | password for the private key (empty if generated without one) |

The matching **public** key lives in [`updater/pubkey.txt`](updater/pubkey.txt)
and is embedded in the app's `tauri.conf.json`.

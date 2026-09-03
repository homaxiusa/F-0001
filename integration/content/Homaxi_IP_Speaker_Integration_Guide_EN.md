# Homaxi IP Speaker — Integration Guide

**Audience:** Monitoring partners · system integrators · authorized backend teams
**Language:** English
**Version:** 1.0 · 2026-09-03
**Companion API reference:** [`Homaxi_IP_Speaker_CGI_API_Reference_EN.md`](Homaxi_IP_Speaker_CGI_API_Reference_EN.md)

---

## 1. Purpose

This short guide explains how to integrate a Homaxi **IP Speaker (IPS)** into a site or monitoring workflow using CGI-JSON over LAN / VPN.

It focuses on the most common integration path:

1. Discover / reach the speaker
2. Authenticate
3. List announcement files
4. Set volume
5. Play an announcement on demand

Advanced options (SIP, MQTT, multicast, schedules) are summarized at the end.

---

## 2. What an IP Speaker can do

| Feature | Typical use |
|---------|-------------|
| **On-demand play** | Monitoring operator / platform plays a stored prompt (“Private area…”) |
| **Volume control** | Adjust announcement loudness |
| **Custom audio upload** | Load site-specific prompts |
| **SIP** | Live talk-down from a PBX / softphone |
| **MQTT** | Remote PA via MQTT broker / broadcast platform |
| **Multicast** | LAN group audio streaming |
| **Scheduled broadcast** | Timed announcements (open/close hours, etc.) |

---

## 3. Prerequisites

| Item | Requirement |
|------|-------------|
| Network | Integrator host can reach speaker IP (LAN, VPN, or authorized bridge) |
| Endpoint | `http://<speaker-ip>/tdkcgi` |
| Auth | HTTP Digest username/password (site-provisioned) |
| Tools | `curl`, Postman, or any HTTP Digest client |
| Safety | Do **not** put Digest passwords in browser / public mobile apps |

Example validated model family: `IPS05H10-EM` (confirm with `get.system.info` on your unit).

---

## 4. Quick start (5 steps)

### Step 1 — Confirm device reachability

Open the speaker web UI:

```text
http://<speaker-ip>/
```

Or query system info via CGI (envelope body):

```json
{
  "envelope": {
    "header": { "security": "httpauth" },
    "body": {
      "command": "get.system.info",
      "content": {}
    }
  }
}
```

Success: HTTP 200 and `error = 0` (or `"0"`).
Record: **model**, **firmware version**, **MAC**.

### Step 2 — List announcement files

```json
{
  "envelope": {
    "header": { "security": "httpauth" },
    "body": {
      "command": "get.whistle.list",
      "content": { "channel": "1" }
    }
  }
}
```

Pick a filename from the response (example):

```text
Crowded please be cautious(man).mp3
```

**Implementation tip:** if only one file exists, `file` may be a single object; if multiple exist, it is usually an array. Handle both.

### Step 3 — Set announcement volume (recommended)

```json
{
  "envelope": {
    "header": { "security": "httpauth" },
    "body": {
      "command": "set.encode.audio",
      "content": {
        "channel": {
          "id": "1",
          "audioformat": {
            "encode": { "currvalue": "g711u" },
            "input": { "value": "line" },
            "volume": { "value": "100" },
            "alarmaudiovolume": { "value": "50" },
            "noisereduce": "true"
          }
        }
      }
    }
  }
}
```

Then re-read with `get.encode.audio` to confirm `alarmaudiovolume`.

> Start around **40–60** for indoor benches. Increase carefully for outdoor sites.

### Step 4 — Play announcement

```json
{
  "envelope": {
    "header": { "security": "httpauth" },
    "body": {
      "command": "set.whistle.list",
      "content": {
        "channel": {
          "id": "1",
          "whistlelist": {
            "ctrl": "0",
            "name": "Crowded please be cautious(man).mp3",
            "readonly": "false"
          }
        }
      }
    }
  }
}
```

Success: `error = "0"`. An on-site listener should hear the prompt.

### Step 5 — curl template

```bash
curl -sS -X POST "http://<speaker-ip>/tdkcgi" \
  -H "Content-Type: application/json" \
  --digest -u "admin:<PASSWORD>" \
  -d @request.json
```

---

## 5. Recommended integration architecture

```text
Monitoring Station / Platform
        |
        |  (authorized API / bridge only)
        v
  Integration Bridge / Backend
        |
        |  Digest + CGI-JSON  (LAN or VPN)
        v
     IP Speaker
```

**Do**

- Keep Digest credentials on the bridge / backend only
- Log command name, HTTP status, and device `error` code
- Retry transient network failures; do not retry play blindly without operator intent

**Do not**

- Call the speaker Digest API directly from a public web UI
- Hard-code factory sample broker IPs (`192.168.5.x`) into production

---

## 6. Body style reminder (important)

| Feature | Body style |
|---------|------------|
| Play / list audio / volume | **envelope** |
| SIP / MQTT / HTTP URL / schedules | **flat** |

Using the wrong style often returns `error = -1`.

---

## 7. Common workflows

### 7.1 Operator talk-down (stored prompt)

1. `get.whistle.list`
2. `set.encode.audio` (optional volume)
3. `set.whistle.list` with `ctrl=0`

Best for: monitoring deterrence announcements.

### 7.2 Live voice (SIP)

1. Configure PBX extension with `s.network.sip`
2. Set `enable=true`
3. Place a SIP call to the speaker extension

Best for: real-time operator conversation.

### 7.3 Remote PA over MQTT

1. Deploy / identify MQTT broker
2. Write speaker MQTT client with `s.network.mqtt` (`serverIP`, `speaker_no`, `group_no`)
3. Set `enable=1`
4. Publish play/broadcast from the PA platform

> CGI MQTT APIs configure the client. End-to-end play also depends on the PA platform’s MQTT topic/payload protocol.

### 7.4 Timed announcements

1. Upload or select an audio file
2. `set.scheduledbroadcast.add` with date range + weekday windows
3. Verify with `get.scheduledbroadcast.all`

---

## 8. Acceptance checklist (site)

| # | Check | Pass criteria |
|---|-------|---------------|
| 1 | Reach web UI / `get.system.info` | HTTP 200, model/FW readable |
| 2 | List audio files | At least one playable file |
| 3 | Play once | Listener hears announcement |
| 4 | Change volume + play | Listener reports clear loudness change |
| 5 | (Optional) SIP | Call connects and audio is heard |
| 6 | (Optional) MQTT | Client connects; platform broadcast plays |

---

## 9. Troubleshooting

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| HTTP 401 | Bad Digest credentials | Verify username/password |
| `error = -1` | Wrong body style or unsupported command | Switch flat ↔ envelope; confirm FW supports IPS APIs |
| Play returns 0 but no sound | Volume too low / wrong file / muted amp | Check `alarmaudiovolume`; re-list files; listen on site |
| MQTT enable on, no play | No broker / wrong topic protocol | Verify broker reachability; confirm PA publish format |
| Schedule single get fails | Empty schedule table | Expected when no records exist |

---

## 10. Field notes from Homaxi validation

Validated on a LAN IPS unit (`IPS05H10-EM`):

- Connectivity + system info: **PASS**
- MQTT/SIP GET: **PASS** (flat body)
- Multicast / HTTP URL / HTTPS cert GET: **PASS**
- Audio encode / whistle list: **PASS**
- On-demand play: **PASS** (heard on site)
- Volume set (`alarmaudiovolume` 5 → 50) + replay: **PASS** (clearly louder)

These results confirm the **play + volume** path is ready for monitoring integration. SIP/MQTT end-to-end audio still requires the customer’s PBX / broker environment.

---

## 11. Related documents

| Document | Description |
|----------|-------------|
| [`Homaxi_IP_Speaker_CGI_API_Reference_EN.md`](Homaxi_IP_Speaker_CGI_API_Reference_EN.md) | Full English API command reference |
| Vendor CGI-JSON Protocol VR006 | Complete manufacturer protocol manual |

---

## 12. Support

For Homaxi project integration questions, contact your Homaxi technical representative with:

- Speaker model + firmware (`get.system.info`)
- MAC / Cloud ID (if provisioned)
- Command name + request/response JSON (passwords redacted)
- Whether the issue is silent GET, play, SIP, or MQTT

---

*Homaxi · IP Speaker Integration Guide · English · v1.0*

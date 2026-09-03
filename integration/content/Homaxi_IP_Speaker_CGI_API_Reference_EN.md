# Homaxi IP Speaker — CGI-JSON API Reference

**Document type:** Customer technical reference
**Protocol family:** Qualvision / Homaxi CGI-JSON (VR006)
**Applies to:** IP Speaker (IPS) devices
**Transport:** HTTP `POST` · Digest authentication · JSON body
**Language:** English
**Version:** 1.0 · 2026-09-03

---

## 1. Overview

This document describes the CGI-JSON APIs used to configure and control Homaxi **IP Speaker (IPS)** devices over the local network (or an authorized bridge / VPN path).

Typical capabilities:

| Capability | Purpose |
|------------|---------|
| SIP | Register to a PBX / SIP server for live voice calls |
| MQTT | Join an MQTT PA / broadcast control plane |
| Multicast | Receive LAN multicast audio streams |
| HTTP URL play | Allow playback triggered via web URL mode |
| Alarm audio (Whistle) | List / play / upload / manage announcement files |
| Volume | Set mic / alarm playback volume |
| Scheduled broadcast | Time-based announcement schedules |
| Priority | Resolve conflicts when multiple broadcast sources overlap |

> **Security note**
> Device Digest credentials must be handled only by authorized backend / monitoring bridges. Do not embed speaker passwords in browser clients or public apps.

---

## 2. Communication basics

### 2.1 Endpoint

| Item | Value |
|------|-------|
| URL | `http://<device-ip>/tdkcgi` |
| Method | `POST` |
| Auth | HTTP **Digest** |
| Content-Type | `application/json` |
| Default HTTP port | `80` |

Example:

```text
POST http://192.168.1.50/tdkcgi
```

### 2.2 Two request body styles

IPS firmware uses **two JSON styles**. Use the style shown for each command.

**A) Flat body** (used by SIP / MQTT / HTTP URL / scheduled broadcast):

```json
{
  "header": { "security": "httpauth" },
  "body": {
    "command": "g.network.mqtt",
    "content": {}
  }
}
```

**B) Envelope body** (used by multicast / HTTPS cert / audio encode / whistle):

```json
{
  "envelope": {
    "header": { "security": "httpauth" },
    "body": {
      "command": "get.encode.audio",
      "content": { "channel": "1" }
    }
  }
}
```

### 2.3 Success / failure

| Style | Success indicator |
|-------|-------------------|
| Flat | `"error": 0` |
| Envelope | `"envelope": { "body": { "error": "0" } }` |

Non-zero / `"-1"` means the command failed or is not supported in that body style.

### 2.4 curl example

```bash
curl -sS -X POST "http://<device-ip>/tdkcgi" \
  -H "Content-Type: application/json" \
  --digest -u "admin:<PASSWORD>" \
  -d @request.json
```

---

## 3. API groups (quick index)

| # | Group | Commands |
|---|-------|----------|
| 1 | Network SIP | `g.network.sip` · `s.network.sip` |
| 2 | Network MQTT | `g.network.mqtt` · `s.network.mqtt` |
| 3 | Network Multicast (IPS) | `get.network.multicast` · `set.network.multicast` |
| 4 | Network HTTP URL | `g.network.httpurl` · `s.network.httpurl` |
| 5 | HTTPS certificate | `get/set.network.https.certificate.status` |
| 6 | Audio encode & volume | `get.encode.audio` · `set.encode.audio` · `g.audio.samplerate` |
| 7 | Alarm audio (Whistle) | `get.whistle.list` · `get.whistle.ctrlstate` · `set.whistle.list` |
| 8 | Scheduled broadcast | `get/set.scheduledbroadcast.*` · `get/set.broadcast.priority` |
| 9 | Siren / warning light | Alarm-linkage fields (not standalone play APIs) |

---

## 4. Network SIP

**Body style:** flat
**Purpose:** Configure SIP registration for live two-way / one-way voice.

### 4.1 Get — `g.network.sip`

```json
{
  "header": { "security": "httpauth" },
  "body": {
    "command": "g.network.sip",
    "content": {}
  }
}
```

Example response (newer firmware may return multiple accounts):

```json
{
  "error": 0,
  "network": {
    "sip": {
      "enable": 0,
      "selected_index": 0,
      "user_agent": [
        {
          "index": 0,
          "DisplayName": "",
          "ServerSipAddress": "192.168.5.139",
          "ServerSipPort": 5060,
          "SipUserName": "",
          "SipPassword": "",
          "TransProtocol": 0
        }
      ]
    }
  },
  "ver": 1
}
```

### 4.2 Set — `s.network.sip`

```json
{
  "header": { "security": "httpauth" },
  "body": {
    "command": "s.network.sip",
    "content": {
      "sip": {
        "enable": true,
        "ServerSipAddress": "192.168.1.10",
        "ServerSipPort": 5060,
        "TransProtocol": 0,
        "SipUserName": "6001",
        "SipPassword": "<sip-password>",
        "DisplayName": "6001"
      }
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `enable` | Enable / disable SIP registration |
| `ServerSipAddress` | SIP server IP or hostname |
| `ServerSipPort` | SIP port (default `5060`) |
| `TransProtocol` | Transport (commonly `0` = UDP) |
| `SipUserName` / `SipPassword` | SIP credentials |
| `DisplayName` | Caller ID display name |

---

## 5. Network MQTT

**Body style:** flat
**Purpose:** Configure the speaker as an MQTT client for remote PA / MQTT broadcast control.

> Writing MQTT settings only configures the client. Actual audio playback also requires a reachable MQTT broker and a valid broadcast publish from the PA platform.

### 5.1 Get — `g.network.mqtt`

```json
{
  "header": { "security": "httpauth" },
  "body": {
    "command": "g.network.mqtt",
    "content": {}
  }
}
```

Example response:

```json
{
  "error": 0,
  "network": {
    "mqtt": {
      "enable": 0,
      "name": "IP Speaker",
      "serverIP": "192.168.5.139",
      "serverPort": 1883,
      "speaker_no": 100
    }
  },
  "ver": 1
}
```

### 5.2 Set — `s.network.mqtt`

```json
{
  "header": { "security": "httpauth" },
  "body": {
    "command": "s.network.mqtt",
    "content": {
      "mqtt": {
        "enable": 1,
        "serverIP": "192.168.1.20",
        "serverPort": 1883,
        "speaker_no": 100,
        "name": "IP Speaker",
        "interrupt": 1,
        "group_no": 700
      }
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `enable` | `0` = off, `1` = connect to broker |
| `serverIP` / `serverPort` | MQTT broker address |
| `speaker_no` | Speaker ID used by the PA system |
| `name` | Display name |
| `group_no` | Group ID for group broadcasts |
| `interrupt` | Allow new MQTT broadcast to interrupt current playback |
| `group_range` | Often returned on GET (allowed group range) |

---

## 6. Network Multicast (IPS)

**Body style:** envelope
**Purpose:** Configure up to 10 multicast receive slots (`id` 0–9).

### 6.1 Get — `get.network.multicast`

```json
{
  "envelope": {
    "header": { "security": "httpauth" },
    "body": {
      "command": "get.network.multicast",
      "content": ""
    }
  }
}
```

### 6.2 Set — `set.network.multicast`

```json
{
  "envelope": {
    "header": { "security": "httpauth" },
    "body": {
      "command": "set.network.multicast",
      "content": {
        "network": {
          "multicast": [
            { "id": 0, "ipaddr": "239.255.0.1:5004" },
            { "id": 1, "ipaddr": "" }
          ]
        }
      }
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `id` | Slot index (0–9) |
| `ipaddr` | Multicast `ip:port`, or empty / null to clear |

---

## 7. Network HTTP URL

**Body style:** flat
**Purpose:** Enable/disable HTTP URL playback mode (play audio by accessing a device web URL path).

### 7.1 Get — `g.network.httpurl`

```json
{
  "header": { "security": "httpauth" },
  "body": {
    "command": "g.network.httpurl",
    "content": {}
  }
}
```

### 7.2 Set — `s.network.httpurl`

```json
{
  "header": { "security": "httpauth" },
  "body": {
    "command": "s.network.httpurl",
    "content": { "enable": 1 }
  }
}
```

---

## 8. HTTPS certificate status

**Body style:** envelope
**Purpose:** Query / set HTTPS certificate status on IPS.

Commands:

- `get.network.https.certificate.status`
- `set.network.https.certificate.status`

Key fields: `certificate`, `certificaterequest`, `enable`.

---

## 9. Audio encode and volume

**Body style:** envelope
**Purpose:** Read/set codec, input source, mic volume, and alarm audio volume.

### 9.1 Get — `get.encode.audio`

```json
{
  "envelope": {
    "header": { "security": "httpauth" },
    "body": {
      "command": "get.encode.audio",
      "content": { "channel": "1" }
    }
  }
}
```

### 9.2 Set — `set.encode.audio`

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

| Field | Description |
|-------|-------------|
| `encode` | Codec (`g711` / `g711u` / `g722` depending on FW) |
| `input` | `line` or `mic` |
| `volume` | Input / mic volume (`0`–`100`) |
| `alarmaudiovolume` | Alarm / announcement playback volume (`0`–`100`) |
| `newoutvolume` | Voice output volume on some FW builds (may be absent) |
| `noisereduce` | Noise reduction on/off |

### 9.3 Sample rate — `g.audio.samplerate`

Typical response: `rate = 8000`.

---

## 10. Alarm audio (Whistle)

**Body style:** envelope
**Purpose:** Manage and play on-device announcement files.

### 10.1 List files — `get.whistle.list`

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

Notes:

- When only one file exists, `file` may be returned as an **object** (not an array).
- When multiple files exist, `file` is typically an **array**.
- Integrators should support both shapes.

Useful response fields: `filenum`, `filemax`, `freespace`, `uploadmax`, `supportselect`.

### 10.2 Recording state — `get.whistle.ctrlstate`

Returns recording control state (`ctrlstate`, e.g. `"-1"` = idle).

### 10.3 Control files — `set.whistle.list`

All file operations use one command with different `ctrl` values:

| `ctrl` | Operation | Required fields |
|--------|-----------|-----------------|
| `"0"` | **Play** | `name` |
| `"1"` | Download | `name` |
| `"2"` | Rename | `name`, `namenew` |
| `"3"` | Delete | `name` |
| `"4"` | Record from mic | `name`, `start` |
| `"5"` | Upload | `name`, `whistle` (binary), optional `transcode` |
| `"7"` | Set as active alarm audio | `name` |

#### Play example

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

#### Upload example

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
            "ctrl": "5",
            "name": "custom_alert.mp3",
            "whistle": "<binary-audio-data>",
            "transcode": "true"
          }
        }
      }
    }
  }
}
```

Upload size limit is reported by `uploadmax` on the device (varies by firmware).

---

## 11. Scheduled broadcast

**Body style:** flat
**Purpose:** Create time-based announcement schedules and manage broadcast priority.

### 11.1 Commands

| Command | Action |
|---------|--------|
| `get.scheduledbroadcast.all` | List all schedules |
| `get.scheduledbroadcast.single` | Get one schedule by `id` |
| `set.scheduledbroadcast.add` | Add schedule |
| `set.scheduledbroadcast.update` | Update schedule |
| `set.scheduledbroadcast.delete` | Delete by `id` |
| `set.scheduledbroadcast.save` | Batch enable/save |
| `get.broadcast.priority` | Read priority table |
| `set.broadcast.priority` | Write priority table |

### 11.2 Priority sources (typical)

Higher number = higher priority. Exact keys may vary by firmware.

| Key | Name |
|-----|------|
| `onvif` | ONVIF |
| `mqtt` or `multicast` | MQTT / Multicast broadcast |
| `sip` | SIP broadcast |
| `schedule` | Scheduled broadcast |
| `alarmin` | Alarm-triggered broadcast |
| `manual` | Manual broadcast |

### 11.3 Schedule fields

| Field | Description |
|-------|-------------|
| `broadcast_name` | Display name |
| `audio_name` | On-device audio filename |
| `enable` | `"true"` / `"false"` |
| `start_date` / `end_date` | Active date range (`YYYY-MM-DD`) |
| `volume` | Playback volume `0`–`100` |
| `priority` | Schedule priority |
| `cycle.mode` / `times` / `duration` | Repeat behavior |
| `schedule.<weekday>.time1–6` | Time windows with `enabled`, `start`, `end` |

If no schedules exist, `get.scheduledbroadcast.all` may return `record: null`, and `get.scheduledbroadcast.single` may return `error: -1`.

---

## 12. Siren and warning light (alarm linkage)

These are usually **fields inside event/alarm linkage** payloads (motion, line crossing, etc.), not standalone “play now” APIs.

| Field | Description |
|-------|-------------|
| `warninglight` | Enable warning light on alarm |
| `warninglightdelay` | Light duration (seconds) |
| `flickerfreq` | Flicker frequency |
| `whistle` | Enable siren / alarm audio |
| `whistleselect` | Selected audio index |
| `whistlecount` | Play count |
| `whistlelist` | Available audio list (string) |

For immediate announcement playback during integration, prefer **`set.whistle.list` with `ctrl=0`**.

---

## 13. Built-in announcement examples

Many IPS units ship with English prompt files such as:

- `Crowded please be cautious(man).mp3` / `(woman).mp3`
- `Danger zone please keep away(man).mp3` / `(woman).mp3`
- `Private area Do not enter(man).mp3` / `(woman).mp3`
- `Welcome(man).mp3` / `(woman).mp3`
- `alarm.wav`

Exact inventory depends on model and site provisioning. Always query `get.whistle.list` at runtime.

---

## 14. Command cheat sheet

| Command | Direction | Body style |
|---------|-----------|------------|
| `g.network.sip` | GET | flat |
| `s.network.sip` | SET | flat |
| `g.network.mqtt` | GET | flat |
| `s.network.mqtt` | SET | flat |
| `get.network.multicast` | GET | envelope |
| `set.network.multicast` | SET | envelope |
| `g.network.httpurl` | GET | flat |
| `s.network.httpurl` | SET | flat |
| `get.network.https.certificate.status` | GET | envelope |
| `set.network.https.certificate.status` | SET | envelope |
| `get.encode.audio` | GET | envelope |
| `set.encode.audio` | SET | envelope |
| `g.audio.samplerate` | GET | envelope |
| `get.whistle.list` | GET | envelope |
| `get.whistle.ctrlstate` | GET | envelope |
| `set.whistle.list` | SET | envelope |
| `get.scheduledbroadcast.all` | GET | flat |
| `get.scheduledbroadcast.single` | GET | flat |
| `set.scheduledbroadcast.add/update/delete/save` | SET | flat |
| `get.broadcast.priority` | GET | flat |
| `set.broadcast.priority` | SET | flat |

---

## 15. Related documents

- **Integration Guide (English):** `Homaxi_IP_Speaker_Integration_Guide_EN.md`
- Source protocol: Qualvision CGI-JSON Protocol VR006 (vendor manual)

---

*Homaxi · IP Speaker CGI-JSON API Reference · English · v1.0*

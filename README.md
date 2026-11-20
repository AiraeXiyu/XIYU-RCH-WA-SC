# XIYU REACH CHANNEL WA

Library JavaScript sederhana untuk mengirim request reaksi WhatsApp Channel melalui provider API.

Project ini hanya berisi dua file:

```text
.
├── README.md
└── xiyurchwa.js
```

Tidak ada website, desain, frontend, framework, atau file konfigurasi tambahan.

## Requirements

- Node.js 20 atau lebih baru
- Provider API dapat diakses dari server/perangkat yang menjalankan script

## Instalasi

Download `xiyurchwa.js`, lalu letakkan di project Node.js yang menggunakan ES Modules.

Jika project belum menggunakan ES Modules, tambahkan `"type": "module"` pada `package.json` milik project pengguna. File tersebut tidak disertakan karena repository ini memang hanya menyediakan dua file.

## Penggunaan dasar

```js
import { sendReaction } from "./xiyurchwa.js";

const result = await sendReaction({
  link: "https://whatsapp.com/channel/CHANNEL_ID/POST_ID",
  emoji: "🔥😎❤️"
});

console.log(result);
```

`sendReaction()` mengembalikan JSON asli dari provider.

## Menggunakan konfigurasi sendiri

```js
import { createClient } from "./xiyurchwa.js";

const xiyu = createClient({
  endpoint: "https://api-cloud.my.id/tools/rchv2",
  timeout: 25000,
  maxEmojis: 15,
  userAgent: "MY-APP/1.0"
});

const result = await xiyu.sendReaction({
  link: "https://whatsapp.com/channel/CHANNEL_ID/POST_ID",
  emoji: "🔥😎❤️"
});

console.log(result);
```

## Konfigurasi default

| Property | Default | Keterangan |
|---|---|---|
| `endpoint` | `https://api-cloud.my.id/tools/rchv2` | Endpoint provider |
| `method` | `GET` | HTTP method provider |
| `timeout` | `25000` | Batas waktu request dalam milidetik |
| `maxEmojis` | `15` | Maksimal emoji unik |
| `userAgent` | `XIYU-REACH-CHANNEL-WA/1.0` | User-Agent request |

## Export yang tersedia

```js
import xiyurchwa, {
  config,
  createClient,
  sendReaction,
  validateWhatsAppLink,
  parseEmojis,
  XiyuReachChannelError
} from "./xiyurchwa.js";
```

- `sendReaction({ link, emoji })` — validasi input dan kirim satu request ke provider.
- `createClient(config)` — buat client dengan konfigurasi sendiri.
- `validateWhatsAppLink(link)` — validasi URL WhatsApp.
- `parseEmojis(value, max)` — ambil emoji unik dan periksa batas jumlah.
- `config` — konfigurasi default yang tidak dapat diubah.
- `XiyuReachChannelError` — tipe error dari library.
- `xiyurchwa` — default export berisi fungsi dan konfigurasi.

## Validasi dan perilaku

- Link harus menggunakan HTTPS.
- Host yang diterima: `whatsapp.com`, `www.whatsapp.com`, dan `chat.whatsapp.com`.
- Input emoji wajib berisi minimal satu emoji.
- Emoji duplikat dihapus.
- Maksimal 15 emoji unik secara default.
- Satu pemanggilan `sendReaction()` menghasilkan satu request provider.
- Tidak ada retry otomatis, batching, atau request latar belakang.
- Response JSON dikembalikan sesuai data provider; field yang tidak disediakan provider tidak dibuat-buat.

## Contoh penanganan error

```js
import {
  sendReaction,
  XiyuReachChannelError
} from "./xiyurchwa.js";

try {
  const result = await sendReaction({
    link: "https://whatsapp.com/channel/CHANNEL_ID/POST_ID",
    emoji: "🔥❤️"
  });

  console.log("Provider response:", result);
} catch (error) {
  if (error instanceof XiyuReachChannelError) {
    console.error("Request error:", error.message);
    console.error("Details:", error.details);
  } else {
    console.error(error);
  }
}
```

## Provider API

```text
GET https://api-cloud.my.id/tools/rchv2
```

Query parameters:

- `link` — WhatsApp Channel post URL
- `emoji` — gabungan emoji yang dipilih

Gunakan API sesuai ketentuan provider dan tanggung jawab masing-masing pengguna.

## Copyright

**Copyright © 2026 XIYU CODEX. All rights reserved.**

Original source code and documentation are credited to **XIYU CODEX**. Do not remove, alter, or misrepresent the original developer credit.

WhatsApp and the external API provider are independent third-party services. Their names and services remain the property of their respective owners.

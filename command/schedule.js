const cron = require("node-cron");
const { getSocket } = require("../socket");

const targets = [
  "6282178703609@s.whatsapp.net",
  "6285658334000@s.whatsapp.net",
];

const jadwalPesan = [
  {
    cron: "0 5 * * *", // jam 05:00 pagi
    pesan: "Selamat pagi! Semoga harimu menyenangkan.",
  },
  {
    cron: "5 12 * * *", // jam 12:05 siang
    pesan: "Jangan lupa makan siang ya!",
  },
  {
    cron: "20 15 * * *", // jam 15:20
    pesan: "Istirahat sejenak, sore sudah tiba.",
  },
  {
    cron: "5 18 * * *", // jam 18:05
    pesan: "Maghrib time, jangan lupa ibadah ya.",
  },
  {
    cron: "20 19 * * *", // jam 19:20
    pesan: "Waktunya santai malam. Semangat selalu!",
  },
  {
    cron: "0 16 * * *", // jam 19:20
    pesan: "Tes jam 4!",
  },
];

async function kirimPesanSemua(pesan) {
  const sock = getSocket();

  if (!sock || !sock.user) {
    console.log("❌ WhatsApp belum terkoneksi.");
    return;
  }

  for (let i = 0; i < targetNumbers.length; i++) {
    const jid = targetNumbers[i];

    try {
      await sock.sendMessage(jid, { text: pesan });
      console.log(`✅ Pesan dikirim ke ${jid}: "${pesan}"`);
    } catch (err) {
      console.error(`❌ Gagal kirim ke ${jid}:`, err.message);
    }

    // Jeda 1 menit jika bukan yang terakhir
    if (i < targetNumbers.length - 1) {
      console.log("⏱️ Tunggu 1 menit sebelum kirim ke berikutnya...");
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }
}

// Daftarkan semua jadwal
jadwalPesan.forEach(({ cron: waktu, pesan }) => {
  cron.schedule(
    waktu,
    () => {
      console.log(`📅 Kirim pesan terjadwal: "${pesan}"`);
      kirimPesanSemua(pesan);
    },
    { timezone: "Asia/Jakarta" }
  );
});

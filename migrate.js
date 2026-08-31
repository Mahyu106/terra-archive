const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'terra_archive'
});

// Data lore lengkap (18 negara/organisasi + Rhodes Island)
const DATA = [
  { id: "rhodes-island", name: "Rhodes Island", cat: "Organization", region: "Organisasi Bergerak — Tanpa Wilayah Tetap", x: null, y: null, lore: [
    "Secara resmi, Rhodes Island adalah perusahaan farmasi bergerak yang mengembangkan pengobatan untuk Oripathy, penyakit yang menyebar lewat mineral Originium.",
    "Di balik itu, organisasi ini juga menampung dan mempekerjakan para Infected yang dikucilkan masyarakat, menjadikan mereka Operator yang bertugas di berbagai wilayah Terra.",
    "Dipimpin oleh sosok misterius yang dikenal sebagai Doctor, dengan Amiya sebagai pemimpin lapangan, Rhodes Island menyimpan ambisi jangka panjang yang jauh melampaui sekadar riset medis."
  ]},
  { id: "sami", name: "Sami", cat: "Nation", region: "Wilayah Kutub Utara — Suku Pengembara", x: 36.3, y: 15.5, lore: [
    "Sami adalah kawasan kutub yang dihuni suku-suku pengembara, hidup berdampingan dengan rusa kutub dan alam yang keras sepanjang tahun.",
    "Karena letaknya yang amat terpencil, budaya dan bahasa asli Sami relatif terjaga dari campur tangan kekuatan besar Terra.",
    "Hubungan dagang dengan Ursus di selatan tetap terjalin, meski sering diwarnai kecurigaan akibat sejarah panjang eksploitasi sumber daya."
  ]},
  { id: "higashi", name: "Higashi", cat: "Nation", region: "Kepulauan Timur — Budaya Feodal", x: 72.5, y: 20.4, lore: [
    "Higashi adalah negara kepulauan dengan budaya yang berakar pada tradisi feodal, kehormatan prajurit, dan ritual kuno.",
    "Meski modernisasi perlahan masuk, banyak klan tua tetap mempertahankan cara hidup lama di tengah perubahan zaman.",
    "Letaknya yang terpencil membuat Higashi relatif terisolasi dari gejolak besar di daratan utama Terra."
  ]},
  { id: "ursus", name: "Ursus", cat: "Nation", region: "Kekaisaran Utara — Dataran Beku", x: 60.4, y: 22.8, lore: [
    "Ursus adalah kekaisaran luas di utara Terra, kaya akan sumber daya mineral namun diselimuti sejarah panjang penindasan terhadap kaum Infected dan minoritas non-manusia.",
    "Iklimnya keras dan tanahnya subur akan Originium, menjadikan Ursus salah satu kekuatan militer terbesar di benua ini.",
    "Ketegangan internal antara pemerintah kekaisaran dan gerakan reformasi terus membentuk arah politik negara ini."
  ]},
  { id: "yan", name: "Yan", cat: "Nation", region: "Kekaisaran Timur — Dinasti Kuno", x: 75.6, y: 34.8, lore: [
    "Yan adalah kekaisaran besar dengan sejarah dinasti yang sangat panjang, menjunjung tinggi tradisi, hierarki, dan seni bela diri kuno.",
    "Di balik keagungan istananya, faksi bawah tanah seperti kelompok Lung diam-diam mempengaruhi arah kebijakan kekaisaran.",
    "Yan dikenal sebagai pusat kebudayaan sekaligus medan intrik politik yang penuh lapisan tersembunyi."
  ]},
  { id: "kazimierz", name: "Kazimierz", cat: "Nation", region: "Negara Kota — Republik Sepak Bola", x: 42.0, y: 29.7, lore: [
    "Kazimierz adalah negara kota merdeka yang kehidupan sosial dan ekonominya berputar di sekitar olahraga sepak bola profesional.",
    "Klub-klub sepak bola di Kazimierz punya pengaruh politik yang nyata, hampir menyerupai partai atau faksi dalam sistem pemerintahan biasa.",
    "Persaingan antar klub sering kali mencerminkan persaingan kekuasaan yang sesungguhnya di balik gemerlap pertandingan."
  ]},
  { id: "kazdel", name: "Kazdel", cat: "Nation", region: "Tanah Leluhur Sarkaz — Wilayah Tercerai-berai", x: 64.6, y: 39.0, lore: [
    "Kazdel adalah tanah air historis bangsa Sarkaz, kini terpecah menjadi berbagai faksi setelah runtuhnya kekuasaan terpusat.",
    "Perang saudara berkepanjangan membuat wilayah ini dipenuhi kelompok bersenjata yang saling memperebutkan pengaruh dan sumber daya.",
    "Banyak Sarkaz meninggalkan Kazdel untuk mengadu nasib di negara lain, membawa serta luka sejarah bangsa mereka."
  ]},
  { id: "bolivar", name: "Bolivar", cat: "Nation", region: "Republik Barat — Rimba & Politik Bergejolak", x: 21.9, y: 37.6, lore: [
    "Bolivar adalah republik yang sebagian besar wilayahnya tertutup hutan lebat, dengan sejarah panjang kudeta dan pergantian kekuasaan.",
    "Kekayaan alamnya yang melimpah kerap menjadi sumber konflik antara pemerintah pusat, milisi lokal, dan kepentingan asing.",
    "Masyarakat adat Bolivar mempertahankan cara hidup tradisional di tengah tekanan modernisasi yang terus meluas."
  ]},
  { id: "columbia", name: "Columbia", cat: "Nation", region: "Federasi Barat — Negara Kota Kapitalis", x: 28.7, y: 37.6, lore: [
    "Columbia adalah federasi negara-kota yang dikuasai korporasi raksasa, di mana kekuatan ekonomi sering kali menggantikan otoritas pemerintah.",
    "Persaingan antar perusahaan besar membentuk lanskap politik yang penuh intrik, sabotase, dan perang dagang tersembunyi.",
    "Ambisi teknologi dan hasrat akan kekuasaan menjadikan Columbia salah satu wilayah paling tidak stabil secara sosial di Terra."
  ]},
  { id: "kjerag", name: "Kjerag", cat: "Nation", region: "Dataran Tinggi Pegunungan — Wilayah Terpencil", x: 38.5, y: 41.0, lore: [
    "Kjerag adalah wilayah pegunungan terjal yang dihuni komunitas kecil dengan tradisi berburu makhluk buas yang diwariskan turun-temurun.",
    "Isolasi geografisnya menjadikan Kjerag salah satu daerah yang paling sedikit tersentuh oleh politik besar Terra.",
    "Penduduknya dikenal tangguh, hidup berdampingan dengan alam liar yang keras di ketinggian."
  ]},
  { id: "leithanien", name: "Leithanien", cat: "Nation", region: "Persemakmuran Tengah — Aliansi Kerajaan Kecil", x: 50.4, y: 42.1, lore: [
    "Leithanien adalah persemakmuran yang terbentuk dari aliansi longgar beberapa kerajaan kecil, masing-masing tetap mempertahankan otonominya.",
    "Sistem pemerintahannya yang terdesentralisasi membuat pengambilan keputusan besar sering berjalan lambat namun penuh kompromi.",
    "Warisan budaya ksatria lamanya masih terasa dalam upacara-upacara kenegaraan hingga kini."
  ]},
  { id: "siracusa", name: "Siracusa", cat: "Nation", region: "Republik Kepulauan — Jaringan Dagang & Diplomasi", x: 58.6, y: 51.0, lore: [
    "Siracusa adalah republik kepulauan yang makmur berkat jaringan perdagangan dan diplomasinya yang luas ke seluruh Terra.",
    "Kota-kotanya menjadi tempat pertemuan berbagai bangsa, sekaligus sarang informasi dan aktivitas mata-mata dari banyak negara.",
    "Kekayaan Siracusa dibangun di atas kemampuannya menjaga netralitas sambil diam-diam bermain di banyak sisi."
  ]},
  { id: "victoria", name: "Victoria", cat: "Nation", region: "Kerajaan Barat Laut — Kota Berkabut", x: 44.1, y: 52.1, lore: [
    "Victoria adalah kerajaan bergaya gotik-industrial yang diselimuti kabut abadi, dengan kalangan aristokrat yang memegang kekuasaan turun-temurun.",
    "Di balik kemewahan kota-kotanya, kesenjangan kelas antara bangsawan dan kaum Infected menciptakan konflik sosial yang mendalam.",
    "Rumor tentang makhluk malam dan darah kuno sering beredar di kalangan rakyat jelata Victoria."
  ]},
  { id: "minos", name: "Minos", cat: "Nation", region: "Republik Kepulauan Selatan — Kekuasaan Dagang", x: 33.4, y: 58.3, lore: [
    "Minos adalah republik kepulauan yang perekonomiannya dikuasai oleh serikat dagang besar dengan pengaruh lintas negara.",
    "Armada niaganya yang luas menjadikan Minos simpul penting jalur pelayaran di selatan Terra.",
    "Persaingan antar keluarga pedagang besar sering menentukan arah kebijakan negara lebih dari pemerintahan resmi."
  ]},
  { id: "siesta", name: "Siesta", cat: "Nation", region: "Semenanjung Selatan — Federasi Santai nan Waspada", x: 39.5, y: 58.7, lore: [
    "Siesta dikenal dengan gaya hidup penduduknya yang santai, namun menyimpan sistem pertahanan yang jauh lebih waspada dari kesan luarnya.",
    "Letak geografisnya yang strategis membuat Siesta kerap menjadi titik netral untuk perundingan antarnegara.",
    "Di balik suasana tenangnya, negara ini tetap menjaga kekuatan militer yang disiplin sebagai jaminan kedaulatan."
  ]},
  { id: "laterano", name: "Laterano", cat: "Nation", region: "Negara Suci — Kekuasaan Gerejawi", x: 52.5, y: 58.3, lore: [
    "Laterano adalah negara teokratis yang diperintah oleh otoritas keagamaan, dengan pengaruh spiritual yang meluas ke berbagai penjuru Terra.",
    "Ajaran dan doktrin gereja menjadi landasan hukum sekaligus identitas budaya masyarakatnya.",
    "Di balik kesuciannya, perebutan kekuasaan di dalam struktur gereja berjalan senyap namun sengit."
  ]},
  { id: "rim-billiton", name: "Rim Billiton", cat: "Organization", region: "Konglomerat Pertambangan Lintas Negara", x: 62.3, y: 58.3, lore: [
    "Rim Billiton bukan sebuah negara, melainkan konglomerat pertambangan raksasa yang beroperasi lintas batas dengan pengaruh ekonomi sangat besar.",
    "Kepentingan bisnisnya berpusat pada eksploitasi Originium, menjadikannya salah satu entitas paling berpengaruh dalam ekonomi Terra.",
    "Kekuatan finansialnya kerap membuat batas antara korporasi dan kekuasaan politik di beberapa wilayah menjadi kabur."
  ]},
  { id: "sargon", name: "Sargon", cat: "Nation", region: "Dataran Gurun — Kawasan Kaya Originium Oil", x: 27.9, y: 71.1, lore: [
    "Sargon adalah negara gurun yang kekuatan ekonominya bertumpu pada cadangan Originium Oil, sumber daya strategis yang diperebutkan banyak pihak.",
    "Struktur kekuasaannya rumit, melibatkan keluarga-keluarga berpengaruh yang saling berebut kendali atas ladang minyak Originium.",
    "Panas gurun yang ekstrem membentuk budaya masyarakat yang keras namun sangat menjunjung tinggi kehormatan dan tradisi."
  ]},
  { id: "iberia", name: "Iberia", cat: "Nation", region: "Semenanjung Selatan — Zona Konflik", x: 51.9, y: 74.2, lore: [
    "Iberia tengah dilanda perang saudara berkepanjangan antara pemerintah pusat dan gerakan Reunion, kelompok yang memperjuangkan hak-hak kaum Infected.",
    "Wilayah ini menjadi simbol konflik antara ketakutan masyarakat terhadap Oripathy dan tuntutan keadilan bagi para penderitanya.",
    "Kehancuran infrastruktur akibat perang membuat kehidupan warga sipil Iberia sangat rentan."
  ]}
];

async function migrate() {
  console.log('Mulai migrasi...');

  for (const item of DATA) {
    await pool.query(
      'INSERT INTO entities (id, name, category, region, pos_x, pos_y) VALUES (?, ?, ?, ?, ?, ?)',
      [item.id, item.name, item.cat, item.region, item.x, item.y]
    );

    for (let i = 0; i < item.lore.length; i++) {
      await pool.query(
        'INSERT INTO lore_paragraphs (entity_id, paragraph_order, content) VALUES (?, ?, ?)',
        [item.id, i, item.lore[i]]
      );
    }
    console.log(`✔ ${item.name} berhasil dimasukkan`);
  }

  console.log('Migrasi selesai!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migrasi gagal:', err);
  process.exit(1);
});
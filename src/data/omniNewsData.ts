export type NewsRegion = 'Nasional (Indonesia)' | 'Internasional (Global)';
export type NewsCategory = 'Politik' | 'Ekonomi' | 'Teknologi';

export interface TVChannel {
  id: string;
  name: string;
  shortName: string;
  region: NewsRegion;
  countryCode: string;
  streamUrl: string;
  fallbackStreamUrl?: string;
  category: string;
  language: string;
  network: string;
  currentProgram: string;
  description: string;
  badgeColor: string;
  thumbnailUrl: string;
}

export interface ArticleStat {
  label: string;
  value: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  full_content: string[];
  quote: {
    text: string;
    speaker: string;
    role: string;
  };
  key_stats: [ArticleStat, ArticleStat, ArticleStat];
  ai_takeaways: [string, string, string];
  author: string;
  location: string;
  source_name: string;
  source_url: string;
  image_url: string;
  image_caption: string;
  published_at: string;
  relative_time: string;
  region: NewsRegion;
  category: NewsCategory;
  read_time: string;
  is_lead?: boolean;
}

export interface MarketIndicator {
  symbol: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export const MARKET_INDICATORS: MarketIndicator[] = [
  { symbol: 'IHSG (BEI)', value: '7.482,15', change: '+0,84%', isPositive: true },
  { symbol: 'USD / IDR', value: 'Rp15.640', change: '-0,25%', isPositive: true },
  { symbol: 'BI-Rate', value: '5,50%', change: 'Tetap', isPositive: true },
  { symbol: 'Emas Antam', value: 'Rp1.512.000/gr', change: '+0,62%', isPositive: true },
  { symbol: 'Minyak Mentah Brent', value: 'US$76,40/bbl', change: '-1,10%', isPositive: false },
];

export const TV_CHANNELS: TVChannel[] = [
  // ================= SALURAN NASIONAL (INDONESIA) =================
  {
    id: 'ch_cnn_indonesia',
    name: 'CNN Indonesia Live',
    shortName: 'CNN ID',
    region: 'Nasional (Indonesia)',
    countryCode: 'ID',
    streamUrl: 'https://video.detik.com/livecnn/smil:cnntv/playlist.m3u8',
    fallbackStreamUrl: 'https://edge.medcom.id/live-edge/smil:metro.smil/playlist.m3u8',
    category: 'Berita Nasional & Dunia',
    language: 'Bahasa Indonesia',
    network: 'Trans Media · Detik Network',
    currentProgram: 'CNN Indonesia Newsroom & Breaking News',
    description:
      'Siaran langsung berita terkini nasional, politik, ekonomi, dan perkembangan internasional dalam Bahasa Indonesia.',
    badgeColor: '#dc2626',
    thumbnailUrl: '/images/news/kabinet_kemendagri.jpg',
  },
  {
    id: 'ch_metro_tv',
    name: 'Metro TV Live',
    shortName: 'Metro TV',
    region: 'Nasional (Indonesia)',
    countryCode: 'ID',
    streamUrl: 'https://edge.medcom.id/live-edge/smil:metro.smil/playlist.m3u8',
    fallbackStreamUrl: 'https://video.detik.com/livecnn/smil:cnntv/playlist.m3u8',
    category: 'Berita & Dialog Publik',
    language: 'Bahasa Indonesia',
    network: 'Media Group News',
    currentProgram: 'Headline News & Prime Time News',
    description:
      'Televisi berita nasional 24 jam dengan laporan lapangan langsung, analisis kebijakan publik, dan dialog kebangsaan.',
    badgeColor: '#1d4ed8',
    thumbnailUrl: '/images/news/dpr_parlemen.jpg',
  },
  {
    id: 'ch_cnbc_indonesia',
    name: 'CNBC Indonesia Live',
    shortName: 'CNBC ID',
    region: 'Nasional (Indonesia)',
    countryCode: 'ID',
    streamUrl: 'https://video.detik.com/livecnbc/smil:cnbctv/playlist.m3u8',
    fallbackStreamUrl: 'https://video.detik.com/livecnn/smil:cnntv/playlist.m3u8',
    category: 'Ekonomi, Bursa & Bisnis',
    language: 'Bahasa Indonesia',
    network: 'Trans Media · CNBC Global',
    currentProgram: 'Squawk Box & Closing Bell Indonesia',
    description:
      'Siaran langsung pasar modal Bursa Efek Indonesia (IHSG), analisis nilai tukar Rupiah, komoditas, dan kebijakan ekonomi.',
    badgeColor: '#047857',
    thumbnailUrl: '/images/news/ihsg_bei.jpg',
  },
  {
    id: 'ch_tvri_nasional',
    name: 'TVRI Nasional HD',
    shortName: 'TVRI HD',
    region: 'Nasional (Indonesia)',
    countryCode: 'ID',
    streamUrl: 'https://ott-balancer.tvri.go.id/live/eds/Nasional/hls/Nasional.m3u8',
    fallbackStreamUrl: 'https://edge.medcom.id/live-edge/smil:metro.smil/playlist.m3u8',
    category: 'Penyiaran Publik Nasional',
    language: 'Bahasa Indonesia',
    network: 'LPP TVRI',
    currentProgram: 'Klik Indonesia Petang & Info Terkini',
    description:
      'Lembaga Penyiaran Publik Televisi Republik Indonesia yang menyiarkan berita antardaerah dari Sabang sampai Merauke.',
    badgeColor: '#0369a1',
    thumbnailUrl: '/images/news/pertanian_ekonomi.jpg',
  },
  {
    id: 'ch_btv_indonesia',
    name: 'BTV BeritaSatu HD',
    shortName: 'BTV HD',
    region: 'Nasional (Indonesia)',
    countryCode: 'ID',
    streamUrl:
      'https://lnd0t3b922.tenbytecdn.com/ta-sg1/90369cf5-6ac2-411d-b3d0-15fae10a2e2c/master.m3u8',
    fallbackStreamUrl: 'https://video.detik.com/livecnn/smil:cnntv/playlist.m3u8',
    category: 'Berita & Aktualita',
    language: 'Bahasa Indonesia',
    network: 'B-Universe Media',
    currentProgram: 'Beritasatu Sore & Obrolan Malam',
    description:
      'Saluran berita nasional dan perkotaan dengan liputan langsung peristiwa hukum, parlemen, dan ekonomi domestik.',
    badgeColor: '#b91c1c',
    thumbnailUrl: '/images/news/transportasi_pesawat.jpg',
  },

  // ================= SALURAN INTERNASIONAL (GLOBAL) =================
  {
    id: 'ch_dw_news',
    name: 'DW News English Live',
    shortName: 'DW News',
    region: 'Internasional (Global)',
    countryCode: 'DE',
    streamUrl:
      'https://amg01644-amg01644c1-amgplt0343.playout.now3.amagi.tv/ts-eu-w1-n2/playlist/amg01644-amg01644c1-amgplt0343/playlist.m3u8',
    fallbackStreamUrl:
      'https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_5000.m3u8',
    category: 'Global Affairs & Europe',
    language: 'English',
    network: 'Deutsche Welle · Jerman',
    currentProgram: 'DW News Hour — Live from Berlin',
    description:
      'Siaran televisi berita internasional 24 jam dari Berlin yang mengulas geopolitik Eropa, sains, dan ekonomi dunia.',
    badgeColor: '#0284c7',
    thumbnailUrl: '/images/news/paris_protest.jpg',
  },
  {
    id: 'ch_france24',
    name: 'France 24 English HD',
    shortName: 'France 24',
    region: 'Internasional (Global)',
    countryCode: 'FR',
    streamUrl:
      'https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_5000.m3u8',
    fallbackStreamUrl:
      'https://amg01644-amg01644c1-amgplt0343.playout.now3.amagi.tv/ts-eu-w1-n2/playlist/amg01644-amg01644c1-amgplt0343/playlist.m3u8',
    category: 'World News & Diplomacy',
    language: 'English',
    network: 'France Médias Monde · Paris',
    currentProgram: 'Live International Desk from Paris',
    description:
      'Perspektif berita internasional langsung dari Paris yang mencakup Eropa, Timur Tengah, Afrika, dan Asia-Pasifik.',
    badgeColor: '#2563eb',
    thumbnailUrl: '/images/news/antidrone_tech.jpg',
  },
  {
    id: 'ch_sky_news',
    name: 'Sky News Live HD',
    shortName: 'Sky News',
    region: 'Internasional (Global)',
    countryCode: 'UK',
    streamUrl:
      'https://skynewsau-live.akamaized.net/hls/live/2002691/skynewsau-extra3/master.m3u8',
    fallbackStreamUrl:
      'https://amg01644-amg01644c1-amgplt0343.playout.now3.amagi.tv/ts-eu-w1-n2/playlist/amg01644-amg01644c1-amgplt0343/playlist.m3u8',
    category: 'Breaking World News',
    language: 'English',
    network: 'Sky News Network',
    currentProgram: 'Sky News Live Desk & Global Markets',
    description:
      'Liputan berita internasional cepat mencakup pasar keuangan global, kebijakan luar negeri, dan korespondensi lapangan.',
    badgeColor: '#e11d48',
    thumbnailUrl: '/images/news/dolar_rupiah.jpg',
  },
  {
    id: 'ch_reuters_tv',
    name: 'Reuters TV Live',
    shortName: 'Reuters',
    region: 'Internasional (Global)',
    countryCode: 'GLOBAL',
    streamUrl:
      'https://amg00453-reuters-amg00453c1-rakuten-uk-2110.playouts.now.amagi.tv/playlist/amg00453-reuters-reuters-rakutenuk/playlist.m3u8',
    fallbackStreamUrl:
      'https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_5000.m3u8',
    category: 'Global Wire & Markets',
    language: 'English',
    network: 'Thomson Reuters · London & New York',
    currentProgram: 'Reuters World Dispatch 24/7',
    description:
      'Umpan video berita langsung dari kantor berita internasional Reuters di более dari 200 lokasi di seluruh dunia.',
    badgeColor: '#ea580c',
    thumbnailUrl: '/images/news/ai_prabowo_gates.jpg',
  },
  {
    id: 'ch_tvri_world',
    name: 'TVRI World English',
    shortName: 'TVRI World',
    region: 'Internasional (Global)',
    countryCode: 'INT',
    streamUrl:
      'https://ott-balancer.tvri.go.id/live/eds/TVRIWorld/hls/TVRIWorld.m3u8',
    fallbackStreamUrl:
      'https://ott-balancer.tvri.go.id/live/eds/Nasional/hls/Nasional.m3u8',
    category: 'Indonesian & Asian Perspective',
    language: 'English',
    network: 'TVRI International Broadcast',
    currentProgram: 'Indonesia Window & Global Diplomacy',
    description:
      'Saluran berbahasa Inggris resmi Indonesia untuk pemirsa global yang menyoroti diplomasi ASEAN, ekonomi, dan budaya.',
    badgeColor: '#4f46e5',
    thumbnailUrl: '/images/news/jepang_rudal.jpg',
  },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'art_20261025_001',
    title:
      'IHSG Menguat ke Level 7.482 Ditopang Aliran Modal Asing dan9 Perusahaan Antre IPO di Bursa Efek Indonesia',
    summary:
      'Indeks Harga Saham Gabungan (IHSG) di Gedung Bursa Efek Indonesia bergerak menguat seiring masuknya dana investor institusional ke sektor perbankan dan energi. Otoritas bursa juga mencatat sembilan perusahaan beraset besar tengah berada dalam antrean penawaran umum perdana (IPO).',
    full_content: [
      'JAKARTA — Pergerakan Indeks Harga Saham Gabungan (IHSG) di Gedung Bursa Efek Indonesia (BEI), Jakarta, mencatatkan tren penguatan solid ke level 7.482,15 atau naik 0,84 persen pada perdagangan terbaru. Penguatan ini didorong oleh aksi beli bersih (net foreign buy) investor mancanegara pada saham-saham berkapitalisasi besar.',
      'Direktur Penilaian Perusahaan Bursa Efek Indonesia mengungkapkan bahwa minat korporasi domestik untuk menghimpun dana melalui pasar modal tetap sangat tinggi pada kuartal keempat tahun ini. Saat ini terdapat sembilan perusahaan yang berada dalam pipeline pencatatan saham perdana (IPO).',
      'Dari sembilan calon emiten tersebut, empat di antaranya merupakan perusahaan kategori aset skala besar di atas Rp250 miliar yang bergerak di sektor energi terbarukan, logistik maritim, pengolahan mineral, serta infrastruktur telekomunikasi.',
      'Di sisi makroekonomi, keputusan Bank Indonesia mempertahankan suku bunga acuan BI-Rate pada level 5,50 persen turut memberikan sentimen positif bagi stabilitas pasar obligasi dan ekuitas domestik di tengah fluktuasi imbal hasil obligasi global.',
      'Para analis pasar modal memproyeksikan aliran modal masuk ke pasar keuangan Indonesia akan terus berlanjut hingga akhir tahun, didukung oleh fundamental pertumbuhan laba emiten perbankan dan konsumsi domestik yang terjaga kuat.',
    ],
    quote: {
      text: 'Kepercayaan investor terhadap pasar modal Indonesia tercermin dari kuatnya kapitalisasi pasar serta antrean sembilan perusahaan potensial yang siap melantai di Bursa Efek Indonesia.',
      speaker: 'Direktorat Penilaian Perusahaan BEI',
      role: 'Paparan Publik Bursa Efek Indonesia, Jakarta',
    },
    key_stats: [
      { label: 'Posisi IHSG BEI', value: '7.482,15 (+0,84%)' },
      { label: 'Antrean IPO Baru', value: '9 Perusahaan' },
      { label: 'Suku Bunga BI-Rate', value: '5,50%' },
    ],
    ai_takeaways: [
      'IHSG menguat ke level 7.482,15 didorong aksi beli bersih investor asing pada saham perbankan dan hilirisasi energi.',
      'Sembilan perusahaan sedang mengantre IPO di BEI, termasuk empat korporasi beraset skala besar di atas Rp250 miliar.',
      'Stabilitas suku bunga acuan 5,50% menjaga daya tarik aset keuangan domestik hingga akhir tahun.',
    ],
    author: 'Andi Pratama · Redaksi Ekonomi & Pasar Modal',
    location: 'JAKARTA',
    source_name: 'CNBC Indonesia',
    source_url: 'https://www.cnbcindonesia.com/market',
    image_url: '/images/news/ihsg_bei.jpg',
    image_caption:
      'Dokumentasi layar pergerakan Indeks Harga Saham Gabungan (IHSG) di Gedung Bursa Efek Indonesia (BEI), Jakarta.',
    published_at: '2026-10-25T13:52:00Z',
    relative_time: '10 menit lalu',
    region: 'Nasional (Indonesia)',
    category: 'Ekonomi',
    read_time: '3 mnt baca',
    is_lead: true,
  },
  {
    id: 'art_20261025_002',
    title:
      'Pertemuan Strategis Bahas Transformasi Kecerdasan Buatan (AI) Nasional dan Antisipasi Gejolak 20 Tahun ke Depan',
    summary:
      'Pemanfaatan teknologi kecerdasan buatan (AI) untuk layanan kesehatan, pendidikan, dan ketahanan pangan menjadi fokus pembahasan strategis di Jakarta. Di saat bersamaan, para tokoh teknologi dunia mengingatkan perlunya kesiapan sumber daya manusia menghadapi pergeseran lapangan kerja selama dua dekade mendatang.',
    full_content: [
      'JAKARTA — Pengembangan ekosistem kecerdasan buatan (Artificial Intelligence/AI) berdaulat dan penerapannya pada layanan publik strategis menjadi agenda utama dalam kolaborasi teknologi tingkat tinggi di Jakarta.',
      'Fokus kerja sama mencakup pemanfaatan AI untuk diagnostik medis dini di rumah sakit daerah, pemodelan cuaca pertanian presisi, serta percepatan digitalisasi birokrasi pemerintah melalui infrastruktur Pusat Data Nasional.',
      'Dalam diskusi global terbaru, tokoh filantropi dan pendiri Microsoft Bill Gates turut mengingatkan bahwa revolusi kecerdasan buatan akan membawa perubahan struktural besar terhadap ekonomi dan pola kerja manusia selama 20 tahun ke depan.',
      'Oleh karena itu, pemerintah Indonesia melalui Kementerian Komunikasi dan Digital bersama perguruan tinggi nasional tengah memperluas program pelatihan talenta digital dan keamanan siber bagi ratusan ribu lulusan muda setiap tahunnya.',
      'Selain kesiapan sumber daya manusia, regulasi etika dan tata kelola keamanan data juga disiapkan agar adopsi teknologi otomasi tetap memberikan perlindungan optimal bagi pekerja serta kedaulatan data warga negara.',
    ],
    quote: {
      text: 'Adopsi kecerdasan buatan harus diarahkan untuk memperkuat kualitas layanan kesehatan, pendidikan, dan produktivitas nasional sembari menyiapkan talenta muda menghadapi transformasi industri.',
      speaker: 'Forum Transformasi Digital Nasional',
      role: 'Pertemuan Strategis Teknologi & Inovasi, Jakarta',
    },
    key_stats: [
      { label: 'Horison Transformasi AI', value: '20 Tahun' },
      { label: 'Fokus Implementasi', value: 'Medis & Pangan' },
      { label: 'Target Talenta Digital', value: '500 Ribu/Tahun' },
    ],
    ai_takeaways: [
      'Kolaborasi strategis memfokuskan pemanfaatan AI pada layanan kesehatan publik, ketahanan pangan, dan tata kelola pemerintahan.',
      'Perkembangan AI diproyeksikan mengubah lanskap ekonomi dan keahlian tenaga kerja global selama dua dekade ke depan.',
      'Pemerintah mempercepat kurikulum talenta digital dan tata kelola perlindungan data pribadi.',
    ],
    author: 'Nadia Kusuma · Desk Teknologi & Sains',
    location: 'JAKARTA',
    source_name: 'CNN Indonesia',
    source_url: 'https://www.cnnindonesia.com/teknologi',
    image_url: '/images/news/ai_prabowo_gates.jpg',
    image_caption:
      'Dokumentasi pertemuan strategis membahas kerja sama inovasi teknologi, kesehatan, dan transformasi digital di Jakarta.',
    published_at: '2026-10-25T13:38:00Z',
    relative_time: '24 menit lalu',
    region: 'Nasional (Indonesia)',
    category: 'Teknologi',
    read_time: '4 mnt baca',
  },
  {
    id: 'art_20261025_003',
    title:
      'Evaluasi Kinerja Kabinet Merah Putih: Penguatan Layanan Publik Daerah dan Pengendalian Inflasi Wilayah',
    summary:
      'Laporan evaluasi kinerja kementerian menempatkan tata kelola pemerintahan daerah dan pengendalian inflasi pangan wilayah sebagai capaian dengan apresiasi publik tertinggi. Koordinasi rutin bersama seluruh kepala daerah dinilai efektif menjaga stabilitas harga kebutuhan pokok.',
    full_content: [
      'JAKARTA — Hasil evaluasi berkala terhadap kinerja kementerian dalam Kabinet Merah Putih menunjukkan tingkat kepuasan publik yang tinggi pada sektor koordinasi pemerintahan dalam negeri, stabilitas harga pangan daerah, dan percepatan layanan administrasi kependudukan.',
      'Menteri Dalam Negeri Tito Karnavian tercatat masuk dalam jajaran lima menteri dengan kinerja terbaik berkat konsistensi pengendalian inflasi daerah yang dilakukan setiap pekan bersama gubernur, bupati, dan wali kota di seluruh Indonesia.',
      'Melalui pemantauan indeks perkembangan harga secara real-time di setiap kabupaten/kota, pemerintah daerah dapat segera menggelar operasi pasar murah dan subsidi ongkos angkut logistik apabila terjadi gejolak harga beras, cabai, maupun minyak goreng.',
      'Selain pengendalian inflasi, percepatan digitalisasi layanan publik melalui Mal Pelayanan Publik (MPP) dan identitas kependudukan digital kini telah menjangkau lebih dari 450 kabupaten dan kota di tanah air.',
      'Langkah sinergis antara pemerintah pusat dan daerah ini diharapkan terus menjaga daya beli masyarakat sekaligus mempercepat realisasi belanja anggaran pendapatan dan belanja daerah (APBD) yang berdampak langsung pada perekonomian warga.',
    ],
    quote: {
      text: 'Kunci stabilitas ekonomi nasional berawal dari daerah. Koordinasi mingguan pengendalian inflasi memastikan setiap lonjakan harga komoditas di daerah dapat diintervensi secara cepat dan tepat sasaran.',
      speaker: 'Kementerian Dalam Negeri RI',
      role: 'Laporan Evaluasi Koordinasi Pemerintahan Daerah, Jakarta',
    },
    key_stats: [
      { label: 'Peringkat Kinerja', value: '5 Besar Kabinet' },
      { label: 'Cakupan MPP Digital', value: '450+ Kab/Kota' },
      { label: 'Rapat Koordinasi Inflasi', value: 'Rutin Mingguan' },
    ],
    ai_takeaways: [
      'Koordinasi pengendalian inflasi daerah secara mingguan berhasil menjaga stabilitas harga komoditas pangan pokok.',
      'Perluasan Mal Pelayanan Publik (MPP) dan administrasi kependudukan digital memangkas birokrasi perizinan di daerah.',
      'Sinergi belanja APBD dan APBN difokuskan pada program padat karya dan penguatan daya beli masyarakat.',
    ],
    author: 'Bima Wijaya · Desk Nasional & Pemerintahan',
    location: 'JAKARTA',
    source_name: 'CNN Indonesia',
    source_url: 'https://www.cnnindonesia.com/nasional',
    image_url: '/images/news/kabinet_kemendagri.jpg',
    image_caption:
      'Dokumentasi rapat koordinasi dan evaluasi kinerja pelayanan publik Kementerian Dalam Negeri di Jakarta.',
    published_at: '2026-10-25T13:20:00Z',
    relative_time: '40 menit lalu',
    region: 'Nasional (Indonesia)',
    category: 'Politik',
    read_time: '3 mnt baca',
  },
  {
    id: 'art_20261025_004',
    title:
      'Dinamika Fraksi di DPR RI Soroti Agenda Pengawasan Konstitusional dan Transparansi Lembaga Negara',
    summary:
      'Sejumlah fraksi partai politik di Dewan Perwakilan Rakyat (DPR) RI menggelar pertemuan intensif untuk menyelaraskan agenda pengawasan legislatif pada masa sidang berjalan. Fokus pembahasan mencakup transparansi administrasi pejabat publik, penegakan hukum, serta penyelesaian rancangan undang-undang prioritas.',
    full_content: [
      'JAKARTA — Dinamika politik di Kompleks Parlemen Senayan, Jakarta, menghangat seiring langkah sejumlah fraksi di DPR RI yang merespons berbagai aspirasi masyarakat terkait fungsi pengawasan konstitusional terhadap penyelenggara negara.',
      'Dalam keterangan resmi di Gedung Nusantara, perwakilan lintas fraksi menegaskan bahwa setiap usulan hak angket, interpelasi, maupun rapat dengar pendapat umum akan diproses sesuai mekanisme tata tertib parlemen yang berlaku secara objektif dan transparan.',
      'Selain merespons isu-isu aktual ketatanegaraan, Badan Legislasi (Baleg) dan komisi-komisi terkait di DPR RI tengah memprioritaskan penyelesaian sejumlah rancangan undang-undang strategis di bidang perlindungan konsumen digital, tata kelola ruang udara, dan reformasi peradilan.',
      'Para pengamat politik menilai komunikasi terbuka antar-fraksi di parlemen sangat penting untuk menjaga keseimbangan fungsi checks and balances dalam sistem demokrasi presidensial Indonesia.',
      'Pimpinan DPR RI menjadwalkan rapat badan musyawarah (Bamus) pada pekan depan guna menetapkan agenda rapat paripurna serta jadwal kerja komisi bersama mitra kerja pemerintah.',
    ],
    quote: {
      text: 'Seluruh mekanisme pengawasan di DPR RI dijalankan secara konstitusional, terbuka, dan mengedepankan kepentingan masyarakat luas serta kepastian hukum.',
      speaker: 'Komisi Pemerintahan & Hukum DPR RI',
      role: 'Kompleks Parlemen Senayan, Jakarta',
    },
    key_stats: [
      { label: 'Lokasi Sidang', value: 'Gedung DPR RI' },
      { label: 'Agenda Prioritas', value: 'Pengawasan & RUU' },
      { label: 'Mekanisme Parlemen', value: 'Komisi & Bamus' },
    ],
    ai_takeaways: [
      'Fraksi-fraksi di DPR RI mengintensifkan komunikasi politik terkait pelaksanaan fungsi pengawasan parlemen.',
      'Seluruh aspirasi masyarakat dibahas melalui mekanisme resmi komisi dan Badan Musyawarah DPR RI.',
      'Penyelesaian RUU prioritas tetap menjadi target utama masa persidangan kuartal keempat.',
    ],
    author: 'Hendra Gunawan · Koresponden Parlemen Senayan',
    location: 'JAKARTA',
    source_name: 'CNN Indonesia',
    source_url: 'https://www.cnnindonesia.com/nasional',
    image_url: '/images/news/dpr_parlemen.jpg',
    image_caption:
      'Dokumentasi suasana sidang dan konferensi pers pimpinan fraksi di Gedung DPR RI, Kompleks Parlemen Senayan, Jakarta.',
    published_at: '2026-10-25T13:05:00Z',
    relative_time: '55 menit lalu',
    region: 'Nasional (Indonesia)',
    category: 'Politik',
    read_time: '3 mnt baca',
  },
  {
    id: 'art_20261025_005',
    title:
      'Kebijakan Modernisasi Pertanian Tunjukkan Hasil, Nilai Tukar dan Daya Beli Petani Melonjak Signifikan',
    summary:
      'Program intensifikasi lahan, distribusi pupuk tepat sasaran, dan mekanisasi alat mesin pertanian berhasil mendongkrak produksi pangan di sentra-sentra utama seperti Lampung, Jawa, dan Sulawesi. Kenaikan Nilai Tukar Petani (NTP) turut menggerakkan perputaran ekonomi perdesaan.',
    full_content: [
      'LAMPUNG & JAKARTA — Kebijakan percepatan modernisasi pertanian yang dijalankan Kementerian Pertanian mulai membuahkan hasil nyata dengan melonjaknya Nilai Tukar Petani (NTP) dan daya beli masyarakat perdesaan di berbagai sentra produksi pangan nasional.',
      'Di Provinsi Lampung dan sejumlah lumbung pangan utama, peningkatan kuota pupuk bersubsidi yang dapat ditebus langsung menggunakan KTP serta bantuan pompa air irigasi telah meningkatkan indeks pertanaman padi dan jagung dari dua kali menjadi tiga kali setahun.',
      'Data Badan Pusat Statistik menunjukkan kenaikan harga pembelian pemerintah (HPP) gabah kering panen yang dibarengi efisiensi biaya produksi berkat alat mesin pertanian modern membuat margin pendapatan bersih petani meningkat signifikan.',
      'Dampak positif ini terlihat langsung dari meningkatnya konsumsi rumah tangga di wilayah perdesaan, pertumbuhan simpanan perbankan mikro, serta stabilnya pasokan beras ke pasar induk perkotaan.',
      'Kementerian Pertanian menargetkan perluasan program pompanisasi dan optimasi lahan rawa produktif hingga 1,2 juta hektare guna memperkokoh swasembada pangan nasional di tengah ketidakpastian iklim global.',
    ],
    quote: {
      text: 'Ketika akses pupuk dimudahkan, irigasi terjamin, dan harga panen petani dilindungi, kesejahteraan petani meningkat dan ketahanan pangan nasional berdiri kokoh.',
      speaker: 'Kementerian Pertanian RI',
      role: 'Tinjauan Panen Raya & Evaluasi NTP Nasional',
    },
    key_stats: [
      { label: 'Indeks Pertanaman', value: '3x Setahun' },
      { label: 'Target Optimasi Lahan', value: '1,2 Juta Ha' },
      { label: 'Dampak Ekonomi', value: 'NTP Meningkat' },
    ],
    ai_takeaways: [
      'Kemudahan akses pupuk bersubsidi dan program pompanisasi irigasi berhasil mendongkrak produktivitas panen daerah.',
      'Nilai Tukar Petani (NTP) dan daya beli masyarakat perdesaan di Lampung serta sentra pangan nasional meningkat.',
      'Pemerintah memperluas optimasi lahan produktif guna menjaga stabilitas pasokan pangan domestik.',
    ],
    author: 'Rizky Darmawan · Desk Agribisnis & Pangan',
    location: 'LAMPUNG & JAKARTA',
    source_name: 'CNN Indonesia',
    source_url: 'https://www.cnnindonesia.com/ekonomi',
    image_url: '/images/news/pertanian_ekonomi.jpg',
    image_caption:
      'Dokumentasi peninjauan hasil panen dan pelaksanaan kebijakan pertanian bersama para petani di lapangan.',
    published_at: '2026-10-25T12:40:00Z',
    relative_time: '1 jam lalu',
    region: 'Nasional (Indonesia)',
    category: 'Ekonomi',
    read_time: '3 mnt baca',
  },
  {
    id: 'art_20261025_006',
    title:
      'Pemerintah Siapkan Insentif Tarif 4 Moda Transportasi Utama Guna Jaga Kelancaran Mobilitas Nasional',
    summary:
      'Kementerian Perhubungan bersama kementerian koordinator terkait merumuskan kebijakan diskon tarif untuk empat moda transportasi—pesawat udara, kereta api, angkutan laut, dan penyeberangan—menjelang periode puncak mobilitas masyarakat. Kebijakan ini bertujuan menekan harga tiket sekaligus mendorong pariwisata nusantara.',
    full_content: [
      'JAKARTA — Pemerintah resmi menyiapkan paket kebijakan insentif potongan tarif untuk empat moda transportasi utama, yakni angkutan udara komersial, kereta api antarkota, kapal laut penumpang Pelni, serta angkutan penyeberangan feri lintas pulau.',
      'Khusus untuk transportasi udara, penurunan harga tiket pesawat dicapai melalui sinergi pemangkasan biaya avtur di sejumlah bandara, pengurangan tarif jasa kebandarudaraan (PJP2U), serta insentif pajak pertambahan nilai ditanggung pemerintah untuk rute-rute domestik tertentu.',
      'Kementerian Perhubungan juga telah berkoordinasi dengan seluruh maskapai penerbangan nasional guna menambah kapasitas kursi (extra flight) pada rute-rute padat guna mencegah lonjakan harga tiket mendekati batas tarif atas.',
      'Di sektor perkeretaapian dan pelayaran, PT KAI dan PT Pelni memberikan program potongan harga khusus bagi pemesanan lebih awal serta menyediakan kuota angkutan motor gratis demi menekan angka kecelakaan lalu lintas jalan raya.',
      'Kebijakan terpadu lintas kementerian ini diproyeksikan mampu menggerakkan perputaran uang sektor pariwisata, perhotelan, dan kuliner UMKM daerah hingga puluhan triliun rupiah.',
    ],
    quote: {
      text: 'Intervensi lintas sektor pada komponen biaya avtur dan jasa bandara kami lakukan agar masyarakat mendapatkan tarif transportasi yang terjangkau dengan standar keselamatan tertinggi.',
      speaker: 'Kementerian Perhubungan RI',
      role: 'Konferensi Pers Kesiapan Angkutan Nasional, Jakarta',
    },
    key_stats: [
      { label: 'Moda Mendapat Insentif', value: '4 Moda Utama' },
      { label: 'Target Penurunan Tiket', value: '10% – 15%' },
      { label: 'Kapasitas Kursi Tambahan', value: 'Extra Flight Aktif' },
    ],
    ai_takeaways: [
      'Empat moda transportasi (pesawat, kereta api, kapal laut, dan feri) memperoleh skema diskon tarif terkoordinasi.',
      'Efisiensi biaya avtur dan tarif layanan bandara diterapkan untuk menurunkan harga tiket pesawat domestik.',
      'Penambahan frekuensi penerbangan disiapkan untuk menjaga ketersediaan kursi di seluruh rute utama.',
    ],
    author: 'Dewi Anggraini · Desk Infrastruktur & Transportasi',
    location: 'JAKARTA',
    source_name: 'CNN Indonesia',
    source_url: 'https://www.cnnindonesia.com/ekonomi',
    image_url: '/images/news/transportasi_pesawat.jpg',
    image_caption:
      'Dokumentasi aktivitas pesawat komersial di bandara internasional Indonesia dalam mendukung konektivitas antarpulau.',
    published_at: '2026-10-25T12:15:00Z',
    relative_time: '1 jam lalu',
    region: 'Nasional (Indonesia)',
    category: 'Ekonomi',
    read_time: '3 mnt baca',
  },
  {
    id: 'art_20261025_007',
    title:
      'Aksi Demonstrasi 110 Ribu Pekerja di Paris Prancis Berujung Bentrok, Ribuan Aparat Dikerahkan',
    summary:
      'Gelombang unjuk rasa yang diikuti lebih dari 110 ribu warga dan anggota serikat pekerja di pusat kota Paris, Prancis, memanas menjadi bentrokan dengan aparat keamanan. Para demonstran memprotes kebijakan penghematan anggaran negara dan menuntut perlindungan daya beli pekerja.',
    full_content: [
      'PARIS — Lebih dari 110.000 warga dan anggota konfederasi serikat pekerja turun ke jalan-jalan utama di ibu kota Paris serta sejumlah kota besar lainnya di Prancis untuk menyuarakan penolakan terhadap rancangan pemangkasan belanja sosial dan reformasi anggaran pemerintah.',
      'Aksi yang awalnya berlangsung tertib sejak pagi hari berubah menjadi ketegangan di sekitar Place de la République dan Bastille ketika sekelompok demonstran berpakaian hitam melemparkan benda keras serta merusak etalase pertokoan.',
      'Kepolisian Nasional Prancis yang mengerahkan ribuan personel brigade pengendali massa merespons dengan menembakkan gas air mata dan meriam air guna membubarkan kerumunan yang memblokade jalan arteri.',
      'Kementerian Dalam Negeri Prancis melaporkan ratusan orang telah diamankan oleh otoritas keamanan di berbagai titik aksi akibat tindakan perusakan fasilitas umum dan perlawanan terhadap petugas.',
      'Sementara itu, pimpinan serikat pekerja menegaskan akan terus melanjutkan dialog maupun aksi mogok kerja terukur apabila tuntutan penyesuaian upah minimum terhadap inflasi tidak dipenuhi dalam pembahasan anggaran parlemen.',
    ],
    quote: {
      text: 'Kami menuntut keadilan fiskal dan perlindungan terhadap layanan publik serta upah pekerja di tengah meningkatnya biaya hidup di seluruh kota besar Eropa.',
      speaker: 'Koalisi Serikat Pekerja Prancis',
      role: 'Pernyataan Aksi Nasional di Paris, Prancis',
    },
    key_stats: [
      { label: 'Jumlah Massa Aksi', value: '110.000+ Warga' },
      { label: 'Lokasi Pusat Aksi', value: 'Paris, Prancis' },
      { label: 'Isu Utama', value: 'Reformasi Anggaran' },
    ],
    ai_takeaways: [
      'Lebih dari 110 ribu pengunjuk rasa menggelar aksi besar di Paris menentang kebijakan penghematan anggaran.',
      'Kericuhan pecah di sejumlah titik kota ketika kelompok radikal terlibat bentrok dengan aparat kepolisian Prancis.',
      'Serikat pekerja mendesak parlemen Prancis memprioritaskan perlindungan upah dan jaminan sosial.',
    ],
    author: 'Claire Dubois · Biro Eropa Barat',
    location: 'PARIS',
    source_name: 'CNN Internasional',
    source_url: 'https://www.cnnindonesia.com/internasional',
    image_url: '/images/news/paris_protest.jpg',
    image_caption:
      'Dokumentasi ketegangan antara pengunjuk rasa dan aparat keamanan di tengah aksi demonstrasi serikat pekerja di Paris, Prancis.',
    published_at: '2026-10-25T11:45:00Z',
    relative_time: '2 jam lalu',
    region: 'Internasional (Global)',
    category: 'Politik',
    read_time: '4 mnt baca',
  },
  {
    id: 'art_20261025_008',
    title:
      'Satelit NASA Soroti Anomali Titik Panas Karhutla di Papua, BMKG Perkuat Operasi Modifikasi Cuaca',
    summary:
      'Pantauan citra satelit observasi bumi NASA mendeteksi peningkatan titik panas dan emisi asap akibat kebakaran hutan dan lahan (karhutla) di bagian selatan Papua yang dipicu kemarau kering. Merespons temuan tersebut, BMKG bersama BNPB mempercepat penyemaian awan hujan dan pemadaman darat.',
    full_content: [
      'JAKARTA & MERAUKE — Citra satelit pemantau atmosfer milik Badan Penerbangan dan Antariksa Amerika Serikat (NASA) mencatat adanya lonjakan konsentrasi aerosol asap dan emisi karbon dari kebakaran lahan gambut serta sabana di wilayah selatan Papua.',
      'Fenomena tersebut dipicu oleh kondisi kekeringan lokal akibat anomali cuaca yang membuat vegetasi rawa mengering lebih cepat dibandingkan tahun-tahun sebelumnya.',
      'Menindaklanjuti data satelit tersebut, Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) bersama Badan Nasional Penanggulangan Bencana (BNPB) langsung mengerahkan armada pesawat khusus untuk melaksanakan Operasi Modifikasi Cuaca (OMC) guna memicu turunnya hujan buatan di atas titik-titik rawan api.',
      'Selain itu, BMKG memprediksi 21 wilayah di Indonesia mulai berpotensi diguyur hujan intensitas sedang hingga lebat pada pekan ini yang diharapkan dapat membantu membasahi lahan gambut secara alami.',
      'Satuan tugas gabungan TNI, Polri, dan Manggala Agni Kementerian Lingkungan Hidup dan Kehutanan juga terus berjaga di lapangan guna menyekat perambatan api agar tidak mengganggu jarak pandang penerbangan perintis di Papua.',
    ],
    quote: {
      text: 'Data telemetri satelit dikombinasikan dengan radar cuaca BMKG memungkinkan pelaksanaan Operasi Modifikasi Cuaca diarahkan tepat ke sel awan potensial di atas titik panas.',
      speaker: 'Pusat Meteorologi Publik BMKG',
      role: 'Laporan Pemantauan Cuaca & Mitigasi Karhutla, Jakarta',
    },
    key_stats: [
      { label: 'Pantauan Satelit', value: 'NASA Earth Obs' },
      { label: 'Wilayah Potensi Hujan', value: '21 Daerah RI' },
      { label: 'Langkah Mitigasi', value: 'Modifikasi Cuaca' },
    ],
    ai_takeaways: [
      'Satelit NASA mendeteksi peningkatan titik panas dan kabut asap di wilayah selatan Papua akibat cuaca kering.',
      'BMKG dan BNPB mengintensifkan Operasi Modifikasi Cuaca (OMC) untuk mempercepat turunnya hujan di lokasi terdampak.',
      'Prakiraan cuaca menunjukkan 21 wilayah Indonesia mulai memasuki fase hujan yang membantu peredaman titik api.',
    ],
    author: 'lukas Pratama · Desk Sains & Lingkungan',
    location: 'PAPUA & JAKARTA',
    source_name: 'CNN Indonesia',
    source_url: 'https://www.cnnindonesia.com/teknologi',
    image_url: '/images/news/nasa_karhutla.jpg',
    image_caption:
      'Dokumentasi pantauan udara sebaran asap kebakaran hutan dan lahan di wilayah Papua yang terekam citra observasi.',
    published_at: '2026-10-25T11:10:00Z',
    relative_time: '2 jam lalu',
    region: 'Nasional (Indonesia)',
    category: 'Teknologi',
    read_time: '4 mnt baca',
  },
  {
    id: 'art_20261025_009',
    title:
      'Eskalasi Pertahanan Udara: Sistem Radar Anti-Drone Canggih Dikerahkan di Jalur Strategis Teluk Persia',
    summary:
      'Ketegangan militer terkait penggunaan pesawat nirawak (drone) pengintai di koridor pelayaran Bandar Abbas, Selat Hormuz, mendorong peningkatan kesiapsiagaan sistem pertahanan udara elektronik. Militer setempat mengklaim berhasil mencegat drone tanpa awak jarak jauh menggunakan teknologi intersepsi frekuensi.',
    full_content: [
      'TEHERAN & DUBAI — Eskalasi teknologi peperangan nirawak kembali menjadi sorotan internasional menyusul klaim pencegatan sebuah unit drone pengintai jarak jauh di wilayah udara pesisir Bandar Abbas yang menghadap langsung ke jalur pelayaran strategis Selat Hormuz.',
      'Otoritas pertahanan setempat menyatakan bahwa unit pesawat nirawak tersebut terdeteksi oleh jaringan radar pasif terpadu sebelum berhasil dilumpuhkan menggunakan kombinasi sistem pengacak sinyal elektronik (electronic warfare jamming) dan rudal pertahanan udara jarak menengah.',
      'Dalam beberapa tahun terakhir, baik Amerika Serikat maupun negara-negara di kawasan Timur Tengah dan Asia Timur berlomba mengembangkan teknologi anti-drone berbasis laser energi terarah serta gelombang mikro berdaya tinggi guna menghadapi ancaman kawanan drone berbiaya rendah.',
      'Para analis keamanan maritim mengingatkan bahwa stabilitas di sekitar Selat Hormuz sangat krusial bagi perekonomian dunia mengingat hampir seperlima pasokan minyak mentah dan gas alam cair global melintasi perairan sempit tersebut setiap harinya.',
      'Otoritas navigasi pelayaran internasional mengimbau seluruh kapal niaga yang melintasi kawasan Teluk untuk terus memperbarui protokol komunikasi keamanan maritim.',
    ],
    quote: {
      text: 'Perlombaan teknologi pertahanan udara modern kini beralih pada kemampuan mendeteksi dan melumpuhkan wahana nirawak otonom secara presisi dalam hitungan detik.',
      speaker: 'Lembaga Kajian Strategis & Pertahanan Internasional',
      role: 'Analisis Keamanan Maritim Kawasan Teluk',
    },
    key_stats: [
      { label: 'Lokasi Insiden', value: 'Bandar Abbas' },
      { label: 'Teknologi Pertahanan', value: 'Radar & Anti-Drone' },
      { label: 'Jalur Logistik Vital', value: '20% Minyak Dunia' },
    ],
    ai_takeaways: [
      'Sistem pertahanan udara di pesisir Bandar Abbas dilaporkan mencegat unit pesawat nirawak pengintai asing.',
      'Pengembangan teknologi anti-drone berbasis peperangan elektronik dan laser menjadi prioritas militer global.',
      'Keamanan jalur pelayaran Selat Hormuz terus dipantau ketat oleh pelaku pasar energi internasional.',
    ],
    author: 'Tariq Al-Mansoor · Desk Keamanan & Geopolitik',
    location: 'TIMUR TENGAH',
    source_name: 'CNN Internasional',
    source_url: 'https://www.cnnindonesia.com/internasional',
    image_url: '/images/news/antidrone_tech.jpg',
    image_caption:
      'Dokumentasi pengujian sistem teknologi pertahanan anti-drone dan pelacak sasaran udara militer modern.',
    published_at: '2026-10-25T10:30:00Z',
    relative_time: '3 jam lalu',
    region: 'Internasional (Global)',
    category: 'Teknologi',
    read_time: '4 mnt baca',
  },
  {
    id: 'art_20261025_010',
    title:
      'Inklusi Keuangan Perbankan Nasional Jangkau Wilayah Pesisir dan Perbatasan Lewat Agen Laku Pandai',
    summary:
      'Jaringan keagenan perbankan tanpa kantor di wilayah pinggiran Sumatera, Kalimantan, dan kawasan timur Indonesia terbukti mempercepat perputaran ekonomi usaha mikro. Masyarakat kini dapat mengakses layanan transaksi, tabungan, dan pembiayaan usaha tanpa harus menempuh perjalanan jauh ke pusat kota.',
    full_content: [
      'DUMAI & JAKARTA — Perluasan jaringan layanan keuangan tanpa kantor dalam rangka keuangan inklusif (Laku Pandai) terus menjadi motor penggerak ekonomi masyarakat di wilayah pesisir, perbatasan, dan perdesaan Indonesia.',
      'Di pinggiran Kota Dumai, Provinsi Riau, serta ribuan desa lainnya di Nusantara, kehadiran agen perbankan seperti BRILink memungkinkan pelaku usaha mikro, petani kelapa sawit, dan nelayan melakukan transaksi pengiriman uang, pembayaran tagihan, hingga pencairan kredit usaha rakyat (KUR) tepat di lingkungan tempat tinggal mereka.',
      'Otoritas Jasa Keuangan (OJK) mencatat jumlah agen perbankan Laku Pandai secara nasional telah melampaui 1,1 juta agen aktif dengan volume transaksi mencapai ratusan triliun rupiah sepanjang tahun berjalan.',
      'Selain mempermudah akses transaksi harian, keberadaan agen keuangan lokal juga meningkatkan literasi keuangan warga sehingga masyarakat terhindar dari jeratan pinjaman ilegal.',
      'Perbankan nasional terus memperkuat fitur keamanan aplikasi keagenan dengan pemindaian biometrik dan pencatatan struk digital secara real-time.',
    ],
    quote: {
      text: 'Kehadiran agen perbankan di pelosok desa bukan sekadar memudahkan transaksi, tetapi membuka akses modal kerja yang adil bagi jutaan pelaku UMKM di daerah pinggiran.',
      speaker: 'Divisi Jaringan & Keuangan Inklusif BRI',
      role: 'Tinjauan Ekonomi Daerah di Dumai, Riau',
    },
    key_stats: [
      { label: 'Total Agen Nasional', value: '1,1+ Juta Agen' },
      { label: 'Fokus Wilayah', value: 'Pesisir & Desa' },
      { label: 'Dampak Utama', value: 'Inklusi UMKM' },
    ],
    ai_takeaways: [
      'Jaringan agen perbankan Laku Pandai memudahkan akses keuangan warga di wilayah pinggiran seperti Dumai, Riau.',
      'Pelaku UMKM, petani, dan nelayan dapat bertransaksi dan mengakses pembiayaan mikro tanpa harus ke kantor cabang kota.',
      'Peningkatan inklusi keuangan resmi terbukti efektif menekan praktik pinjaman tidak berizin di daerah.',
    ],
    author: 'Siti Rahmawati · Redaksi Perbankan & UMKM',
    location: 'DUMAI & JAKARTA',
    source_name: 'CNN Indonesia',
    source_url: 'https://www.cnnindonesia.com/ekonomi',
    image_url: '/images/news/perbankan_bri.jpg',
    image_caption:
      'Dokumentasi pelayanan transaksi keuangan warga melalui agen perbankan inklusif di wilayah daerah.',
    published_at: '2026-10-25T09:50:00Z',
    relative_time: '4 jam lalu',
    region: 'Nasional (Indonesia)',
    category: 'Ekonomi',
    read_time: '3 mnt baca',
  },
  {
    id: 'art_20261025_011',
    title:
      'Dinamika Mata Uang Global: Bank Sentral Dunia Perkuat Cadangan Devisa Hadapi Dominasi Dolar AS',
    summary:
      'Penguatan indeks Dolar Amerika Serikat (DXY) akibat tingginya imbal hasil obligasi AS memicu langkah antisipatif dari berbagai bank sentral di Asia dan pasar berkembang. Penggunaan skema penyelesaian transaksi mata uang lokal (Local Currency Transaction/LCT) kini semakin diperluas dalam perdagangan lintas negara.',
    full_content: [
      'JAKARTA & SINGAPURA — Dinamika nilai tukar mata uang global kembali menjadi perhatian utama para pelaku pasar keuangan menyusul masih kuatnya permintaan terhadap Dolar Amerika Serikat (AS) sebagai aset safe haven di tengah ketidakpastian geopolitik dunia.',
      'Untuk menjaga stabilitas nilai tukar mata uang domestik dari tekanan eksternal, bank-bank sentral di kawasan Asia—termasuk Bank Indonesia bersama otoritas moneter ASEAN, Jepang, Korea Selatan, dan Tiongkok—terus memperluas implementasi transaksi menggunakan mata uang lokal atau Local Currency Transaction (LCT).',
      'Melalui skema LCT dan interkoneksi pembayaran QRIS lintas negara, pelaku usaha ekspor-impor maupun wisatawan tidak lagi harus mengonversi transaksi mereka ke dalam Dolar AS terlebih dahulu, sehingga mengurangi ketergantungan terhadap satu mata uang tunggal.',
      'Nilai transaksi LCT Indonesia bersama negara-negara mitra utama tercatat tumbuh lebih dari 45 persen secara tahunan, disertai posisi cadangan devisa nasional yang tetap kokoh di atas standar kecukupan internasional untuk membiayai lebih dari enam bulan impor.',
      'Ekonom menilai diversifikasi cadangan devisa dan pendalaman pasar keuangan domestik menjadi benteng utama dalam meredam rambatan volatilitas pasar valuta asing global.',
    ],
    quote: {
      text: 'Perluasan transaksi mata uang lokal (LCT) antarnegara mitra dagang secara nyata menurunkan biaya konversi valas bagi dunia usaha dan memperkokoh ketahanan eksternal Rupiah.',
      speaker: 'Departemen Internasional Bank Indonesia',
      role: 'Kajian Stabilitas Nilai Tukar & Moneter Global',
    },
    key_stats: [
      { label: 'Pertumbuhan Transaksi LCT', value: '+45% YoY' },
      { label: 'Kecukupan Devisa RI', value: '> 6 Bulan Impor' },
      { label: 'Konektivitas QRIS', value: 'Lintas Negara ASEAN' },
    ],
    ai_takeaways: [
      'Tingginya permintaan global terhadap Dolar AS mendorong bank sentral negara berkembang memperkuat instrumen stabilisasi valas.',
      'Skema Local Currency Transaction (LCT) tumbuh 45% dan mengurangi ketergantungan dunia usaha pada mata uang Dolar AS.',
      'Cadangan devisa Indonesia tetap berada pada level aman di atas standar kecukupan internasional.',
    ],
    author: 'Oliver Grant · Desk Ekonomi Makro & Valas',
    location: 'JAKARTA & GLOBAL',
    source_name: 'CNBC Indonesia',
    source_url: 'https://www.cnbcindonesia.com/market',
    image_url: '/images/news/dolar_rupiah.jpg',
    image_caption:
      'Dokumentasi mata uang Dolar Amerika Serikat dan instrumen valuta asing dalam perdagangan keuangan internasional.',
    published_at: '2026-10-25T09:15:00Z',
    relative_time: '4 jam lalu',
    region: 'Internasional (Global)',
    category: 'Ekonomi',
    read_time: '4 mnt baca',
  },
  {
    id: 'art_20261025_012',
    title:
      'Jepang dan Amerika Serikat Gelar Latihan Gabungan Sistem Pertahanan Rudal Jarak Jauh di Kawasan Pasifik',
    summary:
      'Pasukan Bela Diri Jepang (JSDF) bersama militer Amerika Serikat mengerahkan unit peluncur rudal pertahanan pantai jarak jauh dalam latihan gabungan berskala besar di kepulauan barat daya Jepang. Latihan ini bertujuan meningkatkan interoperabilitas sistem peringatan dini dan keamanan jalur maritim Indo-Pasifik.',
    full_content: [
      'TOKYO — Pasukan Bela Diri Darat Jepang (JGSDF) bersama Komando Indo-Pasifik Amerika Serikat menggelar latihan militer gabungan berskala besar yang menampilkan pengerahan sistem peluncur rudal pertahanan pantai jarak jauh di rangkaian kepulauan Jepang barat daya.',
      'Latihan tahunan tersebut melibatkan ribuan personel dari kedua negara serta pengujian integrasi radar satelit peringatan dini dengan baterai pertahanan udara bergerak.',
      'Kementerian Pertahanan Jepang menyatakan bahwa latihan ini dirancang murni untuk tujuan defensif guna meningkatkan kesiapsiagaan menjaga wilayah perairan kepulauan serta menjamin kebebasan navigasi di koridor laut Asia Timur.',
      'Selain manuver pertahanan pantai, latihan bersama ini juga mencakup simulasi operasi penyelamatan bencana alam lintas pulau, evakuasi medis udara, serta perlindungan infrastruktur kabel komunikasi bawah laut.',
      'Para pengamat hubungan internasional di kawasan Asia-Pasifik menekankan pentingnya saluran komunikasi diplomatik terbuka antarnegara di kawasan guna mencegah salah perhitungan militer.',
    ],
    quote: {
      text: 'Latihan kesiapsiagaan terpadu ini difokuskan pada peningkatan kemampuan pertahanan kepulauan, interoperabilitas radar, serta respons cepat terhadap darurat kawasan.',
      speaker: 'Kementerian Pertahanan Jepang',
      role: 'Keterangan Resmi Latihan Gabungan Pasifik, Tokyo',
    },
    key_stats: [
      { label: 'Negara Peserta', value: 'Jepang & AS' },
      { label: 'Fokus Alutsista', value: 'Rudal Pertahanan' },
      { label: 'Kawasan Operasi', value: 'Indo-Pasifik' },
    ],
    ai_takeaways: [
      'Jepang dan Amerika Serikat mengerahkan sistem peluncur rudal jarak jauh dalam latihan pertahanan kepulauan di Pasifik.',
      'Pengujian difokuskan pada sinkronisasi radar peringatan dini dan perlindungan jalur pelayaran strategis.',
      'Latihan juga mencakup simulasi tanggap darurat bencana alam dan perlindungan kabel bawah laut.',
    ],
    author: 'Kenji Watanabe · Biro Asia Timur',
    location: 'TOKYO',
    source_name: 'Antara News',
    source_url: 'https://www.antaranews.com/dunia',
    image_url: '/images/news/jepang_rudal.jpg',
    image_caption:
      'Dokumentasi pengerahan unit kendaraan peluncur rudal pertahanan dalam latihan gabungan di kawasan Asia-Pasifik.',
    published_at: '2026-10-25T08:40:00Z',
    relative_time: '5 jam lalu',
    region: 'Internasional (Global)',
    category: 'Politik',
    read_time: '4 mnt baca',
  },
];

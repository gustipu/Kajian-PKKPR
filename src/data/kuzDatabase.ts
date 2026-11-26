import { ZonaKab, ZonaProv } from '../types/pkkpr';

/**
 * Database Resmi Ketentuan Umum Zonasi (KUZ) Kabupaten Pasuruan
 * Sumber: Lampiran I Permen ATR/BPN Nomor 11 Tahun 2024 tentang RTRW Kabupaten Pasuruan
 * (BAB V Pola Ruang Pasal 23–37 & BAB VIII Ketentuan Umum Zonasi Pasal 70–83)
 */
export const OFFICIAL_KUZ_KAB_PASURUAN: ZonaKab[] = [
  {
    namaZona: 'Badan Air',
    isiKuz:
      'Ketentuan Umum Zonasi Badan Air (Pasal 71 Permen ATR/BPN No. 11/2024):\n' +
      'a. Kegiatan diperbolehkan: kegiatan perlindungan Badan Air.\n' +
      'b. Kegiatan diperbolehkan dengan syarat (tidak mengurangi dan mengubah fungsi utama Badan Air): wisata alam, perikanan budi daya, penelitian dan ilmu pengetahuan, fasilitas umum, instalasi utilitas/jaringan prasarana, serta sarana transportasi sungai, danau, dan penyeberangan.\n' +
      'c. Kegiatan tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan bersyarat, serta kegiatan yang mengganggu fungsi lindung Badan Air.\n' +
      'd. Prasarana sarana minimum: bangunan pendukung Badan Air serta sarana dan prasarana pengamanan Badan Air.\n' +
      'e. Ketentuan lain-lain: meminimalkan kegiatan yang dapat merusak Badan Air sebagai sumber air baku.',
    kdb: '-',
    klb: '-',
    kdh: '-',
  },
  {
    namaZona: 'Kawasan Hutan Lindung',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Hutan Lindung (Pasal 72 Permen ATR/BPN No. 11/2024):\n' +
      'a. Kegiatan diperbolehkan: pemanfaatan kegiatan perlindungan Kawasan Hutan Lindung.\n' +
      'b. Kegiatan diperbolehkan dengan syarat: pemanfaatan hutan pada Kawasan Hutan Lindung sesuai dengan ketentuan peraturan perundang-undangan.\n' +
      'c. Kegiatan tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan bersyarat, kegiatan yang mengganggu fungsi resapan pada Kawasan Hutan Lindung, dan kegiatan budi daya yang mengganggu fungsi Kawasan Hutan Lindung.\n' +
      'd. Intensitas dan prasarana sarana minimum: mengikuti ketentuan peraturan perundang-undangan.\n' +
      'e. Ketentuan lain-lain: meminimalkan kegiatan yang dapat mengganggu fungsi kawasan.',
    kdb: 'Sesuai peraturan',
    klb: 'Sesuai peraturan',
    kdh: 'Sesuai peraturan',
  },
  {
    namaZona: 'Cagar Alam',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Suaka Alam berupa Cagar Alam Gunung Abang (Pasal 73 ayat 2 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: pemanfaatan kegiatan perlindungan kawasan Cagar Alam sesuai dengan peraturan perundang-undangan.\n' +
      'b. Diperbolehkan dengan syarat: tidak mengurangi dan mengubah fungsi utama Cagar Alam serta memiliki izin pinjam pakai kawasan hutan sesuai peraturan perundang-undangan.\n' +
      'c. Tidak diperbolehkan: kegiatan pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan bersyarat, serta kegiatan yang mengganggu fungsi Cagar Alam.\n' +
      'd. Intensitas dan prasarana sarana minimum: mengikuti ketentuan peraturan perundang-undangan.\n' +
      'e. Ketentuan lain-lain: meminimalkan kegiatan yang dapat mengganggu fungsi kawasan.',
    kdb: 'Sesuai peraturan',
    klb: 'Sesuai peraturan',
    kdh: 'Sesuai peraturan',
  },
  {
    namaZona: 'Taman Nasional',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Pelestarian Alam berupa Taman Nasional Bromo Tengger Semeru (Pasal 73 ayat 4 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: pemanfaatan kegiatan perlindungan kawasan Taman Nasional sesuai dengan peraturan perundang-undangan.\n' +
      'b. Diperbolehkan dengan syarat: tidak mengurangi dan mengubah fungsi utama kawasan Taman Nasional serta memiliki izin pinjam pakai kawasan hutan sesuai peraturan perundang-undangan.\n' +
      'c. Tidak diperbolehkan: kegiatan pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan bersyarat, serta kegiatan yang mengganggu fungsi kawasan Taman Nasional.\n' +
      'd. Intensitas dan prasarana sarana minimum: mengikuti ketentuan peraturan perundang-undangan.\n' +
      'e. Ketentuan lain-lain: meminimalkan kegiatan yang dapat mengganggu fungsi kawasan.',
    kdb: 'Sesuai peraturan',
    klb: 'Sesuai peraturan',
    kdh: 'Sesuai peraturan',
  },
  {
    namaZona: 'Taman Hutan Raya',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Pelestarian Alam berupa Taman Hutan Raya R. Soerjo (Pasal 73 ayat 5 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: pemanfaatan kegiatan perlindungan kawasan Taman Hutan Raya sesuai dengan peraturan perundang-undangan.\n' +
      'b. Diperbolehkan dengan syarat: tidak mengurangi dan mengubah fungsi utama kawasan Taman Hutan Raya serta memiliki izin pinjam pakai kawasan hutan sesuai peraturan perundang-undangan.\n' +
      'c. Tidak diperbolehkan: kegiatan pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan bersyarat, serta kegiatan yang mengganggu fungsi kawasan Taman Hutan Raya.\n' +
      'd. Intensitas dan prasarana sarana minimum: mengikuti ketentuan peraturan perundang-undangan.\n' +
      'e. Ketentuan lain-lain: meminimalkan kegiatan yang dapat mengganggu fungsi kawasan.',
    kdb: 'Sesuai peraturan',
    klb: 'Sesuai peraturan',
    kdh: 'Sesuai peraturan',
  },
  {
    namaZona: 'Taman Wisata Alam',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Pelestarian Alam berupa Taman Wisata Alam Tretes & Gunung Baung (Pasal 73 ayat 6 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: pemanfaatan kegiatan perlindungan kawasan Taman Wisata Alam sesuai dengan peraturan perundang-undangan.\n' +
      'b. Diperbolehkan dengan syarat: tidak mengurangi dan mengubah fungsi utama kawasan serta memiliki izin pinjam pakai kawasan hutan sesuai peraturan perundang-undangan.\n' +
      'c. Tidak diperbolehkan: kegiatan pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan bersyarat, serta kegiatan yang mengganggu fungsi kawasan Taman Wisata Alam.\n' +
      'd. Intensitas dan prasarana sarana minimum: mengikuti ketentuan peraturan perundang-undangan.\n' +
      'e. Ketentuan lain-lain: meminimalkan kegiatan yang dapat mengganggu fungsi kawasan.',
    kdb: 'Sesuai peraturan',
    klb: 'Sesuai peraturan',
    kdh: 'Sesuai peraturan',
  },
  {
    namaZona: 'Badan Jalan',
    isiKuz:
      'Ketentuan Umum Zonasi Badan Jalan (Pasal 75 Permen ATR/BPN No. 11/2024):\n' +
      'a. Kegiatan diperbolehkan: pengembangan prasarana pelengkap jalan sesuai dengan kondisi dan kelas jalan.\n' +
      'b. Kegiatan diperbolehkan dengan syarat: pembangunan utilitas kota termasuk penanaman pohon, dan pembangunan fasilitas pendukung jalan lainnya yang tidak mengganggu kelancaran lalu lintas.\n' +
      'c. Kegiatan tidak diperbolehkan: memanfaatkan ruang milik jalan, ruang manfaat jalan, dan ruang pengawasan jalan yang mengakibatkan terganggunya kelancaran lalu lintas dan keselamatan pengguna jalan.\n' +
      'd. Prasarana sarana minimum: prasarana pelengkap jalan, rambu lalu lintas, dan bangunan pengamanan jalan.',
    kdb: '-',
    klb: '-',
    kdh: '-',
  },
  {
    namaZona: 'Kawasan Hutan Produksi Tetap',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Hutan Produksi Tetap (Pasal 76 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: kegiatan perlindungan Kawasan Hutan Produksi sesuai dengan peraturan perundang-undangan.\n' +
      'b. Diperbolehkan dengan syarat: tidak mengurangi dan mengubah fungsi utama kawasan serta memiliki izin pinjam pakai kawasan hutan sesuai peraturan perundang-undangan.\n' +
      'c. Tidak diperbolehkan: kegiatan pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan bersyarat, serta kegiatan yang mengganggu fungsi Kawasan Hutan Produksi.\n' +
      'd. Intensitas dan prasarana sarana minimum: mengikuti ketentuan peraturan perundang-undangan.\n' +
      'e. Ketentuan lain-lain: meminimalkan kegiatan yang dapat mengganggu fungsi kawasan.',
    kdb: 'Sesuai peraturan',
    klb: 'Sesuai peraturan',
    kdh: 'Sesuai peraturan',
  },
  {
    namaZona: 'Kawasan Tanaman Pangan',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Tanaman Pangan (Pasal 77 ayat 2 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: kegiatan RTH dan sarana prasarana pendukung Kawasan Tanaman Pangan.\n' +
      'b. Diperbolehkan dengan syarat (pada lahan pertanian tidak produktif, aksesibilitas mudah, pembatasan jumlah pengembangan): rumah tinggal, fasilitas umum, perdagangan dan jasa, perkantoran, wisata, gudang, sarana transportasi, instalasi utilitas, khusus industri terbatas pada eksisting, industri/usaha mikro-kecil atau berbahan baku/lokasi khusus, pertambangan sesuai peraturan; serta kegiatan yang tidak menghilangkan fungsi pangan (hortikultura, perkebunan, perikanan, peternakan).\n' +
      'c. Tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan dengan syarat.\n' +
      'd. Prasarana minimum: jaringan irigasi, jaringan jalan, jaringan listrik, dan jaringan air baku.\n' +
      'e. Ketentuan lain-lain: pengembangan pada KP2B mengikuti peraturan perundang-undangan; kegiatan non-pertanian diprioritaskan pada sisi koridor jalan utama; pada kawasan bertampalan Lahan Sawah Dilindungi (LSD) wajib mendapat rekomendasi sesuai peraturan perundang-undangan.',
    kdb: '60%',
    klb: '1,8',
    kdh: '10%',
  },
  {
    namaZona: 'Kawasan Hortikultura',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Hortikultura (Pasal 77 ayat 3 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: kegiatan RTH dan sarana prasarana pendukung Kawasan Hortikultura.\n' +
      'b. Diperbolehkan dengan syarat (pada lahan tidak produktif, aksesibilitas mudah, pembatasan jumlah pengembangan): rumah tinggal, fasilitas umum, perdagangan dan jasa, perkantoran, wisata, gudang, tanaman pangan, perkebunan, peternakan, perikanan, industri/usaha mikro-kecil atau berbahan baku/lokasi khusus, pertambangan sesuai peraturan, dan instalasi utilitas.\n' +
      'c. Tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan dengan syarat.\n' +
      'd. Prasarana minimum: jaringan irigasi, jaringan jalan, jaringan listrik, jaringan air baku.\n' +
      'e. Ketentuan lain-lain: penggunaan lahan hortikultura untuk kegiatan lain diperbolehkan selama tidak mengganggu produk unggulan daerah dan merusak lingkungan hidup; pada kawasan bertampalan LSD wajib mendapat rekomendasi sesuai peraturan perundang-undangan.',
    kdb: '60%',
    klb: '6',
    kdh: '10%',
  },
  {
    namaZona: 'Kawasan Perkebunan',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Perkebunan (Pasal 77 ayat 4 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: RTH dan sarana prasarana pendukung Kawasan Perkebunan.\n' +
      'b. Diperbolehkan dengan syarat (lokasi beraksesibilitas mudah dengan pembatasan jumlah pengembangan): rumah tinggal, fasilitas umum, perdagangan dan jasa, perkantoran, wisata, gudang, tanaman pangan, hortikultura, peternakan, perikanan, industri/usaha mikro-kecil atau berbahan baku/lokasi khusus, pertambangan sesuai peraturan, dan instalasi utilitas.\n' +
      'c. Tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan dengan syarat.\n' +
      'd. Prasarana minimum: jaringan irigasi, jaringan jalan, jaringan listrik, dan jaringan air baku.\n' +
      'e. Ketentuan lain-lain: perubahan penggunaan lahan perkebunan diperbolehkan selama tidak mengganggu produksi perkebunan dan merusak lingkungan hidup; pada kawasan bertampalan LSD wajib mendapat rekomendasi sesuai peraturan perundang-undangan.',
    kdb: '60%',
    klb: '6',
    kdh: '15%',
  },
  {
    namaZona: 'Kawasan Peternakan',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Peternakan (Pasal 77 ayat 5 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: RTH dan sarana prasarana pendukung Kawasan Peternakan.\n' +
      'b. Diperbolehkan dengan syarat (lokasi beraksesibilitas mudah, pembatasan jumlah pengembangan, dan menjaga jarak aman dengan Kawasan Peternakan): rumah tinggal, fasilitas umum, wisata, gudang, tanaman pangan, hortikultura, perkebunan, peternakan, perikanan, industri/usaha mikro-kecil atau berbahan baku/lokasi khusus, pertambangan sesuai peraturan, dan instalasi utilitas.\n' +
      'c. Tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan dengan syarat.\n' +
      'd. Prasarana minimum: infrastruktur penunjang peternakan dan pengolahan limbah.\n' +
      'e. Ketentuan lain-lain: kegiatan selain peternakan diperbolehkan selama tidak mengganggu produksi peternakan dan merusak lingkungan; pada kawasan bertampalan LSD wajib mendapat rekomendasi sesuai peraturan perundang-undangan.',
    kdb: '60%',
    klb: '6',
    kdh: '15%',
  },
  {
    namaZona: 'Kawasan Perikanan Budi Daya',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Perikanan Budi Daya (Pasal 78 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: penelitian dan pengembangan, usaha pembenihan dan pembesaran ikan budidaya, sentra pemasaran hasil perikanan budidaya, RTH, dan bangunan penunjang perikanan.\n' +
      'b. Diperbolehkan dengan syarat (aksesibilitas mudah & pembatasan pengembangan): pertanian, perkebunan, rumah tinggal, fasilitas umum, perdagangan dan jasa, perkantoran, wisata, gudang, peternakan, industri/usaha mikro-kecil atau berbahan baku/lokasi khusus, dan instalasi utilitas.\n' +
      'c. Tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan/bersyarat dan kegiatan yang berdampak negatif terhadap keseimbangan ekologis.\n' +
      'd. Prasarana minimum: sarana dan prasarana pendukung budidaya ikan dan pengolahan limbah.\n' +
      'e. Ketentuan lain-lain: perubahan penggunaan lahan diperbolehkan selama tidak mengganggu produksi perikanan dan berdampak limbah; pada kawasan bertampalan LSD wajib mendapat rekomendasi sesuai peraturan perundang-undangan.',
    kdb: '60%',
    klb: '6',
    kdh: '15%',
  },
  {
    namaZona: 'Kawasan Pembangkitan Tenaga Listrik',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Pertambangan dan Energi berupa Kawasan Pembangkitan Tenaga Listrik (Pasal 79 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: kegiatan pembangkit tenaga listrik dan sarana penunjangnya.\n' +
      'b. Diperbolehkan dengan syarat (dibatasi jumlah pengembangan dan tidak mengganggu keamanan serta operasional pembangkit): RTH, industri berbahan baku/lokasi khusus, rumah tinggal, dan fasilitas umum.\n' +
      'c. Tidak diperbolehkan: selain yang diperbolehkan/bersyarat dan kegiatan yang menimbulkan gangguan keamanan/operasional Kawasan Pembangkitan Tenaga Listrik.\n' +
      'd. Prasarana minimum: sempadan jalur hijau, bangunan penunjang pembangkitan listrik, kantor pengelola, balai penelitian, dan rambu/penanda kawasan.\n' +
      'e. Ketentuan lain-lain: pembangkit dan jaringan listrik tidak mengganggu fungsi utama, tidak mengubah bentang alam, serta pada kawasan bertampalan LSD wajib mendapat rekomendasi sesuai peraturan perundang-undangan.',
    kdb: '50%',
    klb: '5',
    kdh: '20%',
  },
  {
    namaZona: 'Kawasan Peruntukan Industri',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Peruntukan Industri (Pasal 80 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: perkantoran pendukung industri, pergudangan, dan prasarana pendukung industri.\n' +
      'b. Diperbolehkan dengan syarat (pembatasan jumlah pengembangan dan jarak aman bagi kegiatan berisiko kebakaran): rumah tinggal, perumahan pendukung industri, perdagangan jasa, perkantoran, fasilitas umum, sarana transportasi, instalasi utilitas, pertanian, perkebunan, perikanan, peternakan, pertambangan, dan pertahanan keamanan. Kegiatan bersebelahan dengan kawasan latihan PUSLATPUR TNI-AL wajib mendapat rekomendasi berwenang, menyediakan zona penyangga tanaman keras min. 500 m di sebelah timur, dinding pembatas aman, dan bukan industri berbahaya.\n' +
      'c. Tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan dengan syarat.\n' +
      'd. Prasarana minimum: akses jalan utama min. lebar 9 m, jaringan energi, air, drainase, pembuangan limbah, IPAL, jaringan gas, telekomunikasi, pemadam kebakaran, parkir, area bongkar muat, sarana peribadatan, dan RTH.\n' +
      'e. Ketentuan lain-lain: wajib memiliki daerah penyangga dengan permukiman, izin lingkungan, jalur hijau, mengupayakan sumber air selain air tanah (penggunaan air tanah wajib kajian/rekomendasi), serta pada kawasan bertampalan LSD wajib rekomendasi sesuai peraturan.',
    kdb: '60%',
    klb: '6',
    kdh: '20%',
  },
  {
    namaZona: 'Kawasan Pariwisata',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Pariwisata (Pasal 81 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: pemanfaatan kegiatan pariwisata.\n' +
      'b. Diperbolehkan dengan syarat (pembatasan pengembangan dan tidak mengganggu Kawasan Pariwisata / menjadi penunjang wisata): RTH, perdagangan jasa, perkantoran pendukung wisata, sarana transportasi, instalasi utilitas & jaringan prasarana wisata, rumah tinggal pendukung wisata, dan sarana pendukung wisata.\n' +
      'c. Tidak diperbolehkan: selain yang diperbolehkan/bersyarat dan kegiatan yang menimbulkan gangguan terhadap Kawasan Pariwisata.\n' +
      'd. Prasarana minimum: parkir, kantor pengelola, sarana dan prasarana pendukung wisata, serta papan informasi.\n' +
      'e. Ketentuan lain-lain: perubahan penggunaan lahan diperbolehkan selama tidak mengganggu fungsi pariwisata; pada kawasan bertampalan LSD wajib mendapat rekomendasi sesuai peraturan perundang-undangan.',
    kdb: '50%',
    klb: '5',
    kdh: '20%',
  },
  {
    namaZona: 'Kawasan Permukiman Perkotaan',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Permukiman Perkotaan (Pasal 82 ayat 2 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: rumah tinggal, perumahan, RTH, dan prasarana penunjang.\n' +
      'b. Diperbolehkan dengan syarat (pembatasan jumlah pengembangan dan tidak mengganggu lingkungan / menjadi penunjang permukiman): perdagangan jasa, perkantoran, fasilitas umum, sarana transportasi, instalasi utilitas & jaringan prasarana, pertanian, perikanan, gudang, peternakan sesuai ketentuan, dan industri/usaha mikro-kecil atau berbahan baku/lokasi khusus.\n' +
      'c. Tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan dengan syarat.\n' +
      'd. Prasarana minimum: RTH, kemudahan akses, sarana pelayanan umum, jaringan energi, jaringan telekomunikasi, serta jaringan/sarana/prasarana permukiman.\n' +
      'e. Ketentuan lain-lain: perbaikan permukiman kumuh partisipatif, mempertahankan cagar budaya, memperhatikan kaidah kebencanaan pada KRB/perlindungan setempat, wajib menyediakan RTH min. 10% dari luas bidang pada kawasan terbangun, serta pada kawasan bertampalan LSD wajib rekomendasi sesuai peraturan.',
    kdb: '70%',
    klb: '10',
    kdh: '10%',
  },
  {
    namaZona: 'Kawasan Permukiman Perdesaan',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Permukiman Perdesaan (Pasal 82 ayat 3 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: rumah tinggal, perumahan, RTH, dan prasarana penunjang.\n' +
      'b. Diperbolehkan dengan syarat (dibatasi pembatasan pengembangan dan kegiatan industri tidak mengganggu lingkungan): kegiatan perdagangan jasa, perkantoran, fasilitas umum, sarana transportasi, instalasi utilitas, pertanian, perikanan, gudang, peternakan sesuai ketentuan, dan industri/usaha mikro-kecil atau berbahan baku/lokasi khusus.\n' +
      'c. Tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan dengan syarat.\n' +
      'd. Prasarana minimum: RTH, kemudahan akses, sarana pelayanan umum, jaringan energi, telekomunikasi, dan prasarana permukiman.\n' +
      'e. Ketentuan lain-lain: memperhatikan kaidah kebencanaan pada KRB/perlindungan setempat, wajib menyediakan RTH min. 10% dari luas bidang pada kawasan terbangun, serta pada kawasan bertampalan LSD wajib mendapat rekomendasi sesuai peraturan perundang-undangan.',
    kdb: '60%',
    klb: '6',
    kdh: '10%',
  },
  {
    namaZona: 'Kawasan Pertahanan dan Keamanan',
    isiKuz:
      'Ketentuan Umum Zonasi Kawasan Pertahanan dan Keamanan (Pasal 83 Permen ATR/BPN No. 11/2024):\n' +
      'a. Diperbolehkan: kegiatan fasilitas penunjang pertahanan dan keamanan serta RTH.\n' +
      'b. Diperbolehkan dengan syarat: kegiatan selain pertahanan dan keamanan serta pendukungnya sesuai peraturan perundang-undangan.\n' +
      'c. Tidak diperbolehkan: pemanfaatan lahan selain yang diperbolehkan dan diperbolehkan dengan syarat.\n' +
      'd. Intensitas dan prasarana sarana minimum: diatur oleh lembaga yang berwenang sesuai peraturan perundang-undangan.\n' +
      'e. Ketentuan lain-lain: komplek rumah dinas militer dilengkapi sarana pelayanan umum sesuai skala pelayanan, dan mengupayakan jarak aman untuk mencegah konflik dengan kegiatan lainnya.',
    kdb: 'Diatur instansi berwenang',
    klb: 'Diatur instansi berwenang',
    kdh: 'Diatur instansi berwenang',
  },
];

/**
 * Database Resmi Indikasi Arahan Zonasi (IAZ) Pola Ruang Provinsi Jawa Timur
 * Sumber: Perda Provinsi Jawa Timur Nomor 10 Tahun 2023 tentang RTRW Provinsi Jawa Timur Tahun 2023–2043
 * (BAB IV Rencana Pola Ruang Pasal 51–71 & BAB VII Paragraf 3 Indikasi Arahan Zonasi Pola Ruang Pasal 96–114)
 */
export const OFFICIAL_KUZ_PROV_JATIM: ZonaProv[] = [
  {
    namaZona: 'Kawasan yang Memberikan Perlindungan Terhadap Kawasan Bawahannya (Hutan Lindung)',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan yang Memberikan Perlindungan Terhadap Kawasan Bawahannya / Hutan Lindung (Pasal 97 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: pemanfaatan Hutan Lindung berupa konservasi dan perlindungan hutan, rehabilitasi hutan terdegradasi sebagai resapan air, wisata alam, penelitian/ilmu pengetahuan, jasa lingkungan, pemungutan hasil hutan bukan kayu tanpa mengurangi fungsi utama, lokasi evakuasi bencana tanpa mengubah bentang alam, serta pembangunan non-kehutanan tanpa mengubah fungsi pokok sesuai ketentuan peraturan.\n' +
      '2. Diperbolehkan dengan syarat: kegiatan strategis di luar kehutanan melalui persetujuan penggunaan kawasan hutan; perubahan peruntukan/fungsi wajib penetapan Menteri LHK; pertambangan hanya pola bawah tanah sesuai peraturan.\n' +
      '3. Dilarang/tidak diperbolehkan: pertambangan pola terbuka serta kegiatan budi daya baru/pengembangan yang mengganggu fungsi lindung dan pelestarian hutan.\n' +
      '4. Ketentuan terkait KP2B/PIPPIB dan Geopark mengikuti peraturan perundang-undangan bidang kehutanan serta daya dukung dan daya tampung lingkungan.',
  },
  {
    namaZona: 'Kawasan Perlindungan Setempat',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Perlindungan Setempat (Pasal 98 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: kegiatan RTH, pengembangan struktur alami dan buatan untuk kawasan perlindungan setempat, penelitian, pariwisata berbasis ekologis, pendidikan, serta pengembangan jalur evakuasi bencana.\n' +
      '2. Diperbolehkan dengan syarat: pembangunan sarana dan prasarana pendukung fungsi RTH dengan tetap memperhatikan kelestarian RTH; pengembangan jaringan prasarana wilayah serta penanggulangan bencana tanpa mencemari lingkungan.\n' +
      '3. Tidak diperbolehkan: kegiatan yang berpotensi mengganggu kelestarian dan kekhasan RTH/sempadan.\n' +
      '4. Ketentuan sempadan pantai, sungai, waduk/danau mengikuti ketentuan khusus Pasal 121 Perda Prov. Jatim No. 10/2023.',
  },
  {
    namaZona: 'Kawasan Konservasi',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Konservasi (Pasal 99 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: penelitian dan pengembangan ilmu pengetahuan, pendidikan konservasi alam, wisata alam tanpa mengubah bentang alam, penyerapan karbon, pemanfaatan air serta energi air/panas/angin, pemanfaatan plasma nutfah, serta permukiman penduduk eksisting dengan metode enklave.\n' +
      '2. Diperbolehkan pada Zona Pemanfaatan Terbatas: penangkapan ikan ramah keberlanjutan, budi daya ikan sesuai daya dukung, dan pariwisata alam perairan ramah lingkungan.\n' +
      '3. Diperbolehkan dengan syarat: bangunan fungsi penelitian/pendidikan/penunjang budi daya serta pengembangan geoheritage Geopark tanpa merusak bentang alam.\n' +
      '4. Tidak diperbolehkan: kegiatan yang menyebabkan perubahan bentang alam, mengganggu tumbuhan/satwa, dan merusak kekhasan obyek perlindungan.',
  },
  {
    namaZona: 'Kawasan Pencadangan Konservasi di Laut',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Pencadangan Konservasi di Laut (Pasal 100 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: pelaksanaan adat istiadat/ritual keagamaan serta pelayaran rakyat dan nelayan kecil pada Zona Pemanfaatan Terbatas.\n' +
      '2. Diperbolehkan dengan syarat: pariwisata alam perairan, penempatan bangunan/instalasi laut berizin, perikanan tangkap nelayan lokal/kapasitas tertentu, dan perikanan budi daya pada Zona Pemanfaatan Terbatas.\n' +
      '3. Tidak diperbolehkan: wisata alam perairan pada kawasan suaka, reklamasi, pertambangan minerba metode terbuka, pembuangan (dumping), dan pembuangan air ballast kapal.',
  },
  {
    namaZona: 'Kawasan Lindung Geologi',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Lindung Geologi / Cagar Alam Geologi (Pasal 101 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: rehabilitasi, revitalisasi, peningkatan fungsi lindung cagar alam geologi, serta penelitian/ilmu pengetahuan tanpa merusak komponen geologi dan ekosistemnya.\n' +
      '2. Diperbolehkan dengan syarat: wisata alam tanpa mengubah bentang alam dan pengembangan warisan geologi (geoheritage) menjadi Geopark.\n' +
      '3. Tidak diperbolehkan: kegiatan lainnya yang berpotensi mengganggu maupun merusak komponen geologi dan ekosistemnya.',
  },
  {
    namaZona: 'Kawasan Ekosistem Mangrove',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Ekosistem Mangrove (Pasal 102 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: wisata alam, penelitian dan ilmu pengetahuan, kegiatan pelindung pantai dari pengikisan air laut, perlindungan dan rehabilitasi mangrove, serta latihan militer tanpa merusak ekosistem mangrove.\n' +
      '2. Diperbolehkan dengan syarat: budi daya dengan mempertahankan kelestarian sumber air dan hayati, bangunan pelindung pantai, pemungutan hasil hutan bukan kayu, perikanan tangkap/budi daya tradisional, pariwisata air, dan pembangunan pelabuhan sesuai peraturan.\n' +
      '3. Tidak diperbolehkan: kegiatan yang merusak/mengubah/mengurangi luas/mencemari ekosistem mangrove serta pertambangan tanpa izin.',
  },
  {
    namaZona: 'Kawasan Hutan Produksi',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Hutan Produksi (Pasal 103 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: pemanfaatan kawasan hutan, jasa lingkungan, hasil hutan kayu/bukan kayu berizin, reboisasi, penghijauan, kegiatan budi daya yang menjamin kelestarian sumber air dan hayati.\n' +
      '2. Diperbolehkan dengan syarat: pendirian bangunan penunjang pemanfaatan hasil hutan, penggunaan kawasan hutan di luar kehutanan dengan persetujuan/izin peraturan bidang kehutanan, serta kegiatan pertambangan sesuai peraturan kehutanan.\n' +
      '3. Tidak diperbolehkan: kegiatan yang merusak serius/menghilangkan fungsi hutan, penebangan pohon tanpa izin, dan eksplorasi/eksploitasi tanpa izin.',
  },
  {
    namaZona: 'Kawasan Perkebunan Rakyat',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Perkebunan Rakyat (Pasal 104 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: kegiatan budi daya yang menjamin kelestarian sumber air dan kekayaan hayati tetap dipertahankan, rehabilitasi lahan hutan, serta pengawasan dan penilaian kawasan.\n' +
      '2. Diperbolehkan dengan syarat: pemanfaatan hasil hutan kayu/bukan kayu dan jasa lingkungan sesuai fungsi dan atas persetujuan pemegang hak atas tanah; pengembangan prasarana wilayah/kepentingan umum tanpa mencemari lingkungan.\n' +
      '3. Ketentuan pemanfaatan: dilakukan oleh pemegang hak atas tanah sesuai fungsinya; tidak diperbolehkan eksplorasi/eksploitasi tanpa izin pemegang hak atas tanah dan pihak terkait.\n' +
      '4. Intensitas ruang mempertimbangkan fungsi ekologis, daya dukung lahan, kerawanan bencana, KKOP, dan keselamatan bangunan gedung.',
  },
  {
    namaZona: 'Kawasan Pertanian',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Pertanian (Pasal 105 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: pertanian tanaman pangan, peternakan, hortikultura, perkebunan, perikanan budi daya sistem mina padi, RTH, serta pendirian bangunan penunjang Kawasan Agropolitan.\n' +
      '2. Diperbolehkan dengan syarat: pemanfaatan ruang untuk permukiman kepadatan rendah dan fungsi ruang lain terutama pada lahan pertanian yang tidak berada pada Lahan Sawah yang Dilindungi (LSD); penunjang pertanian, wisata alam/ekowisata, penelitian, pendidikan, mina padi, serta pertambangan/migas sesuai peraturan.\n' +
      '3. Dilarang: mengalihfungsikan LP2B selain untuk kegiatan pertanian kecuali bagi pembangunan Kepentingan Umum dan/atau Proyek Strategis Nasional serta kepentingan bencana sesuai peraturan.\n' +
      '4. Tidak diperbolehkan: aktivitas budi daya yang mengurangi luas sawah beririgasi dan/atau memutus jaringan irigasi. Pada lahan LSD hanya diperbolehkan mendukung ketahanan pangan sesuai ketentuan.',
  },
  {
    namaZona: 'Kawasan Perikanan',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Perikanan / Kawasan Minapolitan (Pasal 106 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Perikanan Budi Daya — Diperbolehkan: kegiatan perikanan darat/laut, non-perikanan penunjang Minapolitan, permukiman perdesaan kepadatan rendah & pertanian/perkebunan tahunan sekitar tambak tanpa mengganggu produktivitas, ekowisata/penelitian, infrastruktur transportasi laut/pelabuhan perikanan, dan sarana produksi garam.\n' +
      '2. Diperbolehkan dengan syarat: kegiatan pariwisata sesuai ketentuan peraturan perundang-undangan.\n' +
      '3. Tidak diperbolehkan: kawasan budi daya yang mengganggu produktivitas perikanan/garam dan aktivitas yang mencemari kualitas air sungai, waduk, pantai, atau rawa.\n' +
      '4. Perikanan Tangkap: menjaga kelestarian mangrove & terumbu karang, menghormati area penangkapan ikan tradisional, dan melarang alat tangkap merusak serta pembuangan limbah B3.',
  },
  {
    namaZona: 'Kawasan Pergaraman',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Pergaraman (Pasal 107 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: pemanfaatan ruang untuk kegiatan pergaraman, sarana prasarana pendukung pergaraman, dan pemanfaatan sumber daya perikanan dengan memperhatikan kelestariannya.\n' +
      '2. Diperbolehkan dengan syarat: fasilitas pendukung pergaraman, penelitian, UMKM pendukung pergaraman, permukiman, jaringan prasarana wilayah, serta penyediaan inlet air laut bebas pencemaran.\n' +
      '3. Tidak diperbolehkan: kegiatan yang mengganggu fungsi kawasan sebagai Kawasan Pergaraman.',
  },
  {
    namaZona: 'Kawasan Pertambangan dan Energi',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Pertambangan dan Energi (Pasal 108 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: kegiatan eksplorasi, eksploitasi, penelitian/pengembangan iptek, serta sarana prasarana pendukung pertambangan sesuai ketentuan teknis dan peraturan perundang-undangan.\n' +
      '2. Diperbolehkan dengan syarat: kegiatan budi daya lainnya yang tidak mengganggu aktivitas pertambangan dan tidak mengubah bentang alam, industri terkait pengelolaan pertambangan/energi, reklamasi dan pascatambang sesuai dokumen lingkungan, serta perizinan berusaha di luar pertambangan sesuai ketentuan.\n' +
      '3. Prasarana minimal: fasilitas dan infrastruktur penunjang kegiatan pertambangan dan energi.',
  },
  {
    namaZona: 'Kawasan Peruntukan Industri',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Peruntukan Industri (Pasal 109 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: kegiatan industri dan perkantoran pendukung industri beserta infrastruktur dasar.\n' +
      '2. Diperbolehkan dengan syarat: permukiman buruh/karyawan kepadatan rendah-sedang dan penunjang lain; infrastruktur transportasi, pelabuhan perikanan, energi, telekomunikasi, SDA, serta kegiatan reklamasi WP-3-K berizin.\n' +
      '3. Tidak diperbolehkan: kegiatan pemanfaatan ruang yang dapat mengganggu aktivitas perindustrian.\n' +
      '4. Ketentuan khusus: dapat dilengkapi jalur hijau (greenbelt)/RTH penyangga; di sepanjang jalan arteri/kolektor primer wajib dilengkapi frontage road; wajib dokumen lingkungan; industri pengolahan diarahkan ramah lingkungan dan padat modal; sentra IKM terintegrasi tanpa mengganggu permukiman.',
  },
  {
    namaZona: 'Kawasan Pariwisata',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Pariwisata (Pasal 110 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: pembangunan pariwisata dan fasilitas penunjang pariwisata, kawasan pencadangan konservasi di laut, penangkapan ikan tradisional/kapasitas tertentu, dan pemanfaatan ruang lain dengan syarat tidak mengganggu bentang alam serta daya tarik pariwisata.\n' +
      '2. Tidak diperbolehkan: kegiatan dan penggunaan lahan yang mengganggu dan mengurangi kualitas daya tarik wisata maupun fungsi konservasi.\n' +
      '3. Prasarana minimal: infrastruktur dasar, lokasi dan jalur evakuasi bencana, dan RTH.\n' +
      '4. Intensitas pemanfaatan ruang mempertimbangkan fungsi ekologis, daya dukung lahan, kerawanan bencana, KKOP, serta karakter daya tarik wisata.',
  },
  {
    namaZona: 'Kawasan Permukiman',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Permukiman (Pasal 111 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: pengembangan kegiatan permukiman beserta sarana prasarana pendukung (RTH, fasilitas umum, fasilitas sosial, fasilitas ekonomi sesuai skala), kegiatan penunjang permukiman, serta pariwisata dan transportasi yang bersinergis.\n' +
      '2. Diperbolehkan dengan syarat: pengembangan industri dan pertambangan dengan memperhatikan radius aman terhadap Kawasan Permukiman sesuai peraturan.\n' +
      '3. Tidak diperbolehkan: pengembangan Kawasan Permukiman yang menyebabkan alih fungsi LP2B dan Kawasan Lindung.\n' +
      '4. Ketentuan lainnya: penyediaan RTH secara proporsional setidaknya 30% dari Kawasan Permukiman; pengembangan vertikal di kawasan perkotaan; intensitas KDB/KLB/sempadan diatur pada rencana lebih rinci.',
  },
  {
    namaZona: 'Kawasan Pembuangan Hasil Pengerukan di Laut',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Pembuangan Hasil Pengerukan di Laut (Pasal 112 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: pemanfaatan ruang untuk kegiatan pembuangan material setelah memperoleh izin berdasarkan ketentuan peraturan perundang-undangan.\n' +
      '2. Diperbolehkan dengan syarat: pengembangan sistem jaringan transportasi, energi, telekomunikasi, sumber daya air, dan prasarana lainnya.\n' +
      '3. Tidak diperbolehkan: kegiatan yang menimbulkan dampak terhadap daerah sensitif (konservasi laut, wisata bahari, mangrove, lamun, terumbu karang, KRB, alur migrasi/pelayaran, daerah khusus militer) dan merusak ekosistem laut.',
  },
  {
    namaZona: 'Kawasan Transportasi',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Transportasi (Pasal 113 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Diperbolehkan: sarana transportasi, fasilitas penunjang transportasi, perdagangan dan jasa skala lingkungan, RTH dan ruang terbuka non hijau, serta perlindungan keanekaragaman hayati.\n' +
      '2. Diperbolehkan dengan syarat: perikanan tangkap terbatas, bangunan prasarana kota, perdagangan/jasa, campuran, permukiman, perkantoran, pergudangan, industri penunjang, wisata, dan kegiatan energi.\n' +
      '3. Tidak diperbolehkan: pemanfaatan ruang yang mengganggu fungsi kawasan transportasi, aktivitas mengganggu pelabuhan, wisata bawah laut, budi daya laut, dan pertambangan mineral.',
  },
  {
    namaZona: 'Kawasan Pertahanan dan Keamanan',
    isiKuz:
      'Indikasi Arahan Zonasi Kawasan Pertahanan dan Keamanan (Pasal 114 Perda Prov. Jatim No. 10/2023):\n' +
      '1. Di dalam kawasan — Diperbolehkan: seluruh kegiatan yang mendukung fungsi pertahanan dan keamanan; tidak diperbolehkan jaringan baru pipa migas/SUTET/kabel bawah tanah kecuali kepentingan strategis/vital nasional bersyarat dan kerja sama pemanfaatan ruang berizin.\n' +
      '2. Di sekitar kawasan — Kegiatan perindustrian bersebelahan (termasuk sekitar daerah Latihan Militer Grati Kab. Pasuruan) diperbolehkan bersyarat: mendapat rekomendasi/izin pihak berwenang, tidak mengganggu fungsi hankam, bukan industri B3/bahan peledak, wajib menyediakan zona penyangga (buffer zone) tanaman keras jarak minimal 500 meter, dan membangun dinding pembatas aman.\n' +
      '3. Tidak diperbolehkan: kegiatan yang mengganggu mobilisasi dan fungsi Kawasan Pertahanan dan Keamanan.',
  },
];

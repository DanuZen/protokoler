const fs = require('fs');

// Fix kegiatan controller
let c = fs.readFileSync('src/kegiatan/kegiatan.controller.ts', 'utf8');
c = c.replace(
  "import { KegiatanService, CreateKegiatanDto, UpdateKegiatanDto } from './kegiatan.service';",
  "import { KegiatanService } from './kegiatan.service';\nimport type { CreateKegiatanDto, UpdateKegiatanDto } from './kegiatan.service';"
);
fs.writeFileSync('src/kegiatan/kegiatan.controller.ts', c, 'utf8');

// Fix mahasiswa controller
c = fs.readFileSync('src/mahasiswa/mahasiswa.controller.ts', 'utf8');
c = c.replace(
  "import { MahasiswaService, CreateMahasiswaDto, UpdateMahasiswaDto } from './mahasiswa.service';",
  "import { MahasiswaService } from './mahasiswa.service';\nimport type { CreateMahasiswaDto, UpdateMahasiswaDto } from './mahasiswa.service';"
);
fs.writeFileSync('src/mahasiswa/mahasiswa.controller.ts', c, 'utf8');

// Fix penugasan controller
c = fs.readFileSync('src/penugasan/penugasan.controller.ts', 'utf8');
c = c.replace(
  "import { PenugasanService, CreatePenugasanDto, UpdatePenugasanDto } from './penugasan.service';",
  "import { PenugasanService } from './penugasan.service';\nimport type { CreatePenugasanDto, UpdatePenugasanDto } from './penugasan.service';"
);
fs.writeFileSync('src/penugasan/penugasan.controller.ts', c, 'utf8');

console.log('Fixed imports');

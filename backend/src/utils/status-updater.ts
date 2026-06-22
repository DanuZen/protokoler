import { StatusKegiatanEnum } from '@prisma/client';

export async function autoUpdateStatuses(prisma: any) {
  const now = new Date();

  // Find all active/pending events that need evaluation
  const events = await prisma.kegiatan.findMany({
    where: {
      status: {
        in: [
          StatusKegiatanEnum.publik,
          StatusKegiatanEnum.terjadwal,
          StatusKegiatanEnum.terkonfirmasi,
          StatusKegiatanEnum.berlangsung,
        ],
      },
    },
  });

  for (const keg of events) {
    const year = keg.tanggal.getFullYear();
    const month = keg.tanggal.getMonth();
    const date = keg.tanggal.getDate();

    const startHours = keg.jam_mulai.getHours();
    const startMinutes = keg.jam_mulai.getMinutes();

    const endHours = keg.jam_selesai.getHours();
    const endMinutes = keg.jam_selesai.getMinutes();

    const startDateTime = new Date(year, month, date, startHours, startMinutes, 0);
    const endDateTime = new Date(year, month, date, endHours, endMinutes, 0);

    let newStatus: StatusKegiatanEnum | null = null;

    if (now >= endDateTime) {
      if (keg.status !== StatusKegiatanEnum.selesai) {
        newStatus = StatusKegiatanEnum.selesai;
      }
    } else if (now >= startDateTime) {
      if (keg.status !== StatusKegiatanEnum.berlangsung) {
        newStatus = StatusKegiatanEnum.berlangsung;
      }
    }

    if (newStatus) {
      await prisma.kegiatan.update({
        where: { id: keg.id },
        data: { status: newStatus },
      });
      console.log(`Auto-updated kegiatan "${keg.nama_kegiatan}" status from ${keg.status} to ${newStatus}`);
    }
  }
}

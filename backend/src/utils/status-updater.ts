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
          StatusKegiatanEnum.selesai,
        ],
      },
    },
  });

  for (const keg of events) {
    const startYear = keg.tanggal.getUTCFullYear();
    const startMonth = keg.tanggal.getUTCMonth();
    const startDate = keg.tanggal.getUTCDate();

    const endDateRef = keg.tanggal_selesai ? keg.tanggal_selesai : keg.tanggal;
    const endYear = endDateRef.getUTCFullYear();
    const endMonth = endDateRef.getUTCMonth();
    const endDate = endDateRef.getUTCDate();

    const startHours = keg.jam_mulai.getUTCHours();
    const startMinutes = keg.jam_mulai.getUTCMinutes();

    const endHours = keg.jam_selesai.getUTCHours();
    const endMinutes = keg.jam_selesai.getUTCMinutes();

    // Event is in WIB (+07:00), so we subtract 7 hours from the constructed UTC timestamp to get correct UTC Date
    const startDateTime = new Date(Date.UTC(startYear, startMonth, startDate, startHours, startMinutes, 0) - 7 * 60 * 60 * 1000);
    let endDateTime = new Date(Date.UTC(endYear, endMonth, endDate, endHours, endMinutes, 0) - 7 * 60 * 60 * 1000);

    // If end time is earlier than or equal to start time and dates are the same, the event crosses midnight (ends on the next day)
    if (endDateTime <= startDateTime) {
      endDateTime.setUTCDate(endDateTime.getUTCDate() + 1);
    }

    let newStatus: StatusKegiatanEnum | null = null;

    if (now >= endDateTime) {
      if (keg.status !== StatusKegiatanEnum.selesai) {
        newStatus = StatusKegiatanEnum.selesai;
      }
    } else if (now >= startDateTime) {
      if (keg.status !== StatusKegiatanEnum.berlangsung) {
        newStatus = StatusKegiatanEnum.berlangsung;
      }
    } else {
      if (keg.status !== StatusKegiatanEnum.terjadwal) {
        newStatus = StatusKegiatanEnum.terjadwal;
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

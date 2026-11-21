import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, initDb } from './client.js';
import { PTGS, LYN, PLGN } from './schema.js';

async function seed() {
  console.log('--- Memulai Seeding Basis Data Laundry ---');
  await initDb();

  // 1. Seed Akun Petugas (Admin, Kasir, Operasional)
  const users = [
    {
      id_ptgs: 'PTG-001',
      nm_ptgs: 'Administrator Laundry',
      usernm: 'admin',
      passwd: 'admin123',
      level: 'Admin' as const,
    },
    {
      id_ptgs: 'PTG-002',
      nm_ptgs: 'Kasir Meja Depan',
      usernm: 'kasir',
      passwd: 'kasir123',
      level: 'Kasir' as const,
    },
    {
      id_ptgs: 'PTG-003',
      nm_ptgs: 'Petugas Cuci & Setrika',
      usernm: 'operasional',
      passwd: 'opera123',
      level: 'Operasional' as const,
    },
  ];

  for (const u of users) {
    const existing = await db
      .select({ id_ptgs: PTGS.id_ptgs })
      .from(PTGS)
      .where(eq(PTGS.usernm, u.usernm))
      .limit(1);

    if (existing.length === 0) {
      const hash = bcrypt.hashSync(u.passwd, 10);
      await db.insert(PTGS).values({
        id_ptgs: u.id_ptgs,
        nm_ptgs: u.nm_ptgs,
        usernm: u.usernm,
        passwd: hash,
        level: u.level,
      });
      console.log(`+ Petugas dibuat: ${u.usernm} (${u.level})`);
    } else {
      console.log(`= Petugas sudah ada: ${u.usernm}`);
    }
  }

  // 2. Seed Layanan Master (LYN)
  const layanans = [
    { id_lyn: 'LYN-001', nm_lyn: 'Cuci Kering Kiloan', hrg_kg: 7000, est_hari: 2 },
    { id_lyn: 'LYN-002', nm_lyn: 'Cuci Setrika Kiloan', hrg_kg: 10000, est_hari: 3 },
    { id_lyn: 'LYN-003', nm_lyn: 'Cuci Express 1 Hari', hrg_kg: 15000, est_hari: 1 },
    { id_lyn: 'LYN-004', nm_lyn: 'Cuci Selimut', hrg_kg: 20000, est_hari: 3 },
  ];

  for (const l of layanans) {
    await db.insert(LYN).values(l).onConflictDoNothing();
    console.log(`+ Layanan: ${l.nm_lyn}`);
  }

  // 3. Seed Contoh Pelanggan (PLGN)
  const pelanggan = {
    id_plgn: 'PLG-0001',
    nm_plgn: 'Budi Santoso',
    no_hp: '081234567890',
    alamat: 'Jl. Margonda Raya No. 12, Depok',
  };

  await db.insert(PLGN).values(pelanggan).onConflictDoNothing();
  console.log(`+ Contoh Pelanggan: ${pelanggan.nm_plgn}`);

  console.log('--- Seeding Selesai Sukses ---');
}

seed().catch((err) => {
  console.error('Error saat seeding:', err);
  process.exit(1);
});

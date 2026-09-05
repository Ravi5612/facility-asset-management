const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Step 1: Connecting to DB...');
  const org = await prisma.organization.findFirst();
  if (!org) { console.error('No organization found!'); return; }
  const orgId = org.id;
  console.log(`Org found: ${org.name} (${orgId})`);

  // ── Load existing data into memory caches ──────────────────────────────
  console.log('Step 2: Loading existing locations...');
  const allLocs = await prisma.location.findMany({ where: { organizationId: orgId } });
  const locByCode = {};
  for (const l of allLocs) locByCode[l.code] = l;
  console.log(`  Found ${allLocs.length} existing locations`);

  console.log('Step 3: Loading existing assets...');
  const allAssets = await prisma.asset.findMany({ where: { organizationId: orgId } });
  const assetBySerial = {};
  const assetByHostname = {};
  for (const a of allAssets) {
    if (a.serialNumber) assetBySerial[a.serialNumber] = a;
    if (a.hostname) assetByHostname[a.hostname] = a;
  }
  console.log(`  Found ${allAssets.length} existing assets`);

  console.log('Step 4: Loading categories...');
  const cats = await prisma.assetCategory.findMany({ where: { organizationId: orgId } });
  const catByName = {};
  for (const c of cats) catByName[c.name] = c;

  if (!catByName['CPU']) {
    catByName['CPU'] = await prisma.assetCategory.create({ data: { organizationId: orgId, name: 'CPU', description: 'Desktop Computer' } });
    console.log('  Created CPU category');
  }
  if (!catByName['Laptop']) {
    catByName['Laptop'] = await prisma.assetCategory.create({ data: { organizationId: orgId, name: 'Laptop', description: 'Laptop Computer' } });
    console.log('  Created Laptop category');
  }

  // ── Find max existing assetCode number per prefix ──────────────────────
  let cpuMax = 1000;
  let lptMax = 1000;
  for (const a of allAssets) {
    const match = a.assetCode && a.assetCode.match(/^(CPU|LPT)-(\d+)$/i);
    if (match) {
      const num = parseInt(match[2]);
      if (match[1].toUpperCase() === 'CPU' && num > cpuMax) cpuMax = num;
      if (match[1].toUpperCase() === 'LPT' && num > lptMax) lptMax = num;
    }
  }
  console.log(`  Max CPU code: CPU-${cpuMax}, Max LPT code: LPT-${lptMax}`);
  let cpuCount = cpuMax;
  let lptCount = lptMax;

  // ── Helper: get or create location (with cache) ─────────────────────────
  async function getOrCreateLoc(name, type, parentId, explicitCode) {
    const code = explicitCode;
    if (locByCode[code]) return locByCode[code];
    const loc = await prisma.location.create({
      data: { organizationId: orgId, name, code, type, parentLocationId: parentId || null }
    });
    locByCode[code] = loc;
    return loc;
  }

  // ── Parse TSV ──────────────────────────────────────────────────────────
  console.log('Step 5: Parsing TSV file...');
  const content = fs.readFileSync(path.join(__dirname, 'import_jeeves.tsv'), 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  console.log(`  Found ${lines.length} rows`);

  let created = 0, skipped = 0, errors = 0;

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    const processName = parts[0]?.trim();
    const floorName   = parts[1]?.trim();
    const seatName    = parts[2]?.trim();
    const hostname    = parts[3]?.trim();
    const os          = parts[4]?.trim();
    const ip          = parts[5]?.trim();
    const mac         = parts[6]?.trim();
    const make        = parts[7]?.trim();
    const model       = parts[8]?.trim();
    const ramQty      = parts[9]?.trim();
    const ramType     = parts[10]?.trim();
    const processor   = parts[11]?.trim();
    const drive       = parts[12]?.trim();
    const bitlocker   = parts[13]?.trim();

    if (!floorName || !seatName) continue;

    try {
      // ── 1. Floor ──────────────────────────────────────────────────────
      const floorCode = floorName.toUpperCase().replace(/\s+/g, '-');
      const floor = await getOrCreateLoc(floorName, 'FLOOR', null, floorCode);

      // ── 2. Process (under floor) ──────────────────────────────────────
      const procCode = `${floorCode}-${processName.toUpperCase().replace(/\s+/g, '-')}`;
      const proc = await getOrCreateLoc(processName, 'ROOM', floor.id, procCode);

      // ── 3. Seat (under process) ───────────────────────────────────────
      const seatCode = `${procCode}-${seatName.toUpperCase().replace(/\s+/g, '-')}`;
      let seat = locByCode[seatCode];
      if (!seat) {
        seat = await prisma.location.create({
          data: { organizationId: orgId, name: seatName, code: seatCode, type: 'SEAT', parentLocationId: proc.id, ipAddress: ip || null }
        });
        locByCode[seatCode] = seat;
      } else if (ip && seat.ipAddress !== ip) {
        await prisma.location.update({ where: { id: seat.id }, data: { ipAddress: ip } });
        seat.ipAddress = ip;
      }

      // ── 4. Asset ──────────────────────────────────────────────────────
      const isEmpty = !hostname || hostname === 'Empty Seat' || hostname.toUpperCase() === 'HR SYSTEM';
      if (isEmpty) { skipped++; continue; }

      const isLaptop = hostname.toUpperCase().includes('LAPTOP');
      const cat = isLaptop ? catByName['Laptop'] : catByName['CPU'];
      const sn = mac || hostname;

      if (assetBySerial[sn] || assetByHostname[hostname]) {
        // Update existing asset: location + hardware details + mac + hostname
        const existing = assetBySerial[sn] || assetByHostname[hostname];
        const hw = {};
        if (os) hw['OS'] = os;
        if (make) hw['Make'] = make;
        if (model) hw['Model'] = model;
        if (ramQty) hw['RAM'] = `${ramQty}GB ${ramType || ''}`.trim();
        if (processor) hw['Processor'] = processor;
        if (drive) hw['Drive'] = drive;
        if (bitlocker) hw['Bitlocker'] = bitlocker;

        await prisma.asset.update({
          where: { id: existing.id },
          data: {
            locationId: seat.id,
            hardwareDetails: hw,
            macAddress: mac || existing.macAddress || null,
            hostname: hostname || existing.hostname || null
          }
        });
        skipped++;
        continue;
      }

      // Create new asset
      const prefix = isLaptop ? 'LPT' : 'CPU';
      const num = isLaptop ? (++lptCount + 999) : (++cpuCount + 999);
      const assetCode = `${prefix}-${num}`;

      const hw = {};
      if (os) hw['OS'] = os;
      if (make) hw['Make'] = make;
      if (model) hw['Model'] = model;
      if (ramQty) hw['RAM'] = `${ramQty}GB ${ramType || ''}`.trim();
      if (processor) hw['Processor'] = processor;
      if (drive) hw['Drive'] = drive;
      if (bitlocker) hw['Bitlocker'] = bitlocker;

      const asset = await prisma.asset.create({
        data: {
          organizationId: orgId,
          assetCode,
          name: hostname,
          categoryId: cat.id,
          serialNumber: sn,
          purchaseDate: new Date('2020-01-01'),
          purchasePrice: 0,
          locationId: seat.id,
          macAddress: mac || null,
          hostname: hostname,
          hardwareDetails: hw
        }
      });

      assetBySerial[sn] = asset;
      assetByHostname[hostname] = asset;
      created++;

      if (created % 10 === 0) console.log(`  Progress: ${created} assets created, ${skipped} skipped, ${i+1}/${lines.length} rows done`);

    } catch (e) {
      console.error(`  Row ${i+1} error: ${e.message}`);
      errors++;
    }
  }

  console.log('\n========= IMPORT COMPLETE =========');
  console.log(`✅ Assets created : ${created}`);
  console.log(`⏭  Skipped (dup/empty): ${skipped}`);
  console.log(`❌ Errors          : ${errors}`);
}

main()
  .catch(e => { console.error('Fatal error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

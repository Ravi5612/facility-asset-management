
const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workbook = xlsx.readFile('C:/Users/Ravi Rai/Downloads/Copy of The Master Inventory (1).xlsx');
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
  let cpuCat = await prisma.assetCategory.findFirst({where: {name: 'CPU'}});
  if(!cpuCat) cpuCat = await prisma.assetCategory.create({data: {name: 'CPU', organizationId: '2c31f473-d1f6-422e-816d-a4050831e9d2'}});
  
  let count = 0;
  for (const row of data) {
    if (!row['Seat Number']) continue;
    
    let floorLoc = null;
    if (row['Floor']) {
       floorLoc = await prisma.location.findFirst({where: {name: row['Floor'], type: 'FLOOR'}});
       if (!floorLoc) {
         floorLoc = await prisma.location.create({
           data: {
             name: row['Floor'],
             code: 'FLR-' + Math.floor(Math.random()*10000000),
             type: 'FLOOR',
             organizationId: '2c31f473-d1f6-422e-816d-a4050831e9d2'
           }
         });
       }
    }

    let deskLoc = await prisma.location.findFirst({where: {name: String(row['Seat Number']), type: 'DESK', parentLocationId: floorLoc?.id || null}});
    if (!deskLoc) {
      deskLoc = await prisma.location.create({
        data: {
          name: String(row['Seat Number']),
          code: 'DSK-' + Math.floor(Math.random()*10000000),
          type: 'DESK',
          parentLocationId: floorLoc?.id || null,
          organizationId: '2c31f473-d1f6-422e-816d-a4050831e9d2'
        }
      });
    }
    
    const existing = await prisma.asset.findFirst({where: {name: row['Hostname'] || String(row['Seat Number']) + '-CPU'}});
    if (!existing) {
      await prisma.asset.create({
        data: {
          organizationId: '2c31f473-d1f6-422e-816d-a4050831e9d2',
          assetCode: 'CPU-' + Math.floor(Math.random()*1000000),
          name: row['Hostname'] || String(row['Seat Number']) + '-CPU',
          categoryId: cpuCat.id,
          serialNumber: String(row['MAC Address']) || 'UNKNOWN',
          purchaseDate: new Date(),
          purchasePrice: 0,
          locationId: deskLoc.id,
          hardwareDetails: {
            process: row['Process'],
            make: row['Make'],
            model: row['Model'],
            os: row['Operating System'],
            ip: row['IP Address'],
            mac: row['MAC Address'],
            ram: row['RAM Size (GB)'],
            ramType: row['RAM Type'],
            processor: row['Processor'],
            drive: row['Drive Configuration'],
            bitlocker: row['BitLocker Status']
          }
        }
      });
      count++;
    }
  }
  console.log('Imported ' + count + ' assets and locations!');
}
main().finally(() => prisma.$disconnect());



const xlsx = require("xlsx");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

const ORG_ID = "2c31f473-d1f6-422e-816d-a4050831e9d2";

function generateCode(prefix) {
  return prefix + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function main() {
  console.log("Starting full inventory import...");
  const workbook = xlsx.readFile("C:/Users/Ravi Rai/Downloads/Copy of The Master Inventory (1).xlsx");
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
  console.log("Found " + data.length + " rows in the excel sheet.");

  let cpuCat = await prisma.assetCategory.findFirst({where: {name: "CPU"}});
  if(!cpuCat) {
    cpuCat = await prisma.assetCategory.create({
      data: { name: "CPU", organizationId: ORG_ID, description: "Computer processing units" }
    });
  }

  let successCount = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row["Seat Number"]) continue;

    try {
      const floorName = String(row["Floor"] || "Unknown Floor").trim();
      let floorLoc = await prisma.location.findFirst({ 
        where: { name: floorName, type: "FLOOR", organizationId: ORG_ID } 
      });
      if (!floorLoc) {
        floorLoc = await prisma.location.create({
          data: { name: floorName, code: generateCode("FLR"), type: "FLOOR", organizationId: ORG_ID }
        });
      }

      const processName = String(row["Process"] || "Unknown Process").trim();
      let processLoc = await prisma.location.findFirst({ 
        where: { name: processName, type: "ROOM", parentLocationId: floorLoc.id, organizationId: ORG_ID } 
      });
      if (!processLoc) {
        processLoc = await prisma.location.create({
          data: { name: processName, code: generateCode("PRC"), type: "ROOM", parentLocationId: floorLoc.id, organizationId: ORG_ID }
        });
      }

      const seatName = String(row["Seat Number"]).trim();
      let seatLoc = await prisma.location.findFirst({ 
        where: { name: seatName, type: "DESK", parentLocationId: processLoc.id, organizationId: ORG_ID } 
      });
      if (!seatLoc) {
        seatLoc = await prisma.location.create({
          data: { name: seatName, code: generateCode("SEAT"), type: "DESK", parentLocationId: processLoc.id, organizationId: ORG_ID }
        });
      }

      const hostName = String(row["Hostname"] || seatName + "-PC").trim();
      let asset = await prisma.asset.findFirst({ 
        where: { name: hostName, organizationId: ORG_ID } 
      });
      
      const hardwareDetails = {
        process: processName,
        floor: floorName,
        seat: seatName,
        os: row["Operating System"] || "",
        ip: row["IP Address"] || "",
        mac: row["MAC Address"] || "",
        make: row["Make"] || "",
        model: row["Model"] || "",
        ram: row["RAM Size (GB)"] || "",
        ramType: row["RAM Type"] || "",
        processor: row["Processor"] || "",
        drive: row["Drive Configuration"] || "",
        bitlocker: row["BitLocker Status"] || ""
      };

      if (!asset) {
        asset = await prisma.asset.create({
          data: {
            organizationId: ORG_ID,
            assetCode: generateCode("AST"),
            name: hostName,
            categoryId: cpuCat.id,
            serialNumber: String(row["MAC Address"] || "UNKNOWN"),
            purchaseDate: new Date(),
            purchasePrice: 0,
            locationId: seatLoc.id,
            hardwareDetails: hardwareDetails,
            status: "ASSIGNED"
          }
        });
      } else {
        asset = await prisma.asset.update({
          where: { id: asset.id },
          data: { locationId: seatLoc.id, hardwareDetails: hardwareDetails, status: "ASSIGNED" }
        });
      }

      successCount++;
      if (successCount % 50 === 0) console.log("Imported " + successCount + " records...");

    } catch (err) {
      console.error("Error processing row " + (i + 1) + ":", err.message);
    }
  }

  console.log("Import Complete! Successfully processed " + successCount + " assets.");
}

main().finally(() => prisma.$disconnect());


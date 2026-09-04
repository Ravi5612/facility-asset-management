const fs = require('fs');

let schema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

// 1. Update LocationType enum
schema = schema.replace(/enum LocationType \{\s*BUILDING\s*FLOOR\s*ROOM\s*RACK\s*OTHER\s*\}/, 'enum LocationType {\n  BUILDING\n  FLOOR\n  ROOM\n  RACK\n  DESK\n  SEAT\n  OTHER\n}');

// 2. Modify User
schema = schema.replace(/model User \{[\s\S]*?(?=model RefreshToken \{)/, (match) => {
  let m = match;
  m = m.replace(/\s*employeeCode\s+String\?\s*@unique.*/, '');
  m = m.replace(/\s*fullName\s+String\?.*/, '');
  m = m.replace(/\s*departmentName\s+String\?.*/, '');
  m = m.replace(/\s*accessibleDepartments\s+String\[\]\s*@default\(\[\]\).*/, '');
  m = m.replace(/\s*designation\s+String\?.*/, '');
  m = m.replace(/\s*profileImage\s+String\?.*/, '');
  
  if (m.includes('email                 String\r\n')) {
     m = m.replace('email                 String\r\n', 'email                 String       @unique\r\n');
  } else if (m.includes('email                 String\n')) {
     m = m.replace('email                 String\n', 'email                 String       @unique\n');
  }
  return m;
});

// 3. Modify Asset
schema = schema.replace(/model Asset \{[\s\S]*?(?=model AssetAssignment \{)/, (match) => {
  let m = match;
  m = m.replace(/\s*currentAssigneeId\s+String\?.*/g, '');
  m = m.replace(/\s*seatNumber\s+String\?.*/g, '');
  m = m.replace(/\s*floor\s+String\?.*/g, '');
  m = m.replace(/\s*currentAssignee\s+Employee\?\s*@relation\("CurrentAssignee".*/g, '');
  return m;
});

// 4. Remove Employee's relation to assetsAssigned
schema = schema.replace(/model Employee \{[\s\S]*?(?=model Attendance \{)/, (match) => {
  return match.replace(/\s*assetsAssigned\s+Asset\[\]\s*@relation\("CurrentAssignee"\).*/g, '');
});

// 5. Remove Inventory entirely
schema = schema.replace(/model Inventory \{[\s\S]*?\n\}/g, '');

fs.writeFileSync('backend/prisma/schema.prisma', schema);
console.log('Schema modified!');

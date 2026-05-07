const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change datasource to sqlite
schema = schema.replace(/datasource db \{[\s\S]*?\}/, `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`);

// Hardcoded list of enums
const enums = [
  'Role', 'Gender', 'CBCRating', 'ReportCardStatus', 'AttendanceStatus', 
  'FeeType', 'FeeFrequency', 'PaymentMethod', 'InstallmentStatus', 
  'AssignmentStatus', 'SubmissionStatus', 'NotificationType', 
  'AnnouncementTarget', 'StudentStatus', 'TermNumber'
];

// 2. Remove enum definitions (if they exist)
const enumRegex = /enum (\w+) \{([\s\S]*?)\}/g;
schema = schema.replace(enumRegex, '');

// 3. Replace enum usages with String and handle @default
enums.sort((a, b) => b.length - a.length);

enums.forEach(enumName => {
  // Replace type usage
  const usageRegex = new RegExp(`(\\b)${enumName}(\\b|\\?|\\[\\])`, 'g');
  schema = schema.replace(usageRegex, `$1String$2`);
});

// 4. Fix @default(VALUE) to @default("VALUE") for the converted strings
// This looks for @default( followed by an uppercase word (typical enum value) and no quotes
schema = schema.replace(/@default\(([A-Z][A-Z0-9_]+)\)/g, '@default("$1")');

// 5. Clean up any leftover [] or ? from enum replacement
schema = schema.replace(/String\[\]/g, 'String');

fs.writeFileSync(schemaPath, schema);
console.log('✅ Schema converted to SQLite (Fixed Defaults)');

// Google Apps Script Code for Student Form Data Management with Enquiry ID System
// This version uses StudentRecords sheet (personal info + scores merged)
// Plus separate sheets for FeesData and AdmittedStudents
// Enquiry ID is the primary identifier instead of email

const SHEET_ID = "17ECtapuVbpM85XTmz2gNBzwvFRcSuETfw_6W-Ds7UKM"; // Update with YOUR Google Sheet ID
const STUDENT_RECORDS_SHEET = "StudentRecords"; // MERGED sheet - personal info + scores combined
const ADMITTED_STUDENTS_SHEET = "AdmittedStudents"; // Sheet for admitted students only

// Legacy headers removed - using StudentRecords only

// Define merged headers for StudentRecords sheet (Personal Info + Scores combined)
// TOTAL: 60 columns - Organized in logical sections for better data management
const STUDENT_RECORDS_HEADERS = [
  // ===== SECTION 1: IDENTIFICATION (2 columns) =====
  "enquiryId",           // Student enquiry/registration ID (auto-generated)
  "admissionId",         // Admission ID (generated when admitted)
  
  // ===== SECTION 2: BASIC INFORMATION (6 columns) =====
  "fullName",            // Full name of the student
  "dob",                 // Date of birth
  "gender",              // Gender (Male/Female)
  "studentContact",      // Student mobile number
  "community",           // Community (SC/ST/OBC/General)
  "caste",               // Caste category
  
  // ===== SECTION 3: FAMILY DETAILS (5 columns) =====
  "fatherName",          // Father's name
  "fatherOccupation",    // Father's occupation
  "fatherContact",       // Father's contact number
  "motherContact",       // Mother's contact number
  "annualIncome",        // Annual family income
  
  // ===== SECTION 4: ADDRESS INFORMATION (6 columns) =====
  "address1",            // Address line 1
  "address2",            // Address line 2
  "taluk",               // Taluk/Block
  "district",            // District
  "state",               // State
  "pincode",             // Pincode
  
  // ===== SECTION 5: EDUCATIONAL BACKGROUND (6 columns) =====
  "lastStudies",         // Previous education (HSC/CBSE/Diploma/Vocational/Dropout)
  "sslcMarks",           // SSLC/10th marks percentage
  "schoolName",          // School name
  "govtSchool",          // Government school (Yes/No)
  "firstGrad",           // First generation graduate (Yes/No)
  "courseType",          // Current course type (HSC/CBSE/Vocational/Diploma)
  
  // ===== SECTION 6: ACADEMIC SCORES (16 columns) =====
  "registerNumber",      // Registration/Roll number
  "medium",              // Medium of instruction
  "yearOfPassing",       // Year of passing
  "subject1",            // Subject 1 name
  "subject1Marks",       // Subject 1 marks
  "subject2",            // Subject 2 name
  "subject2Marks",       // Subject 2 marks
  "subject3",            // Subject 3 name (usually Mathematics)
  "subject3Marks",       // Subject 3 marks
  "subject4",            // Subject 4 name (usually Physics)
  "subject4Marks",       // Subject 4 marks
  "subject5",            // Subject 5 name (usually Chemistry)
  "subject5Marks",       // Subject 5 marks
  "subject6",            // Subject 6 name
  "subject6Marks",       // Subject 6 marks
  "totalMarks",          // Total marks obtained
  "percentage",          // Percentage of marks
  "cutoff",              // Cutoff score (Math + Physics/2 + Chemistry/2)
  "eligibility",         // Engineering eligibility score
  
  // ===== SECTION 7: COURSE PREFERENCES (5 columns) =====
  "preference1",         // First choice of branch
  "preference2",         // Second choice of branch
  "preference3",         // Third choice of branch
  "quota",               // Admission quota (Government/Management)
  "entry",               // Entry method (TNEA/Direct/Lateral)
  
  // ===== SECTION 8: ACCOMMODATION & TRAVEL (3 columns) =====
  "accommodation",       // Type (DayScholar/BoysHostel/GirlsHostel)
  "roomType",            // Room type (SingleRoom/SharedRoom)
  "travelType",          // Travel mode (BusPass/BikePass/Car)
  
  // ===== SECTION 9: TRANSPORTATION DETAILS - Admin Editable (4 columns) =====
  "busStopName",         // Bus stop name/location
  "busRoute",            // Bus route description
  "busNo",               // Bus number
  "busFees",             // Bus fee amount
  
  // ===== SECTION 10: REFERENCE & RECRUITMENT - Admin Editable (3 columns) =====
  "knowAbout",           // How did you know about the college
  "referenceName",       // Reference person's name
  "referenceContact",    // Reference person's contact
  
  // ===== SECTION 11: DROPOUT INFORMATION - If Applicable (3 columns) =====
  "dropoutCollege",      // Previous college name (for dropouts)
  "dropoutRegisterNo",   // Previous registration number
  "dropoutYear",         // Year of dropout
  
  // ===== SECTION 12: ADMISSION & STATUS - Admin Editable (2 columns) =====
  "branchAwarded",       // Branch awarded by admin (final allocation)
  "status",              // Application status (Pending/Admitted/Rejected/cancel)
  
  // ===== SECTION 13: METADATA (1 column) =====
  "date"                 // Last update/submission date
];


// Define headers for AdmittedStudents sheet (complete copy of StudentRecords for admitted students)
// TOTAL: 60 columns - All data from StudentRecords preserved for admitted students
const ADMITTED_STUDENTS_HEADERS = [
  // ===== SECTION 1: IDENTIFICATION (2 columns) =====
  "enquiryId",           // Student enquiry/registration ID (auto-generated)
  "admissionId",         // Admission ID (generated when admitted)
  
  // ===== SECTION 2: BASIC INFORMATION (6 columns) =====
  "fullName",            // Full name of the student
  "dob",                 // Date of birth
  "gender",              // Gender (Male/Female)
  "studentContact",      // Student mobile number
  "community",           // Community (SC/ST/OBC/General)
  "caste",               // Caste category
  
  // ===== SECTION 3: FAMILY DETAILS (5 columns) =====
  "fatherName",          // Father's name
  "fatherOccupation",    // Father's occupation
  "fatherContact",       // Father's contact number
  "motherContact",       // Mother's contact number
  "annualIncome",        // Annual family income
  
  // ===== SECTION 4: ADDRESS INFORMATION (6 columns) =====
  "address1",            // Address line 1
  "address2",            // Address line 2
  "taluk",               // Taluk/Block
  "district",            // District
  "state",               // State
  "pincode",             // Pincode
  
  // ===== SECTION 5: EDUCATIONAL BACKGROUND (6 columns) =====
  "lastStudies",         // Previous education (HSC/CBSE/Diploma/Vocational/Dropout)
  "sslcMarks",           // SSLC/10th marks percentage
  "schoolName",          // School name
  "govtSchool",          // Government school (Yes/No)
  "firstGrad",           // First generation graduate (Yes/No)
  "courseType",          // Current course type (HSC/CBSE/Vocational/Diploma)
  
  // ===== SECTION 6: ACADEMIC SCORES (16 columns) =====
  "registerNumber",      // Registration/Roll number
  "medium",              // Medium of instruction
  "yearOfPassing",       // Year of passing
  "subject1",            // Subject 1 name
  "subject1Marks",       // Subject 1 marks
  "subject2",            // Subject 2 name
  "subject2Marks",       // Subject 2 marks
  "subject3",            // Subject 3 name (usually Mathematics)
  "subject3Marks",       // Subject 3 marks
  "subject4",            // Subject 4 name (usually Physics)
  "subject4Marks",       // Subject 4 marks
  "subject5",            // Subject 5 name (usually Chemistry)
  "subject5Marks",       // Subject 5 marks
  "subject6",            // Subject 6 name
  "subject6Marks",       // Subject 6 marks
  "totalMarks",          // Total marks obtained
  "percentage",          // Percentage of marks
  "cutoff",              // Cutoff score (Math + Physics/2 + Chemistry/2)
  "eligibility",         // Engineering eligibility score
  
  // ===== SECTION 7: COURSE PREFERENCES (5 columns) =====
  "preference1",         // First choice of branch
  "preference2",         // Second choice of branch
  "preference3",         // Third choice of branch
  "quota",               // Admission quota (Government/Management)
  "entry",               // Entry method (TNEA/Direct/Lateral)
  
  // ===== SECTION 8: ACCOMMODATION & TRAVEL (3 columns) =====
  "accommodation",       // Type (DayScholar/BoysHostel/GirlsHostel)
  "roomType",            // Room type (SingleRoom/SharedRoom)
  "travelType",          // Travel mode (BusPass/BikePass/Car)
  
  // ===== SECTION 9: TRANSPORTATION DETAILS - Admin Editable (4 columns) =====
  "busStopName",         // Bus stop name/location
  "busRoute",            // Bus route description
  "busNo",               // Bus number
  "busFees",             // Bus fee amount
  
  // ===== SECTION 10: REFERENCE & RECRUITMENT - Admin Editable (3 columns) =====
  "knowAbout",           // How did you know about the college
  "referenceName",       // Reference person's name
  "referenceContact",    // Reference person's contact
  
  // ===== SECTION 11: DROPOUT INFORMATION - If Applicable (3 columns) =====
  "dropoutCollege",      // Previous college name (for dropouts)
  "dropoutRegisterNo",   // Previous registration number
  "dropoutYear",         // Year of dropout
  
  // ===== SECTION 12: ADMISSION & STATUS - Admin Editable (2 columns) =====
  "branchAwarded",       // Branch awarded by admin (final allocation)
  "status",              // Application status (Pending/Admitted/Rejected/cancel)
  
  // ===== SECTION 13: METADATA (1 column) =====
  "date"                 // Last update/submission date
];

// ===== CACHED SHEET & HEADER MANAGEMENT =====
// Global cache to avoid repeated sheet lookups and header index lookups
let sheetCache = {};
let headerCache = {};

function getSheetByNameCached(sheetName) {
  if (!sheetCache[sheetName]) {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    sheetCache[sheetName] = ss.getSheetByName(sheetName);
  }
  return sheetCache[sheetName];
}

function getHeaderIndexCached(sheetName, headerName) {
  if (!headerCache[sheetName]) {
    headerCache[sheetName] = {};
  }
  
  if (!headerCache[sheetName][headerName]) {
    const sheet = getSheetByNameCached(sheetName);
    if (sheet) {
      const headers = sheet.getDataRange().getValues()[0];
      headerCache[sheetName][headerName] = headers.indexOf(headerName);
    }
  }
  
  return headerCache[sheetName][headerName] || -1;
}

function clearSheetCache() {
  sheetCache = {};
  headerCache = {};
}

// ===== OPTIMIZED DATA RETRIEVAL =====
function getSheetDataCached(sheetName) {
  const sheet = getSheetByNameCached(sheetName);
  if (!sheet) return null;
  
  const data = sheet.getDataRange().getValues();
  return {
    sheet: sheet,
    data: data,
    headers: data[0] || [],
    headerMap: createHeaderMap(data[0] || [])
  };
}

function createHeaderMap(headers) {
  const map = {};
  headers.forEach((header, index) => {
    map[header] = index;
  });
  return map;
}

function findRowByCached(sheetName, columnName, value) {
  const sheetData = getSheetDataCached(sheetName);
  if (!sheetData) return -1;
  
  const colIndex = sheetData.headerMap[columnName];
  if (colIndex === undefined) return -1;
  
  for (let i = 1; i < sheetData.data.length; i++) {
    if (sheetData.data[i][colIndex] === value) {
      return i;
    }
  }
  return -1;
}

// ===== INITIALIZATION FUNCTIONS =====

function initializeSpreadsheets() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    Logger.log("🔧 initializeSpreadsheets() called");
    
    // Initialize StudentRecords sheet (MERGED - PRIMARY)
    let studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    if (!studentRecordsSheet) {
      Logger.log("📄 Creating new " + STUDENT_RECORDS_SHEET + " sheet with " + STUDENT_RECORDS_HEADERS.length + " columns");
      studentRecordsSheet = ss.insertSheet(STUDENT_RECORDS_SHEET);
      studentRecordsSheet.appendRow(STUDENT_RECORDS_HEADERS);
      SpreadsheetApp.flush();
      Logger.log("✅ Created " + STUDENT_RECORDS_SHEET + " sheet with headers");
    } else {
      Logger.log("📄 " + STUDENT_RECORDS_SHEET + " sheet already exists");
      ensureColumnsExist(studentRecordsSheet, STUDENT_RECORDS_HEADERS);
    }
    
    // Initialize AdmittedStudents sheet
    let admittedSheet = ss.getSheetByName(ADMITTED_STUDENTS_SHEET);
    if (!admittedSheet) {
      Logger.log("📄 Creating new " + ADMITTED_STUDENTS_SHEET + " sheet");
      admittedSheet = ss.insertSheet(ADMITTED_STUDENTS_SHEET);
      admittedSheet.appendRow(ADMITTED_STUDENTS_HEADERS);
      SpreadsheetApp.flush();
      Logger.log("✅ Created " + ADMITTED_STUDENTS_SHEET + " sheet");
    }
    
    formatSheets();
    clearSheetCache(); // Clear cache after initialization
    return { studentRecordsSheet, feesSheet, admittedSheet };
  } catch (error) {
    Logger.log("Error initializing spreadsheets: " + error.toString());
    throw new Error("Failed to initialize spreadsheets: " + error.toString());
  }
}

// ===== COLUMN MIGRATION FUNCTION =====
function ensureColumnsExist(sheet, expectedHeaders) {
  try {
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) return;
    
    const existingHeaders = data[0];
    const missingColumns = [];
    
    // Check which columns are missing
    for (let i = 0; i < expectedHeaders.length; i++) {
      if (existingHeaders.indexOf(expectedHeaders[i]) === -1) {
        missingColumns.push({ header: expectedHeaders[i], index: i });
      }
    }
    
    // If columns are missing, add them
    if (missingColumns.length > 0) {
      Logger.log("⚠️ Found " + missingColumns.length + " missing columns in " + sheet.getName());
      
      for (const missing of missingColumns) {
        Logger.log("  → Adding missing column: " + missing.header);
        existingHeaders.push(missing.header);
        
        // Add empty cells for all existing rows
        for (let i = 1; i < data.length; i++) {
          while (data[i].length < existingHeaders.length) {
            data[i].push("");
          }
        }
      }
      
      // Clear and rewrite the sheet with updated headers and data
      sheet.clearContents();
      if (data.length > 0) {
        sheet.getRange(1, 1, data.length, existingHeaders.length).setValues(data);
      }
      
      Logger.log("✅ Migration complete for " + sheet.getName() + " - added " + missingColumns.length + " columns");
    }
  } catch (error) {
    Logger.log("Error in ensureColumnsExist: " + error.toString());
  }
}

// ===== HELPER: Format date from ISO to readable format =====
function formatDateForSheet(isoDateString) {
  if (!isoDateString) return "";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return isoDateString;
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return day + " " + month + " " + year;
  } catch (e) {
    return isoDateString;
  }
}

function formatSheets() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    const sheets = [
      { name: STUDENT_RECORDS_SHEET, headerCount: STUDENT_RECORDS_HEADERS.length },
      { name: ADMITTED_STUDENTS_SHEET, headerCount: ADMITTED_STUDENTS_HEADERS.length }
    ];
    
    sheets.forEach(sheetInfo => {
      const sheet = ss.getSheetByName(sheetInfo.name);
      if (sheet) {
        const headerRange = sheet.getRange(1, 1, 1, sheetInfo.headerCount);
        headerRange.setBackground("#4285F4");
        headerRange.setFontColor("#FFFFFF");
        headerRange.setFontWeight("bold");
        sheet.setFrozenRows(1);
        sheet.autoResizeColumns(1, sheetInfo.headerCount);
        Logger.log("Formatted " + sheetInfo.name + " sheet");
      }
    });
  } catch (error) {
    Logger.log("Error formatting sheets: " + error.toString());
  }
}

// ===== ENQUIRY ID GENERATION =====

function generateEnquiryId() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!sheet) {
      initializeSpreadsheets();
    }
    
    const data = sheet.getDataRange().getValues();
    // Number of enquiry IDs = total rows - 1 (for header)
    const count = Math.max(0, data.length - 1);
    const paddedCount = String(count + 1).padStart(4, '0');
    const enquiryId = "KN26EQ" + paddedCount;
    
    Logger.log("Generated Enquiry ID: " + enquiryId);
    return enquiryId;
  } catch (error) {
    Logger.log("Error generating enquiry ID: " + error.toString());
    throw new Error("Failed to generate enquiry ID: " + error.toString());
  }
}

// ===== ADMISSION ID GENERATION =====

function generateAdmissionId() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const admissionIdIndex = headers.indexOf("admissionId");
    
    // Count existing admission IDs
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][admissionIdIndex] && data[i][admissionIdIndex] !== "") {
        count++;
      }
    }
    
    const paddedCount = String(count + 1).padStart(4, '0');
    const admissionId = "26KNF" + paddedCount;
    
    return admissionId;
  } catch (error) {
    Logger.log("Error generating admission ID: " + error.toString());
    return null;
  }
}

// ===== PERSONAL INFO HANDLERS =====

function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action;
    const params = e && e.parameter || {};
    
    // Action: submit personal info + scores together (combined)
    if (action === "submitStudentData") {
      return submitStudentData(e);
    }
    
    // Action: get diagnostic info (debugging)
    if (action === "diagnose") {
      return getDiagnosticInfo();
    }
    
    // Action: get all student records (for verification)
    if (action === "getAllStudents") {
      return getAllStudentsForVerification();
    }
    
    // Action: migrate sheet structure to new organization
    if (action === "migrateSheetStructure") {
      const studentResult = migrateSheetToNewStructure();
      const admittedResult = migrateAdmittedSheetToNewStructure();
      return ContentService.createTextOutput(JSON.stringify({
        studentRecords: studentResult,
        admittedStudents: admittedResult
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Action: verify data mapping (diagnostic)
    if (action === "verifyDataMapping" && params.enquiryId) {
      return verifyDataMapping(params.enquiryId);
    }
    
    // Action: check sheet structure
    if (action === "checkSheetStructure") {
      return checkSheetStructure();
    }
    
    // Action: update personal info (for admin panel)
    if (action === "updatePersonalInfo") {
      return updatePersonalInfo(e);
    }
    
    // Action: update scores data (for admin panel)
    if (action === "updateScores") {
      return updateScores(e);
    }
    
    // Action: fetch personal info by enquiry ID (optimized single fetch)
    if (action === "getPersonalInfo" && params.enquiryId) {
      return getPersonalInfoOptimized(params.enquiryId);
    }
    
    // Action: fetch scores data by enquiry ID (optimized single fetch)
    if (action === "getScoresData" && params.enquiryId) {
      return getScoresDataOptimized(params.enquiryId);
    }
    
    // Default: fetch all personal info
    return getAllPersonalInfoOptimized();
    
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== PERSONAL INFO HANDLERS =====

// ===== COMBINED SUBMISSION: Personal Info + Scores Together =====
function submitStudentData(e) {
  try {
    Logger.log("🚀 submitStudentData() called - Combined personal info + scores submission");
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // Force clear cache
    clearSheetCache();
    
    let studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!studentRecordsSheet) {
      Logger.log("❌ StudentRecords sheet not found - initializing...");
      const result = initializeSpreadsheets();
      studentRecordsSheet = result.studentRecordsSheet;
      Logger.log("✅ StudentRecords initialized");
    }
    
    const params = e.parameter || {};
    Logger.log("📋 Received combined data with " + Object.keys(params).length + " fields");
    
    // Generate new enquiry ID
    const enquiryId = generateEnquiryId();
    Logger.log("🆔 Generated enquiry ID: " + enquiryId);
    
    // Prepare merged row data for StudentRecords (personal + scores combined)
    const mergedRow = [];
    for (let i = 0; i < STUDENT_RECORDS_HEADERS.length; i++) {
      const header = STUDENT_RECORDS_HEADERS[i];
      let value = "";
      
      if (header === "enquiryId") {
        value = enquiryId;
      } else if (header === "date") {
        value = formatDateForSheet(new Date().toISOString());
      } else if (header === "status") {
        value = "Active";
      } else if (params.hasOwnProperty(header)) {
        value = params[header] || "";
      }
      
      mergedRow.push(value);
    }
    
    Logger.log("📝 Combined row prepared with " + mergedRow.length + " columns");
    Logger.log("📝 enquiryId: '" + mergedRow[0] + "'");
    Logger.log("📝 fullName: '" + mergedRow[1] + "'");
    Logger.log("📝 courseType: '" + mergedRow[33] + "'"); // courseType is column 34 (index 33)
    
    // Get current row count BEFORE append
    let preAppendData = studentRecordsSheet.getDataRange().getValues();
    Logger.log("📊 BEFORE append: " + preAppendData.length + " rows in sheet");
    
    // Append combined row
    try {
      studentRecordsSheet.appendRow(mergedRow);
      Logger.log("✅ appendRow() succeeded");
    } catch (appendError) {
      Logger.log("⚠️ appendRow() failed, trying setValues(): " + appendError.toString());
      const insertRow = preAppendData.length + 1;
      const range = studentRecordsSheet.getRange(insertRow, 1, 1, mergedRow.length);
      range.setValues([mergedRow]);
      Logger.log("✅ setValues() succeeded");
    }
    
    // Force flush
    SpreadsheetApp.flush();
    Logger.log("✅ Spreadsheet flushed");
    
    // Verify data was saved
    let postAppendData = studentRecordsSheet.getDataRange().getValues();
    Logger.log("📊 AFTER append: " + postAppendData.length + " rows in sheet");
    
    if (postAppendData.length <= preAppendData.length) {
      Logger.log("❌ CRITICAL: Row was not appended!");
      throw new Error("Data persistence failed");
    }
    
    const lastRow = postAppendData[postAppendData.length - 1];
    Logger.log("✅ Last row saved - enquiryId: '" + lastRow[0] + "', fullName: '" + lastRow[1] + "'");
    
    clearSheetCache();
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Personal information and scores saved successfully",
      enquiryId: enquiryId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("❌ Error in submitStudentData: " + error.toString());
    Logger.log("❌ Stack trace: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== OPTIMIZED: Get Personal Info (Single read from StudentRecords, faster) =====
function getPersonalInfoOptimized(enquiryId) {
  try {
    const sheetData = getSheetDataCached(STUDENT_RECORDS_SHEET);
    if (!sheetData) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const enquiryIdIndex = sheetData.headerMap["enquiryId"];
    
    // Find the record
    for (let i = 1; i < sheetData.data.length; i++) {
      if (sheetData.data[i][enquiryIdIndex] === enquiryId) {
        const record = {};
        for (let j = 0; j < sheetData.headers.length; j++) {
          record[sheetData.headers[j]] = sheetData.data[i][j] || "";
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          data: record 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Enquiry ID not found" 
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in getPersonalInfoOptimized: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== OPTIMIZED: Get All Personal Info from StudentRecords (Using cache) =====
function getAllPersonalInfoOptimized() {
  try {
    Logger.log("📊 getAllPersonalInfoOptimized() called");
    const sheetData = getSheetDataCached(STUDENT_RECORDS_SHEET);
    
    Logger.log("📋 Sheet data retrieved - Rows: " + (sheetData ? sheetData.data.length : 0));
    
    if (!sheetData || sheetData.data.length <= 1) {
      Logger.log("⚠️ No data found in sheet or only headers present");
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log("📝 Headers count: " + sheetData.headers.length);
    Logger.log("📝 Headers: " + sheetData.headers.join(", "));
    
    const records = [];
    for (let i = 1; i < sheetData.data.length; i++) {
      const record = {};
      for (let j = 0; j < sheetData.headers.length; j++) {
        record[sheetData.headers[j]] = sheetData.data[i][j] || "";
      }
      records.push(record);
    }
    
    Logger.log("✅ Returning " + records.length + " records");
    if (records.length > 0) {
      Logger.log("📄 First record fields: " + Object.keys(records[0]).join(", "));
    }
    
    return ContentService.createTextOutput(JSON.stringify(records))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("❌ Error in getAllPersonalInfoOptimized: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== SCORES DATA HANDLERS =====

// ===== OPTIMIZED: Get Scores Data from StudentRecords (Single read, faster) =====
function getScoresDataOptimized(enquiryId) {
  try {
    const sheetData = getSheetDataCached(STUDENT_RECORDS_SHEET);
    if (!sheetData) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const enquiryIdIndex = sheetData.headerMap["enquiryId"];
    
    // Find record
    for (let i = 1; i < sheetData.data.length; i++) {
      if (sheetData.data[i][enquiryIdIndex] === enquiryId) {
        const record = {};
        for (let j = 0; j < sheetData.headers.length; j++) {
          record[sheetData.headers[j]] = sheetData.data[i][j] || "";
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          data: record 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Enquiry ID not found" 
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in getScoresDataOptimized: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== UPDATE PERSONAL INFO HANDLER =====

// ===== HELPER FUNCTIONS FOR OPTIMIZATION =====

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;
  return {
    sheet: sheet,
    data: sheet.getDataRange().getValues(),
    headers: null
  };
}

function findRowIndex(data, columnIndex, value) {
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex] === value) {
      return i;
    }
  }
  return -1;
}

// ===== OPTIMIZED: Update Personal Info (Uses cached data, fewer reads) =====

function updatePersonalInfo(e) {
  try {
    const payload = e.parameter || {};
    const enquiryId = payload.enquiryId;
    
    if (!enquiryId) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Enquiry ID is required for update" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheetData = getSheetDataCached(STUDENT_RECORDS_SHEET);
    if (!sheetData) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const enquiryIdIndex = sheetData.headerMap["enquiryId"];
    let rowIndex = -1;
    
    // Find row
    for (let i = 1; i < sheetData.data.length; i++) {
      if (sheetData.data[i][enquiryIdIndex] === enquiryId) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Enquiry ID not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if status is being changed to "Admitted" and generate admission ID ONLY then
    const statusIndex = sheetData.headerMap["status"];
    const admissionIdIndex = sheetData.headerMap["admissionId"];
    let admissionId = null;
    let statusChanged = false;
    
    Logger.log("📋 Current status: " + sheetData.data[rowIndex][statusIndex] + " | New status: " + (payload.status || "no change"));
    
    // ONLY generate admission ID if status is changing to "Admitted"
    if (payload.hasOwnProperty("status") && payload.status === "Admitted" && admissionIdIndex !== -1) {
      statusChanged = true;
      // Check if already has admission ID
      if (!sheetData.data[rowIndex][admissionIdIndex] || sheetData.data[rowIndex][admissionIdIndex] === "") {
        const generatedId = generateAdmissionId();
        if (generatedId) {
          sheetData.sheet.getRange(rowIndex + 1, admissionIdIndex + 1).setValue(generatedId);
          admissionId = generatedId;
          payload.admissionId = generatedId;
          Logger.log("✅ GENERATING ADMISSION ID: " + generatedId + " (Status changed to ADMITTED)");
        }
      } else {
        admissionId = sheetData.data[rowIndex][admissionIdIndex];
        Logger.log("✅ USING EXISTING ADMISSION ID: " + admissionId);
      }
    } else {
      if (payload.hasOwnProperty("status")) {
        Logger.log("⏭️ Status is: " + payload.status + " | Admission ID will NOT be generated (only on Admitted)");
      }
    }
    
    // Batch update all fields at once (faster than individual updates)
    const updates = [];
    for (const header in sheetData.headerMap) {
      if (header !== "enquiryId" && payload.hasOwnProperty(header)) {
        const colIndex = sheetData.headerMap[header];
        updates.push({
          row: rowIndex + 1,
          col: colIndex + 1,
          value: payload[header]
        });
      }
    }
    
    // Update date - use admin's input if provided, otherwise use current date
    const dateIndex = sheetData.headerMap["date"];
    if (dateIndex !== undefined) {
      const dateValue = payload.hasOwnProperty("date") && payload.date 
        ? formatDateForSheet(payload.date)
        : formatDateForSheet(new Date().toISOString());
      
      updates.push({
        row: rowIndex + 1,
        col: dateIndex + 1,
        value: dateValue
      });
    }
    
    // Apply all updates at once
    for (const update of updates) {
      sheetData.sheet.getRange(update.row, update.col).setValue(update.value);
    }
    
    // ONLY save to AdmittedStudents sheet if status changed to "Admitted"
    if (statusChanged && admissionId) {
      Logger.log("👥 SAVING TO ADMITTED STUDENTS SHEET (Status = Admitted) with Admission ID: " + admissionId);
      const admittedResult = saveToAdmittedStudents(enquiryId, payload, admissionId);
      Logger.log("AdmittedStudents save result: " + (admittedResult.success ? "✅ Success" : "❌ Failed"));
      clearSheetCache(); // Clear cache after save
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Personal info updated successfully",
      enquiryId: enquiryId,
      admissionId: admissionId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error in updatePersonalInfo: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== OPTIMIZED: Update Scores (Uses cached data, fewer reads) =====

function updateScores(e) {
  try {
    const payload = e.parameter || {};
    const enquiryId = payload.enquiryId;
    
    if (!enquiryId) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Enquiry ID is required for update" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheetData = getSheetDataCached(STUDENT_RECORDS_SHEET);
    if (!sheetData) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "StudentRecords sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const enquiryIdIndex = sheetData.headerMap["enquiryId"];
    const dateIndex = sheetData.headerMap["date"];
    
    // Find record with matching enquiry ID
    let foundRow = -1;
    
    for (let i = 1; i < sheetData.data.length; i++) {
      if (sheetData.data[i][enquiryIdIndex] === enquiryId) {
        foundRow = i;
        break;
      }
    }
    
    const timestamp = formatDateForSheet(new Date().toISOString());
    
    if (foundRow === -1) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Enquiry ID not found in StudentRecords" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Update existing entry - batch updates
    const updates = [];
    for (const header in sheetData.headerMap) {
      if (header !== "enquiryId" && payload.hasOwnProperty(header)) {
        const colIndex = sheetData.headerMap[header];
        updates.push({
          row: foundRow + 1,
          col: colIndex + 1,
          value: payload[header]
        });
      }
    }
    
    // Always update date
    if (dateIndex !== undefined) {
      updates.push({
        row: foundRow + 1,
        col: dateIndex + 1,
        value: timestamp
      });
    }
    
    // Apply all updates at once
    for (const update of updates) {
      sheetData.sheet.getRange(update.row, update.col).setValue(update.value);
    }
    
    Logger.log("✅ Updated scores in StudentRecords for enquiry ID: " + enquiryId);
    
    clearSheetCache(); // Clear cache after update
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Scores updated successfully",
      enquiryId: enquiryId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error in updateScores: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== OPTIMIZED: Save Fees Data (Batch operations, fewer sheet reads) =====

function saveToAdmittedStudents(enquiryId, personalData, admissionId) {
  try {
    Logger.log("👥 saveToAdmittedStudents() called for enquiry ID: " + enquiryId + " with admission ID: " + admissionId);
    
    let admittedSheet = getSheetByNameCached(ADMITTED_STUDENTS_SHEET);
    
    // Initialize AdmittedStudents sheet if it doesn't exist
    if (!admittedSheet) {
      Logger.log("⚠️ AdmittedStudents sheet not found, creating it...");
      const ss = SpreadsheetApp.openById(SHEET_ID);
      admittedSheet = ss.insertSheet(ADMITTED_STUDENTS_SHEET);
      admittedSheet.appendRow(ADMITTED_STUDENTS_HEADERS);
      clearSheetCache();
      sheetCache[ADMITTED_STUDENTS_SHEET] = admittedSheet;
      Logger.log("✅ Created " + ADMITTED_STUDENTS_SHEET + " sheet");
      formatSheets();
    }
    
    const sheetData = getSheetDataCached(ADMITTED_STUDENTS_SHEET);
    const admissionIdIndex = sheetData.headerMap["admissionId"];
    
    // Check if this admitted student already exists
    let rowIndex = -1;
    for (let i = 1; i < sheetData.data.length; i++) {
      if (sheetData.data[i][admissionIdIndex] === admissionId) {
        rowIndex = i;
        Logger.log("🔄 Found existing admitted record at row: " + (rowIndex + 1));
        break;
      }
    }
    
    // Prepare row data
    const rowData = [];
    for (const header of sheetData.headers) {
      let value = "";
      
      if (header === "admissionId") {
        value = admissionId;
      } else if (header === "admittedDate") {
        value = formatDateForSheet(new Date().toISOString());
      } else if (personalData.hasOwnProperty(header)) {
        value = personalData[header] || "";
      }
      
      rowData.push(value);
    }
    
    if (rowIndex >= 0) {
      // Update existing row - batch operation
      Logger.log("📤 Updating existing admitted record at row " + (rowIndex + 1));
      admittedSheet.getRange(rowIndex + 1, 1, 1, sheetData.headers.length).setValues([rowData]);
      Logger.log("✅ Updated admitted student record for admission ID: " + admissionId);
    } else {
      // Append new row
      Logger.log("📥 Creating new admitted student record");
      admittedSheet.appendRow(rowData);
      Logger.log("✅ Saved admitted student record for admission ID: " + admissionId);
    }
    
    clearSheetCache(); // Clear cache after save
    
    return {
      success: true,
      message: "Admitted student record saved successfully"
    };
    
  } catch (error) {
    Logger.log("❌ Error saving admitted student: " + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

// CORS Support
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ===== SETUP & TESTING FUNCTIONS =====

function setupSheets() {
  try {
    Logger.log("🔧 Starting setup and migration...");
    initializeSpreadsheets();
    formatSheets();
    Logger.log("✓ Setup Complete - All sheets initialized and formatted");
  } catch (error) {
    Logger.log("✗ Setup Error: " + error.toString());
  }
}

// ===== DATA MIGRATION: Reorganize existing sheet data to match new header structure =====
function migrateSheetToNewStructure() {
  try {
    Logger.log("🔄 Starting sheet migration to new header structure...");
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!studentRecordsSheet) {
      Logger.log("⚠️ StudentRecords sheet not found - nothing to migrate");
      return { success: false, error: "Sheet not found" };
    }
    
    const data = studentRecordsSheet.getDataRange().getValues();
    
    if (data.length === 0) {
      Logger.log("⚠️ Sheet is empty - nothing to migrate");
      return { success: false, error: "Sheet is empty" };
    }
    
    const oldHeaders = data[0];
    Logger.log("📋 Current headers in sheet: " + oldHeaders.length + " columns");
    Logger.log("📋 Expected headers from code: " + STUDENT_RECORDS_HEADERS.length + " columns");
    
    // Check if migration is needed
    let needsMigration = false;
    if (oldHeaders.length !== STUDENT_RECORDS_HEADERS.length) {
      needsMigration = true;
      Logger.log("⚠️ Column count mismatch detected");
    } else {
      // Check if order matches
      for (let i = 0; i < oldHeaders.length; i++) {
        if (oldHeaders[i] !== STUDENT_RECORDS_HEADERS[i]) {
          needsMigration = true;
          Logger.log("⚠️ Column order mismatch at position " + i + ": '" + oldHeaders[i] + "' vs '" + STUDENT_RECORDS_HEADERS[i] + "'");
          break;
        }
      }
    }
    
    if (!needsMigration) {
      Logger.log("✅ Sheet structure already matches - no migration needed");
      return { success: true, message: "No migration needed" };
    }
    
    Logger.log("🔧 Migration required - reorganizing data...");
    
    // Create mapping from old position to new position
    const columnMapping = {};
    for (let i = 0; i < STUDENT_RECORDS_HEADERS.length; i++) {
      const headerName = STUDENT_RECORDS_HEADERS[i];
      const oldIndex = oldHeaders.indexOf(headerName);
      if (oldIndex !== -1) {
        columnMapping[i] = oldIndex;
      } else {
        columnMapping[i] = -1; // New column, will be empty
        Logger.log("➕ New column added: " + headerName);
      }
    }
    
    // Create reorganized data
    const newData = [];
    
    // Add new header row
    newData.push(STUDENT_RECORDS_HEADERS);
    
    // Reorganize data rows
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const oldRow = data[rowIndex];
      const newRow = [];
      
      for (let colIndex = 0; colIndex < STUDENT_RECORDS_HEADERS.length; colIndex++) {
        const oldColIndex = columnMapping[colIndex];
        if (oldColIndex !== -1 && oldColIndex < oldRow.length) {
          newRow.push(oldRow[oldColIndex]);
        } else {
          newRow.push(""); // Empty for new columns or missing data
        }
      }
      
      newData.push(newRow);
    }
    
    Logger.log("✅ Data reorganized - " + (newData.length - 1) + " rows processed");
    
    // Clear existing sheet
    studentRecordsSheet.clear();
    
    // Write reorganized data
    if (newData.length > 0) {
      studentRecordsSheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
    }
    
    Logger.log("✅ Sheet migration completed successfully");
    Logger.log("📊 New structure: " + STUDENT_RECORDS_HEADERS.length + " columns, " + (newData.length - 1) + " data rows");
    
    // Clear cache after migration
    clearSheetCache();
    
    return { 
      success: true, 
      message: "Migration completed",
      oldColumns: oldHeaders.length,
      newColumns: STUDENT_RECORDS_HEADERS.length,
      rowsProcessed: newData.length - 1
    };
    
  } catch (error) {
    Logger.log("❌ Error during migration: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ===== MIGRATION FOR ADMITTED STUDENTS SHEET =====
function migrateAdmittedSheetToNewStructure() {
  try {
    Logger.log("🔄 Starting AdmittedStudents sheet migration...");
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const admittedSheet = ss.getSheetByName(ADMITTED_STUDENTS_SHEET);
    
    if (!admittedSheet) {
      Logger.log("⚠️ AdmittedStudents sheet not found - nothing to migrate");
      return { success: false, error: "Sheet not found" };
    }
    
    const data = admittedSheet.getDataRange().getValues();
    
    if (data.length === 0) {
      Logger.log("⚠️ Sheet is empty - nothing to migrate");
      return { success: false, error: "Sheet is empty" };
    }
    
    const oldHeaders = data[0];
    Logger.log("📋 Current headers: " + oldHeaders.length + " columns");
    Logger.log("📋 Expected headers: " + ADMITTED_STUDENTS_HEADERS.length + " columns");
    
    // Check if migration is needed
    let needsMigration = false;
    if (oldHeaders.length !== ADMITTED_STUDENTS_HEADERS.length) {
      needsMigration = true;
    } else {
      for (let i = 0; i < oldHeaders.length; i++) {
        if (oldHeaders[i] !== ADMITTED_STUDENTS_HEADERS[i]) {
          needsMigration = true;
          break;
        }
      }
    }
    
    if (!needsMigration) {
      Logger.log("✅ Sheet structure already matches - no migration needed");
      return { success: true, message: "No migration needed" };
    }
    
    Logger.log("🔧 Migration required - reorganizing data...");
    
    // Create mapping
    const columnMapping = {};
    for (let i = 0; i < ADMITTED_STUDENTS_HEADERS.length; i++) {
      const headerName = ADMITTED_STUDENTS_HEADERS[i];
      const oldIndex = oldHeaders.indexOf(headerName);
      columnMapping[i] = oldIndex !== -1 ? oldIndex : -1;
    }
    
    // Create reorganized data
    const newData = [ADMITTED_STUDENTS_HEADERS];
    
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const oldRow = data[rowIndex];
      const newRow = [];
      
      for (let colIndex = 0; colIndex < ADMITTED_STUDENTS_HEADERS.length; colIndex++) {
        const oldColIndex = columnMapping[colIndex];
        newRow.push(oldColIndex !== -1 && oldColIndex < oldRow.length ? oldRow[oldColIndex] : "");
      }
      
      newData.push(newRow);
    }
    
    // Clear and write
    admittedSheet.clear();
    if (newData.length > 0) {
      admittedSheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
    }
    
    Logger.log("✅ AdmittedStudents migration completed");
    clearSheetCache();
    
    return { 
      success: true, 
      message: "Migration completed",
      rowsProcessed: newData.length - 1
    };
    
  } catch (error) {
    Logger.log("❌ Error during AdmittedStudents migration: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

function getDiagnosticInfo() {
  try {
    Logger.log("📋 getDiagnosticInfo() called");
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      sheetStatus: {
        exists: !!studentRecordsSheet,
        name: STUDENT_RECORDS_SHEET
      },
      expectedColumns: STUDENT_RECORDS_HEADERS.length,
      actualColumns: 0,
      totalRows: 0,
      dataRows: 0,
      sampleData: []
    };
    
    if (studentRecordsSheet) {
      const data = studentRecordsSheet.getDataRange().getValues();
      diagnostics.actualColumns = data[0].length;
      diagnostics.totalRows = data.length;
      diagnostics.dataRows = Math.max(0, data.length - 1);
      diagnostics.headers = data[0];
      
      // Show first 3 data rows if they exist
      for (let i = 1; i < Math.min(4, data.length); i++) {
        diagnostics.sampleData.push({
          row: i + 1,
          enquiryId: data[i][0],
          fullName: data[i][1],
          email: data[i][2],
          dob: data[i][3]
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(diagnostics, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("❌ Error in getDiagnosticInfo: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      error: error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== DIAGNOSTIC: Verify data mapping from sheet =====
function verifyDataMapping(enquiryId) {
  try {
    Logger.log("🔍 verifyDataMapping() called for enquiryId: " + enquiryId);
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!studentRecordsSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "StudentRecords sheet not found"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = studentRecordsSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Show current headers in sheet
    const headerMapping = {};
    for (let i = 0; i < headers.length; i++) {
      headerMapping[i] = headers[i];
    }
    
    Logger.log("📋 Sheet currently has " + headers.length + " columns");
    Logger.log("📋 Expected: " + STUDENT_RECORDS_HEADERS.length + " columns");
    
    // Find the enquiry ID
    const enquiryIdIndex = headers.indexOf("enquiryId");
    let foundRow = null;
    let foundRowIndex = -1;
    
    if (enquiryIdIndex >= 0) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][enquiryIdIndex]).trim() === String(enquiryId).trim()) {
          foundRow = data[i];
          foundRowIndex = i;
          break;
        }
      }
    }
    
    if (!foundRow) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Enquiry ID not found",
        enquiryIdSearched: enquiryId,
        headerCount: headers.length,
        totalRows: data.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Map the actual row data to field names
    const rowData = {};
    const emptyFields = [];
    const filledFields = [];
    
    for (let i = 0; i < STUDENT_RECORDS_HEADERS.length; i++) {
      const fieldName = STUDENT_RECORDS_HEADERS[i];
      const value = foundRow[i] || "";
      rowData[fieldName] = value;
      
      if (value === "" || value === null) {
        emptyFields.push(fieldName);
      } else {
        filledFields.push({ field: fieldName, value: value });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      enquiryId: enquiryId,
      rowIndex: foundRowIndex + 1,
      sheetHeaders: headers,
      expectedHeaders: STUDENT_RECORDS_HEADERS,
      headerMatch: headers.length === STUDENT_RECORDS_HEADERS.length && 
                   JSON.stringify(headers) === JSON.stringify(STUDENT_RECORDS_HEADERS),
      totalFields: STUDENT_RECORDS_HEADERS.length,
      filledFields: filledFields.length,
      emptyFields: emptyFields.length,
      emptyFieldsList: emptyFields,
      sampleData: {
        enquiryId: rowData.enquiryId,
        fullName: rowData.fullName,
        quota: rowData.quota,
        firstGrad: rowData.firstGrad,
        govtSchool: rowData.govtSchool,
        courseType: rowData.courseType,
        schoolName: rowData.schoolName,
        registerNumber: rowData.registerNumber,
        medium: rowData.medium,
        yearOfPassing: rowData.yearOfPassing
      },
      fullData: rowData
    }, null, 2)).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("❌ Error in verifyDataMapping: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== DIAGNOSTIC: Check overall sheet structure =====
function checkSheetStructure() {
  try {
    Logger.log("📊 checkSheetStructure() called");
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!studentRecordsSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "StudentRecords sheet not found"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = studentRecordsSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Check header match
    const headerMismatch = [];
    const maxHeaders = Math.max(headers.length, STUDENT_RECORDS_HEADERS.length);
    
    for (let i = 0; i < maxHeaders; i++) {
      const actual = headers[i] || "(missing)";
      const expected = STUDENT_RECORDS_HEADERS[i] || "(extra)";
      
      if (actual !== expected) {
        headerMismatch.push({
          position: i + 1,
          actual: actual,
          expected: expected,
          match: actual === expected
        });
      }
    }
    
    // Sample first 3 students - including ALL FIELDS
    const sampleStudents = [];
    for (let i = 1; i < Math.min(4, data.length); i++) {
      const student = {
        row: i + 1,
        allFields: {}
      };
      
      // Add ALL 60 fields for complete visibility
      for (let j = 0; j < STUDENT_RECORDS_HEADERS.length; j++) {
        const fieldName = STUDENT_RECORDS_HEADERS[j];
        const value = data[i][j] || "(empty)";
        student.allFields[fieldName] = value;
      }
      
      // Also create a summary view with key fields
      student.summary = {
        row: i + 1,
        enquiryId: student.allFields.enquiryId,
        admissionId: student.allFields.admissionId,
        fullName: student.allFields.fullName,
        dob: student.allFields.dob,
        gender: student.allFields.gender,
        studentContact: student.allFields.studentContact,
        community: student.allFields.community,
        caste: student.allFields.caste,
        fatherName: student.allFields.fatherName,
        fatherOccupation: student.allFields.fatherOccupation,
        fatherContact: student.allFields.fatherContact,
        motherContact: student.allFields.motherContact,
        annualIncome: student.allFields.annualIncome,
        address1: student.allFields.address1,
        address2: student.allFields.address2,
        taluk: student.allFields.taluk,
        district: student.allFields.district,
        state: student.allFields.state,
        pincode: student.allFields.pincode,
        lastStudies: student.allFields.lastStudies,
        sslcMarks: student.allFields.sslcMarks,
        schoolName: student.allFields.schoolName,
        govtSchool: student.allFields.govtSchool,
        firstGrad: student.allFields.firstGrad,
        courseType: student.allFields.courseType,
        registerNumber: student.allFields.registerNumber,
        medium: student.allFields.medium,
        yearOfPassing: student.allFields.yearOfPassing,
        subject1: student.allFields.subject1,
        subject1Marks: student.allFields.subject1Marks,
        subject2: student.allFields.subject2,
        subject2Marks: student.allFields.subject2Marks,
        subject3: student.allFields.subject3,
        subject3Marks: student.allFields.subject3Marks,
        subject4: student.allFields.subject4,
        subject4Marks: student.allFields.subject4Marks,
        subject5: student.allFields.subject5,
        subject5Marks: student.allFields.subject5Marks,
        subject6: student.allFields.subject6,
        subject6Marks: student.allFields.subject6Marks,
        totalMarks: student.allFields.totalMarks,
        percentage: student.allFields.percentage,
        cutoff: student.allFields.cutoff,
        eligibility: student.allFields.eligibility,
        preference1: student.allFields.preference1,
        preference2: student.allFields.preference2,
        preference3: student.allFields.preference3,
        quota: student.allFields.quota,
        entry: student.allFields.entry,
        accommodation: student.allFields.accommodation,
        roomType: student.allFields.roomType,
        travelType: student.allFields.travelType,
        busStopName: student.allFields.busStopName,
        busRoute: student.allFields.busRoute,
        busNo: student.allFields.busNo,
        busFees: student.allFields.busFees,
        knowAbout: student.allFields.knowAbout,
        referenceName: student.allFields.referenceName,
        referenceContact: student.allFields.referenceContact,
        dropoutCollege: student.allFields.dropoutCollege,
        dropoutRegisterNo: student.allFields.dropoutRegisterNo,
        dropoutYear: student.allFields.dropoutYear,
        branchAwarded: student.allFields.branchAwarded,
        status: student.allFields.status,
        date: student.allFields.date
      };
      
      sampleStudents.push(student);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      studentRecordsSheet: {
        name: STUDENT_RECORDS_SHEET,
        totalRows: data.length,
        dataRows: Math.max(0, data.length - 1),
        actualColumns: headers.length,
        expectedColumns: STUDENT_RECORDS_HEADERS.length,
        columnsMatch: headers.length === STUDENT_RECORDS_HEADERS.length,
        headerMismatchCount: headerMismatch.length,
        headerMismatches: headerMismatch.slice(0, 10), // Show first 10 mismatches
        headers: headers,
        expectedHeaders: STUDENT_RECORDS_HEADERS
      },
      fieldValidation: {
        totalFields: STUDENT_RECORDS_HEADERS.length,
        sections: [
          { section: "IDENTIFICATION", start: 0, end: 2, fields: STUDENT_RECORDS_HEADERS.slice(0, 2) },
          { section: "BASIC INFORMATION", start: 2, end: 8, fields: STUDENT_RECORDS_HEADERS.slice(2, 8) },
          { section: "FAMILY DETAILS", start: 8, end: 13, fields: STUDENT_RECORDS_HEADERS.slice(8, 13) },
          { section: "ADDRESS INFORMATION", start: 13, end: 19, fields: STUDENT_RECORDS_HEADERS.slice(13, 19) },
          { section: "EDUCATIONAL BACKGROUND", start: 19, end: 25, fields: STUDENT_RECORDS_HEADERS.slice(19, 25) },
          { section: "ACADEMIC SCORES", start: 25, end: 41, fields: STUDENT_RECORDS_HEADERS.slice(25, 41) },
          { section: "COURSE PREFERENCES", start: 41, end: 46, fields: STUDENT_RECORDS_HEADERS.slice(41, 46) },
          { section: "ACCOMMODATION & TRAVEL", start: 46, end: 49, fields: STUDENT_RECORDS_HEADERS.slice(46, 49) },
          { section: "TRANSPORTATION DETAILS", start: 49, end: 53, fields: STUDENT_RECORDS_HEADERS.slice(49, 53) },
          { section: "REFERENCE & RECRUITMENT", start: 53, end: 56, fields: STUDENT_RECORDS_HEADERS.slice(53, 56) },
          { section: "DROPOUT INFORMATION", start: 56, end: 59, fields: STUDENT_RECORDS_HEADERS.slice(56, 59) },
          { section: "ADMISSION & STATUS", start: 59, end: 61, fields: STUDENT_RECORDS_HEADERS.slice(59, 61) },
          { section: "METADATA", start: 61, end: 62, fields: STUDENT_RECORDS_HEADERS.slice(61, 62) }
        ]
      },
      sampleStudents: sampleStudents,
      notes: {
        note1: "Each sample student shows ALL 60 fields in 'allFields' object",
        note2: "Summary view shows the same data in a cleaner format",
        note3: "Empty fields show '(empty)' indicator",
        note4: "Use this to verify all required fields are being populated correctly"
      }
    }, null, 2)).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("❌ Error in checkSheetStructure: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

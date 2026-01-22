// Google Apps Script Code for Student Form Data Management with Enquiry ID System
// This version uses StudentRecords sheet (personal info + scores merged)
// Plus separate sheets for FeesData and AdmittedStudents
// Enquiry ID is the primary identifier instead of email

const SHEET_ID = "17ECtapuVbpM85XTmz2gNBzwvFRcSuETfw_6W-Ds7UKM"; // Update with YOUR Google Sheet ID
const STUDENT_RECORDS_SHEET = "StudentRecords"; // MERGED sheet - personal info + scores combined
const FEES_DATA_SHEET = "FeesData"; // Sheet for fee information
const ADMITTED_STUDENTS_SHEET = "AdmittedStudents"; // Sheet for admitted students only

// Legacy headers removed - using StudentRecords only

// Define merged headers for StudentRecords sheet (Personal Info + Scores combined)
// TOTAL: 61 columns - ONLY ACTUAL FIELDS from student panel forms
const STUDENT_RECORDS_HEADERS = [
  // Personal Information Fields (from PersonalInfo.jsx form)
  "enquiryId",
  "fullName",
  "email",
  "dob",
  "gender",
  "preference1",
  "preference2",
  "preference3",
  "quota",
  "entry",
  "accommodation",
  "roomType",
  "travelType",
  "fatherName",
  "fatherOccupation",
  "fatherContact",
  "motherContact",
  "studentContact",
  "community",
  "caste",
  "annualIncome",
  "address1",
  "address2",
  "taluk",
  "district",
  "state",
  "pincode",
  "sslcMarks",
  "schoolName",
  "govtSchool",
  "lastStudies",
  "firstGrad",
  // Academic Scores Fields (from AcademicScore.jsx form)
  "courseType",
  "registerNumber",
  "medium",
  "yearOfPassing",
  "subject1",
  "subject1Marks",
  "subject2",
  "subject2Marks",
  "subject3",
  "subject3Marks",
  "subject4",
  "subject4Marks",
  "subject5",
  "subject5Marks",
  "subject6",
  "subject6Marks",
  "totalMarks",
  "percentage",
  "cutoff",
  "eligibility",
  // Status & Management Fields
  "status",
  "admissionId",
  "date",
  // Reserved for future extensions (padding)
  "reserved1",
  "reserved2",
  "reserved3",
  "reserved4"
];


// Define headers for FeesData sheet
const FEES_DATA_HEADERS = [
  "enquiryId",
  "admissionId",
  "fullName",
  "tuitionFee",
  "developmentFee",
  "admissionFee",
  "cautionDeposit",
  "optionalFees",
  "scStScholarship",
  "fgScholarship",
  "busFee",
  "messBill",
  "roomRent",
  "laundryCharges",
  "quota",
  "feeSubTotal",
  "feeCollegeTotal",
  "feeHostelTotal",
  "feeOverallTotal",
  "status",
  "date"
];

// Define headers for AdmittedStudents sheet (copy of PersonalInfo for admitted students only)
const ADMITTED_STUDENTS_HEADERS = [
  "admissionId",
  "enquiryId",
  "fullName",
  "email",
  "dob",
  "gender",
  "preference1",
  "preference2",
  "preference3",
  "quota",
  "entry",
  "accommodation",
  "roomType",
  "travelType",
  "fatherName",
  "fatherOccupation",
  "community",
  "caste",
  "annualIncome",
  "address1",
  "address2",
  "taluk",
  "district",
  "state",
  "pincode",
  "fatherContact",
  "motherContact",
  "studentContact",
  "sslcMarks",
  "schoolName",
  "govtSchool",
  "lastStudies",
  "firstGrad",
  "admittedDate"
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
    
    // Initialize FeesData sheet
    let feesSheet = ss.getSheetByName(FEES_DATA_SHEET);
    if (!feesSheet) {
      Logger.log("📄 Creating new " + FEES_DATA_SHEET + " sheet");
      feesSheet = ss.insertSheet(FEES_DATA_SHEET);
      feesSheet.appendRow(FEES_DATA_HEADERS);
      SpreadsheetApp.flush();
      Logger.log("✅ Created " + FEES_DATA_SHEET + " sheet");
    } else {
      Logger.log("📄 " + FEES_DATA_SHEET + " sheet already exists");
      // Ensure all columns exist in existing sheet (migration)
      ensureColumnsExist(feesSheet, FEES_DATA_HEADERS);
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
      { name: FEES_DATA_SHEET, headerCount: FEES_DATA_HEADERS.length },
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
    
    // Action: add personal info data
    if (action === "addPersonalInfo") {
      return addPersonalInfo(e);
    }
    
    // Action: add scores data (independent)
    if (action === "addScoresData") {
      return addScoresData(e);
    }
    
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
    
    // Action: update personal info (for admin panel)
    if (action === "updatePersonalInfo") {
      return updatePersonalInfo(e);
    }
    
    // Action: save merged personal info + scores data (NEW)
    if (action === "saveStudentRecordMerged") {
      return saveStudentRecordMerged(e);
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
    
    // Action: fetch fees data by enquiry ID (optimized single fetch)
    if (action === "getFeeData" && params.enquiryId) {
      return getFeeDataOptimized(params.enquiryId);
    }
    
    // Action: fetch all related data for a student (batch operation - reduces API calls)
    if (action === "getAllStudentData" && params.enquiryId) {
      return getAllStudentDataBatch(params.enquiryId);
    }
    
    // Check if this is a fee data submission with status update
    const feeFields = ["tuitionFee", "developmentFee", "admissionFee", "cautionDeposit", 
                       "optionalFees", "busFee", "messBill", "roomRent", "laundryCharges", 
                       "feeSubTotal", "feeCollegeTotal", "feeHostelTotal", "feeOverallTotal"];
    
    let hasFeeData = false;
    for (const feeField of feeFields) {
      if (params.hasOwnProperty(feeField)) {
        hasFeeData = true;
        break;
      }
    }
    
    // If fee data is present and enquiry ID exists, treat as fee update
    if (hasFeeData && params.enquiryId) {
      Logger.log("💾 Fee data detected in doGet - routing to fees handler");
      Logger.log("📝 Enquiry ID: " + params.enquiryId);
      Logger.log("📝 Status update included: " + (params.status || "no"));
      
      // First: Update personal info if status is provided (this handles admission ID generation)
      let admissionId = null;
      if (params.status && params.status === "Admitted") {
        Logger.log("📋 Status is 'Admitted' - will generate admission ID if needed");
        const personalUpdateResult = updatePersonalInfo(e);
        // Parse response to get admission ID
        try {
          const parseResponse = JSON.parse(personalUpdateResult.getContent());
          if (parseResponse.admissionId) {
            admissionId = parseResponse.admissionId;
            Logger.log("✅ Admission ID from personal info update: " + admissionId);
            // Add admission ID to parameter for fees save
            params.admissionId = admissionId;
          }
        } catch (parseError) {
          Logger.log("⚠️ Could not parse personal update response: " + parseError.toString());
        }
      }
      
      // Second: Save fees data
      const feesResult = saveFeesData(params.enquiryId, params);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: feesResult.success, 
        message: feesResult.message,
        enquiryId: params.enquiryId,
        admissionId: admissionId || params.admissionId || ""
      })).setMimeType(ContentService.MimeType.JSON);
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

function addPersonalInfo(e) {
  try {
    Logger.log("🚀 addPersonalInfo() called");
    Logger.log("📌 Sheet ID: " + SHEET_ID);
    Logger.log("📌 Looking for sheet: '" + STUDENT_RECORDS_SHEET + "'");
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // Log all sheets in the spreadsheet
    const allSheets = ss.getSheets();
    Logger.log("📊 Total sheets in spreadsheet: " + allSheets.length);
    for (let i = 0; i < allSheets.length; i++) {
      Logger.log("  Sheet " + (i + 1) + ": " + allSheets[i].getName());
    }
    
    // Force clear cache BEFORE accessing sheet
    clearSheetCache();
    
    let studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!studentRecordsSheet) {
      Logger.log("❌ StudentRecords sheet not found - initializing...");
      const result = initializeSpreadsheets();
      studentRecordsSheet = result.studentRecordsSheet;
      Logger.log("✅ StudentRecords initialized");
    } else {
      Logger.log("✅ StudentRecords sheet found");
    }
    
    // Verify sheet reference is valid
    if (!studentRecordsSheet) {
      throw new Error("CRITICAL: StudentRecords sheet is null after initialization");
    }
    
    Logger.log("📍 Sheet reference: " + studentRecordsSheet.getName());
    
    const params = e.parameter || {};
    Logger.log("📋 Received parameters: " + JSON.stringify(Object.keys(params)));
    Logger.log("📋 Total params: " + Object.keys(params).length);
    
    // Verify sheet has correct column count
    const currentHeaders = studentRecordsSheet.getRange(1, 1, 1, studentRecordsSheet.getLastColumn()).getValues()[0];
    Logger.log("📊 Current sheet columns: " + currentHeaders.length + " (Expected: " + STUDENT_RECORDS_HEADERS.length + ")");
    
    // Generate new enquiry ID
    const enquiryId = generateEnquiryId();
    Logger.log("🆔 Generated enquiry ID: " + enquiryId);
    
    // Prepare merged row data for StudentRecords
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
    
    Logger.log("📝 Row prepared with " + mergedRow.length + " columns");
    Logger.log("📝 enquiryId value in row: '" + mergedRow[0] + "' (length: " + String(mergedRow[0]).length + ")"); // First column should be enquiryId
    Logger.log("📝 fullName value in row: '" + mergedRow[1] + "'");
    Logger.log("📝 Row data: " + JSON.stringify(mergedRow.slice(0, 5)));
    
    // CRITICAL: Validate row before appending
    if (mergedRow.length !== STUDENT_RECORDS_HEADERS.length) {
      Logger.log("❌ CRITICAL ERROR: Row length mismatch!");
      Logger.log("   Expected: " + STUDENT_RECORDS_HEADERS.length + " columns");
      Logger.log("   Got: " + mergedRow.length + " columns");
      throw new Error("Row length mismatch: expected " + STUDENT_RECORDS_HEADERS.length + " but got " + mergedRow.length);
    }
    
    // Get current row count BEFORE append
    let preAppendData = studentRecordsSheet.getDataRange().getValues();
    Logger.log("📊 BEFORE append: " + preAppendData.length + " rows in sheet");
    const insertRow = preAppendData.length + 1; // Next row number
    
    // Append row to sheet with error handling
    // Method 1: Try appendRow (simpler but sometimes fails)
    try {
      studentRecordsSheet.appendRow(mergedRow);
      Logger.log("✅ appendRow() completed successfully");
    } catch (appendError) {
      Logger.log("⚠️ appendRow() failed, trying alternative method: " + appendError.toString());
      
      // Method 2: Use getRange().setValues() as fallback
      try {
        const range = studentRecordsSheet.getRange(insertRow, 1, 1, mergedRow.length);
        range.setValues([mergedRow]);
        Logger.log("✅ Alternative setValues() method succeeded");
      } catch (setValuesError) {
        Logger.log("❌ Both methods failed!");
        Logger.log("   appendRow error: " + appendError.toString());
        Logger.log("   setValues error: " + setValuesError.toString());
        throw new Error("Failed to append row with both methods");
      }
    }
    
    // Force flush to ensure data is written
    try {
      SpreadsheetApp.flush();
      Logger.log("✅ Spreadsheet.flush() completed");
    } catch (flushError) {
      Logger.log("⚠️ Warning: flush() failed (non-critical): " + flushError.toString());
    }
    
    // CRITICAL: Verify the data was actually saved by re-reading
    let postAppendData = studentRecordsSheet.getDataRange().getValues();
    Logger.log("📊 AFTER append: " + postAppendData.length + " rows in sheet");
    
    if (postAppendData.length <= preAppendData.length) {
      Logger.log("❌ CRITICAL: Row was not appended! Sheet still has " + postAppendData.length + " rows");
      throw new Error("Data persistence failed: row was not appended to sheet");
    }
    
    const lastRow = postAppendData[postAppendData.length - 1];
    Logger.log("✅ Last row enquiryId: '" + lastRow[0] + "'");
    Logger.log("✅ Last row fullName: '" + lastRow[1] + "'");
    Logger.log("✅ Row successfully persisted to sheet");
    
    clearSheetCache();
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Personal information saved successfully",
      enquiryId: enquiryId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("❌ Error in addPersonalInfo: " + error.toString());
    Logger.log("❌ Stack trace: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getPersonalInfo(enquiryId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const enquiryIdIndex = headers.indexOf("enquiryId");
    
    // Find the record with matching enquiry ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][enquiryIdIndex] === enquiryId) {
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = data[i][j] || "";
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
    Logger.log("Error in getPersonalInfo: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
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

function getAllPersonalInfo() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const records = [];
    
    for (let i = 1; i < data.length; i++) {
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = data[i][j] || "";
      }
      records.push(record);
    }
    
    return ContentService.createTextOutput(JSON.stringify(records))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("Error in getAllPersonalInfo: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== OPTIMIZED: Get All Personal Info from StudentRecords (Using cache) =====
function getAllPersonalInfoOptimized() {
  try {
    const sheetData = getSheetDataCached(STUDENT_RECORDS_SHEET);
    
    if (!sheetData || sheetData.data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const records = [];
    for (let i = 1; i < sheetData.data.length; i++) {
      const record = {};
      for (let j = 0; j < sheetData.headers.length; j++) {
        record[sheetData.headers[j]] = sheetData.data[i][j] || "";
      }
      records.push(record);
    }
    
    return ContentService.createTextOutput(JSON.stringify(records))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in getAllPersonalInfoOptimized: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== OPTIMIZED BATCH: Get All Student Data from StudentRecords (Personal + Scores merged in single call) =====
function getAllStudentDataBatch(enquiryId) {
  try {
    Logger.log("🚀 Batch fetching all data for enquiry ID: " + enquiryId);
    
    const studentRecordsData = getSheetDataCached(STUDENT_RECORDS_SHEET);
    const feesSheetData = getSheetDataCached(FEES_DATA_SHEET);
    
    let studentRecord = null;
    let feesInfo = null;
    
    // Get student record (contains both personal info and scores)
    if (studentRecordsData) {
      const enquiryIdIndex = studentRecordsData.headerMap["enquiryId"];
      for (let i = 1; i < studentRecordsData.data.length; i++) {
        if (studentRecordsData.data[i][enquiryIdIndex] === enquiryId) {
          studentRecord = {};
          for (let j = 0; j < studentRecordsData.headers.length; j++) {
            studentRecord[studentRecordsData.headers[j]] = studentRecordsData.data[i][j] || "";
          }
          break;
        }
      }
    }
    
    // Get fees info
    if (feesSheetData) {
      const enquiryIdIndex = feesSheetData.headerMap["enquiryId"];
      for (let i = 1; i < feesSheetData.data.length; i++) {
        if (feesSheetData.data[i][enquiryIdIndex] === enquiryId) {
          feesInfo = {};
          for (let j = 0; j < feesSheetData.headers.length; j++) {
            feesInfo[feesSheetData.headers[j]] = feesSheetData.data[i][j] || "";
          }
          break;
        }
      }
    }
    
    Logger.log("✅ Batch fetch complete - StudentRecord: " + (studentRecord ? "✓" : "✗") + 
               ", Fees: " + (feesInfo ? "✓" : "✗"));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: {
        studentRecord: studentRecord,
        feesInfo: feesInfo
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error in getAllStudentDataBatch: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== MERGED DATA HANDLER: Save Personal Info + Scores Together =====

function saveStudentRecordMerged(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!studentRecordsSheet) {
      const result = initializeSpreadsheets();
      studentRecordsSheet = result.studentRecordsSheet;
    }
    
    const params = e.parameter || {};
    
    // Validate enquiry ID exists
    if (!params.enquiryId) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Enquiry ID is required" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get student records data
    const sheetData = getSheetDataCached(STUDENT_RECORDS_SHEET);
    if (!sheetData) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "StudentRecords sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const enquiryIdIndex = sheetData.headerMap["enquiryId"];
    let rowIndex = -1;
    
    // Check if record already exists
    for (let i = 1; i < sheetData.data.length; i++) {
      if (sheetData.data[i][enquiryIdIndex] === params.enquiryId) {
        rowIndex = i;
        Logger.log("🔄 Found existing StudentRecord at row: " + (rowIndex + 1) + " for enquiry ID: " + params.enquiryId);
        break;
      }
    }
    
    // Prepare row data with ALL merged fields
    const rowData = [];
    for (let i = 0; i < STUDENT_RECORDS_HEADERS.length; i++) {
      const header = STUDENT_RECORDS_HEADERS[i];
      let value = "";
      
      if (header === "enquiryId") {
        value = params.enquiryId;
      } else if (header === "date") {
        value = formatDateForSheet(new Date().toISOString());
      } else if (header === "status") {
        value = params.status || "Submitted";
      } else if (params.hasOwnProperty(header)) {
        value = params[header] || "";
      }
      
      rowData.push(value);
    }
    
    if (rowIndex >= 0) {
      // Update existing record
      Logger.log("📤 Updating StudentRecord at row " + (rowIndex + 1) + " for enquiry ID: " + params.enquiryId);
      studentRecordsSheet.getRange(rowIndex + 1, 1, 1, STUDENT_RECORDS_HEADERS.length).setValues([rowData]);
      Logger.log("✅ Updated merged student record for enquiry ID: " + params.enquiryId);
    } else {
      // Create new record
      Logger.log("📥 Creating new StudentRecord for enquiry ID: " + params.enquiryId);
      studentRecordsSheet.appendRow(rowData);
      Logger.log("✅ Saved merged student record for enquiry ID: " + params.enquiryId);
    }
    
    clearSheetCache();
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Student record (personal + scores) saved successfully",
      enquiryId: params.enquiryId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error in saveStudentRecordMerged: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== SCORES DATA HANDLERS =====

function addScoresData(e) {
  try {
    Logger.log("📊 addScoresData() called");
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // Force clear cache BEFORE accessing sheet
    clearSheetCache();
    
    const params = e.parameter || {};
    
    // Get StudentRecords sheet
    let studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    if (!studentRecordsSheet) {
      Logger.log("❌ StudentRecords sheet not found - initializing...");
      const result = initializeSpreadsheets();
      studentRecordsSheet = result.studentRecordsSheet;
    }
    
    // Check if enquiry ID is provided (for updating existing record)
    let enquiryId = params.enquiryId ? String(params.enquiryId).trim() : null;
    let foundRowIndex = -1;
    
    // If enquiry ID provided, try to find existing record
    if (enquiryId) {
      Logger.log("🔍 enquiryId provided: '" + enquiryId + "' - Will update existing record if found");
      
      const recordsData = studentRecordsSheet.getDataRange().getValues();
      Logger.log("📊 StudentRecords has " + recordsData.length + " rows");
      
      const enquiryIdIndex = recordsData[0].indexOf("enquiryId");
      if (enquiryIdIndex >= 0) {
        // Search for existing record
        for (let i = 1; i < recordsData.length; i++) {
          const rowEnquiryId = String(recordsData[i][enquiryIdIndex]).trim();
          if (rowEnquiryId === enquiryId) {
            Logger.log("✅ Found existing record at row " + (i + 1) + " for enquiry ID: " + enquiryId);
            foundRowIndex = i;
            break;
          }
        }
        
        if (foundRowIndex === -1) {
          Logger.log("⚠️ enquiryId provided but not found in records - will create new row");
        }
      }
    } else {
      Logger.log("📝 No enquiryId provided - Creating new record for scores");
    }
    
    // Prepare row data with ALL score fields
    const recordsData = studentRecordsSheet.getDataRange().getValues();
    const rowData = [];
    
    for (let i = 0; i < STUDENT_RECORDS_HEADERS.length; i++) {
      const header = STUDENT_RECORDS_HEADERS[i];
      let value = "";
      
      if (header === "enquiryId") {
        // Use provided enquiry ID or keep empty for new records
        value = enquiryId || "";
      } else if (header === "date") {
        value = formatDateForSheet(new Date().toISOString());
      } else if (header === "status") {
        value = params.status || "Submitted";
      } else if (params.hasOwnProperty(header)) {
        value = params[header] || "";
      }
      
      rowData.push(value);
    }
    
    // Save or update the record
    if (foundRowIndex >= 0) {
      // Update existing record
      Logger.log("📤 Updating StudentRecord at row " + (foundRowIndex + 1) + " for enquiry ID: " + enquiryId);
      studentRecordsSheet.getRange(foundRowIndex + 1, 1, 1, STUDENT_RECORDS_HEADERS.length).setValues([rowData]);
      SpreadsheetApp.flush();
      Logger.log("✅ Updated StudentRecord with scores");
    } else {
      // Create new record (either no enquiry ID provided, or record not found)
      Logger.log("📥 Creating new StudentRecord for scores");
      
      try {
        studentRecordsSheet.appendRow(rowData);
        Logger.log("✅ appendRow() succeeded");
      } catch (appendError) {
        Logger.log("⚠️ appendRow() failed, trying setValues(): " + appendError.toString());
        const insertRow = recordsData.length + 1;
        const range = studentRecordsSheet.getRange(insertRow, 1, 1, rowData.length);
        range.setValues([rowData]);
        Logger.log("✅ setValues() succeeded");
      }
      
      SpreadsheetApp.flush();
      Logger.log("✅ Created new StudentRecord with scores");
    }
    
    clearSheetCache();
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Scores saved successfully",
      enquiryId: enquiryId || ""
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("❌ Error in addScoresData: " + error.toString());
    Logger.log("❌ Stack: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getScoresData(enquiryId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const enquiryIdIndex = headers.indexOf("enquiryId");
    
    // Find record with matching enquiry ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][enquiryIdIndex] === enquiryId) {
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = data[i][j] || "";
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
    Logger.log("Error in getScoresData: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

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

// ===== UPDATE & DELETE HANDLERS =====

function doPut(e) {
  try {
    const payload = e.parameter || {};
    const enquiryId = payload.enquiryId;
    
    Logger.log("🔍 doPut() called");
    Logger.log("📋 Payload keys: " + Object.keys(payload).join(", "));
    Logger.log("📋 Enquiry ID: " + enquiryId);
    
    if (!enquiryId) {
      Logger.log("❌ No enquiry ID provided");
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Enquiry ID is required for update" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!sheet) {
      Logger.log("❌ StudentRecords sheet not found");
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const enquiryIdIndex = headers.indexOf("enquiryId");
    
    // Check if this is fees data (contains fees fields)
    const feeFields = ["tuitionFee", "developmentFee", "admissionFee", "cautionDeposit", 
                       "optionalFees", "busFee", "messBill", "roomRent", "laundryCharges", 
                       "feeSubTotal", "feeCollegeTotal", "feeHostelTotal", "feeOverallTotal"];
    
    let isFeeData = false;
    for (const feeField of feeFields) {
      if (payload.hasOwnProperty(feeField) && payload[feeField] !== undefined && payload[feeField] !== '') {
        isFeeData = true;
        Logger.log("✅ Detected fee field: " + feeField + " = " + payload[feeField]);
        break;
      }
    }
    
    Logger.log("Fee data detected: " + isFeeData);
    
    // Find and update the row in PersonalInfo sheet
    let foundRow = false;
    let admissionId = null;
    let statusChanged = false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][enquiryIdIndex] === enquiryId) {
        foundRow = true;
        
        // Check if status is being changed to "Admitted" and generate admission ID ONLY then
        const statusIndex = headers.indexOf("status");
        const admissionIdIndex = headers.indexOf("admissionId");
        
        Logger.log("📋 Current status: " + data[i][statusIndex] + " | New status: " + (payload.status || "no change"));
        
        // ONLY generate admission ID if status is changing to "Admitted"
        if (payload.hasOwnProperty("status") && payload.status === "Admitted" && admissionIdIndex !== -1) {
          statusChanged = true;
          // Check if already has admission ID
          if (!data[i][admissionIdIndex] || data[i][admissionIdIndex] === "") {
            const generatedAdmissionId = generateAdmissionId();
            if (generatedAdmissionId) {
              Logger.log("✅ GENERATING ADMISSION ID: " + generatedAdmissionId + " (Status changed to ADMITTED)");
              sheet.getRange(i + 1, admissionIdIndex + 1).setValue(generatedAdmissionId);
              payload.admissionId = generatedAdmissionId;
              admissionId = generatedAdmissionId;
            }
          } else {
            // Already has admission ID, use it
            admissionId = data[i][admissionIdIndex];
            Logger.log("✅ USING EXISTING ADMISSION ID: " + admissionId);
          }
        } else {
          // If status is NOT "Admitted", do NOT generate admission ID
          if (payload.hasOwnProperty("status")) {
            Logger.log("⏭️  Status is: " + payload.status + " | Admission ID will NOT be generated (only on Admitted)");
          }
        }
        
        // Update PersonalInfo fields
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j];
          if (header !== "enquiryId" && payload.hasOwnProperty(header)) {
            sheet.getRange(i + 1, j + 1).setValue(payload[header]);
          }
        }
        
        // Always update the date field to track when changes were made
        const dateIndex = headers.indexOf("date");
        if (dateIndex !== -1) {
          sheet.getRange(i + 1, dateIndex + 1).setValue(formatDateForSheet(new Date().toISOString()));
        }
        
        Logger.log("✅ Updated personal info for enquiry ID: " + enquiryId);
        break;
      }
    }
    
    // ONLY save to AdmittedStudents sheet if status changed to "Admitted"
    if (foundRow && statusChanged && admissionId) {
      Logger.log("👥 SAVING TO ADMITTED STUDENTS SHEET (Status = Admitted) with Admission ID: " + admissionId);
      const admittedResult = saveToAdmittedStudents(enquiryId, payload, admissionId);
      Logger.log("AdmittedStudents save result: " + (admittedResult.success ? "✅ Success" : "❌ Failed") + " - " + admittedResult.message);
    } else if (statusChanged && !admissionId) {
      Logger.log("❌ Status changed to Admitted but failed to generate admission ID");
    }
    
    // If this is fees data, also save to FeesData sheet
    if (isFeeData) {
      Logger.log("💾 Saving fees data for enquiry ID: " + enquiryId);
      const feesResult = saveFeesData(enquiryId, payload);
      Logger.log("Fees data save result: " + (feesResult.success ? "✅ Success" : "❌ Failed") + " - " + feesResult.message);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Data updated successfully. " + feesResult.message,
        enquiryId: enquiryId,
        feesDataSaved: feesResult.success
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (foundRow) {
      // Retrieve updated data to send back to client
      const updatedData = {};
      for (let j = 0; j < headers.length; j++) {
        updatedData[headers[j]] = data[foundRow][j] || "";
      }
      
      Logger.log("✅ Successfully updated all data for enquiry ID: " + enquiryId);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Data updated successfully",
        enquiryId: enquiryId,
        admissionId: admissionId || "",
        status: payload.status || "",
        updatedData: updatedData
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log("❌ Enquiry ID not found in StudentRecords sheet");
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: "Enquiry ID not found" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("❌ Error in doPut: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doDelete(e) {
  try {
    const params = e.parameter || {};
    const enquiryId = params.enquiryId;
    
    if (!enquiryId) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Enquiry ID is required for deletion" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const enquiryIdIndex = data[0].indexOf("enquiryId");
    const admissionIdIndex = data[0].indexOf("admissionId");
    let admissionId = null;
    
    // Find the admission ID before deleting
    for (let i = 1; i < data.length; i++) {
      if (data[i][enquiryIdIndex] === enquiryId) {
        admissionId = data[i][admissionIdIndex];
        break;
      }
    }
    
    // Find and delete the row from StudentRecords (includes all scores data)
    for (let i = 1; i < data.length; i++) {
      if (data[i][enquiryIdIndex] === enquiryId) {
        sheet.deleteRow(i + 1);
        Logger.log("🗑️  Deleted StudentRecords row for enquiry ID: " + enquiryId);
        
        // NOTE: All scores data was part of StudentRecords, so it's deleted above
        
        // Also delete fees data
        const feesSheet = ss.getSheetByName(FEES_DATA_SHEET);
        if (feesSheet) {
          const feesData = feesSheet.getDataRange().getValues();
          const feesEnqIdIndex = feesData[0].indexOf("enquiryId");
          
          for (let j = feesData.length - 1; j >= 1; j--) {
            if (feesData[j][feesEnqIdIndex] === enquiryId) {
              feesSheet.deleteRow(j + 1);
              Logger.log("🗑️  Deleted FeesData row for enquiry ID: " + enquiryId);
            }
          }
        }
        
        // Also delete from AdmittedStudents if admission ID exists
        if (admissionId) {
          const admittedSheet = ss.getSheetByName(ADMITTED_STUDENTS_SHEET);
          if (admittedSheet) {
            const admittedData = admittedSheet.getDataRange().getValues();
            const admittedAdmIdIndex = admittedData[0].indexOf("admissionId");
            
            for (let k = admittedData.length - 1; k >= 1; k--) {
              if (admittedData[k][admittedAdmIdIndex] === admissionId) {
                admittedSheet.deleteRow(k + 1);
                Logger.log("🗑️  Deleted AdmittedStudents row for admission ID: " + admissionId);
              }
            }
          }
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          message: "Data deleted successfully from all sheets" 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: "Enquiry ID not found" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error in doDelete: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== OPTIMIZED: Save Fees Data (Batch operations, fewer sheet reads) =====

function saveFeesData(enquiryId, feesData) {
  try {
    Logger.log("📝 saveFeesData() called for enquiry ID: " + enquiryId);
    Logger.log("📝 Received status: " + feesData.status);
    Logger.log("📝 Received admission ID: " + feesData.admissionId);
    
    let feesSheet = getSheetByNameCached(FEES_DATA_SHEET);
    
    // Initialize FeesData sheet if it doesn't exist
    if (!feesSheet) {
      Logger.log("⚠️ FeesData sheet not found, creating it...");
      const ss = SpreadsheetApp.openById(SHEET_ID);
      feesSheet = ss.insertSheet(FEES_DATA_SHEET);
      feesSheet.appendRow(FEES_DATA_HEADERS);
      clearSheetCache();
      sheetCache[FEES_DATA_SHEET] = feesSheet;
      Logger.log("✅ Created " + FEES_DATA_SHEET + " sheet");
      formatSheets();
    }
    
    const sheetData = getSheetDataCached(FEES_DATA_SHEET);
    const enquiryIdIndex = sheetData.headerMap["enquiryId"];
    
    // Check if fees data already exists for this enquiry ID
    let rowIndex = -1;
    for (let i = 1; i < sheetData.data.length; i++) {
      if (sheetData.data[i][enquiryIdIndex] === enquiryId) {
        rowIndex = i;
        Logger.log("🔄 Found existing fee record at row: " + (rowIndex + 1));
        break;
      }
    }
    
    // Prepare row data
    const rowData = [];
    for (const header of sheetData.headers) {
      let value = "";
      
      if (header === "enquiryId") {
        value = enquiryId;
      } else if (header === "date") {
        value = formatDateForSheet(new Date().toISOString());
      } else if (feesData.hasOwnProperty(header)) {
        value = feesData[header] || "";
      }
      
      rowData.push(value);
    }
    
    if (rowIndex >= 0) {
      // Update existing row - batch operation
      Logger.log("📤 Updating existing fee record at row " + (rowIndex + 1));
      sheetData.sheet.getRange(rowIndex + 1, 1, 1, sheetData.headers.length).setValues([rowData]);
      Logger.log("✅ Updated fees data for enquiry ID: " + enquiryId);
    } else {
      // Append new row
      Logger.log("📥 Creating new fee record");
      sheetData.sheet.appendRow(rowData);
      Logger.log("✅ Saved fees data for enquiry ID: " + enquiryId);
    }
    
    clearSheetCache(); // Clear cache after save
    
    return {
      success: true,
      message: "Fees data saved successfully"
    };
    
  } catch (error) {
    Logger.log("❌ Error saving fees data: " + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

function getFeeData(enquiryId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let feesSheet = ss.getSheetByName(FEES_DATA_SHEET);
    
    if (!feesSheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Fees data not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = feesSheet.getDataRange().getValues();
    const headers = data[0];
    const enquiryIdIndex = headers.indexOf("enquiryId");
    
    // Find the record with matching enquiry ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][enquiryIdIndex] === enquiryId) {
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = data[i][j] || "";
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          data: record 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Fee data for enquiry ID not found" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error in getFeeData: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== OPTIMIZED: Get Fee Data (Single read, faster) =====
function getFeeDataOptimized(enquiryId) {
  try {
    const sheetData = getSheetDataCached(FEES_DATA_SHEET);
    if (!sheetData) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Fees data not found" 
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
      error: "Fee data for enquiry ID not found" 
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in getFeeDataOptimized: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== OPTIMIZED: Save to Admitted Students (Uses cached data) =====

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

function migrateExistingData() {
  try {
    Logger.log("🔄 Starting data migration to StudentRecords...");
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // Initialize StudentRecords
    const studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    if (studentRecordsSheet) {
      Logger.log("✓ StudentRecords sheet already exists");
    } else {
      Logger.log("Creating " + STUDENT_RECORDS_SHEET + " sheet...");
      const newSheet = ss.insertSheet(STUDENT_RECORDS_SHEET);
      newSheet.appendRow(STUDENT_RECORDS_HEADERS);
      Logger.log("✅ Created " + STUDENT_RECORDS_SHEET + " sheet");
    }
    
    // Migrate FeesData
    const feesSheet = ss.getSheetByName(FEES_DATA_SHEET);
    if (feesSheet) {
      Logger.log("✓ FeesData sheet already exists");
    } else {
      Logger.log("Creating " + FEES_DATA_SHEET + " sheet...");
      const newSheet = ss.insertSheet(FEES_DATA_SHEET);
      newSheet.appendRow(FEES_DATA_HEADERS);
      Logger.log("✅ Created " + FEES_DATA_SHEET + " sheet");
    }
    
    // Initialize AdmittedStudents if missing
    const admittedSheet = ss.getSheetByName(ADMITTED_STUDENTS_SHEET);
    if (!admittedSheet) {
      Logger.log("Creating " + ADMITTED_STUDENTS_SHEET + " sheet...");
      const newSheet = ss.insertSheet(ADMITTED_STUDENTS_SHEET);
      newSheet.appendRow(ADMITTED_STUDENTS_HEADERS);
      formatSheets();
      Logger.log("✅ Created " + ADMITTED_STUDENTS_SHEET + " sheet");
    }
    
    // NOTE: Legacy PersonalInfo and ScoresData sheets no longer used
    // All data is now stored in StudentRecords sheet
    Logger.log("✅ Data migration to StudentRecords complete!");
    
  } catch (error) {
    Logger.log("❌ Migration error: " + error.toString());
  }
}

function testConnection() {
  try {
    Logger.log("Testing connection...");
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    const feesSheet = ss.getSheetByName(FEES_DATA_SHEET);
    const admittedSheet = ss.getSheetByName(ADMITTED_STUDENTS_SHEET);
    
    Logger.log("✓ StudentRecords sheet: " + (studentRecordsSheet ? "OK" : "MISSING"));
    Logger.log("✓ FeesData sheet: " + (feesSheet ? "OK" : "MISSING"));
    Logger.log("✓ AdmittedStudents sheet: " + (admittedSheet ? "OK" : "MISSING"));
    
    if (studentRecordsSheet) {
      const data = studentRecordsSheet.getDataRange().getValues();
      Logger.log("  - StudentRecords rows: " + data.length);
      Logger.log("  - StudentRecords columns: " + data[0].length);
    }
    
    Logger.log("✓ Connection test PASSED");
    
  } catch (error) {
    Logger.log("✗ Connection test FAILED: " + error.toString());
  }
}

function getStats() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const studentRecordsSheet = ss.getSheetByName(STUDENT_RECORDS_SHEET);
    const feesSheet = ss.getSheetByName(FEES_DATA_SHEET);
    const admittedSheet = ss.getSheetByName(ADMITTED_STUDENTS_SHEET);
    
    Logger.log("=== SYSTEM STATISTICS ===");
    
    if (studentRecordsSheet) {
      const data = studentRecordsSheet.getDataRange().getValues();
      Logger.log("\nStudentRecords Sheet:");
      Logger.log("  Total Records: " + (data.length - 1));
      Logger.log("  Columns: " + data[0].length);
    }
    
    if (feesSheet) {
      const data = feesSheet.getDataRange().getValues();
      Logger.log("\nFeesData Sheet:");
      Logger.log("  Total Records: " + (data.length - 1));
      Logger.log("  Columns: " + data[0].length);
    }
    
    if (admittedSheet) {
      const data = admittedSheet.getDataRange().getValues();
      Logger.log("\nAdmittedStudents Sheet:");
      Logger.log("  Total Records: " + (data.length - 1));
      Logger.log("  Columns: " + data[0].length);
    }
    
    Logger.log("\n=== END STATISTICS ===");
    
  } catch (error) {
    Logger.log("✗ Error getting stats: " + error.toString());
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

function getAllStudentsForVerification() {
  try {
    Logger.log("📋 getAllStudentsForVerification() called");
    
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
    
    const students = [];
    
    // Get column indices
    const enquiryIdIndex = headers.indexOf("enquiryId");
    const fullNameIndex = headers.indexOf("fullName");
    const emailIndex = headers.indexOf("email");
    const courseTypeIndex = headers.indexOf("courseType");
    const dateIndex = headers.indexOf("date");
    
    // Extract all student records
    for (let i = 1; i < data.length; i++) {
      students.push({
        row: i + 1,
        enquiryId: data[i][enquiryIdIndex] || "",
        fullName: data[i][fullNameIndex] || "",
        email: data[i][emailIndex] || "",
        courseType: data[i][courseTypeIndex] || "(not submitted)",
        dateSubmitted: data[i][dateIndex] || "",
        hasScores: data[i][courseTypeIndex] ? "✅ Yes" : "⏳ No"
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      totalStudents: students.length,
      timestamp: new Date().toISOString(),
      students: students
    }, null, 2)).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("❌ Error in getAllStudentsForVerification: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

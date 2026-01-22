import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDocument, StandardFonts, PDFName } from 'pdf-lib';
import PDFPreviewModal from './PDFPreviewModal';
import DiplomaScoresEdit from './DiplomaScoresEdit';
import Nav from "../Nav";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlKdwAYiJ-Cw_Iy3ntPJrZgj2AhCD7XN8ekA4FYmyxHmIVjtkZZBR-SmDas7mfRaPR5g/exec";

// Format ISO date to readable format
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return "N/A";
  }
};

export default function EditApplicationModal({
  isOpen,
  onClose,
  applicationData,
  onUpdateSuccess
}) {
  const navigate = useNavigate();
  const [editData, setEditData] = useState(applicationData || {});
  const [scoresData, setScoresData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // Bus stop autocomplete states
  const [busStopsData, setBusStopsData] = useState([]);
  const [busStopSearch, setBusStopSearch] = useState('');
  const [busStopSuggestions, setBusStopSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Helper: keep only latest score row per courseType (or per index fallback)
  const getLatestScoresByCourse = (rows) => {
    if (!Array.isArray(rows)) return [];

    const latestByKey = {};

    rows.forEach((row, index) => {
      const key = row.courseType || `row-${index}`;
      const existing = latestByKey[key];

      if (!existing) {
        latestByKey[key] = row;
        return;
      }

      const existingTime = new Date(existing.date || 0).getTime();
      const currentTime = new Date(row.date || 0).getTime();

      // If both dates invalid, prefer the later row in the sheet
      if (isNaN(existingTime) && isNaN(currentTime)) {
        latestByKey[key] = row;
      } else if (currentTime >= existingTime || isNaN(existingTime)) {
        latestByKey[key] = row;
      }
    });

    return Object.values(latestByKey);
  };

  const degree = [
    { id: 1, department: "AD(Artificial and Data Science Engineering)" },
    { id: 2, department: "AGRI(Agricultural Engineering)" },
    { id: 3, department: "BME(Bio-Medical Engineering)" },
    { id: 4, department: "CSE(Computer Science and Engineering)" },
    { id: 5, department: "CIVIL(Civil Engineering)" },
    { id: 6, department: "ECE(Electronics and Communication Engineering )" },
    { id: 7, department: "EEE(Electrical and Electronics Engineering)" },
    { id: 8, department: "IT(Information Technology)" },
    { id: 9, department: "MECH(Mechanical Engineering)" },
  ];

  // Sync editData with applicationData when modal opens or data changes
  useEffect(() => {
    if (applicationData) {
      setEditData(applicationData);
      // Set bus stop search to existing value
      setBusStopSearch(applicationData.busStopName || '');
      
      // Fetch scores for this student
      if (applicationData.enquiryId) {
        fetchStudentScores(applicationData.enquiryId);
      }
    }
  }, [applicationData]);

  // Auto-calculate academic totals/cutoff/eligibility when subject marks change
  useEffect(() => {
    const { totalMarks, percentage, cutoff, eligibility } = computeDerivedScores(scoresData);

    const updates = {};
    if (totalMarks !== (scoresData.totalMarks ?? 0)) updates.totalMarks = totalMarks;
    if (percentage !== (scoresData.percentage ?? "")) updates.percentage = percentage;
    if (cutoff !== (scoresData.cutoff ?? "")) updates.cutoff = cutoff;
    if (eligibility !== (scoresData.eligibility ?? "")) updates.eligibility = eligibility;

    if (Object.keys(updates).length > 0) {
      setScoresData((prev) => ({ ...prev, ...updates }));
    }
  }, [
    scoresData.subject1Marks,
    scoresData.subject2Marks,
    scoresData.subject3Marks,
    scoresData.subject4Marks,
    scoresData.subject5Marks,
    scoresData.subject6Marks,
    scoresData.subject1,
    scoresData.subject2,
    scoresData.subject3,
    scoresData.subject4,
    scoresData.subject5,
    scoresData.subject6,
  ]);

  // Fetch scores data from Google Sheet
  const fetchStudentScores = async (enquiryId) => {
    try {
      const url = GOOGLE_SCRIPT_URL + "?action=getScoresData&enquiryId=" + encodeURIComponent(enquiryId);
      const response = await fetch(url);
      const responseData = await response.json();
      
      let rawScores = [];

      if (responseData.success && Array.isArray(responseData.data)) {
        rawScores = responseData.data;
      } else if (Array.isArray(responseData)) {
        // In case the response is directly an array
        rawScores = responseData;
      } else {
        setScoresData({});
        return;
      }

      const latestScores = getLatestScoresByCourse(rawScores);
      // Convert array to object, using the first (latest) score
      const scoresObject = latestScores.length > 0 ? latestScores[0] : {};
      setScoresData(scoresObject);
    } catch (error) {
      console.error("Error fetching scores:", error);
      setScoresData({});
    }
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (error) {
      return "N/A";
    }
  };

  // Load bus stops data from csv.json
  useEffect(() => {
    const loadBusStops = async () => {
      try {
        const response = await fetch('/busData.json');
        const data = await response.json();
        setBusStopsData(data);
      } catch (error) {
        console.error('Error loading bus stops data:', error);
      }
    };
    loadBusStops();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.bus-stop-autocomplete')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Hide native number input spinners for a cleaner UI
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input.no-spin::-webkit-outer-spin-button,
      input.no-spin::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input.no-spin {
        -moz-appearance: textfield;
        appearance: textfield;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle bus stop search input
  const handleBusStopSearch = (e) => {
    const searchValue = e.target.value;
    setBusStopSearch(searchValue);
    
    if (searchValue.length >= 3) {
      const filtered = busStopsData.filter(stop => 
        stop.busStopName && stop.busStopName.toLowerCase().includes(searchValue.toLowerCase())
      );
      setBusStopSuggestions(filtered.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setBusStopSuggestions([]);
      setShowSuggestions(false);
      if (searchValue.length === 0) {
        setEditData(prev => ({
          ...prev,
          busStopName: '',
          busRoute: '',
          busNo: '',
          busFees: ''
        }));
      }
    }
  };

  // Handle bus stop selection from suggestions
  const handleBusStopSelect = (stop) => {
    setBusStopSearch(stop.busStopName);
    setEditData(prev => ({
      ...prev,
      busStopName: stop.busStopName,
      busRoute: stop.route,
      busNo: stop.routeNo.toString(),
      busFees: stop.semFees.toString()
    }));
    setShowSuggestions(false);
    setBusStopSuggestions([]);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => {
      const updated = { ...prev, [field]: value };

      // Reset subsequent preferences when a preference is changed
      if (field === 'preference1') {
        // If preference1 changes, reset preference2 and preference3
        updated.preference2 = '';
        updated.preference3 = '';
      } else if (field === 'preference2') {
        // If preference2 changes, reset preference3
        updated.preference3 = '';
      }

      // Handle gender-based accommodation logic
      if (field === 'gender') {
        // Reset accommodation when gender changes
        updated.accommodation = '';
        updated.roomType = '';
        updated.travelType = '';
      }

      // Clear dropout specifics when study type changes away from dropout
      if (field === 'lastStudies' && value !== 'Dropout') {
        updated.dropoutCollege = '';
        updated.dropoutRegisterNo = '';
        updated.dropoutYear = '';
      }

      // Handle accommodation changes
      if (field === 'accommodation') {
        if (value === 'DayScholar') {
          updated.roomType = '';
        } else if (value === 'BoysHostel' || value === 'GirlsHostel') {
          updated.travelType = '';
        }
      }

      return updated;
    });
  };

  // Convert date to yyyy-MM-dd format for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    // If it's already in yyyy-MM-dd format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    // Parse the date
    let date;
    // Check if it's in dd-MM-yyyy format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      date = new Date(`${year}-${month}-${day}`);
    } else {
      // Otherwise, assume ISO timestamp or other format
      date = new Date(dateString);
    }

    // Return in yyyy-MM-dd format for HTML date input
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert date to DD-MM-YYYY format for PDF
  const formatDateForPDF = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // --- Academic scores derived metrics (admin tab) ---
  const parseMark = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const computeDerivedScores = (data) => {
    const subjectIndexes = [1, 2, 3, 4, 5, 6];

    // Consider only subjects that have a name; fallback to all six if none named
    const availableSubjects = subjectIndexes.filter((i) => data[`subject${i}`]);
    const subjectsToUse = availableSubjects.length > 0 ? availableSubjects : subjectIndexes;

    const marks = subjectsToUse.map((i) => parseMark(data[`subject${i}Marks`]));
    const totalMarks = marks.reduce((sum, m) => sum + m, 0);

    const maxPossible = subjectsToUse.length * 100;
    const percentage = maxPossible > 0 ? ((totalMarks / maxPossible) * 100).toFixed(2) : "";

    // Cutoff: Maths + (Physics/2) + (Chemistry/2)
    const math = parseMark(data.subject3Marks); // Mathematics
    const physics = parseMark(data.subject4Marks); // Physics
    const chemistry = parseMark(data.subject5Marks); // Chemistry
    const cutoff = math || physics || chemistry ? (math + physics / 2 + chemistry / 2).toFixed(2) : "";

    // Engineering Eligibility: (Maths + Physics + Chemistry) / 3
    const eligibility = math || physics || chemistry ? ((math + physics + chemistry) / 3).toFixed(2) : "";

    return { totalMarks, percentage, cutoff, eligibility };
  };

  const generateFilledPDF = async () => {
    /*
     */
    try {
      // Load the PDF template
      const templatePath = '/src/assets/admission-form-template.pdf';
      const existingPdfBytes = await fetch(templatePath).then(res => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      const defaultFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Resolve actual PDF field names (many are nested like "undefined.name")
      const resolveFieldName = (fieldName) => {
        const exact = fields.find((field) => field.getName() === fieldName);
        if (exact) return exact.getName();

        const suffixMatches = fields.filter((field) => field.getName().endsWith(`.${fieldName}`));
        if (suffixMatches.length === 1) {
          return suffixMatches[0].getName();
        }

        if (suffixMatches.length > 1) {
          console.warn(
            `Field '${fieldName}' matched multiple PDF fields: ${suffixMatches
              .map((field) => field.getName())
              .join(', ')}`
          );
        } else {
          console.warn(`Field '${fieldName}' not found in the PDF template`);
        }
        return null;
      };
      
      console.log(`📄 PDF Template loaded: ${fields.length} total fields`);

      const pickValue = (...keys) => {
        for (const key of keys) {
          const value = editData?.[key];
          if (value !== undefined && value !== null && value !== '') {
            return String(value);
          }
        }
        return '';
      };

      const studiesHints = [editData?.lastStudies, editData?.typeStudies, editData?.studyType]
        .map((value) => (typeof value === 'string' ? value.toLowerCase() : ''));
      const isVocational = studiesHints.some((hint) => hint.includes('vocational'));
      const isDiploma = studiesHints.some((hint) => hint.includes('diploma'));

      const chooseDiplomaValue = (diplomaKey, ...otherKeys) => {
        return isDiploma
          ? pickValue(diplomaKey, ...otherKeys)
          : pickValue(...otherKeys, diplomaKey);
      };

      // Helper function to set checkbox in a checkbox group (radio-style)
      const setCheckboxInGroup = (fieldName, exportValue) => {
        try {
          const actualName = resolveFieldName(fieldName);
          if (!actualName) return false;
          
          const field = form.getField(actualName);
          const acroField = field.acroField;
          const kidsArray = acroField.Kids();

          if (!kidsArray) {
            console.warn(`No widgets found for ${fieldName}`);
            return false;
          }

          const numKids = kidsArray.size();
          let foundMatch = false;

          for (let i = 0; i < numKids; i++) {
            try {
              const widget = kidsArray.lookup(i);
              if (!widget) continue;

              const ap = widget.lookup(PDFName.of('AP'));
              if (ap) {
                const n = ap.lookup(PDFName.of('N'));
                if (n && n.entries) {
                  for (const [key, val] of n.entries()) {
                    const keyStr = key.decodeText ? key.decodeText() : key.toString().replace(/^\//, '');
                    if (keyStr === exportValue && keyStr !== 'Off') {
                      widget.set(PDFName.of('AS'), PDFName.of(exportValue));
                      console.log(`✓ ${fieldName} = ${exportValue}`);
                      foundMatch = true;
                      break;
                    }
                  }
                }
              }
            } catch (widgetError) {
              continue;
            }
          }

          if (!foundMatch) {
            console.warn(`⚠ Export value '${exportValue}' not found in ${fieldName}`);
          }
          return foundMatch;
        } catch (error) {
          console.warn(`✗ Could not set ${fieldName}:`, error.message);
          return false;
        }
      };

      // Helper function to safely set text field value
      const setTextField = (fieldName, value) => {
        try {
          const actualName = resolveFieldName(fieldName);
          if (!actualName) return;
          
          const field = form.getTextField(actualName);
          if (field && value !== undefined && value !== null && value !== '') {
            field.setText(String(value));
            console.log(`✓ ${fieldName} = ${value}`);
          }
        } catch (error) {
          console.warn(`✗ Could not set text field '${fieldName}':`, error.message);
        }
      };

      // Helper function to set checkbox
      const setCheckbox = (fieldName, checked) => {
        try {
          const actualName = resolveFieldName(fieldName);
          if (!actualName) return;
          
          const field = form.getCheckBox(actualName);
          if (field) {
            if (checked) {
              field.check();
              console.log(`✓ ${fieldName} checked`);
            } else {
              field.uncheck();
            }
          }
        } catch (error) {
          console.warn(`✗ Could not set checkbox '${fieldName}':`, error.message);
        }
      };

      // Map data to PDF fields
      console.log('📝 Filling PDF form fields...\n');

      // Basic Information
      setTextField('admission-id', editData.id || '');
      setTextField('date', formatDateForPDF(new Date()));
      setTextField('name', editData.fullName || '');
      setTextField('date-of-birth', formatDateForPDF(editData.dob));

      // Gender - checkbox group
      if (editData.gender === 'Male') {
        setCheckboxInGroup('gender', 'male');
      } else if (editData.gender === 'Female') {
        setCheckboxInGroup('gender', 'female');
      }

      // Department checkboxes - Each has its own unique field name
      const deptMapping = {
        // Short format
        'AI & DS': 'ad-dept',
        'BME': 'bme-dept',
        'Civil': 'civil-dept',
        'CSE': 'cse-dept',
        'ECE': 'ece-dept',
        'EEE': 'eee-dept',
        'IT': 'it-dept',
        'Mechanical': 'mech-dept',
        'Agriculture': 'age-dept',
        // Full format (with descriptions)
        'AD(Artificial and Data Science Engineering)': 'ad-dept',
        'BME(Bio Medical Engineering)': 'bme-dept',
        'BME(Bio-Medical Engineering)': 'bme-dept',
        'CIVIL(Civil Engineering)': 'civil-dept',
        'CSE(Computer Science and Engineering)': 'cse-dept',
        'ECE(Electronics and Communication Engineering)': 'ece-dept',
        'EEE(Electrical and Electronics Engineering)': 'eee-dept',
        'IT(Information Technology)': 'it-dept',
        'MECH(Mechanical Engineering)': 'mech-dept',
        'AGRI(Agricultural Engineering)': 'age-dept'
      };

      console.log('📋 Branch Preferences:', {
        pref1: editData.preference1,
        pref2: editData.preference2,
        pref3: editData.preference3
      });

      // Check the selected department checkboxes (like Python: widget.field_value = True)
      const preferences = [editData.preference1, editData.preference2, editData.preference3];

      preferences.forEach((pref, index) => {
        if (pref && deptMapping[pref]) {
          const fieldName = deptMapping[pref];

          try {
            const checkbox = form.getCheckBox(fieldName);
            checkbox.check();
            console.log(`✓ ${fieldName}`);
          } catch (error) {
            console.warn(`✗ Could not check ${fieldName}:`, error.message);
          }
        }
      });

      // Branch awarded text field
      setTextField('branch-awarded', editData.branchAwarded || '');

      // Admission type - checkbox group
      if (editData.entry === 'I Year') {
        setCheckboxInGroup('admission-type', 'I-year');
      } else if (editData.entry === 'Lateral Entry') {
        setCheckboxInGroup('admission-type', 'lateral-entry');
      }

      // Family Details
      setTextField('father/guardian-name', editData.fatherName || '');
      setTextField('father/guardian-occupation', editData.fatherOccupation || '');
      setTextField('family-income', editData.annualIncome || '');
      setTextField('caste', editData.caste || '');

      // Community - checkbox group (like Python: check 'bc' for BC community)
      const communityMap = {
        'OC': 'oc',
        'BC': 'BC',
        'BCM': 'bcm',
        'MBC': 'mbc',
        'SC': 'sc',
        'SCA': 'sca',
        'SCC': 'scc',
        'ST': 'st'
      };
      if (editData.community && communityMap[editData.community]) {
        setCheckboxInGroup('community', communityMap[editData.community]);
      }

      // Seat Type - checkbox group (government/management)
      if (editData.quota === 'Government') {
        setCheckboxInGroup('seat-type', 'governement');
      } else if (editData.quota === 'Management') {
        setCheckboxInGroup('seat-type', 'management');
      }

      // Government eligible (Govt School 6th-12th) - checkbox group
      if (editData.govtSchool === 'Yes') {
        setCheckboxInGroup('govt-eligible', 'yes');
      } else if (editData.govtSchool === 'No') {
        setCheckboxInGroup('govt-eligible', 'no');
      }

      // First graduate - checkbox group
      if (editData.firstGrad === 'Yes') {
        setCheckboxInGroup('first-graduate', 'yes');
      } else if (editData.firstGrad === 'No') {
        setCheckboxInGroup('first-graduate', 'no');
      }

      // Student type - checkbox group (like Python: check 'college-bus')
      // Note: days-scholar does not exist in PDF, only: boys-hostel, girls-hostel, out-bus, college-bus
      const studentTypeMap = {
        'BoysHostel': 'boys-hostel',
        'GirlsHostel': 'girls-hostel'
      };

      if (editData.accommodation && studentTypeMap[editData.accommodation]) {
        setCheckboxInGroup('student-type', studentTypeMap[editData.accommodation]);
      }
      
      // Day Scholar checkbox
      if (editData.accommodation === 'DayScholar') {
        setCheckbox('student-type.days-scholar', true);
      }

      // Travel type (college-bus or out-bus)
      if (editData.travelType === 'CollegeBus') {
        setCheckboxInGroup('student-type', 'college-bus');
      } else if (editData.travelType === 'OutBus') {
        setCheckboxInGroup('student-type', 'out-bus');
      }

      setTextField('bus-stop', editData.busStopName || editData.busStop || '');

      // Address Details
      setTextField('address-line-1', editData.address1 || '');
      setTextField('address-line-2', editData.address2 || '');
      setTextField('taluk', editData.taluk || '');
      setTextField('district', editData.district || '');
      setTextField('state', editData.state || '');
      setTextField('pin-code', editData.pincode || '');

      // Contact Numbers
      setTextField('contact-No-(father)', editData.fatherContact || '');
      setTextField('contact-No-(mother)', editData.motherContact || '');
      setTextField('contact-No-(student)', editData.studentContact || '');

      // === ACADEMIC DETAILS MAPPING ===
      console.log('📚 Mapping academic details from scoresData...\n');
      
      // Educational institution details (use scoresData if available, otherwise fallback to editData)
      setTextField(
        'name-and-place-of-college',
        scoresData?.schoolName || chooseDiplomaValue('diplomaInstitution', 'schoolName', 'vocationalSchoolName', 'nameAndPlaceOfCollege')
      );
      setTextField(
        'register-no',
        scoresData?.registerNumber || chooseDiplomaValue('diplomaRegisterNo', 'registrationNo', 'registerNumber', 'registerNo')
      );
      setTextField('type-studies', scoresData?.courseType || pickValue('lastStudies', 'typeStudies'));
      setTextField(
        'medium-of-study',
        scoresData?.medium || (chooseDiplomaValue('diplomaProgram', 'mediumOfStudy', 'vocationalMediumOfStudy', 'medium') || 'English')
      );
      setTextField(
        'year-of-passing',
        scoresData?.yearOfPassing || chooseDiplomaValue('diplomaCompletionYear', 'yearOfPassing', 'vocationalYearOfPassing', 'passingYear')
      );

      // SSLC Marks
      setTextField('sslc-mark', editData.sslcMarks || '');
      
      // Calculate SSLC Percentage (divide by 5 and format to 2 decimal points)
      const sslcPercentage = editData.sslcMarks ? (parseFloat(editData.sslcMarks) / 5).toFixed(2) : '';
      setTextField('sslc-percentage', sslcPercentage);

      // HSC/CBSE Marks - Use scoresData if available, otherwise fallback to editData
      const chooseMarks = (vocationalKey, academicKey) => {
        return isVocational
          ? pickValue(vocationalKey, academicKey)
          : pickValue(academicKey, vocationalKey);
      };

      // Map subject marks from scoresData object
      const subjectFieldMappings = [
        ['tamil', scoresData?.subject1Marks || chooseMarks('vocationalTamilMarks', 'tamilMarks')],
        ['english', scoresData?.subject2Marks || chooseMarks('vocationalEnglishMarks', 'englishMarks')],
        ['physics', scoresData?.subject3Marks || chooseMarks('vocationalSubject3Marks', 'physicsMarks')],
        ['chemistry', scoresData?.subject4Marks || chooseMarks('vocationalSubject4Marks', 'chemistryMarks')],
        ['maths', scoresData?.subject5Marks || chooseMarks('vocationalSubject5Marks', 'mathsMarks')],
        ['computer-science/biology', scoresData?.subject6Marks || chooseMarks('vocationalSubject6Marks', 'csOrBioMarks')]
      ];

      subjectFieldMappings.forEach(([field, value]) => {
        setTextField(field, value);
      });
      
      // HSC Total and Percentage (use scoresData first, then fallback to vocational/other totals)
      const hscTotalValue = scoresData?.totalMarks || chooseMarks('vocationalTotalMarks', 'hscTotalMarks');
      const hscPercentageValue = scoresData?.percentage || chooseMarks('vocationalPercentage', 'hscPercentage');
      const cutoffValue = scoresData?.cutoff || chooseMarks('vocationalCutoff', 'cutoffMarks');
      setTextField('hsc-total-mark', hscTotalValue);
      setTextField('hsc-mark-percentage', hscPercentageValue);
      setTextField('cutoff', cutoffValue);

      // Diploma marks (conditional - only for diploma students)
      if (editData.lastStudies === 'Diploma') {
        setTextField('diploma-1-to-5-sem', editData.fifthSemMarks || '');
        setTextField('diploma-1-to-6-sem', editData.sixthSemMarks || '');
      }

      // Engineering eligibility/cutoff
      setTextField('engineering-eligibility', scoresData?.eligibility || cutoffValue);

      // Reference Information
      setTextField('know-about-this-college', editData.knowAbout || '');
      setTextField('reference-name', editData.referenceName || '');
      setTextField('reference-contact-no', editData.referenceContact || '');

      // === FEE STRUCTURE MAPPING ===
      console.log('💰 Mapping fee structure...\n');

      if (editData.quota === 'Government') {
        // Government seat fees
        setTextField('government-tuition-fee', editData.tuitionFee || '');
        setTextField('government-development-fee', editData.developmentFee || '');
        setTextField('government-admission-fee', editData.admissionFee || '');
        setTextField('government-caution deposit-fee', editData.cautionDeposit || '');
        setTextField('government-optional-fee', editData.optionalFees || '');
        
        // Scholarships
        setTextField('government-sc/st-scholorship', editData.scStScholarship || '');
        setTextField('government-first-graduate-fee', editData.fgScholarship || '');
        
        // Transportation & Hostel
        setTextField('government-bus-fee', editData.busFee || '');
        setTextField('government-mess-bill', editData.messBill || '');
        setTextField('government-room-rent', editData.roomRent || '');
        setTextField('government-laundry-fee', editData.laundryCharges || '');
        
        // Totals
        setTextField('government-tuition-total-fee', editData.feeSubTotal || '');
        setTextField('government-college-total-fee', editData.feeCollegeTotal || '');
        setTextField('government-total-hostel-fee', editData.feeHostelTotal || '');
        setTextField('government-overall-fee', editData.feeOverallTotal || '');
        
        console.log('✓ Government fee structure mapped');
        
      } else if (editData.quota === 'Management') {
        // Management seat fees
        setTextField('management-tuition-fee', editData.tuitionFee || '');
        setTextField('management-development-fee', editData.developmentFee || '');
        setTextField('management-admission-fee', editData.admissionFee || '');
        setTextField('management-caution deposit-fee', editData.cautionDeposit || '');
        setTextField('management-optional-fee', editData.optionalFees || '');
        
        // Scholarships
        setTextField('management-sc/st-scholorship', editData.scStScholarship || '');
        setTextField('management-first-graduate-fee', editData.fgScholarship || '');
        
        // Transportation & Hostel
        setTextField('management-bus-fee', editData.busFee || '');
        setTextField('management-mess-bill', editData.messBill || '');
        setTextField('management-room-rent', editData.roomRent || '');
        setTextField('management-laundry-fee', editData.laundryCharges || '');
        
        // Totals
        setTextField('management-tuition-total-fee', editData.feeSubTotal || '');
        setTextField('management-college-total-fee', editData.feeCollegeTotal || '');
        setTextField('management-total-hostel-fee', editData.feeHostelTotal || '');
        setTextField('management-overall-fee', editData.feeOverallTotal || '');
        
        console.log('✓ Management fee structure mapped');
      }

      // Force pdf-lib to regenerate widget appearances so text is visible in viewers
      form.updateFieldAppearances(defaultFont);

      console.log('\n✅ PDF form filling completed');
      
      // CRITICAL: Set the NeedAppearances flag to ensure PDF viewers generate appearances
      // This is the key to making text fields visible
      const acroForm = pdfDoc.catalog.lookup(PDFName.of('AcroForm'));
      if (acroForm) {
        acroForm.set(PDFName.of('NeedAppearances'), pdfDoc.context.obj(true));
        console.log('✅ NeedAppearances flag set');
      }

      // Save the PDF
      console.log('💾 Saving PDF...');
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false
      });
      console.log('✅ PDF saved successfully');
      return pdfBytes;

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handlePreviewPDF = () => {
    console.log('🔍 Preview PDF clicked - Current scoresData:', scoresData);
    console.log('📋 Academic fields being passed to PDF:', {
      schoolName: scoresData?.schoolName,
      registerNumber: scoresData?.registerNumber,
      medium: scoresData?.medium,
      yearOfPassing: scoresData?.yearOfPassing,
      courseType: scoresData?.courseType
    });
    setShowPDFPreview(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Step 1: Save personal info using GET method with updatePersonalInfo action
      const params = new URLSearchParams();
      params.append("action", "updatePersonalInfo");
      
      for (const [key, value] of Object.entries(editData)) {
        params.append(key, value);
      }

      const response = await fetch(GOOGLE_SCRIPT_URL + "?" + params.toString());
      const responseData = await response.json();

      // Check if the response indicates success
      if (!responseData.success) {
        alert("Failed to update personal info: " + (responseData.message || "Unknown error"));
        setIsSaving(false);
        return;
      }

      // Update editData with server-returned admission ID (if generated)
      let updatedEditData = { ...editData };
      if (responseData.admissionId) {
        updatedEditData.admissionId = responseData.admissionId;
        setEditData(prev => ({
          ...prev,
          admissionId: responseData.admissionId
        }));
        console.log("✅ Admission ID from server: " + responseData.admissionId);
      }

      // Step 2: Save scores if they were edited (only when data exists)
      if (Object.keys(scoresData).length > 0) {
        const scoreParams = new URLSearchParams();
        scoreParams.append("action", "updateScores");
        scoreParams.append("enquiryId", editData.enquiryId);
        
        // Add all score fields
        for (const [key, value] of Object.entries(scoresData)) {
          scoreParams.append(key, value);
        }
        
        const scoresResponse = await fetch(GOOGLE_SCRIPT_URL + "?" + scoreParams.toString());
        const scoresResult = await scoresResponse.json();
        
        if (scoresResult.success) {
          console.log("✅ Scores saved successfully for enquiry ID: " + editData.enquiryId);
        } else {
          console.error("❌ Failed to save scores:", scoresResult.message);
        }
      }

      // Step 3: Save fees data via GET method if fees fields exist (avoids CORS)
      const feeFields = ["tuitionFee", "developmentFee", "admissionFee", "cautionDeposit", 
                         "optionalFees", "scStScholarship", "fgScholarship", "busFee", 
                         "messBill", "roomRent", "laundryCharges", "feeSubTotal", 
                         "feeCollegeTotal", "feeHostelTotal", "feeOverallTotal"];
      
      const feesData = {};
      let hasFeeData = false;
      for (const feeField of feeFields) {
        if (editData[feeField] !== undefined && editData[feeField] !== null && editData[feeField] !== '') {
          feesData[feeField] = editData[feeField];
          hasFeeData = true;
        }
      }
      
      if (hasFeeData) {
        console.log("💾 Saving fees data:", feesData);
        feesData.enquiryId = editData.enquiryId;
        feesData.admissionId = updatedEditData.admissionId || editData.admissionId || '';
        feesData.fullName = editData.fullName || '';
        feesData.quota = editData.quota || '';
        feesData.status = editData.status || 'Pending'; // Include status with fees
        
        const feeParams = new URLSearchParams();
        for (const [key, value] of Object.entries(feesData)) {
          feeParams.append(key, value);
        }
        
        console.log("📤 Sending fees to backend with query params (GET method)");
        
        const feesResponse = await fetch(GOOGLE_SCRIPT_URL + "?" + feeParams.toString());
        
        const feesResult = await feesResponse.json();
        if (feesResult.success) {
          console.log("✅ Fees data saved successfully");
          // Update editData with fees information from response if available
          if (feesResult.updatedData) {
            updatedEditData = { ...updatedEditData, ...feesResult.updatedData };
          }
        } else {
          console.error("❌ Failed to save fees data:", feesResult.message);
          alert("Note: Personal info and scores saved but fees data save may have failed. Please try again.");
        }
      }

      if (responseData.success) {
        console.log("✅ Save successful! Calling onUpdateSuccess callback...");
        console.log("📊 Updated data being sent to dashboard:", updatedEditData);
        onUpdateSuccess(updatedEditData);

        // Navigate to Fees Info page after successful save
        console.log('✅ Navigating to Fees Info page');
        console.log('📊 Passing scoresData to FeesInfo:', scoresData);
        navigate('/feesInfo', { state: { applicationData: updatedEditData, scoresData: scoresData } });
        onClose(); // Close the modal after navigation
      } else {
        console.error('❌ Update failed:', responseData);
        alert("Failed to update information. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error during save:", error);
      alert("An error occurred while saving: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const handleNavigateToScores = () => {
    const lastStudies = editData.lastStudies;

    if (lastStudies === 'HSC') {
      navigate('/admin/academic-score', { state: { applicationData: editData } });
    } else if (lastStudies === 'HSC Vocational') {
      navigate('/admin/vocational-score', { state: { applicationData: editData } });
    } else if (lastStudies === 'CBSE') {
      navigate('/admin/cbse-score', { state: { applicationData: editData } });
    } else if (lastStudies === 'Diploma') {
      navigate('/admin/diploma-score', { state: { applicationData: editData } });
    } else if (lastStudies === 'Dropout') {
      navigate('/feesInfo', { state: { applicationData: editData } });
    }

    setShowSuccessModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div>
        <Nav />
      </div>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8">
          {/* Modal Header */}
          <div className="bg-blue-600 px-8 py-5 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white">
              Edit Application
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Single Scrollable Content */}
          <div className="max-h-[75vh] overflow-y-auto">
          {/* Personal Info Section */}
          <div className="bg-blue-50 px-8 py-4 border-b border-blue-100">
            <h3 className="text-lg font-bold text-blue-900">Personal Information</h3>
          </div>
          <div className="p-8 space-y-8">
            {/* Row 1: Seat Type & Admission Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Seat Type</label>
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="quota"
                        value="Government"
                        checked={editData.quota === "Government"}
                        onChange={(e) => handleInputChange("quota", e.target.value)}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">Government</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="quota"
                        value="Management"
                        checked={editData.quota === "Management"}
                        onChange={(e) => handleInputChange("quota", e.target.value)}
                        className="w-5 h-5 text-green-600 focus:ring-green-500"
                      />
                      <span className="font-medium">Management</span>
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Admission Type</label>
                <select
                  value={editData.entry || ""}
                  onChange={(e) => handleInputChange("entry", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="" disabled>Select Entry Type</option>
                  <option value="I Year">I Year</option>
                  <option value="Lateral Entry">Lateral Entry</option>
                </select>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Row 2: DOB & Gender/Accommodation */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
  
  {/* LEFT COLUMN WRAPPER: Holds Full Name and Enquiry ID vertically */}
  <div className="space-y-8">
    
    {/* 1. Full Name Field */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
      <input
        type="text"
        value={editData.fullName || ""}
        onChange={(e) => handleInputChange("fullName", e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
      />
    </div>

    {/* 2. Enquiry ID Field (New ReadOnly Input) */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
        Enquiry ID
      </label>
      <input
        type="text"
        value={editData.enquiryId || "ENQ-PENDING"} /* Replace with your actual data variable */
        readOnly
        className="w-full px-4 py-3 bg-gray-200 text-gray-500 border border-gray-300 rounded-lg cursor-not-allowed outline-none select-none"
      />
    </div>

    {/* 3. Admission ID Field (Auto-generated when status is Admitted) */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
        Admission ID
      </label>
      <input
        type="text"
        value={editData.admissionId || "Not Generated"}
        readOnly
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg cursor-not-allowed outline-none select-none ${
          editData.admissionId
            ? "bg-green-100 text-green-700 font-semibold border-green-300"
            : "bg-gray-200 text-gray-500"
        }`}
      />
    </div>

    {/* 4. Status Field (Admin can change this) */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
        Application Status
      </label>
      <select
        value={editData.status || "Pending"}
        onChange={(e) => handleInputChange("status", e.target.value)}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
      >
        <option value="Pending">Pending</option>
        <option value="Admitted">Admitted</option>
        <option value="cancel">Cancel</option>
      </select>
    </div>

    {/* 5. Submission Date Field (Admin can edit this) */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
        Submission Date
      </label>
      <input
        type="date"
        value={editData.date ? editData.date.split('T')[0] : ""}
        onChange={(e) => {
          // Convert date to ISO string format with time
          const dateValue = e.target.value;
          if (dateValue) {
            const isoDate = new Date(dateValue).toISOString();
            handleInputChange("date", isoDate);
          }
        }}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
      />
    </div>

  </div>

  {/* RIGHT COLUMN: Gender / Accommodation (Unchanged) */}
  <div>
    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
      Gender / Accommodation
    </label>
    <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl space-y-4">
      <div className="flex space-x-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value="Male"
            checked={editData.gender === "Male"}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium">Male</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value="Female"
            checked={editData.gender === "Female"}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            className="w-5 h-5 text-pink-600 focus:ring-pink-500"
          />
          <span className="font-medium">Female</span>
        </label>
      </div>



      {editData.gender && (
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <label className="block text-xs font-bold text-gray-400 uppercase">
            Residence Preference
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer">
              <input
                type="radio"
                name="accommodation"
                value={editData.gender === "Male" ? "BoysHostel" : "GirlsHostel"}
                checked={
                  editData.accommodation ===
                  (editData.gender === "Male" ? "BoysHostel" : "GirlsHostel")
                }
                onChange={(e) => handleInputChange("accommodation", e.target.value)}
              />
              <span className="text-sm">Hostel</span>
            </label>
            <label className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer">
              <input
                type="radio"
                name="accommodation"
                value="DayScholar"
                checked={editData.accommodation === "DayScholar"}
                onChange={(e) => handleInputChange("accommodation", e.target.value)}
              />
              <span className="text-sm">Day Scholar</span>
            </label>
          </div>

          {/* Room / Travel Details Sub-options */}
          {(editData.accommodation === "BoysHostel" ||
            editData.accommodation === "GirlsHostel") && (
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
              <select
                name="roomType"
                value={editData.roomType || ""}
                onChange={(e) => handleInputChange("roomType", e.target.value)}
                className="w-full text-sm bg-transparent border-none outline-none focus:ring-0"
              >
                <option value="">Select Room Type</option>
                <option value="Normal4">Normal (4 Members)</option>
                <option value="Attach3">Attached Bath (3 Members)</option>
                <option value="AC2">AC + Attached (2 Members)</option>
              </select>
            </div>
          )}


          {editData.accommodation === "DayScholar" && (
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
              <select
                name="travelType"
                value={editData.travelType || ""}
                onChange={(e) => handleInputChange("travelType", e.target.value)}
                className="w-full text-sm bg-transparent border-none outline-none focus:ring-0"
              >
                <option value="">Select Travel Type</option>
                <option value="CollegeBus">College Bus</option>
                <option value="OutBus">Own/Outside Travel</option>
              </select>
              
              {/* Bus Stop Autocomplete - Only shown when College Bus is selected */}
              {editData.travelType === "CollegeBus" && (
                <div className="mt-3 space-y-3 bus-stop-autocomplete">
                  {/* Bus Stop Name with Autocomplete */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bus Stop Name</label>
                    <input
                      type="text"
                      value={busStopSearch}
                      onChange={handleBusStopSearch}
                      onFocus={() => busStopSearch.length >= 4 && setShowSuggestions(true)}
                      placeholder="Type at least 3 characters to search..."
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                    {/* Suggestions Dropdown */}
                    {showSuggestions && busStopSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {busStopSuggestions.map((stop, index) => (
                          <div
                            key={index}
                            onClick={() => handleBusStopSelect(stop)}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                          >
                            <span className="font-medium">{stop.busStopName}</span>
                            <span className="text-xs text-gray-500 ml-2">({stop.route})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Route - Auto-populated */}
                  {editData.busStopName && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Route</label>
                        <input
                          type="text"
                          value={editData.busRoute || ''}
                          onChange={(e) => handleInputChange('busRoute', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Bus No - Auto-populated */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Bus No</label>
                        <input
                          type="text"
                          value={editData.busNo || ''}
                          onChange={(e) => handleInputChange('busNo', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Bus Fees - Auto-populated */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Bus Fees (Per Semester)</label>
                        <input
                          type="text"
                          value={editData.busFees || ''}
                          onChange={(e) => handleInputChange('busFees', e.target.value)}
                          placeholder="₹"
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-green-700"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</div>

            {/* Row 3: Department Preferences */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Degree / Department Preferences</label>
              <div className="space-y-3">
                <select
                  name="preference1"
                  value={editData.preference1 || ""}
                  onChange={(e) => handleInputChange("preference1", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="" disabled>1st Preference</option>
                  {degree.map((dept, index) => (
                    <option key={index} value={dept.department}>{dept.department}</option>
                  ))}
                </select>
                <select
                  name="preference2"
                  value={editData.preference2 || ""}
                  onChange={(e) => handleInputChange("preference2", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="" disabled>2nd Preference</option>
                  {degree.map((dept, index) => (
                    <option key={index} value={dept.department} disabled={dept.department === editData.preference1}>{dept.department}</option>
                  ))}
                </select>
                <select
                  name="preference3"
                  value={editData.preference3 || ""}
                  onChange={(e) => handleInputChange("preference3", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="" disabled>3rd Preference</option>
                  {degree.map((dept, index) => (
                    <option key={index} value={dept.department} disabled={dept.department === editData.preference1 || dept.department === editData.preference2}>{dept.department}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Branch Awarded */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Branch Awarded</label>
              <select
                value={editData.branchAwarded || ""}
                onChange={(e) => handleInputChange("branchAwarded", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                <option value="">Select Branch</option>
                <option value="AI & DS">AI & DS</option>
                <option value="Agriculture">Agriculture</option>
                <option value="BME">BME</option>
                <option value="Civil">Civil</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="IT">IT</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>

            <hr className="border-gray-100" />

            {/* Row 4: DOB & Entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formatDateForInput(editData.dob)}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  disabled
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Father's Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Father / Guardian Name</label>
                <input
                  type="text"
                  value={editData.fatherName || ""}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Father's Occupation</label>
                <input
                  type="text"
                  value={editData.fatherOccupation || ""}
                  onChange={(e) => handleInputChange("fatherOccupation", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Community & Caste */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Community</label>
                <select
                  value={editData.community || ""}
                  onChange={(e) => handleInputChange("community", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="">Select Community</option>
                  <option value="OC">OC</option>
                  <option value="BC">BC</option>
                  <option value="BCM">BCM</option>
                  <option value="MBC">MBC</option>
                  <option value="SC">SC</option>
                  <option value="SCA">SCA</option>
                  <option value="SCE">SCE</option>
                  <option value="ST">ST</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Caste</label>
                <input
                  type="text"
                  value={editData.caste || ""}
                  onChange={(e) => handleInputChange("caste", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Annual Income */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Annual Family Income</label>
              <select
                value={editData.annualIncome || ""}
                onChange={(e) => handleInputChange("annualIncome", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                <option value="" disabled>Select Income Range</option>
                <option value="Less than 1 Lakh">Less than 1 Lakh</option>
                <option value="1 Lakh to 1.5 Lakhs">1 Lakh to 1.5 Lakhs</option>
                <option value="1.5 Lakhs to 2.5 Lakhs">1.5 Lakhs to 2.5 Lakhs</option>
                <option value="2.5 Lakhs to 5 Lakhs">2.5 Lakhs to 5 Lakhs</option>
                <option value="More than 5 Lakhs">More than 5 Lakhs</option>
                <option value="Nil">Nil</option>
              </select>
              
            </div>
            

            <hr className="border-gray-100" />

            {/* Address Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Communication Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Address Line 1 (Door no, Village Name / Street Name)</label>
                  <input
                    type="text"
                    value={editData.address1 || ""}
                    onChange={(e) => handleInputChange("address1", e.target.value)}
                    placeholder="Enter Door no, Village Name / Street Name"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Address Line 2 (Panchayat / Town)</label>
                  <input
                    type="text"
                    value={editData.address2 || ""}
                    onChange={(e) => handleInputChange("address2", e.target.value)}
                    placeholder="Enter Panchayat / Town"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Taluk</label>
                  <input
                    type="text"
                    value={editData.taluk || ""}
                    onChange={(e) => handleInputChange("taluk", e.target.value)}
                    placeholder="Enter Taluk"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">District</label>
                  <input
                    type="text"
                    value={editData.district || ""}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    placeholder="Enter District"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">State</label>
                  <input
                    type="text"
                    value={editData.state || ""}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter State"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pin Code</label>
                  <input
                    type="text"
                    value={editData.pincode || ""}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                    placeholder="Enter Pin Code"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Contact Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contact No. (Father)</label>
                  <input
                    type="tel"
                    value={editData.fatherContact || ""}
                    onChange={(e) => handleInputChange("fatherContact", e.target.value)}
                    placeholder="Enter Contact No. (Father)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contact No. (Mother)</label>
                  <input
                    type="tel"
                    value={editData.motherContact || ""}
                    onChange={(e) => handleInputChange("motherContact", e.target.value)}
                    placeholder="Enter Contact No. (Mother)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contact No. (Student)</label>
                  <input
                    type="tel"
                    value={editData.studentContact || ""}
                    onChange={(e) => handleInputChange("studentContact", e.target.value)}
                    placeholder="Enter Contact No. (Student)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Education Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Educational Background
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">SSLC Marks</label>
                    <input
                      type="text"
                      value={editData.sslcMarks || ""}
                      onChange={(e) => handleInputChange("sslcMarks", e.target.value)}
                      placeholder="Enter SSLC Marks out of 500"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                  </div>
                  {/* <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">School Name & Location</label>
                    <input
                      type="text"
                      value={editData.schoolName || ""}
                      onChange={(e) => handleInputChange("schoolName", e.target.value)}
                      placeholder="Enter School Name & Location"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                  </div> */}
                  <div className="flex items-center space-x-6 pt-2">
                    <span className="text-sm font-bold text-gray-700">Govt School (6th-12th)?</span>
                    <div className="flex space-x-3">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="govtSchool" value="Yes" checked={editData.govtSchool === "Yes"} onChange={(e) => handleInputChange("govtSchool", e.target.value)} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Yes</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="govtSchool" value="No" checked={editData.govtSchool === "No"} onChange={(e) => handleInputChange("govtSchool", e.target.value)} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">No</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Last Studied</label>
                    <select
                      value={editData.lastStudies || ""}
                      onChange={(e) => handleInputChange("lastStudies", e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    >
                      <option value="">Choose your previous course</option>
                      <option value="HSC">HSC</option>
                      <option value="HSC Vocational">HSC Vocational</option>
                      <option value="CBSE">CBSE</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Dropout">Dropout</option>
                    </select>
                  </div>

                  {editData.lastStudies === 'Dropout' && (
                    <div className="p-5 bg-orange-50 rounded-xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-xs font-bold text-orange-800 uppercase">College Dropout Details</h4>
                      <div>
                        <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Previous College & Place</label>
                        <input
                          type="text"
                          value={editData.dropoutCollege || ''}
                          onChange={(e) => handleInputChange('dropoutCollege', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-orange-500"
                          placeholder="Enter college name and location"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Register Number</label>
                          <input
                            type="text"
                            value={editData.dropoutRegisterNo || ''}
                            onChange={(e) => handleInputChange('dropoutRegisterNo', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-orange-500"
                            placeholder="Enter register number"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Year of Study</label>
                          <input
                            type="text"
                            value={editData.dropoutYear || ''}
                            onChange={(e) => handleInputChange('dropoutYear', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-orange-500"
                            placeholder=""
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Reference Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Reference Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">How did you know about this college?</label>
                  <input
                    type="text"
                    value={editData.knowAbout || ""}
                    onChange={(e) => handleInputChange("knowAbout", e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                    placeholder="Know about this college"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Reference Name</label>
                    <input
                      type="text"
                      value={editData.referenceName || ""}
                      onChange={(e) => handleInputChange("referenceName", e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                      placeholder="Reference person name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Reference Contact</label>
                    <input
                      type="tel"
                      value={editData.referenceContact || ""}
                      onChange={(e) => handleInputChange("referenceContact", e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                      placeholder="Reference contact number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* First Graduate & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="bg-blue-50 p-4 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-blue-900 uppercase">First Graduate?</span>
                  <span className="text-xs text-blue-700/70 capitalize">Are you the first in family to graduate?</span>
                </div>
                <div className="flex space-x-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="firstGrad" value="Yes" checked={editData.firstGrad === "Yes"} onChange={(e) => handleInputChange("firstGrad", e.target.value)} className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Yes</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="firstGrad" value="No" checked={editData.firstGrad === "No"} onChange={(e) => handleInputChange("firstGrad", e.target.value)} className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">No</span>
                  </label>
                </div>
              </div>






            </div>
          </div>

          {/* Academic Scores Section */}
          {editData.lastStudies !== 'Diploma' && (
          <>
          <div className="bg-green-50 px-8 py-4 border-b border-green-100">
            <h3 className="text-lg font-bold text-green-900">Academic Scores</h3>
          </div>
          <div className="p-8 space-y-8">
            {Object.keys(scoresData).length > 0 ? (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-xl p-6 space-y-6 bg-gray-50">
                  {/* Score Header */}
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800">
                      {scoresData.courseType}
                    </h4>
                    {/* <p className="text-sm text-gray-500 mt-1">
                      Submitted: {formatDateDisplay(scoresData.date)}
                    </p> */}
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">School/Board Name</label>
                      <input
                        type="text"
                        value={scoresData.schoolName || ""}
                        onChange={(e) => {
                          setScoresData(prev => ({ ...prev, schoolName: e.target.value }));
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Register Number</label>
                      <input
                        type="text"
                        value={scoresData.registerNumber || ""}
                        onChange={(e) => {
                          setScoresData(prev => ({ ...prev, registerNumber: e.target.value }));
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Medium of Study</label>
                      <select
                        value={["English", "Tamil"].includes(scoresData.medium) ? scoresData.medium : scoresData.medium ? "Other" : ""}
                        onChange={(e) => {
                          const nextVal = e.target.value;
                          // If Other is selected, keep current custom value or empty to let user type
                          setScoresData(prev => ({ ...prev, medium: nextVal === "Other" ? (prev.medium && !["English", "Tamil"].includes(prev.medium) ? prev.medium : "") : nextVal }));
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Medium</option>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Other">Other</option>
                      </select>
                      {((scoresData.medium && !["English", "Tamil"].includes(scoresData.medium)) || (scoresData.medium === "" && scoresData.medium !== null && scoresData.medium !== undefined)) && (
                        <input
                          type="text"
                          value={scoresData.medium || ""}
                          onChange={(e) => {
                            setScoresData(prev => ({ ...prev, medium: e.target.value }));
                          }}
                          placeholder="Enter medium"
                          className="mt-2 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Year of Passing</label>
                      <input
                        type="text"
                        value={scoresData.yearOfPassing || ""}
                        onChange={(e) => {
                          setScoresData(prev => ({ ...prev, yearOfPassing: e.target.value }));
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Subject Marks */}
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-bold text-gray-800 mb-4">Subject Marks</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Subject</th>
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Maximum Marks</th>
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Marks Obtained</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(editData.lastStudies === 'CBSE' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6]).map((num) => (
                            <tr key={num} className={num % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                              <td className="border border-gray-300 px-4 py-2">
                                <input
                                  type="text"
                                  value={scoresData[`subject${num}`] || ""}
                                  onChange={(e) => {
                                    setScoresData(prev => ({ ...prev, [`subject${num}`]: e.target.value }));
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                  placeholder={`Subject ${num}`}
                                />
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">100</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <input
                                  type="number"
                                  value={scoresData[`subject${num}Marks`] || ""}
                                  onChange={(e) => {
                                    setScoresData(prev => ({ ...prev, [`subject${num}Marks`]: e.target.value }));
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center no-spin"
                                  placeholder="Enter marks"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Overall Marks & Eligibility */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks</label>
                      <input
                        type="number"
                        value={scoresData.totalMarks || ""}
                        onChange={(e) => {
                          setScoresData(prev => ({ ...prev, totalMarks: e.target.value }));
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none no-spin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Percentage</label>
                      <input
                        type="number"
                        step="0.01"
                        value={scoresData.percentage || ""}
                        onChange={(e) => {
                          setScoresData(prev => ({ ...prev, percentage: e.target.value }));
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none no-spin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CutOff</label>
                      <input
                        type="number"
                        step="0.01"
                        value={scoresData.cutoff || ""}
                        onChange={(e) => {
                          setScoresData(prev => ({ ...prev, cutoff: e.target.value }));
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none no-spin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Engineering Eligibility</label>
                      <input
                        type="number"
                        value={scoresData.eligibility || ""}
                        onChange={(e) => {
                          setScoresData(prev => ({ ...prev, eligibility: e.target.value }));
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none no-spin"
                        
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 font-medium">No score data available for this student</p>
                <p className="text-gray-400 text-sm mt-1">Score will appear once student submits academic information</p>
              </div>
            )}
          </div>
          </>
          )}

          {/* Diploma Scores Section */}
          {editData.lastStudies === 'Diploma' && (
          <>
          <div className="bg-purple-50 px-8 py-4 border-b border-purple-100">
            <h3 className="text-lg font-bold text-purple-900">Diploma Scores</h3>
          </div>
          <DiplomaScoresEdit 
            applicationData={editData}
            scoresData={scoresData}
            onSave={(updatedData) => {
              setEditData(updatedData);
              if (onUpdateSuccess) {
                onUpdateSuccess(updatedData);
              }
            }}
          />
          </>
          )}
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-8 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>


            {/* Save change */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:translate-y-[-2px] transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save and Continue"}
            </button>
          </div>
        </div>
      </div>





      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Data Updated Successfully!</h3>
              <p className="text-gray-600 mb-6">
                The application has been updated and saved to the database.
              </p>




              {/* Action Buttons */}
              <div className="flex flex-col gap-3 justify-center">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSuccessOk}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    OK
                  </button>
                  <button
                    onClick={handlePreviewPDF}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Preview PDF</span>
                  </button>
                </div>
                {(editData.lastStudies === 'HSC' || editData.lastStudies === 'HSC Vocational' || editData.lastStudies === 'CBSE') && (
                  <button
                    onClick={handleNavigateToScores}
                    className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Enter Academic Scores</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        studentData={editData}
        scoresData={scoresData}
        studentName={editData.fullName}
      />
    </>
  );
}

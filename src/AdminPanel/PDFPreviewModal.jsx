import React, { useState, useEffect } from 'react';
import { PDFDocument, PDFName } from 'pdf-lib';

export default function PDFPreviewModal({ 
  isOpen, 
  onClose, 
  studentData,
  studentName 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [generatedPdfBytes, setGeneratedPdfBytes] = useState(null);

  // Cleanup preview URL when component unmounts or closes
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  // Auto-generate PDF when modal opens
  useEffect(() => {
    if (isOpen && studentData) {
      handleGeneratePreview();
    }
  }, [isOpen, studentData]);

  // Convert date to DD-MM-YYYY format for PDF
  const formatDateForPDF = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  /**
   * Fills the PDF admission form with student data
   * Maps all studentData fields to PDF form fields
   */
  const generateFilledPDF = async () => {
    try {
      // Load the PDF template
      const templatePath = '/src/assets/admission-form-template.pdf';
      const existingPdfBytes = await fetch(templatePath).then(res => res.arrayBuffer());
      
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      console.log(`📄 PDF Template loaded: ${fields.length} total fields`);

      // Helper function to set checkbox in a checkbox group (radio-style)
      const setCheckboxInGroup = (fieldName, exportValue) => {
        try {
          const field = form.getField(fieldName);
          const acroField = field.acroField;
          const kidsArray = acroField.Kids();
          
          if (!kidsArray) {
            console.warn(`No widgets found for ${fieldName}`);
            return false;
          }
          
          const numKids = kidsArray.size();
          
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
                      return true;
                    }
                  }
                }
              }
            } catch (widgetError) {
              continue;
            }
          }
          
          console.warn(`⚠ Export value '${exportValue}' not found in ${fieldName}`);
          return false;
        } catch (error) {
          console.warn(`✗ Could not set ${fieldName}:`, error.message);
          return false;
        }
      };

      // Helper function to safely set text field value
      const setTextField = (fieldName, value) => {
        try {
          const field = form.getTextField(fieldName);
          if (field && value !== undefined && value !== null) {
            field.setText(String(value));
          }
        } catch (error) {
          console.warn(`Could not set text field ${fieldName}:`, error.message);
        }
      };

      // Map data to PDF fields
      console.log('📝 Filling PDF form fields...\n');
      
      // Basic Information
      setTextField('adminssion-id', studentData.id || '');
      setTextField('date', formatDateForPDF(new Date()));
      setTextField('name', studentData.fullName || '');
      setTextField('date-of-birth', formatDateForPDF(studentData.dob));
      
      // Gender - checkbox group
      if (studentData.gender === 'Male') {
        setCheckboxInGroup('gender', 'male');
      } else if (studentData.gender === 'Female') {
        setCheckboxInGroup('gender', 'female');
      }

      // Department checkboxes
      const deptMapping = {
        'AI & DS': 'ad-dept',
        'BME': 'bme-dept',
        'Civil': 'civil-dept',
        'CSE': 'cse-dept',
        'ECE': 'ece-dept',
        'EEE': 'eee-dept',
        'IT': 'it-dept',
        'Mechanical': 'mech-dept',
        'Agriculture': 'agri-dept',
        'AD(Artificial and Data Science Engineering)': 'ad-dept',
        'BME(Bio Medical Engineering)': 'bme-dept',
        'BME(Bio-Medical Engineering)': 'bme-dept',
        'CIVIL(Civil Engineering)': 'civil-dept',
        'CSE(Computer Science and Engineering)': 'cse-dept',
        'ECE(Electronics and Communication Engineering)': 'ece-dept',
        'EEE(Electrical and Electronics Engineering)': 'eee-dept',
        'IT(Information Technology)': 'it-dept',
        'MECH(Mechanical Engineering)': 'mech-dept',
        'AGRI(Agricultural Engineering)': 'agri-dept'
      };
      
      const preferences = [studentData.preference1, studentData.preference2, studentData.preference3];
      
      preferences.forEach((pref) => {
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
      
      // Branch awarded
      setTextField('branch-awarded', studentData.branchAwarded  || '');

      // Admission type
      if (studentData.entry === 'I Year') {
        setCheckboxInGroup('admission-type', 'I-year');
      } else if (studentData.entry === 'Lateral Entry') {
        setCheckboxInGroup('admission-type', 'lateral-entry');
      }

      // Family Details
      setTextField('father/guardian-name', studentData.fatherName || '');
      setTextField('father/guardian-occupation', studentData.fatherOccupation || '');
      setTextField('family-income', studentData.annualIncome || '');
      setTextField('caste', studentData.caste || '');

      // Community
      const communityMap = {
        'OC': 'oc',
        'BC': 'bc',
        'BCM': 'bcm',
        'MBC': 'mbc',
        'SC': 'sc',
        'SCA': 'sca',
        'SCC': 'scc',
        'ST': 'st'
      };
      if (studentData.community && communityMap[studentData.community]) {
        setCheckboxInGroup('community', communityMap[studentData.community]);
      }

      // Seat Type
      if (studentData.quota === 'Government') {
        setCheckboxInGroup('seat-type', 'government');
      } else if (studentData.quota === 'Management') {
        setCheckboxInGroup('seat-type', 'management');
      }

      // Government eligible
      if (studentData.govtSchool === 'Yes') {
        setCheckboxInGroup('govt-eligible', 'yes');
      } else if (studentData.govtSchool === 'No') {
        setCheckboxInGroup('govt-eligible', 'no');
      }

      // First graduate
      if (studentData.firstGrad === 'Yes') {
        setCheckboxInGroup('first-graduate', 'yes');
      } else if (studentData.firstGrad === 'No') {
        setCheckboxInGroup('first-graduate', 'no');
      }

      // Student type
      const studentTypeMap = {
        'BoysHostel': 'boys-hostel',
        'GirlsHostel': 'girls-hostel'
      };
      
      if (studentData.accommodation && studentTypeMap[studentData.accommodation]) {
        setCheckboxInGroup('student-type', studentTypeMap[studentData.accommodation]);
      }
      
      // Day Scholar checkbox
      if (studentData.accommodation === 'DayScholar') {
        try {
          const checkbox = form.getCheckBox('days-scholor');
          checkbox.check();
          console.log('✓ days-scholor');
        } catch (error) {
          console.warn('✗ Could not check days-scholor:', error.message);
        }
      }
      
      // Travel type
      if (studentData.travelType === 'CollegeBus') {
        setCheckboxInGroup('student-type', 'college-bus');
      } else if (studentData.travelType === 'OutBus') {
        setCheckboxInGroup('student-type', 'out-bus');
      }

      setTextField('bus-stop', studentData.busStop || '');

      // Address Details
      setTextField('address-line-1', studentData.address1 || '');
      setTextField('address-line-2', studentData.address2 || '');
      setTextField('taluk', studentData.taluk || '');
      setTextField('district', studentData.district || '');
      setTextField('state', studentData.state || '');
      setTextField('pin-code', studentData.pincode || '');

      // Contact Numbers
      setTextField('contact-No-(father)', studentData.fatherContact || '');
      setTextField('contact-No-(mother)', studentData.motherContact || '');
      setTextField('contact-No-(student)', studentData.studentContact || '');

      // Educational Details
      setTextField('name-and-place-of-college', studentData.schoolName || '');
      setTextField('register-no', studentData.registrationNo || '');
      setTextField('type-studies', studentData.lastStudies || '');
      setTextField('medium-of-study', studentData.mediumOfStudy || 'English');
      setTextField('year-of-passing', studentData.yearOfPassing || '');

      // SSLC Marks
      setTextField('sslc-mark', studentData.sslcMarks || '');
      
      // Calculate SSLC Percentage (divide by 5 and format to 2 decimal points)
      const sslcPercentage = studentData.sslcMarks ? (parseFloat(studentData.sslcMarks) / 5).toFixed(2) : '';
      setTextField('sslc-percentage', sslcPercentage);

      // HSC/CBSE Marks
      setTextField('tamil', studentData.tamilMarks || '');
      setTextField('english', studentData.englishMarks || '');
      setTextField('physics', studentData.physicsMarks || '');
      setTextField('chemistry', studentData.chemistryMarks || '');
      setTextField('maths', studentData.mathsMarks || '');
      setTextField('computer-science/biology', studentData.csOrBioMarks || '');
      
      // HSC Total and Percentage
      setTextField('hsc-total-mark', studentData.hscTotalMarks || '');
      setTextField('hsc-mark-percentage', studentData.hscPercentage || '');
      setTextField('cutoff', studentData.cutoffMarks || '');

      // Reference Information
      setTextField('know-about-this-college', studentData.knowAbout || '');
      setTextField('reference-name', studentData.referenceName || '');
      setTextField('reference-contact', studentData.referenceContact || '');

      console.log('\n✅ PDF form filling completed');
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await generateFilledPDF();
      setGeneratedPdfBytes(pdfBytes);
      
      // Create blob URL for preview
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Revoke old URL if exists
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
      
      setPdfPreviewUrl(url);
    } catch (error) {
      alert('Error generating PDF preview: ' + error.message);
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedPdfBytes) {
      const blob = new Blob([generatedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${studentName || studentData.fullName || 'student'}_admission_form.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleClose = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
    setGeneratedPdfBytes(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Preview Header */}
        <div className="bg-blue-600 px-8 py-5 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">PDF Preview</h2>
            <p className="text-blue-100 text-sm mt-1">
              {studentName || studentData.fullName || 'Student'} - Admission Form
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
          {isGenerating ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 font-medium">Generating PDF Preview...</p>
              </div>
            </div>
          ) : pdfPreviewUrl ? (
            <iframe
              src={`${pdfPreviewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full rounded-lg border-2 border-gray-300 shadow-lg"
              title="PDF Preview"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-600">No preview available</p>
            </div>
          )}
        </div>

        {/* Preview Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 flex items-center justify-between rounded-b-2xl">
          <p className="text-sm text-gray-600">
            Review the filled form before downloading
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={!generatedPdfBytes}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

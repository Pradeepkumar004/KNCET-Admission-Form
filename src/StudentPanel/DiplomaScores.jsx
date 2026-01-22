import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DiplomaScores = ({ personalData }) => {
  const navigate = useNavigate();

  const [fifthSemMarks, setFifthSemMarks] = useState("");
  const [sixthSemMarks, setSixthSemMarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Google Apps Script endpoint
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyksQyXlpXq4IbzeTymBf1Jla1KIMsAGseNIciIJb-BRON5RuCdMYT-b9BdwpOzMoBThQ/exec";

  const handleSemesterMarkChange = (value, setter) => {
    if (value === "") {
      setter(value);
      return;
    }
    const numVal = parseFloat(value);
    if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
      setter(value);
    }
  };

  // Upload files state
  const [uploads, setUploads] = useState([]);

  const [diplomaDetails, setDiplomaDetails] = useState({
    program: '',
    institution: '',
    registerNo: '',
    completionDate: ''
  });



  const handleNavigate = async () => {
    // Validate required fields
    if (!diplomaDetails.program || !diplomaDetails.institution || !diplomaDetails.registerNo || !diplomaDetails.completionDate) {
      alert("Please fill in all diploma details");
      return;
    }

    if (!fifthSemMarks || !sixthSemMarks) {
      alert("Please enter marks for 5th and 6th semesters");
      return;
    }

    // Check if personal data is available
    if (!personalData || !personalData.fullName) {
      alert("Error: Personal information not found. Please complete Personal Information form first.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Submitting combined personal and diploma data...");
      
      // Prepare combined data (personal + scores)
      const combinedData = {
        action: "submitStudentData",
        // Personal info fields
        ...personalData,
        // Score fields
        courseType: "Diploma",
        schoolName: diplomaDetails.institution,
        registerNumber: diplomaDetails.registerNo,
        medium: diplomaDetails.program,
        yearOfPassing: diplomaDetails.completionDate,
        subject1: "1st to 5th Semester",
        subject1Marks: fifthSemMarks,
        subject2: "1st to 6th Semester",
        subject2Marks: sixthSemMarks,
        totalMarks: (parseFloat(fifthSemMarks) + parseFloat(sixthSemMarks)) / 2,
        percentage: ((parseFloat(fifthSemMarks) + parseFloat(sixthSemMarks)) / 2),
        cutoff: ((parseFloat(fifthSemMarks) + parseFloat(sixthSemMarks)) / 2),
        date: new Date().toISOString()
      };

      console.log("Combined data to submit:", combinedData);

      // Send to Google Apps Script
      const params = new URLSearchParams(combinedData).toString();
      const url = `${GOOGLE_SCRIPT_URL}?${params}`;

      const response = await fetch(url, {
        method: 'GET',
      });

      const result = await response.json();
      console.log("Response from server:", result);

      if (result.success && result.enquiryId) {
        // Save enquiry ID to localStorage
        localStorage.setItem('enquiryId', result.enquiryId);
        localStorage.setItem('studentName', personalData.fullName);
        
        setIsLoading(false);
        navigate("/success", { state: { enquiryId: result.enquiryId } });
      } else {
        setIsLoading(false);
        alert("Error: " + (result.message || "Failed to save data"));
      }
    } catch (error) {
      console.error("Submit error:", error);
      setIsLoading(false);
      alert("Error: " + error.message);
    }
  }

  const handleUploadChange = (e) => {
    const files = Array.from(e.target.files);
    setUploads(files);
  };





  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-2xl font-bold text-blue-900">Submitting Scores...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait while we save your scores</p>
          </div>
        </div>
      )}

      <section className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-blue-600 px-8 py-5">
          <h2 className="text-2xl font-bold text-white flex items-center">
            Diploma Scores
          </h2>
        </div>

        <div className="p-8 space-y-6">
          {/* details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                value={diplomaDetails.program}
                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, program: e.target.value })}
                className="mt-1 w-full border-gray-300 rounded-md p-3 border "
                placeholder="Enter Your Diploma Program"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                value={diplomaDetails.institution}
                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, institution: e.target.value })}
                className="mt-1 w-full border-gray-300 rounded-md p-3 border "
                placeholder="Enter Your Institution"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Register/Roll No</label>
              <input
                type="text"
                value={diplomaDetails.registerNo}
                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, registerNo: e.target.value })}
                className="mt-1 w-full border-gray-300 rounded-md p-3 border "
                placeholder="Enter Your Register/Roll No"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Completion year</label>
              <input
                type="number"
                value={diplomaDetails.completionDate}
                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, completionDate: e.target.value })}
                className="mt-1 w-full border-gray-300 rounded-md p-3 border"
                placeholder="Enter Your Completion Year"
              />
            </div>
          </div>



          {/* Semester Marks */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {/* upto 5th sem */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                1st to 5th semester (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={fifthSemMarks}
                onChange={(e) => handleSemesterMarkChange(e.target.value, setFifthSemMarks)}
                className="mt-1 w-full border-gray-300 rounded-md p-3 border"
                placeholder="Enter Your Up 1st To 5th Semester Marks"
              />
            </div>


            {/* upto 6th sem */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                1st to 6th semester (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={sixthSemMarks}
                onChange={(e) => handleSemesterMarkChange(e.target.value, setSixthSemMarks)}
                className="mt-1 w-full border-gray-300 rounded-md p-3 border"
                placeholder="Enter Your Up 1st To 6th Semester Marks"
              />
            </div>


            
          </div>

          

          {/* Submit */}
          <div className="mt-6 flex justify-end items-center gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
              onClick={handleNavigate}
            >
              Submit
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default DiplomaScores;

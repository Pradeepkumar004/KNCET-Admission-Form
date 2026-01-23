import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AcademicScores = ({ personalData }) => {
  const navigate = useNavigate();

  const [scores, setScores] = useState([
    { subject: "Tamil", max: 100, obtained: "" },
    { subject: "English", max: 100, obtained: "" },
    { subject: "Mathematics", max: 100, obtained: "" },
    { subject: "Physics", max: 100, obtained: "" },
    { subject: "Chemistry", max: 100, obtained: "" },
    { subject: "Computer Science / Biology", max: 100, obtained: "" },
  ]);

  const [uploads, setUploads] = useState([]);
  const [mediumOfStudy, setMediumOfStudy] = useState("");
  const [otherMedium, setOtherMedium] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [yearOfPassing, setYearOfPassing] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Google Apps Script endpoint
  const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_STUDENT_URL;

  const handleScoreChange = (index, value) => {
    // allow empty string for deletion
    if (value === "") {
      const newScores = [...scores];
      newScores[index].obtained = value;
      setScores(newScores);
      return;
    }

    const numVal = parseFloat(value);
    // check if it is a number and within range 0-100
    if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
      const newScores = [...scores];
      newScores[index].obtained = value;
      setScores(newScores);
    }
  };

  const handleNavigate = async () => {
    // Validate required fields
    if (!schoolName || !registerNumber || !mediumOfStudy || !yearOfPassing) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if all scores are entered
    

    // Get personal data from localStorage instead of props
    const storedPersonalData = JSON.parse(localStorage.getItem('submittedFormData') || '{}');
    

    setIsLoading(true);

    try {
      console.log("Submitting combined personal and HSC State Board data...");
      
      // Remove the 'initial' field as it's already combined in fullName (if it exists)
      const { initial, ...cleanedPersonalData } = storedPersonalData;
      
      // Combine personal info + scores data into single submission
      const combinedData = {
        action: "submitStudentData",
        // Personal info fields (without 'initial')
        ...cleanedPersonalData,
        // Score fields
        courseType: "HSC",
        schoolName,
        registerNumber,
        medium: mediumOfStudy === "Other" ? otherMedium : mediumOfStudy,
        yearOfPassing,
        subject1: scores[0].subject,
        subject1Marks: scores[0].obtained,
        subject2: scores[1].subject,
        subject2Marks: scores[1].obtained,
        subject3: scores[2].subject,
        subject3Marks: scores[2].obtained,
        subject4: scores[3].subject,
        subject4Marks: scores[3].obtained,
        subject5: scores[4].subject,
        subject5Marks: scores[4].obtained,
        subject6: scores[5].subject,
        subject6Marks: scores[5].obtained,
        totalMarks,
        percentage,
        cutoff,
        eligibility,
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
        localStorage.setItem('studentName', cleanedPersonalData.fullName);
        
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

  const totalMarks = scores.reduce(
    (sum, s) => sum + (parseInt(s.obtained) || 0),
    0
  );

  const percentage =
    totalMarks > 0 ? ((totalMarks / (scores.length * 100)) * 100).toFixed(2) : "";

  // --- ADDED CUTOFF LOGIC START ---
  const calculateCutoff = () => {
    const getMark = (subName) => {
      const found = scores.find(s => s.subject === subName);
      return parseFloat(found?.obtained) || 0;
    };

    const math = getMark("Mathematics");
    const physics = getMark("Physics");
    const chemistry = getMark("Chemistry");

    // Engineering Cutoff Formula: Math + (Physics/2) + (Chemistry/2)
    const cutoffValue = math + (physics / 2) + (chemistry / 2);
    return cutoffValue > 0 ? cutoffValue.toFixed(2) : "0.00";
  };

  const cutoff = calculateCutoff();
  // --- ADDED CUTOFF LOGIC END ---




   // --- ELIGIBILITY LOGIC START ---
    const calculateEligibility = () => {
        const getMark = (subName) => {
            const found = scores.find(s => s.subject === subName);
            return parseFloat(found?.obtained) || 0;
        };

        const math = getMark("Mathematics");
        const physics = getMark("Physics");
        const chemistry = getMark("Chemistry");

        // Eligibility Formula: (Maths + Physics + Chemistry) / 3
        const eligibilityScore = (math + physics + chemistry) / 3;

        if (math === 0 && physics === 0 && chemistry === 0) {
            return "";
        }

        return eligibilityScore.toFixed(2);
    };

    const eligibility = calculateEligibility();
  // {/* Eligibility */ }
  // const eligibility = parseFloat(cutoff) > 40 ? "Eligible" : "Not Eligible";


  
  

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-2xl font-bold text-blue-900">Submitting</p>
            <p className="text-sm text-gray-600 mt-2">Please wait while we save your Details</p>
          </div>
        </div>
      )}

      <section className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-blue-600 px-8 py-5">
          <h2 className="text-2xl font-bold text-white flex items-center">
            HSC State Board Scores
          </h2>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">School Name & Place <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter School Name & Place"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                style={{ textTransform: 'uppercase' }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Register Number <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="Enter Register Number"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                style={{ textTransform: 'uppercase' }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Medium of Study <span className="text-red-600">*</span></label>
              <select
                value={mediumOfStudy}
                onChange={(e) => setMediumOfStudy(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                required
              >
                <option value="">Select Medium</option>
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
                <option value="Other">Other</option>
              </select>
              {mediumOfStudy === "Other" && (
                <input
                  type="text"
                  value={otherMedium}
                  onChange={(e) => setOtherMedium(e.target.value)}
                  placeholder="Please Specify Medium"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm mt-2"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Year of Passing <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={yearOfPassing}
                onChange={(e) => setYearOfPassing(e.target.value)}
                placeholder="Year Of Passing"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                style={{ textTransform: 'uppercase' }}
                required
              />
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-md">
              <thead className="bg-gray-100 text-left text-sm">
                <tr>
                  <th className="p-3 border">Subject</th>
                  <th className="p-3 border">Maximum Marks</th>
                  <th className="p-3 border">Marks Obtained</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, idx) => (
                  <tr key={s.subject} className="text-sm">
                    <td className="p-3 border">{s.subject}</td>
                    <td className="p-3 border text-center">{s.max}</td>
                    <td className="p-3 border">
                      <input
                        type=""
                        min="0"
                        max="100"
                        value={s.obtained}
                        onChange={(e) => handleScoreChange(idx, e.target.value)}
                        placeholder="Enter Marks"
                        className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3 "
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {/* Total Marks */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Marks
              </label>
              <input
                type="text"
                value={totalMarks}
                readOnly
                className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3"
              />
            </div>
            {/* Percentage */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Percentage
              </label>
              <input
                type="text"
                value={percentage}
                readOnly
                className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3"
              />
            </div>
            {/* Cutoff */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                CutOff
              </label>
              <input
                type="text"
                value={cutoff} // Corrected: Now displays calculated value
                readOnly
                className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3 font-bold text-blue-600"
              />
            </div>
            {/* Eligiblity */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Engineering Eligiblity
              </label>
              <input
                type="text"
                value={eligibility}
                readOnly
               className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3 font-bold text-blue-600"
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

export default AcademicScores;
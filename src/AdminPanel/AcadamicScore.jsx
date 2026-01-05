import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/kongunadulogo.png"
import PDFPreviewModal from './PDFPreviewModal';
import Nav from "../Nav";

const AcademicScores = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationData = location.state?.applicationData || {};

  const [scores, setScores] = useState([
    { subject: "Tamil", max: 100, obtained: "" },
    { subject: "English", max: 100, obtained: "" },
    { subject: "Mathematics", max: 100, obtained: "" },
    { subject: "Physics", max: 100, obtained: "" },
    { subject: "Chemistry", max: 100, obtained: "" },
    { subject: "Computer Science / Biology", max: 100, obtained: "" },
  ]);

  const [uploads, setUploads] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [mediumOfStudy, setMediumOfStudy] = useState(applicationData.mediumOfStudy || 'English');
  const [schoolName, setSchoolName] = useState(applicationData.schoolName || '');
  const [yearOfPassing, setYearOfPassing] = useState(applicationData.yearOfPassing || '');
  const [registrationNo, setRegistrationNo] = useState(applicationData.registrationNo || '');
  const [isSaving, setIsSaving] = useState(false);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlFhbNdjWUj4YHTNsqStTY-fGnMe6k3YhZ2Y9-aXGr_Ds9S_T54qi9HqKhb4uSUPu2/exec";

  // const handleScoreChange = (index, value) => {
  //   const newScores = [...scores];
  //   newScores[index].obtained = value;
  //   setScores(newScores);
  // };
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
    setIsSaving(true);
    try {
      // Prepare updated data with scores
      const updatedData = {
        ...applicationData,
        mediumOfStudy,
        schoolName,
        yearOfPassing,
        registrationNo,
        tamilMarks: scores[0].obtained,
        englishMarks: scores[1].obtained,
        mathsMarks: scores[2].obtained,
        physicsMarks: scores[3].obtained,
        chemistryMarks: scores[4].obtained,
        csOrBioMarks: scores[5].obtained,
        hscTotalMarks: totalMarks,
        hscPercentage: percentage,
        cutoffMarks: cutoff
      };

      const params = new URLSearchParams();
      params.append("_method", "PUT");

      for (const [key, value] of Object.entries(updatedData)) {
        params.append(key, value);
      }

      const response = await fetch(GOOGLE_SCRIPT_URL + "?" + params.toString());
      const responseData = await response.json();

      if (response.ok && !responseData.error) {
        // Update local applicationData
        Object.assign(applicationData, updatedData);
        setShowSuccessModal(true);
      } else {
        alert("Failed to save scores: " + (responseData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving scores:", error);
      alert("Error saving scores: " + error.message);
    } finally {
      setIsSaving(false);
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
  // {/* Eligibility */ }
  // const eligibility = parseFloat(cutoff) > 40 ? "Eligible" : "Not Eligible";

  const [termsAccepted, setTermsAccepted] = useState(true);


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

  return (
    <>
      {/* top */}
      {/* <div className="py-1 ml-10 flex flex-row font-bold ">
        <img src={logo} className="w-10  " alt="Logo" />
        <h1 className="py-5  px-3 text-2xl mt-3 ">
          Kongunadu college of Engineering and Technology
        </h1>
      </div> */}
      <div>
        <Nav />
      </div>

      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
        <div className="max-w-4xl w-full bg-white shadow p-6 rounded-md">

          <h2 className=" text-4xl font-semibold text-gray-800">
            HSC State Board Scores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
            <div className="grid">
              <label className="font-semibold text-gray-600">Medium of Study</label>
              <select value={mediumOfStudy} onChange={(e) => setMediumOfStudy(e.target.value)} className="px-3 py-2 mt-1 p-3 border-gray-200 text-lg text-gray-800 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
              </select>
            </div>
            <div className="grid">
              <label className="font-semibold text-gray-600">School Name & Location</label>
              <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Enter School Name & Location" className="px-3 py-2 mt-1 p-3 border-gray-200 text-lg text-gray-800 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="grid">
              <label className="font-semibold text-gray-600">Year of Passing</label>
              <input type="text" value={yearOfPassing} onChange={(e) => setYearOfPassing(e.target.value)} placeholder="Year of Passing" className="px-3 py-2 mt-1 p-3 border-gray-200 text-lg text-gray-800 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="grid">
              <label className="font-semibold text-gray-600">Register Number</label>
              <input type="text" value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} placeholder="Enter Register Number" className="px-3 py-2 mt-1 p-3 border-gray-200 text-lg text-gray-800 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
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
                        placeholder="Enter marks"
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
                Eligiblity
              </label>
              <input
                type="text"
                value={eligibility}
                readOnly
                className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3 font-bold text-blue-600" />
            </div>


          </div>

          {/* Upload Documents */}
          {/* <h3 className="mt-8 text-lg font-semibold text-gray-700">
            Upload Documents
          </h3>
          <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500 text-sm mb-2">Drag and drop or browse</p>
            <p className="text-xs text-gray-400 mb-4">
              Upload your HSC mark sheets and certificates here.
            </p>
            <input
              type="file"
              multiple
              onChange={handleUploadChange}
              className="hidden "
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Browse Files
            </label>

            {uploads.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600">
                {uploads.map((file, i) => (
                  <li key={i}>{file.name}</li>
                ))}
              </ul>
            )}
          </div> */}

          {/* Submit */}
          <div className="mt-6 flex justify-end items-center gap-4">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span>I accept the Terms and Conditions</span>
            </label>

            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-md transition duration-200 ${termsAccepted && !isSaving ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                }`}
              onClick={handleNavigate}
              disabled={!termsAccepted || isSaving}
            >
              {isSaving ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Data Successfully Stored!</h3>
              <p className="text-gray-600 mb-6">
                Academic scores have been saved successfully.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/feesInfo', { state: { applicationData } });
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  FeesInfo
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setShowPDFPreview(true);
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => {
          setShowPDFPreview(false);
          navigate('/feesInfo');
        }}
        studentData={applicationData}
        studentName={applicationData.fullName}
      />    </>
  );
};

export default AcademicScores;
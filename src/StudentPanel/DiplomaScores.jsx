import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/kongunadulogo.png"

const DiplomaScores = () => {
  const navigate = useNavigate();



  const [fifthSemMarks, setFifthSemMarks] = useState("");
  const [sixthSemMarks, setSixthSemMarks] = useState("");

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
    completionDate: ''
  });



  const handleNavigate = () => {
    // Generate Enquiry ID
    let currentEnqId = localStorage.getItem("enqIdCounter");
    if (!currentEnqId) {
      currentEnqId = 0;
    } else {
      currentEnqId = parseInt(currentEnqId);
    }
    currentEnqId += 1;
    localStorage.setItem("enqIdCounter", currentEnqId);

    // Format: KN26EQ0001
    const paddedEnqCount = String(currentEnqId).padStart(4, '0');
    const enquiryId = `KN26EQ${paddedEnqCount}`;

    // Save to local storage if needed, similar to other forms
    const diplomaData = {
      enquiryId,
      diplomaDetails,
      fifthSemMarks,
      sixthSemMarks
    };
    localStorage.setItem('academicScoresData', JSON.stringify(diplomaData));

    navigate("/success", { state: { enquiryId } });
  }

  const handleUploadChange = (e) => {
    const files = Array.from(e.target.files);
    setUploads(files);
  };



  const [termsAccepted, setTermsAccepted] = useState(false);



  return (
    <>

      {/* top */}
      <div className="py-1 ml-10 flex flex-row font-bold ">
        <img src={logo} className="w-10  " />
        <h1 className="py-5  px-3 text-2xl mt-3 ">
          Kongunadu college of Engineering and Technology
        </h1>

      </div>


      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
        <div className="max-w-4xl w-full bg-white shadow p-6 rounded-md">

          <h2 className=" text-4xl font-semibold text-gray-800">
            Diploma Scores
          </h2>
          <p className="text-lg text-gray-700">
            Enter your diploma scores to complete your application.
          </p>

          {/* details */}
          <div className="mt-6 grid md:grid-cols-2 gap-4 font-semibold">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                value={diplomaDetails.program}
                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, program: e.target.value })}
                className="mt-1 w-90 border-gray-300 rounded-md p-3 border "
                placeholder="Enter your Diploma Program"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                value={diplomaDetails.institution}
                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, institution: e.target.value })}
                className="mt-1 w-90 border-gray-300 rounded-md p-3 border "
                placeholder="Enter your Institution"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Register/Roll No</label>
              <input
                type="text"
                value={diplomaDetails.institution}
                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, institution: e.target.value })}
                className="mt-1 w-90 border-gray-300 rounded-md p-3 border "
                placeholder="Enter your Register/Roll No"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Completion year</label>
              <input
                type="number"
                value={diplomaDetails.completionDate}
                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, completionDate: e.target.value })}
                className="mt-1 w-90 border-gray-300 rounded-md p-3 border"
                  placeholder="Enter your completion year"
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
                className="mt-1 w-90 border-gray-300 rounded-md p-3 border"
                placeholder="Enter your up 1st to 5th semester marks"
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
                className="mt-1 w-90 border-gray-300 rounded-md p-3 border"
                placeholder="Enter your up 1st to 6th semester marks"
              />
            </div>


            {/* eligiblity */}

            {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                    Eligibility
                </label>
                <input
                    type="text"
                    value={percentage >= 40 ? "Eligible" : "Not Eligible"}
                    readOnly
                    className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3 font-bold text-blue-600"
                />
            </div> */}
          </div>

          

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
              className={`px-6 py-2 text-white rounded-md transition duration-200 ${termsAccepted ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                }`}
              onClick={handleNavigate}
              disabled={!termsAccepted}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiplomaScores;

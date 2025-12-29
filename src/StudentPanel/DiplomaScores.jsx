import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/kongunadulogo.png"

const DiplomaScores = () => {
  const navigate = useNavigate();

  const [diplomaScores, setDiplomaScores] = useState([
    { subject: "Engineering Mathematics", max: 100, obtained: "" },
    { subject: "Electrical Technology", max: 100, obtained: "" },
    { subject: "Electronics", max: 100, obtained: "" },
    { subject: "Mechanical Technology", max: 100, obtained: "" },
    { subject: "Computer Applications", max: 100, obtained: "" },
  ]);

  // Upload files state
  const [uploads, setUploads] = useState([]);

  const [diplomaDetails, setDiplomaDetails] = useState({
    program: '',
    institution: '',
    completionDate: ''
  });

  const handleScoreChange = (index, value) => {
    const newScores = [...diplomaScores];
    newScores[index].obtained = value;
    setDiplomaScores(newScores);
  };

  const handleNavigate = () => {
    navigate("/success");
  }

  const handleUploadChange = (e) => {
    const files = Array.from(e.target.files);
    setUploads(files);
  };

  const totalMarks = diplomaScores.reduce(
    (sum, s) => sum + (parseInt(s.obtained) || 0),
    0
  );

  const percentage =
    totalMarks > 0 ? ((totalMarks / (diplomaScores.length * 100)) * 100).toFixed(2) : "";

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

          <div className="mt-6 grid-col-3  gap-4 font-semibold">
            <div>
              <label className="block text-sm font-medium text-gray-700">Diploma Program</label>
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
              <label className="block text-sm font-medium text-gray-700">Completion Date</label>
              <input
                type="date"
                value={diplomaDetails.completionDate}
                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, completionDate: e.target.value })}
                className="mt-1 w-90 border-gray-300 rounded-md p-3 border"
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
                {diplomaScores.map((s, idx) => (
                  <tr key={s.subject} className="text-sm">
                    <td className="p-3 border">{s.subject}</td>
                    <td className="p-3 border text-center">{s.max}</td>
                    <td className="p-3 border">
                      <input
                        type="number"
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
          </div>

          {/* Upload Documents */}
          <h3 className="mt-8 text-lg font-semibold text-gray-700">
            Upload Documents
          </h3>
          <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500 text-sm mb-2">Drag and drop or browse</p>
            <p className="text-xs text-gray-400 mb-4">
              Upload your Diploma mark sheets and certificates here.
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

            {/* Show uploaded file names */}
            {uploads.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600">
                {uploads.map((file, i) => (
                  <li key={i}>{file.name}</li>
                ))}
              </ul>
            )}
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

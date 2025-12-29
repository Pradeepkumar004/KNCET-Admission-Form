import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/kongunadulogo.png"

const AcademicScores = () => {
    const navigate = useNavigate();

    const [scores, setScores] = useState([

        { subject: "English", max: 100, obtained: "" },
        { subject: "Mathematics", max: 100, obtained: "" },
        { subject: "Physics", max: 100, obtained: "" },
        { subject: "Chemistry", max: 100, obtained: "" },
        { subject: "Computer Science / Biology", max: 100, obtained: "" },
    ]);

    const [uploads, setUploads] = useState([]);

    const handleScoreChange = (index, value) => {
        const newScores = [...scores];
        newScores[index].obtained = value;
        setScores(newScores);
    };

    const handleNavigate = () => {
        navigate("/success");
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

    const [termsAccepted, setTermsAccepted] = useState(false);

    return (
        <>
            {/* top */}
            <div className="py-1 ml-10 flex flex-row font-bold ">
                <img src={logo} className="w-10  " alt="Logo" />
                <h1 className="py-5  px-3 text-2xl mt-3 ">
                    Kongunadu college of Engineering and Technology
                </h1>
            </div>

            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
                <div className="max-w-4xl w-full bg-white shadow p-6 rounded-md">

                    <h2 className=" text-4xl font-semibold text-gray-800">
                        CBSC Scores
                    </h2>

                    <div className="flex flex-row mt-5">
                        <div className="grid">
                            <label className="font-semibold text-gray-600">Medium of Study</label>
                            <select className="  px-3 py-2 mt-1 w-120 p-3 border-gray-200 text-lg text-gray-800 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 " required>
                                <option value="english">English</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className=" grid ml-6 gap-3">
                            <label>Year of Passing</label>
                            <input type="text" placeholder="Year of Passing" className="input  px-3 py-2 mt-1 w-60 p-3 border-gray-200 text-lg text-gray-800 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
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
                    </div>

                    {/* Upload Documents */}
                    <h3 className="mt-8 text-lg font-semibold text-gray-700">
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

export default AcademicScores;
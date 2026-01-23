import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 


const VocationalScores = () => {
    const navigate = useNavigate();

    const [scores, setScores] = useState([
        { subject: "Tamil", max: 100, obtained: "" },
        { subject: "English", max: 100, obtained: "" },
        { subject: "", max: 100, obtained: "" },
        { subject: "", max: 100, obtained: "" },
        { subject: "", max: 100, obtained: "" },
        { subject: "", max: 100, obtained: "" },
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

    // Get enquiry ID from localStorage (set by PersonalInfo component)
    const enquiryId = localStorage.getItem("enquiryId");

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

    const handleSubjectChange = (index, value) => {
        const newScores = [...scores];
        newScores[index].subject = value;
        setScores(newScores);
    };

    const handleNavigate = async () => {
        // Validate required fields
        if (!schoolName || !registerNumber || !mediumOfStudy || !yearOfPassing) {
            alert("Please fill in all required fields");
            return;
        }

        // Check if all scores are entered
        const allScoresEntered = scores.every(s => s.obtained && s.obtained.trim() !== "");
        

        // Get personal info from localStorage
        const personalData = JSON.parse(localStorage.getItem('submittedFormData') || '{}');
        
        if (!personalData.fullName) {
            alert("Error: Personal information not found. Please complete Personal Information first.");
            return;
        }

        setIsLoading(true);

        try {
            console.log("Submitting combined personal and Vocational data...");
            
            // Remove the 'initial' field as it's already combined in fullName
            const { initial, ...cleanedPersonalData } = personalData;
            
            // Prepare combined data (personal + scores)
            const combinedData = {
                action: "submitStudentData",
                // Personal info fields (without 'initial')
                ...cleanedPersonalData,
                // Score fields
                courseType: "Vocational",
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
        const cutoffValue = (math + physics + chemistry)/3;
        return cutoffValue > 0 ? cutoffValue.toFixed(2) : "0.00";
    };

    const cutoff = calculateCutoff();
    // --- ADDED CUTOFF LOGIC END ---

    {/* Eligibility */ }
    // const eligibility = parseFloat(cutoff) > 40 ? "Eligible" : "Not Eligible";










    return (
        <>
            {/* Hide native number input spinners for consistent UI */}
            <style>{`
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>
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
                        HSC Vocational Scores
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
                                    <tr key={idx} className="text-sm">
                                        <td className="p-3 border">
                                            <input
                                                type="text"
                                                value={s.subject}
                                                onChange={(e) => handleSubjectChange(idx, e.target.value)}
                                                placeholder="Enter Your Subject"
                                                className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3 " />
                                        </td>
                                        {/* <td className="p-3 border">{s.subject}</td> */}
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
                                type="number"
                                min="0"
                                max="100"
                                // value={cutoff} // Corrected: Now displays calculated value
                                // readOnly
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // allow empty input
                                    if (value === "") {
                                        handleScoreChange("");
                                        return;
                                    }

                                    const num = Number(value);

                                    if (num >= 0 && num <= 100) {
                                        handleScoreChange(num);
                                    }
                                }}
                                className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3 font-bold "
                            />
                        </div>
                        {/* Eligiblity */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Engineering Eligiblity
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                // value={eligibility}
                                // readOnly
                                // className={`mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3 font-bold ${eligibility === "Eligible" ? "text-green-600" : "text-red-600"}`}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // allow empty input
                                    if (value === "") {
                                        handleScoreChange("");
                                        return;
                                    }

                                    const num = Number(value);

                                    if (num >= 0 && num <= 100) {
                                        handleScoreChange(num);
                                    }
                                }}
                                className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3"
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

export default VocationalScores;
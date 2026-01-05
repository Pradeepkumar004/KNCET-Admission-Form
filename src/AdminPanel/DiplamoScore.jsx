import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/kongunadulogo.png"

const AdminDiplomaScores = () => {
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

                     <div className="mt-6 grid md:grid-cols-2 gap-4 font-semibold">
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
                            <label className="block text-sm font-medium text-gray-700">Register No/Roll No</label>
                            <input
                                type="text"
                                value={diplomaDetails.registerNo}
                                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, registerNo: e.target.value })}
                                className="mt-1 w-90 border-gray-300 rounded-md p-3 border "
                                placeholder="Enter your Register No/Roll No"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Completion Year</label>
                            <input
                                type="number"
                                value={diplomaDetails.completionDate}
                                onChange={(e) => setDiplomaDetails({ ...diplomaDetails, completionDate: e.target.value })}
                                className="mt-1 w-90 border-gray-300 rounded-md p-3 border"
                                placeholder="Enter your Completion year"
                            />
                        </div>
                    </div>





                    {/* Semester Marks */}
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        {/* upto 5th sem */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                               1st to 5th semester
                            </label>
                            <input
                                // type="number"
                                min="0"
                                max="100"
                                value={fifthSemMarks}
                                onChange={(e) => handleSemesterMarkChange(e.target.value, setFifthSemMarks)}
                                className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3"
                            />
                        </div>


                        {/* upto 6th sem */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                1st to 6th semester
                            </label>
                            <input
                                // type="number"
                                min="0"
                                max="100"
                                value={sixthSemMarks}
                                onChange={(e) => handleSemesterMarkChange(e.target.value, setSixthSemMarks)}
                                className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 p-3"
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

                    {/* Upload Documents */}
                    {/* <h3 className="mt-8 text-lg font-semibold text-gray-700">
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
                        </label> */}

                        {/* Show uploaded file names */}
                        {/* {uploads.length > 0 && (
                            <ul className="mt-2 text-sm text-gray-600">
                                {uploads.map((file, i) => (
                                    <li key={i}>{file.name}</li>
                                ))}
                            </ul>
                        )} */}
                    {/* </div> */}

                    {/* Submit */}
                    <div className="mt-6 flex justify-end items-center gap-4">
                       

                        <button
                            type="submit"
                            className={`px-6 py-2 text-white rounded-md transition duration-200 `}
                            onClick={handleNavigate}
                            
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDiplomaScores;

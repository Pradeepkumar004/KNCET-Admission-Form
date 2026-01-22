import React, { useState, useEffect } from "react";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0xrX0EZirHB0kCkS3imlILIsRU7cxYRKRtawt-uw0Whr-t5g4Kys9UC8mo-UFvJb8PQ/exec";

export default function DiplomaScoresEdit({ applicationData, scoresData, onSave }) {
    const [diplomaData, setDiplomaData] = useState({
        program: '',
        institution: '',
        registerNo: '',
        completionYear: '',
        fifthSemMarks: '',
        sixthSemMarks: ''
    });
    
    const [isSaving, setIsSaving] = useState(false);

    // Load existing diploma data from applicationData and scoresData
    useEffect(() => {
        console.log("📚 Loading diploma data from props");
        console.log("scoresData:", scoresData);
        console.log("applicationData:", applicationData);
        
        // Try to get data from scoresData first, then fallback to applicationData
        if (scoresData && Object.keys(scoresData).length > 0) {
            console.log("✅ Using data from scoresData");
            setDiplomaData({
                program: scoresData.medium || applicationData?.diplomaProgram || '',
                institution: scoresData.schoolName || applicationData?.diplomaInstitution || '',
                registerNo: scoresData.registerNumber || applicationData?.diplomaRegisterNo || '',
                completionYear: scoresData.yearOfPassing || applicationData?.diplomaCompletionYear || '',
                fifthSemMarks: scoresData.subject1Marks || applicationData?.fifthSemMarks || '',
                sixthSemMarks: scoresData.subject2Marks || applicationData?.sixthSemMarks || ''
            });
        } else if (applicationData) {
            console.log("ℹ️ Using data from applicationData");
            setDiplomaData({
                program: applicationData.diplomaProgram || '',
                institution: applicationData.diplomaInstitution || '',
                registerNo: applicationData.diplomaRegisterNo || '',
                completionYear: applicationData.diplomaCompletionYear || '',
                fifthSemMarks: applicationData.fifthSemMarks || '',
                sixthSemMarks: applicationData.sixthSemMarks || ''
            });
        }
    }, [applicationData, scoresData]);

    const handleInputChange = (field, value) => {
        setDiplomaData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSemesterMarkChange = (value, field) => {
        if (value === "") {
            setDiplomaData(prev => ({ ...prev, [field]: value }));
            return;
        }
        const numVal = parseFloat(value);
        if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
            setDiplomaData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = async () => {
        // Validate required fields
        if (!diplomaData.program || !diplomaData.institution || !diplomaData.registerNo || !diplomaData.completionYear) {
            alert("Please fill in all required diploma details");
            return;
        }

        if (!diplomaData.fifthSemMarks || !diplomaData.sixthSemMarks) {
            alert("Please enter both semester marks");
            return;
        }

        setIsSaving(true);
        try {
            const updatedData = {
                ...applicationData,
                diplomaProgram: diplomaData.program,
                diplomaInstitution: diplomaData.institution,
                diplomaRegisterNo: diplomaData.registerNo,
                diplomaCompletionYear: diplomaData.completionYear,
                fifthSemMarks: diplomaData.fifthSemMarks,
                sixthSemMarks: diplomaData.sixthSemMarks
            };

            const params = new URLSearchParams();
            params.append("_method", "PUT");

            for (const [key, value] of Object.entries(updatedData)) {
                params.append(key, value);
            }

            const response = await fetch(GOOGLE_SCRIPT_URL + "?" + params.toString());
            const responseData = await response.json();

            if (response.ok && !responseData.error) {
                console.log("✅ Diploma scores saved successfully");
                if (onSave) {
                    onSave(updatedData);
                }
                alert("Diploma scores saved successfully!");
            } else {
                alert("Failed to save diploma scores: " + (responseData.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error saving diploma scores:", error);
            alert("Error saving diploma scores: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Diploma Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Diploma Program *</label>
                        <input
                            type="text"
                            value={diplomaData.program}
                            onChange={(e) => handleInputChange('program', e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter Diploma Program"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Diploma Institution *</label>
                        <input
                            type="text"
                            value={diplomaData.institution}
                            onChange={(e) => handleInputChange('institution', e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter Institution Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Register No/Roll No *</label>
                        <input
                            type="text"
                            value={diplomaData.registerNo}
                            onChange={(e) => handleInputChange('registerNo', e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter Register Number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Completion Year *</label>
                        <input
                            type="number"
                            value={diplomaData.completionYear}
                            onChange={(e) => handleInputChange('completionYear', e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter Completion Year"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Semester Marks
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">1st to 5th Semester (%) *</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={diplomaData.fifthSemMarks}
                            onChange={(e) => handleSemesterMarkChange(e.target.value, 'fifthSemMarks')}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Enter percentage"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">1st to 6th Semester (%) *</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={diplomaData.sixthSemMarks}
                            onChange={(e) => handleSemesterMarkChange(e.target.value, 'sixthSemMarks')}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Enter percentage"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

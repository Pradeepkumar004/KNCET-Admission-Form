import React from "react";
import Logo from "../assets/kongunadulogo.png"
import { useLocation } from "react-router-dom";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Nav from "../Nav";

const Sucess = () => {
    const location = useLocation();
    const [showToast, setShowToast] = React.useState(false);
    const [admissionId, setAdmissionId] = React.useState("");
    const [studentStatus, setStudentStatus] = React.useState("");

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0xrX0EZirHB0kCkS3imlILIsRU7cxYRKRtawt-uw0Whr-t5g4Kys9UC8mo-UFvJb8PQ/exec";

    React.useEffect(() => {
        setShowToast(true);
        const timer = setTimeout(() => {
            setShowToast(false);
        }, 5000); // Hide after 5 seconds

        // Fetch student data to get admission ID and status
        const enquiryId = location.state?.enquiryId;
        if (enquiryId) {
            fetch(GOOGLE_SCRIPT_URL + "?action=getPersonalInfo&enquiryId=" + encodeURIComponent(enquiryId))
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setAdmissionId(data.data.admissionId || "");
                        setStudentStatus(data.data.status || "");
                    }
                })
                .catch(error => console.error("Error fetching student data:", error));
        }

        return () => clearTimeout(timer);
    }, [location.state?.enquiryId]);

    const handleHome = () => {
        window.location.href = "/";
    }

    const handleDownloadReceipt = () => {
        // Get form data from localStorage or state
        const formData = JSON.parse(localStorage.getItem('submittedFormData') || '{}');
        const academicData = JSON.parse(localStorage.getItem('academicScoresData') || '{}');

        const doc = new jsPDF();

        // Add college logo and header
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Kongunadu College of Engineering & Technology', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('Autonomous', 105, 22, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Namakkal - Trichy Main Road, Thottiapatti (Po), Thottiam Taluk, Trichy Dt. 621 215', 105, 28, { align: 'center' });

        // Add title
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Admission Application Receipt', 105, 40, { align: 'center' });

        // Draw a line
        doc.line(20, 45, 190, 45);

        let yPosition = 55;

        // Personal Information
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Personal Information', 20, yPosition);
        yPosition += 10;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);

        const personalInfo = [
            ['Full Name', formData.fullName || 'N/A'],
            ['Email', formData.email || 'N/A'],
            ['Date of Birth', formData.dob || 'N/A'],
            ['Gender', formData.gender || 'N/A'],
            ['Accommodation', formData.accommodation || 'N/A'],
            ['Room Type', formData.roomType || 'N/A'],
            ['Travel Type', formData.travelType || 'N/A'],
        ];

        personalInfo.forEach(([label, value]) => {
            if (value !== 'N/A') {
                doc.text(`${label}:`, 20, yPosition);
                doc.text(value, 80, yPosition);
                yPosition += 7;
            }
        });

        // Preferences
        yPosition += 5;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Department Preferences', 20, yPosition);
        yPosition += 10;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const preferences = [
            ['1st Preference', formData.preference1 || 'N/A'],
            ['2nd Preference', formData.preference2 || 'N/A'],
            ['3rd Preference', formData.preference3 || 'N/A'],
            ['Seat Type', formData.quota || 'N/A'],
            ['Admission Type', formData.entry || 'N/A'],
        ];

        preferences.forEach(([label, value]) => {
            doc.text(`${label}:`, 20, yPosition);
            doc.text(value, 80, yPosition);
            yPosition += 7;
        });

        // Family Details
        yPosition += 5;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Family Details', 20, yPosition);
        yPosition += 10;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const familyInfo = [
            ['Father Name', formData.fatherName || 'N/A'],
            ['Father Occupation', formData.fatherOccupation || 'N/A'],
            ['Community', formData.community || 'N/A'],
            ['Caste', formData.caste || 'N/A'],
            ['Annual Income', formData.annualIncome || 'N/A'],
            ['First Graduate', formData.firstGrad || 'N/A'],
        ];

        familyInfo.forEach(([label, value]) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(`${label}:`, 20, yPosition);
            doc.text(value, 80, yPosition);
            yPosition += 7;
        });

        // Address
        yPosition += 5;
        if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Address Details', 20, yPosition);
        yPosition += 10;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const addressInfo = [
            ['Address Line 1', formData.address1 || 'N/A'],
            ['Address Line 2', formData.address2 || 'N/A'],
            ['Taluk', formData.taluk || 'N/A'],
            ['District', formData.district || 'N/A'],
            ['State', formData.state || 'N/A'],
            ['Pin Code', formData.pincode || 'N/A'],
            ['Father Contact', formData.fatherContact || 'N/A'],
            ['Mother Contact', formData.motherContact || 'N/A'],
            ['Student Contact', formData.studentContact || 'N/A'],
        ];

        addressInfo.forEach(([label, value]) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(`${label}:`, 20, yPosition);
            doc.text(value, 80, yPosition);
            yPosition += 7;
        });

        // Educational Background
        yPosition += 5;
        if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Educational Background', 20, yPosition);
        yPosition += 10;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const educationInfo = [
            ['SSLC Marks', formData.sslcMarks || 'N/A'],
            ['Govt School (6th-12th)', formData.govtSchool || 'N/A'],
            ['Last Studied', formData.lastStudies || 'N/A'],
        ];

        educationInfo.forEach(([label, value]) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(`${label}:`, 20, yPosition);
            doc.text(value, 80, yPosition);
            yPosition += 7;
        });

        // Academic Scores Section
        if (academicData && Object.keys(academicData).length > 0) {
            yPosition += 5;
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont(undefined, 'bold');
            doc.setFontSize(12);
            doc.text('Academic Scores', 20, yPosition);
            yPosition += 10;

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);

            // School details
            if (academicData.schoolName) {
                doc.text('School Name:', 20, yPosition);
                doc.text(academicData.schoolName || 'N/A', 80, yPosition);
                yPosition += 7;
            }
            if (academicData.registerNumber) {
                doc.text('Register Number:', 20, yPosition);
                doc.text(academicData.registerNumber || 'N/A', 80, yPosition);
                yPosition += 7;
            }
            if (academicData.medium) {
                doc.text('Medium of Study:', 20, yPosition);
                doc.text(academicData.medium || 'N/A', 80, yPosition);
                yPosition += 7;
            }
            if (academicData.yearOfPassing) {
                doc.text('Year of Passing:', 20, yPosition);
                doc.text(academicData.yearOfPassing || 'N/A', 80, yPosition);
                yPosition += 7;
            }

            // Subject-wise marks
            if (academicData.scores && academicData.scores.length > 0) {
                yPosition += 5;
                if (yPosition > 240) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.setFont(undefined, 'bold');
                doc.text('Subject Marks:', 20, yPosition);
                yPosition += 7;

                doc.setFont(undefined, 'normal');
                academicData.scores.forEach((score) => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(`${score.subject}:`, 30, yPosition);
                    doc.text(`${score.obtained}/${score.max}`, 120, yPosition);
                    yPosition += 6;
                });
            }

            // Summary
            yPosition += 3;
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont(undefined, 'bold');
            if (academicData.totalMarks) {
                doc.text('Total Marks:', 20, yPosition);
                doc.text(academicData.totalMarks.toString(), 80, yPosition);
                yPosition += 7;
            }
            if (academicData.percentage) {
                doc.text('Percentage:', 20, yPosition);
                doc.text(`${academicData.percentage}%`, 80, yPosition);
                yPosition += 7;
            }
            if (academicData.cutoff) {
                doc.text('Cutoff:', 20, yPosition);
                doc.text(academicData.cutoff.toString(), 80, yPosition);
                yPosition += 7;
            }
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
        }

        // Save the PDF
        doc.save(`KNCET_Application_${formData.fullName || 'Receipt'}.pdf`);
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
                {/* Top Navigation / Logo Bar */}
      
                <Nav/>
               

                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Success Content */}
                    <div className="grid justify-center gap-5 text-center py-6 sm:py-9">
                        {/* Toast Notification */}
                        {showToast && (
                            <div className="fixed top-5 right-5 flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow-lg dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-gray-800 transition-opacity duration-300 ease-in-out border-l-4 border-green-500 animate-slide-in-right z-50">
                                <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                                    </svg>
                                    <span className="sr-only">Check icon</span>
                                </div>
                                <div className="pl-4 text-sm font-normal text-white font-semibold">Data Saved Successfully!</div>
                                <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" onClick={() => setShowToast(false)} aria-label="Close">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                </button>
                            </div>
                        )}


                        <div>
                            <div>
                                <img src={Logo} className="mx-auto w-26 mb-2" alt="Logo" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Submitted Successfully!</h1>
                            <h1 className="text-lg text-gray-600 mb-6">Your admission details have been recorded</h1>

                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-700 mb-3">Enquiry ID</h1>
                                <input
                                    type="text"
                                    value={location.state?.enquiryId || ""}
                                    readOnly
                                    placeholder="Enquiry ID"
                                    className="p-2 border-2 border-blue-200 rounded-lg font-bold text-2xl text-center text-blue-800 focus:outline-none w-full max-w-xs bg-blue-50"
                                />
                            </div>

                            {studentStatus === "Admitted" && admissionId && (
                                <div className="mb-8">
                                    <h1 className="text-2xl font-bold text-gray-700 mb-3">Admission ID</h1>
                                    <input
                                        type="text"
                                        value={admissionId}
                                        readOnly
                                        placeholder="Admission ID"
                                        className="p-2 border-2 border-green-200 rounded-lg font-bold text-2xl text-center text-green-800 focus:outline-none w-full max-w-xs bg-green-50"
                                    />
                                    <p className="text-green-600 font-semibold mt-2">✓ Admitted Successfully!</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-5">
                                <button
                                    type="button"
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all w-full sm:w-auto"
                                    onClick={handleDownloadReceipt}
                                >
                                    Download Receipt
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all w-full sm:w-auto"
                                    onClick={handleHome}
                                >
                                    Go to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
export default Sucess;
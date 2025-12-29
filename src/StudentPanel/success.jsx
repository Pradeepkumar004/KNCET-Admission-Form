import React from "react";
import Logo from "../assets/kongunadulogo.png"
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Sucess = () => {
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
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 sm:flex-row">
                        <img src={Logo} alt="KNCET Logo" className="h-12 w-auto" />
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight text-center">
                            Kongunadu College of Engineering and Technology
                        </h1>
                    </div>
                </nav>

                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Success Content */}
                    <div className="grid justify-center gap-5 text-center py-6 sm:py-9">
                        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 max-w-md mx-auto">
                            <svg className="w-12 sm:w-16 h-12 sm:h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h1 className="text-2xl sm:text-3xl font-bold text-green-700">Data Saved Successfully!</h1>
                            <p className="mt-3 text-sm sm:text-base text-gray-700">Your admission details have been recorded</p>
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
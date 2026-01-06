import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import logo from "../assets/kongunadulogo.png"
import Nav from "../Nav";
import PDFPreviewModal from '../AdminPanel/PDFPreviewModal';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlFhbNdjWUj4YHTNsqStTY-fGnMe6k3YhZ2Y9-aXGr_Ds9S_T54qi9HqKhb4uSUPu2/exec";

const FeeStructure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationData = location.state?.applicationData || {};
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [admissionId, setAdmissionId] = useState("");
  const [formData, setFormData] = useState({
    // College Fees
    tuitionFee: 0,
    developmentFee: 0,
    admissionFee: 0,
    cautionDeposit: 0,
    optionalFees: 0,
    // Scholarships
    scStScholarship: 0,
    fgScholarship: 0,
    // Add-ons
    busFee: 0,
    messBill: 0,
    roomRent: 0,
    laundryCharges: 0,
    quota: "Management",
    status: "Pending",
  });

  const [totals, setTotals] = useState({
    subTotal: 0,
    collegeTotal: 0,
    hostelTotal: 0,
    overallTotal: 0,
  });

  useEffect(() => {
    const subTotal = Number(formData.tuitionFee) + Number(formData.developmentFee) +
      Number(formData.admissionFee) + Number(formData.cautionDeposit) +
      Number(formData.optionalFees);

    const deductions = Number(formData.scStScholarship) + Number(formData.fgScholarship);
    const collegeTotal = subTotal - deductions;

    const hostelTotal = Number(formData.messBill) + Number(formData.roomRent) +
      Number(formData.laundryCharges);

    const overallTotal = collegeTotal + Number(formData.busFee) + hostelTotal;

    setTotals({ subTotal, collegeTotal, hostelTotal, overallTotal });
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [selectedDepartment, setSelectedDepartment] = useState("");

  const departments = [
    "AD", "BME", "CSE", "CIVIL", "ECE", "EEE", "IT", "MECH"
  ];

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Prepare data to save (merge applicationData with formData)
      const dataToSave = {
        ...applicationData,
        ...formData,
        // Fee details
        tuitionFee: formData.tuitionFee,
        developmentFee: formData.developmentFee,
        admissionFee: formData.admissionFee,
        cautionDeposit: formData.cautionDeposit,
        optionalFees: formData.optionalFees,
        scStScholarship: formData.scStScholarship,
        fgScholarship: formData.fgScholarship,
        busFee: formData.busFee,
        messBill: formData.messBill,
        roomRent: formData.roomRent,
        laundryCharges: formData.laundryCharges,
        quota: formData.quota,
        status: formData.status,
        // Totals
        feeSubTotal: totals.subTotal,
        feeCollegeTotal: totals.collegeTotal,
        feeHostelTotal: totals.hostelTotal,
        feeOverallTotal: totals.overallTotal,
      };

      // Generate admission ID if status is Admitted
      if (formData.status === 'Admitted') {
        let currentCount = localStorage.getItem("appIdCounter");
        if (!currentCount) {
          currentCount = 0;
        } else {
          currentCount = parseInt(currentCount);
        }
        currentCount += 1;
        localStorage.setItem("appIdCounter", currentCount);

        const paddedCount = String(currentCount).padStart(4, '0');
        const generatedAdmissionId = `26KNF${paddedCount}`;
        setAdmissionId(generatedAdmissionId);
        dataToSave.admissionId = generatedAdmissionId;
      }

      // Save to backend
      const params = new URLSearchParams();
      params.append("_method", "PUT");

      for (const [key, value] of Object.entries(dataToSave)) {
        params.append(key, value);
      }

      const response = await fetch(GOOGLE_SCRIPT_URL + "?" + params.toString());
      const responseData = await response.json();

      if (response.ok && !responseData.error) {
        // Update local applicationData
        Object.assign(applicationData, dataToSave);
        setShowSuccessModal(true);
      } else {
        alert("Failed to save data: " + (responseData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setFormData({ ...formData, status: newStatus });
  };

  return (
    <>
      {/* Internal Style to hide the up/down arrows (spinners) on number inputs */}
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

      <Nav />
      <div className="min-h-screen bg-gray-100 p-8 flex justify-center pb-20">

        <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden mb-10">

          {/* Header */}
          <div className="bg-[#e91e63] text-white p-4 text-center font-bold text-xl uppercase tracking-wider">
            Fee Structure
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#fce4ec] text-[#e91e63]">
                <th className="p-3 border text-left w-2/3">Particulars (Per Year)</th>
                <th className="p-3 border text-center">Fees Amount (₹)</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {/* Section 1: Basic College Fees */}
              <tr className="bg-green-50 font-semibold">
                <td colSpan="2" className="p-2 border">1. College Fees</td>
              </tr>
              {[
                { label: "Tuition Fee", name: "tuitionFee" },
                { label: "Development Fee", name: "developmentFee" },
                { label: "Admission Fee (One Time)", name: "admissionFee" },
                { label: "Caution Deposit (One Time)", name: "cautionDeposit" },
                { label: "Optional Fees (Books, ID, Insurance, etc.)", name: "optionalFees" },
              ].map((item) => (
                <tr key={item.name} className="bg-green-50">
                  <td className="p-3 border">{item.label}</td>
                  <td className="p-3 border">
                    <input
                      type="number"
                      name={item.name}
                      min="0"
                      onChange={handleInputChange}
                      className="w-full p-1 border rounded text-center"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
              <tr className="bg-green-100 font-bold">
                <td className="p-3 border text-right">Total Sub-Total</td>
                <td className="p-3 border text-center text-blue-700">₹{totals.subTotal}</td>
              </tr>

              {/* Section 2: Deductions (Less -) */}
              <tr className="bg-red-50 font-bold text-red-600">
                <td colSpan="2" className="p-2 border">(Less -) Scholarships</td>
              </tr>
              <tr className="bg-red-50">
                <td className="p-3 border">SC / ST Scholarship (Income &lt; 2.5L)</td>
                <td className="p-3 border">
                  <input type="number" name="scStScholarship" min="0" onChange={handleInputChange} className="w-full p-1 border rounded text-center" placeholder="0" />
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="p-3 border">FG - First Graduate Scholarship</td>
                <td className="p-3 border">
                  <input type="number" name="fgScholarship" min="0" onChange={handleInputChange} className="w-full p-1 border rounded text-center" placeholder="0" />
                </td>
              </tr>
              <tr className="bg-gray-800 text-white font-bold">
                <td className="p-3 border text-right uppercase">Total College Fees</td>
                <td className="p-3 border text-center">₹{totals.collegeTotal}</td>
              </tr>

              {/* Section 3: Transportation */}
              <tr className="bg-pink-50 font-bold text-pink-600">
                <td colSpan="2" className="p-2 border">(Plus +) Transportation</td>
              </tr>
              <tr className="bg-pink-50">
                <td className="p-3 border font-semibold italic">Bus Fee (Per Year)</td>
                <td className="p-3 border">
                  <input type="number" name="busFee" min="0" onChange={handleInputChange} className="w-full p-1 border rounded text-center" placeholder="0" />
                </td>
              </tr>

              {/* Section 4: Hostel Fees */}
              <tr className="bg-green-50 font-bold text-green-700">
                <td colSpan="2" className="p-2 border">(Plus +) Boys / Girls Hostel Fee</td>
              </tr>
              {[
                { label: "Mess Bill", name: "messBill" },
                { label: "Room Rent (Normal / Attached / AC)", name: "roomRent" },
                { label: "Laundry Charges", name: "laundryCharges" },
              ].map((item) => (
                <tr key={item.name} className="bg-green-50">
                  <td className="p-3 border">{item.label}</td>
                  <td className="p-3 border">
                    <input type="number" name={item.name} min="0" onChange={handleInputChange} className="w-full p-1 border rounded text-center" placeholder="0" />
                  </td>
                </tr>
              ))}
              <tr className="bg-green-100 font-bold">
                <td className="p-3 border text-right uppercase">Total Hostel Fees</td>
                <td className="p-3 border text-center text-blue-700">₹{totals.hostelTotal}</td>
              </tr>

              {/* Final Overall Total */}
              <tr className="bg-[#e91e63] text-white font-extrabold text-lg">
                <td className="p-4 border text-right uppercase tracking-widest">Overall Fees Payable</td>
                <td className="p-4 border text-center">₹{totals.overallTotal}</td>
              </tr>
            </tbody>
          </table>

          {/* Status Buttons and Submit Section */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Application Status</label>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={() => handleStatusChange("Admitted")}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all border-2 ${formData.status === "Admitted"
                  ? "bg-green-600 text-white border-green-600 shadow-md transform scale-105"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"
                  }`}
              >
                Admitted
              </button>
              <button
                onClick={() => handleStatusChange("Pending")}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all border-2 ${formData.status === "Pending"
                  ? "bg-yellow-500 text-white border-yellow-500 shadow-md transform scale-105"
                  : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400 hover:text-yellow-600"
                  }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusChange("cancel")}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all border-2 ${formData.status === "cancel"
                  ? "bg-red-600 text-white border-red-600 shadow-md transform scale-105"
                  : "bg-white text-gray-600 border-gray-200 hover:border-red-400 hover:text-red-600"
                  }`}
              >
                Canceled
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className={`px-8 py-3 text-white font-bold rounded-lg shadow-lg transition duration-300 ${isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {isSaving ? "Saving..." : "Submit Application"}
              </button>
            </div>
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
              <p className="text-gray-600 mb-4">
                Fee information has been saved successfully.
              </p>

              {formData.status === 'Admitted' && admissionId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Admission ID</p>
                  <p className="text-2xl font-bold text-green-700">{admissionId}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/admindashboard');
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Go to Dashboard
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
          navigate('/admindashboard');
        }}
        studentData={applicationData}
        studentName={applicationData.fullName}
      />
    </>
  );
};

export default FeeStructure;
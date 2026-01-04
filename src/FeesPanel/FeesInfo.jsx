import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import logo from "../assets/kongunadulogo.png"
import Nav from "../Nav";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlFhbNdjWUj4YHTNsqStTY-fGnMe6k3YhZ2Y9-aXGr_Ds9S_T54qi9HqKhb4uSUPu2/exec";

const FeeStructure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationData = location.state?.applicationData || {};
  const [isSaving, setIsSaving] = useState(false);
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

      // Save to backend
      const params = new URLSearchParams();
      params.append("_method", "PUT");

      for (const [key, value] of Object.entries(dataToSave)) {
        params.append(key, value);
      }

      const response = await fetch(GOOGLE_SCRIPT_URL + "?" + params.toString());
      const responseData = await response.json();

      if (response.ok && !responseData.error) {
        // Backend save successful
        if (formData.status === 'Admitted') {
          // Generate Application ID
          let currentCount = localStorage.getItem("appIdCounter");
          if (!currentCount) {
            currentCount = 0;
          } else {
            currentCount = parseInt(currentCount);
          }

          currentCount += 1;
          localStorage.setItem("appIdCounter", currentCount);

          const paddedCount = String(currentCount).padStart(4, '0');
          const applicationId = `26KNF${paddedCount}`;

          navigate("/application-success", { state: { applicationId, status: formData.status } });
        } else {
          // For Pending or Cancel, navigate to dashboard
          navigate("/admindashboard");
        }
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
      {/* <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
          <img src={logo} alt="KNCET Logo" className="h-12 w-auto" />
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Kongunadu College of Engineering and Technology
          </h1>
        </div>
      </nav> */}
      <Nav />
      <div className="min-h-screen bg-gray-100 p-8 flex justify-center pb-20">

        <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden mb-10">

          {/* Header */}
          <div className="bg-[#e91e63] text-white p-4 text-center font-bold text-xl uppercase tracking-wider">
            Fee Structure Analysis (Per Year)
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
                  <input type="number" name="scStScholarship" onChange={handleInputChange} className="w-full p-1 border rounded text-center" placeholder="0" />
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="p-3 border">FG - First Graduate Scholarship</td>
                <td className="p-3 border">
                  <input type="number" name="fgScholarship" onChange={handleInputChange} className="w-full p-1 border rounded text-center" placeholder="0" />
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
                  <input type="number" name="busFee" onChange={handleInputChange} className="w-full p-1 border rounded text-center" placeholder="0" />
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
                    <input type="number" name={item.name} onChange={handleInputChange} className="w-full p-1 border rounded text-center" placeholder="0" />
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

          {/* Department Selection and Submit */}
          {/* <select
            className="p-2 border border-blue-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
              ))}
              </select> */}
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
                Cancel
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
    </>
  );
};

export default FeeStructure;
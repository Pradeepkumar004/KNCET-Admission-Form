import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/kongunadulogo.png"

const FeeStructure = () => {
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
  const navigate = useNavigate();

  const departments = [
    "AD", "BME", "CSE", "CIVIL", "ECE", "EEE", "IT", "MECH"
  ];

  const handleSubmit = () => {
    if (!selectedDepartment) {
      alert("Please select a department");
      return;
    }

    // Get current counter from local storage or start at 1
    let currentCount = localStorage.getItem("appIdCounter");
    if (!currentCount) {
      currentCount = 1;
    } else {
      currentCount = parseInt(currentCount) + 1;
    }

    // Save updated counter
    localStorage.setItem("appIdCounter", currentCount);

    // Generate Application ID
    const applicationId = `KNCET${selectedDepartment}${currentCount}`;

    // Navigate to success page with ID
    navigate("/application-success", { state: { applicationId } });
  };

  return (
    <>
    <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
              <img src={logo} alt="KNCET Logo" className="h-12 w-auto" />
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                Kongunadu College of Engineering and Technology
              </h1>
            </div>
          </nav>
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
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
          <select
            className="p-2 border border-blue-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#e91e63] text-white font-bold rounded shadow hover:bg-pink-700 transition duration-300"
          >
            Submit
          </button>
        </div>

      </div>
    </div>
    </>
  );
};

export default FeeStructure;
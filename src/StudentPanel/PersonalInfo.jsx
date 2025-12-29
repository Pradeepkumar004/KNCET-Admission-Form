import React from "react";
import { useState } from "react";
import logo from "../assets/kongunadulogo.png"
import { useNavigate } from "react-router-dom";

const PersonalInfo = () => {

  const [formData, setFormData] = useState({
    preference1: '',
    preference2: '',
    preference3: '',
    quota: '',
    entry: '',
    fullName: '',
    email: '',
    dob: '',
    gender: '',
    accommodation: '',
    roomType: '',
    travelType: '',
    fatherName: '',
    fatherOccupation: '',
    community: '',
    caste: '',
    annualIncome: '',
    firstGrad: '',
    address1: '',
    address2: '',
    taluk: '',
    district: '',
    state: '',
    pincode: '',
    fatherContact: '',
    motherContact: '',
    studentContact: '',
    sslcMarks: '',
    schoolName: '',
    govtSchool: '',
    lastStudies: '',
    // Add more fields as needed
  });

  const navigate = useNavigate();


  const degree = [
    { id: 1, department: "AD(Artificial and Data Science Engineering)" },
    { id: 2, department: "AGRI(Agricultural Engineering)" },
    { id: 3, department: "BME(Bio-Medical Engineering)" },
    { id: 4, department: "CSE(Computer Science and Engineering)" },
    { id: 5, department: "CIVIL(Civil Engineering)" },
    { id: 6, department: "ECE(Electronics and Communication Engineering )" },
    { id: 7, department: "EEE(Electrical and Electronics Engineering)" },
    { id: 8, department: "IT(Information Technology)" },
    { id: 9, department: "MECH(Mechanical Engineering)" },
  ]

  const Address = [
    { label: "Address Line 1 (Door no, Village Name / Street Name)", name: "address1", placeholder: "Enter Door no, Village Name / Street Name", full: true },
    { label: "Address Line 2 (Panchayat / Town)", name: "address2", placeholder: "Enter Panchayat / Town", full: true },
    { label: "Taluk", name: "taluk", placeholder: "Enter Taluk" },
    { label: "District", name: "district", placeholder: "Enter District" },
    { label: "State", name: "state", placeholder: "Enter State" },
    { label: "Pin Code", name: "pincode", placeholder: "Enter Pin Code" },
    { label: "Contact No. (Father)", name: "fatherContact", placeholder: "Enter Contact No. (Father)" },
    { label: "Contact No. (Mother)", name: "motherContact", placeholder: "Enter Contact No. (Mother)" },
    { label: "Contact No. (Student)", name: "studentContact", placeholder: "Enter Contact No. (Student)", full: true },
  ];
  const Community = [
    { id: 1, community: "OC" },
    { id: 2, community: "BC" },
    { id: 3, community: "BCM" },
    { id: 4, community: "MBC" },
    { id: 5, community: "SC" },
    { id: 6, community: "SCA" },
    { id: 7, community: "SCE" },
    { id: 8, community: "ST" }
  ]

  const options = [
    'HSC',
    'HSC Vocational',
    'CBSE',
    'Diploma',
    'Dropout'
  ];


  const handleNavigate = () => {
    if (formData.lastStudies === 'Diploma') {
      navigate("/diplomaInfo");
    } else if (formData.lastStudies === 'CBSE') {
      navigate("/CBSEInfo");
    } else {
      navigate("/HSCInfo");
    }
  }


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // const handleGenderChange = (e) => {
  //   setFormData({ ...formData, gender: e.target.value });
  // };
  // const handleHostelChange = (e) => {
  //   setFormData({ ...formData, BoysHostel: e.target.value });
  // }
  const handleGenderChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Google Apps Script endpoint
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlFhbNdjWUj4YHTNsqStTY-fGnMe6k3YhZ2Y9-aXGr_Ds9S_T54qi9HqKhb4uSUPu2/exec";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.quota) {
      alert('Please select a Quota (Management or Government)');
      return;
    }
    
    if (!formData.email) {
      alert('Please enter your email address');
      return;
    }
    
    if (!formData.fullName) {
      alert('Please enter your full name');
      return;
    }
    
    try {
      console.log("Submitting form data...");
      
      // Prepare data in the same format as stored in the sheet
      const submissionData = {
        ...formData,
        date: new Date().toISOString()
      };
      
      console.log("Data to submit:", submissionData);
      
      // Use GET method for adding new data (Apps Script requires GET for browser compatibility)
      const params = new URLSearchParams(submissionData).toString();
      const url = `${GOOGLE_SCRIPT_URL}?${params}`;
      
      console.log("Sending request to:", url.split('?')[0]);
      
      const response = await fetch(url, {
        method: 'GET',
      });
      
      console.log("Response status:", response.status);
      
      const result = await response.json();
      
      console.log("Response data:", result);
      
      if (result.success) {
        alert('Data sent successfully!');
        handleNavigate();
      } else if (result.error) {
        alert('Error: ' + result.error);
      } else {
        alert('Failed to send data: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert('Error: ' + error.message);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top Navigation / Logo Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
          <img src={logo} alt="KNCET Logo" className="h-12 w-auto" />
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Kongunadu College of Engineering and Technology
          </h1>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* College Branding Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2">
            Kongunadu College of Engineering & Technology
          </h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4 tracking-wide uppercase">Autonomous</h2>
          <div className="max-w-3xl mx-auto border-t border-gray-200 pt-4">
            <p className="text-gray-600 leading-relaxed">
              AICTE-New Delhi, Affiliation: Anna University, Chennai, Accreditations: NAAC & NBA<br />
              <span className="text-sm">Namakkal - Trichy Main Road, Thottiapatti (Po), Thottiam Taluk, Trichy Dt. 621 215</span>
            </p>
          </div>
        </header>

        {/* Form Section */}
        <section className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-blue-600 px-8 py-5">
            <h2 className="text-2xl font-bold text-white flex items-center">
          
              Personal Information
            </h2>
          </div>

          <form className="p-8 space-y-10" onSubmit={handleSubmit}>
            {/* Degree Preferences */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Degree / Department Preferences</label>
              <div className="space-y-3">
                <select name="preference1" value={formData.preference1} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                  <option value="" disabled>1st Preference</option>
                  {degree.map((dept, index) => (
                    <option key={index} value={dept.department}>{dept.department}</option>
                  ))}
                </select>
                <select name="preference2" value={formData.preference2} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                  <option value="" disabled>2nd Preference</option>
                  {degree.map((dept, index) => (
                    <option key={index} value={dept.department} disabled={dept.department === formData.preference1}>{dept.department}</option>
                  ))}
                </select>
                <select name="preference3" value={formData.preference3} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                  <option value="" disabled>3rd Preference</option>
                  {degree.map((dept, index) => (
                    <option key={index} value={dept.department} disabled={dept.department === formData.preference1 || dept.department === formData.preference2}>{dept.department}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Quota Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Seat Type</label>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <label className="flex items-center justify-center border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-600">
                  <input type="radio" name="quota" value="Management" checked={formData.quota === "Management"} onChange={handleChange} className="hidden" />
                  <span className="font-medium">Management</span>
                </label>
                <label className="flex items-center justify-center border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-600">
                  <input type="radio" name="quota" value="Government" checked={formData.quota === "Government"} onChange={handleChange} className="hidden" />
                  <span className="font-medium">Government</span>
                </label>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Admission Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Admission Type</label>
              <div className="flex space-x-4 max-w-md">
                <label className="flex-1 flex items-center justify-center border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-600">
                  <input type="radio" name="entry" value="I Year" checked={formData.entry === "I Year"} onChange={handleChange} className="hidden" />
                  <span className="font-medium">I Year</span>
                </label>
                <label className="flex-1 flex items-center justify-center border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-600">
                  <input type="radio" name="entry" value="Lateral Entry" checked={formData.entry === "Lateral Entry"} onChange={handleChange} className="hidden" />
                  <span className="font-medium">Lateral Entry</span>
                </label>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Student's official name" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Gender / Accomodation</label>
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl space-y-4">
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleGenderChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                      <span className="font-medium">Male</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleGenderChange} className="w-5 h-5 text-pink-600 focus:ring-pink-500" />
                      <span className="font-medium">Female</span>
                    </label>
                  </div>

                  {formData.gender && (
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase">Residence Preference</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer">
                          <input type="radio" name="accommodation" value={formData.gender === "Male" ? "BoysHostel" : "GirlsHostel"} checked={formData.accommodation === (formData.gender === "Male" ? "BoysHostel" : "GirlsHostel")} onChange={handleGenderChange} />
                          <span className="text-sm">Hostel</span>
                        </label>
                        <label className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer">
                          <input type="radio" name="accommodation" value="DayScholar" checked={formData.accommodation === "DayScholar"} onChange={handleGenderChange} />
                          <span className="text-sm">Day Scholar</span>
                        </label>
                      </div>

                      {/* Room / Travel Details Sub-options */}
                      {(formData.accommodation === "BoysHostel" || formData.accommodation === "GirlsHostel") && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
                          <select name="roomType" value={formData.roomType} onChange={handleGenderChange} className="w-full text-sm bg-transparent border-none outline-none focus:ring-0">
                            <option value="">Select Room Type</option>
                            <option value="Normal4">Normal (4 Members)</option>
                            <option value="Attach3">Attached Bath (3 Members)</option>
                            <option value="AC2">AC + Attached (2 Members)</option>
                          </select>
                        </div>
                      )}

                      {formData.accommodation === "DayScholar" && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
                          <select name="travelType" value={formData.travelType} onChange={handleGenderChange} className="w-full text-sm bg-transparent border-none outline-none focus:ring-0">
                            <option value="">Select Travel Type</option>
                            <option value="CollegeBus">College Bus</option>
                            <option value="OutBus">Own/Outside Travel</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Parents & Community Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Father / Guardian Name</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Father's Occupation</label>
                <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Community</label>
                <select name="community" value={formData.community} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" required>
                  <option value="" disabled>Select Community</option>
                  {Community.map((c, i) => <option key={i} value={c.community}>{c.community}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Caste</label>
                <input type="text" name="caste" value={formData.caste} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Annual Family Income</label>
                <input type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange} placeholder="₹" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
              </div>

              <div className="bg-blue-50 p-4 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-blue-900 uppercase">First Graduate?</span>
                  <span className="text-xs text-blue-700/70 capitalize">Are you the first in family to graduate?</span>
                </div>
                <div className="flex space-x-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="firstGrad" value="Yes" checked={formData.firstGrad === "Yes"} onChange={handleChange} className="w-5 h-5 text-blue-600" required />
                    <span className="text-sm font-semibold text-blue-900">Yes</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="firstGrad" value="No" checked={formData.firstGrad === "No"} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">No</span>
                  </label>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Address Grid */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Communication Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Address.map((field, index) => (
                  <div key={index} className={`${field.full ? "md:col-span-2 lg:col-span-3" : ""}`}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Education Grid */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Educational Background
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">SSLC Marks</label>
                    <input type="text" name="sslcMarks" value={formData.sslcMarks} onChange={handleChange} placeholder="Enter SSLC Marks out of 500" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
                  </div>
                 
                  <div className="flex items-center space-x-6 pt-2">
                    <span className="text-sm font-bold text-gray-700">Are you Studied Govt School (6th-12th)?</span>
                    <div className="flex space-x-3">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="govtSchool" value="Yes" checked={formData.govtSchool === "Yes"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Yes</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input type="radio" name="govtSchool" value="No" checked={formData.govtSchool === "No"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Last Studied</label>
                    <select name="lastStudies" value={formData.lastStudies} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm">
                      <option value="" disabled>Choose your previous course</option>
                      {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  {formData.lastStudies === 'Dropout' && (
                    <div className="p-5 bg-orange-50 rounded-xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-xs font-bold text-orange-800 uppercase">College Dropout Details</h4>
                      <div>
                        <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Previous College & Place</label>
                        <input type="text" className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-orange-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Reg No</label>
                          <input type="text" className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-orange-500" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Year of Study</label>
                          <input type="text" className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-orange-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-8 flex justify-end">
              <button
                type="submit"
                className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:translate-y-[-2px] transition-all active:translate-y-0"
              >
                Save and Continue
                <span className="ml-2">→</span>
              </button>
            </div>
          </form>
        </section>

        {/* Footer Area */}
        {/* <footer className="mt-12 text-center text-gray-400 text-sm">
          &copy; 2024 Kongunadu College of Engineering and Technology. All Rights Reserved.
        </footer> */}
      </main>
    </div>
  );
};

export default PersonalInfo;


import React from "react";
import { useState } from "react";
import logo from "../assets/kongunadulogo.png"
import { useNavigate } from "react-router-dom";
import AcademicScores from "./AcadamicScore";
import CBSEScore from "./CBSEScore";
import DiplomaScores from "./DiplomaScores";
import VocationalScores from "./Vocational";

const PersonalInfo = () => {


  const [isLoading, setIsLoading] = useState(false);
  const [showAcademicSection, setShowAcademicSection] = useState(false);
  
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
    schoolType: '',
    lastStudies: '',
    // Add more fields as needed
  });

  const navigate = useNavigate();


  const degree = [
    { id: 1, department: "AD(Artificial and Data Science Engineering)", short: "AD" },
    { id: 2, department: "AGRI(Agricultural Engineering)", short: "AGRI" },
    { id: 3, department: "BME(Bio-Medical Engineering)", short: "BME" },
    { id: 4, department: "CSE(Computer Science and Engineering)", short: "CSE" },
    { id: 5, department: "CIVIL(Civil Engineering)", short: "CIVIL" },
    { id: 6, department: "ECE(Electronics and Communication Engineering )", short: "ECE" },
    { id: 7, department: "EEE(Electrical and Electronics Engineering)", short: "EEE" },
    { id: 8, department: "IT(Information Technology)", short: "IT" },
    { id: 9, department: "MECH(Mechanical Engineering)", short: "MECH" },
  ]

  const Address = [
    { label: "Address Line 1 (Door no, Village Name / Street Name)", name: "address1", placeholder: "Enter Door No, Village Name / Street Name", full: true },
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
    // Scroll to academic section instead of navigating
    setShowAcademicSection(true);
    setTimeout(() => {
      const academicSection = document.getElementById('academic-scores-section');
      if (academicSection) {
        academicSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Show academic section when Last Studies is selected
    if (name === 'lastStudies' && value && value !== 'Dropout') {
      setShowAcademicSection(true);
      setTimeout(() => {
        const academicSection = document.getElementById('academic-scores-section');
        if (academicSection) {
          academicSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    }
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

  // ==================== HELPER FUNCTION ====================
  // Convert full department name to short form (e.g., "CSE(Computer Science...)" → "CSE")
  const getShortForm = (departmentFullName) => {
    const department = degree.find(d => d.department === departmentFullName);
    return department ? department.short : departmentFullName;
  };

  // ==================== FORM SUBMISSION HANDLER ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATION 1: Check if Seat Type (Quota) is selected
    if (!formData.quota) {
      const quotaSection = document.getElementById('seat-type-section');
      if (quotaSection) {
        quotaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => alert('Please select a Seat Type (Management or Government)'), 300);
      } else {
        alert('Please select a Seat Type (Management or Government)');
      }
      return;
    }

    // VALIDATION 2: Check if Admission Type (Entry) is selected
    if (!formData.entry) {
      const entrySection = document.getElementById('admission-type-section');
      if (entrySection) {
        entrySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => alert('Please select an Admission Type (I Year or Lateral Entry)'), 300);
      } else {
        alert('Please select an Admission Type (I Year or Lateral Entry)');
      }
      return;
    }

    // VALIDATION 3: Check for any invalid fields (HTML5 validation)
    const firstInvalidField = e.target.querySelector(':invalid');
    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidField.focus();
      return;
    }

    // VALIDATION 4: Check if Full Name is entered
    if (!formData.fullName) {
      alert('Please enter your full name');
      return;
    }

    // ==================== DATA PREPARATION ====================
    // Create cleaned data object with only necessary fields
    // Department preferences are converted to short forms for API
    const personalData = {
      // Department Preferences (Short Forms Only)
      preference1: getShortForm(formData.preference1),
      preference2: formData.preference2 ? getShortForm(formData.preference2) : '',
      preference3: formData.preference3 ? getShortForm(formData.preference3) : '',

      // Admission Details
      quota: formData.quota,
      entry: formData.entry,

      // Personal Details
      fullName: formData.fullName,
      email: formData.email,
      dob: formData.dob,
      gender: formData.gender,

      // Accommodation Details
      accommodation: formData.accommodation,
      roomType: formData.roomType,
      travelType: formData.travelType,

      // Parent Information
      fatherName: formData.fatherName,
      fatherOccupation: formData.fatherOccupation,

      // Social Information
      community: formData.community,
      caste: formData.caste,

      // Financial Information
      annualIncome: formData.annualIncome,
      firstGrad: formData.firstGrad,

      // Address Information
      address1: formData.address1,
      address2: formData.address2,
      taluk: formData.taluk,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,

      // Contact Information
      fatherContact: formData.fatherContact,
      motherContact: formData.motherContact,
      studentContact: formData.studentContact,

      // Educational Details
      sslcMarks: formData.sslcMarks,
      govtSchool: formData.govtSchool,
      schoolType: formData.schoolType,
      lastStudies: formData.lastStudies,
    };

    // ==================== DATA STORAGE ====================
    // Save cleaned personal data to localStorage for academic section
    localStorage.setItem('submittedFormData', JSON.stringify(personalData));
    console.log("✓ Personal info saved to localStorage with short form department values", personalData);
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          <img src={logo} alt="KNCET Logo" className="h-32 w-auto mb-6 animate-pulse" />
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-2xl font-bold text-blue-900">Saving...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait while we save your information</p>
          </div>
        </div>
      )}

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
            {/* Top Grid: Degree, Quota */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Left Column: Degree Preferences */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Degree / Department Preferences</label>
                <div className="space-y-3">
                  <select name="preference1" value={formData.preference1} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" required>
                    <option value="" disabled>1st Preference</option>
                    {degree.map((dept, index) => (
                      <option key={index} value={dept.department}>{dept.department}</option>
                    ))}
                  </select>
                  <select name="preference2" value={formData.preference2} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" >
                    <option value="" disabled>2nd Preference</option>
                    {degree.map((dept, index) => (
                      <option key={index} value={dept.department} disabled={dept.department === formData.preference1}>{dept.department}</option>
                    ))}
                  </select>
                  <select name="preference3" value={formData.preference3} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" >
                    <option value="" disabled>3rd Preference</option>
                    {degree.map((dept, index) => (
                      <option key={index} value={dept.department} disabled={dept.department === formData.preference1 || dept.department === formData.preference2}>{dept.department}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column: Seat Type and Admission Type */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Seat Type</label>
                  <div className="grid grid-cols-2 gap-4" id="seat-type-section">
                    <label className="flex items-center justify-center border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-600">
                      <input type="radio" name="quota" value="MQ" checked={formData.quota === "MQ"} onChange={handleChange} className="hidden" required />
                      <span className="font-medium">Management</span>
                    </label>
                    <label className="flex items-center justify-center border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-600">
                      <input type="radio" name="quota" value="GQ" checked={formData.quota === "GQ"} onChange={handleChange} className="hidden" required />
                      <span className="font-medium">Government</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Admission Type</label>
                  <div className="grid grid-cols-2 gap-4" id="admission-type-section">
                    <label className="flex items-center justify-center border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-600">
                      <input type="radio" name="entry" value="I Year" checked={formData.entry === "I Year"} onChange={handleChange} className="hidden" required />
                      <span className="font-medium">I Year</span>
                    </label>
                    <label className="flex items-center justify-center border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-600">
                      <input type="radio" name="entry" value="Lateral Entry" checked={formData.entry === "Lateral Entry"} onChange={handleChange} className="hidden" required />
                      <span className="font-medium">Lateral Entry</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
             

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Student's Full Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" style={{ textTransform: 'uppercase' }} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Email Address <span className="text-[10px]">(OPTIONAL)</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" style={{ textTransform: 'uppercase' }}  />
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
                      <input type="radio" name="gender" value="MALE" checked={formData.gender === "MALE"} onChange={handleGenderChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500" required />
                      <span className="font-medium">Male</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="gender" value="FEMALE" checked={formData.gender === "FEMALE"} onChange={handleGenderChange} className="w-5 h-5 text-pink-600 focus:ring-pink-500" />
                      <span className="font-medium">Female</span>
                    </label>
                  </div>

                  {formData.gender && (
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <label className="block text-xs font-bold text-grey-400 uppercase">Student Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer">
                          <input type="radio" name="accommodation" value={formData.gender === "MALE" ? "BOYSHOSTEL" : "GIRLSHOSTEL"} checked={formData.accommodation === (formData.gender === "MALE" ? "BOYSHOSTEL" : "GIRLSHOSTEL")} onChange={handleGenderChange} required />
                          <span className="text-sm">{formData.gender === "MALE" ? "Boys Hostel" : "Girls Hostel"}</span>
                        </label>
                        <label className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer">
                          <input type="radio" name="accommodation" value="DAYSCHOLAR" checked={formData.accommodation === "DAYSCHOLAR"} onChange={handleGenderChange} />
                          <span className="text-sm">Day Scholar</span>
                        </label>
                      </div>

                      {/* Room / Travel Details Sub-options */}
                      {(formData.accommodation === "BOYSHOSTEL" || formData.accommodation === "GIRLSHOSTEL") && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
                          <select name="roomType" value={formData.roomType} onChange={handleGenderChange} className="w-full text-sm bg-transparent border-none outline-none focus:ring-0" required>
                            <option value="" disabled>Select Room Type</option>
                            <option value={formData.accommodation === "BOYSHOSTEL" ? "BOYS HOSTEL (N)" : "GIRLS HOSTEL (N)"}>Normal (4 Members)</option>
                            <option value={formData.accommodation === "BOYSHOSTEL" ? "BOYS HOSTEL (A)" : "GIRLS HOSTEL (A)"}>Attached Bath (3 Members)</option>
                            <option value={formData.accommodation === "BOYSHOSTEL" ? "BOYS HOSTEL (AC)" : "GIRLS HOSTEL (AC)"}>AC + Attached (2 Members)</option>
                          </select>
                        </div>
                      )}

                      {formData.accommodation === "DAYSCHOLAR" && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
                          <select name="travelType" value={formData.travelType} onChange={handleGenderChange} className="w-full text-sm bg-transparent border-none outline-none focus:ring-0" required>
                            <option value="" disabled>Select Travel Type</option>
                            <option value="COLLEGEBUS">College Bus</option>
                            <option value="OUTBUS">Own/Outside Travel</option>
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
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father / Guardian Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" style={{ textTransform: 'uppercase' }} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Father's Occupation</label>
                <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="Father's Occupation" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" style={{ textTransform: 'uppercase' }} required />
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
                <input type="text" name="caste" value={formData.caste} onChange={handleChange} placeholder="Caste" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" style={{ textTransform: 'uppercase' }} required />
              </div>

              {/* Anuual income */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Annual Family Income</label>
                <select name="annualIncome" value={formData.annualIncome} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none" required>
                  <option value="" disabled>Select Income Range</option>
                  <option value="Less than 1L">Less than 1 Lakh</option>
                  <option value="1L to 1.5L">1 Lakh to 1.5 Lakhs</option>
                  <option value="1.5L to 2.5L">1.5 Lakhs to 2.5 Lakhs</option>
                  <option value="2.5L to 5L">2.5 Lakhs to 5 Lakhs</option>
                  <option value="More than 5L">More than 5 Lakhs</option>
                  <option value="Nil">Nil</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-blue-900 uppercase">First Graduate?</span>
                  <span className="text-xs text-blue-700/70 capitalize">Are you the first in family to graduate?</span>
                </div>
                <div className="flex space-x-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="firstGrad" value="YES" checked={formData.firstGrad === "YES"} onChange={handleChange} className="w-5 h-5 text-blue-600" required />
                    <span className="text-sm font-semibold text-blue-900">Yes</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="firstGrad" value="NO" checked={formData.firstGrad === "NO"} onChange={handleChange} className="w-5 h-5 text-blue-600" />
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
                      style={{ textTransform: 'uppercase' }}
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
                    <input type="text" name="sslcMarks" value={formData.sslcMarks} onChange={handleChange} placeholder="Enter Sslc Marks Out Of 500" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style={{ textTransform: 'uppercase' }} required />
                  </div>

                  <div className="bg-blue-50 p-4 border border-blue-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-blue-900 uppercase">Govt 7.5 Eligibility</span>
                      <span className="text-xs text-blue-700/70 capitalize">Are you Studied Govt School (6th-12th)?</span>
                    </div>
                    <div className="flex space-x-3">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input type="radio" name="govtSchool" value="YES" checked={formData.govtSchool === "YES"} onChange={handleChange} className="w-5 h-5 text-blue-600" required />
                        <span className="text-sm font-semibold text-blue-900">Yes</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input type="radio" name="govtSchool" value="NO" checked={formData.govtSchool === "NO"} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Last Studied</label>
                    <select name="lastStudies" value={formData.lastStudies} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" required>
                      <option value="" disabled>Choose your previous course</option>
                      {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">School Type</label>
                    <select name="schoolType" value={formData.schoolType} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" required>
                      <option value="" disabled>Select School Type</option>
                      <option value="GOVT. AIDED">GOVT. AIDED</option>
                      <option value="PRIVATE AIDED">PRIVATE AIDED</option>
                    </select>
                  </div>

                  {formData.lastStudies === 'Dropout' && (
                    <div className="p-5 bg-orange-50 rounded-xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-xs font-bold text-orange-800 uppercase">College Dropout Details</h4>
                      <div>
                        <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Previous College & Place</label>
                        <input type="text" className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-orange-500" style={{ textTransform: 'uppercase' }} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Reg No</label>
                          <input type="text" className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-orange-500" style={{ textTransform: 'uppercase' }} />
                        </div>
                        <div>
                          <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Year of Study</label>
                          <input type="text" className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-orange-500" style={{ textTransform: 'uppercase' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </form>
        </section>

        {/* Academic Scores Section - Conditionally Rendered */}
        {showAcademicSection && formData.lastStudies && (
          <div id="academic-scores-section" className="mt-8">
            {formData.lastStudies === 'Diploma' && <DiplomaScores personalData={formData} />}
            {formData.lastStudies === 'CBSE' && <CBSEScore personalData={formData} />}
            {formData.lastStudies === 'HSC Vocational' && <VocationalScores personalData={formData} />}
            {formData.lastStudies === 'HSC' && <AcademicScores personalData={formData} />}
          </div>
        )}

        {/* Footer Area */}
        {/* <footer className="mt-12 text-center text-gray-400 text-sm">
          &copy; 2024 Kongunadu College of Engineering and Technology. All Rights Reserved.
        </footer> */}
      </main>
    </div>
  );
};

export default PersonalInfo;


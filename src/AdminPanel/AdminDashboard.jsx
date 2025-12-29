import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "@heroicons/react/solid";
import logo from "../assets/kongunadulogo.png";
import EditApplicationModal from "./EditApplicationModal";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlFhbNdjWUj4YHTNsqStTY-fGnMe6k3YhZ2Y9-aXGr_Ds9S_T54qi9HqKhb4uSUPu2/exec";


export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array, not an error object
        if (Array.isArray(data)) {
          setApplications(data);
        } else if (data && data.error) {
          console.error("API Error:", data.error);
          setApplications([]);
        } else {
          console.error("Unexpected response format:", data);
          setApplications([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch data", err);
        setApplications([]);
      });
  }, []);

  const filteredApps = Array.isArray(applications) ? applications.filter((app) => {
    const matchesSearch =
      (app.fullName && app.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (app.email && app.email.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === "All" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredApps.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredApps.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, entriesPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Dynamic counts
  const totalCount = applications.length;
  const registeredCount = totalCount; // All data coming in are registered students
  const approvedCount = applications.filter(app => app.status === "Approved").length;
  const pendingCount = applications.filter(app => app.status === "Pending").length;
  const rejectedCount = applications.filter(app => app.status === "Rejected").length;

  const handleApplicationClick = () => {
    // Empty for now
  }

  const handleEditClick = (app) => {
    setCurrentApp(app);
    setIsModalOpen(true);
  }

  const handleViewClick = (app) => {
    setCurrentApp(app);
    setIsModalOpen(true);
  }

  const handleUpdateSuccess = (updatedData) => {
    setApplications(applications.map(app => 
      app.email === updatedData.email ? updatedData : app
    ));
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentApp(null);
  }


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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Dashboard Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
            <div onClick={handleApplicationClick} className="cursor-pointer group">
              <h1 className="text-3xl font-extrabold text-blue-900 group-hover:text-blue-700 transition-colors tracking-tight">Applications Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Manage and review student applications 
              </p>
            </div>

            <div className="flex items-center space-x-3">
              
              <span className="text-sm text-gray-400">|</span>
              <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                Total: <span className="font-bold text-gray-900">{totalCount}</span>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <>
              <div
                onClick={() => setFilterStatus("All")}
                className={`bg-white p-6 rounded-2xl shadow-sm border ${filterStatus === "All" ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-100"} flex items-center space-x-4 transition-all hover:translate-y-[-2px] cursor-pointer hover:shadow-md`}
              >
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Registered Students</p>
                  <p className="text-2xl font-bold text-gray-900">{registeredCount}</p>
                </div>
              </div>

              <div
                onClick={() => setFilterStatus(filterStatus === "Approved" ? "All" : "Approved")}
                className={`bg-white p-6 rounded-2xl shadow-sm border ${filterStatus === "Approved" ? "border-green-500 ring-2 ring-green-200" : "border-gray-100"} flex items-center space-x-4 transition-all hover:translate-y-[-2px] cursor-pointer hover:shadow-md`}
              >
                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </div>
              </div>

              <div
                onClick={() => setFilterStatus(filterStatus === "Pending" ? "All" : "Pending")}
                className={`bg-white p-6 rounded-2xl shadow-sm border ${filterStatus === "Pending" ? "border-yellow-500 ring-2 ring-yellow-200" : "border-gray-100"} flex items-center space-x-4 transition-all hover:translate-y-[-2px] cursor-pointer hover:shadow-md`}
              >
                <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
              </div>

              <div
                onClick={() => setFilterStatus(filterStatus === "Rejected" ? "All" : "Rejected")}
                className={`bg-white p-6 rounded-2xl shadow-sm border ${filterStatus === "Rejected" ? "border-red-500 ring-2 ring-red-200" : "border-gray-100"} flex items-center space-x-4 transition-all hover:translate-y-[-2px] cursor-pointer hover:shadow-md`}
              >
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                </div>
              </div>
            </>
          </div>

          {/* Search and Table Section */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search student or Email ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border-gray-200 pl-11 pr-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm placeholder:text-gray-400"
                />
                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-2.5" />
              </div>

              <div className="flex items-center space-x-3 text-sm text-gray-500">
                {/* <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Export</span>
                </button> */}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Student Details</th>
                    <th className="px-6 py-4">{["Registered", "Rejected", "Pending"].includes(filterStatus) ? "Enquiry ID" : "Email ID"}</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {currentEntries.map((app, idx) => (
                    <tr key={(app.id || app.email) + '-' + idx} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {(app.fullName && app.fullName.charAt(0)) || "?"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{app.fullName || "No Name"}</div>
                            <div className="text-xs text-gray-500 font-medium">{app.email || "No Email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                          {app.id}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-gray-700">{app.department}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`flex items-center text-xs font-bold ${app.status === "Approved" ? "text-green-600 bg-green-50 border-green-100" :
                          app.status === "Pending" ? "text-yellow-600 bg-yellow-50 border-yellow-100" :
                            app.status === "Rejected" ? "text-red-600 bg-red-50 border-red-100" :
                              "text-blue-600 bg-blue-50 border-blue-100"
                          } px-2 py-1 rounded-full w-max border`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${app.status === "Approved" ? "bg-green-500" :
                            app.status === "Pending" ? "bg-yellow-500" :
                              app.status === "Rejected" ? "bg-red-500" :
                                "bg-blue-500"
                            } mr-2 animate-pulse`}></span>
                          {app.status}
                        </span>
                      </td>


                      <td className="px-6 py-5 text-sm text-gray-500 font-medium">{app.date}</td>


                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center space-x-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                          className="flex items-center space-x-2 px-4 py-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors border border-transparent hover:border-yellow-200"
                            title="Edit" onClick={() => handleEditClick(app)} >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <span className="font-medium">Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <p className="text-xs text-gray-400 font-medium tracking-tight">
                  Showing <span className="text-gray-600 font-bold">{startIndex + 1}</span> to <span className="text-gray-600 font-bold">{Math.min(endIndex, filteredApps.length)}</span> of <span className="text-gray-600 font-bold">{filteredApps.length}</span> entries
                </p>
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-500 font-medium">Show:</label>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-xs text-gray-500 font-medium">entries</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-400'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex space-x-1 px-2">
                  {getPageNumbers().map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="text-gray-300 self-end px-1">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-400'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Application Modal */}
      <EditApplicationModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        applicationData={currentApp}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
}
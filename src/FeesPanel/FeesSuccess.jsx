import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Nav from "../Nav";
import PDFPreviewModal from '../AdminPanel/PDFPreviewModal';

const FeesSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationData = location.state?.applicationData || {};
  const scoresData = location.state?.scoresData || {};
  const [showPDFPreview, setShowPDFPreview] = React.useState(false);

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Success!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Application data has been saved successfully
            </p>

            {/* Student Information Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Student Name</p>
                  <p className="text-lg font-bold text-gray-800">{applicationData.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Enquiry ID</p>
                  <p className="text-lg font-bold text-blue-600">{applicationData.enquiryId || 'N/A'}</p>
                </div>
                {applicationData.admissionId && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Admission ID</p>
                    <p className="text-2xl font-bold text-green-600">{applicationData.admissionId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</p>
                  <p className="text-lg font-bold text-gray-800">{applicationData.firstPreference || applicationData.preference1 || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <p className={`text-lg font-bold ${
                    applicationData.status === 'Admitted' ? 'text-green-600' :
                    applicationData.status === 'Pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {applicationData.status || 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={() => navigate('/admin')}
                className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Back to Dashboard</span>
              </button>


              <button
                onClick={() => setShowPDFPreview(true)}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
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

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        studentData={applicationData}
        scoresData={scoresData}
        studentName={applicationData.fullName}
      />
    </>
  );
};

export default FeesSuccess;

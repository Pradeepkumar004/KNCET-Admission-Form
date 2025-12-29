import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import PersonalInfo from './StudentPanel/PersonalInfo'
import AcademicScores from './StudentPanel/AcadamicScore'
import FeesInfo from './FeesPanel/FeesInfo'

import Sucess from './StudentPanel/success'
import AdminSuccess from './AdminPanel/success'
import DiplomaScores from './StudentPanel/DiplomaScores'
import AdminDashboard from "./AdminPanel/AdminDashboard";
import CBSEScore from './StudentPanel/CBSEScore';
import AdminAcademicScores from './AdminPanel/AcadamicScore';
import AdminCBSEScore from './AdminPanel/CBSEScore';




function App() {

  return (
    <>
      <Routes>
        {/* StudentPanel */}
        <Route path='/' element={<PersonalInfo />} />
        <Route path='/PersonalInfo' element={<PersonalInfo />} />
        <Route path='/HSCInfo' element={<AcademicScores />} />
        <Route path='/CBSEInfo' element={<CBSEScore />} />
        <Route path='/feesInfo' element={<FeesInfo />} />
        <Route path='/success' element={<Sucess />} />
        <Route path='/diplomaInfo' element={<DiplomaScores />} />

        {/* AdminPanel */}

        <Route path='/admindashboard' element={<AdminDashboard />} />
        <Route path='/application-success' element={<AdminSuccess />} />
        <Route path='/admin/academic-score' element={<AdminAcademicScores />} />
        <Route path='/admin/cbse-score' element={<AdminCBSEScore />} />


      </Routes>

    </>
  )
}

export default App

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import PersonalInfo from './StudentPanel/PersonalInfo'
import AcademicScores from './StudentPanel/AcadamicScore'
import FeesInfo from './FeesPanel/FeesInfo'
import VocationalScores from './StudentPanel/Vocational'
import Sucess from './StudentPanel/success'
import AdminSuccess from './AdminPanel/success'
import DiplomaScores from './StudentPanel/DiplomaScores'
import AdminDashboard from "./AdminPanel/AdminDashboard";
import CBSEScore from './StudentPanel/CBSEScore';
import AdminAcademicScores from './AdminPanel/AcadamicScore';
import AdminCBSEScore from './AdminPanel/CBSEScore';
import AdminVocationalScores from './AdminPanel/VocationalScore';
import AdminDiplomaScores from './AdminPanel/DiplamoScore';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';



function App() {

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/' element={<PersonalInfo/>} />
        <Route path='/HSCInfo' element={<AcademicScores/>} />
        <Route path='/CBSEInfo' element={<CBSEScore/>} />
        <Route path='/diplomaInfo' element={<DiplomaScores/>} />
        <Route path='/VocationalInfo' element={<VocationalScores/>} />
        <Route path='/success' element={<Sucess/>} />

        {/* Protected StudentPanel Routes */}
        {/* <Route path='/' element={
          <ProtectedRoute>
            <PersonalInfo />
          </ProtectedRoute>
        } /> */}
       

        {/* Protected Fees Route */}
        <Route path='/feesInfo' element={
          <ProtectedRoute>
            <FeesInfo />
          </ProtectedRoute>
        } />

        {/* Protected AdminPanel Routes */}
        <Route path='/admin' element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path='/application-success' element={
          <ProtectedRoute>
            <AdminSuccess />
          </ProtectedRoute>
        } />
        <Route path='/admin/academic-score' element={
          <ProtectedRoute>
            <AdminAcademicScores />
          </ProtectedRoute>
        } />
        <Route path='/admin/cbse-score' element={
          <ProtectedRoute>
            <AdminCBSEScore />
          </ProtectedRoute>
        } />
        <Route path='/admin/vocational-score' element={
          <ProtectedRoute>
            <AdminVocationalScores />
          </ProtectedRoute>
        } />
        <Route path='/admin/diploma-score' element={
          <ProtectedRoute>
            <AdminDiplomaScores />
          </ProtectedRoute>
        } />

      </Routes>

    </>
  )
}

export default App

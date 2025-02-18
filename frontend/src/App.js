import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Work';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/about" element={<About />} />
         <Route path="/contact" element={<Contact />} />
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
         <Route 
           path="/upload" 
           element={
             <ProtectedRoute>
               <Upload />
             </ProtectedRoute>
           } 
         />
         <Route 
           path="/profile" 
           element={
             <ProtectedRoute>
               <Profile />
             </ProtectedRoute>
           } 
         />
         <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
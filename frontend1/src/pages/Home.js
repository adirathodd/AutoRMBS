import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <section className="hero">
         <div className="intro-header">
           <div className="intro-content">
             <div className="intro-text">
               <h1>Automate RMBS Pricing</h1>
               <p>Improve Efficiency with AI Integrated Pricing Models</p>
             </div>
             <Link to="/about" className="secondary-button">Learn More</Link>
           </div>
         </div>
      </section>
      
      <section className="section">
         <div className="container">
            <h2>Who We Are</h2>
            <p>
              AutoRMBS is transforming the RMBS industry with AI-powered automation.
              Save time and eliminate repetitive tasks.
            </p>
            <Link to="/about" className="primary-button">Learn More</Link>
         </div>
      </section>
      
      <section className="section">
         <div className="container">
            <h2>How to Use</h2>
            <div className="usage-steps">
              <div className="card">
                <h2>1. Import Your PDF</h2>
                <p>Upload your PDF files containing mortgage data.</p>
              </div>
              <div className="card">
                <h2>2. Import Your Excel</h2>
                <p>Upload your Excel pricing model.</p>
              </div>
              <div className="card">
                <h2>3. Receive Purchase Price</h2>
                <p>Get the calculated purchase price instantly.</p>
              </div>
            </div>
         </div>
      </section>
      
      <section className="section cc-cta">
         <div className="container">
            <h2>Create an Account</h2>
            <p>Today is the day to integrate AI into your workflows.</p>
            <Link to="/register" className="primary-button">Create Account</Link>
         </div>
      </section>
    </div>
  );
}

export default Home;
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <section className="hero">
         <div className="intro-header">
           <div className="intro-content">
             <div className="intro-text">
               <h1 style={{"margin-bottom": "2%"}}>Automate RMBS Pricing</h1>
               <p style={{"margin-bottom": "1%"}}>Improve Efficiency with AI Integrated Pricing Models</p>
             </div>
             <Link to="/about" className="secondary-button">Learn More</Link>
           </div>
         </div>
      </section>
      
      <section className="section">
         <div className="container">
            <h2>Who We Are</h2>
            <p style={{"margin-bottom": "2%"}}>
            AutoRMBS is transforming the RMBS industry with AI-powered automation. By streamlining data entry and processing, we save time and eliminate repetitive tasks. Founded by Harrison Zoccoli, a first-year finance student at Carnegie Mellon University, AutoRMBS is proudly sponsored by Microsoft’s Founders Hub, equipping us with the tools to redefine RMBS pricing.
            </p>
            <Link to="/about" className="primary-button">Learn More</Link>
         </div>
      </section>

      <section className="section">
         <div className="container">
            <h2>Reach out</h2>
            <p style={{"margin-bottom": "2%"}}>
            Feel free to contact us for troubleshooting issues or to suggest new features! We're happy to help and work on implementing services that could be of help to you.
            </p>
            <Link to="/contact" className="primary-button">Contact us</Link>
         </div>
      </section>


      <section class="section">
        <div class="container" >
          <div class="blog-heading" style={{"margin-bottom": "2%"}}>
            <h2 class="work-heading">HOW TO USE</h2>
          </div>

          <div class="usage-steps">
            <div class="step card">
              <div class="step-number">1</div>
              <h2 class="step-heading">Import Your PDF</h2>
              <p class="step-paragraph">
                Import your PDF files containing information regarding mortgages in your mortgage pool. Our AI will then scrape these files for needed information, allowing for seamless data entry.
              </p>
            </div>

            <div class="step card">
              <div class="step-number">2</div>
              <h2 class="step-heading">Import Your Excel</h2>
              <p class="step-paragraph">
                Import your Excel file containing your desired pricing model. The information scraped from your entered PDFs will be input into your model, allowing for automated pricing of each mortgage.
              </p>
            </div>

            <div class="step card">
              <div class="step-number">3</div>
              <h2 class="step-heading">Receive Purchase Price</h2>
              <p class="step-paragraph">
                Our model will sum the calculated prices across individual mortgages, instantly calculating the purchase price for the mortgage pool, saving valuable time to now be allocated elsewhere.
              </p>
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
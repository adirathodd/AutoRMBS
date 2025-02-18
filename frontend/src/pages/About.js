import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div>
      <section className="hero">
         <h1>About Us</h1>
         <p>We’re revolutionizing RMBS pricing through AI-driven automation.</p>
      </section>
      <section className="section">
         <div className="container">
           <h2>Our Mission</h2>
           <br></br>
           <p>
            At AutoRMBS, we are revolutionizing the Residential Mortgage-Backed Securities (RMBS) industry through cutting-edge AI-powered automation. Our mission is to simplify and accelerate data entry, analysis, and pricing, allowing professionals to focus on strategic decisions rather than tedious, repetitive tasks. Backed by Microsoft’s Founders Hub, we leverage state-of-the-art tools and resources to redefine how RMBS pricing is approached in today’s fast-paced financial markets. 
          <br></br>
          <br></br>
            Our platform seamlessly integrates with your existing workflows. Simply upload PDF files containing mortgage pool information, and our advanced AI will extract and organize the data with unparalleled accuracy. Then, import your customized Excel pricing model, and our system will automatically input the extracted data to calculate individual mortgage prices. The platform aggregates these results, instantly determining the total purchase price for the mortgage pool. This streamlined process eliminates the bottlenecks of manual data entry and significantly reduces the time and effort required for accurate RMBS pricing.
          <br></br>
          <br></br>
            Looking ahead, AutoRMBS is committed to expanding the boundaries of innovation within the RMBS sector. We plan to integrate workflows with Bloomberg Terminal, enabling seamless access to market data and enhanced financial modeling capabilities. Additionally, were developing an AI that will better forecast future default and prepayment rates, equipping our users with deeper insights and more informed decision-making.
            </p>
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

export default About;
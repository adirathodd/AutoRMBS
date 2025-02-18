import React from 'react';

function Contact() {
  return (
    <div>
      <section className="hero">
         <h1>Contact Us</h1>
      </section>
      <section className="section">
         <div className="container">
           <h2>Get in Touch</h2>
           <form>
             <div className="form-group">
               <label>Name</label>
               <input type="text" placeholder="Enter your name" />
             </div>
             <div className="form-group">
               <label>Email</label>
               <input type="email" placeholder="Enter your email" />
             </div>
             <div className="form-group">
               <label>Message</label>
               <textarea placeholder="Your message"></textarea>
             </div>
             <button type="submit" className="primary-button">Submit</button>
           </form>
         </div>
      </section>
    </div>
  );
}

export default Contact;
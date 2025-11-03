import React, { useRef, useState } from "react";
import { Mail, Facebook, Phone, MapPin, Send, Globe, ShoppingBag } from "lucide-react";
import emailjs from "@emailjs/browser";
import "./Contact.css";

const Contact = () => {
  const formRef = useRef();
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        (result) => {
          alert("Your message has been sent successfully!");
          formRef.current.reset();
          setSending(false);
        },
        (error) => {
          console.error(error);
          alert("Oops! Something went wrong. Please try again.");
          setSending(false);
        }
      );
  };

  return (
    <section className="contact-section">
      <h1 className="contact-title">Contact Kampo Karne</h1>

      <div className="contact-grid">
        {/* === 1: MAP === */}
        <div className="contact-map">
          <iframe
            title="Kampo Karne Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.7515894240705!2d120.96024007360144!3d14.613221976770577!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b587f8f55e29%3A0x5e5b4a87713b1d6f!2sKampo%20karne%20k-mart!5e0!3m2!1sen!2sph!4v1761468042649!5m2!1sen!2sph"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>

        {/* === 2: FORM === */}
        <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
          <h2>Send Us an Inquiry</h2>

          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input type="text" name="user_name" id="user_name" placeholder="Your name" required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" name="user_email" id="user_email" placeholder="you@example.com" required />
          </div>

          <div className="input-group">
            <label htmlFor="message">Message</label>
            <textarea
              name="message"
              id="message"
              rows="5"
              placeholder="Write your message..."
              required
            ></textarea>
          </div>

          <button type="submit" className="send-btn" disabled={sending}>
            {sending ? "Sending..." : "Send Message"} <Send size={18} />
          </button>
        </form>

        {/* === 3: INFO === */}
        <div className="contact-info">
          <h3>Kampo Karne</h3>
          <p>
            One Stop Shop for Samgyup Meats, Side Dishes, and Korean Mart Goods.
            Premium cuts and authentic Korean taste — all in one place.
          </p>

          <div className="contact-details">
            <div className="detail">
              <MapPin size={18} />
              <span>020 Quezon Street, Brgy 120, Tondo, Manila, Philippines</span>
            </div>
            <div className="detail">
              <Phone size={18} />
              <span>0935 298 3875</span>
            </div>
            <div className="detail">
              <Mail size={18} />
              <span>kampokarne@gmail.com</span>
            </div>
            <div className="detail">
              <Globe size={18} />
              <a href="https://enstack.ph/kampo-karne-kmart" target="_blank" rel="noreferrer">
                enstack.ph/kampo-karne-kmart
              </a>
            </div>
            <div className="detail">
              <Facebook size={18} />
              <a href="https://facebook.com/kampokarnekmart" target="_blank" rel="noreferrer">
                facebook.com/kampokarnekmart
              </a>
            </div>
          </div>

          <div className="social-links">
            <a href="https://facebook.com/kampokarnekmart" className="social facebook" target="_blank" rel="noreferrer">
              <Facebook size={22} />
            </a>
            <a href="https://enstack.ph/kampo-karne-kmart" className="social web" target="_blank" rel="noreferrer">
              <ShoppingBag size={22} />
            </a>
            <a href="mailto:kampokarne@gmail.com" className="social email">
              <Mail size={22} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

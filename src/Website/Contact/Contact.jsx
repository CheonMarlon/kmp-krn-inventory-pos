import React, { useRef, useState } from "react";
import { Mail, Facebook, Phone, MapPin, Send, Globe, ShoppingBag } from "lucide-react";
import emailjs from "@emailjs/browser";
import gitna from "/src/assets/stickers/gitna.png";
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
        () => {
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
    <section className="contact-layout">
      <div className="top-center">
        <img src={gitna} alt="Kampo Karne Logo" className="center-logo" />
        <img src="/src/assets/stickers/babagitna.png" alt="0" className="center-back"/>
      </div>

      <div className="upper-section">
        <div className="left-info">
          <h2>About Kampo Karne</h2>
          <p>
            One Stop Shop for Samgyup Meats, Side Dishes, and Korean Mart Goods.
            Premium cuts and authentic Korean taste — all in one place.
          </p>
        </div>

        <div className="right-info">
          <h2>Contact Details</h2>
          <ul>
            <li>
              <MapPin size={18}/> 
              <a 
                href="https://www.google.com/maps/place/020+Quezon+Street,+Brgy+120,+Tondo,+Manila" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                020 Quezon Street, Brgy 120, Tondo, Manila
              </a>
            </li>
            <li>
              <Phone size={18}/> 
              <a href="tel:09352983875">0935 298 3875</a>
            </li>
            <li>
              <Mail size={18}/> 
              <a href="mailto:kampokarne@gmail.com">kampokarne@gmail.com</a>
            </li>
            <li>
              <Facebook size={18}/> 
              <a 
                href="https://www.facebook.com/kampokarnekmart" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                facebook.com/kampokarnekmart
              </a>
            </li>
          </ul>
        </div>
      </div>

        <div className="map-container">
          <iframe
            title="Kampo Karne Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.7515894240705!2d120.96024007360144!3d14.613221976770577!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b587f8f55e29%3A0x5e5b4a87713b1d6f!2sKampo%20karne%20k-mart!5e0!3m2!1sen!2sph!4v1761468042649!5m2!1sen!2sph"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>



      <div className="bottom-section">
        <img className="test" src="/src/assets/stickers/bottombg.png" alt="" />
        <div className="lower-left">
          <form ref={formRef} onSubmit={handleSubmit}>
            <h2>Send Us a Message</h2>
            <input type="text" name="user_name" placeholder="Your name" required />
            <input type="email" name="user_email" placeholder="you@example.com" required />
            <textarea name="message" rows="4" placeholder="Write your message..." required></textarea>
            <button type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Message"} <Send size={18} />
            </button>
          </form>
        </div>
        
        <div className="cow">
          <img src="/src/assets/stickers/cow.png" alt="Cow Sticker" />
        </div>

      </div>



    </section>
  );
};

export default Contact;

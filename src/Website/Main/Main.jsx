import React, { useState } from "react";
import "./Main.css";
import LockButton from "../Chatbot/LockButton";
import Login from "../Chatbot/Login";
import Chatbot from "../Chatbot/Chatbot";
import TopSeller from "../TopSeller/TopSeller";
import ProductShowcase from "../Product/ProductShowcase";
import Contact from "../Contact/Contact";

const Main = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");

  const menuItems = [
    { id: "home", label: "Home", href: "#home" },
    { id: "products", label: "Products", href: "#products" },
    { id: "contact", label: "Contact", href: "#contact" },
  ];

  return (
    <div className="main-container">
      {/* Floating Lock Button */}
      <LockButton onClick={() => setShowLogin(true)} />
      <Chatbot />

      {/* Login Modal */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}

      {/* Hero Section */}
      <section className="main-hero hero-gradient" id="home">
        <div className="decorative-pattern"></div>
        <div className="usok">
          <img src="/stickers/herobot.png" alt="Usok" />
        </div>
        <div className="usok2">
          <img src="/stickers/herotop.png" alt="Usok Top" />
        </div>
        <div className="top-bar"></div>

        <header className="main-header">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={activeMenu === item.id ? "active" : ""}
                onClick={() => setActiveMenu(item.id)}
              >
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </header>

        <section className="hero-section">
          <div className="hero-left">
            <img src="/stickers/4.png" alt="roof" className="roof" />
            <h1>Kampo Karne</h1>

            <div className="loader">
              We offer
              <div className="words words-en">
                <span className="word">Premium Meats</span>
                <span className="word">Korean Groceries</span>
                <span className="word">Hotpot Essentials</span>
                <span className="word">Premium Meats</span>
              </div>

              <div className="words words-ko">
                <span className="word">프리미엄 정육</span>
                <span className="word">한국 식자재</span>
                <span className="word">샤브샤브 재료</span>
                <span className="word">프리미엄 정육</span>
              </div>
            </div>

            <button onClick={() => {
                const contactSection = document.getElementById("contact");
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: "smooth" });
                }
              }}>
                <span>Contact Us</span>
</button>
          </div>

          <div className="hero-right">
            <div className="pattern-wrapper">
              <img className="pattern" src="/stickers/5.png" alt="Pattern" />
              <img className="logo" src="/stickers/Logo.png" alt="Logo" />
            </div>
          </div>
        </section>
      </section>

      {/* Scrollable Sections */}
      <section id="products">
        <TopSeller />
        <ProductShowcase />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </div>
  );
};

export default Main;

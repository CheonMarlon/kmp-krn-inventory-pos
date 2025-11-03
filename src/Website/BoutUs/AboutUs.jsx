import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import backgroundStreet from "/src/assets/stickers/background-street.png";
import middleHouse from "/src/assets/stickers/middle-house.png";
import "./AboutUs.css";

const AboutUs = () => {
  const ref = useRef(null);

  // Scroll progress for entire page (global scroll)
  const { scrollY } = useScroll();

  // Middle house moves up relative to scrollY (independent of ref)
  // You can tweak the range [startY, endY] and [startMove, endMove]
  const houseY = useTransform(scrollY, [0, 1000], [0, -300]);

  return (
    <section className="about-section" ref={ref}>
      {/* BACKGROUND */}
      <div
        className="about-bg"
        style={{
          backgroundImage: `url(${backgroundStreet})`,
        }}
      />

      {/* MIDDLE HOUSE - only moves upward */}
      <motion.div
        className="middle-house-wrapper"
        style={{ y: houseY }}
      >
        <img src={middleHouse} alt="Middle House" className="middle-house" />
      </motion.div>

      {/* LEFT TEXT */}
      <div className="about-text left-text">
        <h2>About Us</h2>
        <p>
          Kampo Karne is a premium meat shop and K-Mart specializing in
          high-quality fresh cuts inspired by Korean markets.
        </p>
        <p>
          Our philosophy blends craftsmanship and community — ensuring every
          meal celebrates culture and taste.
        </p>
      </div>

      {/* RIGHT TEXT */}
      <div className="about-text right-text">
        <h2>Savor Tradition</h2>
        <p>Where every cut brings you closer to authentic Korean flavor.</p>
      </div>
    </section>
  );
};

export default AboutUs;

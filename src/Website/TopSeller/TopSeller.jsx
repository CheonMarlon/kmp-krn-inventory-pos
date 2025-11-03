import React, { useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import "./TopSeller.css";

const TopSeller = () => {
  const ref = useRef(null);

  // detect when section is roughly at center of viewport
  const inView = useInView(ref, { amount: 0.5 });

  // animation controls for side cards
  const leftControls = useAnimation();
  const rightControls = useAnimation();

  useEffect(() => {
    if (inView) {
      // reveal
      leftControls.start("visible");
      rightControls.start("visible");
    } else {
      // hide back behind
      leftControls.start("hidden");
      rightControls.start("hidden");
    }
  }, [inView, leftControls, rightControls]);

  // variants: hidden = behind center (opacity 0), visible = slid out podium style
  const leftVariants = {
    hidden: { x: -150, y: -200, opacity: 0, transition: { duration: 0.35 } },
    visible: { x: -410, y: -150, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
  };

  const rightVariants = {
    hidden: { x: -50, y: -200, opacity: 0, transition: { duration: 0.35 } },
    visible: { x: 150, y: -150, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <section className="top-seller-section" ref={ref}>
      <h2 className="top-seller-title">Top Seller</h2>
      <img className="lantern1" src="/src/assets/stickers/10.png" alt="lantern1" />
      <img className="lantern2" src="/src/assets/stickers/10.png" alt="lantern2" />
      <img className="lantern3" src="/src/assets/stickers/10.png" alt="lantern2" />
      <img className="lantern4" src="/src/assets/stickers/10.png" alt="lantern2" />


      <div className="top-seller-container">
        <motion.div
          className="seller-card side-card left-card"
          variants={leftVariants}
          initial="hidden"
          animate={leftControls}
        >
          <img src="/src/assets/stickers/placeholder.png" alt="Beef Short Ribs" />
          <p>Beef Short Ribs</p>
        </motion.div>

        <div className="seller-card center-card highlight">
          <img src="/src/assets/stickers/placeholder.png" alt="Premium Wagyu" />
          <p>Premium Wagyu</p>
        </div>

        <motion.div
          className="seller-card side-card right-card"
          variants={rightVariants}
          initial="hidden"
          animate={rightControls}
        >
          <img src="/src/assets/stickers/placeholder.png" alt="Pork Belly" />
          <p>Pork Belly</p>
        </motion.div>
      </div>

    </section>
  );
};

export default TopSeller;

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { supabase } from "../../microservices/supabaseClient";
import "./TopSeller.css";

const TopSeller = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5 });
  const leftControls = useAnimation();
  const rightControls = useAnimation();

  const [topProducts, setTopProducts] = useState([]);

  // === Fetch top-selling products (ALL-TIME) ===
  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        // 1️⃣ Get completed orders only
        const { data: orders, error: ordersErr } = await supabase
          .from("orders")
          .select("id")
          .eq("status", "Completed");

        if (ordersErr) throw ordersErr;
        if (!orders || orders.length === 0) return setTopProducts([]);

        const orderIds = orders.map((o) => o.id);

        // 2️⃣ Get order details
        const { data: details, error: detailsErr } = await supabase
          .from("order_details")
          .select("order_id, product_id, quantity")
          .in("order_id", orderIds);

        if (detailsErr) throw detailsErr;

        // 3️⃣ Sum quantities per product
        const grouped = details.reduce((acc, d) => {
          acc[d.product_id] = (acc[d.product_id] || 0) + d.quantity;
          return acc;
        }, {});

        // 4️⃣ Sort and take top 3
        const top = Object.entries(grouped)
          .map(([product_id, qty]) => ({ product_id, qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 3);

        const ids = top.map((t) => t.product_id);

        // 5️⃣ Get product info
        const { data: products, error: prodErr } = await supabase
          .from("products")
          .select("id, product_name, img_url")
          .in("id", ids);

        if (prodErr) throw prodErr;

        // 6️⃣ Combine product info + qty
        const topData = top.map((t) => {
          const prod = products.find((p) => String(p.id) === String(t.product_id));
          return {
            id: t.product_id,
            name: prod?.product_name || `Product #${t.product_id}`,
            img: prod?.img_url || "/src/assets/stickers/placeholder.png",
            qty: t.qty,
          };
        });

        setTopProducts(topData);
      } catch (err) {
        console.error("Error fetching top sellers:", err.message);
      }
    };

    fetchTopSellers();
  }, []);

  // === Animation control ===
  useEffect(() => {
    if (inView) {
      leftControls.start("visible");
      rightControls.start("visible");
    } else {
      leftControls.start("hidden");
      rightControls.start("hidden");
    }
  }, [inView, leftControls, rightControls]);

  // === Motion variants ===
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

      <img src="/src/assets/stickers/10.png" alt="lantern" className="lantern1" />
      <img src="/src/assets/stickers/10.png" alt="lantern" className="lantern2" />
      <img src="/src/assets/stickers/10.png" alt="lantern" className="lantern3" />
      <img src="/src/assets/stickers/10.png" alt="lantern" className="lantern4" />


      <div className="top-seller-container">
        {topProducts.length >= 3 ? (
          <>
            <motion.div
              className="seller-card side-card left-card"
              variants={leftVariants}
              initial="hidden"
              animate={leftControls}
            >
              <img src={topProducts[1].img} alt={topProducts[1].name} />
              <p>{topProducts[1].name}</p>
            </motion.div>

            <div className="seller-card center-card highlight">
              <img src={topProducts[0].img} alt={topProducts[0].name} />
              <p>{topProducts[0].name}</p>
            </div>

            <motion.div
              className="seller-card side-card right-card"
              variants={rightVariants}
              initial="hidden"
              animate={rightControls}
            >
              <img src={topProducts[2].img} alt={topProducts[2].name} />
              <p>{topProducts[2].name}</p>
            </motion.div>
          </>
        ) : (
          <p className="loading-text">Loading top sellers...</p>
        )}
      </div>
    </section>
  );
};

export default TopSeller;

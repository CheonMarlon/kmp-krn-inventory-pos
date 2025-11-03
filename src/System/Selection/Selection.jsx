import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, BarChart2, Boxes } from "lucide-react";
import "./Selection.css";

const Selection = () => {
  const navigate = useNavigate();

  const options = [
    { label: "POS", icon: <ShoppingCart size={48} />, path: "/pos" },
    { label: "Dashboard", icon: <BarChart2 size={48} />, path: "/dashboard" },
    { label: "Inventory", icon: <Boxes size={48} />, path: "/inventory" },
  ];

  return (
    <div className="selection-bg2">
      <h1 className="selection-title">SELECT MODULE</h1>

      <div className="selection-grid">
        {options.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(item.path)}
          >
            <div className="selection-card">
              <div className="thumbnail"></div>
              <span className="selection-label">{item.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Selection;

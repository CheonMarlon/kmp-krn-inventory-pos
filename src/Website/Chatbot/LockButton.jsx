import React from "react";
import { Lock } from "lucide-react";
import "./LockButton.css";

const LockButton = ({ onClick }) => {
  return (
    <div className="lock-circle" onClick={onClick}>
      <Lock className="lock-icon" size={24} />
    </div>
  );
};

export default LockButton;

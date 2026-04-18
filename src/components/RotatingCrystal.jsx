import React from 'react';
import './RotatingCrystal.css';

const RotatingCrystal = () => {
  return (
    <div className="crystal-container">
      <div className="crystal">
        <div className="face front"></div>
        <div className="face back"></div>
        <div className="face left"></div>
        <div className="face right"></div>
        <div className="face top"></div>
        <div className="face bottom"></div>
      </div>
    </div>
  );
};

export default RotatingCrystal;
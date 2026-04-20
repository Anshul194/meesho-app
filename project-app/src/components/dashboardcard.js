import React, { useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import  "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";

const DashboardCard = ({ title, value, lineColor, fillColor, data, valueColor="#000", onClick }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Drawing on the canvas using the data provided
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Drawing the sparkline
    ctx.beginPath();
    ctx.moveTo(0, 50 - data[0]);

    for (let i = 1; i < data.length; i++) {
      ctx.lineTo((i / (data.length - 1)) * canvas.width, 50 - data[i]);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = lineColor;
    ctx.stroke();
    ctx.fillStyle = fillColor;
    ctx.lineTo(canvas.width, 50);
    ctx.lineTo(0, 50);
    ctx.closePath();
    ctx.fill();
  }, [data, lineColor, fillColor]);

  return (
    <div className="col-lg-4 col-md-6 col-sm-6">
      <div className="card number-chart">
        <div className="body">
          <span className="text-uppercase">{title}</span>
          <h4 className="mb-0 mt-2" style={{ color: valueColor, cursor:'pointer' }} onClick={onClick}>{value}</h4>
        </div>
        <canvas
          ref={canvasRef}
          width="357"
          height="50"
          style={{ display: 'inline-block' }}
        ></canvas>
      </div>
    </div>
  );
};

export default DashboardCard;

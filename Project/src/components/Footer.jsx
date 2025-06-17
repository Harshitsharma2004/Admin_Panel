import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-div"></div>
      <p>&copy; {new Date().getFullYear()} Carrier. All rights reserved.</p>
      <div></div>
    </footer>
  );
}

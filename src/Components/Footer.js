import React from 'react'
import "./css/Footer.css";

const Footer = () => {
  return (
      <>
    <div className='footer'>
        <div className="row">
                <div className="col">
                    <ul>
                        <div>About us</div>
                        <li><a href="/">About</a></li>
                        <li><a href="/">Careers</a></li>
                        <li><a href="/">Contact us</a></li>
                        <li><a href="/">Blog</a></li>
                    </ul>
                </div>
                <div className="col">
                    <ul>
                        <div>Help</div>
                        <li><a href="/">Shipping</a></li>
                        <li><a href="/">Cancellations & Returns</a></li>
                        <li><a href="/">FAQ</a></li>
                        <li><a href="/">Your account</a></li>
                    </ul>
                </div>
                <div className="col">
                    <ul>
                        <div>Policy</div>
                        <li><a href="/">Return policy</a></li>
                        <li><a href="/">Terms of use</a></li>
                        <li><a href="/">Privacy</a></li>
                        <li><a href="/">Security</a></li>
                    </ul>
                </div>
                <div className="col">
                    <ul>
                        <div>Connect with us</div>
                        <li><a href="/">Facebook</a></li>
                        <li><a href="/">Instagram</a></li>
                        <li><a href="/">Twitter</a></li>
                    </ul>
                </div>
        </div>
    <div className="copright">© 2022, soham-c4ee3.web.app . All Rights Reserved</div>
    </div>
    </>
  )
}

export default Footer
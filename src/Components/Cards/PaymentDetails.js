import React from 'react';
import {AiOutlineClose} from "react-icons/ai"
import "../css/paymentDetails.css";

const PaymentDetails = ({close,data}) => {

  return (
        <div className="pay-det-card">
           <div className="pay-det-close">
             <button onClick={() => close()}><AiOutlineClose/></button>
           </div>
           <div className="pay-det-upper">
               <img src="https://www.freepnglogos.com/uploads/shopping-bag-png/shopping-bag-shopping-bags-transparent-png-svg-vector-8.png" alt=""/>
               <h1>Soham</h1>
           </div>
           <div className="pay-det-sec">
              <h1>Payment Details</h1>
               <div className="pay-det-start">
                  <span>
                     <b style={{fontFamily:"Poppins",textAlign:"left"}}>Payment ID :</b>
                     <p style={{fontFamily:"Arial",marginTop:"3px",textAlign:"left"}}>{data.Payment_id}</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Order Amount :</b>
                    <p style={{fontFamily:"Arial",marginTop:"4px",textAlign:"left"}}>₹{data.Order_amount}</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Order Items :</b>
                    <p style={{fontFamily:"Arial",marginTop:"4px",textAlign:"left"}}>{data.Order_items}</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Site Name :</b> 
                    <p style={{fontFamily:"Arial",marginTop:"3px",textAlign:"left"}}>{data.name}</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Description :</b>
                    <p style={{fontFamily:"Arial",marginTop:"4px",textAlign:"left"}}>{data.description.slice(0,21)}...</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Customer Name :</b> 
                    <p style={{fontFamily:"Arial",marginTop:"4px",textAlign:"left"}}>{data.userInfo.name.slice(0,18)}</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Customer Email :</b>
                    <p style={{fontFamily:"Arial",marginTop:"4px",textAlign:"left"}}>{data.userInfo.email.slice(0,15)}...</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Customer Contact :</b> 
                    <p style={{fontFamily:"Arial",marginTop:"4px",textAlign:"left"}}>{data.userInfo.contact.slice(0,6)}xxxx</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Customer Address :</b> 
                    <p style={{fontFamily:"Arial",marginTop:"5px",textAlign:"left"}}>{data.userInfo.address.slice(0,20)}...</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Payment Status :</b> 
                    <p style={{fontFamily:"Arial",marginTop:"5px",textAlign:"left"}}>{data.paymentStatus}</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Created at :</b>
                    <p style={{fontFamily:"Arial",marginTop:"3px",textAlign:"left"}}>{data.createdAt}</p>
                  </span>
                  <span>
                    <b style={{fontFamily:"Poppins",textAlign:"left"}}>Razorpay Address :</b>
                    <p style={{fontFamily:"Arial",marginTop:"3px",textAlign:"left"}}>{data.notes.address}</p>
                  </span>
               </div>
           </div>
           <h2 style={{fontFamily:"Poppins",color:"black",textAlign:"center"}}>Thank You !</h2>
           <p style={{width:"100%",textAlign:"center",fontSize:"0.75em"}}>Thank you for Shopping from Soham !</p>
        </div>
  )
}

export default PaymentDetails
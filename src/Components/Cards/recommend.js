import React from 'react';
import {FaStar,FaRegStar} from "react-icons/fa";
import "../css/recommend.css";

const Recommend = ({product}) => {
    
  return (
    <div className='product-related-item'>
        <div className="product-related-item-img"><img src={product.img} alt="" /></div>
        <div className="product-related-item-details">
            <div className="product-related-item-title">{product.title.slice(0,100)}...</div>
            <div className="product-related-item-star">
              <FaStar style={{color:"orange",fontSize:"1em"}}/>
              <FaStar style={{color:"orange",fontSize:"1em"}}/>
              <FaStar style={{color:"orange",fontSize:"1em"}}/>
              <FaStar style={{color:"orange",fontSize:"1em"}}/>
              <FaRegStar style={{color:"orange",fontSize:"1em"}}/>
              <p style={{fontSize:"0.9em",fontFamily:"Poppins",padding:"1px 0 0 5px",color:"black"}}>{product.ratingCount}</p>
            </div>
            <div className="product-related-item-mrp">₹{product.MRP}</div>
        </div>
    </div>
  )
}

export default Recommend
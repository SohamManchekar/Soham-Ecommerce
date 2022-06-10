import React from 'react'
import "../../Components/css/OrderCard.css";

const OrderCard = ({data}) => {

  return (
    <div className="order-body-card">
       <div className="order-body-card-img">
         <img src={data.img} alt={data.title} title={data.title} />
       </div>
       <div className="order-body-card-details">
           <div className="order-body-card-title">{data.title.slice(0,120)}...</div>
           <div className="order-body-card-mrp-price-off">
                <p className="order-body-card-price">₹{data.price}</p>
                <del className="order-body-card-mrp">₹{data.MRP}</del>
                <p className="order-body-card-discount">({data.discount})% off</p>
            </div>
            <div className="order-body-card-qty">Qty : <b>{data.qty}</b></div>
       </div>
    </div>
  )
}

export default OrderCard
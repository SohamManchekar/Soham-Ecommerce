import React from 'react'
import "../css/card.css";

const Card2 = ({data}) => {
  const discountAmount = data.MRP - ((data.MRP * data.discount) / 100).toFixed();

  return (
    <div className='card-outer'>
        <div className="card-outer-img">
            <img src={data.img} alt={data.title} title={"Click to view "+data.title}/>
        </div>
        <div className="card-price-deal">
          <div className="price-deal">
            MRP <del style={{fontWeight:"600"}}>₹{data.MRP}</del> ₹{discountAmount}
          </div>
          <div className="price-deal-save">
            You save ₹{data.MRP - discountAmount} ({data.discount}%)
          </div>
        </div>
    </div>
  )
}

export default Card2
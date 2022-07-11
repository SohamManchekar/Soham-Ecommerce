import React from 'react'
import moment from "moment";
import { FaStar,FaRegStar } from "react-icons/fa";
import "../../Pages/css/CategorytPage.css"


const Product = ({product}) => {

    const discountAmount = product.MRP - ((product.MRP * product.discount) / 100).toFixed();
  return (
    <div className='category-product-body'>
        <div className="category-product-img"><img src={product.img} alt="" /></div>
        <div className="category-product-detail">
            <div className="category-product-title">{product.title.slice(0,100)}...</div>
            <div className="category-product-star-rating">
              <FaStar className='category-star-size'/>
              <FaStar className='category-star-size'/>
              <FaStar className='category-star-size'/>
              <FaStar className='category-star-size'/>
              <FaRegStar className='category-star-size'/>
              <p className='category-star-rating'>{product.ratingCount}</p>
            </div>
            <div className="category-product-mrp-price-off">
                <p className="category-product-price">₹{discountAmount}</p>
                <del className="category-product-mrp">₹{product.MRP}</del>
                <p className="category-product-discount">({product.discount}% off)</p>
            </div>
            <div className="categoy-product-delivery-date">
               <p style={{fontSize:"0.9em",color:"#595959",fontWeight:"400",fontFamily:'Arial',paddingTop:'1px'}}>Get it by</p> <p style={{color:"black",paddingLeft:"0.2em",fontWeight:"500",fontFamily:'Arial'}}>{moment().add(3, "days").format("ll")}</p>
            </div>
            {discountAmount > 1000 ? 
              <p className='category-product-delivery-state'>Free Delivery</p> : <p className='category-product-delivery-state'> Shipping Charges ₹85</p>
            }
        </div>
    </div>
  )
}

export default Product
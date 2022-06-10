import React from 'react';
import { Link } from 'react-router-dom';
import "../css/card.css"

const Card1 = ({data}) => {
  return (
    <>
        <div className="card-body">
            <div className="card-header">{data.name}</div>
            <div className="card-img"><img src={data.img} alt="" /></div>
            <Link to={`/Category/${data.category}`} style={{textDecoration:"none"}}><button className='card-btn' title="Click to view" >See more</button></Link>
        </div>
    </>
  )
}

export default Card1
import React from 'react';
import { Link } from 'react-router-dom';
import {FaChevronCircleRight} from "react-icons/fa";


const List = ({data}) => {
  return (
    <Link style={{textDecoration:"none"}} to={`/Category/${data}`}>
      <li>
        <div className="content">
            <div className="sub-content">{data}</div>
            <button className='arrow'>{<FaChevronCircleRight/>}</button>
        </div>
      </li>
    </Link>
  )
}

export default List
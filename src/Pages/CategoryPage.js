import React,{useState,useEffect} from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import { useParams,Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import db from '../Backend/firebase/config';
import "./css/CategorytPage.css";
import Product from '../Components/Cards/Product';

const CategoryPage = () => {
  
  // get the category using useParams
  const {category} = useParams();
  const [categoryListsData, setCategoryListsData] = useState([]);

  // get the collection of category data using onSnapshot 
  const getCategoryListsData = async () => {
    const ref = query(collection(db, "Products"), where("category","==",category))
    const docRef = await getDocs(ref) 
    const listsData = [] // store data and send to setCategoryListsData
      docRef.docs.forEach((doc) => {
        listsData.push({...doc.data(), id: doc.id})
      })
      setCategoryListsData(listsData)
  }

  // call the function and get the data 
  useEffect(() => {
    getCategoryListsData()
  },[category])

  return (
    <div className='product-page'>
      <div className="products-lists">
          <ul>
            {
             categoryListsData.length === 0 ?
             <div className="loading">
                <CircularProgress/>
              </div>
              :
              categoryListsData && categoryListsData.map((data) => {
                return (
                  <li key={data.id}>
                    <Link to={`/Category/${category}/${data.id}`} style={{textDecoration:"none"}} target="_blank">
                      <Product product={data} key={data.id} />
                    </Link>
                  </li>
                )
              })
            }
          </ul>
        </div>
    </div>
  )
}

export default CategoryPage
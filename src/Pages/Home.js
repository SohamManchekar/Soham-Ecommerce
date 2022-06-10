import React,{useState,useEffect} from 'react'
import "./css/Home.css"
import SliderComp from '../Components/Slider'
import Card1 from '../Components/Cards/Card1'
import Card2 from '../Components/Cards/Card2'
import SignInCard from '../Components/Cards/SignInCard'
import { displayProductBanner,displayProductBanner2,displayProductBanner3} from '../Backend/DB/HomepageData'
import Countdown from '../Components/Countdown'
import { Link } from 'react-router-dom'
import {collection,query,where,limit,getDocs, orderBy, startAt} from "firebase/firestore"
import db from "../Backend/firebase/config"

const Home = () => {

  // if discount > 15 . store the docs in today's deals component
  const [todaysDeal, setTodaysDeal] = useState([])
  const getTodaysDealData = async () => {
    const ref = query(collection(db,"Products"), where("discount",">",15), limit(15));
    const docRef = await getDocs(ref)
    const todaysDealData = []
    docRef.docs.forEach((doc) => {
      return todaysDealData.push({...doc.data(),id: doc.id})
    })
    setTodaysDeal(todaysDealData)
  }

 // get docs for only category Phone
 const [phoneCategoryData, setPhoneCategoryData] = useState([])
const getDocsForPhones = async () => {
  const ref = query(collection(db,"Products"), where("category","==","Phones"), orderBy("discount"), startAt(8))
  const docRef = await getDocs(ref)
  const phones = []
   docRef.docs.forEach((doc) => {
     return phones.push({...doc.data(),id: doc.id})
   })
    setPhoneCategoryData(phones)
  }

  useEffect(() => {
    getTodaysDealData()
    getDocsForPhones()
  }, [])
  
  return (
    <>
       <div className="home">
       <SliderComp/>
       {/* display product banner  */}
        <div className="container">
            <div className="homepage-products-display">
                  <ul>
                        <li key={1}><SignInCard/></li>
                        {
                           displayProductBanner && displayProductBanner.map((data,index) => {
                            return (<li key={index}><Card1 key={index} data={data} /></li>)
                          })
                        }
                  </ul>
            </div>   
          </div>

          {/* display product slider  */}
          <div className="container1">
          <div className="homepage-product-slider-header"><div className='today-deal-title'>Today's Deals</div><Countdown/></div>
            <div className="homepage-products-display" style={{height:"365px",width:"98%",marginLeft:"1%"}}>
                  <ul>
                  {
                    todaysDeal && todaysDeal.map((data) => {
                      return (
                        <Link to={`/Category/${data.category}/${data.id}`} style={{textDecoration:"none"}} key={data.id} target="_blank">
                          <li key={data.id} style={{marginLeft:"8px",marginRight:"8px",width:"300px"}}><Card2 key={data.id} data={data}/></li>
                        </Link>
                      )
                    })
                  }
                  </ul>
            </div>
          </div>

     {/* display product banner */}
          <div className="container">
            <div className="homepage-products-display">
                  <ul>
                    {
                     displayProductBanner2 && displayProductBanner2.map((data,index) => {
                        return (<li key={index}><Card1 key={index} data={data} /></li>)
                      })
                    }
                  </ul>
            </div>   
          </div>

          {/* display Product banner  */}
          <Link style={{textDecoration:"none"}} to={`/Category/HomeFurnishing`} key={1}>
            <div className="Furniture-banner" style={{marginBottom:"1em"}}>
              <img src="https://m.media-amazon.com/images/G/31/AMS/IN/970X250-_desktop_banner.jpg" alt="" title='Click to view' />
            </div>
          </Link>

           {/* display product slider  */}
           <div className="container1">
          <div style={{width:"320px",height:"45px",margin:"8px 12px",fontSize:"1.5em",fontWeight:"600",fontFamily:"Arial, Helvetica, sans-serif",padding:"9px"}}>Get 8 - 15% off on Phones</div>
            <div className="homepage-products-display" style={{height:"365px",width:"98%",marginLeft:"1%"}}>
                  <ul>
                  {
                    phoneCategoryData && phoneCategoryData.map((data) => {
                      return (
                        <Link to={`/Category/${data.category}/${data.id}`} style={{textDecoration:"none"}} key={data.id} target="_blank">
                          <li key={data.id} style={{marginLeft:"13px",marginRight:"13px",width:"250px"}}><Card2 key={data.id} data={data}/></li>
                        </Link>
                      )
                    })
                  }
                  </ul>
            </div>
            <Link to="/Category/Phones" style={{textDecoration:"none"}} key={2}>
              <button className='see-more'>See more</button>  
            </Link> 
          </div>

          {/* display product banner  */}
        <div className="container">
            <div className="homepage-products-display">
                  <ul>
                        {
                          displayProductBanner3 && displayProductBanner3.map((data,index) => {
                            return (<li key={index}><Card1 key={index} data={data} /></li>)
                          })
                        }
                  </ul>
            </div>   
          </div>

       </div>
    </>
  )
}

export default Home
import React,{useState,useEffect} from 'react'
import List from './List';
import {GrClose} from "react-icons/gr";
import { Link, useNavigate } from 'react-router-dom';
import {FaChevronCircleRight} from "react-icons/fa";
import db, { auth } from '../Backend/firebase/config';
import { doc, getDoc} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./css/sidemenu.css";

const Sidemenu = () => {

  const navigate = useNavigate();
  const [user, setUser] = useState() // if user exists store user data
  const [uid, setUid] = useState()  // get user uid for user information to display to user
  const [userInfo, setUserInfo] = useState({})  // get user information if exists

  const userAuthentication = () => {
    auth.onAuthStateChanged((user) => {
      if(user){
        setUser(user);
        setUid(user.uid)
      } else {
        setUser()
        setUid()
      }
    })
  }

  const getUserInfo = async() => {
    const ref = doc(db,`Users/${uid}`)
    const docRef = await getDoc(ref);
    if (docRef.exists) {
       setUserInfo({...docRef.data(),id: docRef.id})
    } else {
      setUserInfo()
      console.log("No user found");
    }
  }

  const userLogout = async() => {
    await signOut(auth)
    .then(() => {
      toast.success("User Logout",{autoClose:2500})
      navigate("/")
      setUser()
    })
    .catch((err) => {
      toast.error(err,{autoClose:2500})
    })
  }

  useEffect(() => {
     userAuthentication();
     getUserInfo();
  },[user]);
  

  const shopByCategory = ["DinningTable","Headphones","HomeDecor","HomeFurnishing","Laptop","MensClothes","Phones","SmartWatch","Sunglasses","WomensClothes","Tv"]
  const programFeatures = ["Gift Cards","Soham Live","International Shopping"];
    
  return (
    <>
        <div className="side-menu" id='menuBar'>
            <div className="side-menu-header">
                <div className="user-img"><img src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-512.png" alt="" /></div> 
                <p>Hello, {user ? `${userInfo.FirstName} ${userInfo.LastName}` : "Sign In" }</p>   
                <button className='close-btn' onClick={() => document.getElementById("menuBar").style.left = "-400px"}><GrClose/></button>
            </div>
            <div className="lists">
              <div className="list">
              <p>Shop by Department</p>
                <ul>
                  {
                    shopByCategory && shopByCategory.map((elem,index) => {
                      return <List data={elem} key={index} />
                    })
                  }
                </ul>
              </div>
              <hr className="separator-line"></hr>
              <div className="list">
              <p>Programs & Features</p>
                <ul>
                  {
                   programFeatures && programFeatures.map((elem,index) => {
                      return (<li key={index}>
                                <div className="content">
                                    <div className="sub-content">{elem}</div>
                                    <button className='arrow'>{<FaChevronCircleRight/>}</button>
                                </div>
                              </li>)
                    })
                  }
                </ul>
              </div>
              <hr className="separator-line"></hr>
              <div className="list">
              <p>Settings</p>
                <ul>
                  {
                    user ? 
                    <>
                    <Link style={{textDecoration:"none"}} to="/YourAccount">
                      <li>
                        <div className="content">
                            <div className="sub-content">Your Account</div>
                            <button className='arrow'>{<FaChevronCircleRight/>}</button>
                        </div>
                      </li>
                    </Link>
                    <li>
                      <div className="content" onClick={userLogout}>
                            <div className="sub-content">Logout</div>
                            <button className='arrow'>{<FaChevronCircleRight/>}</button>
                      </div>
                    </li>
                    </>
                    :
                    <>
                    <li onClick={() => toast.error("Sign in",{autoClose:2500})}>
                        <div className="content">
                            <div className="sub-content">Your Account</div>
                            <button className='arrow'>{<FaChevronCircleRight/>}</button>
                        </div>
                      </li>
                    <Link style={{textDecoration:"none"}} to="/SignIn">
                      <li>
                        <div className="content">
                              <div className="sub-content">Sign In</div>
                              <button className='arrow'>{<FaChevronCircleRight/>}</button>
                        </div>
                      </li>
                    </Link> 
                    </>                 
                  }
                </ul>
              </div>
            </div>
        </div>
    </>
  )
}

export default Sidemenu
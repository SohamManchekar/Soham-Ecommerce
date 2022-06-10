import React,{useState,useEffect} from 'react';
import Sidemenu from "../Components/Sidemenu";
import {FaBars,FaSearch} from "react-icons/fa";
import { Backdrop } from "@mui/material";
import {BiLogInCircle} from "react-icons/bi";
import {HiUserAdd} from "react-icons/hi"
import {FaOpencart} from "react-icons/fa";
import { Link , useNavigate} from 'react-router-dom';
import db ,{ auth } from '../Backend/firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./css/Header.css";


const Header = () => {

  const navigate = useNavigate();
  const [user, setUser] = useState()
  const [uid, setUid] = useState()
  const [userCartQty, setUserCartQty] = useState([])
  // sidemenu function
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    document.getElementById("menuBar").style.left = "-400px";
  };
  const handleToggle = () => {
    setOpen(true);
    document.getElementById("menuBar").style.left = "0px";
  };

  // if user exists give all functionality to user. 
  const userAuthentication = () => {
    auth.onAuthStateChanged((user) => {
      if(user){
        setUser(user);
        setUid(user.uid)
      } else {
        setUser();
        setUid();
      }
    })
  }

  const userLogout = async() => {
    await signOut(auth)
    .then(() => {
      toast.success("User Logout",{autoClose:2500})
      navigate("/")
      setUser()
    })
    .catch((err) => {
      toast.error(err.message,{autoClose:2500})
    })
  }

  const getUserCartQty = () => {
    const ref = collection(db,`Users/${uid}/Cart`)
     onSnapshot(ref,(snapshot) => {
      const userCartCollection = []
      snapshot.docs.forEach((doc) => {
       userCartCollection.push({...doc.data()})
      })
      setUserCartQty(userCartCollection)
    })
 }

 // total qty in cart
 const getCartQty = userCartQty.map((item) => {
   return item.qty
 })
 const qtyReducer = (accumulator,currentValue) => accumulator+currentValue
 const totalCartQty = getCartQty.reduce(qtyReducer,0)

  useEffect(() => {
     userAuthentication()
  },[user])

  useEffect(() => {
    getUserCartQty()
  })
  
  
  
  return (
    <>
      <div className="header">
      <ToastContainer/>
           <div className="head-bar">
                <button className='menu-bar-btn' onClick={() =>  handleToggle()}><FaBars/></button>
                <Backdrop
                sx={{ color: '#fff',transition: "0.5s", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={open}
                onClick={handleClose}
                >
              <Sidemenu/>
              </Backdrop>
          </div>
          <div className="logo" onClick={() => navigate("/")}><img src="https://www.freepnglogos.com/uploads/shopping-bag-png/shopping-bag-shopping-bags-transparent-png-svg-vector-8.png" alt="" /></div>
          <div className="logo-name" onClick={() => navigate("/")}>Soham</div>
            <div className="search-section">
              <div className="search-box">
                <input type="text" name='search' className='searching' placeholder='Search for products....' />
                  <button className="search-btn"><FaSearch/></button>
              </div>
           </div>
           <div className="sign-login-sec">
            {
              user ? 
              <Link to="/" style={{textDecoration:"none"}}><button className='sl-btn' onClick={userLogout}>Logout</button></Link>
              :
              <>
              <Link to="/SignUp" style={{textDecoration:"none"}}><button className='sl-btn'>Sign up<HiUserAdd/></button></Link>
              <Link to="/SignIn" style={{textDecoration:"none"}}><button className='sl-btn'>Sign in<BiLogInCircle/></button></Link>
              </>
            }
          </div>
           <div className="cart">
              <Link to="/cartpage"><button className='cart-btn'><FaOpencart/></button></Link>
              {
                user ? 
                <p>{totalCartQty}</p>
                :
                <p>0</p>
              }
          </div>
      </div>
    </>
  )
}

export default Header
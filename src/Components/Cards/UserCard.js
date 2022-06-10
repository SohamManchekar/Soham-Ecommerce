import React,{useState,useEffect} from 'react'
import {FcPrevious} from "react-icons/fc";
import {AiOutlineClose} from "react-icons/ai"
import { Link,useNavigate } from 'react-router-dom';
import db, { auth } from "../../Backend/firebase/config";
import { doc, getDoc} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../Pages/css/Myaccount.css"

const UserCard = () => {

    const navigate = useNavigate()
    const [user, setUser] = useState() // get user
    const [uid, setUid] = useState()  // get user uid for user information to display to user
    const [userInfo, setUserInfo] = useState({})  // get user information if exists
  
    const userAuthentication = () => {
      auth.onAuthStateChanged((user) => {
        if(user){
          setUser(user)
          setUid(user.uid)
        } else {
          setUid()
          setUser()
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
          toast.error(err,{autoClose:2500})
        })
      }

      const getUserInfo = async() => {
        const ref = doc(db,`Users/${uid}`)
        const docRef = await getDoc(ref);
        if (docRef.exists) {
           setUserInfo({...docRef.data()})
        } else {
          setUserInfo()
          console.log("No user found");
        }
      }

      const handleUserCardClose = () => {
        const myAccDetail = document.querySelector(".my-acc-details2")
        myAccDetail.style.left = "-345px"
      }

      useEffect(() => {
        userAuthentication();
        getUserInfo();
     });


  return (
    <div className="my-acc-user-details">
    <div className="my-acc-user-head">
        {
          user?
          <div className='my-acc-user-name'><p>Hello, {userInfo.FirstName} {userInfo.LastName}</p> <button className='close-usercard-btn' onClick={() =>  handleUserCardClose()}><AiOutlineClose/></button> </div>
          :
          <div className='my-acc-user-name'>Hello, Sign in</div>
        }
        <img src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-512.png" alt="" />
    </div>
    <div className="my-acc-user-other-details">
       {
         user ? 
         <p className='my-acc-username'>Name : {userInfo.FirstName} {userInfo.LastName}</p>
         :
         <p className='my-acc-username'>Name : Sign in</p>
       }
        <p className='my-acc-userAddress'>
           <p style={{fontWeight:"600",paddingRight:"3px"}}>Address</p> 
           : 
           {userInfo.Address === "" || userInfo.City === "" || userInfo.Town === "" || userInfo.Pincode === "" ? 
             <p style={{paddingLeft:"3px",fontWeight:"500",fontSize:'0.9em'}}>Update Your address</p>
             :
             <p style={{paddingLeft:"3px",fontWeight:"500",fontSize:'0.9em'}}>{userInfo.Address},{userInfo.Town},{userInfo.City} - {userInfo.Pincode}</p>
           }
       </p>
        <p className='my-acc-status'>
           <p style={{fontWeight:"600",paddingRight:"5px"}}>Status</p> 
           : 
           {
             userInfo.Address === "" || userInfo.City === "" || userInfo.Town === "" || userInfo.Pincode === "" ?
             <b style={{paddingLeft:"5px",color:"#dd1818"}}>{userInfo.Status}</b> 
              :
             <b style={{paddingLeft:"5px",color:"#00ff00"}}>{userInfo.Status}</b> 
           }
         </p>
        <p className='my-acc-signupdate'>Sign up Date : {userInfo.SignUpTime}</p>
        <p className='my-acc-signupdate'>Updated Date : {userInfo.UpdatedTime}</p>
    </div>
    <div className="my-acc-upd-logout-btn">  
       <Link style={{textDecoration:"none"}} to="/UpdateProfile"><button className='my-acc-btn'><FcPrevious style={{fontSize:"1.2em",paddingLeft:"3px"}}/><p style={{paddingLeft:'5px'}}>Update Profile</p></button></Link>
       <button className='my-acc-btn' onClick={userLogout}><FcPrevious style={{fontSize:"1.2em",paddingLeft:"3px"}}/><p style={{paddingLeft:'5px'}}>Logout</p></button>
    </div>
</div>
  )
}

export default UserCard
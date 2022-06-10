import React,{useState,useEffect} from 'react'
import { Link , useNavigate} from 'react-router-dom';
import db from '../../Backend/firebase/config';
import { auth } from '../../Backend/firebase/config';
import { getDoc,doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../css/card.css";

const SignInCard = () => {

  const navigate = useNavigate();
// if user exists show logout component else sign in component
const [user, setUser] = useState()
const [userInfo, setUserInfo] = useState({})
const [uid, setUid] = useState()

// check user exists or not
const getAuthentication = () =>{
  auth.onAuthStateChanged((user) => {
    if(user){
      setUser(user);
      setUid(user.uid);
    } else{
      setUser();
      setUid();
    }
  })
}

// get user info
const getUserInfo = async() =>{
  const ref = doc(db,`Users/${uid}`)
  const docRef = await getDoc(ref)
  if(docRef.exists){
    setUserInfo({...docRef.data()});
  } else{
    setUserInfo();
  }
}

// if user exists show logout component
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
  getAuthentication()
},[user])

useEffect(() => {
  getUserInfo()
})


  return (
    <div className='card-layout'>
          <div className="card-sign-layout">
          <div className="card-header1" style={{fontSize:"1.1em"}}>
            {
              user?
              `Welcome ${userInfo.FirstName} ${userInfo.LastName}`
              :
              "Shop on Soham"
            }
          </div>
           {
             user ?
             <button className='sign-in-btn' title='Logout' onClick={userLogout}>Logout</button>
             :
             <Link to="/SignIn" style={{textDecoration:"none"}}><button className='sign-in-btn' title='Sign in'>Sign in</button></Link>
           }
          </div>
        <div className="parcel-img"><img src="https://t4.ftcdn.net/jpg/04/98/30/53/240_F_498305319_VApwPfLSUiU9tAj3Pc9bhnPRqgoBi7TQ.jpg" alt="" title='Scheduled Delivery' /></div>
    </div>
  )
}

export default SignInCard
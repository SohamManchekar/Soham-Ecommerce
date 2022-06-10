import React,{useState,useEffect} from 'react'
import db, {auth} from '../../Backend/firebase/config';
import { getDoc,doc,updateDoc} from 'firebase/firestore';
import { toast, ToastContainer} from 'react-toastify';
import moment from 'moment';
import { Link, useNavigate } from 'react-router-dom';
import "../css/Form.css";


const UpdateProfile = () => {

  const navigate =  useNavigate()
  const [user, setUser] = useState() // if user exists store user data
  const [uid, setUid] = useState()  // get user uid for user information to display to user
  const [userInfo, setUserInfo] = useState({})  // get user information if exists
  const [updateProfile, setUpdateProfile] = useState({
      firstName : "",
      lastName : "",
      address : "",
      town : "",
      city : "",
      pincode : ""
  })  // store user input to update profile

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

  // if user exists show user data to edit or update 
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

      // if user exists allow to enable & edit else show sign in component
      const updInp = document.querySelectorAll(".form-input-upd")
      const [disabled, setdisabled] = useState(true)
      const handleEdit = () =>{
        updInp.forEach((elem) => {
            elem.ariaDisabled = setdisabled(false)
        })
        toast.success("Enabled",{autoClose:1000})
        toast.info("Update Profile",{autoClose:2500})
    }

    // user input
    const handleInput = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setUpdateProfile({...updateProfile,[name]:value})
    }

    // update the profile once edit
    const handleUpdateProfile = async (event) => {
        event.preventDefault()
        if (updateProfile.pincode.length !== 6){
          toast.error("Pincode must be 6 digit number",{autoClose:3000})
        } else{
          const ref = doc(db,`Users/${uid}`)
          await updateDoc(ref,{
            FirstName : updateProfile.firstName? updateProfile.firstName : userInfo.FirstName,
            LastName : updateProfile.lastName? updateProfile.lastName : userInfo.LastName,
            Address: updateProfile.address? updateProfile.address : userInfo.Address,
            Town : updateProfile.town? updateProfile.town : userInfo.Town,
            City: updateProfile.city? updateProfile.city : userInfo.City,
            Pincode: updateProfile.pincode? updateProfile.pincode : userInfo.Pincode,
            Status: "Updated",
            UpdatedTime : moment().format('ll')
          })
          .then(() => {
            toast.success("Updated Profile",{autoClose:2500})
            setdisabled(true)
            setTimeout(() => {
              navigate("/YourAccount")
            }, 1000);
          })
          .catch((err) => {
            toast.error(err.message,{autoClose:2500})
          })
    }
  }


    useEffect(() => {
      userAuthentication()
      getUserInfo()
    })
      
    
  return (
    <div className='update-profile-form-section'>
         <ToastContainer/>
       <div className="update-profile-form-page">
       {
           user ? 
           <>
            <div className="update-profile-userData">
                <img src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-512.png" alt="" />
                <p className='upd-username'>{userInfo.FirstName} {userInfo.LastName}</p>
              </div>
                <form action="/" onSubmit={handleUpdateProfile}>
                        <div className="update-form">
                            <div className="form-comp-upd">
                                <p className='form-label'>Firstname</p>
                                <input type="text" className='form-input-upd' placeholder='Firstname' name='firstName' disabled={disabled} defaultValue={userInfo.FirstName} onChange={handleInput} required={true} />
                            </div>
                            <div className="form-comp-upd">
                                <p className='form-label'>Lastname</p>
                                <input type="text" className='form-input-upd' placeholder='Lastname' name='lastName' disabled={disabled} defaultValue={userInfo.LastName} onChange={handleInput} required={true} />
                            </div>
                            <div className="form-comp-upd">
                                <p className='form-label'>Email</p>
                                <input type="text" className='form-input-upd' placeholder='Email ID' name='email' disabled={true} value={userInfo.EmailID} />
                            </div>
                            <div className="form-comp-upd">
                                <p className='form-label'>Address</p>
                                <input type="text" className='form-input-upd' placeholder='Room no, Building-Name, Near-by-Area-Name' name='address' disabled={disabled} defaultValue={userInfo.Address} onChange={handleInput} required={true}/>
                            </div>
                            <div className="form-comp-upd">
                                <p className='form-label'>Town</p>
                                <input type="text" className='form-input-upd' placeholder='Eg : Dadar(East/West)' name='town' disabled={disabled} defaultValue={userInfo.Town} onChange={handleInput} required={true}/>
                            </div>
                            <div className="form-comp-upd">
                                <p className='form-label'>City</p>
                                <input type="text" className='form-input-upd' placeholder='Eg : Mumbai' name='city' disabled={disabled} defaultValue={userInfo.City} onChange={handleInput} required={true}/>
                            </div>
                            <div className="form-comp-upd">
                                <p className='form-label'>Pincode</p>
                                <input type="text" className='form-input-upd' id='pincodeCheck' placeholder='Eg : 224466' name='pincode' disabled={disabled} defaultValue={userInfo.Pincode} onChange={handleInput} required={true}/>
                            </div>
                            <div className="update-form-btns">
                                <button className='upd-form-btn' style={{backgroundColor:"white",color:"black"}} type="button" onClick={() => handleEdit()} >Edit</button>
                                <button className='upd-form-btn' style={{backgroundColor:"black",color:"White"}} type="submit">Update</button>
                            </div>
                        </div>
                    </form>
            </>
            :
           <>
           <div className="update-profile-userData">
                <img src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-512.png" alt="" />
                <p className='upd-username'>Hello, Sign in</p>
            </div>
            <div className="empty-area" style={{width:"100%",height:"60vh",display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                <Link style={{textDecoration:"none"}} to="/SignIn">
                    <button style={{width:"150px",height:"50px",backgroundColor:"black",color:"whitesmoke",border:"none",borderRadius:"8px",fontSize:'1.5em',fontFamily:"Poppins",fontWeight:"600",cursor:"pointer"}}>Sign in</button>
                </Link>
            </div>
           </>
       }
       </div>
    </div>
  )
}


export default UpdateProfile

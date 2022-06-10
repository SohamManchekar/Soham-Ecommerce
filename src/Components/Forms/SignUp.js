import React,{useState} from 'react';
import {Link,useNavigate} from "react-router-dom";
import {createUserWithEmailAndPassword} from "firebase/auth"
import { auth } from '../../Backend/firebase/config';
import db from '../../Backend/firebase/config';
import { doc,setDoc } from 'firebase/firestore';
import validator from 'validator';
import swal from 'sweetalert';
import moment from 'moment';
import { toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../css/Form.css";

const SignUp = () => {

// if user sign up successfully navigate to homepage
const navigate = useNavigate();
const [signUpUser, setSignUpUser] = useState({
    firstName: "",
    lastName: "",
    email : "",
    password: "",
})

// show error
const firstnameErr = document.getElementById("firstnameErr")
const lastnameErr = document.getElementById("lastnameErr")
const emailErr = document.getElementById("emailErr")
const passwordErr = document.getElementById("passwordErr")

// validation for user 
const handleSignUpError = () =>{
    if(validator.isAlpha(signUpUser.firstName)){
        firstnameErr.innerHTML = "Valid"
        firstnameErr.style.color = "#00ff00"
    } else if(signUpUser.firstName === ""){
        firstnameErr.innerHTML = "Required"
        firstnameErr.style.color = "#dd1818"
    } else{
        firstnameErr.innerHTML = "Invalid"
        firstnameErr.style.color = "#dd1818"
    }

    if(validator.isAlpha(signUpUser.lastName)){
        lastnameErr.innerHTML = "Valid"
        lastnameErr.style.color = "#00ff00"
    } else if(signUpUser.firstName === ""){
        lastnameErr.innerHTML = "Required"
        lastnameErr.style.color = "#dd1818"
    } else{
        lastnameErr.innerHTML = "Invalid"
        lastnameErr.style.color = "#dd1818"
    }

   if (validator.isEmail(signUpUser.email)) {
        emailErr.innerHTML = "Valid"
        emailErr.style.color = "#00ff00"
   } else if(signUpUser.email === "") {
        emailErr.innerHTML = "Required"
        emailErr.style.color = "#dd1818"
   } else{
        emailErr.innerHTML = "Invalid"
        emailErr.style.color = "#dd1818"
   }

   if (signUpUser.password.length === 0) {
        passwordErr.innerHTML = "Required"
        passwordErr.style.color = "#dd1818"
  }  
   else if(signUpUser.password.length <= 4) {
        passwordErr.innerHTML = "Weak"
        passwordErr.style.color = "#fc4a1a"
   }
   else if(signUpUser.password.length < 8) {
        passwordErr.innerHTML = "Medium"
        passwordErr.style.color = "#fe8c00"
   }
   else if(signUpUser.password.length >= 8) {
        passwordErr.innerHTML = "Valid"
        passwordErr.style.color = "#00ff00"
   } 
   else{
        passwordErr.innerHTML = "Invalid"
        passwordErr.style.color = "#dd1818"
  }
}


// get the input value and store them
const handleInput = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setSignUpUser({...signUpUser,[name]:value})
}


const handleSignUp = async (e) =>{
   e.preventDefault();
   handleSignUpError();  // handle errors

   // if all condition are valid signup the user and create a document of user with signup user uid so that it will be easy to match user collections
   if(firstnameErr.innerHTML === "Valid" && lastnameErr.innerHTML === "Valid" && emailErr.innerHTML === "Valid" && passwordErr.innerHTML === "Valid"){
         await createUserWithEmailAndPassword(auth, signUpUser.email,signUpUser.password)
          .then((cred) => {
           const uid = cred.user.uid
            setDoc(doc(db,"Users",uid),{
            FirstName : signUpUser.firstName,
            LastName : signUpUser.lastName,
            EmailID : signUpUser.email,
            Address : "",
            Town : "",
            City : "",
            Pincode: "",
            Status: "Not Updated",
            SignUpTime: moment().format('ll')
         }).then(() => {
           swal("Registeration Successfull !", `Welcome ${signUpUser.firstName} ${signUpUser.lastName}`, "success")
           .then(() => {
            setTimeout(() => {
                navigate("/")
               }, 500);
            })
          }).catch((err) => alert(err.message))
        })
        .catch((err) => {
            toast.error("Email ID already exists",{autoClose:2500})
        })
   } else{
       swal("Failed to Register","Something Went Wrong !","error")
   }
}

  return (
    <div className='form-page'>
    <ToastContainer/>
        <form action="/" onSubmit={handleSignUp}>
            <div className="signup-page">
                <div className="form-comp">
                    <p className='form-label'>Firstname</p>
                    <input type="text" className='form-input' placeholder='Firstname' name='firstName' value={signUpUser.firstName} onChange={handleInput} />
                    <p className='form-error' id='firstnameErr'></p>
                </div>
                <div className="form-comp">
                    <p className='form-label'>Lastname</p>
                    <input type="text" className='form-input' placeholder='Lastname' name='lastName' value={signUpUser.lastName} onChange={handleInput} />
                    <p className='form-error' id='lastnameErr'></p>
                </div>
                <div className="form-comp">
                    <p className='form-label'>Email</p>
                    <input type="text" className='form-input' placeholder='Email ID' name='email' value={signUpUser.email} onChange={handleInput} />
                    <p className='form-error' id='emailErr'></p>
                </div>
                <div className="form-comp">
                    <p className='form-label'>Password</p>
                    <input type="password" className='form-input' placeholder='Password' name='password' value={signUpUser.password} onChange={handleInput} />
                    <p className='form-error' id='passwordErr'></p>
                </div>
                <div className="form-btn">
                    <button type='submit' className='form-submit-btn'>SignUp</button>
                </div>
                <div className="signUpIn-page">
                    <p>Already have an account?</p>
                    <Link to="/SignIn" style={{textDecoration:'none'}}><button className='UpIn-btn'>Sign In</button></Link>
                </div>
            </div>
        </form>
    </div>
  )
}

export default SignUp
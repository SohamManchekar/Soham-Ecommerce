import React,{useState} from 'react'
import { useNavigate,Link } from "react-router-dom";
import {auth} from "../../Backend/firebase/config"
import { signInWithEmailAndPassword } from 'firebase/auth';
import "../css/Form.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SignIn = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const navigate = useNavigate();

    // sign in user
    const handleSignIn = (event) =>{
        event.preventDefault();
        signInWithEmailAndPassword(auth,email,password)
        .then((cred) => {
            toast.success(`${cred.user.email} Logged in`,{autoClose:2500})
            setTimeout(() => {
                navigate("/")
            }, 1000);
        })
        .catch((err) => {
            if(email === "" || password === ""){
                toast.error("Fields are empty",{autoClose:2500})
            } else{
              toast.error("User not Found",{autoClose:2500})
            }
        })
    }
      
  return (
    <div className='form-page'>
    <ToastContainer/>
        <form action="/" onSubmit={handleSignIn}>
            <div className="signin-page">
                <div className="form-comp1">
                    <p className='form-label'>Email</p>
                    <input type="text" className='form-input' placeholder='Email ID' name='email' onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-comp1">
                    <p className='form-label'>Password</p>
                    <input type="password" className='form-input' placeholder='Password' name='password' onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="form-btn1">
                    <button type='submit' className='form-submit-btn'>Sign in</button>
                </div>
                <div className="signUpIn-page">
                <p>New to Soham ?</p>
                <Link to="/SignUp" style={{textDecoration:'none'}}><button className='UpIn-btn'>Create Account</button></Link>
                </div>
            </div>
        </form>
    </div>
  )
}

export default SignIn
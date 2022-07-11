import React,{useState,useEffect} from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Pages/Home";
import CartPage from "./Pages/CartPage";
import ProductDetail from "./Components/ProductDetail";
import Footer from "./Components/Footer";
import CategoryPage from "./Pages/CategoryPage";
import SignUp from "./Components/Forms/SignUp";
import SignIn from "./Components/Forms/SignIn";
import UpdateProfile from "./Components/Forms/UpdateProfile";
import MyAccount from "./Pages/MyAccount";
import ErrorComp from "./Components/ErrorComp";
import { auth } from "./Backend/firebase/config";

function App() {

const [user, setUser] = useState()
  const userAuthentication = () => {
    auth.onAuthStateChanged((user) => {
      if(user){
        setUser(user);
      } else {
        setUser();
      }
    })
  }
  useEffect(() => {
    userAuthentication()
  },[user])
  return (
    <BrowserRouter>
      <div className="App" style={{margin:0,padding:0,boxSizing:"border-box",overflow:"hidden"}}>
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/SignUp" element={<SignUp/>}/>
        <Route path="/SignIn" element={<SignIn/>}/>
        <Route path="/Category/:category/:id" element={<ProductDetail/>}/>
        <Route path="/Category/:category" element={<CategoryPage/>}/>
        <Route path="/CartPage" element={<CartPage/>}/>
        {user ? <Route path="/YourAccount" element={<MyAccount/>}/> : <Route path="/YourAccount" element={<ErrorComp/>}/>}
        <Route path="/UpdateProfile" element={<UpdateProfile/>}/>
      </Routes>
      <Footer/>
      </div>
    </BrowserRouter>
  );
}

export default App;

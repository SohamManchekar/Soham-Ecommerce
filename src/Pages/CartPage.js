import React,{useState,useEffect} from 'react'
import CartCard from '../Components/Cards/CartCard';
import db, { auth } from '../Backend/firebase/config';
import {FaShoppingCart} from "react-icons/fa";
import {FcPrevious} from "react-icons/fc";
import { collection, onSnapshot,getDoc,doc, addDoc, query, where, deleteDoc} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Backdrop } from "@mui/material";
import {GrLocation} from "react-icons/gr";
import {ImTruck} from "react-icons/im";
import { toast } from 'react-toastify';
import moment from "moment";
import "../Components/css/ProceedCard.css";
import "./css/CartPage.css";


const CartPage = () => {

  const navigate = useNavigate()
  const [userCart, setUserCart] = useState([])
  const [user, setUser] = useState()
  const [uid, setUid] = useState()
  const [open, setOpen] = useState(false)
  const [userInfo, setUserInfo] = useState({})  // get user information if exists


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

  // total qty in cart
  const getCartQty = userCart.map((item) => {
    return item.qty
  })
  const qtyReducer = (accumulator,currentValue) => accumulator+currentValue
  const TotalCartQty = getCartQty.reduce(qtyReducer,0)

  // subtotal of cart
  const getTotalCartPrice = userCart.map((item) => {
    return item.TotalPrice
  })
  const amountReducer = (accumulator,currentValue) => accumulator+currentValue
  const TotalCartPrice = getTotalCartPrice.reduce(amountReducer,0)


// proceed to checkout confirmation component
const proceedToCheckout = () => {
  if(user){
     if(userCart.length === 0){
       toast.warn("No Products in Cart",{autoClose:2500})
     } else if(userInfo.Address === "" || userInfo.City === "" || userInfo.Town === "" || userInfo.Pincode === ""){
       toast.info("Update Your Profile",{autoClose:2500})
     } else{
       setOpen(true)
     }
  } else{
    setOpen(false)
    toast.error("Sign in First",{autoClose:2500})
  }
}

const shippingCharges = TotalCartPrice > 1000 ? "Free Delivery" : 85

// once the payment gets successfull empty the cart
const handleDeleteCart = async () =>{
  const ref = collection(db,`Users/${uid}/Cart`);
  const q = query(ref, where("type","==","AddToCart"))
  onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map((doc) => ({id: doc.id}))
    results.forEach(async (result) => {
      const docRef = doc(db,`Users/${uid}/Cart`,result.id)
      await deleteDoc(docRef)
    })
  })
}

// proceed to checkout if confirmation successfully
const handleCheckoutProcess = async () =>{
   const ref = collection(db,`Users/${uid}/Orders`)
   const orderData = {
     OrderProduct : userCart,
     OrderDeliveryDate : moment().add(3, "days").format("ll"),
     OrderDate: moment().format('MMMM Do YYYY, h:mm:ss a'),
     OrderCancellationDate: moment().add(2, "days").format("ll"),
     TotalItems: TotalCartQty,
     TotalPayment : TotalCartPrice,
     Status: "Not Yet Shipped",
     PaymentType: "Cash on Delivery",
     ShippingCharges : shippingCharges
   }
     await addDoc(ref,orderData)
     .then(async() => {
      handleDeleteCart();
      toast.success("Your Order has been placed Successfully",{autoClose:2500})
      setOpen(false)
      navigate("/YourAccount")
   })
   .catch((err) => {
     toast.error("Failed to Purchase",{autoClose:1500})
     toast.info("Try again",{autoClose:2000})
     setOpen(true)
   })
}

const handleClose = () =>{
  setOpen(false)
}

const getUserCartCollections = async () => {
     const ref = collection(db,`Users/${uid}/Cart`)
      onSnapshot(ref, (snapshot) => {
      const userCartCollection = []
      snapshot.docs.map((doc) => {
      return userCartCollection.push({...doc.data(),id: doc.id})
      })
      setUserCart(userCartCollection)
    })
}

  useEffect(() => {
    userAuthentication()
  },[user]);

  useEffect(() => {
    getUserInfo()
  })
  
  useEffect(() => {
    getUserCartCollections()
  })
  

  return (
    <>
    <div className="cart-status">
      {
        !user ? 
        <><FaShoppingCart/> <p style={{marginLeft:"0.4em"}}>Sign in To continue shopping</p></>
        :
        userCart.length === 0? 
        <><FaShoppingCart/> <p style={{marginLeft:"0.4em"}}>Your cart is empty</p> <Link to="/YourAccount" style={{textDecoration:"none"}}><button className='your-order-btn1'>Your Orders</button></Link></>
        :
        <><FaShoppingCart/> <p style={{marginLeft:"0.4em"}}>Your cart : {TotalCartQty}</p> <Link to="/YourAccount" style={{textDecoration:"none"}}><button className='your-order-btn1'>Your Orders</button></Link> </>
      }
    </div>
      <div className="cart-page">
        <div className="cart-section">
            <div className="cart-product-display">
              {
                user ?
                userCart.length === 0?
                <div className="empty-box-img">
                  <img src="https://media.istockphoto.com/photos/cardboard-box-picture-id182215911?b=1&k=20&m=182215911&s=170667a&w=0&h=Vkv49S2PIVO2N7UA-Hw5PWNVRe0BVIkmldPWb4Vxz0k=" alt="" />
                </div>
                :
                <ul>
                {
                  userCart.map((data) => {
                    return <li key={data.id}><CartCard key={data.id} product={data} /></li>
                  })
                }
              </ul>
              :
              <>
              <div style={{width:"100%",height:"auto",display:"flex",justifyContent:"center",marginTop:'1em'}}>
                <h1 style={{fontFamily:"Arial",textAlign:"center"}}>Sign in</h1>
                <Link style={{textDecoration:"none"}} to="/SignIn"><button style={{width:'120px',height:"40px",textAlign:"Center",border:"none",outline:"none",borderRadius:'8px',backgroundColor:"black",color:"whitesmoke",fontSize:"1.3em",fontFamily:"Poppins",marginLeft:"0.4em",cursor:"pointer"}}>Sign in</button></Link>
              </div>
              </>
              }
            </div>
        </div>
        {
          user ? 
          <div className="cart-checkout-section">
            <div className="cart-items-total-display">
              <p className='ordsummary'>Order summary</p>
              <div style={{display:"flex",justifyContent:"space-evenly",alignItems:"center",width:"100%",height:'40%'}}>
                <div className="cart-data-display">Items : {TotalCartQty}</div>
                <div className="cart-data-display">Total Pay : ₹{TotalCartPrice}</div>
              </div>
              <Link to="/" style={{textDecoration:"none"}}>
                <button className='continue-shopping-btn'>
                  <FcPrevious style={{fontSize:"1.2em"}}/>
                  <p>Continue Shopping</p>
                </button>
              </Link>
            </div>
              <div className="cart-checkout-button">
                <button className='checkout-btn' onClick={() => proceedToCheckout()}>
                    Proceed to Buy
                </button>
              </div>
            </div>
             :
             null
          }
              <Backdrop sx={{ color: '#fff',transition: "0.5s", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
                <div className='proceed-card'>
                    <div className="proceed-card-display-name-logo">
                        {
                          user ? 
                          <p className='proceed-user-name'>Hello, {userInfo.FirstName} {userInfo.LastName}</p>
                          :
                          <p className='proceed-user-name'>Hello, Sign in</p>
                        }
                        <img src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-512.png" alt="" />
                    </div>
                    <div className="proceed-card-details">
                        <p style={{width:'100%',height:'40px',textAlign:"center",fontSize:"1.2em",fontFamily:'Poppins',fontWeight:'600',paddingTop:'5px',color:"black"}}>Your Orders summary</p>
                        <div className="proceed-card-product-qty-price-section">
                            <div className="proceed-card-product-qp">
                                Total Items : {TotalCartQty}
                            </div>
                            <div className="proceed-card-product-qp">
                                Total Price : ₹{TotalCartPrice}
                            </div>
                        </div>
                        <div className="proceed-card-user-address">
                            <p style={{color: "#0033cc",cursor: "pointer",fontSize: "1em",fontFamily:"Arial",fontWeight:'600',width:"100%",height:"22px",display:'flex',justifyContent:"start"}}>
                                <GrLocation style={{fontSize:"1.2em"}}/> <p>Deliver to :</p>
                            </p>
                            <p style={{fontSize:'0.9em',fontFamily:"Arial",fontWeight:"500",color:"black",paddingLeft:'5px',width:"100%",height:"auto"}}>
                              {userInfo.Address === "" || userInfo.City === "" || userInfo.Town === "" || userInfo.Pincode === "" ? 
                                "Update Profile"
                                :
                                `${userInfo.Address}, ${userInfo.Town}, ${userInfo.City} - ${userInfo.Pincode}`
                              } 
                            </p>
                        </div>
                        {
                          TotalCartPrice > 1000 ? 
                          <p className='proceed-card-product-delivery-state'>
                          <ImTruck/> Free Delivery
                          </p>
                          :
                          <p className='proceed-card-product-delivery-state'>
                          <ImTruck/> Shipping Charges ₹85
                          </p>
                        }
                        <div className="pay-options">
                            <button className='cash-on-btn' disabled={true}>Only Cash on Delivery</button>
                            <p style={{width:'100%',height:"auto",textAlign:'center',fontSize:"0.7em",fontFamily:"Poppins",fontWeight:'600',paddingTop:"3px",color:'black'}}>Note : Payment integration Work in progress</p>
                        </div>
                        <div className="confirm-cancel">
                            <button className='conf-can-order' style={{backgroundColor:'white',color:"black"}} onClick={() => handleClose()}>Cancel</button>
                            <button className='conf-can-order' style={{backgroundColor:'black',color:"white"}} onClick={() => handleCheckoutProcess()}>Confirm</button>
                        </div>
                    </div>
                 </div>
               </Backdrop>
          </div>
    </>
  )
}

export default CartPage
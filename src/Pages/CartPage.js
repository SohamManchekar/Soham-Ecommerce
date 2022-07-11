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
import {BsFillCreditCardFill} from "react-icons/bs"
import swal from 'sweetalert';
import moment from "moment";
import "../Components/css/ProceedCard.css";
import "./css/CartPage.css";


const CartPage = () => {

  const navigate = useNavigate()
  const [userCart, setUserCart] = useState([])
  const [user, setUser] = useState()
  const [uid, setUid] = useState()
  const [open, setOpen] = useState(false)
  const [open1, setOpen1] = useState(false) 
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
       toast.warn("No Products in Cart",{autoClose:2000})
     } else if(userInfo.Address === "" || userInfo.City === "" || userInfo.Town === "" || userInfo.Pincode === ""){
       toast.warn("Update Your Profile",{autoClose:2000})
       setTimeout(() => {
        toast.info("Redirecting to Update Profile",{autoClose:2000})
       }, 2300);
       setTimeout(() => {
         navigate("/UpdateProfile")
       }, 5000);
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

const handleConfirmation = () =>{
  swal({
    title: "Order Confirmation",
    text: "This message is related to confirm your order.Click OK to confirm.",
    icon: "info",
    buttons: true,
    successMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
       handleCheckoutProcess("Cash on Delivery","Cash Only")
    } else {
      setOpen(true)
    }
  });
}

// payment done via online transaction and note the condition to user before making payment
const handlePaymentNote = () =>{
  setOpen1(true)
} 

const handlePaymentNoteClose = () =>{
   setOpen1(false)
}

const proceedToPayment = () =>{
  setOpen1(false)
  const data = {
    amount : TotalCartPrice,
    items: TotalCartQty,
    name: userInfo.FirstName+" "+userInfo.LastName,
    email : userInfo.EmailID,
    address : userInfo.Address+","+userInfo.Town+","+userInfo.City+"-"+ userInfo.Pincode,
  }
      const options = {
        "key": process.env.REACT_APP_RAZORPAY_TEST_KEY_ID,
        "key_secret" : process.env.REACT_APP_RAZORPAY_TEST_KEY_SECRET_ID,
        "amount": data.amount * 100,
        "currency": "INR",
        "name": "Soham",
        "description": "No real money is used.",
        "image":"https://www.freepnglogos.com/uploads/shopping-bag-png/shopping-bag-shopping-bags-transparent-png-svg-vector-8.png",
        handler : function (response){
            const orderData = {
                Payment_id : response.razorpay_payment_id,
                Order_items: data.items,
                Order_amount : data.amount,
                currency : "INR",
                name: "Soham",
                description : "Test mode transaction. No real money is used in the test mode.",
                userInfo: {
                    name: data.name,
                    email : data.email,
                    contact : "9999999999",
                    address : data.address,
                },
                notes:{
                    address : "Razorpay Corporate Office"
                },
                paymentStatus: "PAID",
                createdAt : moment().format('MMMM Do YYYY, h:mm:ss a')
            }

            handleCheckoutProcess("Online Transaction",orderData)
            toast.success("Payment Successful",{autoClose:3000})
       },
        "prefill": {
            "name": data.name,
            "email": data.email,
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#e6e6e6"
        }
       };

       const pay = window.Razorpay(options);
       pay.open()
}

// proceed to checkout if confirmation successfully
const handleCheckoutProcess = async (paymentType,PaymentDetails) =>{
   const ref = collection(db,`Users/${uid}/Orders`)
   const orderData = {
     OrderProduct : userCart,
     OrderDeliveryDate : moment().add(3, "days").format("ll"),
     OrderDate: moment().format('MMMM Do YYYY, h:mm:ss a'),
     OrderCancellationDate: moment().add(2, "days").format("ll"),
     TotalItems: TotalCartQty,
     TotalPayment : TotalCartPrice,
     Status: "Not Yet Shipped",
     PaymentDetails : PaymentDetails,
     PaymentType: paymentType,
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
  },[userCart])
  

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
                    Checkout
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
                          <p style={{width:'100%',height:"auto",textAlign:'center',fontSize:"1em",fontFamily:"Poppins",fontWeight:'600',paddingTop:"3px",color:'black'}}>Click to Choose a Payment Option</p>
                            <button className='cash-on-btn' style={{ background: "linear-gradient(to right, #bdc3c7, #2c3e50)"}} onClick={() => handleConfirmation()}><p>Cash on Delivery</p></button>
                            <button className='cash-on-btn' style={{ background: "linear-gradient(to right, #2c3e50, #bdc3c7)"}} onClick={() => handlePaymentNote()}><p>Pay Now</p> <BsFillCreditCardFill style={{fontSize:"1.5em",marginLeft:"0.5em",color:"whitesmoke"}} /></button>
                            <Backdrop sx={{ color: '#fff',transition: "0.5s", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open1}>
                                 <div className="info-card">
                                    <div className="info-card-inner">
                                    <div className="info-upper">
                                        <h2 style={{color:"white",fontFamily:"Poppins",textAlign:"center",display:"flex"}}> <img src="https://www.freepnglogos.com/uploads/shopping-bag-png/shopping-bag-shopping-bags-transparent-png-svg-vector-8.png" alt="" style={{width:"45px",height:"45px"}} /> Payment Note</h2>
                                        <p style={{color:"white",fontFamily:"Poppins",textAlign:"center",fontSize:'0.8em'}}><b style={{color:"white"}}>Test Mode</b>.No money is deducted from the customer's account as this is a simulated transaction.</p>
                                        <p style={{color:"white",fontFamily:"Poppins",textAlign:"center",fontSize:"0.8em",fontWeight:"500"}}>Do not Enter your personal bank details,Be aware of Frauds make sure you Enter Fake data from below.</p>
                                    </div>
                                    <button style={{width:"90%",height:"auto",padding:"5px 0px",margin:"5px 0",border:"none",borderRadius:"8px",backgroundColor:'black',color:"white",fontFamily:"Poppins",textAlign:"center",fontSize:'1em',fontWeight:"600"}} disabled={true}>Payment options with details</button>
                                    <div className="info-middle">
                                      <div className="info-details">
                                          <p style={{color:"black",fontFamily:"Poppins",textAlign:"center",fontSize:"0.8em",fontWeight:"600"}}>For OTP Enter Any 6 digit number or Click on Complete payment on bank page.Don't Scan QR code.Don't Change the Phone number 9999999999 keep as it is.</p>
                                          <h3 style={{color:"black",fontFamily:"Poppins"}}>1.Netbanking</h3>
                                          <p style={{color:"black",fontFamily:"Poppins",fontSize:"0.8em"}}>You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment success or a failure.</p>
                                      </div>
                                      <div className="info-details">
                                        <h3 style={{color:"black",fontFamily:"Poppins"}}>2.UPI</h3>
                                        <h4 style={{color:"black",fontFamily:"Poppins"}}>You can enter one of the following UPI IDs:</h4>
                                        <p style={{color:"black",fontFamily:"Poppins",fontSize:"0.8em"}}><b>1: </b><b style={{color:"#33cc33"}}>success@razorpay</b></p>
                                      </div>
                                      <div className="info-details">
                                        <h3 style={{color:"black",fontFamily:"Poppins"}}>3.Wallet</h3>
                                        <p style={{color:"black",fontFamily:"Poppins",fontSize:"0.8em"}}>You can select any of the listed wallets. After choosing a wallet, Razorpay will redirect to a mock page where you can make the payment success or a failure.</p>
                                      </div>
                                      <div className="info-details">
                                        <h3 style={{color:"black",fontFamily:"Poppins"}}>4.Cards</h3>
                                        <p style={{color:"black",fontFamily:"Poppins",fontSize:"0.8em"}}>You can use one of the test cards to make transactions in the Test Mode. Enter any valid future date as the expiry date and any random CVV to create a successful payment.<b> Use this Test Cards</b></p>
                                        <table>
                                            <tr>
                                                <th>Card Network</th>
                                                <th>Domestic</th>
                                                <th>Card Number</th>
                                            </tr>
                                            <tr>
                                                <td>Mastercard</td>
                                                <td>Domestic</td>
                                                <td>5267 3181 8797 5449</td>
                                            </tr>
                                            <tr>
                                                <td>Visa</td>
                                                <td>Domestic</td>
                                                <td>4111 1111 1111 1111</td>
                                            </tr>
                                        </table>
                                      </div>
                                    </div>
                                    <div className="info-lower">
                                        <button style={{backgroundColor:"black",color:"white"}} onClick={() => handlePaymentNoteClose()}>Go back</button>
                                        <button style={{backgroundColor:"white",color:"black"}} onClick={() => proceedToPayment()}>Proceed to Pay</button>
                                    </div>
                                    <p style={{color:"blue",fontFamily:"Poppins",fontSize:"0.8em",textAlign:"center",fontWeight:"600"}}>* If you Enter your personal bank details purposely or mistakenly , we wont be responsible for act. *</p>
                                    </div>
                                  </div>
                            </Backdrop>
                        </div>
                        <p style={{width:'100%',height:"auto",textAlign:'center',fontSize:"1em",fontFamily:"Poppins",fontWeight:'600',marginBottom:"5px",color:"black"}}>Or</p>
                        <div className="confirm-cancel">
                            <button className='conf-can-order' style={{backgroundColor:'white',color:"black"}} onClick={() => handleClose()}>Cancel</button>
                        </div>
                    </div>
                 </div>
               </Backdrop>
          </div>
    </>
  )
}

export default CartPage
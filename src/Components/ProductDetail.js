import React, { useState , useEffect} from "react";
import { Link, useParams , useNavigate} from "react-router-dom";
import { Rating } from "react-simple-star-rating";
import {BsFillCreditCardFill} from "react-icons/bs"
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Recommend from "./Cards/recommend";
import { GrLocation } from "react-icons/gr";
import { ImLoop2, ImTruck } from "react-icons/im";
import { BsShieldFillCheck } from "react-icons/bs";
import { BiSupport } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";
import { Backdrop } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import moment from "moment";
import swal from "sweetalert";
import db from "../Backend/firebase/config";
import { auth } from "../Backend/firebase/config";
import { collection, getDoc, query, where, doc, setDoc, getDocs,addDoc} from 'firebase/firestore';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "../Components/css/ProductDetail.css";
import "../Components/css/ProceedCard.css";
import "../Components/css/infoCard.css"


const ProductDetail = () => {
const {id,category} = useParams();
const navigate = useNavigate();
const [productDetailData, setProductDetailData] = useState({})
const [recommendedCategoryData, setRecommendedCategoryData] = useState([])
const [description, setDescription] = useState([])
const [open, setOpen] = useState(false)
const [open1, setOpen1] = useState(false)


 // get the discount amount
 const discountAmount = productDetailData.MRP - ((productDetailData.MRP * productDetailData.discount) / 100).toFixed();
  // set the quantity till 10
  const [quantity, setQuantity] = useState(1);
  const Qty = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const handleQty = (event) => {
    setQuantity(event.target.value);
  };


// if user exists user can access addtocart and buy now 
// else prompt of sign in component and redirect to sign in page
const [user, setUser] = useState()
const [uid, setUid] = useState()
const [userInfo, setUserInfo] = useState({})
const userAuthentication = () => {
  auth.onAuthStateChanged((user) => {
    if(user){
      setUser(user);
      setUid(user.uid);
    } else {
      setUser();
      setUid();
    }
  })
}

// get user info to display
const getUserInfo = async() => {
  const ref = doc(db,`Users/${uid}`)
  const docRef = await getDoc(ref);
  if (docRef.exists) {
     setUserInfo({...docRef.data()})
  } else {
    setUserInfo({})
    console.log("No user found");
  }
}

const getTotalPrice = discountAmount * quantity > 1000 ? discountAmount * quantity : discountAmount * quantity + 85
// add to cart functionality
const addToCart = async (item) =>{
  if(user){
        await setDoc(doc(db,`Users/${uid}/Cart`,id),{
          title: item.title,
          img: item.img,
          MRP: item.MRP,
          discount: item.discount,
          price: discountAmount,
          qty: quantity,
          TotalPrice : getTotalPrice,
          type: "AddToCart"
        })
        .then(() => {
          toast.success("Added Successfully",{autoClose:2000});
        })
        .catch((err) => {
          toast.error(err.message);
        })
  }
    else{
      toast.error("Sign in first",{autoClose:1500})
      setTimeout(() => {
        toast.info("Redirecting to Sign in page",{autoClose:2000})
      }, 2000);
      setTimeout(() => {
        navigate("/SignIn")
      }, 5000);
  }
}

// buy now functionality
const buyNow = () => {
  if(user){
    if(userInfo.Address === "" || userInfo.City === "" || userInfo.Town === "" || userInfo.Pincode === ""){
      toast.error("Update Your profile first",{autoClose:2000})
      setTimeout(() => {
        toast.info("Redirecting to Update profile",{autoClose:2000})
      }, 2000);
      setTimeout(() => {
        navigate("/UpdateProfile")
      }, 4500);
    } else{
        toast.success("Proceeding to Checkout",{autoClose:2000})
        setTimeout(() => {
          setOpen(true)
        }, 2800);
    }
 } else{
  toast.error("Sign in first",{autoClose:1500})
  setOpen(false)
  setTimeout(() => {
    toast.info("Redirecting to Sign in page",{autoClose:2000})
  }, 2000);
  setTimeout(() => {
    navigate("/SignIn")
  }, 5000);
 }
}

// confirm prompt box to confirm the order
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
    amount : getTotalPrice,
    items: quantity,
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
  const itemData = {
    title: productDetailData.title,
    img: productDetailData.img,
    MRP: productDetailData.MRP,
    discount: productDetailData.discount,
    price: discountAmount,
    qty: quantity,
    TotalPrice : getTotalPrice,
    type: "BuyNow"
  }
  const shippingCharges = discountAmount * quantity > 1000 ? "Free Delivery" : "₹85"
  const ref = collection(db,`Users/${uid}/Orders`)
  const orderData = {
    OrderProduct : [itemData],
    OrderDeliveryDate : moment().add(3, "days").format("ll"),
    OrderDate: moment().format('MMMM Do YYYY, h:mm:ss a'),
    OrderCancellationDate: moment().add(2, "days").format("ll"),
    TotalItems: itemData.qty,
    TotalPayment : itemData.TotalPrice,
    Status: "Not Yet Shipped",
    PaymentDetails : PaymentDetails,
    PaymentType: paymentType,
    ShippingCharges : shippingCharges,
  }
    await addDoc(ref,orderData)
    .then(() => {
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

// using id get single doc
const getSingleDoc = async () => {
  const docRef = doc(db,"Products",id)
     const docSnap = await getDoc(docRef);
     if (docSnap.exists) {
        setProductDetailData(docSnap.data());
        setDescription(docSnap.data().description);
    } else {
       alert("No such document!");
    }
}

const pushUserToTop = () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0; 
}

// using category get the docs for recommended section
const getRecommendedCategoryListsData = async () => {
  const ref = query(collection(db, "Products"), where("category","==",category))
  const docRef = await getDocs(ref) 
  const recommendedData = []
  docRef.docs.forEach((doc) => {
    recommendedData.push({...doc.data(), id: doc.id})
  })
  setRecommendedCategoryData(recommendedData)
}

useEffect(() => {
  userAuthentication()
},[user])

useEffect(() =>{
  getSingleDoc()
  getUserInfo()
})

useEffect(() => {
  getRecommendedCategoryListsData()
},[])


  const RDWS = [
    {
      icon: <ImLoop2 />,
      title: "7 Days Replacement",
    },
    {
      icon: <ImTruck />,
      title: "Scheduled Delivery",
    },
    {
      icon: <BsShieldFillCheck />,
      title: "1 Year Warranty",
    },
    {
      icon: <BiSupport />,
      title: "Customer Care",
    },
  ];

  const [rating, setRating] = useState(0); // initial rating value
  const [ratingCounting, setRatingCounting] = useState(productDetailData.ratingCount); // initial rating count value

  // Catch Rating value
  const handleRating = (rate = Number) => {
    const ratingMsg1 = document.getElementById("ratingMsg1");
    const ratingMsg2 = document.getElementById("ratingMsg2");
    setRating(rate);
    setRatingCounting(productDetailData.ratingCount + 1);
    ratingMsg1.innerText = `Thank you for rating ${rate / 20}`;
    ratingMsg2.innerText = `Thank you for rating ${rate / 20}`;
  };


  return (
    <>
       <div className="product-detail-page" key={id}>
        <div className="product-detail-title1">{productDetailData.title}</div>
        <div className="product-detail-rating1">
          <p>
            <Rating onClick={handleRating} ratingValue={rating} allowHalfIcon={true}size="1.4em"/>
          </p>
          <p id="ratingMsg1" className="rating-msg">
            Rate this product
          </p>
          <p className="total-rating">{rating === 0 ? productDetailData.ratingCount : ratingCounting} rating</p>
        </div>
        <div className="product-detail-img">
          <img src={productDetailData.img} title={productDetailData.title} alt="" />
        </div>
        <div className="product-detail">
          <div className="product-detail-title2">{productDetailData.title}</div>
          <div className="product-detail-rating2">
            <p>
              <Rating onClick={handleRating} ratingValue={rating} allowHalfIcon={true} size="1.6em"/>
            </p>
            <p id="ratingMsg2" className="rating-msg">
              Rate this product
            </p>
            <p className="total-rating">{rating === 0 ? productDetailData.ratingCount : ratingCounting} rating</p>
          </div>
          <hr className="separator-line"></hr>
          <div className="product-detail-price">
            {
              productDetailData.discount === 0 ?
                <p className="mrp">
                  MRP: ₹{productDetailData.MRP}
                </p>             
               :
              <>
                <p className="mrp">
                  MRP: <del style={{fontFamily:"Arial"}}>₹{productDetailData.MRP}</del>
                </p>
                <p className="deal-of-the-day">
                  Deal of the Day :{" "}
                <strong style={{ color: "#cc0000", fontWeight: "500",fontFamily:"Arial"}}>₹{discountAmount}</strong>
              </p>
              <span className="product-discount">
                <p style={{color: "#404040",fontSize: "1em",fontFamily: "sans-serif",}}>
                  You save :{" "}
                  <b style={{ color: "#cc0000", fontWeight: "400" }}>
                    ₹{productDetailData.MRP - discountAmount} ({productDetailData.discount}%)
                  </b>
                </p>
              </span>
            </>
            }
            <p style={{fontSize:"0.85em",fontFamily:"Poppins",color:"black"}}>(Inclusive of all taxes)</p>
            {discountAmount * quantity > 1000 ? (
              <div className="free-delivery">
                <p style={{color: "white",fontSize: "1em",fontFamily: "sans-serif",padding: "3px 0 0 5px",}}>
                  <FaCheckCircle /> FREE Delivery
                </p>
              </div>
            ) : (
              <div className="free-delivery">
                <p style={{color: "white",fontSize: "1em",fontFamily: "sans-serif",padding: "3px 0 0 5px",}}>
                  <FaCheckCircle /> Shipping charges : ₹85
                </p>
              </div>
            )}
            <p style={{fontFamily:"sans-serif",fontSize:"1em"}}>(Above ₹1000 Free delivery)</p>
          </div>
          <hr className="separator-line"></hr>
          <div className="product-detail-description">
            <h3>About Product</h3>
            <ul>
              {
                description.map((data,index) => {
                  return <li key={index}>{data}</li>
                })
              }
            </ul>
          </div>
          <div className="product-detail-price-address">
            {discountAmount * quantity > 1000 ? (
              <>
                <p style={{fontSize: "1.1em",fontFamily: "sans-serif",fontWeight: "600",padding: "5px",}}>
                  Total : {""}
                  <strong style={{ fontSize: "1.2em" }}>
                    ₹{discountAmount * quantity}
                  </strong>
                </p>
                <div className="product-detail-time">
                  <p className="delivery-state">
                    <ImTruck /> FREE Delivery :{" "}
                  </p>
                  <p className="delivery-time">
                    {moment().add(3, "days").format("ll")} (8am - 10pm)
                  </p>
                </div>
              </>
            ) : (
              <>
                <p style={{fontSize: "1.1em",fontFamily: "sans-serif",fontWeight: "600",padding: "5px",}}>
                  Total :{" "}
                  <strong style={{ fontSize: "1.2em" }}>
                    ₹{discountAmount * quantity + 85}
                  </strong>{" "}
                  (Price + Shipping Charges)
                </p>
                <div className="product-detail-time">
                  <p className="delivery-state">
                    <ImTruck /> Shipping Charges ₹85 :{" "}
                  </p>
                  <p className="delivery-time">
                    {moment().add(3, "days").calendar()} (8am - 10pm)
                  </p>
                </div>
              </>
            )}
            {
              // if user has sign in show the address and if not tell to update
              !user ? (
                <div className="product-address">
                  <p
                    style={{color: "#0033cc",cursor: "pointer",fontSize: "1.2em",}}>
                    <GrLocation /> Sign in 
                  </p>
                </div>
              ) : (
                <div className="product-address">
                  <p style={{color: "#0033cc",cursor: "pointer",fontSize: "1.2em",}}>
                    <GrLocation /> Deliver to {userInfo.FirstName+" "+userInfo.LastName} :
                  </p>
                  <p style={{ color: "black", fontSize: "1.1em" }}>
                    {userInfo.Address === "" || userInfo.City === "" || userInfo.Town === "" || userInfo.Pincode === "" ? 
                       <Link style={{textDecoration:"none"}} to="/UpdateProfile">
                         <button style={{width:"125px",height:"32px",fontSize:"0.85em",fontFamily:"Poppins",fontWeight:"600",backgroundColor:"black","boxShadow":"rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",border:"none",outline:"none",color:"white",borderRadius:"8px",cursor:"pointer"}} title="Update your profile to view Address">Update Profile</button>
                       </Link>
                    :
                     `${userInfo.Address}, ${userInfo.Town}, ${userInfo.City} - ${userInfo.Pincode}`
                    } 
                  </p>
                </div>
              )
            }
          </div>
          <div className="product-detail-size-qty-data">
            <div className="product-detail-Quantity" style={{ width: "110px", height: "50px", marginTop: "15px" }}>
              <FormControl style={{ width: "110px", height: "50px" }}>
                <InputLabel style={{fontSize: "1.3em",fontWeight: "600",color: "black",fontFamily: "Poppins",}}>
                  Qty
                </InputLabel>
                <Select value={quantity} label="Qty" onChange={handleQty} style={{ height: "50px" }}>
                  {Qty.map((data, index) => {
                    return (
                      <MenuItem value={data} key={index}>
                        {data}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
         </div>
          <div className="product-detail-add-buy">
            <button className="add-to-cart-btn" onClick={() => addToCart(productDetailData)}>Add to Cart</button>
            <button className="buy-now-btn" onClick={() => buyNow(productDetailData)}>Buy Now</button>
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
                                Total Items : {quantity}
                            </div>
                            <div className="proceed-card-product-qp">
                                Total Price : ₹{getTotalPrice}
                            </div>
                        </div>
                        <div className="proceed-card-user-address">
                            <p style={{color: "#0033cc",cursor: "pointer",fontSize: "1em",fontFamily:"Arial",fontWeight:'600',width:"100%",height:"22px",display:'flex',justifyContent:"start"}}>
                                <GrLocation style={{fontSize:"1.2em"}}/> <p>Deliver to :</p>
                            </p>
                            <p style={{fontSize:'0.9em',fontFamily:"Arial",fontWeight:"500",color:"black",paddingLeft:'5px',width:"100%",height:"auto"}}>
                              {userInfo.Address === "" || userInfo.City === "" || userInfo.Town === "" || userInfo.Pincode === "" ? 
                                "To Update Profile go to Your Account"
                                :
                                `${userInfo.Address}, ${userInfo.Town}, ${userInfo.City} - ${userInfo.Pincode}`
                              } 
                            </p>
                        </div>
                        {
                          discountAmount * quantity > 1000 ? 
                          <p className='proceed-card-product-delivery-state'>
                          <ImTruck/> Free Delivery
                          </p>
                          :
                          <p className='proceed-card-product-delivery-state'>
                          <ImTruck/> Shipping Charges ₹85(included in Totalprice)
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
          <div className="product-detail-RDWS">
            {RDWS.map((elem, index) => {
              return (
                <div className="RDWS" key={index}>
                  <div className="rdws-icon">{elem.icon}</div>
                  <div className="rdws-info">{elem.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>



      {/* product related to this item component for user to choose other product from same category  */}

      <div className="recommend-comp">
        <div style={{width:"100%",height:"45px",fontSize:"1.38em",fontWeight:"600",fontFamily:"Poppins",padding:"9px",backgroundColor:"white"}}>Products related to this item</div>
        <div className="product-related-to-item">
          <ul>
          {
            recommendedCategoryData.length === 0 ? 
            <div className="loading">
              <CircularProgress/>
            </div>
            :
            recommendedCategoryData && recommendedCategoryData.map((data) => {
             return <li key={data.id} onClick={() => pushUserToTop()}>
                        <Link to={`/Category/${category}/${data.id}`} style={{textDecoration:"none"}}>
                          <Recommend product={data} key={data.id}/>
                        </Link>
                    </li>
            })

          }
          </ul>
        </div>
      </div>
    </> 
  );
};


export default ProductDetail;

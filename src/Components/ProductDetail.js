import React, { useState , useEffect} from "react";
import { Link, useParams , useNavigate} from "react-router-dom";
import { Rating } from "react-simple-star-rating";
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
import db from "../Backend/firebase/config";
import { auth } from "../Backend/firebase/config";
import { collection, getDoc, query, where, doc, setDoc, getDocs,addDoc} from 'firebase/firestore';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "../Components/css/ProductDetail.css";
import "../Components/css/ProceedCard.css";



const ProductDetail = () => {

const {id,category} = useParams();
const navigate = useNavigate();
const [productDetailData, setProductDetailData] = useState({})
const [recommendedCategoryData, setRecommendedCategoryData] = useState([])
const [description, setDescription] = useState([])
const [open, setOpen] = useState(false)


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
      if(userInfo.Address === "" || userInfo.City === "" || userInfo.Town === "" || userInfo.Pincode === ""){
        toast.error("Update Your profile first",{autoClose:2500})
      } else {
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
      toast.error("Update Your profile first",{autoClose:2500})
    } else{
        toast.success("Proceeding to checkout",{autoClose:2000})
        setTimeout(() => {
          setOpen(true)
        }, 2500);
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

// proceed to checkout if confirmation successfully
const handleCheckoutProcess = async () =>{
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
    PaymentType: "Cash on Delivery",
    ShippingCharges : shippingCharges
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

useEffect(() => {
  getUserInfo()
})


useEffect(() => {
  getSingleDoc()
  getRecommendedCategoryListsData()
})


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

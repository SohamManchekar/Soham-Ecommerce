import React,{useState,useEffect} from 'react'
import db, { auth } from '../Backend/firebase/config';
import { collection, getDocs, orderBy, query,doc,deleteDoc, updateDoc} from 'firebase/firestore';
import UserCard from '../Components/Cards/UserCard';
import {FaBars,FaTruckMoving} from "react-icons/fa"
import {FcPackage} from "react-icons/fc";
import {MdDelete} from "react-icons/md";
import OrderCard from '../Components/Cards/OrderCard'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment';
import swal from 'sweetalert';
import "../Components/css/Accordian.css"
import 'react-toastify/dist/ReactToastify.css';
import "./css/Myaccount.css"
import { toast } from 'react-toastify';
import { Backdrop } from '@mui/material';
import PaymentDetails from '../Components/Cards/PaymentDetails';


const MyAccount = () => {

  const [uid, setUid] = useState()  // get user uid for user information to display to user
  const [orderCollection, setOrderCollection] = useState([])
  const [orderProductData, setOrderProductData] = useState([])
  const [open, setOpen] = useState(false)

  const handleViewPaymentDetails = () =>{
    setOpen(true)
  }

  const handleClosePaymentDetails = () =>{
    setOpen(false)
  }

  const userAuthentication = () => {
    auth.onAuthStateChanged((user) => {
      if(user){
        setUid(user.uid)
      } else {
        setUid()
      }
    })
  }

  const getUserOrderCollections = async () => {
      const ref = collection(db,`Users/${uid}/Orders`)
      const q = query(ref, orderBy("OrderDate","desc"))
      const docRef = await getDocs(q)
      const userOrderCollections = []
      const userProductData = []
      docRef.docs.forEach((doc) => {
        userOrderCollections.push({...doc.data(), id: doc.id})
      })
      setOrderCollection(userOrderCollections)
      docRef.docs.forEach((doc) => {
        userProductData.push(doc.data().OrderProduct)
      })
      setOrderProductData(userProductData)
  }

  const handleUserCardOpen = () =>{
    const myAccDetail = document.querySelector(".my-acc-details2")
    myAccDetail.style.left = 0
  }

  // delete the order 
  const handleCancelOrder = (id) =>{
    let text = "";
    orderCollection.map((order) => {
      if(id === order.id){
        if(order.PaymentType === "Online Transaction"){
          text = "You can cancel the order day before delivery date. Click OK to cancel order. Your Dummy Money will be Refunded within 5-7 working days."
        }else{
           text = "You can cancel the order day before delivery date. Click OK to cancel order."
        }
      }
      return text
    })
    swal({
      title: "Order Cancellation",
      text : text,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then(async(willDelete) => {
      if (willDelete) {
        const ref = doc(db, `Users/${uid}/Orders`,id)
        await deleteDoc(ref)
          swal(`OrderId : #${id} has been Cancelled Successfully`, {
            icon: "success",
          });
      } else {
        swal("Cancellation drop");
      }
    })
    .catch((err) => {
      toast.error(err.message)
    })
  }

  const updateStatus = async () => {
    let cancellationdate = ""
    let delDate = ""
    let id = ""
     orderCollection.map((product) => {
       return (cancellationdate = product.OrderCancellationDate, delDate = product.OrderDeliveryDate, id = product.id)
     })
     const ref = doc(db,`Users/${uid}/Orders`,id)
     if(moment().format('ll') === cancellationdate){
        await updateDoc(ref, {
          Status: "On the Way"
      })
     }
     if(moment().format('ll') === delDate){
       await updateDoc(ref,{
          Status: "Delivered"
       })
     }
  }

  useEffect(() => {
    userAuthentication();
    updateStatus();
 }); 

 useEffect(() => {
  getUserOrderCollections(); 
 }, [uid]) 

  return (
    <div className='my-acc'>
       <div className="my-acc-details1">
          <UserCard/>
       </div>
       <div className="my-acc-user-order-page">
        <div className="my-acc-order-bar">
            <button className='my-acc-order-bar-btn' onClick={() => handleUserCardOpen()}><FaBars/></button>
            {
              orderCollection.length === 0 ?
              <p>No Orders</p>
              :
              <p>Your Orders</p>
            }
        </div>
          <div className="order-page">
            <ul>
              { orderCollection && orderCollection.map((order,index) => {
                 return (
                  <li key={order.id}>
                    <div className='accordian-section' key={order.id}>
                          <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" className='accordian-display-head' key={order.id}>
                              <div className="order-id"><b style={{fontSize:'1.3em',color:"black"}}>OrderID</b> : #{order.id}</div>
                              {
                                order.Status === "Not Yet Shipped" ? 
                                <div className="order-status" style={{color:"#dd1818"}}>{order.Status}</div>
                                :
                                order.Status === "On the Way" ?
                                <div className="order-status" style={{color:"orange"}}>{order.Status}</div>
                                :
                                order.Status === "Delivered" ? 
                                <div className="order-status" style={{color:"#00ff00",marginRight:'0.5em'}}>{order.Status}</div>
                                :
                                null
                              }
                              {
                                order.Status === "Not Yet Shipped" ?
                                <button className='cancel-order-btn' onClick={() => handleCancelOrder(order.id)}>  
                                  <MdDelete style={{color:"red"}}/>
                                </button>
                                :
                                order.Status ===  "On the Way" ?
                                <button className='cancel-order-btn' onClick={() => toast.info("Delivery On the way",{autoClose:2500})}>  
                                  <FaTruckMoving style={{color:"orange"}} />
                                </button>
                                :
                                order.Status === "Delivered" ?
                                <button className='cancel-order-btn'>  
                                  <FcPackage/>
                                </button>
                                :
                                null
                              }
                               
                          </AccordionSummary>
                          <AccordionDetails>
                          <div className="order-details-section">
                              <div className="order-product-list">
                                  <ul>
                                      {
                                        orderProductData[index] && orderProductData[index].map((product) => {
                                             return <li key={product.id}><OrderCard key={product.id} data={product}/></li>                     
                                        }) 
                                      }
                                  </ul>
                              </div>
                              <div className="order-other-details">
                                  <div className="total-items-payment">
                                      <p style={{color:"black"}}>Total Items : <b style={{color:"#333"}}>{order.TotalItems}</b></p>
                                      <p style={{color:"black"}}>Total Payment : <b style={{color:"#333"}}>₹{order.TotalPayment}</b></p>
                                  </div>
                                  <div className="orderDate-deliveryDate">
                                      <p>Order Date : {order.OrderDate}</p>
                                      <p>Delivery Date : {order.OrderDeliveryDate} (8am - 10pm)</p>
                                  </div>
                                  <div className="paymentType-shippingCharges">
                                      {
                                        order.PaymentType === "Online Transaction" ?
                                        <>
                                        <p>Payment : <button style={{width:"auto",height:"auto",backgroundColor:"black",color:"white",border:"none",borderRadius:"5px",fontSize:"1em",fontWeight:"500",padding:"3px 10px",cursor:"pointer"}} onClick={() => handleViewPaymentDetails()}>View</button></p>
                                        <Backdrop sx={{ color: '#fff',transition: "0.5s", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
                                          <PaymentDetails close={handleClosePaymentDetails} data={order.PaymentDetails} />
                                        </Backdrop>
                                        </>
                                        :
                                        <p>Payment : {order.PaymentType}</p>
                                      }
                                      {
                                        order.TotalPayment > 1000 ?
                                        <p>Shipping Charges : {order.ShippingCharges}</p>
                                        :
                                        <p>Shipping Charges : {order.ShippingCharges}</p>
                                      }
                                  </div>
                              </div>
                          </div>
                          </AccordionDetails>
                          </Accordion>
                      </div>
                   </li>
                  )
               })
              }
            </ul>
          </div>
       </div>
       <div className="my-acc-details2">
              <UserCard/>
        </div>
    </div>
  )
}

export default MyAccount
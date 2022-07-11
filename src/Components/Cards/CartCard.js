import React,{useState,useEffect} from 'react'
import moment from "moment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Menu from '@mui/material/Menu';
import { FaStar,FaRegStar } from "react-icons/fa";
import {BiDotsVerticalRounded} from "react-icons/bi";
import {MdEdit,MdDelete} from "react-icons/md";
import { Backdrop } from "@mui/material";
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import db, {auth} from '../../Backend/firebase/config';
import "../css/CartCard.css";
import { toast } from 'react-toastify';

const CartCard = ({product}) => {

  const [id, setId] = useState()
  const [uid, setUid] = useState()
  const userAuthentication = () => {
    auth.onAuthStateChanged((user) => {
      if(user){
        setUid(user.uid)
      } else {
        setUid();
      }
    })
  }

  // open and close setting
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleSettingOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleSettingClose = () => {
    setAnchorEl(null);
  };
    
  // after clicking on setting choose option edit to make change in quantity.
    const discountAmount = product.MRP - ((product.MRP * product.discount) / 100).toFixed();
    const [quantity, setQuantity] = useState(product.qty);
    const Qty = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const handleQty = async(event) => {
      setQuantity(event.target.value)
      const ref = doc(db, `Users/${uid}/Cart/${id}`)
      await updateDoc(ref,{
        qty: event.target.value,
        TotalPrice: product.price * event.target.value
      })
      .then(() => {
        toast.success("Updated",{autoClose:2500})
      }).catch((err) => toast.error(err.message,{autoClose:2500}))
    }; 

    // after clicking on edit button .Quantity box will be open to modify the qty.
    const [openQty, setopenQty] = useState(false)
    const handleCloseEdit = () => {
      setopenQty(false);
    };
    const handleOpenEdit = (id) => {
      setopenQty(true)
      setAnchorEl(null)
      setId(id)
    }
   
    const handleDelete = async(id) => {
      const ref = doc(db, `Users/${uid}/Cart`,id)
      await deleteDoc(ref)
            .then(() => {
              toast.success("Item Removed",{autoClose:2500})
            })
            .catch((err) =>{
              toast.error(err.message,{autoClose:2500})
            })
      setAnchorEl(null)
    }

    useEffect(() => {
      userAuthentication()
    },[])
    

  return (
    <div className='cart-card-body'>
      <div className="cart-card-img">
          <img src={product.img} alt={product.title} title={product.title} />
      </div>
      <div className="cart-card-details">
          <div className="cart-card-title-setting">
            <div className="cart-card-title">{product.title.slice(0,110)}...</div>
            <button className='setting-btn' id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleSettingOpen}>
                <BiDotsVerticalRounded/>
            </button>
            <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleSettingClose} MenuListProps={{'aria-labelledby': 'basic-button'}}>
              <MenuItem style={{width:"100%",fontSize:'1em',fontFamily:"Arial",color:"black"}} onClick={() => handleOpenEdit(product.id)}>Update <MdEdit style={{fontSize:"1.3em",color:"black",marginLeft:'9px'}} /></MenuItem>
              <MenuItem style={{width:"100%",fontSize:'1em',fontFamily:"Arial",color:"black"}} onClick={() => handleDelete(product.id)}>Remove <MdDelete style={{fontSize:"1.4em",color:"#e60000"}} /></MenuItem>
            </Menu>
          </div>
                <div className="cart-card-star-rating">
                    <FaStar className='cart-card-star-size'/>
                    <FaStar className='cart-card-star-size'/>
                    <FaStar className='cart-card-star-size'/>
                    <FaStar className='cart-card-star-size'/>
                    <FaRegStar className='cart-card-star-size'/>
                    <p className='cart-card-ratingcount'>{product.rate}</p>
                </div>
                <div className="cart-card-product-mrp-price-off">
                  <p className="cart-card-product-price">₹{discountAmount}</p>
                  <del className="cart-card-product-mrp">₹{product.MRP}</del>
                  <p className="cart-card-product-discount">({product.discount}% off)</p>
                </div>
                <div className="cart-card-product-qty">
                  Qty : {product.qty}
                </div>
                <Backdrop sx={{ color: '#fff',transition: "0.5s", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={openQty} onClick={handleCloseEdit}>
                  <div style={{width:"200px",height:"150px",backgroundColor:"white",display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"10px"}}>
                    <div style={{ width: "110px", height: "50px", marginTop: "15px"}}>
                      <FormControl style={{ width: "110px", height: "50px" }}>
                        <InputLabel
                          style={{fontSize: "1.3em",fontWeight: "600",color: "black",fontFamily: "Poppins",}}>
                          Qty
                        </InputLabel>
                        <Select value={quantity} label="Qty" onChange={handleQty} style={{ height: "50px" }}>
                          {Qty && Qty.map((data, index) => {
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
               </Backdrop>
            <div className="cart-card-product-delivery-date">
               <p className='cart-card-get-it-by'>Get it by</p> <p className='cart-card-delivery-date'>{moment().add(3, "days").format("ll")}</p>
            </div>
            {discountAmount * quantity > 1000 ? 
              <p className='cart-card-product-delivery-state'>Free Delivery</p> : <p className='cart-card-product-delivery-state'> Shipping Charges ₹85</p>
            }
      </div>
    </div>
  )
}

export default CartCard
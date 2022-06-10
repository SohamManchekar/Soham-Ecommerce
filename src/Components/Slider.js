import { Swiper, SwiperSlide } from "swiper/react";
import {SliderData} from "../Backend/DB/HomepageData";
import { Link } from "react-router-dom";
import "./css/Slider.css";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { EffectFade, Navigation, Pagination } from "swiper";

const Slider = () => {
  return (
    <>
     <Swiper
        spaceBetween={30}
        effect={"fade"}
        navigation={true}
        pagination={{
          clickable:true
        }}
        modules={[EffectFade, Navigation, Pagination]}
        className="mySwiper"
      >
       {
         SliderData && SliderData.map((data,index) => {
           return (
            <SwiperSlide key={index}>
              <img src={data.img} alt=""/>
              <div className="slider-content">
                <div className="slider-title" style={{color:data.color1}}>{data.title}</div>
                <div className="slider-desc" style={{color:data.color2}}>{data.desc}</div>
                <div className="slider-discount" style={{color:data.color3}}>{data.discount}</div>
                <div className="slider-view-more">
                  <Link to={`/Category/${data.category}`} style={{textDecoration:"none"}}><button className="slider-btn">View more</button></Link>
                </div>
              </div>
            </SwiperSlide>
           )
         })
       }
      </Swiper>
    </>
  );
}

export default Slider
import React,{useState} from 'react'

const Countdown = () => {

  const [countDown, setCountDown] = useState({
    d: "",
    hr: "",
    min: "",
    sec: ""
  })
        // set the date 
      const countDownDate = new Date("july 5, 2022 00:00:00").getTime();
        // Update the count down every 1 second
       const x = setInterval(function() {
            const now = new Date().getTime();
            // Find the distance between now and the count down date
            const distance = countDownDate - now;
                
            // Time calculations for days, hours, minutes and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
            // Output the result 
          setCountDown({
            d: days,
            hr: hours,
            min: minutes,
            sec: seconds
          })

          const countdownDeal = document.getElementById("countdownDeal")
          if(countDown.d === 0 && countDown.hr === 0 && countDown.min === 0 && countDown.sec === 0){
            countdownDeal.innerHTML = "Expired"
          }
                
    }, 1000);

  return (
    <div className='count-down' id='countdownDeal' style={{fontSize:"0.8em",fontFamily:"Poppins",padding:"20px 2px 0 2px",fontWeight:"600",color:"red"}}>
      {`${countDown.d}d ${countDown.hr}hr ${countDown.min}min ${countDown.sec}sec`}
    </div>
  )
}

export default Countdown
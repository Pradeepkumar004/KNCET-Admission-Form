import React from "react";
import Logo from "../assets/kongunadulogo.png"
const Sucess = () => {
    const handleHome = () => {
        window.location.href = "/";
    }
    return (
        <>
            <div className="grid justify-center gap-5 text-center py-9">
                <div>
                    <img src={Logo} className="ml-30" />
                     </div>
                <h1 className="text-3xl font-bold">Submitted Successfully!</h1>
                <h1>Your admission details have been recorded</h1>
                <h1 className="text-2xl font-bold">Enquiry ID</h1>
                <input type="text" placeholder="1234567890-567" className="p-1 border font-bold text-2xl text-center" />
                <div>
                    <div className="flex justify-center gap-5">
                <button type="submit" className="bg-blue-500 p-2 rounded  text-white font-semibold" >Download Receipt</button>
                <button type="button" className="bg-blue-500 p-2 rounded text-white font-semibold" onClick={handleHome}>Go to Home</button>
                </div>
                </div>

            </div>
        </>
    )
}
export default Sucess;
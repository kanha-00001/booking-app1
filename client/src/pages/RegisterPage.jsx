import React, { useState } from 'react'
import "../pages_ka_css/Loginpage.css"
import { Link } from 'react-router-dom'
import axios from "axios";

export default function LoginPage() {
    const [name,setName] = useState('');
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
   
    const handleOnChange = (event)=>{
        console.log("on change");
        setName(event.target.value);
       };
         
       async function registerUser(ev) {
        ev.preventDefault(); // it will not reload the page
        try {
           await axios.post("/register", {
            name,
            email,
            password
          });
          windows.location="/login";
          alert("registration succesfull")
          console.log("registration succesfull");
          
        } catch (error) {
          console.error('Registration error:', error);
          alert('Registration failed. Please try again.');
        }
      }
    
  return (
    <div>
    <div className='login'>
      <h1>Register</h1>
      <form  onSubmit={registerUser}>
        <input type='text' placeholder='username' value={name} onChange={handleOnChange}></input>
        <input type="email" placeholder="put your email here" value={email} onChange={ev => setEmail(ev.target.value)} />
        <input type='password' placeholder='password' value={password} onChange={ev => setPassword(ev.target.value)} />
        <button>Register</button>
        <div className='text-center py-2'>Already have an account?<Link to={"/login"} className='registery'>Login Now</Link> </div>
        
      </form>
    </div>
    </div>
  )
}

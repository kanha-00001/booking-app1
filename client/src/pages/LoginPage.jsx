import react, { useContext, useState } from "react";
import { UserContext } from "../UserContext"; 

import "../pages_ka_css/Loginpage.css";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState('');
  const {setUser} = useContext(UserContext);

  async function handlelogin(ev) {
    ev.preventDefault(); // it will not reload the page
    try {
      const response = await axios.post("/login", {
        email,
        password,
      },{withCredentials: true});
      setUser(response.data);
      setRedirect(true);
    } catch (e) {
      alert("fully login failed");
    }
  }
  if(redirect){
    alert('login succesfull');

    return <Navigate to ={"/"}></Navigate>
  }

  return (
    <div>
      <div className="login">
        <h1>Login</h1>
        <form onSubmit={handlelogin}>
          <input
            type="email"
            placeholder="put your email here"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <button>Login</button>
          <div className="text-center py-2">
            Not yet registered?
            <Link to={"/register"} className="registery">
              Get Registered
            </Link>{" "}
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useFirebase } from "../context/firebase.jsx";
//import { useNavigate } from "react-router-dom";

 const LoginPage = () => {
    const { singinUserWithEmailAndPass, signinWithGoogle } = useFirebase();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    //const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        await singinUserWithEmailAndPass(email, password);
        //navigate("/login");
      } catch (err) {
        setError(err.message);
      }
    };
  
    return (
      <div className="auth-container">
        <h2>Log In</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
        </form>
        <button onClick={signinWithGoogle} className="google-btn">
          Continue with Google
        </button>
        <p>Do not have an account? <a href="/signup">Sign up</a></p>
      </div>
    );
  };
  
  export default LoginPage;
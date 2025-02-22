
import  { useState } from "react";
import { useFirebase } from "../context/firebase.jsx";
//import { useNavigate } from "react-router-dom";

 const  SignupPage = () => {
  const { signupUserWithEmailAndPassword, signinWithGoogle } = useFirebase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  //const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signupUserWithEmailAndPassword(email, password);
      //navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSignup}>
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
        <button type="submit">Sign Up</button>
      </form>
      <button onClick={signinWithGoogle} className="google-btn">
        Continue with Google
      </button>
      <p>Already have an account? <a href="/login">Log in</a></p>
    </div>
  );
};

export default SignupPage;
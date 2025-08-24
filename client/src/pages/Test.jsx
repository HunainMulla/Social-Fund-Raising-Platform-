import React, { useState, useEffect } from 'react'

const Test = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");



    const handleLogin = async () => {
        console.log(email, password);

        const data = fetch("http://localhost:3000/auth/login",{ 
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({email,password})
        })

        const response = await data.json();
        alert(response.message);
    }

    return (
        <>
            <div>
                <input type="text" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Ebert tgge name od rge user" />
                <input type="text" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Enter the password" />

                <button onClick={() => handleLogin()}>Login</button>

            </div>
        </>
    );

}

export default Test;
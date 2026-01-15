import{
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    doc,
    setDoc,
    getDoc
}from "./firebase.js";


const signupBtn = document.getElementById("signupBtn");

if(signupBtn){
    signupBtn.onclick = async ()=>{
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        if(!name || !email || !password){
            alert("Fill all fields");
            return;
        }

        try{
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCred.user.uid;

            await setDoc(doc(db, "users", uid), {
                name,
                email,
                role,
                verified: role === "vendor" ? false : true,
                createdAt: Date.now()
            });

            alert("Account created!");
            window.location.href = "./login.html";

        }catch(err){
            alert(err.message);
        }
    };
}


const loginBtn = document.getElementById("loginBtn");

if(loginBtn){
    loginBtn.onclick = async ()=>{
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if(!email || !password){
            alert("Enter email and password");
            return;
        }

        try{
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCred.user.uid;

            const snap = await getDoc(doc(db, "users", uid));

            if(!snap.exists()){
                alert("User data not found");
                return;
            }

            const user = snap.data();

            if(user.role === "admin"){
                window.location.href = "./adminDashboard.html";
            }
            else if(user.role === "vendor"){
                window.location.href = "./vendorDashboard.html";
            }
            else{
                window.location.href = "./home.html";
            }

        } catch(err){
            alert(err.message);
        }
    };
}

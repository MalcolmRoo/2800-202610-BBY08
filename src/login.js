var modeChange = document.getElementById('changeMode');
var loginForm = document.getElementById('loginForm');
var signUpForm = document.getElementById('signUpForm');
var message = document.getElementById('message');

modeChange.addEventListener('click', () => {
    if(loginForm.style.display === "none"){
        loginForm.style.display = "block";
        signUpForm.style.display = "none";
        modeChange.textContent = "Sign up";
        message.textContent = "Don't have an account?";
    } else {
        loginForm.style.display = "none";
        signUpForm.style.display = "block";
        modeChange.textContent = "Login";
        message.textContent = "Already have an account?";
    }
});
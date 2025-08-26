const email = "rightderivedfunctor@gmail.com";

const link = document.createElement("a");
link.href = "mailto:" + email;
link.textContent = email;

document.getElementById("email").appendChild(link);

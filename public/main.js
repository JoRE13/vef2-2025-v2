let clicked = false;

try {
    const buttonElement = document.querySelector(".show-ans");
    buttonElement.addEventListener("click", () => {
        if (clicked === false) {
          document.documentElement.style.setProperty(
            "--true-ans",
            "#008000"
          );
          document.documentElement.style.setProperty(
            "--wrong-ans",
            "#800020"
          );
          clicked = true;
          buttonElement.textContent = "Fela svör";
        } else {
          document.documentElement.style.setProperty("--true-ans", "#000");
          document.documentElement.style.setProperty("--wrong-ans", "#000");
          clicked = false;
          buttonElement.textContent = "Sýna svör";
        }
      });
} catch(e){

}
const validateField = (name: string, value: string) => {
  switch (name) {
    //Display error message if the name textbox is empty or contains less than 3 charcters
    case "inputUrl":
      if (value.length === 0) {
        return "url is required";
      }
      //if not empty and more that 3 charcters,then entered data is updated in formData
      return "";
    case "email":
      //Display error message if the email is empty or not in correct format, using regular expression.
      if (!value) {
        return "Email is required";
      }
      if (!/\S+@\S+\.\S+/.test(value)) {
        return "Email is invalid";
      }
      //if not empty and correct email format, then entered data is updated in formData
      return "";
    case "password":
      if (!value) {
        return "Password is required";
      }
      if (value.length < 8) {
        return "Password must be at least 8 characters";
      }
      return "";
    case "confirmPassword":
      if (!value) {
        return "Confirm Password is required";
      }
      return "";
    case "originalUrl":
      if (value.length === 0) {
        return `${name} can't be empty.`;
      }
      return "";
    case "customDomain": 
      if (value.length === 0) {
        return `${name} can't be empty.`;
      }
      return "";
    case "country":
      if (!value) {
        return "Country is required";
      }
      return "";
    default:
      return "";
  }
};
export default validateField;

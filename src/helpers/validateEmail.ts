export const validateEmail = (email: string) => {
  if (!email) {
    return "Email is required";
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(email)) {
    return "Email is not valid";
  }
};

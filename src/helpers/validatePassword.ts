export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "At least 6 characters";
  }
};

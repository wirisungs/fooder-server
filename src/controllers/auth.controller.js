//Genearte unique user ID
const generateUserId = async () => {
  const prefix = "ND";
  let isUnique = false;
  let userId = "";

  while (!isUnique) {
      const random = Math.floor(10000000 + Math.random() * 90000000);
      userId = `${prefix}${random}`;
      const existingUser = await User.findOne({ userId });
      if(!existingUser) {
        isUnique = true;
      }
  }

  return userId;
};

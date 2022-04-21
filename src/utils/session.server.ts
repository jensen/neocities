import bcrypt from "bcryptjs";
import db from "../services/db.server";

export const login = async (email: string, password: string) => {
  const [user] = await db(`select * from owners where owners.email = $1`, [
    email,
  ]);

  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db(
      `insert into owners (email, password) values ($1, $2) returning id`,
      [email, passwordHash]
    );

    return user;
  } else {
    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      throw new Error("Incorrect Password");
    }

    return user;
  }
};

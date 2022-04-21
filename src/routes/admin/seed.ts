import db from "../../services/db.server";
import hoods from "../../../data/hoods.json";

export const loader = async () => {
  for (const hood of hoods) {
    const {
      rows: [{ id }],
    } = await db(
      `insert into hoods (name, description) values ($1, $2) returning id`,
      [hood.name, hood.description]
    );

    const values = Array(10000)
      .fill(null)
      .map((_, index) => index)
      .slice(1000);

    let query = "insert into addresses (number, hood_id) values ";
    query += values.map((value) => `(${value}, $1)`).join(", ");

    await db(query, [id]);
  }

  return {};
};

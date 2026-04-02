import bcrypt from "bcryptjs";

async function main() {
  const senha = "1234";
  const hash = await bcrypt.hash(senha, 10);
  console.log("HASH:", hash);
}

main();
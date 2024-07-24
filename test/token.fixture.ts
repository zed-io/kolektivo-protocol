import { ethers } from "hardhat";

import { KolektivoTTD, KolektivoTTD__factory } from "../types";

export async function deployTokenFixture() {
  // Contracts are deployed using the first signer/account by default
  const [_] = await ethers.getSigners();
  const Token = (await ethers.getContractFactory("KolektivoTTD")) as KolektivoTTD__factory;
  const token = (await Token.deploy()) as KolektivoTTD;
  const token_address = await token.getAddress();

  return { token, token_address };
}

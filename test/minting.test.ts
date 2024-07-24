import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployTokenFixture } from "./token.fixture";
import { Signers } from "./types";

describe("Minting", function () {
  before(async function () {
    this.signers = {} as Signers;
    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.loadFixture = loadFixture;
  });

  describe("Initial State", function () {
    beforeEach(async function () {
      const { token, token_address } = await this.loadFixture(deployTokenFixture);
      this.token = token;
      this.token_address = token_address;
    });

    it("owner is the community steward");

    it("should allow the community steward to mint to themselves", async function () {
      const initialSupply = await this.token.totalSupply();
      await this.token.mint(this.signers.admin.address, 100);
      expect(await this.token.totalSupply()).to.equal(initialSupply + 100n);
    });

    it("should allow the community steward to mint to others", async function () {
      const [_, newOwner] = await ethers.getSigners();
      const initialSupply = await this.token.totalSupply();
      await this.token.mint(newOwner.address, 100);
      expect(await this.token.totalSupply()).to.equal(initialSupply + 100n);
    });

    it("should not allow non-comunity stewards to mint", async function () {
      const [_, nonOwner] = await ethers.getSigners();
      await expect(this.token.connect(nonOwner).mint(nonOwner.address, 100)).to.be.reverted;
    });
  });
});

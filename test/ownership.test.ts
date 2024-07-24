import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployTokenFixture } from "./token.fixture";
import { Signers } from "./types";

describe("Ownership", () => {
  before(async function () {
    this.signers = {} as Signers;
    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.loadFixture = loadFixture;
  });

  describe("Initial State", () => {
    beforeEach(async function () {
      const { token, token_address } = await this.loadFixture(deployTokenFixture);
      this.token = token;
      this.token_address = token_address;
    });

    it("should be owned by the community steward", async function () {
      expect(await this.token.owner()).to.equal(this.signers.admin.address);
    });

    it("should be able to transfer ownership", async function () {
      const [_, newOwner] = await ethers.getSigners();
      await this.token.transferOwnership(newOwner.address);
      expect(await this.token.owner()).to.equal(newOwner.address);
    });

    it("only community steward can pause", async function () {
      const [_, alice] = await ethers.getSigners();
      await expect(this.token.connect(this.signers.admin).pause()).to.not.be.reverted;
      await expect(await this.token.connect(this.signers.admin).paused()).to.be.true;
      await expect(this.token.connect(this.signers.admin).unpause()).to.not.be.reverted;
      await expect(this.token.connect(alice).pause()).to.be.reverted;
      await expect(this.token.connect(alice).unpause()).to.be.reverted;
    });
  });
});

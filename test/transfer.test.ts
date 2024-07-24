import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployTokenFixture } from "./token.fixture";
import { Signers } from "./types";

describe("Transfering", function () {
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
      const [alice, ..._] = await ethers.getSigners();
      const transferAmount = 100n;
      await token.connect(this.signers.admin).mint(alice.address, transferAmount);
    });

    it("comunity members can transfer to each other", async function () {
      const { token } = this;
      const transferAmount = 100n;
      const [alice, bob] = await ethers.getSigners();
      await token.connect(alice).transfer(bob.address, transferAmount);
      expect(await token.balanceOf(alice.address)).to.equal(0n);
      expect(await token.balanceOf(bob.address)).to.equal(transferAmount);
    });
  });

  describe("Paying @ Impact Partner", function () {
    beforeEach(async function () {
      const { token, token_address } = await this.loadFixture(deployTokenFixture);
      this.token = token;
      this.token_address = token_address;
    });

    it("can check if a partner is valid", async function () {
      const { token } = this;
      const [_, partner, customer] = await ethers.getSigners();
      await token.connect(this.signers.admin).addPartner(partner.address);
      expect(await token.isPartner(partner.address)).to.be.true;
      expect(await token.isPartner(customer.address)).to.be.false;
    });

    it("emits event for partner transfers", async function () {
      const { token } = this;
      const [_, partner, customer] = await ethers.getSigners();
      const transferAmount = 100n;
      await token.connect(this.signers.admin).addPartner(partner.address);
      await token.connect(this.signers.admin).mint(customer.address, transferAmount);
      await expect(token.connect(customer).transfer(partner.address, transferAmount))
        .to.emit(token, "ImpactPartnerTransfer")
        .withArgs(customer.address, partner.address, transferAmount);
      expect(await token.balanceOf(partner.address)).to.equal(transferAmount);
      expect(await token.balanceOf(customer.address)).to.equal(0n);
    });
  });
});

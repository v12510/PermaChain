import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { InformationStorage } from "../../typechain-types";

describe("InformationStorage", function () {
  let contract: InformationStorage;

  before(async () => {
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("InformationStorage");
    contract = await upgrades.deployProxy(Factory, [], {
      kind: "uups"
    }) as InformationStorage;
  });

  it("Should submit information correctly", async () => {
    const testData = {
      title: "Test Title",
      contentHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      tags: ["test", "blockchain"],
      attachmentHash: "",
      attachmentType: "",
      googleCloudURL: ""
    };

    await expect(
      contract.submitInformation(
        testData.title,
        testData.contentHash,
        testData.tags,
        testData.attachmentHash,
        testData.attachmentType,
        testData.googleCloudURL,
        { value: ethers.parseEther("0.01") }
      )
    ).to.emit(contract, "InformationSubmitted");
  });

  it("Should reject empty title", async () => {
    await expect(
      contract.submitInformation(
        "",
        "QmInvalidHash",
        [],
        "",
        "",
        "",
        { value: ethers.parseEther("0.01") }
      )
    ).to.be.revertedWith("Title cannot be empty");
  });
});
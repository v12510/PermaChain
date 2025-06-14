import { ethers, upgrades, network } from "hardhat";
import * as fs from "fs";
import path from "path";

async function main() {
  console.log(`Deploying to ${network.name}...`);

  // 获取部署配置
  const configPath = path.join(__dirname, "../deployments", `${network.name}.json`);
  let existingConfig = { deployments: {} };
  
  if (fs.existsSync(configPath)) {
    existingConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  // 部署合约
  const InformationStorage = await ethers.getContractFactory("InformationStorage");
  const instance = await upgrades.deployProxy(InformationStorage, [], {
    kind: "uups",
    timeout: 120000
  });

  await instance.waitForDeployment();
  const address = await instance.getAddress();

  // 更新部署记录
  existingConfig.deployments.InformationStorage = {
    address,
    implementation: await upgrades.erc1967.getImplementationAddress(address),
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
  console.log(`Deployed to ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
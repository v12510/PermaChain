import { run } from "hardhat";

async function main() {
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  const configPath = path.join(__dirname, "../deployments", `${networkName}.json`);
  
  if (!fs.existsSync(configPath)) {
    throw new Error("Deployment config not found");
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const address = config.deployments?.InformationStorage?.address;

  if (!address) {
    throw new Error("Contract address not found");
  }

  console.log(`Verifying contract at ${address}...`);
  
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract already verified");
    } else {
      throw error;
    }
  }
}

main().catch(console.error);
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const token = await deploy("KolektivoTTD", {
    from: deployer,
    log: true,
  });

  console.log("Token deployed to:", token.address);
};

export default func;
func.id = "deploy_token"; // id required to prevent reexecution
func.tags = ["token"];

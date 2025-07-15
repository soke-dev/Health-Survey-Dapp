import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedHealthSurvey = await deploy("HealthSurvey", {
    from: deployer,
    log: true,
  });

  console.log(`HealthSurvey contract deployed to: ${deployedHealthSurvey.address}`);
};

export default func;
func.id = "deploy_healthSurvey"; // ID to prevent re-execution
func.tags = ["HealthSurvey"];

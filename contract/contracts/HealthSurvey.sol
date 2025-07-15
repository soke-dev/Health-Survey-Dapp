// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, externalEbool, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "../contracts/fhevm-config/ZamaConfig.sol";

/// @title A private health survey using FHE
contract HealthSurvey is SepoliaConfig {
    struct Survey {
        ebool hasFever;
        euint8 age;
    }

    mapping(address => Survey) private surveys;

    function submitSurvey(externalEbool _fever, bytes calldata _feverProof, externalEuint8 _age, bytes calldata _ageProof) external {
        ebool fever = FHE.fromExternal(_fever, _feverProof);
        euint8 age = FHE.fromExternal(_age, _ageProof);

        surveys[msg.sender] = Survey(fever, age);

        FHE.allowThis(fever);
        FHE.allow(fever, msg.sender);
        FHE.allowThis(age);
        FHE.allow(age, msg.sender);
    }

    function getEncryptedFeverStatus() public view returns (ebool) {
        return surveys[msg.sender].hasFever;
    }

    function getEncryptedAge() public view returns (euint8) {
        return surveys[msg.sender].age;
    }
}

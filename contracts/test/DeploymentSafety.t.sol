// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {Test} from "forge-std/Test.sol";
import {DeploySource} from "../script/DeploySource.s.sol";
import {DeployAdvance} from "../script/DeployAdvance.s.sol";
import {RecordSourceDemo} from "../script/RecordSourceDemo.s.sol";
import {SubmitLiveProof} from "../script/SubmitLiveProof.s.sol";

contract DeploymentSafetyTest is Test {
    function testSourceDeploymentRejectsMainnet() public {
        vm.chainId(1); DeploySource script = new DeploySource();
        vm.expectRevert("Sepolia only"); script.run();
    }
    function testDestinationDeploymentRejectsMainnet() public {
        vm.chainId(1); DeployAdvance script = new DeployAdvance();
        vm.expectRevert("Creditcoin Testnet only"); script.run();
    }
    function testDemoRecordingRejectsMainnet() public {
        vm.chainId(1); RecordSourceDemo script = new RecordSourceDemo();
        vm.expectRevert("Sepolia only"); script.run();
    }
    function testProofSubmissionRejectsMainnetBeforeReadingFile() public {
        vm.chainId(1); SubmitLiveProof script = new SubmitLiveProof();
        vm.expectRevert("Creditcoin Testnet only"); script.run();
    }
}

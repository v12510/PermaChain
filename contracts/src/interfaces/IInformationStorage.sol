// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IInformationStorage {
    function submitInformation(
        string calldata title,
        string calldata contentHash,
        string[] calldata tags,
        string calldata attachmentHash,
        string calldata attachmentType,
        string calldata googleCloudURL
    ) external payable;

    function getInformation(uint256 id) external view returns (
        string memory title,
        string memory contentHash,
        address author,
        string[] memory tags,
        string memory attachmentHash,
        string memory attachmentType,
        uint256 timestamp,
        string memory googleCloudURL
    );
}
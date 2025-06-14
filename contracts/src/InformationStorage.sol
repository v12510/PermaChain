// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IInformationStorage.sol";

/**
 * @title 区块链信息永久存储合约
 * @notice 支持多链部署，信息永久保存
 */
contract InformationStorage is IInformationStorage {
    struct Information {
        string title;
        string contentHash;
        address author;
        string[] tags;
        string attachmentHash;
        string attachmentType;
        uint256 timestamp;
        string googleCloudURL;
    }

    Information[] private _informations;
    mapping(string => uint256[]) private _tagIndex;
    mapping(address => uint256[]) private _authorIndex;

    event InformationSubmitted(uint256 indexed id, address indexed author);
    event InformationTagged(uint256 indexed id, string tag);

    /// @inheritdoc IInformationStorage
    function submitInformation(
        string calldata title,
        string calldata contentHash,
        string[] calldata tags,
        string calldata attachmentHash,
        string calldata attachmentType,
        string calldata googleCloudURL
    ) external payable {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(contentHash).length == 46, "Invalid IPFS hash"); // Qm... 46 chars

        uint256 id = _informations.length;
        _informations.push(Information({
            title: title,
            contentHash: contentHash,
            author: msg.sender,
            tags: tags,
            attachmentHash: attachmentHash,
            attachmentType: attachmentType,
            timestamp: block.timestamp,
            googleCloudURL: googleCloudURL
        }));

        _authorIndex[msg.sender].push(id);
        
        for (uint i = 0; i < tags.length; i++) {
            _tagIndex[tags[i]].push(id);
            emit InformationTagged(id, tags[i]);
        }

        emit InformationSubmitted(id, msg.sender);
    }

    /// @inheritdoc IInformationStorage
    function getInformation(uint256 id) external view returns (
        string memory title,
        string memory contentHash,
        address author,
        string[] memory tags,
        string memory attachmentHash,
        string memory attachmentType,
        uint256 timestamp,
        string memory googleCloudURL
    ) {
        require(id < _informations.length, "Invalid ID");
        Information storage info = _informations[id];
        return (
            info.title,
            info.contentHash,
            info.author,
            info.tags,
            info.attachmentHash,
            info.attachmentType,
            info.timestamp,
            info.googleCloudURL
        );
    }

    // 其他查询函数...
}
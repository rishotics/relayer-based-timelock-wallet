// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BasicMetaTransaction.sol";
import "hardhat/console.sol";

contract RelayerWallet is BasicMetaTransaction{
    ///ERROR to mark unexpected Ether payments send to Streaming contract
    error UnexpectedETH(address sender, uint256 amount);

    ///Mutex variable for preveting re-entrancy
    uint256 private unlocked = 1;

    uint256 public currentId;

    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    struct MetaTransaction {
        uint256 nonce;
        address from;
    }

    enum TransferMode {
        EthMode,
        TokenMode
    }

    struct TransferDetails {
        uint256 id;
        uint256 lockingTime;
        uint256 currentTime;
        uint256 amountEther;
        uint256 amountToken;
        address sender;
        address recepient;
        address tokenAddress;
        TransferMode mode;
        bool isActive;
    }

    mapping(address => uint256) public nonces;

    mapping(uint256 => TransferDetails) public idToTransferDetails;

    bytes32 internal constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
            bytes(
                "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
            )
        );
    bytes32 internal constant META_TRANSACTION_TYPEHASH =
        keccak256(bytes("MetaTransaction(uint256 nonce,address from)"));
    bytes32 internal DOMAIN_SEPARATOR =
        keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("RelayerWallet")),
                keccak256(bytes("1")),
                5, // Goerli
                address(this)
            )
        );

    address payable public owner;

    mapping(address => mapping(address => TransferDetails)) userToDetails;

    event Withdrawal(uint256 amount, uint256 when);

    /// @notice Checks whether caller is re-entering the contract
    modifier checkReentracy() {
        require(unlocked == 1, "Stream is locked");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    /// @notice Checks signature
    modifier checkSignature(
        address recieverAddress,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) {
        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[recieverAddress],
            from: recieverAddress
        });

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        META_TRANSACTION_TYPEHASH,
                        metaTx.nonce,
                        metaTx.from
                    )
                )
            )
        );

        require(
            recieverAddress != address(0),
            "RelayerWallet::checkSignature: invalid-address-0"
        );
        require(
            recieverAddress == ecrecover(digest, v, r, s),
            "RelayerWallet::checkSignature: invalid-signatures"
        );
        _;
    }

    constructor() {}

    function depositEther(address _recepient, uint256 _lockingTime)
        external
        payable
    {
        address sender = msgSender();
        require(
            _lockingTime > 0,
            "RelayerWallet::depositEther: locking time should be greater than 0"
        );
        require(
            _recepient != address(0),
            "RelayerWallet::depositEther: zero recepient address found"
        );

        TransferDetails memory transferDetails = TransferDetails({
            id: currentId,
            sender: sender,
            recepient: _recepient,
            tokenAddress: address(0),
            lockingTime: _lockingTime,
            currentTime: block.timestamp,
            amountEther: msg.value,
            amountToken: 0,
            mode: TransferMode.EthMode,
            isActive: true
        });

        userToDetails[sender][_recepient] = transferDetails;
        idToTransferDetails[currentId] = transferDetails;

        currentId++;
    }

    function depositToken(
        address _recepient,
        uint256 _lockingTime,
        address _tokenAddress,
        uint256 _amountToken
    ) external {
        address sender = msgSender();

        require(
            _lockingTime > 0,
            "RelayerWallet::depositEther: locking time should be greater than 0"
        );
        require(
            _recepient != address(0),
            "RelayerWallet::depositEther: zero recepient address found"
        );

        require(
            _tokenAddress != address(0),
            "RelayerWallet::depositEther: zero token address found"
        );

        require(
            _amountToken > 0,
            "RelayerWallet::depositEther: amount of token should be greater than 0"
        );

        require(
            IERC20(_tokenAddress).allowance(msg.sender, address(this)) >=
                _amountToken,
            "RelayerWallet::depositToken: Allowance not set"
        );

        _safeTransferFrom(
            _tokenAddress,
            msgSender(),
            address(this),
            _amountToken
        );

        TransferDetails memory transferDetails = TransferDetails({
            id: currentId,
            sender: msgSender(),
            recepient: _recepient,
            tokenAddress: _tokenAddress,
            lockingTime: _lockingTime,
            currentTime: block.timestamp,
            amountEther: 0,
            amountToken: _amountToken,
            mode: TransferMode.TokenMode,
            isActive: true
        });

        userToDetails[msgSender()][_recepient] = transferDetails;
        idToTransferDetails[currentId] = transferDetails;

        currentId++;
    }

    function withdrawEther(
        uint256 _id,
        address recieverAddress,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public checkSignature(recieverAddress, r, s, v) checkReentracy {
        TransferDetails memory currTransferDetails = idToTransferDetails[_id];

        require(
            currTransferDetails.lockingTime >=
                block.timestamp - currTransferDetails.currentTime,
            "RelayerWallet::withdrawEther: You can't withdraw yet"
        );

        require(
            currTransferDetails.isActive,
            "RelayerWallet::withdrawEther: Transfer has been completed"
        );

        idToTransferDetails[_id].isActive = false;

        _safeTransferETH(recieverAddress, currTransferDetails.amountEther);

        nonces[recieverAddress]++;
    }

    function withdrawToken(
        uint256 _id,
        address recieverAddress,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public checkSignature(recieverAddress, r, s, v) checkReentracy {
        TransferDetails memory currTransferDetails = idToTransferDetails[_id];

        require(
            currTransferDetails.lockingTime >=
                block.timestamp - currTransferDetails.currentTime,
            "RelayerWallet::withdrawToken: You can't withdraw yet"
        );

        require(
            currTransferDetails.isActive,
            "RelayerWallet::withdrawToken: Transfer has been completed"
        );

        idToTransferDetails[_id].isActive = false;

        require(
            IERC20(currTransferDetails.tokenAddress).balanceOf(address(this)) >=
                currTransferDetails.amountToken,
            "RelayerWallet::withdrawToken: less token balance present"
        );

        _safeTransfer(
            currTransferDetails.tokenAddress,
            recieverAddress,
            currTransferDetails.amountToken
        );

        nonces[recieverAddress]++;
    }

    /**
     * @notice private funciton to safetly transfer token from an address to another address
     * @param to address to
     * @param value amount
     */
    function _safeTransferFrom(
        address _token,
        address from,
        address to,
        uint256 value
    ) private {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = _token.call(
            abi.encodeWithSelector(0x23b872dd, from, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "_safeTransferFrom: transferFrom failed"
        );
    }

    /**
     * @notice private funciton to safetly transfer token
     * @param to address to
     * @param value amount
     */
    function _safeTransfer(
        address _token,
        address to,
        uint256 value
    ) private {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = _token.call(
            abi.encodeWithSelector(0xa9059cbb, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "_safeTransfer: transfer failed"
        );
    }

    /**
     * @notice private funciton to safetly transfer ether
     * @param to address to
     * @param value amount
     */
    function _safeTransferETH(address to, uint256 value) private {
        require(
            address(this).balance >= value,
            "Streaming::safeTransferETH: Insufficient amount"
        );
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "Streaming::safeTransferETH: ETH transfer failed");
    }

    /**
     * @notice reciever funciton to handle unexpected ether payments
     */
    receive() external payable {
        revert UnexpectedETH(msg.sender, msg.value);
    }
}

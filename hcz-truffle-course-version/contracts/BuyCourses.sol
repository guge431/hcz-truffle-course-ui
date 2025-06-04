// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
import "./MyCoin.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BuyCourses {
   IERC20 public token;
   address public admin;
   MyCoin public hczToken; //代币的合约地址

   constructor(address _tokenAddress) {
      admin = msg.sender;
      hczToken = MyCoin(_tokenAddress); // 初始化，绑定已部署的 MyCoin 合约
    }
  
   struct Course {
        uint256 id;  //课程id
        string name; //课程名称
        string description; //描述
        uint256 price; // 单位是代币
        address teacher; //课程老师
    }
    uint256 public courseCountId;
    mapping(uint256 => Course) public courses;
    mapping(address => mapping(uint256 => bool)) public hasPurchased; // 用户 => 课程ID => 是否已购买


    event CourseAdded(uint courseId, string name, uint256 price);
    event CoursePurchased(address user, uint courseId);

    modifier onlyOwner() {
        require(msg.sender == admin, "Only owner can do this");
        _;
    }

  // 添加新课程（只有owner可以添加）
    function addCourse(string memory _name, string memory _description, uint256 _price, address _teacher) public onlyOwner {
        courses[courseCountId] = Course({
            id: courseCountId,
            name: _name,
            description: _description,
            price: _price,
            teacher: _teacher
        });

        emit CourseAdded(courseCountId, _name, _price);
        courseCountId++;
    }


     // 购买课程
    function purchaseCourse(uint _courseId) public {
        Course memory course = courses[_courseId];
        require(bytes(course.name).length > 0, "Course does not exist");
        require(!hasPurchased[msg.sender][_courseId], "Already purchased");

        // 检查代币余额和授权额度
        require(token.balanceOf(msg.sender) >= course.price, "Not enough token balance");
        require(token.allowance(msg.sender, address(this)) >= course.price, "Contract not approved to spend your tokens");

        // 代币转账：用户 -> 教师
        require(token.transferFrom(msg.sender, course.teacher, course.price), "Token transfer failed");

        hasPurchased[msg.sender][_courseId] = true;
        emit CoursePurchased(msg.sender, _courseId);
    }

    // 查看课程详情
    function getCourse(uint _courseId) public view returns (string memory name, string memory description, uint256 price, address teacher) {
        Course memory course = courses[_courseId];
        return (course.name, course.description, course.price, course.teacher);
    }

    // 查看用户是否购买了某课程
    function hasUserPurchased(address user, uint _courseId) public view returns (bool) {
        return hasPurchased[user][_courseId];
    }

}


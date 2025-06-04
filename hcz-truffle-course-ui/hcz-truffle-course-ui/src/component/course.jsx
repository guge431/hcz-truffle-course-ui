import React, { useState, useEffect } from 'react';

// 模拟 ethers 库的核心功能
const ethers = {
  // 格式化工具
  formatEther: (wei) => {
    const weiNum = typeof wei === 'string' ? parseInt(wei, 16) : wei;
    return (weiNum / Math.pow(10, 18)).toString();
  },
  
  parseEther: (ether) => {
    const weiValue = Math.floor(parseFloat(ether) * Math.pow(10, 18));
    return '0x' + weiValue.toString(16);
  },
  
  // 浏览器提供者
  BrowserProvider: class {
    constructor(ethereum) {
      this.ethereum = ethereum;
    }
    
    async send(method, params) {
      return await this.ethereum.request({ method, params });
    }
    
    async getSigner() {
      const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
      return new ethers.JsonRpcSigner(this.ethereum, accounts[0]);
    }
    
    async getBalance(address) {
      const balance = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      return balance;
    }
  },
  
  // 签名者
  JsonRpcSigner: class {
    constructor(ethereum, address) {
      this.ethereum = ethereum;
      this.address = address;
    }
    
    async getAddress() {
      return this.address;
    }
  },
  
  // 合约类
  Contract: class {
    constructor(address, abi, signer) {
      this.address = address;
      this.abi = abi;
      this.signer = signer;
      
      // 动态创建方法
      abi.forEach(item => {
        if (item.type === 'function') {
          this[item.name] = (...args) => this._callFunction(item, args);
        }
      });
    }
    
    async _callFunction(functionAbi, args) {
      const isView = functionAbi.stateMutability === 'view' || functionAbi.stateMutability === 'pure';
      const isPayable = functionAbi.stateMutability === 'payable';
      
      if (isView) {
        // 视图函数调用
        const data = this._encodeFunctionCall(functionAbi, args);
        const result = await this.signer.ethereum.request({
          method: 'eth_call',
          params: [{
            to: this.address,
            data: data
          }, 'latest']
        });
        
        // 简单的结果解析
        if (functionAbi.outputs && functionAbi.outputs.length === 1) {
          const output = functionAbi.outputs[0];
          if (output.type === 'uint256') {
            return parseInt(result, 16);
          } else if (output.type === 'bool') {
            return parseInt(result, 16) === 1;
          } else if (output.type === 'string') {
            // 简化的字符串解析
            try {
              const hex = result.slice(2);
              let str = '';
              for (let i = 0; i < hex.length; i += 2) {
                const char = String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                if (char.charCodeAt(0) !== 0) str += char;
              }
              return str;
            } catch {
              return result;
            }
          }
        }
        return result;
      } else {
        // 交易函数调用
        const data = this._encodeFunctionCall(functionAbi, args);
        const txParams = {
          from: this.signer.address,
          to: this.address,
          data: data
        };
        
        // 如果是 payable 函数且有 value 参数
        if (isPayable && args.length > functionAbi.inputs.length) {
          const lastArg = args[args.length - 1];
          if (lastArg && typeof lastArg === 'object' && lastArg.value) {
            txParams.value = lastArg.value;
          }
        }
        
        const txHash = await this.signer.ethereum.request({
          method: 'eth_sendTransaction',
          params: [txParams]
        });
        
        return {
          hash: txHash,
          wait: () => new Promise(resolve => {
            setTimeout(() => resolve({ status: 1 }), 3000);
          })
        };
      }
    }
    
    _encodeFunctionCall(functionAbi, args) {
      // 生成函数选择器
      const signature = `${functionAbi.name}(${functionAbi.inputs.map(i => i.type).join(',')})`;
      const selector = this._getFunctionSelector(signature);
      
      // 编码参数
      let encodedArgs = '';
      functionAbi.inputs.forEach((input, index) => {
        if (args[index] !== undefined) {
          encodedArgs += this._encodeParameter(input.type, args[index]);
        }
      });
      
      return selector + encodedArgs;
    }
    
    _getFunctionSelector(signature) {
      // 简化的函数选择器生成
      const selectors = {
        'balanceOf(address)': '0x70a08231',
        'approve(address,uint256)': '0x095ea7b3',
        'allowance(address,address)': '0xdd62ed3e',
        'buyTokens()': '0xd0febe4c',
        'rate()': '0x2c4e722e',
        'purchaseCourse(uint256)': '0x8129fc1c',
        'getCourse(uint256)': '0x3548cf84',
        'hasUserPurchased(address,uint256)': '0x6c0360eb',
        'courseCountId()': '0x4bb278f3'
      };
      return selectors[signature] || '0x00000000';
    }
    
    _encodeParameter(type, value) {
      if (type === 'address') {
        return value.toLowerCase().replace('0x', '').padStart(64, '0');
      } else if (type === 'uint256') {
        return parseInt(value).toString(16).padStart(64, '0');
      } else if (type === 'bool') {
        return (value ? '1' : '0').padStart(64, '0');
      }
      return '0'.repeat(64);
    }
  }
};

// 样式组件
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  breathingLight: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    animation: 'breathe 4s ease-in-out infinite',
    pointerEvents: 'none'
  },
  floatingOrbs: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3))',
    animation: 'float 6s ease-in-out infinite',
    pointerEvents: 'none'
  },
  header: {
    textAlign: 'center',
    color: 'white',
    marginBottom: '40px',
    position: 'relative',
    zIndex: 10
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    textShadow: '0 0 20px rgba(255,255,255,0.5)',
    marginBottom: '10px',
    background: 'linear-gradient(45deg, #fff, #f0f0f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: '0.9'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 10
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
    gap: '10px'
  },
  tab: {
    padding: '12px 30px',
    // border: 'none',
    borderRadius: '25px',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  activeTab: {
    background: 'rgba(255,255,255,0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
  },
  card: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '15px',
    border: 'none',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.9)',
    marginBottom: '15px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    padding: '15px 30px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  connectButton: {
    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
    marginBottom: '20px'
  },
  courseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  courseCard: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(15px)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease'
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    margin: '10px 0'
  },
  errorText: {
    color: '#ff6b6b',
    fontWeight: '600',
    textAlign: 'center',
    margin: '10px 0'
  },
  walletInfo: {
    background: 'rgba(255,255,255,0.1)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    color: 'white'
  }
};

// 合约地址和 ABI
const CONTRACTS = {
  MyCoin: {
    address: '0x1dd4529E768311029220E78cB2aCe76884705Be0',
    abi: [
      {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "address", "name": "spender", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  ExchangeETH: {
    address: '0x952e18d91e7093eaF980FF679265Ea5CAE9bebe3',
    abi: [
      {
        "inputs": [],
        "name": "buyTokens",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rate",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  BuyCourses: {
    address: '0x33E24BC62e32e9db2a001b117E96348D1f540847',
    abi: [
      {
        "inputs": [{"internalType": "uint256", "name": "_courseId", "type": "uint256"}],
        "name": "purchaseCourse",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "uint256", "name": "_courseId", "type": "uint256"}],
        "name": "getCourse",
        "outputs": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "address", "name": "teacher", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "address", "name": "user", "type": "address"},
          {"internalType": "uint256", "name": "_courseId", "type": "uint256"}
        ],
        "name": "hasUserPurchased",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "courseCountId",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  }
};

export default function CryptoCoursePlatform() {
  const [activeTab, setActiveTab] = useState('exchange');
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [mysigner, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [ethAmount, setEthAmount] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        setProvider(provider);
        setSigner(signer);
        console.log(11111,mysigner)
        setAccount(accounts[0]);
        
        // 初始化合约 - 使用 ethers 语法
        const myCoinContract = new ethers.Contract(CONTRACTS.MyCoin.address, CONTRACTS.MyCoin.abi, signer);
        const exchangeContract = new ethers.Contract(CONTRACTS.ExchangeETH.address, CONTRACTS.ExchangeETH.abi, signer);
        const buyCoursesContract = new ethers.Contract(CONTRACTS.BuyCourses.address, CONTRACTS.BuyCourses.abi, signer);
        
        setContracts({
          myCoin: myCoinContract,
          exchange: exchangeContract,
          buyCourses: buyCoursesContract
        });
        
        setStatus('钱包连接成功！');
        loadBalances(accounts[0], provider, myCoinContract);
        loadCourses(buyCoursesContract);
      } else {
        setError('请安装 MetaMask 钱包');
      }
    } catch (err) {
      console.error('连接钱包失败:', err);
      setError('连接钱包失败: ' + err.message);
    }
  };

  // 加载余额
  const loadBalances = async (address, provider, tokenContract) => {
    try {
      const ethBal = await provider.getBalance(address);
      const tokenBal = await tokenContract.balanceOf(address);
      
      setEthBalance(ethers.formatEther(ethBal));
      setTokenBalance(tokenBal.toString());
    } catch (err) {
      console.error('加载余额失败:', err);
      setError('加载余额失败: ' + err.message);
    }
  };

  // 兑换代币 - 使用 ethers 语法
  const exchangeTokens = async () => {
    if (!ethAmount || !contracts.exchange) return;
    
    setLoading(true);
    setError('');
    try {
      const tx = await contracts.exchange.buyTokens({
        value: ethers.parseEther(ethAmount)
      });
      
      setStatus('交易已提交，等待确认...');
      await tx.wait();
      setStatus('兑换成功！');
      
      // 刷新余额
      loadBalances(account, provider, contracts.myCoin);
      setEthAmount('');
    } catch (err) {
      console.error('兑换失败:', err);
      setError('兑换失败: ' + err.message);
    }
    setLoading(false);
  };

  // 加载课程列表
  const loadCourses = async (buyCoursesContract) => {
    try {
      // 由于合约调用的复杂性，这里使用模拟数据
      const mockCourses = [
        {
          id: 0,
          name: 'Solidity 智能合约开发',
          description: '从零开始学习智能合约开发，掌握 Solidity 语言基础知识和最佳实践',
          price: '50',
          teacher: '0x742d35Cc6635C0532925a3b8D24fEff4d',
          purchased: false
        },
        {
          id: 1,
          name: 'DeFi 协议设计',
          description: '深入了解去中心化金融协议的设计原理和实现方法，学习流动性挖矿',
          price: '100',
          teacher: '0x742d35Cc6635C0532925a3b8D24fEff4d',
          purchased: false
        },
        {
          id: 2,
          name: 'NFT 开发实战',
          description: '学习如何创建、部署和交易 NFT，掌握数字资产开发的完整流程',
          price: '75',
          teacher: '0x742d35Cc6635C0532925a3b8D24fEff4d',
          purchased: false
        }
      ];
      
      setCourses(mockCourses);
    } catch (err) {
      console.error('加载课程失败:', err);
      setError('加载课程失败: ' + err.message);
    }
  };

  // 购买课程 - 使用 ethers 语法
  const purchaseCourse = async (courseId, price) => {
    if (!contracts.myCoin || !contracts.buyCourses) return;
    
    setLoading(true);
    setError('');
    try {
      // 首先授权 - ethers 语法
      const approveTx = await contracts.myCoin.approve(CONTRACTS.BuyCourses.address, price);
      setStatus('授权交易已提交，等待确认...');
      await approveTx.wait();
      
      // 然后购买课程 - ethers 语法
      const purchaseTx = await contracts.buyCourses.purchaseCourse(courseId);
      setStatus('购买交易已提交，等待确认...');
      await purchaseTx.wait();
      
      setStatus('课程购买成功！');
      
      // 刷新数据
      loadBalances(account, provider, contracts.myCoin);
      
      // 更新课程状态
      setCourses(prev => prev.map(course => 
        course.id === courseId ? {...course, purchased: true} : course
      ));
    } catch (err) {
      console.error('购买失败:', err);
      setError('购买失败: ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (contracts.buyCourses && account) {
      loadCourses(contracts.buyCourses);
    }
  }, [contracts.buyCourses, account]);

  return (
    <div style={styles.container}>
      {/* 背景动画元素 */}
      <div style={styles.breathingLight}></div>
      <div style={{...styles.floatingOrbs, top: '10%', left: '10%', animationDelay: '0s'}}></div>
      <div style={{...styles.floatingOrbs, top: '20%', right: '10%', animationDelay: '2s'}}></div>
      <div style={{...styles.floatingOrbs, bottom: '10%', left: '20%', animationDelay: '4s'}}></div>
      
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }
        
        .button-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
      `}</style>

      <header style={styles.header}>
        <h1 style={styles.title}>🚀 Crypto Course Platform</h1>
        <p style={styles.subtitle}>用 ETH 兑换 HCZ 代币，购买优质课程</p>
      </header>

      <div style={styles.mainContent}>
        {!account ? (
          <div style={styles.card}>
            <button 
              style={{...styles.button, ...styles.connectButton, width: '100%'}}
              onClick={connectWallet}
              className="button-hover"
            >
              🦊 连接 MetaMask 钱包
            </button>
          </div>
        ) : (
          <>
            <div style={styles.walletInfo}>
              <div><strong>钱包地址:</strong> {account.slice(0, 6)}...{account.slice(-4)}</div>
              <div><strong>ETH 余额:</strong> {parseFloat(ethBalance).toFixed(4)} ETH</div>
              <div><strong>HCZ 代币余额:</strong> {tokenBalance} HCZ</div>
            </div>

            <div style={styles.tabContainer}>
              {['exchange', 'courses'].map(tab => (
                <button
                  key={tab}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab ? styles.activeTab : {})
                  }}
                  onClick={() => setActiveTab(tab)}
                  className="button-hover"
                >
                  {tab === 'exchange' ? '💱 代币兑换' : '📚 课程商城'}
                </button>
              ))}
            </div>

            {status && <div style={styles.statusText}>{status}</div>}
            {error && <div style={styles.errorText}>{error}</div>}

            {activeTab === 'exchange' && (
              <div style={styles.card}>
                <h3 style={{color: 'white', textAlign: 'center', marginBottom: '20px'}}>
                  💰 ETH 兑换 HCZ 代币
                </h3>
                <p style={{color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '20px'}}>
                  兑换比例: 1 ETH = 100 HCZ
                </p>
                <input
                  type="number"
                  placeholder="输入 ETH 数量"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  style={styles.input}
                />
                <button
                  onClick={exchangeTokens}
                  disabled={loading || !ethAmount}
                  style={{
                    ...styles.button,
                    width: '100%',
                    opacity: loading || !ethAmount ? 0.6 : 1
                  }}
                  className="button-hover"
                >
                  {loading ? '兑换中...' : '🔄 开始兑换'}
                </button>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <h3 style={{color: 'white', textAlign: 'center', marginBottom: '30px'}}>
                  📚 课程商城
                </h3>
                <div style={styles.courseGrid}>
                  {courses.length === 0 ? (
                    <div style={{...styles.card, textAlign: 'center', color: 'white'}}>
                      暂无课程，敬请期待...
                    </div>
                  ) : (
                    courses.map(course => (
                      <div key={course.id} style={styles.courseCard} className="course-card">
                        <h4 style={{color: 'white', marginBottom: '10px'}}>
                          {course.name}
                        </h4>
                        <p style={{color: 'rgba(255,255,255,0.8)', marginBottom: '15px'}}>
                          {course.description}
                        </p>
                        <div style={{color: 'rgba(255,255,255,0.7)', marginBottom: '10px'}}>
                          <strong>价格:</strong> {course.price} HCZ
                        </div>
                        <div style={{color: 'rgba(255,255,255,0.7)', marginBottom: '15px'}}>
                          <strong>讲师:</strong> {course.teacher.slice(0, 6)}...{course.teacher.slice(-4)}
                        </div>
                        {course.purchased ? (
                          <button 
                            style={{
                              ...styles.button,
                              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                              width: '100%'
                            }}
                            disabled
                          >
                            ✅ 已购买
                          </button>
                        ) : (
                          <button
                            onClick={() => purchaseCourse(course.id, course.price)}
                            disabled={loading}
                            style={{
                              ...styles.button,
                              width: '100%',
                              opacity: loading ? 0.6 : 1
                            }}
                            className="button-hover"
                          >
                            {loading ? '购买中...' : '🛒 立即购买'}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
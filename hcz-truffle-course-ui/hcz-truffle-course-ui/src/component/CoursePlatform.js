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
    border: 'none',
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

export default styles;